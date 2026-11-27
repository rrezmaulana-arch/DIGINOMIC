import http from 'node:http';
import crypto from 'node:crypto';
import {
  applySecurityHeaders,
  applyCors,
  checkOriginCsrf,
  getClientIp,
  createRateLimiter,
} from './middleware/security.mjs';
import {
  buildSessionCookie,
  clearSessionCookie,
  resolveAuthSession,
} from './middleware/auth.mjs';
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  hashToken,
} from './utils/crypto.mjs';
import {
  normalizeEmail,
  normalizePhoneWa,
  isValidEmail,
  isValidPassword,
  isValidPhoneWa,
  isValidHttpUrl,
  sanitizePlainText,
  containsHtmlTags,
  isValidUuid,
} from './utils/validator.mjs';
import { savePrivateFile, readPrivateFile } from './utils/fileSecurity.mjs';
import { readBodyBuffer, parseMultipartFormData } from './utils/multipart.mjs';
import { buildOpenApiSpec, renderSwaggerUiHtml } from './docs/openapi.mjs';
import { buildRegistrationsCsv } from './utils/csv.mjs';
import {
  REGISTRATION_STATUSES,
  canTransitionStatus,
  isGroupLinkEligible,
} from './utils/statusMachine.mjs';
import { verifyGoogleIdToken, upsertGoogleUser } from './services/googleAuth.mjs';
import { ensureRegistrationFolder, uploadFileToDrive, streamFileFromDrive } from './services/googleDrive.mjs';

const JSON_LIMIT_BYTES = 256 * 1024; // 256 KB untuk body JSON

function sendJson(res, status, data, extraHeaders = {}) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...extraHeaders,
  });
  res.end(body);
}

function sendError(res, status, code, message, extraHeaders = {}) {
  sendJson(res, status, { error: { code, message } }, extraHeaders);
}

async function readJsonBody(req) {
  const buf = await readBodyBuffer(req, JSON_LIMIT_BYTES);
  if (buf.length === 0) return {};
  try {
    const parsed = JSON.parse(buf.toString('utf8'));
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    throw new Error('JSON harus berupa objek');
  } catch {
    const err = new Error('Body JSON tidak valid atau rusak.');
    err.status = 400;
    err.code = 'INVALID_JSON';
    throw err;
  }
}

function sanitizeUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    status: u.status,
    division: u.division || null,
    assigned_competition_id: u.assigned_competition_id || null,
    nim: u.nim || null,
    avatar_url: u.avatar_url || null,
    privacy_accepted_at: u.privacy_accepted_at,
    created_at: u.created_at,
    last_login_at: u.last_login_at,
  };
}

function hasDriveConfigured(config) {
  const hasOAuth = Boolean(config.googleDriveRefreshToken && config.googleClientId && config.googleClientSecret);
  const hasSa = Boolean(config.googleServiceAccountPath);
  return Boolean(config.googleDriveRootFolderId && (hasOAuth || hasSa));
}

function getDriveAuth(config) {
  return {
    credPath: config.googleServiceAccountPath,
    clientId: config.googleClientId,
    clientSecret: config.googleClientSecret,
    refreshToken: config.googleDriveRefreshToken,
  };
}

function isWithinRegistrationPeriod(comp, nowMs = Date.now()) {
  if (!comp || !comp.is_active) return false;
  const open = new Date(comp.reg_open_at).getTime();
  const close = new Date(comp.reg_close_at).getTime();
  return nowMs >= open && nowMs <= close;
}

function serializeRegistrationForParticipant(reg) {
  if (!reg) return null;
  const eligibleForGroup = isGroupLinkEligible(reg.status);
  return {
    id: reg.id,
    registration_code: reg.registration_code,
    competition_id: reg.competition_id,
    competition_slug: reg.competition?.slug || null,
    competition_name: reg.competition?.name || null,
    fee: reg.competition?.fee ?? 0,
    is_team: reg.competition?.is_team ?? false,
    team_name: reg.team_name,
    team_members: reg.team_members || [],
    status: reg.status,
    has_payment_proof: Boolean(reg.payment_proof_drive_id || reg.payment_proof_path),
    payment_sender_name: reg.payment_sender_name || null,
    payment_date: reg.payment_date || null,
    reject_reason: reg.reject_reason,
    cancel_reason: reg.cancel_reason || null,
    // BR-03: link grup hanya dikirim jika status memenuhi syarat
    group_url: eligibleForGroup ? reg.competition?.group_url || null : null,
    guidebook_url: reg.competition?.guidebook_url || null,
    submission_deadline: reg.competition?.submission_deadline || null,
    status_logs: reg.status_logs || [],
    submissions: (reg.submissions || []).map((s) => ({
      id: s.id,
      title: s.title,
      link_url: s.link_url,
      has_file: Boolean(s.drive_file_id || s.file_path),
      is_final: Boolean(s.is_final),
      finalized_at: s.finalized_at || null,
      description: s.description,
      version: s.version,
      score: s.score,
      jury_feedback: s.jury_feedback,
      round: s.round,
      submitted_at: s.submitted_at,
    })),
    created_at: reg.created_at,
    updated_at: reg.updated_at,
  };
}

function isParticipantProfileComplete(profile) {
  return Boolean(
    profile &&
      profile.full_name &&
      profile.institution &&
      profile.phone_wa &&
      (profile.student_card_drive_id || profile.student_card_path)
  );
}

const STAFF_ROLES = new Set(['ADMIN', 'JURI', 'SUPERADMIN']);

