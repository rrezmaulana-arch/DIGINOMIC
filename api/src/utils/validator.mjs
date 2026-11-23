const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^(?:\+62|62|0)8[1-9][0-9]{6,11}$/;
const URL_RE = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function normalizePhoneWa(phone) {
  const cleaned = String(phone || '').replace(/[\s\-().]/g, '');
  if (cleaned.startsWith('+62')) return '62' + cleaned.slice(3);
  if (cleaned.startsWith('0')) return '62' + cleaned.slice(1);
  return cleaned;
}

export function isValidEmail(email) {
  const clean = normalizeEmail(email);
  return clean.length <= 255 && EMAIL_RE.test(clean);
}

export function isValidPassword(password) {
  if (typeof password !== 'string') return false;
  if (password.length < 8 || password.length > 128) return false;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  return hasLetter && hasDigit;
}

export function isValidPhoneWa(phone) {
  const cleaned = String(phone || '').replace(/[\s\-().]/g, '');
  return PHONE_RE.test(cleaned);
}

export function isValidHttpUrl(url) {
  if (typeof url !== 'string' || url.length > 2048) return false;
  return URL_RE.test(url.trim());
}

/**
 * Pastikan string bebas tag HTML mentah / karakter kontrol berbahaya (sesuai PRD Bagian 12.2).
 */
export function sanitizePlainText(value, maxLen = 500) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLen);
}

export function containsHtmlTags(value) {
  return typeof value === 'string' && /<\s*\/?\s*[a-z][^>]*>/i.test(value);
}

export function isValidUuid(id) {
  return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}
