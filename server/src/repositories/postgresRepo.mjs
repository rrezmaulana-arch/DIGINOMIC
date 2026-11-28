import { generateRegistrationCode } from '../utils/crypto.mjs';

/**
 * PostgreSQL 16 Repository menggunakan parameterized queries ($1, $2, ...) untuk mencegah SQL Injection.
 * Aktif otomatis ketika DATABASE_URL diset (mis. di dalam Docker Compose produksi).
 */
export async function createPostgresRepo(databaseUrl) {
  const { Pool } = await import('pg');
  const needsSsl = /supabase\.com|sslmode=require/i.test(databaseUrl);
  const caCert = process.env.DB_SSL_CA ? process.env.DB_SSL_CA.replace(/\\n/g, '\n') : undefined;
  const rejectUnauthorized = caCert
    ? true
    : process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true';
  if (needsSsl && !rejectUnauthorized && process.env.NODE_ENV === 'production') {
    console.warn('[DB SSL WARNING] Koneksi PostgreSQL SSL berjalan tanpa verifikasi sertifikat CA. Set DB_SSL_CA atau DB_SSL_REJECT_UNAUTHORIZED=true untuk keamanan penuh.');
  }
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const isSupabasePooler = /pooler\.supabase\.com/i.test(databaseUrl);
  // Di Vercel Serverless, Supabase Session Pooler (port 5432) hanya membatasi 15 klien total.
  // Otomatis gunakan Transaction Pooler (port 6543, kapasitas 200+ klien) agar bebas EMAXCONNSESSION.
  const effectiveConnectionString =
    isServerless && isSupabasePooler && process.env.DB_KEEP_SESSION_PORT !== 'true'
      ? databaseUrl.replace(/(pooler\.supabase\.com):5432(\/|$|\?)/i, '$1:6543$2')
      : databaseUrl;
  const defaultMaxPool = isServerless ? 1 : isSupabasePooler ? 3 : 6;
  const maxPool = Math.max(1, Math.min(10, Number(process.env.DB_POOL_MAX || defaultMaxPool)));

  const rawPool = new Pool({
    connectionString: effectiveConnectionString,
    ...(needsSsl ? { ssl: { rejectUnauthorized, ...(caCert ? { ca: caCert } : {}) } } : {}),
    max: maxPool,
    idleTimeoutMillis: isServerless ? 3_000 : 15_000,
    connectionTimeoutMillis: 10_000,
    allowExitOnIdle: true,
  });

  // Auto-retry ringan jika Supabase Session Pooler sempat penuh sesaat (EMAXCONNSESSION / 53300)
  const isPoolBusyError = (err) => {
    const msg = String(err?.message || '');
    return err?.code === '53300' || msg.includes('EMAXCONNSESSION') || msg.includes('max clients reached');
  };

  const pool = {
    async query(...args) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          return await rawPool.query(...args);
        } catch (err) {
          if (attempt < 2 && isPoolBusyError(err)) {
            await new Promise((r) => setTimeout(r, 180 * (attempt + 1) + Math.floor(Math.random() * 120)));
            continue;
          }
          throw err;
        }
      }
    },
    async connect() {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          return await rawPool.connect();
        } catch (err) {
          if (attempt < 2 && isPoolBusyError(err)) {
            await new Promise((r) => setTimeout(r, 180 * (attempt + 1) + Math.floor(Math.random() * 120)));
            continue;
          }
          throw err;
        }
      }
    },
    end: () => rawPool.end(),
  };

  const ALLOWED_COLUMNS = {
    users: new Set(['name', 'password_hash', 'role', 'status', 'division', 'assigned_competition_id', 'nim', 'google_id', 'avatar_url', 'privacy_accepted_at', 'reset_token_hash', 'reset_token_expires_at', 'last_login_at']),
    competitions: new Set(['name', 'fee', 'is_team', 'max_team_size', 'max_quota', 'reg_open_at', 'reg_close_at', 'submission_deadline', 'group_url', 'guidebook_url', 'is_active']),
    registrations: new Set(['team_name', 'status', 'payment_proof_path', 'payment_proof_drive_id', 'payment_sender_name', 'payment_date', 'drive_folder_id', 'reject_reason', 'verified_by', 'verified_at', 'cancelled_by', 'cancelled_at', 'cancel_reason']),
    announcements: new Set(['title', 'body', 'published_at', 'competition_id', 'is_pinned']),
    news_articles: new Set(['slug', 'title', 'category', 'excerpt', 'content', 'cover_image_url', 'show_on_home', 'is_featured', 'is_published', 'published_at']),
    email_outbox: new Set(['status', 'attempts', 'send_after', 'sent_at']),
    timeline_stages: new Set(['stage_key', 'sort_order', 'date_label', 'short_date', 'title', 'description', 'start_at', 'end_at', 'is_visible', 'visible_from', 'is_extended', 'updated_by']),
  };

  function safeKeys(table, patch) {
    const allowed = ALLOWED_COLUMNS[table];
    return Object.keys(patch).filter((k) => allowed.has(k));
  }

  async function hydrateRegistration(id) {
    const regRes = await pool.query('SELECT * FROM registrations WHERE id = $1', [id]);
    const r = regRes.rows[0];
    if (!r) return null;

    // Eksekusi hemat koneksi (1 slot pool per request) agar aman di Supabase Session Pooler
    const compRes = await pool.query('SELECT * FROM competitions WHERE id = $1', [r.competition_id]);
    const userRes = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [r.user_id]);
    const profRes = await pool.query('SELECT * FROM participant_profiles WHERE user_id = $1', [r.user_id]);
    const memRes = await pool.query('SELECT * FROM team_members WHERE registration_id = $1', [r.id]);
    const logRes = await pool.query('SELECT * FROM status_logs WHERE registration_id = $1 ORDER BY created_at ASC', [r.id]);
    const subRes = await pool.query('SELECT * FROM submissions WHERE registration_id = $1 ORDER BY version DESC', [r.id]);

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

    async createUser({ email, password_hash = null, name, role = 'PESERTA', status = 'ACTIVE', division = null, assigned_competition_id = null, nim = null, google_id = null, avatar_url = null, privacy_accepted_at = null }) {
      const { rows } = await pool.query(
        `INSERT INTO users (email, password_hash, name, role, status, division, assigned_competition_id, nim, google_id, avatar_url, privacy_accepted_at, last_login_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()) RETURNING *`,
        [email.toLowerCase(), password_hash, name, role, status, division, assigned_competition_id, nim, google_id, avatar_url, privacy_accepted_at]
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
        "SELECT * FROM users WHERE role IN ('ADMIN', 'SUPERADMIN', 'JURI') ORDER BY created_at DESC"
      );
      return rows;
    },

    async listAllUsers({ role = null, q = null } = {}) {
      const wheres = [];
      const params = [];
      if (role) {
        params.push(role);
        wheres.push(`role = $${params.length}`);
      }
      if (q) {
        params.push(`%${q.toLowerCase()}%`);
        wheres.push(`(LOWER(name) LIKE $${params.length} OR LOWER(email) LIKE $${params.length})`);
      }
      const whereSql = wheres.length ? `WHERE ${wheres.join(' AND ')}` : '';
      const { rows } = await pool.query(
        `SELECT id, email, name, role, status, division, assigned_competition_id, nim, avatar_url, last_login_at, created_at FROM users ${whereSql} ORDER BY created_at DESC`,
        params
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
        nim: data.nim !== undefined ? data.nim : existing?.nim ?? null,
        student_card_path: data.student_card_path !== undefined ? data.student_card_path : existing?.student_card_path ?? null,
        student_card_drive_id: data.student_card_drive_id !== undefined ? data.student_card_drive_id : existing?.student_card_drive_id ?? null,
      };
      const { rows } = await pool.query(
        `INSERT INTO participant_profiles (user_id, full_name, institution, phone_wa, nim, student_card_path, student_card_drive_id, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT (user_id) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           institution = EXCLUDED.institution,
           phone_wa = EXCLUDED.phone_wa,
           nim = EXCLUDED.nim,
           student_card_path = EXCLUDED.student_card_path,
           student_card_drive_id = EXCLUDED.student_card_drive_id,
           updated_at = NOW()
         RETURNING *`,
        [userId, merged.full_name, merged.institution, merged.phone_wa, merged.nim, merged.student_card_path, merged.student_card_drive_id]
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

        for (let i = 0; i < team_members.length; i++) {
          const tm = team_members[i];
          await client.query(
            'INSERT INTO team_members (registration_id, full_name, institution, phone_wa, nim, email, sequence_no) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [regId, tm.full_name, tm.institution, tm.phone_wa, tm.nim || null, tm.email || null, i + 1]
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
          for (let i = 0; i < team_members.length; i++) {
            const tm = team_members[i];
            await client.query(
              'INSERT INTO team_members (registration_id, full_name, institution, phone_wa, nim, email, sequence_no) VALUES ($1, $2, $3, $4, $5, $6, $7)',
              [id, tm.full_name, tm.institution, tm.phone_wa, tm.nim || null, tm.email || null, i + 1]
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

    async hydrateRegistrationsBatch(ids) {
      if (!ids || ids.length === 0) return [];
      const regRes = await pool.query('SELECT * FROM registrations WHERE id = ANY($1::uuid[])', [ids]);
      if (regRes.rows.length === 0) return [];

      const regMap = new Map(regRes.rows.map((r) => [r.id, r]));
      const orderedRegs = ids.map((id) => regMap.get(id)).filter(Boolean);
      const compIds = [...new Set(orderedRegs.map((r) => r.competition_id))];
      const userIds = [...new Set(orderedRegs.map((r) => r.user_id))];

      const compRes = await pool.query('SELECT * FROM competitions WHERE id = ANY($1::uuid[])', [compIds]);
      const userRes = await pool.query('SELECT id, name, email, role FROM users WHERE id = ANY($1::uuid[])', [userIds]);
      const profRes = await pool.query('SELECT * FROM participant_profiles WHERE user_id = ANY($1::uuid[])', [userIds]);
      const memRes = await pool.query('SELECT * FROM team_members WHERE registration_id = ANY($1::uuid[]) ORDER BY sequence_no ASC, id ASC', [ids]);
      const logRes = await pool.query('SELECT * FROM status_logs WHERE registration_id = ANY($1::uuid[]) ORDER BY created_at ASC', [ids]);
      const subRes = await pool.query('SELECT * FROM submissions WHERE registration_id = ANY($1::uuid[]) ORDER BY version DESC', [ids]);

      const compMap = new Map(compRes.rows.map((c) => [c.id, c]));
      const userMap = new Map(userRes.rows.map((u) => [u.id, u]));
      const profMap = new Map(profRes.rows.map((p) => [p.user_id, p]));
      const memMap = new Map();
      for (const m of memRes.rows) {
        if (!memMap.has(m.registration_id)) memMap.set(m.registration_id, []);
        memMap.get(m.registration_id).push(m);
      }
      const logMap = new Map();
      for (const l of logRes.rows) {
        if (!logMap.has(l.registration_id)) logMap.set(l.registration_id, []);
        logMap.get(l.registration_id).push(l);
      }
      const subMap = new Map();
      for (const s of subRes.rows) {
        if (!subMap.has(s.registration_id)) subMap.set(s.registration_id, []);
        subMap.get(s.registration_id).push(s);
      }

      return orderedRegs.map((r) => ({
        ...r,
        competition: compMap.get(r.competition_id) || null,
        user: userMap.get(r.user_id) || null,
        profile: profMap.get(r.user_id) || null,
        team_members: memMap.get(r.id) || [],
        status_logs: logMap.get(r.id) || [],
        submissions: subMap.get(r.id) || [],
      }));
    },

    async getAdminSummary(statuses = []) {
      const statusRes = await pool.query('SELECT status, COUNT(*)::int AS cnt FROM registrations GROUP BY status');
      const compRes = await pool.query(
        `SELECT COALESCE(c.name, r.competition_id::text) AS name, COUNT(*)::int AS cnt
         FROM registrations r
         LEFT JOIN competitions c ON c.id = r.competition_id
         GROUP BY c.name, r.competition_id`
      );
      const pendingRes = await pool.query(
        `SELECT r.id, r.registration_code, u.name, r.created_at
         FROM registrations r
         LEFT JOIN users u ON u.id = r.user_id
         WHERE r.status = 'MENUNGGU_VERIFIKASI'
         ORDER BY r.created_at ASC
         LIMIT 10`
      );

      const byStatus = {};
      for (const s of statuses) byStatus[s] = 0;
      let total = 0;
      for (const row of statusRes.rows) {
        byStatus[row.status] = row.cnt;
        total += row.cnt;
      }

      const byCompetition = {};
      for (const row of compRes.rows) {
        byCompetition[row.name] = row.cnt;
      }

      return {
        total,
        by_status: byStatus,
        by_competition: byCompetition,
        oldest_pending: pendingRes.rows,
      };
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
      const items = await this.hydrateRegistrationsBatch(idRes.rows.map((row) => row.id));
      return { items, total: countRes.rows[0].cnt, page, pageSize };
    },

    async createSubmission({ registration_id, title = null, file_path = null, drive_file_id = null, drive_view_url = null, link_url = null, description = null }) {
      const { rows } = await pool.query(
        `INSERT INTO submissions (registration_id, title, file_path, drive_file_id, drive_view_url, link_url, description, version)
         VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE((SELECT MAX(version) FROM submissions WHERE registration_id = $1), 0) + 1)
         RETURNING *`,
        [registration_id, title, file_path, drive_file_id, drive_view_url, link_url, description]
      );
      return rows[0];
    },

    async finalizeSubmission(id) {
      const { rows } = await pool.query(
        'UPDATE submissions SET is_final = TRUE, finalized_at = NOW() WHERE id = $1 RETURNING *',
        [id]
      );
      return rows[0] || null;
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

    async createAnnouncement({ competition_id = null, title, body, created_by, published_at = null, is_pinned = false }) {
      const { rows } = await pool.query(
        `INSERT INTO announcements (competition_id, title, body, created_by, published_at, is_pinned)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [competition_id, title, body, created_by, published_at, is_pinned]
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

    // ── Multi-Juri Rubrik Scoring ─────────────────────────────────────
    async upsertSubmissionScore({ submission_id, jury_id, round = 'TAHAP_1', score_orisinalitas, score_analisis, score_inovasi, score_sistematika, feedback = null }) {
      const { rows } = await pool.query(
        `INSERT INTO submission_scores (submission_id, jury_id, round, score_orisinalitas, score_analisis, score_inovasi, score_sistematika, feedback, scored_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         ON CONFLICT (submission_id, jury_id, round) DO UPDATE SET
           score_orisinalitas = EXCLUDED.score_orisinalitas,
           score_analisis = EXCLUDED.score_analisis,
           score_inovasi = EXCLUDED.score_inovasi,
           score_sistematika = EXCLUDED.score_sistematika,
           feedback = EXCLUDED.feedback,
           scored_at = NOW()
         RETURNING *`,
        [submission_id, jury_id, round, Number(score_orisinalitas), Number(score_analisis), Number(score_inovasi), Number(score_sistematika), feedback]
      );
      return rows[0];
    },

    async getScoresBySubmission(submissionId) {
      const { rows } = await pool.query(
        `SELECT ss.*, u.name AS jury_name, u.email AS jury_email
         FROM submission_scores ss
         JOIN users u ON u.id = ss.jury_id
         WHERE ss.submission_id = $1
         ORDER BY ss.scored_at DESC`,
        [submissionId]
      );
      return rows;
    },

    async getLeaderboard({ competitionId, round = 'TAHAP_1' } = {}) {
      const params = [round];
      let whereComp = '';
      if (competitionId) {
        params.push(competitionId);
        whereComp = `AND r.competition_id = $${params.length}`;
      }
      const { rows } = await pool.query(
        `SELECT
           s.id AS submission_id,
           s.title AS submission_title,
           s.version,
           s.is_final,
           s.drive_file_id,
           s.link_url,
           s.submitted_at,
           r.id AS registration_id,
           r.registration_code,
           r.team_name,
           r.status AS registration_status,
           u.name AS leader_name,
           p.institution,
           c.id AS competition_id,
           c.name AS competition_name,
           c.slug AS competition_slug,
           COUNT(ss.id)::int AS jury_count,
           ROUND(AVG(ss.total_score), 2)::numeric AS avg_score,
           ROUND(AVG(ss.score_orisinalitas), 2)::numeric AS avg_orisinalitas,
           ROUND(AVG(ss.score_analisis), 2)::numeric AS avg_analisis,
           ROUND(AVG(ss.score_inovasi), 2)::numeric AS avg_inovasi,
           ROUND(AVG(ss.score_sistematika), 2)::numeric AS avg_sistematika
         FROM submissions s
         JOIN registrations r ON r.id = s.registration_id
         JOIN users u ON u.id = r.user_id
         LEFT JOIN participant_profiles p ON p.user_id = u.id
         JOIN competitions c ON c.id = r.competition_id
         LEFT JOIN submission_scores ss ON ss.submission_id = s.id AND ss.round = $1
         WHERE r.status <> 'DIBATALKAN' ${whereComp}
         GROUP BY s.id, r.id, u.id, p.institution, c.id
         ORDER BY avg_score DESC NULLS LAST, s.submitted_at ASC`,
        params
      );
      return rows;
    },

    // ── News Articles (Superadmin) ───────────────────────────────────
    async listNewsArticles({ publishedOnly = true, showOnHomeOnly = false } = {}) {
      const wheres = [];
      if (publishedOnly) wheres.push('is_published = TRUE');
      if (showOnHomeOnly) wheres.push('show_on_home = TRUE');
      const whereSql = wheres.length ? `WHERE ${wheres.join(' AND ')}` : '';
      const { rows } = await pool.query(
        `SELECT n.*, u.name AS author_name
         FROM news_articles n
         LEFT JOIN users u ON u.id = n.created_by
         ${whereSql}
         ORDER BY n.is_featured DESC, COALESCE(n.published_at, n.created_at) DESC`
      );
      return rows;
    },

    async getNewsArticleBySlug(slug) {
      const { rows } = await pool.query(
        `SELECT n.*, u.name AS author_name
         FROM news_articles n
         LEFT JOIN users u ON u.id = n.created_by
         WHERE n.slug = $1`,
        [slug]
      );
      return rows[0] || null;
    },

    async createNewsArticle({ slug, title, category = 'Pengumuman', excerpt = '', content = '', cover_image_url = null, show_on_home = false, is_featured = false, is_published = false, created_by }) {
      const published_at = is_published ? new Date().toISOString() : null;
      const { rows } = await pool.query(
        `INSERT INTO news_articles (slug, title, category, excerpt, content, cover_image_url, show_on_home, is_featured, is_published, published_at, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [slug, title, category, excerpt, content, cover_image_url, Boolean(show_on_home), Boolean(is_featured), Boolean(is_published), published_at, created_by]
      );
      return rows[0];
    },

    async updateNewsArticle(id, patch) {
      const keys = safeKeys('news_articles', patch);
      if (keys.length === 0) return null;
      const sets = keys.map((k, i) => `${k} = $${i + 2}`);
      sets.push('updated_at = NOW()');
      const values = keys.map((k) => patch[k]);
      const { rows } = await pool.query(`UPDATE news_articles SET ${sets.join(', ')} WHERE id = $1 RETURNING *`, [id, ...values]);
      return rows[0] || null;
    },

    async deleteNewsArticle(id) {
      const res = await pool.query('DELETE FROM news_articles WHERE id = $1', [id]);
      return (res.rowCount || 0) > 0;
    },

    // ── Demographics & Statistics (Superadmin) ───────────────────────
    async getDemographics() {
      const instRes = await pool.query(
        `SELECT COALESCE(NULLIF(TRIM(p.institution), ''), 'Tidak Diketahui') AS institution, COUNT(*)::int AS total
         FROM registrations r
         JOIN participant_profiles p ON p.user_id = r.user_id
         WHERE r.status <> 'DIBATALKAN'
         GROUP BY 1
         ORDER BY total DESC
         LIMIT 20`
      );
      const compRes = await pool.query(
        `SELECT c.id, c.slug, c.name, c.max_quota, COUNT(r.id) FILTER (WHERE r.status <> 'DIBATALKAN')::int AS registered,
                COUNT(r.id) FILTER (WHERE r.status = 'TERVERIFIKASI')::int AS verified
         FROM competitions c
         LEFT JOIN registrations r ON r.competition_id = c.id
         GROUP BY c.id
         ORDER BY c.created_at ASC`
      );
      const roleRes = await pool.query(
        `SELECT role, COUNT(*)::int AS total FROM users GROUP BY role`
      );
      return {
        by_institution: instRes.rows,
        by_competition: compRes.rows,
        users_by_role: roleRes.rows,
      };
    },

    // ── Timeline Stages (Superadmin Managed) ─────────────────────────
    async listTimelineStages({ publicOnly = false, nowMs = Date.now() } = {}) {
      try {
        if (publicOnly) {
          const nowIso = new Date(nowMs).toISOString();
          const { rows } = await pool.query(
            `SELECT * FROM timeline_stages
             WHERE is_visible = TRUE
               AND (visible_from IS NULL OR visible_from <= $1::timestamptz)
             ORDER BY sort_order ASC, start_at ASC`,
            [nowIso]
          );
          return rows;
        }
        const { rows } = await pool.query(
          `SELECT * FROM timeline_stages ORDER BY sort_order ASC, start_at ASC`
        );
        return rows;
      } catch (err) {
        // Fallback aman jika tabel belum dimigrasi (PostgreSQL undefined_table 42P01)
        if (err?.code === '42P01') return [];
        throw err;
      }
    },

    async findTimelineStageById(id) {
      const { rows } = await pool.query('SELECT * FROM timeline_stages WHERE id = $1', [id]);
      return rows[0] || null;
    },

    async createTimelineStage({
      stage_key,
      sort_order = 1,
      date_label,
      short_date,
      title,
      description = '',
      start_at,
      end_at,
      is_visible = true,
      visible_from = null,
      is_extended = false,
      updated_by = null,
    }) {
      const { rows } = await pool.query(
        `INSERT INTO timeline_stages
           (stage_key, sort_order, date_label, short_date, title, description, start_at, end_at, is_visible, visible_from, is_extended, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          stage_key,
          Number(sort_order) || 1,
          date_label,
          short_date,
          title,
          description,
          start_at,
          end_at,
          Boolean(is_visible),
          visible_from || null,
          Boolean(is_extended),
          updated_by,
        ]
      );
      return rows[0];
    },

    async updateTimelineStage(id, patch) {
      const keys = safeKeys('timeline_stages', patch);
      if (keys.length === 0) return this.findTimelineStageById(id);
      const sets = keys.map((k, i) => `${k} = $${i + 2}`);
      sets.push('updated_at = NOW()');
      const values = keys.map((k) => patch[k]);
      const { rows } = await pool.query(
        `UPDATE timeline_stages SET ${sets.join(', ')} WHERE id = $1 RETURNING *`,
        [id, ...values]
      );
      return rows[0] || null;
    },

    async deleteTimelineStage(id) {
      const res = await pool.query('DELETE FROM timeline_stages WHERE id = $1', [id]);
      return (res.rowCount || 0) > 0;
    },
  };
}
