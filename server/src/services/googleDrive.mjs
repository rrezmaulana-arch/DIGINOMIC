/**
 * Google Drive Service — Diginomic Fest 2027
 * Mendukung OAuth 2.0 Refresh Token (akun Google Drive panitia) dan Service Account (Shared Drive).
 * Tidak ada link Drive yang keluar ke endpoint publik/peserta.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

let _accessToken = null;
let _tokenExpiry = 0;

function loadServiceAccount(credPath) {
  const resolved = path.resolve(credPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Service account JSON tidak ditemukan: ${resolved}`);
  }
  return JSON.parse(fs.readFileSync(resolved, 'utf8'));
}

async function getAccessToken({ credPath, clientId, clientSecret, refreshToken } = {}) {
  if (_accessToken && Date.now() < _tokenExpiry - 60_000) return _accessToken;

  if (refreshToken && clientId && clientSecret) {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }).toString(),
    });
    const data = await res.json();
    if (!data.access_token) {
      throw new Error('Gagal refresh Google Drive token: ' + JSON.stringify(data));
    }
    _accessToken = data.access_token;
    _tokenExpiry = Date.now() + Number(data.expires_in || 3600) * 1000;
    return _accessToken;
  }

  const sa = loadServiceAccount(credPath);
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const claim = Buffer.from(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/drive',
      aud: sa.token_uri,
      exp: now + 3600,
      iat: now,
    })
  ).toString('base64url');

  const sig = crypto
    .sign('RSA-SHA256', Buffer.from(header + '.' + claim), sa.private_key)
    .toString('base64url');

  const res = await fetch(sa.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${header}.${claim}.${sig}`,
  });

  const data = await res.json();
  if (!data.access_token) throw new Error('Gagal mendapatkan Drive access token: ' + JSON.stringify(data));

  _accessToken = data.access_token;
  _tokenExpiry = Date.now() + Number(data.expires_in || 3600) * 1000;
  return _accessToken;
}

async function driveRequest(method, url, body, token, contentType) {
  const headers = { Authorization: `Bearer ${token}` };
  if (contentType) headers['Content-Type'] = contentType;
  const res = await fetch(url, { method, headers, body });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Drive API error ${res.status}: ${err}`);
  }
  return res.json();
}

/** Buat atau temukan subfolder di dalam parentId berdasarkan nama */
async function ensureFolder(name, parentId, token) {
  const escaped = name.replace(/'/g, "\\'");
  const q = encodeURIComponent(
    `name='${escaped}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
  );
  const listRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)&supportsAllDrives=true&includeItemsFromAllDrives=true`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const listData = await listRes.json();
  if (listData.files && listData.files.length > 0) return listData.files[0].id;

  const created = await driveRequest(
    'POST',
    'https://www.googleapis.com/drive/v3/files?supportsAllDrives=true',
    JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] }),
    token,
    'application/json'
  );
  return created.id;
}

/**
 * Buat struktur folder otomatis saat registrasi:
 * Root/[Lomba]/[KodeReg]_[NamaTim/Peserta]_[Kampus]/
 */
export async function ensureRegistrationFolder({
  credPath,
  clientId,
  clientSecret,
  refreshToken,
  rootFolderId,
  competition,
  registrationCode,
  teamName,
  institution,
}) {
  const token = await getAccessToken({ credPath, clientId, clientSecret, refreshToken });

  const lombaName =
    competition.includes('esai') || competition.includes('Esai') ? 'Esai Nasional' : 'Mini Case Competition';
  const lombaFolderId = await ensureFolder(lombaName, rootFolderId, token);

  const safeName = (str) => str.replace(/[^a-zA-Z0-9 _\-\u00C0-\u024F]/g, '').trim().slice(0, 40);
  const folderLabel =
    `${registrationCode}_${safeName(teamName || '')}` + (institution ? `_${safeName(institution)}` : '');
  const teamFolderId = await ensureFolder(folderLabel, lombaFolderId, token);

  return { lombaFolderId, teamFolderId };
}

/**
 * Upload file ke folder Drive.
 * Returns: { fileId, webViewLink, fileName }
 */
export async function uploadFileToDrive({
  credPath,
  clientId,
  clientSecret,
  refreshToken,
  folderId,
  fileBuffer,
  originalName,
  mimeType,
}) {
  const token = await getAccessToken({ credPath, clientId, clientSecret, refreshToken });

  const metadata = JSON.stringify({ name: originalName, parents: [folderId] });
  const boundary = '-------314159265358979';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelim = `\r\n--${boundary}--`;

  const metaPart = `Content-Type: application/json; charset=UTF-8\r\n\r\n${metadata}`;
  const filePart = `Content-Type: ${mimeType}\r\nContent-Transfer-Encoding: base64\r\n\r\n${fileBuffer.toString('base64')}`;

  const multipartBody = delimiter + metaPart + delimiter + filePart + closeDelim;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,name&supportsAllDrives=true',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary="${boundary}"`,
      },
      body: multipartBody,
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Upload Drive gagal ${res.status}: ${err}`);
  }

  const data = await res.json();
  return { fileId: data.id, webViewLink: data.webViewLink, fileName: data.name };
}

/**
 * Stream file dari Drive ke response HTTP (proxy aman untuk Admin/Juri).
 */
export async function streamFileFromDrive({ credPath, clientId, clientSecret, refreshToken, fileId, res }) {
  const token = await getAccessToken({ credPath, clientId, clientSecret, refreshToken });

  const metaRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?fields=name,mimeType,size&supportsAllDrives=true`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const meta = await metaRes.json();

  const fileRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!fileRes.ok) throw new Error(`Stream file gagal: ${fileRes.status}`);

  res.setHeader('Content-Type', meta.mimeType || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(meta.name || 'berkas')}"`);
  res.setHeader('Cache-Control', 'private, no-store');
  if (meta.size) res.setHeader('Content-Length', meta.size);

  const reader = fileRes.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(Buffer.from(value));
  }
  res.end();
}
