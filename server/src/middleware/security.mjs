/**
 * Middleware keamanan: Security Headers, CORS ketat, CSRF Origin Check, dan Rate Limiter.
 */

export function applySecurityHeaders(res, config) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  res.setHeader('X-Powered-By', ''); // Sembunyikan identitas server
  if (config.isProd) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
}

export function applyCors(req, res, config) {
  const origin = req.headers.origin;
  if (origin && config.allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  }
}

/**
 * Validasi CSRF berbasis Origin, Referer, dan Sec-Fetch-Site pada semua metode mutasi.
 * - Jika browser mengirim Origin asing -> tolak 403.
 * - Jika Origin kosong tetapi Referer berasal dari origin asing -> tolak 403.
 * - Jika Sec-Fetch-Site bernilai cross-site tanpa Origin whitelist -> tolak 403.
 */
export function checkOriginCsrf(req, config) {
  const method = (req.method || 'GET').toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return { ok: true };

  const origin = req.headers.origin;
  if (origin) {
    if (!config.allowedOrigins.includes(origin)) {
      return {
        ok: false,
        status: 403,
        code: 'FORBIDDEN_ORIGIN',
        message: 'Origin permintaan tidak diizinkan.',
      };
    }
    return { ok: true };
  }

  const referer = req.headers.referer;
  if (typeof referer === 'string' && referer.trim()) {
    try {
      const refOrigin = new URL(referer).origin;
      if (!config.allowedOrigins.includes(refOrigin)) {
        return {
          ok: false,
          status: 403,
          code: 'FORBIDDEN_ORIGIN',
          message: 'Origin referer permintaan tidak diizinkan.',
        };
      }
    } catch {
      return {
        ok: false,
        status: 403,
        code: 'FORBIDDEN_ORIGIN',
        message: 'Header Referer permintaan tidak valid.',
      };
    }
  }

  const fetchSite = String(req.headers['sec-fetch-site'] || '').toLowerCase();
  if (fetchSite === 'cross-site') {
    return {
      ok: false,
      status: 403,
      code: 'FORBIDDEN_ORIGIN',
      message: 'Permintaan lintas situs tanpa origin sah ditolak.',
    };
  }

  return { ok: true };
}

export function getClientIp(req, config) {
  if (config.trustProxy) {
    if (config.trustCloudflare) {
      const cfIp = req.headers['cf-connecting-ip'];
      if (typeof cfIp === 'string' && cfIp.trim()) return cfIp.trim();
    }
    const realIp = req.headers['x-real-ip'];
    if (typeof realIp === 'string' && realIp.trim()) return realIp.trim();
    const xff = req.headers['x-forwarded-for'];
    if (typeof xff === 'string' && xff.trim()) {
      // Ambil IP paling kanan (yang ditambahkan oleh proxy tepercaya), bukan indeks pertama yang bisa dipalsukan klien
      const parts = xff.split(',').map((s) => s.trim()).filter(Boolean);
      if (parts.length > 0) return parts[parts.length - 1];
    }
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}

export function createRateLimiter(config) {
  const buckets = new Map();

  function check(ip, bucketName, maxRequests) {
    const now = Date.now();
    // Cegah kebocoran RAM saat lonjakan IP tinggi di VPS 2 GB
    if (buckets.size > 5000) {
      for (const [k, v] of buckets.entries()) {
        if (now >= v.resetAt) buckets.delete(k);
      }
    }
    const key = `${bucketName}:${ip}`;
    const entry = buckets.get(key);

    if (!entry || now >= entry.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + config.rateLimitWindowMs });
      return { allowed: true, remaining: maxRequests - 1 };
    }

    entry.count += 1;
    if (entry.count > maxRequests) {
      return {
        allowed: false,
        retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
      };
    }
    return { allowed: true, remaining: maxRequests - entry.count };
  }

  function reset() {
    buckets.clear();
  }

  return { check, reset };
}
