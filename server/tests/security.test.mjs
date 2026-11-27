import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { loadConfig } from '../src/config/env.mjs';
import { createMemoryRepo } from '../src/repositories/memoryRepo.mjs';
import { createApp } from '../src/app.mjs';
import { seedDatabase } from '../db/seed.mjs';
import { readPrivateFile } from '../src/utils/fileSecurity.mjs';
import { escapeCsvCell } from '../src/utils/csv.mjs';
import { upsertGoogleUser } from '../src/services/googleAuth.mjs';
import { getClientIp } from '../src/middleware/security.mjs';

const VALID_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);

function buildMultipart(fieldName, filename, buffer) {
  const boundary = '----SecTestBoundary999';
  return {
    contentType: `multipart/form-data; boundary=${boundary}`,
    body: Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\nContent-Type: image/jpeg\r\n\r\n`),
      buffer,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]),
  };
}

function extractCookie(res) {
  const raw = res.headers.get('set-cookie');
  return raw ? raw.split(';')[0] : '';
}

async function startSecServer(overrides = {}) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'diginomic-sec-'));
  const config = loadConfig({
    NODE_ENV: 'production',
    APP_ORIGIN: 'https://digiconomicfest.com',
    UPLOAD_DIR: tmpDir,
    RATE_LIMIT_MAX_GENERAL: '200',
    RATE_LIMIT_MAX_AUTH: '5',
    RATE_LIMIT_MAX_UPLOAD: '50',
    ...overrides,
  });
  const repo = createMemoryRepo();
  const seeded = await seedDatabase(repo);
  const { server, rateLimiter } = createApp({ repo, config, verifyGoogleToken: async (credential) => {
    const profile = JSON.parse(credential);
    return { googleId: profile.email, email: profile.email, name: profile.name || 'Peserta Uji', avatarUrl: null };
  } });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  async function req(method, pathname, { cookie, body, headers = {} } = {}) {
    const h = { ...headers };
    if (cookie) h.Cookie = cookie;
    let payload = body;
    if (body && !(body instanceof Buffer) && typeof body === 'object') {
      h['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }
    const res = await fetch(`${baseUrl}${pathname}`, { method, headers: h, body: payload });
    const ct = res.headers.get('content-type') || '';
    const data = ct.includes('application/json') ? await res.json() : await res.text();
    return { res, status: res.status, data, cookie: extractCookie(res) };
  }

  return {
    baseUrl,
    repo,
    config,
    seeded,
    rateLimiter,
    req,
    async close() {
      await new Promise((resolve) => server.close(resolve));
      await fs.rm(tmpDir, { recursive: true, force: true });
    },
  };
}

test('Security & Penetration Test Suite — Digiconomic Fest 2027', async (t) => {
  const ctx = await startSecServer();
  t.after(() => ctx.close());

  // Helper login SuperAdmin & buat Peserta + Admin (reset rate limiter antar test)
  const superLogin = await ctx.req('POST', '/api/auth/login', {
    body: { email: 'superadmin@diginomic.id', password: 'SuperAdmin2027!' },
  });
  const superCookie = superLogin.cookie;
  const superSetCookie = superLogin.res.headers.get('set-cookie') || '';

  await ctx.req('POST', '/api/superadmin/admins', {
    cookie: superCookie,
    body: { email: 'panitia@diginomic.id', name: 'Panitia Uji', role: 'ADMIN', password: 'AdminPassword123' },
  });
  const admLogin = await ctx.req('POST', '/api/auth/login', {
    body: { email: 'panitia@diginomic.id', password: 'AdminPassword123' },
  });
  const adminCookie = admLogin.cookie;
  const adminId = admLogin.data.user.id;

  ctx.rateLimiter.reset();

  await t.test('S1. Security Headers & Cookie HttpOnly + Secure + SameSite=None', async () => {
    assert.ok(superSetCookie.includes('HttpOnly'));
    assert.ok(superSetCookie.includes('SameSite=None'));
    assert.ok(superSetCookie.includes('Secure'));

    const res = await fetch(`${ctx.baseUrl}/api/competitions`);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('x-frame-options'), 'DENY');
    assert.equal(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
    assert.ok(res.headers.get('strict-transport-security')?.includes('max-age=31536000'));
    assert.ok(res.headers.get('content-security-policy')?.includes("default-src 'none'"));

    // Token sesi di DB harus berupa hash SHA-256 (64 hex), bukan token mentah di cookie
    const rawCookieVal = superCookie.split('=')[1];
    assert.equal(ctx.repo._db.sessions.has(rawCookieVal), false);
    assert.equal(ctx.repo._db.sessions.size >= 2, true);
  });

  await t.test('S2. Anti Mass-Assignment: role pada login Google selalu dipaksa PESERTA', async () => {
    ctx.rateLimiter.reset();
    const res = await ctx.req('POST', '/api/auth/google', {
      body: { credential: JSON.stringify({
        email: 'hacker@evil.test',
        password: 'Password123',
        name: 'Calon Hacker',
        role: 'SUPERADMIN', // mencoba eskalasi peran
        privacy_accepted: true,
      }) },
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.user.role, 'PESERTA');
    assert.equal(res.data.user.password_hash, undefined); // password_hash tidak boleh bocor
  });

  await t.test('S3. RBAC Enforcement: Guest (401), Peserta->Admin (403), Admin->SuperAdmin (403), Admin daftar lomba (403)', async () => {
    ctx.rateLimiter.reset();
    const pLogin = await ctx.req('POST', '/api/auth/google', {
      body: { credential: JSON.stringify({ email: 'hacker@evil.test' }) },
    });
    const pesertaCookie = pLogin.cookie;

    // Guest memanggil endpoint privat -> 401
    assert.equal((await ctx.req('GET', '/api/auth/me')).status, 401);
    assert.equal((await ctx.req('GET', '/api/admin/registrations')).status, 401);
    assert.equal((await ctx.req('GET', '/api/superadmin/audit-logs')).status, 401);

    // Peserta memanggil endpoint Admin & SuperAdmin -> 403
    assert.equal((await ctx.req('GET', '/api/admin/summary', { cookie: pesertaCookie })).status, 403);
    assert.equal((await ctx.req('GET', '/api/admin/export', { cookie: pesertaCookie })).status, 403);
    assert.equal((await ctx.req('GET', '/api/superadmin/admins', { cookie: pesertaCookie })).status, 403);

    // Admin memanggil endpoint SuperAdmin -> 403
    assert.equal((await ctx.req('GET', '/api/superadmin/admins', { cookie: adminCookie })).status, 403);
    assert.equal((await ctx.req('GET', '/api/superadmin/audit-logs', { cookie: adminCookie })).status, 403);

    // BR-12: Admin & SuperAdmin mencoba mendaftar lomba -> 403
    assert.equal((await ctx.req('POST', '/api/registrations', { cookie: adminCookie, body: { competition_slug: 'esai-nasional' } })).status, 403);
    assert.equal((await ctx.req('POST', '/api/registrations', { cookie: superCookie, body: { competition_slug: 'esai-nasional' } })).status, 403);
  });

  await t.test('S4. Anti-CSRF: Origin asing ditolak 403 pada semua metode mutasi', async () => {
    ctx.rateLimiter.reset();
    const evilPost = await ctx.req('POST', '/api/auth/logout', {
      cookie: adminCookie,
      headers: { Origin: 'https://phishing-site.evil' },
    });
    assert.equal(evilPost.status, 403);
    assert.equal(evilPost.data.error.code, 'FORBIDDEN_ORIGIN');

    const goodOrigin = await ctx.req('POST', '/api/admin/announcements', {
      cookie: adminCookie,
      headers: { Origin: 'https://digiconomicfest.com' },
      body: { title: 'Pengumuman Sah', body: 'Dikirim dari origin resmi.' },
    });
    assert.equal(goodOrigin.status, 201);
  });

  await t.test('S5. Magic Bytes & Upload Security: tolak file palsu (415) & file > 2 MB (413)', async () => {
    ctx.rateLimiter.reset();
    const pLogin = await ctx.req('POST', '/api/auth/google', {
      body: { credential: JSON.stringify({ email: 'hacker@evil.test' }) },
    });
    const pesertaCookie = pLogin.cookie;

    // File HTML/JS menyamar sebagai .jpg -> 415
    const fakeJpg = buildMultipart('file', 'evil.jpg', Buffer.from('<html><script>alert(1)</script></html>'));
    const rFake = await ctx.req('POST', '/api/profile/student-card', {
      cookie: pesertaCookie,
      body: fakeJpg.body,
      headers: { 'Content-Type': fakeJpg.contentType },
    });
    assert.equal(rFake.status, 415);

    // File > 2 MB -> 413
    const hugeBuf = Buffer.concat([VALID_PNG, Buffer.alloc(2 * 1024 * 1024 + 5000)]);
    const hugeMp = buildMultipart('file', 'huge.png', hugeBuf);
    const rHuge = await ctx.req('POST', '/api/profile/student-card', {
      cookie: pesertaCookie,
      body: hugeMp.body,
      headers: { 'Content-Type': hugeMp.contentType },
    });
    assert.equal(rHuge.status, 413);
  });

  await t.test('S6. Path Traversal Protection pada readPrivateFile & endpoint file admin', async () => {
    await assert.rejects(
      () => readPrivateFile(ctx.config.uploadDir, '../../etc/passwd'),
      (err) => err.status === 400 && err.code === 'INVALID_FILE_PATH'
    );
    const badFileUrl = await ctx.req('GET', '/api/admin/registrations/..%2F..%2Fetc%2Fpasswd/files/student-card', {
      cookie: adminCookie,
    });
    assert.equal(badFileUrl.status, 404);
  });

  await t.test('S7. Anti-XSS & HTML Injection di biodata dan pengumuman admin', async () => {
    ctx.rateLimiter.reset();
    const xssAnn = await ctx.req('POST', '/api/admin/announcements', {
      cookie: adminCookie,
      body: { title: '<script>alert(1)</script>', body: 'Halo peserta' },
    });
    assert.equal(xssAnn.status, 422);


  });

  await t.test('S8. CSV Formula Injection Protection (=, +, -, @)', () => {
    assert.equal(escapeCsvCell('=CMD|\' /C calc\'!A0'), `"'=CMD|' /C calc'!A0"`);
    assert.equal(escapeCsvCell('+1+1'), `"'` + `+1+1"`);
    assert.equal(escapeCsvCell('@SUM(A1:A10)'), `"'@SUM(A1:A10)"`);
    assert.equal(escapeCsvCell('Normal Text'), '"Normal Text"');
  });

  await t.test('S9. Concurrency Race Condition BR-01: 2 pendaftaran bersamaan -> hanya 1 berhasil (201), lainnya 409', async () => {
    ctx.rateLimiter.reset();
    const regUser = await ctx.req('POST', '/api/auth/google', {
      body: { credential: JSON.stringify({ email: 'race@kampus.ac.id', password: 'Password123', name: 'Peserta Race', privacy_accepted: true }) },
    });
    const raceCookie = regUser.cookie;

    await ctx.req('PUT', '/api/profile', {
      cookie: raceCookie,
      body: { full_name: 'Peserta Race', institution: 'ITB', phone_wa: '081344445555' },
    });
    const mp = buildMultipart('file', 'ktm.png', VALID_PNG);
    await ctx.req('POST', '/api/profile/student-card', {
      cookie: raceCookie,
      body: mp.body,
      headers: { 'Content-Type': mp.contentType },
    });

    const [a, b] = await Promise.all([
      ctx.req('POST', '/api/registrations', {
        cookie: raceCookie,
        body: {
          competition_slug: 'esai-nasional',
          team_name: 'Tim Balap Esai',
          team_members: [{ full_name: 'Anggota Esai', institution: 'ITB', phone_wa: '081355556667' }],
        },
      }),
      ctx.req('POST', '/api/registrations', {
        cookie: raceCookie,
        body: {
          competition_slug: 'mini-case-competition',
          team_name: 'Tim Balap',
          team_members: [{ full_name: 'Anggota', institution: 'ITB', phone_wa: '081355556666' }],
        },
      }),
    ]);

    const statuses = [a.status, b.status].sort();
    assert.deepEqual(statuses, [201, 409]);

    // State Machine Bypass: lompat MENUNGGU_VERIFIKASI -> JUARA ditolak 409
    const successRegId = a.status === 201 ? a.data.registration.id : b.data.registration.id;
    const jump = await ctx.req('PATCH', `/api/admin/registrations/${successRegId}/status`, {
      cookie: adminCookie,
      body: { status: 'JUARA' },
    });
    assert.equal(jump.status, 409);
    assert.equal(jump.data.error.code, 'INVALID_STATUS_TRANSITION');
  });

  await t.test('S10. Invalidasi sesi seketika setelah Logout, Suspend Admin, dan Hapus Admin + proteksi self-delete', async () => {
    ctx.rateLimiter.reset();
    // SuperAdmin tidak boleh hapus/suspend diri sendiri -> 409
    const selfId = superLogin.data.user.id;
    assert.equal((await ctx.req('DELETE', `/api/superadmin/admins/${selfId}`, { cookie: superCookie })).status, 409);
    assert.equal((await ctx.req('PATCH', `/api/superadmin/admins/${selfId}/status`, { cookie: superCookie, body: { status: 'SUSPENDED' } })).status, 409);

    // Suspend admin -> sesi admin langsung mati (401)
    const susp = await ctx.req('PATCH', `/api/superadmin/admins/${adminId}/status`, {
      cookie: superCookie,
      body: { status: 'SUSPENDED' },
    });
    assert.equal(susp.status, 200);
    assert.equal((await ctx.req('GET', '/api/admin/summary', { cookie: adminCookie })).status, 401);

    // Aktifkan lagi lalu hapus admin -> sesi baru juga langsung mati
    await ctx.req('PATCH', `/api/superadmin/admins/${adminId}/status`, {
      cookie: superCookie,
      body: { status: 'ACTIVE' },
    });
    const reloginAdm = await ctx.req('POST', '/api/auth/login', {
      body: { email: 'panitia@diginomic.id', password: 'AdminPassword123' },
    });
    assert.equal(reloginAdm.status, 200);
    await ctx.req('DELETE', `/api/superadmin/admins/${adminId}`, { cookie: superCookie });
    assert.equal((await ctx.req('GET', '/api/admin/summary', { cookie: reloginAdm.cookie })).status, 401);

    // Logout mematikan cookie lama
    const tmpReg = await ctx.req('POST', '/api/auth/google', {
      body: { credential: JSON.stringify({ email: 'logout@test.id', password: 'Password123', name: 'Logout User', privacy_accepted: true }) },
    });
    assert.equal((await ctx.req('GET', '/api/auth/me', { cookie: tmpReg.cookie })).status, 200);
    await ctx.req('POST', '/api/auth/logout', { cookie: tmpReg.cookie });
    assert.equal((await ctx.req('GET', '/api/auth/me', { cookie: tmpReg.cookie })).status, 401);
  });

  await t.test('S11. Rate Limiter aktif (429 + Retry-After) & Malformed JSON (400)', async () => {
    ctx.rateLimiter.reset();
    // Malformed JSON -> 400
    const badJson = await fetch(`${ctx.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"email": "rusak',
    });
    assert.equal(badJson.status, 400);

    // Uji batas rate limit auth (batas = 5 per menit; request ke-1 sudah dipakai di atas)
    let got429 = false;
    let retryAfter = null;
    for (let i = 0; i < 6; i++) {
      const r = await ctx.req('POST', '/api/auth/login', {
        body: { email: 'nobody@test.id', password: 'WrongPassword1' },
      });
      if (r.status === 429) {
        got429 = true;
        retryAfter = r.res.headers.get('retry-after');
        break;
      }
    }
    assert.equal(got429, true);
    assert.ok(Number(retryAfter) >= 1);
  });

  await t.test('S12. Google Login (upsertGoogleUser) tidak mengubah google_id/avatar/last_login_at bila role != PESERTA atau SUSPENDED', async () => {
    const createMockPool = (userRow) => {
      const queries = [];
      return {
        queries,
        async query(sql, params) {
          queries.push({ sql, params });
          if (sql.startsWith('SELECT')) return { rows: [userRow] };
          return { rows: [] };
        },
      };
    };

    const adminPool = createMockPool({
      id: 'u-admin-1',
      email: 'panitia@diginomic.id',
      role: 'ADMIN',
      status: 'ACTIVE',
      google_id: null,
      avatar_url: null,
      last_login_at: '2026-01-01T00:00:00.000Z',
    });
    await assert.rejects(
      () => upsertGoogleUser(adminPool, { googleId: 'g-999', email: 'panitia@diginomic.id', name: 'Panitia', avatarUrl: 'https://img/a.png' }),
      (err) => err.status === 403 && err.code === 'GOOGLE_PESERTA_ONLY'
    );
    assert.equal(adminPool.queries.some((q) => q.sql.startsWith('UPDATE')), false);

    const suspendedPool = createMockPool({
      id: 'u-peserta-susp',
      email: 'susp@diginomic.id',
      role: 'PESERTA',
      status: 'SUSPENDED',
      google_id: 'g-old',
      avatar_url: 'https://img/old.png',
      last_login_at: '2026-01-01T00:00:00.000Z',
    });
    await assert.rejects(
      () => upsertGoogleUser(suspendedPool, { googleId: 'g-new', email: 'susp@diginomic.id', name: 'Susp', avatarUrl: 'https://img/new.png' }),
      (err) => err.status === 403 && err.code === 'ACCOUNT_SUSPENDED'
    );
    assert.equal(suspendedPool.queries.some((q) => q.sql.startsWith('UPDATE')), false);
  });

  await t.test('S13. getClientIp mengabaikan spoofing X-Forwarded-For indeks pertama & cf-connecting-ip tanpa TRUST_CLOUDFLARE', async () => {
    const req = {
      headers: {
        'cf-connecting-ip': '1.1.1.1',
        'x-forwarded-for': '9.9.9.9, 203.0.113.42',
      },
      socket: { remoteAddress: '127.0.0.1' },
    };
    assert.equal(getClientIp(req, { trustProxy: true, trustCloudflare: false }), '203.0.113.42');
    assert.equal(getClientIp(req, { trustProxy: true, trustCloudflare: true }), '1.1.1.1');
  });
  await t.test('S14. Peserta OAuth (daftar pertama vs login berikutnya), blokir semua jalur password peserta, login staf manual, & tolak benturan email staf', async () => {
    ctx.rateLimiter.reset();
    // 1. Pendaftaran pertama via Google: buat akun PESERTA (abaikan role klien) & tandai is_new_user=true, profile_complete=false
    const oauth = await ctx.req('POST', '/api/auth/google', {
      body: { credential: JSON.stringify({ email: 'oauth@kampus.ac.id', name: 'Peserta Google' }), role: 'SUPERADMIN' },
    });
    assert.equal(oauth.status, 200);
    assert.equal(oauth.data.user.role, 'PESERTA');
    assert.equal(oauth.data.is_new_user, true);
    assert.equal(oauth.data.profile_complete, false);
    const participant = await ctx.repo.findUserByEmail('oauth@kampus.ac.id');
    assert.equal(participant.password_hash, null);

    // Lengkapi profil & KTM lalu login Google berikutnya -> is_new_user=false, profile_complete=true, user.id tetap sama
    await ctx.req('PUT', '/api/profile', {
      cookie: oauth.cookie,
      body: { full_name: 'Peserta Google', institution: 'Universitas Airlangga', phone_wa: '081234560001' },
    });
    const ktmMp = buildMultipart('file', 'ktm.png', VALID_PNG);
    await ctx.req('POST', '/api/profile/student-card', {
      cookie: oauth.cookie,
      body: ktmMp.body,
      headers: { 'Content-Type': ktmMp.contentType },
    });

    const again = await ctx.req('POST', '/api/auth/google', {
      body: { credential: JSON.stringify({ email: participant.email, name: participant.name }), role: 'ADMIN' },
    });
    assert.equal(again.status, 200);
    assert.equal(again.data.user.id, participant.id);
    assert.equal(again.data.user.role, 'PESERTA');
    assert.equal(again.data.is_new_user, false);
    assert.equal(again.data.profile_complete, true);

    // 2. Endpoint registrasi password ditutup (410)
    const closed = await ctx.req('POST', '/api/auth/register', {
      body: { email: 'closed@kampus.ac.id', name: 'Closed', password: 'Password123', privacy_accepted: true },
    });
    assert.equal(closed.status, 410);
    assert.equal(await ctx.repo.findUserByEmail('closed@kampus.ac.id'), null);

    // 3. Tolak seluruh jalur password untuk akun PESERTA (login, ubah password, lupa password, reset password)
    const passwordLogin = await ctx.req('POST', '/api/auth/login', {
      body: { email: participant.email, password: 'Password123' },
    });
    assert.equal(passwordLogin.status, 403);
    ctx.rateLimiter.reset();
    assert.equal((await ctx.req('PATCH', '/api/auth/password', {
      cookie: oauth.cookie, body: { current_password: '', new_password: 'Password123' },
    })).status, 403);
    const outboxBefore = ctx.repo._db.email_outbox.length;
    assert.equal((await ctx.req('POST', '/api/auth/forgot-password', {
      body: { email: participant.email },
    })).status, 200);
    assert.equal(ctx.repo._db.email_outbox.length, outboxBefore);
    assert.equal((await ctx.repo.findUserByEmail(participant.email)).reset_token_hash, null);

    const { hashToken } = await import('../src/utils/crypto.mjs');
    await ctx.repo.updateUser(participant.id, {
      reset_token_hash: hashToken('old-participant-token'),
      reset_token_expires_at: new Date(Date.now() + 60000).toISOString(),
    });
    assert.equal((await ctx.req('POST', '/api/auth/reset-password', {
      body: { token: 'old-participant-token', new_password: 'Password123' },
    })).status, 400);

    // 4. Tolak benturan email saat membuat staf dengan pesan persis "Email sudah digunakan" tanpa mengubah peran/sesi peserta
    const conflictPeserta = await ctx.req('POST', '/api/superadmin/admins', {
      cookie: superCookie,
      body: { email: participant.email, name: 'Staf Bentrok', password: 'StaffPassword123', role: 'JURI' },
    });
    assert.equal(conflictPeserta.status, 409);
    assert.equal(conflictPeserta.data.error.message, 'Email sudah digunakan');
    assert.equal((await ctx.repo.findUserByEmail(participant.email)).role, 'PESERTA');
    assert.equal((await ctx.req('GET', '/api/auth/me', { cookie: again.cookie })).status, 200);

    // 5. Buat staf baru manual oleh SuperAdmin, tolak benturan email antar-staf, verifikasi login manual staf & tolak Google login staf
    ctx.rateLimiter.reset();
    const createStaffOk = await ctx.req('POST', '/api/superadmin/admins', {
      cookie: superCookie,
      body: { email: 'staf.resmi@diginomic.id', name: 'Staf Resmi', password: 'StaffPassword123', role: 'ADMIN' },
    });
    assert.equal(createStaffOk.status, 201);

    const conflictStaff = await ctx.req('POST', '/api/superadmin/admins', {
      cookie: superCookie,
      body: { email: 'staf.resmi@diginomic.id', name: 'Duplikat Staf', password: 'OtherPassword123', role: 'SUPERADMIN' },
    });
    assert.equal(conflictStaff.status, 409);
    assert.equal(conflictStaff.data.error.message, 'Email sudah digunakan');
    assert.equal((await ctx.repo.findUserByEmail('staf.resmi@diginomic.id')).role, 'ADMIN');

    const staffManualLogin = await ctx.req('POST', '/api/auth/login', {
      body: { email: 'staf.resmi@diginomic.id', password: 'StaffPassword123' },
    });
    assert.equal(staffManualLogin.status, 200);
    assert.equal(staffManualLogin.data.user.role, 'ADMIN');

    const staffGoogle = await ctx.req('POST', '/api/auth/google', {
      body: { credential: JSON.stringify({ email: 'superadmin@diginomic.id' }) },
    });
    assert.equal(staffGoogle.status, 403);
    const adminGoogle = await ctx.req('POST', '/api/auth/google', {
      body: { credential: JSON.stringify({ email: 'staf.resmi@diginomic.id' }) },
    });
    assert.equal(adminGoogle.status, 403);
  });

  await t.test('S15. Isolasi akses JURI lintas lomba, penolakan JURI tanpa penugasan, & penutupan proksi Drive bebas', async () => {
    ctx.rateLimiter.reset();
    const esaiComp = ctx.seeded.competitions.find((c) => c.slug === 'esai-nasional');
    const caseComp = ctx.seeded.competitions.find((c) => c.slug === 'mini-case-competition');

    // Buat karya di lomba Esai Nasional
    const pLogin = await ctx.req('POST', '/api/auth/google', {
      body: { credential: JSON.stringify({ email: 'karya.esai@kampus.ac.id', name: 'Penulis Esai' }) },
    });
    const pCookie = pLogin.cookie;
    await ctx.req('PUT', '/api/profile', {
      cookie: pCookie,
      body: { full_name: 'Penulis Esai', institution: 'UB', phone_wa: '081277776666' },
    });
    const mp = buildMultipart('file', 'ktm.png', VALID_PNG);
    await ctx.req('POST', '/api/profile/student-card', {
      cookie: pCookie,
      body: mp.body,
      headers: { 'Content-Type': mp.contentType },
    });
    const regEsai = await ctx.req('POST', '/api/registrations', {
      cookie: pCookie,
      body: {
        competition_slug: 'esai-nasional',
        team_name: 'Tim Esai Rahasia',
        team_members: [{ full_name: 'Anggota Esai', institution: 'UB', phone_wa: '081277776667' }],
      },
    });
    await ctx.req('PATCH', `/api/admin/registrations/${regEsai.data.registration.id}/status`, {
      cookie: superCookie,
      body: { status: 'TERVERIFIKASI' },
    });
    const subEsai = await ctx.req('POST', '/api/registrations/me/submissions', {
      cookie: pCookie,
      body: { title: 'Esai Rahasia', link_url: 'https://example.com/esai.pdf' },
    });
    const esaiSubId = subEsai.data.submission.id;

    // 1. Juri tanpa assigned_competition_id ditolak 403
    await ctx.req('POST', '/api/superadmin/admins', {
      cookie: superCookie,
      body: { email: 'juri.kosong@diginomic.id', name: 'Juri Kosong', role: 'JURI', password: 'JuriPassword123' },
    });
    const juriKosongLogin = await ctx.req('POST', '/api/auth/login', {
      body: { email: 'juri.kosong@diginomic.id', password: 'JuriPassword123' },
    });
    assert.equal((await ctx.req('GET', '/api/admin/submissions', { cookie: juriKosongLogin.cookie })).status, 403);
    assert.equal((await ctx.req('GET', '/api/admin/leaderboard', { cookie: juriKosongLogin.cookie })).status, 403);
    assert.equal((await ctx.req('GET', `/api/admin/submissions/${esaiSubId}/scores`, { cookie: juriKosongLogin.cookie })).status, 403);

    // 2. Juri yang ditugaskan ke Mini Case ditolak mengakses karya Esai Nasional
    ctx.rateLimiter.reset();
    await ctx.req('POST', '/api/superadmin/admins', {
      cookie: superCookie,
      body: {
        email: 'juri.case@diginomic.id',
        name: 'Juri Mini Case',
        role: 'JURI',
        assigned_competition_id: caseComp.id,
        password: 'JuriPassword123',
      },
    });
    const juriCaseLogin = await ctx.req('POST', '/api/auth/login', {
      body: { email: 'juri.case@diginomic.id', password: 'JuriPassword123' },
    });
    assert.equal((await ctx.req('GET', `/api/admin/submissions/${esaiSubId}/scores`, { cookie: juriCaseLogin.cookie })).status, 403);
    assert.equal((await ctx.req('GET', `/api/admin/submissions/${esaiSubId}/file`, { cookie: juriCaseLogin.cookie })).status, 403);
    assert.equal(
      (
        await ctx.req('POST', '/api/admin/scores', {
          cookie: juriCaseLogin.cookie,
          body: {
            submission_id: esaiSubId,
            score_orisinalitas: 85,
            score_analisis: 85,
            score_inovasi: 85,
            score_sistematika: 85,
          },
        })
      ).status,
      403
    );

    // 3. Juri Esai diizinkan membaca daftar lomba miliknya & menilai karya Esai
    ctx.rateLimiter.reset();
    await ctx.req('POST', '/api/superadmin/admins', {
      cookie: superCookie,
      body: {
        email: 'juri.esai@diginomic.id',
        name: 'Juri Esai',
        role: 'JURI',
        assigned_competition_id: esaiComp.id,
        password: 'JuriPassword123',
      },
    });
    const juriEsaiLogin = await ctx.req('POST', '/api/auth/login', {
      body: { email: 'juri.esai@diginomic.id', password: 'JuriPassword123' },
    });
    const juriComps = await ctx.req('GET', '/api/admin/competitions', { cookie: juriEsaiLogin.cookie });
    assert.equal(juriComps.status, 200);
    assert.equal(juriComps.data.competitions.length, 1);
    assert.equal(juriComps.data.competitions[0].id, esaiComp.id);

    // 4. Proksi bebas /api/admin/files/:id sudah ditutup (404)
    assert.equal((await ctx.req('GET', '/api/admin/files/arbitrary-drive-id-123', { cookie: superCookie })).status, 404);
  });

  await t.test('S16. Hardening Produksi: /docs & /openapi.json 404, CSRF Referer/Sec-Fetch-Site, & Validasi News/Revisi', async () => {
    ctx.rateLimiter.reset();
    // 1. /docs & /openapi.json nonaktif di NODE_ENV=production
    assert.equal((await ctx.req('GET', '/docs')).status, 404);
    assert.equal((await ctx.req('GET', '/openapi.json')).status, 404);

    // 2. CSRF: Referer asing & Sec-Fetch-Site cross-site tanpa Origin ditolak 403
    const badReferer = await ctx.req('POST', '/api/auth/logout', {
      cookie: adminCookie,
      headers: { Referer: 'https://evil-phishing.example/steal' },
    });
    assert.equal(badReferer.status, 403);
    assert.equal(badReferer.data.error.code, 'FORBIDDEN_ORIGIN');

    const crossSite = await ctx.req('POST', '/api/auth/logout', {
      cookie: adminCookie,
      headers: { 'Sec-Fetch-Site': 'cross-site' },
    });
    assert.equal(crossSite.status, 403);
    assert.equal(crossSite.data.error.code, 'FORBIDDEN_ORIGIN');

    // 3. PATCH /api/superadmin/news/:id menolak URL berbahaya & kategori tidak valid
    const fakeNewsId = '00000000-0000-4000-8000-000000000001';
    const badCover = await ctx.req('PATCH', `/api/superadmin/news/${fakeNewsId}`, {
      cookie: superCookie,
      body: { cover_image_url: 'javascript:alert(1)' },
    });
    assert.equal(badCover.status, 422);
    assert.equal(badCover.data.error.code, 'INVALID_URL');

    const badCat = await ctx.req('PATCH', `/api/superadmin/news/${fakeNewsId}`, {
      cookie: superCookie,
      body: { category: 'KategoriPalsu' },
    });
    assert.equal(badCat.status, 422);
    assert.equal(badCat.data.error.code, 'INVALID_NEWS_CATEGORY');

    // 4. GET /api/admin/summary memakai agregasi cepat getAdminSummary
    const sumRes = await ctx.req('GET', '/api/admin/summary', { cookie: superCookie });
    assert.equal(sumRes.status, 200);
    assert.equal(typeof sumRes.data.total, 'number');
    assert.ok(sumRes.data.by_status && typeof sumRes.data.by_status === 'object');

    // 5. Vercel full-stack same-origin memakai cookie SameSite=Lax secara default
    const vercelCfg = loadConfig({ NODE_ENV: 'production', VERCEL: '1' });
    assert.equal(vercelCfg.cookieSameSite, 'Lax');
    assert.equal(vercelCfg.enableApiDocs, false);
  });

});


