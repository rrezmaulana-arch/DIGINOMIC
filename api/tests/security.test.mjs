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
  const { server, rateLimiter } = createApp({ repo, config });

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

  await t.test('S1. Security Headers & Cookie HttpOnly + Secure + SameSite=Lax', async () => {
    assert.ok(superSetCookie.includes('HttpOnly'));
    assert.ok(superSetCookie.includes('SameSite=Lax'));
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

  await t.test('S2. Anti Mass-Assignment: role pada register selalu dipaksa PESERTA', async () => {
    ctx.rateLimiter.reset();
    const res = await ctx.req('POST', '/api/auth/register', {
      body: {
        email: 'hacker@evil.test',
        password: 'Password123',
        name: 'Calon Hacker',
        role: 'SUPERADMIN', // mencoba eskalasi peran
        privacy_accepted: true,
      },
    });
    assert.equal(res.status, 201);
    assert.equal(res.data.user.role, 'PESERTA');
    assert.equal(res.data.user.password_hash, undefined); // password_hash tidak boleh bocor
  });

  await t.test('S3. RBAC Enforcement: Guest (401), Peserta->Admin (403), Admin->SuperAdmin (403), Admin daftar lomba (403)', async () => {
    ctx.rateLimiter.reset();
    const pLogin = await ctx.req('POST', '/api/auth/login', {
      body: { email: 'hacker@evil.test', password: 'Password123' },
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
    const pLogin = await ctx.req('POST', '/api/auth/login', {
      body: { email: 'hacker@evil.test', password: 'Password123' },
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

    const xssReg = await ctx.req('POST', '/api/auth/register', {
      body: { email: 'xss@test.id', password: 'Password123', name: '<img src=x onerror=alert(1)>', privacy_accepted: true },
    });
    assert.equal(xssReg.status, 422);
  });

  await t.test('S8. CSV Formula Injection Protection (=, +, -, @)', () => {
    assert.equal(escapeCsvCell('=CMD|\' /C calc\'!A0'), `"'=CMD|' /C calc'!A0"`);
    assert.equal(escapeCsvCell('+1+1'), `"'` + `+1+1"`);
    assert.equal(escapeCsvCell('@SUM(A1:A10)'), `"'@SUM(A1:A10)"`);
    assert.equal(escapeCsvCell('Normal Text'), '"Normal Text"');
  });

  await t.test('S9. Concurrency Race Condition BR-01: 2 pendaftaran bersamaan -> hanya 1 berhasil (201), lainnya 409', async () => {
    ctx.rateLimiter.reset();
    const regUser = await ctx.req('POST', '/api/auth/register', {
      body: { email: 'race@kampus.ac.id', password: 'Password123', name: 'Peserta Race', privacy_accepted: true },
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
      ctx.req('POST', '/api/registrations', { cookie: raceCookie, body: { competition_slug: 'esai-nasional' } }),
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
    const tmpReg = await ctx.req('POST', '/api/auth/register', {
      body: { email: 'logout@test.id', password: 'Password123', name: 'Logout User', privacy_accepted: true },
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
});
