/**
 * Spesifikasi OpenAPI 3.0.3 untuk seluruh 44 endpoint Digiconomic Fest 2027 API
 * + halaman Swagger UI interaktif di GET /docs.
 */
export function buildOpenApiSpec(serverUrl = 'http://localhost:4000') {
  const errRef = { $ref: '#/components/schemas/ErrorResponse' };
  const jsonOk = (desc, example) => ({
    description: desc,
    content: { 'application/json': { schema: { type: 'object' }, ...(example ? { example } : {}) } },
  });

  const paths = {
    '/health': {
      get: { tags: ['Publik'], summary: 'Cek kesehatan server & database', responses: { 200: jsonOk('Server sehat') } },
    },
    '/api/competitions': {
      get: { tags: ['Publik'], summary: 'Daftar cabang lomba aktif', responses: { 200: jsonOk('Daftar lomba') } },
    },
    '/api/competitions/{slug}': {
      get: {
        tags: ['Publik'],
        summary: 'Detail lomba berdasarkan slug',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string', example: 'esai-nasional' } }],
        responses: { 200: jsonOk('Detail lomba'), 404: { description: 'Tidak ditemukan', content: { 'application/json': { schema: errRef } } } },
      },
    },
    '/api/auth/google': {
      post: {
        tags: ['Autentikasi'],
        summary: 'Daftar atau login peserta menggunakan token Google terverifikasi',
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'object', required: ['credential'], properties: { credential: { type: 'string' } },
        } } } },
        responses: { 200: jsonOk('Sesi peserta dibuat'), 401: jsonOk('Token Google tidak valid'), 403: jsonOk('Akun staf atau ditangguhkan') },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Autentikasi'],
        summary: 'Login staf dengan email dan kata sandi',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'superadmin@diginomic.id' },
                  password: { type: 'string', example: 'SuperAdmin2027!' },
                },
              },
            },
          },
        },
        responses: { 200: jsonOk('Login berhasil'), 401: jsonOk('Kredensial salah') },
      },
    },
    '/api/auth/me': {
      get: { tags: ['Autentikasi'], summary: 'Ambil profil sesi login aktif', security: [{ cookieAuth: [] }], responses: { 200: jsonOk('Profil user'), 401: jsonOk('Belum login') } },
    },
    '/api/auth/logout': {
      post: { tags: ['Autentikasi'], summary: 'Logout & hapus sesi dari database', security: [{ cookieAuth: [] }], responses: { 200: jsonOk('Logout berhasil') } },
    },
    '/api/auth/password': {
      patch: {
        tags: ['Autentikasi'],
        summary: 'Ganti kata sandi akun staf',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['current_password', 'new_password'],
                properties: { current_password: { type: 'string' }, new_password: { type: 'string' } },
              },
            },
          },
        },
        responses: { 200: jsonOk('Kata sandi diperbarui') },
      },
    },
    '/api/auth/forgot-password': {
      post: {
        tags: ['Autentikasi'],
        summary: 'Kirim permintaan reset kata sandi ke email_outbox',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email'], properties: { email: { type: 'string' } } } } } },
        responses: { 200: jsonOk('Instruksi dikirim jika email terdaftar') },
      },
    },
    '/api/auth/reset-password': {
      post: {
        tags: ['Autentikasi'],
        summary: 'Reset kata sandi menggunakan token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['token', 'new_password'], properties: { token: { type: 'string' }, new_password: { type: 'string' } } },
            },
          },
        },
        responses: { 200: jsonOk('Berhasil direset'), 400: jsonOk('Token tidak valid / kedaluwarsa') },
      },
    },
    '/api/profile': {
      get: { tags: ['Profil Peserta'], summary: 'Lihat biodata peserta', security: [{ cookieAuth: [] }], responses: { 200: jsonOk('Biodata peserta') } },
      put: {
        tags: ['Profil Peserta'],
        summary: 'Simpan/perbarui biodata peserta',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['full_name', 'institution', 'phone_wa'],
                properties: {
                  full_name: { type: 'string', example: 'Budi Santoso' },
                  institution: { type: 'string', example: 'Universitas Brawijaya' },
                  phone_wa: { type: 'string', example: '081234567890' },
                },
              },
            },
          },
        },
        responses: { 200: jsonOk('Profil tersimpan') },
      },
    },
    '/api/profile/student-card': {
      post: {
        tags: ['Profil Peserta'],
        summary: 'Unggah KTM (multipart/form-data field "file", JPG/PNG/PDF maks 2 MB)',
        security: [{ cookieAuth: [] }],
        requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } } } },
        responses: { 201: jsonOk('KTM tersimpan'), 413: jsonOk('Terlalu besar'), 415: jsonOk('Tipe berkas tidak valid') },
      },
      get: { tags: ['Profil Peserta'], summary: 'Unduh KTM milik sendiri', security: [{ cookieAuth: [] }], responses: { 200: { description: 'Berkas KTM' } } },
    },
    '/api/registrations': {
      post: {
        tags: ['Pendaftaran Peserta'],
        summary: 'Daftar cabang lomba (kunci BR-01: 1 akun 1 lomba aktif)',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  competition_slug: { type: 'string', example: 'esai-nasional' },
                  team_name: { type: 'string' },
                  team_members: { type: 'array', items: { type: 'object' } },
                },
              },
            },
          },
        },
        responses: { 201: jsonOk('Terdaftar'), 409: jsonOk('Sudah memiliki pendaftaran aktif / kuota penuh') },
      },
    },
    '/api/registrations/me': {
      get: { tags: ['Pendaftaran Peserta'], summary: 'Detail pendaftaran aktif & link grup (jika terverifikasi)', security: [{ cookieAuth: [] }], responses: { 200: jsonOk('Detail pendaftaran') } },
      put: { tags: ['Pendaftaran Peserta'], summary: 'Revisi pendaftaran saat status DITOLAK', security: [{ cookieAuth: [] }], responses: { 200: jsonOk('Revisi dikirim') } },
      delete: { tags: ['Pendaftaran Peserta'], summary: 'Batalkan pendaftaran (saat MENUNGGU_VERIFIKASI / DITOLAK)', security: [{ cookieAuth: [] }], responses: { 200: jsonOk('Dibatalkan') } },
    },
    '/api/registrations/me/payment-proof': {
      post: {
        tags: ['Pendaftaran Peserta'],
        summary: 'Unggah bukti pembayaran QRIS (multipart/form-data field "file")',
        security: [{ cookieAuth: [] }],
        requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } } } },
        responses: { 201: jsonOk('Bukti bayar tersimpan') },
      },
    },
    '/api/registrations/me/submissions': {
      get: { tags: ['Pendaftaran Peserta'], summary: 'Riwayat versi karya peserta', security: [{ cookieAuth: [] }], responses: { 200: jsonOk('Daftar versi karya') } },
      post: {
        tags: ['Pendaftaran Peserta'],
        summary: 'Kirim karya (JSON link_url atau multipart file PDF/gambar)',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'link_url'],
                properties: {
                  title: { type: 'string', example: 'Transformasi QRIS UMKM' },
                  link_url: { type: 'string', example: 'https://drive.google.com/file/d/demo/view' },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: jsonOk('Karya tersimpan') },
      },
    },
    '/api/announcements': {
      get: { tags: ['Pendaftaran Peserta'], summary: 'Daftar pengumuman Information Board', security: [{ cookieAuth: [] }], responses: { 200: jsonOk('Daftar pengumuman') } },
    },
    '/api/admin/summary': {
      get: { tags: ['Admin Panitia'], summary: 'Ringkasan statistik pendaftar', security: [{ cookieAuth: [] }], responses: { 200: jsonOk('Statistik') } },
    },
    '/api/admin/registrations': {
      get: {
        tags: ['Admin Panitia'],
        summary: 'Daftar pendaftar dengan filter & paginasi',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'competition', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'q', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        ],
        responses: { 200: jsonOk('Daftar pendaftar') },
      },
    },
    '/api/admin/registrations/{id}': {
      get: { tags: ['Admin Panitia'], summary: 'Detail pendaftar + deteksi nomor WA kembar', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: jsonOk('Detail pendaftar') } },
    },
    '/api/admin/registrations/{id}/status': {
      patch: {
        tags: ['Admin Panitia'],
        summary: 'Ubah status pendaftar (DITOLAK wajib reason)',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['status'], properties: { status: { type: 'string' }, reason: { type: 'string' } } } } } },
        responses: { 200: jsonOk('Status diperbarui') },
      },
    },
    '/api/admin/registrations/bulk-status': {
      post: { tags: ['Admin Panitia'], summary: 'Ubah status banyak peserta sekaligus', security: [{ cookieAuth: [] }], responses: { 200: jsonOk('Bulk update selesai') } },
    },
    '/api/admin/registrations/{id}/files/{kind}': {
      get: {
        tags: ['Admin Panitia'],
        summary: 'Unduh KTM atau bukti bayar peserta (tercatat di audit log)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'kind', in: 'path', required: true, schema: { type: 'string', enum: ['student-card', 'payment-proof'] } },
        ],
        responses: { 200: { description: 'Berkas biner' } },
      },
    },
    '/api/admin/submissions': {
      get: { tags: ['Admin Panitia'], summary: 'Daftar seluruh karya masuk', security: [{ cookieAuth: [] }], responses: { 200: jsonOk('Daftar karya') } },
    },
    '/api/admin/submissions/{id}/file': {
      get: { tags: ['Admin Panitia'], summary: 'Unduh berkas karya peserta', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'File karya' } } },
    },
    '/api/admin/submissions/{id}/score': {
      patch: {
        tags: ['Admin Panitia'],
        summary: 'Input skor penjurian & feedback',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['score'], properties: { score: { type: 'number' }, round: { type: 'string', enum: ['TAHAP_1', 'FINAL'] }, jury_feedback: { type: 'string' } } } } } },
        responses: { 200: jsonOk('Skor tersimpan') },
      },
    },
    '/api/admin/announcements': {
      get: { tags: ['Admin Panitia'], summary: 'Daftar semua pengumuman', security: [{ cookieAuth: [] }], responses: { 200: jsonOk('Daftar pengumuman') } },
      post: { tags: ['Admin Panitia'], summary: 'Buat pengumuman baru', security: [{ cookieAuth: [] }], responses: { 201: jsonOk('Pengumuman dibuat') } },
    },
    '/api/admin/announcements/{id}': {
      put: { tags: ['Admin Panitia'], summary: 'Edit / terbitkan pengumuman', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: jsonOk('Diperbarui') } },
      delete: { tags: ['Admin Panitia'], summary: 'Hapus pengumuman', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: jsonOk('Dihapus') } },
    },
    '/api/admin/competitions': {
      get: { tags: ['Admin Panitia'], summary: 'Daftar semua lomba (termasuk nonaktif)', security: [{ cookieAuth: [] }], responses: { 200: jsonOk('Daftar lomba') } },
    },
    '/api/admin/competitions/{id}': {
      put: { tags: ['Admin Panitia'], summary: 'Ubah pengaturan kuota, biaya, deadline, & link grup lomba', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: jsonOk('Pengaturan lomba diperbarui') } },
    },
    '/api/admin/export': {
      get: { tags: ['Admin Panitia'], summary: 'Ekspor rekap pendaftar format CSV aman', security: [{ cookieAuth: [] }], responses: { 200: { description: 'File CSV' } } },
    },
    '/api/superadmin/admins': {
      get: { tags: ['SuperAdmin'], summary: 'Daftar akun Admin & SuperAdmin', security: [{ cookieAuth: [] }], responses: { 200: jsonOk('Daftar admin') } },
      post: { tags: ['SuperAdmin'], summary: 'Tambah atau promosikan akun Admin', security: [{ cookieAuth: [] }], responses: { 201: jsonOk('Admin dibuat') } },
    },
    '/api/superadmin/admins/{id}/status': {
      patch: { tags: ['SuperAdmin'], summary: 'Suspend / aktifkan akun Admin', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: jsonOk('Status admin diperbarui') } },
    },
    '/api/superadmin/admins/{id}': {
      delete: { tags: ['SuperAdmin'], summary: 'Copot peran Admin (sesi langsung diputus)', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: jsonOk('Peran dicabut') } },
    },
    '/api/superadmin/registrations/{id}/revert': {
      post: { tags: ['SuperAdmin'], summary: 'Kemunduran status pendaftaran dengan catatan wajib', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: jsonOk('Status dikoreksi') } },
    },
    '/api/superadmin/audit-logs': {
      get: { tags: ['SuperAdmin'], summary: 'Lihat log audit aksi sensitif', security: [{ cookieAuth: [] }], responses: { 200: jsonOk('Audit logs') } },
    },
  };

  return {
    openapi: '3.0.3',
    info: {
      title: 'Digiconomic Fest 2027 — API Documentation',
      version: '1.0.0',
      description: 'Dokumentasi interaktif 44 endpoint Backend Digiconomic Fest 2027. Login terlebih dahulu lewat POST /api/auth/login untuk mengisi cookie sesi HttpOnly secara otomatis di browser.',
    },
    servers: [{ url: serverUrl, description: 'Server Aktif' }],
    components: {
      securitySchemes: {
        cookieAuth: { type: 'apiKey', in: 'cookie', name: 'digi_sid' },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: { code: { type: 'string' }, message: { type: 'string' } },
            },
          },
        },
      },
    },
    paths,
  };
}

export function renderSwaggerUiHtml() {
  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Digiconomic Fest 2027 — Swagger API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    body { margin: 0; background: #faf4e8; }
    .swagger-ui .topbar { background-color: #2f1e10; border-bottom: 2px solid #caa152; }
    .swagger-ui .topbar .download-url-wrapper { display: none; }
  </style>
</head>
<body>
  <div style="background:#2f1e10;color:#faf4e8;padding:10px 24px;display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #caa152;font-family:sans-serif;">
    <strong style="letter-spacing:0.06em;">Digiconomic Fest 2027 — API Documentation (44 Endpoints)</strong>
    <div style="display:flex;gap:10px;">
      <a href="/openapi.json" target="_blank" style="color:#f3d48c;text-decoration:none;font-size:12px;border:1px solid #caa152;padding:6px 12px;border-radius:999px;">Unduh OpenAPI JSON</a>
      <button onclick="window.print()" style="background:#caa152;color:#241308;border:none;padding:6px 14px;border-radius:999px;font-weight:700;font-size:12px;cursor:pointer;">Cetak / Simpan PDF</button>
    </div>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: '/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        persistAuthorization: true,
        withCredentials: true
      });
    };
  </script>
</body>
</html>`;
}