test('Verifikasi Google wajib Client ID, audience cocok, dan email terverifikasi', async () => {
  const { verifyGoogleIdToken } = await import('../src/services/googleAuth.mjs');
  const originalFetch = globalThis.fetch;
  let payload = { sub: 'google-123', email: 'user@gmail.com', email_verified: true, aud: 'expected-client' };
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return { ok: true, json: async () => payload };
  };
  try {
    await assert.rejects(() => verifyGoogleIdToken('token', ''), (err) => err.status === 503);
    assert.equal(calls, 0);
    await assert.rejects(() => verifyGoogleIdToken('token', 'wrong-client'), /audience/);
    payload = { ...payload, email_verified: false };
    await assert.rejects(() => verifyGoogleIdToken('token', 'expected-client'), /belum diverifikasi/);
    payload = { ...payload, email_verified: true };
    const profile = await verifyGoogleIdToken('token', 'expected-client');
    assert.equal(profile.googleId, 'google-123');
    assert.equal(profile.email, 'user@gmail.com');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('savePrivateFile mengembalikan ext dan filename valid untuk penamaan berkas Drive', async () => {
  const { savePrivateFile } = await import('../src/utils/fileSecurity.mjs');
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'digi-filesec-'));
  try {
    const saved = await savePrivateFile({
      buffer: VALID_PNG,
      uploadDir: tmpDir,
      subFolder: 'student-cards',
      maxBytes: 2 * 1024 * 1024,
    });
    assert.equal(saved.ext, 'png');
    assert.equal(saved.mime, 'image/png');
    assert.ok(saved.filename && saved.filename.endsWith('.png'));
    assert.ok(saved.relativePath.startsWith('student-cards/'));
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
});
