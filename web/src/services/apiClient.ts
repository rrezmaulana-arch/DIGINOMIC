/**
 * Klien HTTP untuk menghubungkan frontend web/ ke backend API.
 * Pada mode pengembangan lokal, VITE_API_URL dikosongkan agar seluruh request /api/*
 * melewati proxy same-origin Vite (menghindari blokir cookie SameSite antara localhost vs 127.0.0.1).
 */
function resolveApiBaseUrl(): string {
  const raw = ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_URL || '').trim();
  if (!raw) return '';
  if (typeof window !== 'undefined') {
    try {
      const parsed = new URL(raw);
      const pageHost = window.location.hostname;
      const isLoopback = (h: string) => h === 'localhost' || h === '127.0.0.1';
      if (isLoopback(parsed.hostname) && isLoopback(pageHost) && parsed.hostname !== pageHost) {
        parsed.hostname = pageHost;
        return parsed.origin;
      }
    } catch {
      return raw.replace(/\/$/, '');
    }
  }
  return raw.replace(/\/$/, '');
}

export const API_BASE_URL = resolveApiBaseUrl();

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    if (
      res.status === 401 &&
      typeof window !== 'undefined' &&
      path !== '/api/auth/me' &&
      path !== '/api/auth/login' &&
      path !== '/api/auth/google'
    ) {
      window.dispatchEvent(new CustomEvent('diginomic:unauthorized'));
    }
    const message =
      typeof data === 'object' && data !== null && 'error' in data
        ? (data as { error?: { message?: string } }).error?.message || 'Permintaan gagal.'
        : 'Permintaan gagal.';
    throw new Error(message);
  }
  return data as T;
}