export function createApp({ repo, config, verifyGoogleToken = verifyGoogleIdToken }) {
  const rateLimiter = createRateLimiter(config);

  const server = http.createServer(async (req, res) => {
    try {
      applySecurityHeaders(res, config);
      applyCors(req, res, config);

      const method = (req.method || 'GET').toUpperCase();
      if (method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
      const pathname = url.pathname;

      // 1. Health check (bebas rate limit & CSRF)
      if (method === 'GET' && pathname === '/health') {
        await repo.ping();
        return sendJson(res, 200, {
          status: 'ok',
          storage: repo.type,
          timestamp: new Date().toISOString(),
        });
      }

      // 1B. OpenAPI JSON & Swagger UI Docs (nonaktif default di produksi kecuali ENABLE_API_DOCS=true)
      if (method === 'GET' && pathname === '/openapi.json') {
        if (!config.enableApiDocs) {
          return sendError(res, 404, 'NOT_FOUND', 'Endpoint tidak ditemukan.');
        }
        const originUrl = `${url.protocol}//${req.headers.host || 'localhost:4000'}`;
        return sendJson(res, 200, buildOpenApiSpec(originUrl));
      }

      if (method === 'GET' && pathname === '/docs') {
        if (!config.enableApiDocs) {
          return sendError(res, 404, 'NOT_FOUND', 'Endpoint tidak ditemukan.');
        }
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Security-Policy': "default-src 'self' https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com; script-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: https://unpkg.com",
        });
        res.end(renderSwaggerUiHtml());
        return;
      }

      // 2. CSRF Origin Check pada semua endpoint mutasi
      const csrfCheck = checkOriginCsrf(req, config);
      if (!csrfCheck.ok) {
        return sendError(res, csrfCheck.status, csrfCheck.code, csrfCheck.message);
      }

      // 3. Per-IP Rate Limiter (dipisah: auth, upload, general)
      const ip = getClientIp(req, config);
      const isAuthPath = pathname.startsWith('/api/auth/');
      const isUploadPath =
        pathname.includes('/student-card') ||
        pathname.includes('/payment-proof') ||
        (method === 'POST' && pathname.includes('/submissions'));

      const bucket = isAuthPath ? 'auth' : isUploadPath ? 'upload' : 'general';
      const limit = isAuthPath
        ? config.rateLimitMaxAuth
        : isUploadPath
          ? config.rateLimitMaxUpload
          : config.rateLimitMaxGeneral;

      const rl = rateLimiter.check(ip, bucket, limit);
      if (!rl.allowed) {
        return sendError(
          res,
          429,
          'RATE_LIMITED',
          'Terlalu banyak permintaan. Silakan coba lagi beberapa saat.',
          { 'Retry-After': String(rl.retryAfterSec) }
        );
      }

      // Resolve sesi autentikasi jika ada cookie
      const auth = await resolveAuthSession(req, repo, config);
      const user = auth?.user || null;

      function requireLogin() {
        if (!user) {
          sendError(res, 401, 'UNAUTHORIZED', 'Silakan login terlebih dahulu.');
          return false;
        }
        return true;
      }

      function requireRoles(roles) {
        if (!requireLogin()) return false;
        if (!roles.includes(user.role)) {
          sendError(res, 403, 'FORBIDDEN_ROLE', 'Anda tidak memiliki hak akses untuk fitur ini.');
          return false;
        }
        return true;
      }

      async function createUserSessionCookie(targetUser) {
        const { rawToken, tokenHash } = generateSessionToken();
        const maxAgeSec = config.sessionTtlDays * 24 * 60 * 60;
        const expiresAt = new Date(Date.now() + maxAgeSec * 1000).toISOString();
        await repo.createSession({
          token_hash: tokenHash,
          user_id: targetUser.id,
          expires_at: expiresAt,
          ip,
          user_agent: String(req.headers['user-agent'] || '').slice(0, 250),
        });
        await repo.updateUser(targetUser.id, { last_login_at: new Date().toISOString() });
        return buildSessionCookie(config.sessionCookieName, rawToken, config, maxAgeSec);
      }

      // ════════════════════════════════════════════════════════════════
      // A. PUBLIC COMPETITIONS
      // ════════════════════════════════════════════════════════════════
      if (method === 'GET' && pathname === '/api/competitions') {
        const comps = await repo.listCompetitions({ includeInactive: false });
        const activeReg = user && user.role === 'PESERTA' ? await repo.findActiveRegistrationByUserId(user.id) : null;
        const enriched = await Promise.all(
          comps.map(async (c) => {
            const count = await repo.countActiveRegistrationsByCompetition(c.id);
            const isOpen = isWithinRegistrationPeriod(c) && count < c.max_quota;
            let locked = false;
            let lockReason = null;
            if (user && user.role !== 'PESERTA') {
              locked = true;
              lockReason = 'Akun panitia tidak dapat mendaftar lomba.';
            } else if (activeReg) {
              locked = true;
              lockReason = `Anda sudah terdaftar di lomba ${activeReg.competition?.name || ''}.`;
            } else if (!isOpen) {
              locked = true;
              lockReason = count >= c.max_quota ? 'Kuota penuh.' : 'Periode pendaftaran ditutup.';
            }
            return {
              id: c.id,
              slug: c.slug,
              name: c.name,
              fee: c.fee,
              is_team: c.is_team,
              max_team_size: c.max_team_size,
              max_quota: c.max_quota,
              registered_count: count,
              reg_open_at: c.reg_open_at,
              reg_close_at: c.reg_close_at,
              submission_deadline: c.submission_deadline,
              guidebook_url: c.guidebook_url,
              is_open: isOpen,
              locked,
              lock_reason: lockReason,
            };
          })
        );
        return sendJson(res, 200, { competitions: enriched });
      }

      const compSlugMatch = pathname.match(/^\/api\/competitions\/([a-z0-9-]+)$/i);
      if (method === 'GET' && compSlugMatch) {
        const comp = await repo.findCompetitionBySlug(compSlugMatch[1]);
        if (!comp || !comp.is_active) {
          return sendError(res, 404, 'COMPETITION_NOT_FOUND', 'Cabang lomba tidak ditemukan.');
        }
        const count = await repo.countActiveRegistrationsByCompetition(comp.id);
        return sendJson(res, 200, {
          competition: {
            id: comp.id,
            slug: comp.slug,
            name: comp.name,
            fee: comp.fee,
            is_team: comp.is_team,
            max_team_size: comp.max_team_size,
            max_quota: comp.max_quota,
            registered_count: count,
            reg_open_at: comp.reg_open_at,
            reg_close_at: comp.reg_close_at,
            submission_deadline: comp.submission_deadline,
            guidebook_url: comp.guidebook_url,
            is_open: isWithinRegistrationPeriod(comp) && count < comp.max_quota,
          },
        });
      }

      // ════════════════════════════════════════════════════════════════
      // A2. PUBLIC NEWS ARTICLES
      // ════════════════════════════════════════════════════════════════
      if (method === 'GET' && pathname === '/api/news') {
        const showOnHomeOnly = url.searchParams.get('home') === 'true';
        const articles = repo.listNewsArticles
          ? await repo.listNewsArticles({ publishedOnly: true, showOnHomeOnly })
          : [];
        return sendJson(res, 200, { articles });
      }

      const newsSlugMatch = pathname.match(/^\/api\/news\/([a-z0-9-]+)$/i);
      if (method === 'GET' && newsSlugMatch) {
        const article = repo.getNewsArticleBySlug ? await repo.getNewsArticleBySlug(newsSlugMatch[1]) : null;
        if (!article || !article.is_published) {
          return sendError(res, 404, 'NEWS_NOT_FOUND', 'Berita tidak ditemukan.');
        }
        return sendJson(res, 200, { article });
      }

      // ════════════════════════════════════════════════════════════════
      // B. AUTHENTICATION (Email + Password & Google OAuth untuk PESERTA)
      // ════════════════════════════════════════════════════════════════
      if (method === 'POST' && pathname === '/api/auth/google') {
        const body = await readJsonBody(req);
        const credential = String(body.credential || '').trim();
        if (!credential) {
          return sendError(res, 422, 'MISSING_CREDENTIAL', 'Token Google wajib dikirim.');
        }
        try {
          const googleProfile = await verifyGoogleToken(credential, config.googleClientId);
          let targetUser;
          let isNewUser = false;
          if (repo.pool) {
            targetUser = await upsertGoogleUser(repo.pool, googleProfile);
            isNewUser = Boolean(targetUser._is_new_user);
          } else {
            const existing = await repo.findUserByEmail(googleProfile.email);
            if (existing) {
              if (existing.role !== 'PESERTA') {
                return sendError(
                  res,
                  403,
                  'GOOGLE_PESERTA_ONLY',
                  'Login Google hanya tersedia untuk peserta. Akun panitia/juri wajib menggunakan email dan kata sandi.'
                );
              }
              if (existing.status === 'SUSPENDED') {
                return sendError(res, 403, 'ACCOUNT_SUSPENDED', 'Akun Anda ditangguhkan oleh SuperAdmin.');
              }
              targetUser = await repo.updateUser(existing.id, {
                google_id: googleProfile.googleId,
                avatar_url: googleProfile.avatarUrl,
              });
            } else {
              targetUser = await repo.createUser({
                email: googleProfile.email,
                password_hash: null,
                name: googleProfile.name,
                role: 'PESERTA',
                status: 'ACTIVE',
                google_id: googleProfile.googleId,
                avatar_url: googleProfile.avatarUrl,
                privacy_accepted_at: new Date().toISOString(),
              });
              isNewUser = true;
            }
          }
          if (targetUser.role !== 'PESERTA') {
            return sendError(res, 403, 'GOOGLE_PESERTA_ONLY', 'Login Google hanya tersedia untuk peserta. Akun panitia/juri wajib menggunakan email dan kata sandi.');
          }
          if (targetUser.status === 'SUSPENDED') {
            return sendError(res, 403, 'ACCOUNT_SUSPENDED', 'Akun Anda ditangguhkan oleh SuperAdmin.');
          }
          const profile = await repo.getProfile(targetUser.id);
          const cookie = await createUserSessionCookie(targetUser);
          return sendJson(
            res,
            200,
            {
              user: sanitizeUser(targetUser),
              is_new_user: isNewUser,
              profile_complete: isParticipantProfileComplete(profile),
            },
            { 'Set-Cookie': cookie }
          );
        } catch (err) {
          return sendError(
            res,
            err.status || 401,
            err.code || 'GOOGLE_AUTH_FAILED',
            err.message || 'Autentikasi Google gagal.'
          );
        }
      }
      if (method === 'POST' && pathname === '/api/auth/register') {
        return sendError(
          res,
          410,
          'REGISTRATION_GOOGLE_ONLY',
          'Registrasi peserta dengan kata sandi telah ditutup. Silakan daftar menggunakan akun Google.'
        );
      }

      if (method === 'POST' && pathname === '/api/auth/login') {
        const body = await readJsonBody(req);
        const email = normalizeEmail(body.email);
        const password = typeof body.password === 'string' ? body.password : '';

        const found = await repo.findUserByEmail(email);
        if (found && !STAFF_ROLES.has(found.role)) {
          return sendError(
            res,
            403,
            'STAFF_PASSWORD_LOGIN_ONLY',
            'Login kata sandi hanya tersedia untuk panitia dan juri. Peserta wajib masuk menggunakan Google.'
          );
        }
        if (!found || !verifyPassword(password, found.password_hash)) {
          return sendError(res, 401, 'INVALID_CREDENTIALS', 'Email atau kata sandi salah.');
        }
        if (found.status === 'SUSPENDED') {
          return sendError(res, 403, 'ACCOUNT_SUSPENDED', 'Akun Anda sedang ditangguhkan oleh SuperAdmin.');
        }

        const cookie = await createUserSessionCookie(found);
        return sendJson(res, 200, { user: sanitizeUser(found) }, { 'Set-Cookie': cookie });
      }

      if (method === 'GET' && pathname === '/api/auth/me') {
        if (!requireLogin()) return;
        const profile = user.role === 'PESERTA' ? await repo.getProfile(user.id) : null;
        return sendJson(res, 200, {
          user: sanitizeUser(user),
          profile_complete: isParticipantProfileComplete(profile),
        });
      }

      if (method === 'POST' && pathname === '/api/auth/logout') {
        if (auth?.tokenHash) {
          await repo.deleteSession(auth.tokenHash);
        }
        return sendJson(
          res,
          200,
          { ok: true },
          { 'Set-Cookie': clearSessionCookie(config.sessionCookieName, config) }
        );
      }

      if (method === 'PATCH' && pathname === '/api/auth/password') {
        if (!requireRoles(['ADMIN', 'JURI', 'SUPERADMIN'])) return;
        const body = await readJsonBody(req);
        if (!verifyPassword(String(body.current_password || ''), user.password_hash)) {
          return sendError(res, 401, 'WRONG_CURRENT_PASSWORD', 'Kata sandi saat ini tidak cocok.');
        }
        if (!isValidPassword(body.new_password)) {
          return sendError(res, 422, 'WEAK_PASSWORD', 'Kata sandi baru minimal 8 karakter dengan huruf dan angka.');
        }
        await repo.updateUser(user.id, { password_hash: hashPassword(body.new_password) });
        await repo.deleteSessionsByUserId(user.id);
        const cookie = await createUserSessionCookie(user);
        return sendJson(res, 200, { ok: true }, { 'Set-Cookie': cookie });
      }

      if (method === 'POST' && pathname === '/api/auth/forgot-password') {
        const body = await readJsonBody(req);
        const email = normalizeEmail(body.email);
        const found = isValidEmail(email) ? await repo.findUserByEmail(email) : null;

        // Anti user-enumeration & batasi pemulihan kata sandi khusus akun staf
        if (found && found.status === 'ACTIVE' && STAFF_ROLES.has(found.role)) {
          const rawResetToken = crypto.randomBytes(24).toString('hex');
          const resetHash = hashToken(rawResetToken);
          const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
          await repo.updateUser(found.id, {
            reset_token_hash: resetHash,
            reset_token_expires_at: expiresAt,
          });
          await repo.enqueueEmail({
            to_email: found.email,
            template: 'PASSWORD_RESET',
            payload: { name: found.name, reset_token: rawResetToken, expires_at: expiresAt },
          });
        }
        return sendJson(res, 200, {
          message: 'Jika email terdaftar, instruksi reset kata sandi telah dikirim.',
        });
      }

      if (method === 'POST' && pathname === '/api/auth/reset-password') {
        const body = await readJsonBody(req);
        const token = String(body.token || '').trim();
        if (!token || !isValidPassword(body.new_password)) {
          return sendError(res, 422, 'INVALID_RESET_PAYLOAD', 'Token atau format kata sandi baru tidak valid.');
        }
        const found = await repo.findUserByResetTokenHash(hashToken(token));
        if (
          !found ||
          !STAFF_ROLES.has(found.role) ||
          found.status !== 'ACTIVE' ||
          !found.reset_token_expires_at ||
          new Date(found.reset_token_expires_at).getTime() <= Date.now()
        ) {
          return sendError(res, 400, 'INVALID_OR_EXPIRED_TOKEN', 'Token reset tidak valid atau sudah kedaluwarsa.');
        }
        await repo.updateUser(found.id, {
          password_hash: hashPassword(body.new_password),
          reset_token_hash: null,
          reset_token_expires_at: null,
        });
        await repo.deleteSessionsByUserId(found.id);
        return sendJson(res, 200, { ok: true, message: 'Kata sandi berhasil diperbarui. Silakan login kembali.' });
      }

      // ════════════════════════════════════════════════════════════════
      // C. PARTICIPANT PROFILE & STUDENT CARD
      // ════════════════════════════════════════════════════════════════
      if (method === 'GET' && pathname === '/api/profile') {
        if (!requireRoles(['PESERTA'])) return;
        const profile = await repo.getProfile(user.id);
        return sendJson(res, 200, {
          profile: profile
            ? {
                full_name: profile.full_name,
                institution: profile.institution,
                phone_wa: profile.phone_wa,
                nim: profile.nim || null,
                has_student_card: Boolean(profile.student_card_drive_id || profile.student_card_path),
                updated_at: profile.updated_at,
              }
            : null,
        });
      }

      if (method === 'PUT' && pathname === '/api/profile') {
        if (!requireRoles(['PESERTA'])) return;
        const body = await readJsonBody(req);
        const full_name = sanitizePlainText(body.full_name, 150);
        const institution = sanitizePlainText(body.institution, 180);
        const nim = sanitizePlainText(body.nim || '', 50) || null;
        const rawPhone = String(body.phone_wa || '').trim();

        if (full_name.length < 2 || containsHtmlTags(full_name)) {
          return sendError(res, 422, 'INVALID_FULL_NAME', 'Nama lengkap tidak valid.');
        }
        if (institution.length < 2 || containsHtmlTags(institution)) {
          return sendError(res, 422, 'INVALID_INSTITUTION', 'Nama institusi tidak valid.');
        }
        if (!isValidPhoneWa(rawPhone)) {
          return sendError(res, 422, 'INVALID_PHONE', 'Nomor HP/WhatsApp Indonesia tidak valid (contoh: 081234567890).');
        }

        const saved = await repo.upsertProfile(user.id, {
          full_name,
          institution,
          nim,
          phone_wa: normalizePhoneWa(rawPhone),
        });
        return sendJson(res, 200, {
          profile: {
            full_name: saved.full_name,
            institution: saved.institution,
            phone_wa: saved.phone_wa,
            nim: saved.nim || null,
            has_student_card: Boolean(saved.student_card_drive_id || saved.student_card_path),
            updated_at: saved.updated_at,
          },
        });
      }

      if (method === 'POST' && pathname === '/api/profile/student-card') {
        if (!requireRoles(['PESERTA'])) return;
        const { files } = await parseMultipartFormData(req, config.maxUploadBytes + 64 * 1024);
        const uploaded = files.file || files.student_card;
        if (!uploaded) {
          return sendError(res, 422, 'MISSING_FILE', 'Field berkas "file" wajib diisi.');
        }
        const savedFile = await savePrivateFile({
          buffer: uploaded.buffer,
          uploadDir: config.uploadDir,
          subFolder: 'student-cards',
          maxBytes: config.maxUploadBytes,
        });
        let driveId = null;
        if (hasDriveConfigured(config)) {
          try {
            const activeReg = await repo.findActiveRegistrationByUserId(user.id);
            const profile = await repo.getProfile(user.id);
            const targetFolderId = activeReg?.drive_folder_id || config.googleDriveRootFolderId;
            const driveRes = await uploadFileToDrive({
              ...getDriveAuth(config),
              folderId: targetFolderId,
              fileBuffer: uploaded.buffer,
              originalName: `KTM_${(profile?.full_name || user.name || user.id).replace(/\s+/g, '_')}.${savedFile.ext}`,
              mimeType: savedFile.mime,
            });
            driveId = driveRes.fileId;
          } catch (driveErr) {
            console.error('[DRIVE KTM UPLOAD ERROR]', driveErr.message);
          }
        }
        await repo.upsertProfile(user.id, {
          student_card_path: savedFile.relativePath,
          ...(driveId ? { student_card_drive_id: driveId } : {}),
        });
        return sendJson(res, 201, { ok: true, mime: savedFile.mime, size: savedFile.size });
      }

      if (method === 'GET' && pathname === '/api/profile/student-card') {
        if (!requireRoles(['PESERTA'])) return;
        const profile = await repo.getProfile(user.id);
        if (!profile || !(profile.student_card_drive_id || profile.student_card_path)) {
          return sendError(res, 404, 'FILE_NOT_FOUND', 'Berkas KTM belum diunggah.');
        }
        if (profile.student_card_drive_id && hasDriveConfigured(config)) {
          await streamFileFromDrive({ ...getDriveAuth(config), fileId: profile.student_card_drive_id, res });
          return;
        }
        const fileData = await readPrivateFile(config.uploadDir, profile.student_card_path);
        res.writeHead(200, {
          'Content-Type': fileData.mime,
          'Content-Disposition': `attachment; filename="ktm-${user.id}.${fileData.filename.split('.').pop()}"`,
          'Cache-Control': 'private, no-store',
        });
        res.end(fileData.buffer);
        return;
      }

      // ════════════════════════════════════════════════════════════════
      // D. PARTICIPANT REGISTRATIONS, PAYMENT PROOF & SUBMISSIONS
      // ════════════════════════════════════════════════════════════════
      if (method === 'POST' && pathname === '/api/registrations') {
        // BR-12: Admin & SuperAdmin tidak boleh mendaftar lomba
        if (!requireRoles(['PESERTA'])) return;

        const profile = await repo.getProfile(user.id);
        if (!profile || !profile.full_name || !profile.institution || !profile.phone_wa || !(profile.student_card_drive_id || profile.student_card_path)) {
          return sendError(res, 422, 'INCOMPLETE_PROFILE', 'Lengkapi biodata dan unggah KTM terlebih dahulu.');
        }

        const body = await readJsonBody(req);
        const comp = body.competition_slug
          ? await repo.findCompetitionBySlug(String(body.competition_slug))
          : isValidUuid(body.competition_id)
            ? await repo.findCompetitionById(body.competition_id)
            : null;

        if (!comp) {
          return sendError(res, 404, 'COMPETITION_NOT_FOUND', 'Cabang lomba tidak ditemukan.');
        }
        // BR-02: cek aktif & periode buka
        if (!isWithinRegistrationPeriod(comp)) {
          return sendError(res, 403, 'REGISTRATION_CLOSED', 'Periode pendaftaran untuk lomba ini sedang ditutup.');
        }

        let teamName = null;
        let teamMembers = [];
        if (comp.is_team) {
          teamName = sanitizePlainText(body.team_name, 120);
          if (teamName.length < 2 || containsHtmlTags(teamName)) {
            return sendError(res, 422, 'INVALID_TEAM_NAME', 'Nama tim wajib diisi untuk lomba kelompok.');
          }
          const rawMembers = Array.isArray(body.team_members) ? body.team_members : [];
          // Ketua (pemilik akun) = 1 orang, sehingga anggota tambahan maksimal max_team_size - 1
          if (rawMembers.length < 1 || rawMembers.length > comp.max_team_size - 1) {
            return sendError(
              res,
              422,
              'INVALID_TEAM_SIZE',
              `Jumlah anggota tim (selain ketua) harus antara 1 sampai ${comp.max_team_size - 1} orang.`
            );
          }
          for (const m of rawMembers) {
            const fn = sanitizePlainText(m?.full_name, 150);
            const inst = sanitizePlainText(m?.institution, 180);
            const wa = String(m?.phone_wa || '').trim();
            const nim = sanitizePlainText(m?.nim || '', 50) || null;
            if (fn.length < 2 || inst.length < 2 || !isValidPhoneWa(wa)) {
              return sendError(res, 422, 'INVALID_TEAM_MEMBER', 'Data anggota tim tidak lengkap atau nomor WA tidak valid.');
            }
            teamMembers.push({ full_name: fn, institution: inst, phone_wa: normalizePhoneWa(wa), nim });
          }
        }

        try {
          const created = await repo.createRegistrationAtomic({
            user_id: user.id,
            competition: comp,
            team_name: teamName,
            team_members: teamMembers,
            actor_id: user.id,
          });
          if (hasDriveConfigured(config)) {
            try {
              const { teamFolderId } = await ensureRegistrationFolder({
                ...getDriveAuth(config),
                rootFolderId: config.googleDriveRootFolderId,
                competition: comp.slug || comp.name,
                registrationCode: created.registration_code,
                teamName: teamName || profile.full_name,
                institution: profile.institution,
              });
              await repo.updateRegistration(created.id, { drive_folder_id: teamFolderId });
              created.drive_folder_id = teamFolderId;
            } catch (driveErr) {
              console.error('[DRIVE FOLDER ERROR]', driveErr.message);
            }
          }
          await repo.enqueueEmail({
            to_email: user.email,
            template: 'REGISTRATION_RECEIVED',
            payload: { registration_code: created.registration_code, competition_name: comp.name },
          });
          return sendJson(res, 201, { registration: serializeRegistrationForParticipant(created) });
        } catch (err) {
          if (err.code === 'BR01_DUPLICATE_ACTIVE') {
            return sendError(res, 409, 'REGISTRATION_ALREADY_EXISTS', 'Anda sudah memiliki pendaftaran lomba yang aktif.');
          }
          if (err.code === 'QUOTA_EXCEEDED') {
            return sendError(res, 409, 'QUOTA_EXCEEDED', err.message);
          }
          throw err;
        }
      }

      if (method === 'GET' && pathname === '/api/registrations/me') {
        if (!requireRoles(['PESERTA'])) return;
        const reg = await repo.findActiveRegistrationByUserId(user.id);
        return sendJson(res, 200, { registration: serializeRegistrationForParticipant(reg) });
      }

      if (method === 'PUT' && pathname === '/api/registrations/me') {
        if (!requireRoles(['PESERTA'])) return;
        const reg = await repo.findActiveRegistrationByUserId(user.id);
        if (!reg) return sendError(res, 404, 'REGISTRATION_NOT_FOUND', 'Belum ada pendaftaran aktif.');
        if (reg.status !== 'DITOLAK') {
          return sendError(res, 409, 'REVISION_NOT_ALLOWED', 'Revisi hanya diizinkan saat status pendaftaran DITOLAK.');
        }
        // BR-02 & BR-07: periode masih buka
        if (!isWithinRegistrationPeriod(reg.competition)) {
          return sendError(res, 403, 'REGISTRATION_CLOSED', 'Periode pendaftaran sudah tutup sehingga tidak dapat merevisi.');
        }

        const body = await readJsonBody(req);
        const patch = { status: 'MENUNGGU_VERIFIKASI', reject_reason: null };
        let teamMembers;
        if (reg.competition.is_team) {
          if (body.team_name !== undefined) {
            const tn = sanitizePlainText(body.team_name, 120);
            if (tn.length < 2 || containsHtmlTags(tn)) {
              return sendError(res, 422, 'INVALID_TEAM_NAME', 'Nama tim tidak valid.');
            }
            patch.team_name = tn;
          }
          if (Array.isArray(body.team_members)) {
            if (body.team_members.length < 1 || body.team_members.length > reg.competition.max_team_size - 1) {
              return sendError(res, 422, 'INVALID_TEAM_SIZE', 'Jumlah anggota tim tidak sesuai batas.');
            }
            teamMembers = [];
            for (const m of body.team_members) {
              const fn = sanitizePlainText(m?.full_name, 150);
              const inst = sanitizePlainText(m?.institution, 180);
              const wa = String(m?.phone_wa || '').trim();
              const nim = sanitizePlainText(m?.nim || '', 50) || null;
              if (fn.length < 2 || inst.length < 2 || containsHtmlTags(fn) || containsHtmlTags(inst) || !isValidPhoneWa(wa)) {
                return sendError(res, 422, 'INVALID_TEAM_MEMBER', 'Data anggota tim tidak lengkap atau nomor WA tidak valid.');
              }
              teamMembers.push({ full_name: fn, institution: inst, phone_wa: normalizePhoneWa(wa), nim });
            }
          }
        }

        const updated = await repo.updateRegistration(reg.id, patch, {
          team_members: teamMembers,
          status_log: {
            from_status: 'DITOLAK',
            to_status: 'MENUNGGU_VERIFIKASI',
            changed_by: user.id,
            note: 'Peserta mengirim revisi data pendaftaran',
          },
        });
        return sendJson(res, 200, { registration: serializeRegistrationForParticipant(updated) });
      }

      if (method === 'DELETE' && pathname === '/api/registrations/me') {
        if (!requireRoles(['PESERTA'])) return;
        const reg = await repo.findActiveRegistrationByUserId(user.id);
        if (!reg) return sendError(res, 404, 'REGISTRATION_NOT_FOUND', 'Belum ada pendaftaran aktif.');
        if (!canTransitionStatus(reg.status, 'DIBATALKAN', 'PESERTA')) {
          return sendError(
            res,
            409,
            'CANCEL_NOT_ALLOWED',
            'Pendaftaran yang sudah terverifikasi tidak dapat dibatalkan sendiri. Hubungi panitia.'
          );
        }

        const updated = await repo.updateRegistration(
          reg.id,
          { status: 'DIBATALKAN' },
          {
            status_log: {
              from_status: reg.status,
              to_status: 'DIBATALKAN',
              changed_by: user.id,
              note: 'Dibatalkan oleh peserta',
            },
          }
        );
        return sendJson(res, 200, { ok: true, status: updated.status });
      }

      if (method === 'POST' && pathname === '/api/registrations/me/payment-proof') {
        if (!requireRoles(['PESERTA'])) return;
        const reg = await repo.findActiveRegistrationByUserId(user.id);
        if (!reg) return sendError(res, 404, 'REGISTRATION_NOT_FOUND', 'Belum ada pendaftaran aktif.');
        if (!['MENUNGGU_VERIFIKASI', 'DITOLAK'].includes(reg.status)) {
          return sendError(res, 409, 'PAYMENT_UPLOAD_LOCKED', 'Bukti bayar tidak dapat diubah setelah terverifikasi.');
        }

        const { fields, files } = await parseMultipartFormData(req, config.maxUploadBytes + 64 * 1024);
        const uploaded = files.file || files.payment_proof;
        if (!uploaded) {
          return sendError(res, 422, 'MISSING_FILE', 'Field berkas bukti bayar wajib diisi.');
        }
        const savedFile = await savePrivateFile({
          buffer: uploaded.buffer,
          uploadDir: config.uploadDir,
          subFolder: 'payment-proofs',
          maxBytes: config.maxUploadBytes,
        });

        const patch = {
          payment_proof_path: savedFile.relativePath,
          payment_sender_name: sanitizePlainText(fields.sender_name || '', 100) || null,
          payment_date: sanitizePlainText(fields.payment_date || '', 50) || null,
        };

        if (hasDriveConfigured(config)) {
          try {
            let folderId = reg.drive_folder_id;
            if (!folderId) {
              const { teamFolderId } = await ensureRegistrationFolder({
                ...getDriveAuth(config),
                rootFolderId: config.googleDriveRootFolderId,
                competition: reg.competition?.slug || reg.competition?.name || 'lomba',
                registrationCode: reg.registration_code,
                teamName: reg.team_name || reg.profile?.full_name || user.name,
                institution: reg.profile?.institution || '',
              });
              folderId = teamFolderId;
              patch.drive_folder_id = folderId;
            }
            const driveRes = await uploadFileToDrive({
              ...getDriveAuth(config),
              folderId,
              fileBuffer: uploaded.buffer,
              originalName: `BuktiBayar_${reg.registration_code}.${savedFile.ext}`,
              mimeType: savedFile.mime,
            });
            patch.payment_proof_drive_id = driveRes.fileId;
          } catch (driveErr) {
            console.error('[DRIVE PAYMENT UPLOAD ERROR]', driveErr.message);
          }
        }

        await repo.updateRegistration(reg.id, patch);
        return sendJson(res, 201, { ok: true, mime: savedFile.mime, size: savedFile.size });
      }

      if (method === 'GET' && pathname === '/api/registrations/me/submissions') {
        if (!requireRoles(['PESERTA'])) return;
        const reg = await repo.findActiveRegistrationByUserId(user.id);
        if (!reg) return sendError(res, 404, 'REGISTRATION_NOT_FOUND', 'Belum ada pendaftaran aktif.');
        const subs = await repo.listSubmissionsByRegistration(reg.id);
        return sendJson(res, 200, { submissions: subs });
      }

      if (method === 'POST' && pathname === '/api/registrations/me/submissions') {
        if (!requireRoles(['PESERTA'])) return;
        const reg = await repo.findActiveRegistrationByUserId(user.id);
        if (!reg) return sendError(res, 404, 'REGISTRATION_NOT_FOUND', 'Belum ada pendaftaran aktif.');
        if (!isGroupLinkEligible(reg.status)) {
          return sendError(res, 403, 'NOT_VERIFIED', 'Pengumpulan karya hanya terbuka bagi peserta yang sudah terverifikasi.');
        }
        // BR-04: cek submission_deadline
        if (Date.now() > new Date(reg.competition.submission_deadline).getTime()) {
          return sendError(res, 403, 'SUBMISSION_DEADLINE_PASSED', 'Batas waktu pengumpulan karya telah berakhir.');
        }

        const existingSubs = await repo.listSubmissionsByRegistration(reg.id);
        if (existingSubs.some((s) => s.is_final)) {
          return sendError(res, 409, 'SUBMISSION_FINALIZED', 'Karya sudah dikunci (final) dan tidak dapat diubah lagi.');
        }
        if (existingSubs.length >= 2) {
          return sendError(res, 409, 'SUBMISSION_LIMIT_REACHED', 'Batas maksimal unggah karya (2 versi) telah tercapai.');
        }

        const contentType = req.headers['content-type'] || '';
        let title = null;
        let link_url = null;
        let file_path = null;
        let drive_file_id = null;
        let drive_view_url = null;
        let description = null;

        if (contentType.includes('multipart/form-data')) {
          const { fields, files } = await parseMultipartFormData(req, config.maxUploadBytes + 64 * 1024);
          title = sanitizePlainText(fields.title || '', 200) || null;
          description = sanitizePlainText(fields.description || '', 1000) || null;
          const uploaded = files.file;
          if (!uploaded) return sendError(res, 422, 'MISSING_FILE', 'Berkas karya wajib dilampirkan.');
          const saved = await savePrivateFile({
            buffer: uploaded.buffer,
            uploadDir: config.uploadDir,
            subFolder: 'submissions',
            maxBytes: config.maxUploadBytes,
          });
          file_path = saved.relativePath;

          if (hasDriveConfigured(config)) {
            try {
              let folderId = reg.drive_folder_id;
              if (!folderId) {
                const { teamFolderId } = await ensureRegistrationFolder({
                  ...getDriveAuth(config),
                  rootFolderId: config.googleDriveRootFolderId,
                  competition: reg.competition?.slug || reg.competition?.name || 'lomba',
                  registrationCode: reg.registration_code,
                  teamName: reg.team_name || reg.profile?.full_name || user.name,
                  institution: reg.profile?.institution || '',
                });
                folderId = teamFolderId;
                await repo.updateRegistration(reg.id, { drive_folder_id: folderId });
              }
              const nextVer = existingSubs.length + 1;
              const driveRes = await uploadFileToDrive({
                ...getDriveAuth(config),
                folderId,
                fileBuffer: uploaded.buffer,
                originalName: `Karya_v${nextVer}_${reg.registration_code}.${saved.ext}`,
                mimeType: saved.mime,
              });
              drive_file_id = driveRes.fileId;
              drive_view_url = driveRes.webViewLink;
            } catch (driveErr) {
              console.error('[DRIVE SUBMISSION UPLOAD ERROR]', driveErr.message);
            }
          }
        } else {
          const body = await readJsonBody(req);
          title = sanitizePlainText(body.title || '', 200);
          link_url = String(body.link_url || '').trim();
          description = sanitizePlainText(body.description || '', 1000) || null;
          if (!title || containsHtmlTags(title)) {
            return sendError(res, 422, 'INVALID_TITLE', 'Judul karya wajib diisi dan bebas HTML.');
          }
          if (!isValidHttpUrl(link_url)) {
            return sendError(res, 422, 'INVALID_URL', 'Tautan karya harus berupa URL http/https yang valid.');
          }
        }

        const created = await repo.createSubmission({
          registration_id: reg.id,
          title,
          file_path,
          drive_file_id,
          drive_view_url,
          link_url,
          description,
        });
        return sendJson(res, 201, { submission: created });
      }

      const subFinalizeMatch = pathname.match(/^\/api\/registrations\/me\/submissions\/([^/]+)\/finalize$/);
      if (method === 'POST' && subFinalizeMatch) {
        if (!requireRoles(['PESERTA'])) return;
        const reg = await repo.findActiveRegistrationByUserId(user.id);
        if (!reg) return sendError(res, 404, 'REGISTRATION_NOT_FOUND', 'Belum ada pendaftaran aktif.');
        const subId = subFinalizeMatch[1];
        const sub = isValidUuid(subId) ? await repo.findSubmissionById(subId) : null;
        if (!sub || sub.registration_id !== reg.id) {
          return sendError(res, 404, 'SUBMISSION_NOT_FOUND', 'Karya tidak ditemukan.');
        }
        const finalized = repo.finalizeSubmission ? await repo.finalizeSubmission(sub.id) : sub;
        return sendJson(res, 200, { submission: finalized });
      }

      if (method === 'GET' && pathname === '/api/announcements') {
        if (!requireRoles(['PESERTA'])) return;
        const reg = await repo.findActiveRegistrationByUserId(user.id);
        const list = await repo.listAnnouncements({
          competitionId: reg ? reg.competition_id : null,
          publishedOnly: true,
        });
        return sendJson(res, 200, { announcements: list });
      }

      // ════════════════════════════════════════════════════════════════
      // E. ADMIN ENDPOINTS (ADMIN & SUPERADMIN)
      // ════════════════════════════════════════════════════════════════
      if (method === 'GET' && pathname === '/api/admin/summary') {
        if (!requireRoles(['ADMIN', 'SUPERADMIN'])) return;
        if (typeof repo.getAdminSummary === 'function') {
          const summary = await repo.getAdminSummary(REGISTRATION_STATUSES);
          return sendJson(res, 200, summary);
        }
        const all = await repo.listRegistrations({ page: 1, pageSize: 5000 });
        const byStatus = {};
        const byCompetition = {};
        for (const s of REGISTRATION_STATUSES) byStatus[s] = 0;
        for (const r of all.items) {
          byStatus[r.status] = (byStatus[r.status] || 0) + 1;
          const cname = r.competition?.name || r.competition_id;
          byCompetition[cname] = (byCompetition[cname] || 0) + 1;
        }
        const oldestPending = all.items
          .filter((r) => r.status === 'MENUNGGU_VERIFIKASI')
          .sort((a, b) => a.created_at.localeCompare(b.created_at))
          .slice(0, 10)
          .map((r) => ({ id: r.id, registration_code: r.registration_code, name: r.user?.name, created_at: r.created_at }));

        return sendJson(res, 200, {
          total: all.total,
          by_status: byStatus,
          by_competition: byCompetition,
          oldest_pending: oldestPending,
        });
      }

      if (method === 'GET' && pathname === '/api/admin/registrations') {
        if (!requireRoles(['ADMIN', 'SUPERADMIN'])) return;
        const competitionId = url.searchParams.get('competition') || undefined;
        const status = url.searchParams.get('status') || undefined;
        const q = url.searchParams.get('q') || undefined;
        const page = Math.max(1, Number(url.searchParams.get('page') || 1));
        const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('page_size') || 20)));
        const data = await repo.listRegistrations({ competitionId, status, q, page, pageSize });
        return sendJson(res, 200, data);
      }

      const adminRegDetailMatch = pathname.match(/^\/api\/admin\/registrations\/([^/]+)$/);
      if (method === 'GET' && adminRegDetailMatch) {
        if (!requireRoles(['ADMIN', 'SUPERADMIN'])) return;
        const regId = adminRegDetailMatch[1];
        if (!isValidUuid(regId)) return sendError(res, 404, 'REGISTRATION_NOT_FOUND', 'Pendaftaran tidak ditemukan.');
        const reg = await repo.hydrateRegistration(regId);
        if (!reg) return sendError(res, 404, 'REGISTRATION_NOT_FOUND', 'Pendaftaran tidak ditemukan.');
        const dupPhoneCount = reg.profile?.phone_wa
          ? await repo.countDuplicatePhone(reg.profile.phone_wa, reg.user_id)
          : 0;
        return sendJson(res, 200, {
          registration: reg,
          warnings: dupPhoneCount > 0 ? [`Nomor WhatsApp sama dengan ${dupPhoneCount} pendaftar/anggota lain (BR-13).`] : [],
        });
      }

      const adminStatusMatch = pathname.match(/^\/api\/admin\/registrations\/([^/]+)\/status$/);
      if (method === 'PATCH' && adminStatusMatch) {
        if (!requireRoles(['ADMIN', 'SUPERADMIN'])) return;
        const regId = adminStatusMatch[1];
        const reg = isValidUuid(regId) ? await repo.hydrateRegistration(regId) : null;
        if (!reg) return sendError(res, 404, 'REGISTRATION_NOT_FOUND', 'Pendaftaran tidak ditemukan.');

        const body = await readJsonBody(req);
        const toStatus = String(body.status || '');
        const reason = sanitizePlainText(body.reason || body.note || '', 500);

        if (!REGISTRATION_STATUSES.includes(toStatus)) {
          return sendError(res, 422, 'INVALID_STATUS', 'Nilai status tidak dikenal.');
        }
        if (!canTransitionStatus(reg.status, toStatus, user.role)) {
          return sendError(
            res,
            409,
            'INVALID_STATUS_TRANSITION',
            `Perpindahan status dari ${reg.status} ke ${toStatus} tidak diizinkan.`
          );
        }
        if (toStatus === 'DITOLAK' && reason.length < 3) {
          return sendError(res, 422, 'REJECT_REASON_REQUIRED', 'Alasan penolakan wajib diisi.');
        }

        const patch = {
          status: toStatus,
          reject_reason: toStatus === 'DITOLAK' ? reason : null,
        };
        if (toStatus === 'TERVERIFIKASI') {
          patch.verified_by = user.id;
          patch.verified_at = new Date().toISOString();
        }

        const updated = await repo.updateRegistration(reg.id, patch, {
          status_log: {
            from_status: reg.status,
            to_status: toStatus,
            changed_by: user.id,
            note: reason || `Status diubah menjadi ${toStatus}`,
          },
        });

        await repo.enqueueEmail({
          to_email: reg.user.email,
          template: `STATUS_${toStatus}`,
          payload: { registration_code: reg.registration_code, status: toStatus, reason },
        });
        return sendJson(res, 200, { registration: updated });
      }

      if (method === 'POST' && pathname === '/api/admin/registrations/bulk-status') {
        if (!requireRoles(['ADMIN', 'SUPERADMIN'])) return;
        const body = await readJsonBody(req);
        const ids = Array.isArray(body.registration_ids) ? body.registration_ids : [];
        const toStatus = String(body.status || '');
        const note = sanitizePlainText(body.note || '', 300);

        if (ids.length === 0 || !REGISTRATION_STATUSES.includes(toStatus) || toStatus === 'DITOLAK') {
          return sendError(res, 422, 'INVALID_BULK_PAYLOAD', 'Daftar ID dan status tujuan yang valid wajib diisi.');
        }

        const updatedIds = [];
        const skipped = [];
        for (const id of ids) {
          const reg = isValidUuid(id) ? await repo.hydrateRegistration(id) : null;
          if (!reg || !canTransitionStatus(reg.status, toStatus, user.role)) {
            skipped.push(id);
            continue;
          }
          const patch = { status: toStatus };
          if (toStatus === 'TERVERIFIKASI') {
            patch.verified_by = user.id;
            patch.verified_at = new Date().toISOString();
          }
          await repo.updateRegistration(reg.id, patch, {
            status_log: {
              from_status: reg.status,
              to_status: toStatus,
              changed_by: user.id,
              note: note || `Bulk update ke ${toStatus}`,
            },
          });
          await repo.enqueueEmail({
            to_email: reg.user.email,
            template: `STATUS_${toStatus}`,
            payload: { registration_code: reg.registration_code, status: toStatus },
          });
          updatedIds.push(reg.id);
        }

        await repo.createAuditLog({
          actor_id: user.id,
          action: 'BULK_STATUS_UPDATE',
          target_type: 'registrations',
          meta: { to_status: toStatus, updated_count: updatedIds.length, skipped_count: skipped.length },
        });
        return sendJson(res, 200, { updated_ids: updatedIds, skipped_ids: skipped });
      }

      const adminFileMatch = pathname.match(/^\/api\/admin\/registrations\/([^/]+)\/files\/(student-card|payment-proof)$/);
      if (method === 'GET' && adminFileMatch) {
        if (!requireRoles(['ADMIN', 'SUPERADMIN'])) return;
        const [, regId, kind] = adminFileMatch;
        const reg = isValidUuid(regId) ? await repo.hydrateRegistration(regId) : null;
        if (!reg) return sendError(res, 404, 'REGISTRATION_NOT_FOUND', 'Pendaftaran tidak ditemukan.');

        const driveId = kind === 'student-card' ? reg.profile?.student_card_drive_id : reg.payment_proof_drive_id;
        if (driveId && hasDriveConfigured(config)) {
          await repo.createAuditLog({
            actor_id: user.id,
            action: 'DOWNLOAD_PRIVATE_FILE',
            target_type: kind,
            target_id: reg.id,
            meta: { registration_code: reg.registration_code, source: 'drive' },
          });
          await streamFileFromDrive({ ...getDriveAuth(config), fileId: driveId, res });
          return;
        }

        const relPath = kind === 'student-card' ? reg.profile?.student_card_path : reg.payment_proof_path;
        if (!relPath) return sendError(res, 404, 'FILE_NOT_FOUND', 'Berkas tidak ditemukan.');

        const fileData = await readPrivateFile(config.uploadDir, relPath);
        await repo.createAuditLog({
          actor_id: user.id,
          action: 'DOWNLOAD_PRIVATE_FILE',
          target_type: kind,
          target_id: reg.id,
          meta: { registration_code: reg.registration_code },
        });

        res.writeHead(200, {
          'Content-Type': fileData.mime,
          'Content-Disposition': `attachment; filename="${kind}-${reg.registration_code}.${fileData.filename.split('.').pop()}"`,
          'Cache-Control': 'private, no-store',
        });
        res.end(fileData.buffer);
        return;
      }

      function ensureJuriAssigned() {
        if (user.role === 'JURI' && !user.assigned_competition_id) {
          sendError(res, 403, 'JURI_NOT_ASSIGNED', 'Akun juri belum ditugaskan ke cabang lomba manapun.');
          return false;
        }
        return true;
      }

      async function ensureJuriCompetitionMatch(registrationId) {
        if (user.role !== 'JURI') return true;
        if (!ensureJuriAssigned()) return false;
        const reg = await repo.hydrateRegistration(registrationId);
        if (!reg || reg.competition_id !== user.assigned_competition_id) {
          sendError(res, 403, 'JURI_WRONG_COMPETITION', 'Juri hanya dapat mengakses karya pada cabang lomba yang ditugaskan.');
          return false;
        }
        return true;
      }

      if (method === 'GET' && pathname === '/api/admin/submissions') {
        if (!requireRoles(['ADMIN', 'SUPERADMIN', 'JURI'])) return;
        if (!ensureJuriAssigned()) return;
        const requestedComp = url.searchParams.get('competition') || undefined;
        const competitionId = user.role === 'JURI' ? user.assigned_competition_id : requestedComp;
        const submissions = await repo.listAllSubmissions({ competitionId });
        return sendJson(res, 200, { submissions });
      }

      if (method === 'GET' && pathname === '/api/admin/leaderboard') {
        if (!requireRoles(['ADMIN', 'SUPERADMIN', 'JURI'])) return;
        if (!ensureJuriAssigned()) return;
        const requestedComp = url.searchParams.get('competition') || undefined;
        const round = url.searchParams.get('round') === 'FINAL' ? 'FINAL' : 'TAHAP_1';
        const competitionId = user.role === 'JURI' ? user.assigned_competition_id : requestedComp;
        const leaderboard = repo.getLeaderboard ? await repo.getLeaderboard({ competitionId, round }) : [];
        return sendJson(res, 200, { leaderboard });
      }

      if (method === 'POST' && pathname === '/api/admin/scores') {
        if (!requireRoles(['ADMIN', 'SUPERADMIN', 'JURI'])) return;
        if (!ensureJuriAssigned()) return;
        const body = await readJsonBody(req);
        const submissionId = String(body.submission_id || '');
        if (!isValidUuid(submissionId)) {
          return sendError(res, 422, 'INVALID_SUBMISSION_ID', 'ID karya tidak valid.');
        }
        const sub = await repo.findSubmissionById(submissionId);
        if (!sub) return sendError(res, 404, 'SUBMISSION_NOT_FOUND', 'Karya tidak ditemukan.');

        if (!(await ensureJuriCompetitionMatch(sub.registration_id))) return;

        const fields = ['score_orisinalitas', 'score_analisis', 'score_inovasi', 'score_sistematika'];
        for (const f of fields) {
          const val = Number(body[f]);
          if (!Number.isFinite(val) || val < 0 || val > 100) {
            return sendError(res, 422, 'INVALID_SCORE', `Nilai ${f} harus antara 0 hingga 100.`);
          }
        }

        const round = body.round === 'FINAL' ? 'FINAL' : 'TAHAP_1';
        const feedback = sanitizePlainText(body.feedback || '', 1500) || null;
        const saved = repo.upsertSubmissionScore
          ? await repo.upsertSubmissionScore({
              submission_id: submissionId,
              jury_id: user.id,
              round,
              score_orisinalitas: body.score_orisinalitas,
              score_analisis: body.score_analisis,
              score_inovasi: body.score_inovasi,
              score_sistematika: body.score_sistematika,
              feedback,
            })
          : null;
        return sendJson(res, 200, { score: saved });
      }

      const adminSubScoresMatch = pathname.match(/^\/api\/admin\/submissions\/([^/]+)\/scores$/);
      if (method === 'GET' && adminSubScoresMatch) {
        if (!requireRoles(['ADMIN', 'SUPERADMIN', 'JURI'])) return;
        if (!ensureJuriAssigned()) return;
        const subId = adminSubScoresMatch[1];
        if (!isValidUuid(subId)) return sendError(res, 404, 'SUBMISSION_NOT_FOUND', 'Karya tidak ditemukan.');
        const sub = await repo.findSubmissionById(subId);
        if (!sub) return sendError(res, 404, 'SUBMISSION_NOT_FOUND', 'Karya tidak ditemukan.');
        if (!(await ensureJuriCompetitionMatch(sub.registration_id))) return;
        const scores = repo.getScoresBySubmission ? await repo.getScoresBySubmission(subId) : [];
        return sendJson(res, 200, { scores });
      }

      const adminSubFileMatch = pathname.match(/^\/api\/admin\/submissions\/([^/]+)\/file$/);
      if (method === 'GET' && adminSubFileMatch) {
        if (!requireRoles(['ADMIN', 'SUPERADMIN', 'JURI'])) return;
        if (!ensureJuriAssigned()) return;
        const sub = isValidUuid(adminSubFileMatch[1]) ? await repo.findSubmissionById(adminSubFileMatch[1]) : null;
        if (!sub) return sendError(res, 404, 'FILE_NOT_FOUND', 'Berkas karya tidak ditemukan.');
        if (!(await ensureJuriCompetitionMatch(sub.registration_id))) return;
        if (sub.drive_file_id && hasDriveConfigured(config)) {
          await repo.createAuditLog({
            actor_id: user.id,
            action: 'DOWNLOAD_SUBMISSION_FILE',
            target_type: 'submission',
            target_id: sub.id,
            meta: { source: 'drive' },
          });
          await streamFileFromDrive({ ...getDriveAuth(config), fileId: sub.drive_file_id, res });
          return;
        }
        if (!sub.file_path) return sendError(res, 404, 'FILE_NOT_FOUND', 'Berkas karya tidak ditemukan.');
        const fileData = await readPrivateFile(config.uploadDir, sub.file_path);
        await repo.createAuditLog({
          actor_id: user.id,
          action: 'DOWNLOAD_SUBMISSION_FILE',
          target_type: 'submission',
          target_id: sub.id,
        });
        res.writeHead(200, {
          'Content-Type': fileData.mime,
          'Content-Disposition': `attachment; filename="submission-${sub.id}.${fileData.filename.split('.').pop()}"`,
          'Cache-Control': 'private, no-store',
        });
        res.end(fileData.buffer);
        return;
      }

      const adminScoreMatch = pathname.match(/^\/api\/admin\/submissions\/([^/]+)\/score$/);
      if (method === 'PATCH' && adminScoreMatch) {
        if (!requireRoles(['ADMIN', 'SUPERADMIN'])) return;
        const subId = adminScoreMatch[1];
        if (!isValidUuid(subId)) return sendError(res, 404, 'SUBMISSION_NOT_FOUND', 'Karya tidak ditemukan.');
        const body = await readJsonBody(req);
        const score = Number(body.score);
        if (!Number.isFinite(score) || score < 0 || score > 100) {
          return sendError(res, 422, 'INVALID_SCORE', 'Skor juri harus berupa angka antara 0 hingga 100.');
        }
        const round = body.round === 'FINAL' ? 'FINAL' : 'TAHAP_1';
        const jury_feedback = sanitizePlainText(body.jury_feedback || '', 1000) || null;
        const updated = await repo.scoreSubmission(subId, { score, jury_feedback, round });
        if (!updated) return sendError(res, 404, 'SUBMISSION_NOT_FOUND', 'Karya tidak ditemukan.');
        return sendJson(res, 200, { submission: updated });
      }

      if (method === 'GET' && pathname === '/api/admin/announcements') {
        if (!requireRoles(['ADMIN', 'SUPERADMIN'])) return;
        const announcements = await repo.listAnnouncements({ publishedOnly: false });
        return sendJson(res, 200, { announcements });
      }

      if (method === 'POST' && pathname === '/api/admin/announcements') {
        if (!requireRoles(['ADMIN', 'SUPERADMIN'])) return;
        const body = await readJsonBody(req);
        const title = sanitizePlainText(body.title, 200);
        const textBody = sanitizePlainText(body.body, 4000);
        // PRD 12.2: Pengumuman admin tidak mengizinkan HTML mentah
        if (title.length < 3 || textBody.length < 3 || containsHtmlTags(title) || containsHtmlTags(textBody)) {
          return sendError(res, 422, 'INVALID_ANNOUNCEMENT', 'Judul/isi pengumuman wajib diisi dan tidak boleh mengandung HTML.');
        }
        const created = await repo.createAnnouncement({
          competition_id: isValidUuid(body.competition_id) ? body.competition_id : null,
          title,
          body: textBody,
          created_by: user.id,
          published_at: body.publish === false ? null : new Date().toISOString(),
          is_pinned: Boolean(body.is_pinned),
        });
        return sendJson(res, 201, { announcement: created });
      }

      const adminAnnMatch = pathname.match(/^\/api\/admin\/announcements\/([^/]+)$/);
      if (method === 'PUT' && adminAnnMatch) {
        if (!requireRoles(['ADMIN', 'SUPERADMIN'])) return;
        const body = await readJsonBody(req);
        const patch = {};
        if (body.title !== undefined) {
          const t = sanitizePlainText(body.title, 200);
          if (t.length < 3 || containsHtmlTags(t)) return sendError(res, 422, 'INVALID_TITLE', 'Judul tidak valid.');
          patch.title = t;
        }
        if (body.body !== undefined) {
          const b = sanitizePlainText(body.body, 4000);
          if (b.length < 3 || containsHtmlTags(b)) return sendError(res, 422, 'INVALID_BODY', 'Isi tidak valid.');
          patch.body = b;
        }
        if (body.publish === true) patch.published_at = new Date().toISOString();
        if (body.publish === false) patch.published_at = null;
        const updated = await repo.updateAnnouncement(adminAnnMatch[1], patch);
        if (!updated) return sendError(res, 404, 'ANNOUNCEMENT_NOT_FOUND', 'Pengumuman tidak ditemukan.');
        return sendJson(res, 200, { announcement: updated });
      }

      if (method === 'DELETE' && adminAnnMatch) {
        if (!requireRoles(['ADMIN', 'SUPERADMIN'])) return;
        const deleted = await repo.deleteAnnouncement(adminAnnMatch[1]);
        if (!deleted) return sendError(res, 404, 'ANNOUNCEMENT_NOT_FOUND', 'Pengumuman tidak ditemukan.');
        return sendJson(res, 200, { ok: true });
      }

      if (method === 'GET' && pathname === '/api/admin/competitions') {
        if (!requireRoles(['ADMIN', 'SUPERADMIN', 'JURI'])) return;
        if (!ensureJuriAssigned()) return;
        const allComps = await repo.listCompetitions({ includeInactive: true });
        const competitions =
          user.role === 'JURI'
            ? allComps.filter((c) => c.id === user.assigned_competition_id)
            : allComps;
        return sendJson(res, 200, { competitions });
      }

      const adminCompMatch = pathname.match(/^\/api\/admin\/competitions\/([^/]+)$/);
      if (method === 'PUT' && adminCompMatch) {
        if (!requireRoles(['ADMIN', 'SUPERADMIN'])) return;
        const compId = adminCompMatch[1];
        if (!isValidUuid(compId)) return sendError(res, 404, 'COMPETITION_NOT_FOUND', 'Lomba tidak ditemukan.');
        const body = await readJsonBody(req);
        const patch = {};
        if (body.fee !== undefined) patch.fee = Math.max(0, Number(body.fee));
        if (body.max_quota !== undefined) patch.max_quota = Math.max(1, Number(body.max_quota));
        if (typeof body.is_team === 'boolean') patch.is_team = body.is_team;
        if (body.max_team_size !== undefined) patch.max_team_size = Math.max(1, Math.min(10, Number(body.max_team_size)));
        if (body.reg_open_at) patch.reg_open_at = String(body.reg_open_at);
        if (body.reg_close_at) patch.reg_close_at = String(body.reg_close_at);
        if (body.submission_deadline) patch.submission_deadline = String(body.submission_deadline);
        if (body.group_url !== undefined) {
          if (body.group_url && !isValidHttpUrl(body.group_url)) {
            return sendError(res, 422, 'INVALID_URL', 'URL grup tidak valid.');
          }
          patch.group_url = body.group_url || null;
        }
        if (body.guidebook_url !== undefined) {
          if (body.guidebook_url && !isValidHttpUrl(body.guidebook_url)) {
            return sendError(res, 422, 'INVALID_URL', 'URL guidebook tidak valid.');
          }
          patch.guidebook_url = body.guidebook_url || null;
        }
        if (typeof body.is_active === 'boolean') patch.is_active = body.is_active;

        const updated = await repo.updateCompetition(compId, patch);
        if (!updated) return sendError(res, 404, 'COMPETITION_NOT_FOUND', 'Lomba tidak ditemukan.');

        await repo.createAuditLog({
          actor_id: user.id,
          action: 'UPDATE_COMPETITION',
          target_type: 'competition',
          target_id: compId,
          meta: patch,
        });
        return sendJson(res, 200, { competition: updated });
      }

      if (method === 'GET' && pathname === '/api/admin/export') {
        if (!requireRoles(['ADMIN', 'SUPERADMIN'])) return;
        const competitionId = url.searchParams.get('competition') || undefined;
        const { items } = await repo.listRegistrations({ competitionId, page: 1, pageSize: 5000 });
        const csvRows = items.map((r) => {
          const latestSub = r.submissions?.[0];
          return {
            registration_code: r.registration_code,
            created_at: r.created_at,
            full_name: r.profile?.full_name,
            user_name: r.user?.name,
            email: r.user?.email,
            institution: r.profile?.institution,
            phone_wa: r.profile?.phone_wa,
            competition_name: r.competition?.name,
            is_team: r.competition?.is_team,
            team_name: r.team_name,
            fee: r.competition?.fee,
            status: r.status,
            latest_submission_title: latestSub?.title,
            latest_submission_link: latestSub?.link_url,
            latest_submission_score: latestSub?.score,
          };
        });
        const csv = buildRegistrationsCsv(csvRows);
        await repo.createAuditLog({
          actor_id: user.id,
          action: 'EXPORT_CSV',
          target_type: 'registrations',
          meta: { competition_id: competitionId || 'ALL', row_count: csvRows.length },
        });

        res.writeHead(200, {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="rekap-digiconomic-2027.csv"',
          'Cache-Control': 'private, no-store',
        });
        res.end(csv);
        return;
      }

      // ════════════════════════════════════════════════════════════════
      // F. SUPERADMIN ENDPOINTS (SUPERADMIN ONLY)
      // ════════════════════════════════════════════════════════════════
      if (method === 'GET' && pathname === '/api/superadmin/demographics') {
        if (!requireRoles(['SUPERADMIN'])) return;
        const demographics = repo.getDemographics ? await repo.getDemographics() : { by_institution: [], by_competition: [], users_by_role: [] };
        return sendJson(res, 200, demographics);
      }

      if (method === 'GET' && pathname === '/api/superadmin/users') {
        if (!requireRoles(['SUPERADMIN'])) return;
        const role = url.searchParams.get('role') || null;
        const q = url.searchParams.get('q') || null;
        const users = repo.listAllUsers ? await repo.listAllUsers({ role, q }) : [];
        return sendJson(res, 200, { users });
      }

      if (method === 'GET' && pathname === '/api/superadmin/admins') {
        if (!requireRoles(['SUPERADMIN'])) return;
        const admins = (await repo.listAdmins()).map(sanitizeUser);
        return sendJson(res, 200, { admins });
      }

      if (method === 'POST' && pathname === '/api/superadmin/admins') {
        if (!requireRoles(['SUPERADMIN'])) return;
        const body = await readJsonBody(req);
        const email = normalizeEmail(body.email);
        const name = sanitizePlainText(body.name, 150);
        const allowedRoles = ['ADMIN', 'SUPERADMIN', 'JURI'];
        const role = allowedRoles.includes(body.role) ? body.role : 'ADMIN';
        const division = sanitizePlainText(body.division || (role === 'JURI' ? 'Dewan Juri' : 'Divisi Acara'), 120);
        const assigned_competition_id = role === 'JURI' && isValidUuid(body.assigned_competition_id) ? body.assigned_competition_id : null;
        const password = body.password;

        if (!isValidEmail(email) || name.length < 2 || !isValidPassword(password)) {
          return sendError(res, 422, 'INVALID_ADMIN_PAYLOAD', 'Email, nama, dan kata sandi awal (min 8 karakter huruf+angka) wajib valid.');
        }

        const existing = await repo.findUserByEmail(email);
        if (existing) {
          return sendError(res, 409, 'EMAIL_EXISTS', 'Email sudah digunakan');
        }
        const adminUser = await repo.createUser({
            email,
            password_hash: hashPassword(password),
            name,
            role,
            division,
            assigned_competition_id,
            status: 'ACTIVE',
            privacy_accepted_at: new Date().toISOString(),
        });
        await repo.upsertAdminInvite({ email, role, invited_by: user.id });
        await repo.createAuditLog({
          actor_id: user.id,
          action: 'CREATE_ADMIN',
          target_type: 'user',
          target_id: adminUser.id,
          meta: { email, role, assigned_competition_id },
        });
        return sendJson(res, 201, { admin: sanitizeUser(adminUser) });
      }

      const superAdminPasswordMatch = pathname.match(/^\/api\/superadmin\/admins\/([^/]+)\/password$/);
      if (method === 'PATCH' && superAdminPasswordMatch) {
        if (!requireRoles(['SUPERADMIN'])) return;
        const targetId = superAdminPasswordMatch[1];
        const target = isValidUuid(targetId) ? await repo.findUserById(targetId) : null;
        if (!target || target.role === 'PESERTA') {
          return sendError(res, 404, 'ADMIN_NOT_FOUND', 'Akun staf tidak ditemukan.');
        }
        const body = await readJsonBody(req);
        if (!isValidPassword(body.new_password)) {
          return sendError(res, 422, 'WEAK_PASSWORD', 'Kata sandi baru minimal 8 karakter dengan huruf dan angka.');
        }
        await repo.updateUser(target.id, { password_hash: hashPassword(body.new_password) });
        await repo.deleteSessionsByUserId(target.id);
        await repo.createAuditLog({
          actor_id: user.id,
          action: 'RESET_STAFF_PASSWORD',
          target_type: 'user',
          target_id: target.id,
          meta: { email: target.email },
        });
        return sendJson(res, 200, { ok: true });
      }

      const superAdminStatusMatch = pathname.match(/^\/api\/superadmin\/admins\/([^/]+)\/status$/);
      if (method === 'PATCH' && superAdminStatusMatch) {
        if (!requireRoles(['SUPERADMIN'])) return;
        const targetId = superAdminStatusMatch[1];
        if (targetId === user.id) {
          return sendError(res, 409, 'CANNOT_SELF_SUSPEND', 'SuperAdmin tidak dapat menangguhkan dirinya sendiri.');
        }
        const target = isValidUuid(targetId) ? await repo.findUserById(targetId) : null;
        if (!target || target.role === 'PESERTA') {
          return sendError(res, 404, 'ADMIN_NOT_FOUND', 'Akun admin tidak ditemukan.');
        }
        const body = await readJsonBody(req);
        const nextStatus = body.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE';
        if (nextStatus === 'SUSPENDED' && target.role === 'SUPERADMIN') {
          const cnt = await repo.countActiveSuperAdmins();
          if (cnt <= 1) return sendError(res, 409, 'LAST_SUPERADMIN', 'Tidak dapat menangguhkan SuperAdmin terakhir.');
        }

        const updated = await repo.updateUser(target.id, { status: nextStatus });
        if (nextStatus === 'SUSPENDED') {
          await repo.deleteSessionsByUserId(target.id);
        }
        await repo.createAuditLog({
          actor_id: user.id,
          action: 'TOGGLE_ADMIN_STATUS',
          target_type: 'user',
          target_id: target.id,
          meta: { status: nextStatus },
        });
        return sendJson(res, 200, { admin: sanitizeUser(updated) });
      }

      const superAdminDeleteMatch = pathname.match(/^\/api\/superadmin\/admins\/([^/]+)$/);
      if (method === 'DELETE' && superAdminDeleteMatch) {
        if (!requireRoles(['SUPERADMIN'])) return;
        const targetId = superAdminDeleteMatch[1];
        if (targetId === user.id) {
          return sendError(res, 409, 'CANNOT_DELETE_SELF', 'SuperAdmin tidak dapat menghapus dirinya sendiri.');
        }
        const target = isValidUuid(targetId) ? await repo.findUserById(targetId) : null;
        if (!target || target.role === 'PESERTA') {
          return sendError(res, 404, 'ADMIN_NOT_FOUND', 'Akun admin tidak ditemukan.');
        }
        if (target.role === 'SUPERADMIN') {
          const cnt = await repo.countActiveSuperAdmins();
          if (cnt <= 1) return sendError(res, 409, 'LAST_SUPERADMIN', 'Tidak dapat menghapus SuperAdmin terakhir.');
        }

        // PRD 4.3: role kembali jadi PESERTA & semua sesi aktif dihapus seketika
        await repo.updateUser(target.id, { role: 'PESERTA' });
        await repo.deleteSessionsByUserId(target.id);
        await repo.createAuditLog({
          actor_id: user.id,
          action: 'REMOVE_ADMIN',
          target_type: 'user',
          target_id: target.id,
          meta: { email: target.email },
        });
        return sendJson(res, 200, { ok: true });
      }

      const superRevertMatch = pathname.match(/^\/api\/superadmin\/registrations\/([^/]+)\/revert$/);
      if (method === 'POST' && superRevertMatch) {
        if (!requireRoles(['SUPERADMIN'])) return;
        const reg = isValidUuid(superRevertMatch[1]) ? await repo.hydrateRegistration(superRevertMatch[1]) : null;
        if (!reg) return sendError(res, 404, 'REGISTRATION_NOT_FOUND', 'Pendaftaran tidak ditemukan.');

        const body = await readJsonBody(req);
        const toStatus = String(body.to_status || '');
        const note = sanitizePlainText(body.note || '', 500);
        if (!REGISTRATION_STATUSES.includes(toStatus) || note.length < 3) {
          return sendError(res, 422, 'INVALID_REVERT', 'Status tujuan dan catatan koreksi wajib diisi.');
        }

        const updated = await repo.updateRegistration(
          reg.id,
          { status: toStatus },
          {
            status_log: {
              from_status: reg.status,
              to_status: toStatus,
              changed_by: user.id,
              note: `[SUPERADMIN REVERT] ${note}`,
            },
          }
        );
        await repo.createAuditLog({
          actor_id: user.id,
          action: 'REVERT_REGISTRATION_STATUS',
          target_type: 'registration',
          target_id: reg.id,
          meta: { from_status: reg.status, to_status: toStatus, note },
        });
        return sendJson(res, 200, { registration: updated });
      }

      const superCancelMatch = pathname.match(/^\/api\/superadmin\/registrations\/([^/]+)\/cancel$/);
      if (method === 'POST' && superCancelMatch) {
        if (!requireRoles(['SUPERADMIN'])) return;
        const reg = isValidUuid(superCancelMatch[1]) ? await repo.hydrateRegistration(superCancelMatch[1]) : null;
        if (!reg) return sendError(res, 404, 'REGISTRATION_NOT_FOUND', 'Pendaftaran tidak ditemukan.');

        const body = await readJsonBody(req);
        const reason = sanitizePlainText(body.reason || '', 500);
        if (reason.length < 5) {
          return sendError(res, 422, 'CANCEL_REASON_REQUIRED', 'Alasan pembatalan hak peserta wajib diisi (min 5 karakter).');
        }

        const updated = await repo.updateRegistration(
          reg.id,
          {
            status: 'DIBATALKAN',
            cancelled_by: user.id,
            cancelled_at: new Date().toISOString(),
            cancel_reason: reason,
          },
          {
            status_log: {
              from_status: reg.status,
              to_status: 'DIBATALKAN',
              changed_by: user.id,
              note: `[SUPERADMIN CANCEL] ${reason}`,
            },
          }
        );
        await repo.createAuditLog({
          actor_id: user.id,
          action: 'CANCEL_PARTICIPANT_RIGHTS',
          target_type: 'registration',
          target_id: reg.id,
          meta: { from_status: reg.status, reason },
        });
        return sendJson(res, 200, { registration: updated });
      }

      if (method === 'GET' && pathname === '/api/superadmin/news') {
        if (!requireRoles(['SUPERADMIN'])) return;
        const articles = repo.listNewsArticles ? await repo.listNewsArticles({ publishedOnly: false }) : [];
        return sendJson(res, 200, { articles });
      }

      if (method === 'POST' && pathname === '/api/superadmin/news') {
        if (!requireRoles(['SUPERADMIN'])) return;
        const body = await readJsonBody(req);
        const title = sanitizePlainText(body.title, 300);
        const rawSlug = String(body.slug || title)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 180);
        if (title.length < 3 || !rawSlug) {
          return sendError(res, 422, 'INVALID_NEWS', 'Judul dan slug berita wajib valid.');
        }
        const allowedCats = ['Pengumuman', 'Kompetisi', 'Technical Meeting', 'UMKM & Edukasi'];
        const category = allowedCats.includes(body.category) ? body.category : 'Pengumuman';
        const article = await repo.createNewsArticle({
          slug: rawSlug,
          title,
          category,
          excerpt: sanitizePlainText(body.excerpt || '', 500),
          content: String(body.content || '').trim(),
          cover_image_url: body.cover_image_url && isValidHttpUrl(body.cover_image_url) ? body.cover_image_url : null,
          show_on_home: Boolean(body.show_on_home),
          is_featured: Boolean(body.is_featured),
          is_published: body.is_published !== false,
          created_by: user.id,
        });
        return sendJson(res, 201, { article });
      }

      const superNewsMatch = pathname.match(/^\/api\/superadmin\/news\/([^/]+)$/);
      if (method === 'PATCH' && superNewsMatch) {
        if (!requireRoles(['SUPERADMIN'])) return;
        const newsId = superNewsMatch[1];
        if (!isValidUuid(newsId)) return sendError(res, 404, 'NEWS_NOT_FOUND', 'Berita tidak ditemukan.');
        const body = await readJsonBody(req);
        const allowedCats = ['Pengumuman', 'Kompetisi', 'Technical Meeting', 'UMKM & Edukasi'];
        const patch = {};
        if (body.title !== undefined) {
          const t = sanitizePlainText(body.title, 300);
          if (t.length < 3) return sendError(res, 422, 'INVALID_NEWS', 'Judul berita minimal 3 karakter.');
          patch.title = t;
        }
        if (body.slug !== undefined) {
          const s = String(body.slug).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 180);
          if (!s) return sendError(res, 422, 'INVALID_NEWS', 'Slug berita tidak valid.');
          patch.slug = s;
        }
        if (body.category !== undefined) {
          if (!allowedCats.includes(body.category)) {
            return sendError(res, 422, 'INVALID_NEWS_CATEGORY', 'Kategori berita tidak valid.');
          }
          patch.category = body.category;
        }
        if (body.excerpt !== undefined) patch.excerpt = sanitizePlainText(body.excerpt, 500);
        if (body.content !== undefined) patch.content = String(body.content);
        if (body.cover_image_url !== undefined) {
          const rawCover = String(body.cover_image_url || '').trim();
          if (rawCover && !isValidHttpUrl(rawCover)) {
            return sendError(res, 422, 'INVALID_URL', 'URL gambar sampul harus berupa tautan http/https yang valid.');
          }
          patch.cover_image_url = rawCover || null;
        }
        if (typeof body.show_on_home === 'boolean') patch.show_on_home = body.show_on_home;
        if (typeof body.is_featured === 'boolean') patch.is_featured = body.is_featured;
        if (typeof body.is_published === 'boolean') {
          patch.is_published = body.is_published;
          patch.published_at = body.is_published ? new Date().toISOString() : null;
        }
        const updated = await repo.updateNewsArticle(newsId, patch);
        if (!updated) return sendError(res, 404, 'NEWS_NOT_FOUND', 'Berita tidak ditemukan.');
        return sendJson(res, 200, { article: updated });
      }

      if (method === 'DELETE' && superNewsMatch) {
        if (!requireRoles(['SUPERADMIN'])) return;
        const newsId = superNewsMatch[1];
        if (!isValidUuid(newsId)) return sendError(res, 404, 'NEWS_NOT_FOUND', 'Berita tidak ditemukan.');
        const ok = await repo.deleteNewsArticle(newsId);
        if (!ok) return sendError(res, 404, 'NEWS_NOT_FOUND', 'Berita tidak ditemukan.');
        return sendJson(res, 200, { ok: true });
      }

      if (method === 'GET' && pathname === '/api/superadmin/audit-logs') {
        if (!requireRoles(['SUPERADMIN'])) return;
        const limit = Math.min(500, Math.max(1, Number(url.searchParams.get('limit') || 100)));
        const logs = await repo.listAuditLogs(limit);
        return sendJson(res, 200, { audit_logs: logs });
      }

      // 404 Fallback
      return sendError(res, 404, 'NOT_FOUND', 'Endpoint tidak ditemukan.');
    } catch (err) {
      const status = err.status || 500;
      const code = err.code || 'INTERNAL_SERVER_ERROR';
      const message = status >= 500 ? 'Terjadi kesalahan internal pada server.' : err.message;
      if (status >= 500) {
        console.error('[API ERROR]', { code, msg: err.message });
      }
      if (!res.headersSent) {
        sendError(res, status, code, message);
      }
    }
  });

  return { server, rateLimiter };
}
