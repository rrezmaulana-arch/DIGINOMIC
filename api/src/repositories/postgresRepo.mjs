import { generateRegistrationCode } from '../utils/crypto.mjs';

/**
 * PostgreSQL 16 Repository menggunakan parameterized queries ($1, $2, ...) untuk mencegah SQL Injection.
 * Aktif otomatis ketika DATABASE_URL diset (mis. di dalam Docker Compose produksi).
 */
export async function createPostgresRepo(databaseUrl) {
  const { Pool } = await import('pg');
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 10, // Sesuai PRD Bagian 9.9 untuk VPS 2 GB
    idleTimeoutMillis: 30_000,
  });

  const ALLOWED_COLUMNS = {
    users: new Set(['name', 'password_hash', 'role', 'status', 'division', 'privacy_accepted_at', 'reset_token_hash', 'reset_token_expires_at', 'last_login_at']),
    competitions: new Set(['name', 'fee', 'is_team', 'max_team_size', 'max_quota', 'reg_open_at', 'reg_close_at', 'submission_deadline', 'group_url', 'guidebook_url', 'is_active']),
    registrations: new Set(['team_name', 'status', 'payment_proof_path', 'reject_reason', 'verified_by', 'verified_at']),
    announcements: new Set(['title', 'body', 'published_at', 'competition_id']),
    email_outbox: new Set(['status', 'attempts', 'send_after', 'sent_at']),
  };

  function safeKeys(table, patch) {
    const allowed = ALLOWED_COLUMNS[table];
    return Object.keys(patch).filter((k) => allowed.has(k));
  }

  async function hydrateRegistration(id) {
    const regRes = await pool.query('SELECT * FROM registrations WHERE id = $1', [id]);
    const r = regRes.rows[0];
    if (!r) return null;

    const [compRes, userRes, profRes, memRes, logRes, subRes] = await Promise.all([
      pool.query('SELECT * FROM competitions WHERE id = $1', [r.competition_id]),
      pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [r.user_id]),
      pool.query('SELECT * FROM participant_profiles WHERE user_id = $1', [r.user_id]),
      pool.query('SELECT * FROM team_members WHERE registration_id = $1', [r.id]),
      pool.query('SELECT * FROM status_logs WHERE registration_id = $1 ORDER BY created_at ASC', [r.id]),
      pool.query('SELECT * FROM submissions WHERE registration_id = $1 ORDER BY version DESC', [r.id]),
    ]);

    return {
      ...r,
      competition: compRes.rows[0] || null,
      user: userRes.rows[0] || null,
      profile: profRes.rows[0] || null,
      team_members: memRes.rows,
      status_logs: logRes.rows,
      submissions: subRes.rows,
    };
  }

  return {
    type: 'postgres',
    pool,

    async ping() {
      await pool.query('SELECT 1');
      return true;
    },

    async close() {
      await pool.end();
    },

    async findUserByEmail(email) {
      const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
      return rows[0] || null;
    },

    async findUserById(id) {
      const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return rows[0] || null;
    },

    async createUser({ email, password_hash, name, role = 'PESERTA', status = 'ACTIVE', division = null, privacy_accepted_at = null }) {
      const { rows } = await pool.query(
        `INSERT INTO users (email, password_hash, name, role, status, division, privacy_accepted_at, last_login_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *`,
        [email.toLowerCase(), password_hash, name, role, status, division, privacy_accepted_at]
      );
      return rows[0];
    },

    async updateUser(id, patch) {
      const keys = safeKeys('users', patch);
      if (keys.length === 0) return this.findUserById(id);
      const sets = keys.map((k, i) => `${k} = $${i + 2}`);
      const values = keys.map((k) => patch[k]);
      const { rows } = await pool.query(`UPDATE users SET ${sets.join(', ')} WHERE id = $1 RETURNING *`, [id, ...values]);
      return rows[0] || null;
    },

    async findUserByResetTokenHash(tokenHash) {
      const { rows } = await pool.query('SELECT * FROM users WHERE reset_token_hash = $1', [tokenHash]);
      return rows[0] || null;
    },

    async listAdmins() {
      const { rows } = await pool.query(
        "SELECT * FROM users WHERE role IN ('ADMIN', 'SUPERADMIN') ORDER BY created_at DESC"
      );
      return rows;
    },

    async countActiveSuperAdmins() {
      const { rows } = await pool.query(
        "SELECT COUNT(*)::int AS cnt FROM users WHERE role = 'SUPERADMIN' AND status = 'ACTIVE'"
      );
      return rows[0].cnt;
    },

    async createSession({ token_hash, user_id, expires_at, ip, user_agent }) {
      const { rows } = await pool.query(
        `INSERT INTO sessions (token_hash, user_id, expires_at, ip, user_agent)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [token_hash, user_id, expires_at, ip, user_agent]
      );
      return rows[0];
    },

    async findSessionWithUser(tokenHash) {
      const { rows } = await pool.query(
        `SELECT s.*, row_to_json(u.*) AS user
         FROM sessions s JOIN users u ON u.id = s.user_id
         WHERE s.token_hash = $1`,
        [tokenHash]
      );
      return rows[0] || null;
    },

    async touchSession(tokenHash, newExpiresAt) {
      await pool.query('UPDATE sessions SET expires_at = $2 WHERE token_hash = $1', [tokenHash, newExpiresAt]);
    },

    async deleteSession(tokenHash) {
      await pool.query('DELETE FROM sessions WHERE token_hash = $1', [tokenHash]);
    },

    async deleteSessionsByUserId(userId) {
      await pool.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
    },

    async deleteExpiredSessions() {
      const res = await pool.query('DELETE FROM sessions WHERE expires_at <= NOW()');
      return res.rowCount || 0;
    },

    async getProfile(userId) {
      const { rows } = await pool.query('SELECT * FROM participant_profiles WHERE user_id = $1', [userId]);
      return rows[0] || null;
    },

    async upsertProfile(userId, data) {
      const existing = await this.getProfile(userId);
      const merged = {
        full_name: data.full_name ?? existing?.full_name ?? '',
        institution: data.institution ?? existing?.institution ?? '',
        phone_wa: data.phone_wa ?? existing?.phone_wa ?? '',
        student_card_path: data.student_card_path !== undefined ? data.student_card_path : existing?.student_card_path ?? null,
      };
      const { rows } = await pool.query(
        `INSERT INTO participant_profiles (user_id, full_name, institution, phone_wa, student_card_path, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (user_id) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           institution = EXCLUDED.institution,
           phone_wa = EXCLUDED.phone_wa,
           student_card_path = EXCLUDED.student_card_path,
           updated_at = NOW()
         RETURNING *`,
        [userId, merged.full_name, merged.institution, merged.phone_wa, merged.student_card_path]
      );
      return rows[0];
    },

    async countDuplicatePhone(phoneWa, excludeUserId) {
      if (!phoneWa) return 0;
      const { rows } = await pool.query(
        `SELECT (
           (SELECT COUNT(*) FROM participant_profiles WHERE phone_wa = $1 AND user_id <> $2) +
           (SELECT COUNT(*) FROM team_members tm JOIN registrations r ON r.id = tm.registration_id
            WHERE tm.phone_wa = $1 AND r.user_id <> $2 AND r.status <> 'DIBATALKAN')
         )::int AS cnt`,
        [phoneWa, excludeUserId]
      );
      return rows[0].cnt;
    },

    async createCompetition(data) {
      const { rows } = await pool.query(
        `INSERT INTO competitions (slug, name, fee, is_team, max_team_size, max_quota, reg_open_at, reg_close_at, submission_deadline, group_url, guidebook_url, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
        [
          data.slug, data.name, Number(data.fee || 0), Boolean(data.is_team),
          Number(data.max_team_size || 1), Number(data.max_quota || 100),
          data.reg_open_at, data.reg_close_at, data.submission_deadline,
          data.group_url || null, data.guidebook_url || null, data.is_active !== false,
        ]
      );
      return rows[0];
    },

    async listCompetitions({ includeInactive = false } = {}) {
      const sql = includeInactive
        ? 'SELECT * FROM competitions ORDER BY created_at ASC'
        : 'SELECT * FROM competitions WHERE is_active = TRUE ORDER BY created_at ASC';
      const { rows } = await pool.query(sql);
      return rows;
    },

    async findCompetitionBySlug(slug) {
      const { rows } = await pool.query('SELECT * FROM competitions WHERE slug = $1', [slug]);
      return rows[0] || null;
    },

    async findCompetitionById(id) {
      const { rows } = await pool.query('SELECT * FROM competitions WHERE id = $1', [id]);
      return rows[0] || null;
    },

    async updateCompetition(id, patch) {
      const keys = safeKeys('competitions', patch);
      if (keys.length === 0) return this.findCompetitionById(id);
      const sets = keys.map((k, i) => `${k} = $${i + 2}`);
      const values = keys.map((k) => patch[k]);
      const { rows } = await pool.query(`UPDATE competitions SET ${sets.join(', ')} WHERE id = $1 RETURNING *`, [id, ...values]);
      return rows[0] || null;
    },

    async findActiveRegistrationByUserId(userId) {
      const { rows } = await pool.query(
        "SELECT id FROM registrations WHERE user_id = $1 AND status <> 'DIBATALKAN' LIMIT 1",
        [userId]
      );
      if (!rows[0]) return null;
      return hydrateRegistration(rows[0].id);
    },

    async countActiveRegistrationsByCompetition(compId) {
      const { rows } = await pool.query(
        "SELECT COUNT(*)::int AS cnt FROM registrations WHERE competition_id = $1 AND status <> 'DIBATALKAN'",
        [compId]
      );
      return rows[0].cnt;
    },

    async createRegistrationAtomic({ user_id, competition, team_name = null, team_members = [], payment_proof_path = null, actor_id }) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const cntRes = await client.query(
          "SELECT COUNT(*)::int AS cnt FROM registrations WHERE competition_id = $1 AND status <> 'DIBATALKAN'",
          [competition.id]
        );
        if (cntRes.rows[0].cnt >= competition.max_quota) {
          const err = new Error('Kuota pendaftaran untuk cabang lomba ini sudah penuh.');
          err.code = 'QUOTA_EXCEEDED';
          throw err;
        }

        const code = generateRegistrationCode(competition.slug);
        const regRes = await client.query(
          `INSERT INTO registrations (registration_code, user_id, competition_id, team_name, status, payment_proof_path)
           VALUES ($1, $2, $3, $4, 'MENUNGGU_VERIFIKASI', $5) RETURNING id`,
          [code, user_id, competition.id, team_name, payment_proof_path]
        );
        const regId = regRes.rows[0].id;

        for (const tm of team_members) {
          await client.query(
            'INSERT INTO team_members (registration_id, full_name, institution, phone_wa) VALUES ($1, $2, $3, $4)',
            [regId, tm.full_name, tm.institution, tm.phone_wa]
          );
        }

        await client.query(
          `INSERT INTO status_logs (registration_id, from_status, to_status, changed_by, note)
           VALUES ($1, NULL, 'MENUNGGU_VERIFIKASI', $2, 'Pendaftaran baru dikirim')`,
          [regId, actor_id]
        );

        await client.query('COMMIT');
        return hydrateRegistration(regId);
      } catch (err) {
        await client.query('ROLLBACK');
        if (err.code === '23505' && String(err.constraint || '').includes('uq_registrations_active_user')) {
          const dupErr = new Error('Akun sudah memiliki pendaftaran lomba aktif.');
          dupErr.code = 'BR01_DUPLICATE_ACTIVE';
          throw dupErr;
        }
        throw err;
      } finally {
        client.release();
      }
    },

    hydrateRegistration,

    async updateRegistration(id, patch, { team_members, status_log } = {}) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const keys = safeKeys('registrations', patch);
        if (keys.length > 0) {
          const sets = keys.map((k, i) => `${k} = $${i + 2}`);
          sets.push('updated_at = NOW()');
          const values = keys.map((k) => patch[k]);
          await client.query(`UPDATE registrations SET ${sets.join(', ')} WHERE id = $1`, [id, ...values]);
        }

        if (Array.isArray(team_members)) {
          await client.query('DELETE FROM team_members WHERE registration_id = $1', [id]);
          for (const tm of team_members) {
            await client.query(
              'INSERT INTO team_members (registration_id, full_name, institution, phone_wa) VALUES ($1, $2, $3, $4)',
              [id, tm.full_name, tm.institution, tm.phone_wa]
            );
          }
        }

        if (status_log) {
          await client.query(
            `INSERT INTO status_logs (registration_id, from_status, to_status, changed_by, note)
             VALUES ($1, $2, $3, $4, $5)`,
            [id, status_log.from_status, status_log.to_status, status_log.changed_by, status_log.note || null]
          );
        }

        await client.query('COMMIT');
        return hydrateRegistration(id);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    },

    async listRegistrations({ competitionId, status, q, page = 1, pageSize = 20 } = {}) {
      const wheres = [];
      const params = [];
      if (competitionId) {
        params.push(competitionId);
        wheres.push(`r.competition_id = $${params.length}`);
      }
      if (status) {
        params.push(status);
        wheres.push(`r.status = $${params.length}`);
      }
      if (q) {
        params.push(`%${q.toLowerCase()}%`);
        wheres.push(`(LOWER(r.registration_code) LIKE $${params.length} OR LOWER(u.name) LIKE $${params.length} OR LOWER(u.email) LIKE $${params.length} OR LOWER(COALESCE(r.team_name,'')) LIKE $${params.length})`);
      }
      const whereSql = wheres.length ? `WHERE ${wheres.join(' AND ')}` : '';
      const countRes = await pool.query(
        `SELECT COUNT(*)::int AS cnt FROM registrations r JOIN users u ON u.id = r.user_id ${whereSql}`,
        params
      );
      const offset = (page - 1) * pageSize;
      params.push(pageSize, offset);
      const idRes = await pool.query(
        `SELECT r.id FROM registrations r JOIN users u ON u.id = r.user_id ${whereSql}
         ORDER BY r.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params
      );
      const items = await Promise.all(idRes.rows.map((row) => hydrateRegistration(row.id)));
      return { items, total: countRes.rows[0].cnt, page, pageSize };
    },

    async createSubmission({ registration_id, title = null, file_path = null, link_url = null, description = null }) {
      const { rows } = await pool.query(
        `INSERT INTO submissions (registration_id, title, file_path, link_url, description, version)
         VALUES ($1, $2, $3, $4, $5, COALESCE((SELECT MAX(version) FROM submissions WHERE registration_id = $1), 0) + 1)
         RETURNING *`,
        [registration_id, title, file_path, link_url, description]
      );
      return rows[0];
    },

    async listSubmissionsByRegistration(registrationId) {
      const { rows } = await pool.query(
        'SELECT * FROM submissions WHERE registration_id = $1 ORDER BY version DESC',
        [registrationId]
      );
      return rows;
    },

    async findSubmissionById(id) {
      const { rows } = await pool.query('SELECT * FROM submissions WHERE id = $1', [id]);
      return rows[0] || null;
    },

    async listAllSubmissions({ competitionId } = {}) {
      const params = [];
      const where = competitionId ? (params.push(competitionId), 'WHERE r.competition_id = $1') : '';
      const { rows } = await pool.query(
        `SELECT s.*, r.registration_code, u.name AS participant_name, r.team_name, c.name AS competition_name
         FROM submissions s
         JOIN registrations r ON r.id = s.registration_id
         JOIN users u ON u.id = r.user_id
         JOIN competitions c ON c.id = r.competition_id
         ${where}
         ORDER BY s.submitted_at DESC`,
        params
      );
      return rows;
    },

    async scoreSubmission(id, { score, jury_feedback = null, round = 'TAHAP_1' }) {
      const { rows } = await pool.query(
        'UPDATE submissions SET score = $2, jury_feedback = $3, round = $4 WHERE id = $1 RETURNING *',
        [id, Number(score), jury_feedback, round]
      );
      return rows[0] || null;
    },

    async createAnnouncement({ competition_id = null, title, body, created_by, published_at = null }) {
      const { rows } = await pool.query(
        `INSERT INTO announcements (competition_id, title, body, created_by, published_at)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [competition_id, title, body, created_by, published_at]
      );
      return rows[0];
    },

    async updateAnnouncement(id, patch) {
      const keys = safeKeys('announcements', patch);
      if (keys.length === 0) return null;
      const sets = keys.map((k, i) => `${k} = $${i + 2}`);
      const values = keys.map((k) => patch[k]);
      const { rows } = await pool.query(`UPDATE announcements SET ${sets.join(', ')} WHERE id = $1 RETURNING *`, [id, ...values]);
      return rows[0] || null;
    },

    async deleteAnnouncement(id) {
      const res = await pool.query('DELETE FROM announcements WHERE id = $1', [id]);
      return (res.rowCount || 0) > 0;
    },

    async listAnnouncements({ competitionId = null, publishedOnly = true } = {}) {
      if (publishedOnly) {
        const { rows } = await pool.query(
          `SELECT * FROM announcements
           WHERE published_at IS NOT NULL AND (competition_id IS NULL OR competition_id = $1)
           ORDER BY published_at DESC`,
          [competitionId]
        );
        return rows;
      }
      const { rows } = await pool.query('SELECT * FROM announcements ORDER BY created_at DESC');
      return rows;
    },

    async upsertAdminInvite({ email, role, invited_by }) {
      const { rows } = await pool.query(
        `INSERT INTO admin_invites (email, role, invited_by, claimed_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role, invited_by = EXCLUDED.invited_by, claimed_at = NOW()
         RETURNING *`,
        [email.toLowerCase(), role, invited_by]
      );
      return rows[0];
    },

    async enqueueEmail({ to_email, template, payload = {} }) {
      const { rows } = await pool.query(
        `INSERT INTO email_outbox (to_email, template, payload)
         VALUES ($1, $2, $3::jsonb) RETURNING *`,
        [to_email, template, JSON.stringify(payload)]
      );
      return rows[0];
    },

    async listPendingEmails(limit = 20) {
      const { rows } = await pool.query(
        "SELECT * FROM email_outbox WHERE status = 'PENDING' AND send_after <= NOW() ORDER BY created_at ASC LIMIT $1",
        [limit]
      );
      return rows;
    },

    async updateEmailOutbox(id, patch) {
      const keys = safeKeys('email_outbox', patch);
      if (keys.length === 0) return null;
      const sets = keys.map((k, i) => `${k} = $${i + 2}`);
      const values = keys.map((k) => patch[k]);
      const { rows } = await pool.query(`UPDATE email_outbox SET ${sets.join(', ')} WHERE id = $1 RETURNING *`, [id, ...values]);
      return rows[0] || null;
    },

    async createAuditLog({ actor_id, action, target_type, target_id = null, meta = {} }) {
      const { rows } = await pool.query(
        `INSERT INTO audit_logs (actor_id, action, target_type, target_id, meta)
         VALUES ($1, $2, $3, $4, $5::jsonb) RETURNING *`,
        [actor_id, action, target_type, target_id, JSON.stringify(meta)]
      );
      return rows[0];
    },

    async listAuditLogs(limit = 100) {
      const { rows } = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1', [limit]);
      return rows;
    },
  };
}
