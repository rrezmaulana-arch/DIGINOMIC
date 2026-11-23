import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

/**
 * Deteksi tipe berkas asli dari magic bytes (bukan ekstensi atau Content-Type browser).
 * Hanya izinkan JPG, PNG, dan PDF sesuai PRD Bagian 9.10 & 12.2.
 */
export function detectFileType(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 8) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: 'jpg', mime: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { ext: 'png', mime: 'image/png' };
  }

  // PDF: 25 50 44 46 2D ("%PDF-")
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  ) {
    return { ext: 'pdf', mime: 'application/pdf' };
  }

  return null;
}

export async function savePrivateFile({ buffer, uploadDir, subFolder, maxBytes }) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    const err = new Error('Berkas kosong atau tidak ditemukan.');
    err.status = 422;
    err.code = 'EMPTY_FILE';
    throw err;
  }

  if (buffer.length > maxBytes) {
    const err = new Error(`Ukuran berkas melebihi batas maksimal ${Math.round(maxBytes / (1024 * 1024))} MB.`);
    err.status = 413;
    err.code = 'FILE_TOO_LARGE';
    throw err;
  }

  const detected = detectFileType(buffer);
  if (!detected) {
    const err = new Error('Tipe berkas tidak didukung. Hanya JPG, PNG, dan PDF asli yang diperbolehkan.');
    err.status = 415;
    err.code = 'UNSUPPORTED_MEDIA_TYPE';
    throw err;
  }

  const safeFolder = subFolder.replace(/[^a-z0-9_-]/gi, '');
  const targetDir = path.resolve(uploadDir, safeFolder);
  const resolvedRoot = path.resolve(uploadDir);
  if (!targetDir.startsWith(resolvedRoot + path.sep)) {
    const err = new Error('Direktori unggahan tidak valid.');
    err.status = 400;
    err.code = 'INVALID_UPLOAD_PATH';
    throw err;
  }

  await fs.mkdir(targetDir, { recursive: true });
  const filename = `${crypto.randomUUID()}.${detected.ext}`;
  const fullPath = path.resolve(targetDir, filename);
  await fs.writeFile(fullPath, buffer, { mode: 0o600 });

  return {
    relativePath: `${safeFolder}/${filename}`,
    mime: detected.mime,
    ext: detected.ext,
    size: buffer.length,
  };
}

/**
 * Membaca berkas privat dengan perlindungan anti path-traversal.
 */
export async function readPrivateFile(uploadDir, relativePath) {
  if (!relativePath || typeof relativePath !== 'string' || relativePath.includes('..') || relativePath.includes('\0')) {
    const err = new Error('Path berkas tidak valid.');
    err.status = 400;
    err.code = 'INVALID_FILE_PATH';
    throw err;
  }

  const resolvedRoot = path.resolve(uploadDir);
  const fullPath = path.resolve(resolvedRoot, relativePath);
  if (!fullPath.startsWith(resolvedRoot + path.sep)) {
    const err = new Error('Akses path di luar direktori unggahan ditolak.');
    err.status = 403;
    err.code = 'PATH_TRAVERSAL_BLOCKED';
    throw err;
  }

  try {
    const buffer = await fs.readFile(fullPath);
    const detected = detectFileType(buffer) || { ext: 'bin', mime: 'application/octet-stream' };
    return { buffer, mime: detected.mime, filename: path.basename(fullPath) };
  } catch {
    const err = new Error('Berkas tidak ditemukan.');
    err.status = 404;
    err.code = 'FILE_NOT_FOUND';
    throw err;
  }
}
