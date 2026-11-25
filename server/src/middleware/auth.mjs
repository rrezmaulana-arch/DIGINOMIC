import { hashToken } from '../utils/crypto.mjs';

export function parseCookies(cookieHeader) {
  const map = {};
  if (!cookieHeader || typeof cookieHeader !== 'string') return map;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) map[key] = decodeURIComponent(val);
  }
  return map;
}

export function buildSessionCookie(name, value, config, maxAgeSec) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    `SameSite=${config.isProd ? 'None' : 'Lax'}`,
    `Max-Age=${maxAgeSec}`,
  ];
  if (config.isProd) parts.push('Secure');
  return parts.join('; ');
}

export function clearSessionCookie(name, config) {
  return buildSessionCookie(name, '', config, 0);
}

export async function resolveAuthSession(req, repo, config) {
  const cookies = parseCookies(req.headers.cookie);
  const rawToken = cookies[config.sessionCookieName];
  if (!rawToken) return null;

  const tokenHash = hashToken(rawToken);
  const session = await repo.findSessionWithUser(tokenHash);
  if (!session) return null;

  if (new Date(session.expires_at).getTime() <= Date.now()) {
    await repo.deleteSession(tokenHash);
    return null;
  }

  if (session.user.status === 'SUSPENDED') {
    await repo.deleteSessionsByUserId(session.user.id);
    return null;
  }

  // Sliding expiration: perpanjang jika sisa < setengah masa berlaku
  const ttlMs = config.sessionTtlDays * 24 * 60 * 60 * 1000;
  const remaining = new Date(session.expires_at).getTime() - Date.now();
  if (remaining < ttlMs / 2) {
    const newExpires = new Date(Date.now() + ttlMs).toISOString();
    await repo.touchSession(tokenHash, newExpires);
  }

  return { tokenHash, user: session.user };
}
