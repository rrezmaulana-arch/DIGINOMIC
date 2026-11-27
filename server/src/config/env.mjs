import path from 'node:path';

export function loadConfig(overrides = {}) {
  const env = { ...process.env, ...overrides };
  const nodeEnv = env.NODE_ENV || 'development';
  const isProd = nodeEnv === 'production';

  const defaultDevOrigins = 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000';
  const allowedOrigins = (env.APP_ORIGIN || (isProd ? 'http://localhost:5173' : defaultDevOrigins))
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  if (env.VERCEL_URL) {
    const vercelOrigin = `https://${env.VERCEL_URL}`;
    if (!allowedOrigins.includes(vercelOrigin)) allowedOrigins.push(vercelOrigin);
  }
  if (env.VERCEL_PROJECT_PRODUCTION_URL) {
    const prodOrigin = `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
    if (!allowedOrigins.includes(prodOrigin)) allowedOrigins.push(prodOrigin);
  }

  const isVercel = env.VERCEL === '1';
  const rawSameSite = String(env.COOKIE_SAME_SITE || '').trim();
  const cookieSameSite = ['Strict', 'Lax', 'None'].includes(rawSameSite)
    ? rawSameSite
    : isProd && !isVercel
      ? 'None'
      : 'Lax';

  return {
    nodeEnv,
    isProd,
    isVercel,
    enableApiDocs: env.ENABLE_API_DOCS === 'true' || !isProd,
    cookieSameSite,
    port: Number(env.PORT || 4001),
    databaseUrl: env.DATABASE_URL || '',
    allowedOrigins,
    sessionCookieName: env.SESSION_COOKIE_NAME || 'digi_sid',
    sessionTtlDays: Number(env.SESSION_TTL_DAYS || 14),
    maxUploadBytes: Number(env.MAX_UPLOAD_MB || 2) * 1024 * 1024,
    uploadDir: path.resolve(env.UPLOAD_DIR || (isVercel ? '/tmp/diginomic-uploads' : './uploads')),
    fileRetentionDays: Number(env.FILE_RETENTION_DAYS || 90),
    eventEndDate: env.EVENT_END_DATE || '2027-03-22T16:59:59.000Z',
    rateLimitWindowMs: Number(env.RATE_LIMIT_WINDOW_MS || 60_000),
    rateLimitMaxGeneral: Number(env.RATE_LIMIT_MAX_GENERAL || 120),
    rateLimitMaxAuth: Number(env.RATE_LIMIT_MAX_AUTH || 20),
    rateLimitMaxUpload: Number(env.RATE_LIMIT_MAX_UPLOAD || 20),
    trustProxy: env.TRUST_PROXY === 'true' || isProd,
    trustCloudflare: env.TRUST_CLOUDFLARE === 'true',
    googleClientId: env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: env.GOOGLE_CLIENT_SECRET || '',
    googleDriveRefreshToken: env.GOOGLE_DRIVE_REFRESH_TOKEN || '',
    googleServiceAccountPath: env.GOOGLE_SERVICE_ACCOUNT_PATH || './credentials/google-drive-service-account.json',
    googleDriveRootFolderId: env.GOOGLE_DRIVE_ROOT_FOLDER_ID || '',
  };
}
