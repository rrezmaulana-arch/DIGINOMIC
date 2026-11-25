/**
 * Google OAuth 2.0 Service — Diginomic Fest 2027
 * Verifikasi Google ID Token dari frontend dan upsert user PESERTA di database.
 * Hanya dipakai untuk role PESERTA. Admin/Juri/Superadmin tetap email+password.
 */

const GOOGLE_TOKEN_INFO_URL = 'https://oauth2.googleapis.com/tokeninfo';

/**
 * Verifikasi ID Token Google yang dikirim dari frontend (@react-oauth/google).
 * Returns payload Google: { sub, email, name, picture, email_verified }
 */
export async function verifyGoogleIdToken(credential, clientId) {
  if (!clientId) {
    const err = new Error('Login Google belum dikonfigurasi.');
    err.status = 503;
    throw err;
  }
  const res = await fetch(`${GOOGLE_TOKEN_INFO_URL}?id_token=${encodeURIComponent(credential)}`);
  if (!res.ok) throw new Error('Google token verification gagal');

  const payload = await res.json();

  if (payload.error) throw new Error(`Google token error: ${payload.error}`);
  if (!payload.sub || !payload.email) {
    throw new Error('Payload token Google tidak lengkap');
  }
  if (!payload.email_verified || payload.email_verified === 'false') {
    throw new Error('Email Google belum diverifikasi');
  }
  if (payload.aud !== clientId) {
    throw new Error('Token audience tidak sesuai dengan Client ID aplikasi');
  }
  if (
    payload.iss &&
    payload.iss !== 'accounts.google.com' &&
    payload.iss !== 'https://accounts.google.com'
  ) {
    throw new Error('Issuer token Google tidak valid');
  }
  if (payload.exp && Number(payload.exp) * 1000 <= Date.now()) {
    throw new Error('Token Google telah kedaluwarsa');
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name || payload.email.split('@')[0],
    avatarUrl: payload.picture || null,
  };
}

/**
 * Upsert user PESERTA di database berdasarkan Google ID.
 * - Jika user sudah ada (by google_id atau email) → update avatar, kembalikan user.
 * - Jika belum ada → buat user baru dengan role PESERTA, password_hash NULL.
 */
export async function upsertGoogleUser(pool, { googleId, email, name, avatarUrl }) {
  // Cari akun berdasarkan google_id atau email (tanpa memandang apakah google_id sebelumnya terisi)
  let res = await pool.query(
    'SELECT * FROM users WHERE google_id = $1 OR LOWER(email) = LOWER($2)',
    [googleId, email]
  );

  if (res.rows.length > 0) {
    const user = res.rows[0];
    if (user.role !== 'PESERTA') {
      const err = new Error('Login Google hanya tersedia untuk peserta. Akun panitia/juri wajib menggunakan email dan kata sandi.');
      err.status = 403;
      err.code = 'GOOGLE_PESERTA_ONLY';
      throw err;
    }
    if (user.status === 'SUSPENDED') {
      const err = new Error('Akun Anda ditangguhkan oleh SuperAdmin.');
      err.status = 403;
      err.code = 'ACCOUNT_SUSPENDED';
      throw err;
    }
    if (user.google_id && user.google_id !== googleId) {
      const err = new Error('Email sudah terhubung dengan akun Google lain.');
      err.status = 403;
      err.code = 'GOOGLE_ACCOUNT_MISMATCH';
      throw err;
    }
    // Update google_id & avatar hanya setelah lolos pemeriksaan peran dan status
    await pool.query(
      'UPDATE users SET google_id = $1, avatar_url = $2, last_login_at = NOW() WHERE id = $3',
      [googleId, avatarUrl, user.id]
    );
    return { ...user, google_id: googleId, avatar_url: avatarUrl, _is_new_user: false };
  }

  // Buat user baru dengan peran PESERTA ditentukan server
  const insertRes = await pool.query(
    `INSERT INTO users (email, password_hash, name, role, status, google_id, avatar_url, privacy_accepted_at, last_login_at)
     VALUES ($1, NULL, $2, 'PESERTA', 'ACTIVE', $3, $4, NOW(), NOW())
     RETURNING *`,
    [email, name, googleId, avatarUrl]
  );

  return { ...insertRes.rows[0], _is_new_user: true };
}
