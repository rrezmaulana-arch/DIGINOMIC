import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { loadConfig } from '../src/config/env.mjs';
import { createMemoryRepo } from '../src/repositories/memoryRepo.mjs';
import { createApp } from '../src/app.mjs';
import { seedDatabase } from '../db/seed.mjs';

const VALID_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);

function buildMultipart(fieldName, filename, buffer) {
  const boundary = '----EdgeTestBoundary777';
  return {
    contentType: `multipart/form-data; boundary=${boundary}`,
    body: Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\nContent-Type: image/png\r\n\r\n`),
      buffer,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]),
  };
}

function extractCookie(res) {
  const raw = res.headers.get('set-cookie');
  return raw ? raw.split(';')[0] : '';
}

async function startEdgeServer() {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'diginomic-edge-'));
  const config = loadConfig({
    NODE_ENV: 'test',
    APP_ORIGIN: 'http://localhost:5173',
    UPLOAD_DIR: tmpDir,
    RATE_LIMIT_MAX_GENERAL: '1000',
    RATE_LIMIT_MAX_AUTH: '1000',
    RATE_LIMIT_MAX_UPLOAD: '1000',
  });
  const repo = createMemoryRepo();
  const seeded = await seedDatabase(repo);
  const { server } = createApp({ repo, config });

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

  async function registerVerifiedParticipant(email, name, phone) {
    const reg = await req('POST', '/api/auth/register', {
      body: { email, password: 'Password123', name, privacy_accepted: true },
    });
    const cookie = reg.cookie;
    await req('PUT', '/api/profile', {
      cookie,
      body: { full_name: name, institution: 'Universitas Negeri Malang', phone_wa: phone },
    });
    const mp = buildMultipart('file', 'ktm.png', VALID_PNG);
    await req('POST', '/api/profile/student-card', {
      cookie,
      body: mp.body,
      headers: { 'Content-Type': mp.contentType },
    });
    return cookie;
  }

  return {
    repo,
    seeded,
    req,
    registerVerifiedParticipant,
    async close() {
      await new Promise((resolve) => server.close(resolve));
      await fs.rm(tmpDir, { recursive: true, force: true });
    },
  };
}

test('Edge Cases, Lifecycle, Quota & Deadline Suite — Digiconomic Fest 2027', async (t) => {
  const ctx = await startEdgeServer();
  t.after(() => ctx.close());

  const superLogin = await ctx.req('POST', '/api/auth/login', {
    body: { email: 'superadmin@diginomic.id', password: 'SuperAdmin2027!' },
  });
  const superCookie = superLogin.cookie;
  const esai = ctx.seeded.competitions.find((c) => c.slug === 'esai-nasional');

  await t.test('E1. Siklus lengkap status: MENUNGGU_VERIFIKASI -> TERVERIFIKASI -> LOLOS_TAHAP_1 -> FINALIS -> JUARA', async () => {
    const pCookie = await ctx.registerVerifiedParticipant('juara@kampus.ac.id', 'Calon Juara', '081211112222');
    const created = await ctx.req('POST', '/api/registrations', {
      cookie: pCookie,
      body: { competition_slug: 'esai-nasional' },
    });
    assert.equal(created.status, 201);
    const regId = created.data.registration.id;

    for (const nextStatus of ['TERVERIFIKASI', 'LOLOS_TAHAP_1', 'FINALIS', 'JUARA']) {
      const r = await ctx.req('PATCH', `/api/admin/registrations/${regId}/status`, {
        cookie: superCookie,
        body: { status: nextStatus, note: `Naik ke ${nextStatus}` },
      });
      assert.equal(r.status, 200);
      assert.equal(r.data.registration.status, nextStatus);
    }

    const me = await ctx.req('GET', '/api/registrations/me', { cookie: pCookie });
    assert.equal(me.data.registration.status, 'JUARA');
    assert.equal(me.data.registration.status_logs.length, 5);
    assert.ok(me.data.registration.group_url);
  });

  await t.test('E2. Batas kuota (max_quota) mencegah kelebihan pendaftar (409 QUOTA_EXCEEDED)', async () => {
    // Atur max_quota Esai menjadi 1 (sudah terisi oleh juara@kampus.ac.id)
    const upd = await ctx.req('PUT', `/api/admin/competitions/${esai.id}`, {
      cookie: superCookie,
      body: { max_quota: 1 },
    });
    assert.equal(upd.status, 200);

    const p2Cookie = await ctx.registerVerifiedParticipant('telat@kampus.ac.id', 'Peserta Kedua', '081233334444');
    const over = await ctx.req('POST', '/api/registrations', {
      cookie: p2Cookie,
      body: { competition_slug: 'esai-nasional' },
    });
    assert.equal(over.status, 409);
    assert.equal(over.data.error.code, 'QUOTA_EXCEEDED');

    // Kembalikan kuota ke 100
    await ctx.req('PUT', `/api/admin/competitions/${esai.id}`, {
      cookie: superCookie,
      body: { max_quota: 100 },
    });
  });

  await t.test('E3. BR-02: Pendaftaran ditolak (403) jika periode sudah tutup atau lomba nonaktif', async () => {
    const pCookie = await ctx.registerVerifiedParticipant('closed@kampus.ac.id', 'Peserta Tutup', '081255556666');

    // Tutup periode pendaftaran Esai (set reg_close_at di masa lalu)
    await ctx.req('PUT', `/api/admin/competitions/${esai.id}`, {
      cookie: superCookie,
      body: { reg_close_at: '2020-01-01T00:00:00.000Z' },
    });
    const closedRes = await ctx.req('POST', '/api/registrations', {
      cookie: pCookie,
      body: { competition_slug: 'esai-nasional' },
    });
    assert.equal(closedRes.status, 403);
    assert.equal(closedRes.data.error.code, 'REGISTRATION_CLOSED');

    // Nonaktifkan lomba -> tidak muncul di GET /api/competitions publik, tetap muncul di GET /api/admin/competitions
    await ctx.req('PUT', `/api/admin/competitions/${esai.id}`, {
      cookie: superCookie,
      body: { reg_close_at: '2027-01-30T16:59:59.000Z', is_active: false },
    });
    const pubComps = await ctx.req('GET', '/api/competitions');
    assert.equal(pubComps.data.competitions.length, 1);

    const admComps = await ctx.req('GET', '/api/admin/competitions', { cookie: superCookie });
    assert.equal(admComps.data.competitions.length, 2);

    // Aktifkan kembali
    await ctx.req('PUT', `/api/admin/competitions/${esai.id}`, {
      cookie: superCookie,
      body: { is_active: true },
    });
  });

  await t.test('E4. BR-04: Unggah karya setelah submission_deadline ditolak (403) & versi lama tetap utuh', async () => {
    const pCookie = await ctx.registerVerifiedParticipant('sub@kampus.ac.id', 'Peserta Karya', '081277778888');
    const reg = await ctx.req('POST', '/api/registrations', {
      cookie: pCookie,
      body: { competition_slug: 'esai-nasional' },
    });
    await ctx.req('PATCH', `/api/admin/registrations/${reg.data.registration.id}/status`, {
      cookie: superCookie,
      body: { status: 'TERVERIFIKASI' },
    });

    // Unggah sebelum deadline -> 201
    const okSub = await ctx.req('POST', '/api/registrations/me/submissions', {
      cookie: pCookie,
      body: { title: 'Karya Tepat Waktu', link_url: 'https://drive.google.com/file/d/ok/view' },
    });
    assert.equal(okSub.status, 201);

    // Geser deadline ke masa lalu -> unggahan baru ditolak 403
    await ctx.req('PUT', `/api/admin/competitions/${esai.id}`, {
      cookie: superCookie,
      body: { submission_deadline: '2020-01-01T00:00:00.000Z' },
    });
    const lateSub = await ctx.req('POST', '/api/registrations/me/submissions', {
      cookie: pCookie,
      body: { title: 'Karya Telat', link_url: 'https://drive.google.com/file/d/late/view' },
    });
    assert.equal(lateSub.status, 403);
    assert.equal(lateSub.data.error.code, 'SUBMISSION_DEADLINE_PASSED');

    // Versi sebelumnya tetap tersimpan
    const list = await ctx.req('GET', '/api/registrations/me/submissions', { cookie: pCookie });
    assert.equal(list.data.submissions.length, 1);
    assert.equal(list.data.submissions[0].title, 'Karya Tepat Waktu');
  });

  await t.test('E5. Ganti kata sandi (PATCH /api/auth/password) memutus sesi lama & menerbitkan cookie baru', async () => {
    const pCookie = await ctx.registerVerifiedParticipant('pass@kampus.ac.id', 'User Sandi', '081299990000');

    const wrongCur = await ctx.req('PATCH', '/api/auth/password', {
      cookie: pCookie,
      body: { current_password: 'SalahPassword1', new_password: 'BaruPassword2027' },
    });
    assert.equal(wrongCur.status, 401);

    const changed = await ctx.req('PATCH', '/api/auth/password', {
      cookie: pCookie,
      body: { current_password: 'Password123', new_password: 'BaruPassword2027' },
    });
    assert.equal(changed.status, 200);
    assert.ok(changed.cookie && changed.cookie !== pCookie);

    // Cookie lama harus mati (401), cookie baru aktif (200)
    assert.equal((await ctx.req('GET', '/api/auth/me', { cookie: pCookie })).status, 401);
    assert.equal((await ctx.req('GET', '/api/auth/me', { cookie: changed.cookie })).status, 200);
  });
});
