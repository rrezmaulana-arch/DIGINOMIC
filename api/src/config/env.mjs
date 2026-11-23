import path from 'node:path';

export function loadConfig(overrides = {}) {
  const env = { ...process.env, ...overrides };
  const nodeEnv = env.NODE_ENV || 'development';
  const isProd = nodeEnv === 'production';

  const allowedOrigins = (env.APP_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  return {
    nodeEnv,
    isProd,
    port: Number(env.PORT || 4001),
    databaseUrl: env.DATABASE_URL || '',
    allowedOrigins,
    sessionCookieName: env.SESSION_COOKIE_NAME || 'digi_sid',
    sessionTtlDays: Number(env.SESSION_TTL_DAYS || 14),
    maxUploadBytes: Number(env.MAX_UPLOAD_MB || 2) * 1024 * 1024,
    uploadDir: path.resolve(env.UPLOAD_DIR || './uploads'),
    fileRetentionDays: Number(env.FILE_RETENTION_DAYS || 90),
    eventEndDate: env.EVENT_END_DATE || '2027-03-22T16:59:59.000Z',
    rateLimitWindowMs: Number(env.RATE_LIMIT_WINDOW_MS || 60_000),
    rateLimitMaxGeneral: Number(env.RATE_LIMIT_MAX_GENERAL || 120),
    rateLimitMaxAuth: Number(env.RATE_LIMIT_MAX_AUTH || 20),
    rateLimitMaxUpload: Number(env.RATE_LIMIT_MAX_UPLOAD || 20),
    trustProxy: env.TRUST_PROXY === 'true' || isProd,
  };
}
