import { generateUuid, generateRegistrationCode } from '../utils/crypto.mjs';

/**
 * In-Memory Repository yang mereplikasi 12 tabel PostgreSQL PRD Digiconomic Fest 2027,
 * termasuk partial unique index BR-01 (1 akun 1 lomba aktif selain DIBATALKAN).
 */
export function createMemoryRepo() {
  const db = {
    users: new Map(), // id -> user
    participant_profiles: new Map(), // user_id -> profile
    competitions: new Map(), // id -> competition
    registrations: new Map(), // id -> registration
    team_members: [], // { id, registration_id, full_name, institution, phone_wa }
    submissions: [], // { id, registration_id, title, file_path, link_url, description, version, score, jury_feedback, round, submitted_at }
    announcements: new Map(), // id -> announcement
    status_logs: [],
    sessions: new Map(), // token_hash -> session
    admin_invites: new Map(), // email -> invite
    email_outbox: [],
    audit_logs: [],
    timeline_stages: new Map(), // id -> stage
  };

  function clone(obj) {
    return obj === undefined || obj === null ? obj : structuredClone(obj);
  }

  return {
    type: 'memory',
    _db: db,

    async ping() {
      return true;
    },

    async close() {},

    // ── USERS ──
    async findUserByEmail(email) {
      const target = email.toLowerCase();
      for (const u of db.users.values()) {
        if (u.email === target) return clone(u);
      }
      return null;
    },

    async findUserById(id) {
      return clone(db.users.get(id) || null);
    },

    async createUser({
      email,
      password_hash = null,
      name,
      role = 'PESERTA',
      status = 'ACTIVE',
      division = null,
      assigned_competition_id = null,
      nim = null,
      google_id = null,
      avatar_url = null,
      privacy_accepted_at = null,
    }) {
      const cleanEmail = email.toLowerCase();
      for (const u of db.users.values()) {
        if (u.email === cleanEmail) {
          const err = new Error('Email sudah terdaftar.');
          err.code = '23505';
          throw err;
        }
      }
      const now = new Date().toISOString();
      const user = {
        id: generateUuid(),
        email: cleanEmail,
        password_hash,
        name,
        role,
        status,
        division,
        assigned_competition_id,
        nim,
        google_id,
        avatar_url,
        privacy_accepted_at,
        reset_token_hash: null,
        reset_token_expires_at: null,
        created_at: now,
        last_login_at: now,
      };
      db.users.set(user.id, user);
      return clone(user);
    },

    async updateUser(id, patch) {
      const u = db.users.get(id);
      if (!u) return null;
      Object.assign(u, patch);
      return clone(u);
    },

    async findUserByResetTokenHash(tokenHash) {
      for (const u of db.users.values()) {
        if (u.reset_token_hash === tokenHash) return clone(u);
      }
      return null;
    },

    async listAdmins() {
      return [...db.users.values()]
        .filter((u) => u.role === 'ADMIN' || u.role === 'SUPERADMIN' || u.role === 'JURI')
        .map((u) => clone(u));
    },

    async countActiveSuperAdmins() {
      let count = 0;
      for (const u of db.users.values()) {
        if (u.role === 'SUPERADMIN' && u.status === 'ACTIVE') count += 1;
      }
      return count;
    },

    // ── SESSIONS ──
    async createSession({ token_hash, user_id, expires_at, ip, user_agent }) {
      const session = {
        token_hash,
        user_id,
        expires_at,
        created_at: new Date().toISOString(),
        ip,
        user_agent,
      };
      db.sessions.set(token_hash, session);
      return clone(session);
    },

    async findSessionWithUser(tokenHash) {
      const s = db.sessions.get(tokenHash);
      if (!s) return null;
      const user = db.users.get(s.user_id);
      if (!user) return null;
      return { ...clone(s), user: clone(user) };
    },

    async touchSession(tokenHash, newExpiresAt) {
      const s = db.sessions.get(tokenHash);
      if (s) s.expires_at = newExpiresAt;
    },

    async deleteSession(tokenHash) {
      db.sessions.delete(tokenHash);
    },

    async deleteSessionsByUserId(userId) {
      for (const [k, s] of db.sessions.entries()) {
        if (s.user_id === userId) db.sessions.delete(k);
      }
    },

    async deleteExpiredSessions() {
      const now = Date.now();
      let removed = 0;
      for (const [k, s] of db.sessions.entries()) {
        if (new Date(s.expires_at).getTime() <= now) {
          db.sessions.delete(k);
          removed += 1;
        }
      }
      return removed;
    },

    // ── PARTICIPANT PROFILES ──
    async getProfile(userId) {
      return clone(db.participant_profiles.get(userId) || null);
    },

    async upsertProfile(userId, data) {
      const existing = db.participant_profiles.get(userId) || {
        user_id: userId,
        full_name: '',
        institution: '',
        phone_wa: '',
        student_card_path: null,
      };
      const updated = {
        ...existing,
        ...data,
        user_id: userId,
        updated_at: new Date().toISOString(),
      };
      db.participant_profiles.set(userId, updated);
      return clone(updated);
    },

    async countDuplicatePhone(phoneWa, excludeUserId) {
      if (!phoneWa) return 0;
      let count = 0;
      for (const p of db.participant_profiles.values()) {
        if (p.user_id !== excludeUserId && p.phone_wa === phoneWa) count += 1;
      }
      for (const tm of db.team_members) {
        const reg = db.registrations.get(tm.registration_id);
        if (reg && reg.user_id !== excludeUserId && reg.status !== 'DIBATALKAN' && tm.phone_wa === phoneWa) {
          count += 1;
        }
      }
      return count;
    },

    // ── COMPETITIONS ──
    async createCompetition(data) {
      const comp = {
        id: data.id || generateUuid(),
        slug: data.slug,
        name: data.name,
        fee: Number(data.fee || 0),
        is_team: Boolean(data.is_team),
        max_team_size: Number(data.max_team_size || 1),
        max_quota: Number(data.max_quota || 100),
        reg_open_at: data.reg_open_at,
        reg_close_at: data.reg_close_at,
        submission_deadline: data.submission_deadline,
        group_url: data.group_url || null,
        guidebook_url: data.guidebook_url || null,
        is_active: data.is_active !== false,
        created_at: new Date().toISOString(),
      };
      db.competitions.set(comp.id, comp);
      return clone(comp);
    },

    async listCompetitions({ includeInactive = false } = {}) {
      return [...db.competitions.values()]
        .filter((c) => includeInactive || c.is_active)
        .map((c) => clone(c));
    },

    async findCompetitionBySlug(slug) {
      for (const c of db.competitions.values()) {
        if (c.slug === slug) return clone(c);
      }
      return null;
    },

    async findCompetitionById(id) {
      return clone(db.competitions.get(id) || null);
    },

    async updateCompetition(id, patch) {
      const c = db.competitions.get(id);
      if (!c) return null;
      Object.assign(c, patch);
      return clone(c);
    },

    // ── REGISTRATIONS (Enforces BR-01 Partial Unique Index atomically) ──
    async findActiveRegistrationByUserId(userId) {
      for (const r of db.registrations.values()) {
        if (r.user_id === userId && r.status !== 'DIBATALKAN') {
          return this.hydrateRegistration(r.id);
        }
      }
      return null;
    },

    async countActiveRegistrationsByCompetition(compId) {
      let count = 0;
      for (const r of db.registrations.values()) {
        if (r.competition_id === compId && r.status !== 'DIBATALKAN') count += 1;
      }
      return count;
    },

    async createRegistrationAtomic({ user_id, competition, team_name = null, team_members = [], payment_proof_path = null, actor_id }) {
      // Partial Unique Index BR-01: cek sinkron tanpa await di antara cek & insert
      for (const r of db.registrations.values()) {
        if (r.user_id === user_id && r.status !== 'DIBATALKAN') {
          const err = new Error('Akun sudah memiliki pendaftaran lomba aktif.');
          err.code = 'BR01_DUPLICATE_ACTIVE';
          throw err;
        }
      }

      const activeCount = await this.countActiveRegistrationsByCompetition(competition.id);
      if (activeCount >= competition.max_quota) {
        const err = new Error('Kuota pendaftaran untuk cabang lomba ini sudah penuh.');
        err.code = 'QUOTA_EXCEEDED';
        throw err;
      }

      const now = new Date().toISOString();
      const reg = {
        id: generateUuid(),
        registration_code: generateRegistrationCode(competition.slug),
        user_id,
        competition_id: competition.id,
        team_name,
        status: 'MENUNGGU_VERIFIKASI',
        payment_proof_path,
        reject_reason: null,
        verified_by: null,
        verified_at: null,
        created_at: now,
        updated_at: now,
      };
      db.registrations.set(reg.id, reg);

      for (const tm of team_members) {
        db.team_members.push({
          id: generateUuid(),
          registration_id: reg.id,
          full_name: tm.full_name,
          institution: tm.institution,
          phone_wa: tm.phone_wa,
        });
      }

      db.status_logs.push({
        id: generateUuid(),
        registration_id: reg.id,
        from_status: null,
        to_status: 'MENUNGGU_VERIFIKASI',
        changed_by: actor_id,
        note: 'Pendaftaran baru dikirim',
        created_at: now,
      });

      return this.hydrateRegistration(reg.id);
    },

    async hydrateRegistration(id) {
      const r = db.registrations.get(id);
      if (!r) return null;
      const comp = db.competitions.get(r.competition_id);
      const user = db.users.get(r.user_id);
      const profile = db.participant_profiles.get(r.user_id) || null;
      const members = db.team_members.filter((m) => m.registration_id === r.id);
      const logs = db.status_logs
        .filter((l) => l.registration_id === r.id)
        .sort((a, b) => a.created_at.localeCompare(b.created_at));
      const subs = db.submissions
        .filter((s) => s.registration_id === r.id)
        .sort((a, b) => b.version - a.version);
      return clone({
        ...r,
        competition: comp || null,
        user: user ? { id: user.id, name: user.name, email: user.email, role: user.role } : null,
        profile,
        team_members: members,
        status_logs: logs,
        submissions: subs,
      });
    },

    async updateRegistration(id, patch, { team_members, status_log } = {}) {
      const r = db.registrations.get(id);
      if (!r) return null;
      Object.assign(r, patch, { updated_at: new Date().toISOString() });

      if (Array.isArray(team_members)) {
        db.team_members = db.team_members.filter((m) => m.registration_id !== id);
        for (const tm of team_members) {
          db.team_members.push({
            id: generateUuid(),
            registration_id: id,
            full_name: tm.full_name,
            institution: tm.institution,
            phone_wa: tm.phone_wa,
          });
        }
      }

      if (status_log) {
        db.status_logs.push({
          id: generateUuid(),
          registration_id: id,
          from_status: status_log.from_status,
          to_status: status_log.to_status,
          changed_by: status_log.changed_by,
          note: status_log.note || null,
          created_at: new Date().toISOString(),
        });
      }

      return this.hydrateRegistration(id);
    },

    async getAdminSummary(statuses = []) {
      const byStatus = {};
      for (const s of statuses) byStatus[s] = 0;
      const byCompetition = {};
      const pending = [];

      for (const r of db.registrations.values()) {
        byStatus[r.status] = (byStatus[r.status] || 0) + 1;
        const comp = db.competitions.get(r.competition_id);
        const cname = comp?.name || r.competition_id;
        byCompetition[cname] = (byCompetition[cname] || 0) + 1;
        if (r.status === 'MENUNGGU_VERIFIKASI') {
          const u = db.users.get(r.user_id);
          pending.push({
            id: r.id,
            registration_code: r.registration_code,
            name: u?.name || null,
            created_at: r.created_at,
          });
        }
      }

      pending.sort((a, b) => a.created_at.localeCompare(b.created_at));
      return {
        total: db.registrations.size,
        by_status: byStatus,
        by_competition: byCompetition,
        oldest_pending: pending.slice(0, 10),
      };
    },

    async listRegistrations({ competitionId, status, q, page = 1, pageSize = 20 } = {}) {
      let items = [];
      for (const r of db.registrations.values()) {
        if (competitionId && r.competition_id !== competitionId) continue;
        if (status && r.status !== status) continue;
        const hydrated = await this.hydrateRegistration(r.id);
        if (q) {
          const needle = q.toLowerCase();
          const hay = [
            hydrated.registration_code,
            hydrated.user?.name,
            hydrated.user?.email,
            hydrated.profile?.full_name,
            hydrated.profile?.institution,
            hydrated.team_name,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          if (!hay.includes(needle)) continue;
        }
        items.push(hydrated);
      }
      items.sort((a, b) => b.created_at.localeCompare(a.created_at));
      const total = items.length;
      const start = (page - 1) * pageSize;
      return {
        items: items.slice(start, start + pageSize),
        total,
        page,
        pageSize,
      };
    },

    // ── SUBMISSIONS ──
    async createSubmission({ registration_id, title = null, file_path = null, link_url = null, description = null }) {
      const existing = db.submissions.filter((s) => s.registration_id === registration_id);
      const nextVersion = existing.reduce((max, s) => Math.max(max, s.version), 0) + 1;
      const sub = {
        id: generateUuid(),
        registration_id,
        title,
        file_path,
        link_url,
        description,
        version: nextVersion,
        score: null,
        jury_feedback: null,
        round: null,
        submitted_at: new Date().toISOString(),
      };
      db.submissions.push(sub);
      return clone(sub);
    },

    async listSubmissionsByRegistration(registrationId) {
      return db.submissions
        .filter((s) => s.registration_id === registrationId)
        .sort((a, b) => b.version - a.version)
        .map((s) => clone(s));
    },

    async findSubmissionById(id) {
      return clone(db.submissions.find((s) => s.id === id) || null);
    },

    async listAllSubmissions({ competitionId } = {}) {
      const results = [];
      for (const s of db.submissions) {
        const reg = db.registrations.get(s.registration_id);
        if (!reg) continue;
        if (competitionId && reg.competition_id !== competitionId) continue;
        const user = db.users.get(reg.user_id);
        const comp = db.competitions.get(reg.competition_id);
        results.push(
          clone({
            ...s,
            registration_code: reg.registration_code,
            participant_name: user?.name || '-',
            team_name: reg.team_name,
            competition_name: comp?.name || '-',
          })
        );
      }
      return results.sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));
    },

    async scoreSubmission(id, { score, jury_feedback = null, round = 'TAHAP_1' }) {
      const sub = db.submissions.find((s) => s.id === id);
      if (!sub) return null;
      sub.score = Number(score);
      sub.jury_feedback = jury_feedback;
      sub.round = round;
      return clone(sub);
    },

    // ── ANNOUNCEMENTS ──
    async createAnnouncement({ competition_id = null, title, body, created_by, published_at = null }) {
      const item = {
        id: generateUuid(),
        competition_id,
        title,
        body,
        created_by,
        published_at,
        created_at: new Date().toISOString(),
      };
      db.announcements.set(item.id, item);
      return clone(item);
    },

    async updateAnnouncement(id, patch) {
      const item = db.announcements.get(id);
      if (!item) return null;
      Object.assign(item, patch);
      return clone(item);
    },

    async deleteAnnouncement(id) {
      return db.announcements.delete(id);
    },

    async listAnnouncements({ competitionId = null, publishedOnly = true } = {}) {
      return [...db.announcements.values()]
        .filter((a) => {
          if (publishedOnly && !a.published_at) return false;
          if (publishedOnly) {
            return a.competition_id === null || a.competition_id === competitionId;
          }
          if (competitionId) return a.competition_id === competitionId;
          return true;
        })
        .sort((a, b) => (b.published_at || b.created_at).localeCompare(a.published_at || a.created_at))
        .map((a) => clone(a));
    },

    // ── ADMIN INVITES ──
    async upsertAdminInvite({ email, role, invited_by }) {
      const clean = email.toLowerCase();
      const inv = {
        email: clean,
        role,
        invited_by,
        created_at: new Date().toISOString(),
        claimed_at: new Date().toISOString(),
      };
      db.admin_invites.set(clean, inv);
      return clone(inv);
    },

    // ── EMAIL OUTBOX ──
    async enqueueEmail({ to_email, template, payload = {} }) {
      const item = {
        id: generateUuid(),
        to_email,
        template,
        payload,
        status: 'PENDING',
        attempts: 0,
        send_after: new Date().toISOString(),
        sent_at: null,
        created_at: new Date().toISOString(),
      };
      db.email_outbox.push(item);
      return clone(item);
    },

    async listPendingEmails(limit = 20) {
      const now = Date.now();
      return db.email_outbox
        .filter((e) => e.status === 'PENDING' && new Date(e.send_after).getTime() <= now)
        .slice(0, limit)
        .map((e) => clone(e));
    },

    async updateEmailOutbox(id, patch) {
      const e = db.email_outbox.find((x) => x.id === id);
      if (e) Object.assign(e, patch);
      return clone(e || null);
    },

    // ── AUDIT LOGS ──
    async createAuditLog({ actor_id, action, target_type, target_id = null, meta = {} }) {
      const entry = {
        id: generateUuid(),
        actor_id,
        action,
        target_type,
        target_id,
        meta,
        created_at: new Date().toISOString(),
      };
      db.audit_logs.unshift(entry);
      return clone(entry);
    },

    async listAuditLogs(limit = 100) {
      return db.audit_logs.slice(0, limit).map((l) => clone(l));
    },

    // ── TIMELINE STAGES ──
    async listTimelineStages({ publicOnly = false, nowMs = Date.now() } = {}) {
      return [...db.timeline_stages.values()]
        .filter((s) => {
          if (!publicOnly) return true;
          if (!s.is_visible) return false;
          if (s.visible_from && new Date(s.visible_from).getTime() > nowMs) return false;
          return true;
        })
        .sort((a, b) => (a.sort_order - b.sort_order) || String(a.start_at).localeCompare(String(b.start_at)))
        .map((s) => clone(s));
    },

    async findTimelineStageById(id) {
      return clone(db.timeline_stages.get(id) || null);
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
      for (const existing of db.timeline_stages.values()) {
        if (existing.stage_key === stage_key) {
          const err = new Error('Kode tahap (stage_key) sudah digunakan.');
          err.code = '23505';
          throw err;
        }
      }
      const now = new Date().toISOString();
      const stage = {
        id: generateUuid(),
        stage_key,
        sort_order: Number(sort_order) || 1,
        date_label,
        short_date,
        title,
        description,
        start_at,
        end_at,
        is_visible: Boolean(is_visible),
        visible_from: visible_from || null,
        is_extended: Boolean(is_extended),
        updated_by,
        created_at: now,
        updated_at: now,
      };
      db.timeline_stages.set(stage.id, stage);
      return clone(stage);
    },

    async updateTimelineStage(id, patch) {
      const s = db.timeline_stages.get(id);
      if (!s) return null;
      if (patch.stage_key && patch.stage_key !== s.stage_key) {
        for (const existing of db.timeline_stages.values()) {
          if (existing.id !== id && existing.stage_key === patch.stage_key) {
            const err = new Error('Kode tahap (stage_key) sudah digunakan.');
            err.code = '23505';
            throw err;
          }
        }
      }
      Object.assign(s, patch, { updated_at: new Date().toISOString() });
      return clone(s);
    },

    async deleteTimelineStage(id) {
      return db.timeline_stages.delete(id);
    },
  };
}
