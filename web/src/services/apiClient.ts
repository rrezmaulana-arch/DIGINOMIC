/**
 * Klien HTTP ringan untuk menghubungkan frontend web/ ke backend API (Express/Node).
 * Secara default mengarah ke http://127.0.0.1:4001 (dapat diubah via VITE_API_URL di web/.env).
 */
export const API_BASE_URL =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_URL ||
  'http://127.0.0.1:4001';

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
    credentials: 'include', // Wajib agar cookie HttpOnly digi_sid ikut terkirim
  });

  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      typeof data === 'object' && data !== null && 'error' in data
        ? (data as { error?: { message?: string } }).error?.message || 'Permintaan gagal.'
        : 'Permintaan gagal.';
    throw new Error(message);
  }
  return data as T;
}
