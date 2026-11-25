import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { loadConfig } from '../src/config/env.mjs';
import { createMemoryRepo } from '../src/repositories/memoryRepo.mjs';
import { createApp } from '../src/app.mjs';
import { seedDatabase } from '../db/seed.mjs';
import { processEmailOutbox, cleanupExpiredSessions, runFileRetentionJob } from '../src/jobs/workers.mjs';

// Contoh magic bytes asli untuk pengujian upload
const VALID_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
const VALID_JPG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
const VALID_PDF = Buffer.from('%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF');

function buildMultipart(fieldName, filename, buffer, extraFields = {}) {
  const boundary = '----DiginomicTestBoundary7MA4YWxkTrZu0gW';
  const parts = [];
  for (const [k, v] of Object.entries(extraFields)) {
    parts.push(
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`)
    );
  }
  parts.push(
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\nContent-Type: application/octet-stream\r\n\r\n`),
    buffer,
    Buffer.from(`\r\n--${boundary}--\r\n`)
  );
  return {
    contentType: `multipart/form-data; boundary=${boundary}`,
    body: Buffer.concat(parts),
  };
}

function extractCookie(res) {
  const raw = res.headers.get('set-cookie');
  if (!raw) return '';
  return raw.split(';')[0];
}

async function startTestServer() {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'diginomic-e2e-'));
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
  const { server } = createApp({ repo, config, verifyGoogleToken: async (credential) => {
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
    req,
    async close() {
      await new Promise((resolve) => server.close(resolve));
      await fs.rm(tmpDir, { recursive: true, force: true });
    },
  };
}

test('End-to-End Functional & Business Rules Suite — Digiconomic Fest 2027', async (t) => {
  const ctx = await startTestServer();
  t.after(() => ctx.close());

  let superCookie = '';
  let adminCookie = '';
  let adminUserId = '';
  let p1Cookie = '';
  let p2Cookie = '';
  let p1RegId = '';
  let p2RegId = '';
  let sub1Id = '';
  let annId = '';

  const esaiComp = ctx.seeded.competitions.find((c) => c.slug === 'esai-nasional');
  const caseComp = ctx.seeded.competitions.find((c) => c.slug === 'mini-case-competition');

  await t.test('1. GET /health & daftar lomba publik + detail slug', async () => {
    const h = await ctx.req('GET', '/health');
    assert.equal(h.status, 200);

    const spec = await ctx.req('GET', '/openapi.json');
    assert.equal(spec.status, 200);
    assert.ok(Object.keys(spec.data.paths).length >= 30);

    const docs = await fetch(`${ctx.baseUrl}/docs`);
    assert.equal(docs.status, 200);
    assert.ok((await docs.text()).includes('SwaggerUIBundle'));
    assert.equal(h.data.status, 'ok');

    const comps = await ctx.req('GET', '/api/competitions');
    assert.equal(comps.status, 200);
    assert.equal(comps.data.competitions.length, 2);

    const detail = await ctx.req('GET', '/api/competitions/esai-nasional');
    assert.equal(detail.status, 200);
    assert.equal(detail.data.competition.name, 'Esai Nasional');

    const missing = await ctx.req('GET', '/api/competitions/tidak-ada');
    assert.equal(missing.status, 404);
  });

  await t.test('2. SuperAdmin login, buat akun Admin, dan Admin login', async () => {
    const loginSuper = await ctx.req('POST', '/api/auth/login', {
      body: { email: 'superadmin@diginomic.id', password: 'SuperAdmin2027!' },
    });
    assert.equal(loginSuper.status, 200);
    assert.equal(loginSuper.data.user.role, 'SUPERADMIN');
    superCookie = loginSuper.cookie;

    const createAdm = await ctx.req('POST', '/api/superadmin/admins', {
      cookie: superCookie,
      body: {
        email: 'admin.lomba@diginomic.id',
        name: 'Andi Pratama',
        role: 'ADMIN',
        division: 'Divisi Verifikasi',
        password: 'AdminPassword123',
      },
    });
    assert.equal(createAdm.status, 201);
    adminUserId = createAdm.data.admin.id;

    const listAdm = await ctx.req('GET', '/api/superadmin/admins', { cookie: superCookie });
    assert.equal(listAdm.status, 200);
    assert.equal(listAdm.data.admins.length, 2);

    const loginAdm = await ctx.req('POST', '/api/auth/login', {
      body: { email: 'admin.lomba@diginomic.id', password: 'AdminPassword123' },
    });
    assert.equal(loginAdm.status, 200);
    assert.equal(loginAdm.data.user.role, 'ADMIN');
    adminCookie = loginAdm.cookie;
  });

  await t.test('3. Registrasi peserta melalui Google & profil + upload KTM', async () => {
    const reg1 = await ctx.req('POST', '/api/auth/google', {
      body: { credential: JSON.stringify({ email: 'budi@kampus.ac.id', password: 'Password123', name: 'Budi Santoso', privacy_accepted: true }) },
    });
    assert.equal(reg1.status, 200);
    p1Cookie = reg1.cookie;

    // Belum lengkapi profil -> daftar lomba harus 422
    const prematureReg = await ctx.req('POST', '/api/registrations', {
      cookie: p1Cookie,
      body: { competition_slug: 'esai-nasional' },
    });
    assert.equal(prematureReg.status, 422);
    assert.equal(prematureReg.data.error.code, 'INCOMPLETE_PROFILE');

    // Lengkapi biodata
    const putProf = await ctx.req('PUT', '/api/profile', {
      cookie: p1Cookie,
      body: { full_name: 'Budi Santoso', institution: 'Universitas Brawijaya', phone_wa: '081234567890' },
    });
    assert.equal(putProf.status, 200);
    assert.equal(putProf.data.profile.phone_wa, '6281234567890');

    // Upload KTM PNG valid
    const mp = buildMultipart('file', 'ktm-budi.png', VALID_PNG);
    const upKtm = await ctx.req('POST', '/api/profile/student-card', {
      cookie: p1Cookie,
      body: mp.body,
      headers: { 'Content-Type': mp.contentType },
    });
    assert.equal(upKtm.status, 201);
    assert.equal(upKtm.data.mime, 'image/png');

    // Peserta dapat mengunduh KTM miliknya sendiri
    const dlKtm = await fetch(`${ctx.baseUrl}/api/profile/student-card`, {
      headers: { Cookie: p1Cookie },
    });
    assert.equal(dlKtm.status, 200);
    assert.equal(dlKtm.headers.get('content-type'), 'image/png');
    const dlBuf = Buffer.from(await dlKtm.arrayBuffer());
    assert.deepEqual(dlBuf, VALID_PNG);
  });

  await t.test('4. Daftar lomba individu, BR-01 (1 akun 1 lomba), pembatalan & daftar ulang', async () => {
    const r1 = await ctx.req('POST', '/api/registrations', {
      cookie: p1Cookie,
      body: { competition_slug: 'esai-nasional' },
    });
    assert.equal(r1.status, 201);
    assert.equal(r1.data.registration.status, 'MENUNGGU_VERIFIKASI');
    // BR-03: link grup HARUS null saat MENUNGGU_VERIFIKASI
    assert.equal(r1.data.registration.group_url, null);

    // BR-01: coba daftar lomba lain saat masih aktif -> 409
    const dup = await ctx.req('POST', '/api/registrations', {
      cookie: p1Cookie,
      body: {
        competition_slug: 'mini-case-competition',
        team_name: 'Tim Alpha',
        team_members: [{ full_name: 'Anggota Satu', institution: 'UB', phone_wa: '081299998888' }],
      },
    });
    assert.equal(dup.status, 409);
    assert.equal(dup.data.error.code, 'REGISTRATION_ALREADY_EXISTS');

    // Batalkan pendaftaran saat MENUNGGU_VERIFIKASI -> 200 DIBATALKAN
    const cancel = await ctx.req('DELETE', '/api/registrations/me', { cookie: p1Cookie });
    assert.equal(cancel.status, 200);
    assert.equal(cancel.data.status, 'DIBATALKAN');

    // Setelah DIBATALKAN, boleh daftar ulang lagi!
    const r2 = await ctx.req('POST', '/api/registrations', {
      cookie: p1Cookie,
      body: { competition_slug: 'esai-nasional' },
    });
    assert.equal(r2.status, 201);
    p1RegId = r2.data.registration.id;

    // Upload bukti bayar JPG valid
    const mpPay = buildMultipart('file', 'bukti-qris.jpg', VALID_JPG);
    const upPay = await ctx.req('POST', '/api/registrations/me/payment-proof', {
      cookie: p1Cookie,
      body: mpPay.body,
      headers: { 'Content-Type': mpPay.contentType },
    });
    assert.equal(upPay.status, 201);
  });

  await t.test('5. Pendaftaran lomba tim (validasi max_team_size) & peringatan nomor HP kembar (BR-13)', async () => {
    const reg2 = await ctx.req('POST', '/api/auth/google', {
      body: { credential: JSON.stringify({ email: 'siti@kampus.ac.id', password: 'Password123', name: 'Siti Aminah', privacy_accepted: true }) },
    });
    assert.equal(reg2.status, 200);
    p2Cookie = reg2.cookie;

    // Sengaja pakai nomor WA yang sama dengan Budi untuk menguji BR-13
    await ctx.req('PUT', '/api/profile', {
      cookie: p2Cookie,
      body: { full_name: 'Siti Aminah', institution: 'UM Malang', phone_wa: '081234567890' },
    });
    const mp = buildMultipart('file', 'ktm-siti.pdf', VALID_PDF);
    await ctx.req('POST', '/api/profile/student-card', {
      cookie: p2Cookie,
      body: mp.body,
      headers: { 'Content-Type': mp.contentType },
    });

    // Terlalu banyak anggota (3 anggota + 1 ketua = 4 > max_team_size 3) -> 422
    const tooBig = await ctx.req('POST', '/api/registrations', {
      cookie: p2Cookie,
      body: {
        competition_slug: 'mini-case-competition',
        team_name: 'Tim Hebat',
        team_members: [
          { full_name: 'A1', institution: 'UM', phone_wa: '081111111111' },
          { full_name: 'A2', institution: 'UM', phone_wa: '081111111112' },
          { full_name: 'A3', institution: 'UM', phone_wa: '081111111113' },
        ],
      },
    });
    assert.equal(tooBig.status, 422);

    // Ukuran valid (2 anggota + 1 ketua = 3)
    const okTeam = await ctx.req('POST', '/api/registrations', {
      cookie: p2Cookie,
      body: {
        competition_slug: 'mini-case-competition',
        team_name: 'Tim Inovasi',
        team_members: [
          { full_name: 'Rina', institution: 'UM', phone_wa: '081200001111' },
          { full_name: 'Doni', institution: 'UM', phone_wa: '081200002222' },
        ],
      },
    });
    assert.equal(okTeam.status, 201);
    p2RegId = okTeam.data.registration.id;

    // Admin cek detail pendaftar -> harus muncul peringatan nomor HP kembar (BR-13)
    const detail = await ctx.req('GET', `/api/admin/registrations/${p2RegId}`, { cookie: adminCookie });
    assert.equal(detail.status, 200);
    assert.equal(detail.data.warnings.length, 1);
  });

  await t.test('6. Alur Tolak (wajib alasan) -> Revisi Peserta -> Verifikasi Admin -> Link Grup Terbuka', async () => {
    // Tolak tanpa alasan -> 422
    const rejectNoReason = await ctx.req('PATCH', `/api/admin/registrations/${p1RegId}/status`, {
      cookie: adminCookie,
      body: { status: 'DITOLAK', reason: '' },
    });
    assert.equal(rejectNoReason.status, 422);

    // Tolak dengan alasan -> 200
    const rejectOk = await ctx.req('PATCH', `/api/admin/registrations/${p1RegId}/status`, {
      cookie: adminCookie,
      body: { status: 'DITOLAK', reason: 'Foto bukti bayar kurang jelas' },
    });
    assert.equal(rejectOk.status, 200);
    assert.equal(rejectOk.data.registration.status, 'DITOLAK');

    // Peserta kirim revisi -> kembali ke MENUNGGU_VERIFIKASI
    const revise = await ctx.req('PUT', '/api/registrations/me', {
      cookie: p1Cookie,
      body: {},
    });
    assert.equal(revise.status, 200);
    assert.equal(revise.data.registration.status, 'MENUNGGU_VERIFIKASI');

    // Admin setujui -> TERVERIFIKASI
    const approve = await ctx.req('PATCH', `/api/admin/registrations/${p1RegId}/status`, {
      cookie: adminCookie,
      body: { status: 'TERVERIFIKASI' },
    });
    assert.equal(approve.status, 200);

    // BR-03: link grup kini terbuka untuk peserta!
    const me = await ctx.req('GET', '/api/registrations/me', { cookie: p1Cookie });
    assert.equal(me.status, 200);
    assert.equal(me.data.registration.group_url, esaiComp.group_url);

    // Setelah TERVERIFIKASI, peserta tidak bisa batalkan sendiri -> 409
    const cancelFail = await ctx.req('DELETE', '/api/registrations/me', { cookie: p1Cookie });
    assert.equal(cancelFail.status, 409);
  });

  await t.test('7. Pengumpulan karya berversi (link & file), Penjurian, Bulk Status, Pengumuman, & Ekspor CSV', async () => {
    // Karya v1 (link)
    const sub1 = await ctx.req('POST', '/api/registrations/me/submissions', {
      cookie: p1Cookie,
      body: {
        title: 'Transformasi QRIS UMKM Malang',
        link_url: 'https://drive.google.com/file/d/karya-budi-v1/view',
        description: 'Versi pertama',
      },
    });
    assert.equal(sub1.status, 201);
    assert.equal(sub1.data.submission.version, 1);

    // Karya v2 (PDF upload)
    const mpSub = buildMultipart('file', 'karya-final.pdf', VALID_PDF, { title: 'Transformasi QRIS v2' });
    const sub2 = await ctx.req('POST', '/api/registrations/me/submissions', {
      cookie: p1Cookie,
      body: mpSub.body,
      headers: { 'Content-Type': mpSub.contentType },
    });
    assert.equal(sub2.status, 201);
    assert.equal(sub2.data.submission.version, 2);
    sub1Id = sub2.data.submission.id;

    // Admin melihat daftar submission & mengunduh file karya
    const listSubs = await ctx.req('GET', '/api/admin/submissions', { cookie: adminCookie });
    assert.equal(listSubs.status, 200);
    assert.equal(listSubs.data.submissions.length, 2);

    const dlSub = await fetch(`${ctx.baseUrl}/api/admin/submissions/${sub1Id}/file`, {
      headers: { Cookie: adminCookie },
    });
    assert.equal(dlSub.status, 200);
    assert.equal(dlSub.headers.get('content-type'), 'application/pdf');

    // Admin memberi skor penjurian
    const scored = await ctx.req('PATCH', `/api/admin/submissions/${sub1Id}/score`, {
      cookie: adminCookie,
      body: { score: 92.5, round: 'TAHAP_1', jury_feedback: 'Analisis tajam dan aplikatif' },
    });
    assert.equal(scored.status, 200);
    assert.equal(scored.data.submission.score, 92.5);

    // Admin mengunduh KTM & bukti bayar (tercatat di audit_logs)
    const dlAdmKtm = await fetch(`${ctx.baseUrl}/api/admin/registrations/${p1RegId}/files/student-card`, {
      headers: { Cookie: adminCookie },
    });
    assert.equal(dlAdmKtm.status, 200);

    // Bulk status: setujui p2RegId (MENUNGGU_VERIFIKASI -> TERVERIFIKASI)
    const bulk = await ctx.req('POST', '/api/admin/registrations/bulk-status', {
      cookie: adminCookie,
      body: { registration_ids: [p2RegId], status: 'TERVERIFIKASI', note: 'Batch verifikasi 1' },
    });
    assert.equal(bulk.status, 200);
    assert.deepEqual(bulk.data.updated_ids, [p2RegId]);

    // Pengumuman CRUD
    const ann = await ctx.req('POST', '/api/admin/announcements', {
      cookie: adminCookie,
      body: { title: 'Technical Meeting', body: 'Technical Meeting dilaksanakan 10 Februari 2027 pukul 19.00 WIB.' },
    });
    assert.equal(ann.status, 201);
    annId = ann.data.announcement.id;

    const pAnn = await ctx.req('GET', '/api/announcements', { cookie: p1Cookie });
    assert.equal(pAnn.status, 200);
    assert.equal(pAnn.data.announcements.length, 1);

    const updAnn = await ctx.req('PUT', `/api/admin/announcements/${annId}`, {
      cookie: adminCookie,
      body: { title: 'Technical Meeting (Updated)' },
    });
    assert.equal(updAnn.status, 200);

    const delAnn = await ctx.req('DELETE', `/api/admin/announcements/${annId}`, { cookie: adminCookie });
    assert.equal(delAnn.status, 200);

    // Summary & Ekspor CSV
    const sum = await ctx.req('GET', '/api/admin/summary', { cookie: adminCookie });
    assert.equal(sum.status, 200);
    assert.equal(sum.data.by_status.TERVERIFIKASI, 2);

    const csvRes = await fetch(`${ctx.baseUrl}/api/admin/export`, { headers: { Cookie: adminCookie } });
    assert.equal(csvRes.status, 200);
    const csvText = await csvRes.text();
    assert.ok(csvText.includes('Budi Santoso'));
    assert.ok(csvText.includes('92.5'));
  });

  await t.test('8. Status GUGUR menutup link grup, SuperAdmin revert, audit logs, & password reset', async () => {
    const gugur = await ctx.req('PATCH', `/api/admin/registrations/${p2RegId}/status`, {
      cookie: adminCookie,
      body: { status: 'GUGUR', note: 'Tidak lolos seleksi tahap 1' },
    });
    assert.equal(gugur.status, 200);

    // BR-03: Peserta GUGUR tidak lagi mendapat group_url
    const p2Me = await ctx.req('GET', '/api/registrations/me', { cookie: p2Cookie });
    assert.equal(p2Me.data.registration.group_url, null);

    // SuperAdmin revert status p2RegId kembali ke TERVERIFIKASI
    const rev = await ctx.req('POST', `/api/superadmin/registrations/${p2RegId}/revert`, {
      cookie: superCookie,
      body: { to_status: 'TERVERIFIKASI', note: 'Koreksi salah klik panitia' },
    });
    assert.equal(rev.status, 200);
    assert.equal(rev.data.registration.status, 'TERVERIFIKASI');

    // Audit logs mencatat semua aksi sensitif
    const audits = await ctx.req('GET', '/api/superadmin/audit-logs', { cookie: superCookie });
    assert.equal(audits.status, 200);
    assert.ok(audits.data.audit_logs.some((l) => l.action === 'DOWNLOAD_PRIVATE_FILE'));
    assert.ok(audits.data.audit_logs.some((l) => l.action === 'EXPORT_CSV'));
    assert.ok(audits.data.audit_logs.some((l) => l.action === 'REVERT_REGISTRATION_STATUS'));

    // Alur forgot-password + reset-password via token di email_outbox
    const forgot = await ctx.req('POST', '/api/auth/forgot-password', {
      body: { email: 'admin.lomba@diginomic.id' },
    });
    assert.equal(forgot.status, 200);
    const resetJob = ctx.repo._db.email_outbox.find((e) => e.template === 'PASSWORD_RESET');
    assert.ok(resetJob && resetJob.payload.reset_token);

    const resetRes = await ctx.req('POST', '/api/auth/reset-password', {
      body: { token: resetJob.payload.reset_token, new_password: 'NewPassword2027' },
    });
    assert.equal(resetRes.status, 200);

    // Login dengan password baru berhasil
    const relogin = await ctx.req('POST', '/api/auth/login', {
      body: { email: 'admin.lomba@diginomic.id', password: 'NewPassword2027' },
    });
    assert.equal(relogin.status, 200);
  });

  await t.test('9. Background workers: email outbox (SENT & retry FAILED), session cleanup, file retention 90 hari', async () => {
    const out1 = await processEmailOutbox(ctx.repo, async () => {});
    assert.ok(out1.sent >= 1);

    // Uji retry gagal 3x -> FAILED
    const failJob = await ctx.repo.enqueueEmail({ to_email: 'test@example.com', template: 'TEST_FAIL' });
    for (let i = 0; i < 3; i++) {
      failJob.send_after = new Date(Date.now() - 1000).toISOString();
      await ctx.repo.updateEmailOutbox(failJob.id, { send_after: new Date(Date.now() - 1000).toISOString() });
      await processEmailOutbox(ctx.repo, async () => {
        throw new Error('SMTP down');
      });
    }
    const storedJob = ctx.repo._db.email_outbox.find((e) => e.id === failJob.id);
    assert.equal(storedJob.status, 'FAILED');
    assert.equal(storedJob.attempts, 3);

    // Session cleanup
    await ctx.repo.createSession({
      token_hash: 'expired-hash-demo',
      user_id: adminUserId,
      expires_at: new Date(Date.now() - 5000).toISOString(),
      ip: '127.0.0.1',
      user_agent: 'test',
    });
    const cleaned = await cleanupExpiredSessions(ctx.repo);
    assert.equal(cleaned, 1);

    // File retention sebelum 90 hari -> skipped
    const skipRet = await runFileRetentionJob(ctx.config, new Date('2027-04-01T00:00:00Z'));
    assert.equal(skipRet.skipped, true);

    // File retention setelah 90 hari -> menghapus file pribadi
    const runRet = await runFileRetentionJob(ctx.config, new Date('2027-08-01T00:00:00Z'));
    assert.equal(runRet.skipped, false);
    assert.ok(runRet.deletedFiles >= 2);
  });
});
