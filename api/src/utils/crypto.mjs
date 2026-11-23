import crypto from 'node:crypto';

const SCRYPT_KEYLEN = 64;
const SCRYPT_COST = 16384; // N=2^14, aman & hemat RAM di VPS 2 GB

/**
 * Hash password menggunakan scrypt dengan salt acak 16-byte.
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, SCRYPT_KEYLEN, { N: SCRYPT_COST }).toString('hex');
  return `scrypt$${SCRYPT_COST}$${salt}$${derived}`;
}

/**
 * Verifikasi password dengan timing-safe comparison (anti timing attack).
 */
export function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== 'string') return false;
  const parts = storedHash.split('$');
  if (parts.length !== 4 || parts[0] !== 'scrypt') return false;
  const cost = Number(parts[1]);
  const salt = parts[2];
  const expectedHex = parts[3];
  if (!Number.isFinite(cost) || !salt || !expectedHex) return false;

  const actualBuf = crypto.scryptSync(password, salt, SCRYPT_KEYLEN, { N: cost });
  const expectedBuf = Buffer.from(expectedHex, 'hex');
  if (actualBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(actualBuf, expectedBuf);
}

/**
 * Buat token sesi acak 32 byte (64 hex chars) dan hash SHA-256 untuk disimpan di DB.
 */
export function generateSessionToken() {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  return { rawToken, tokenHash };
}

export function hashToken(rawToken) {
  return crypto.createHash('sha256').update(String(rawToken)).digest('hex');
}

export function generateUuid() {
  return crypto.randomUUID();
}

export function generateRegistrationCode(compSlug = 'DF') {
  const prefix = compSlug.toUpperCase().includes('ESAI') ? 'ESAI' : compSlug.toUpperCase().includes('CASE') ? 'CASE' : 'COMP';
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `DF27-${prefix}-${rand}`;
}
