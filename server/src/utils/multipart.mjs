/**
 * Parser multipart/form-data ringan dan aman dengan pembatasan ukuran body.
 */
export async function readBodyBuffer(req, maxBytes) {
  const chunks = [];
  let total = 0;

  for await (const chunk of req) {
    total += chunk.length;
    if (total > maxBytes) {
      const err = new Error('Ukuran payload melebihi batas maksimal.');
      err.status = 413;
      err.code = 'PAYLOAD_TOO_LARGE';
      throw err;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function parseMultipartFormData(req, maxTotalBytes) {
  const contentType = req.headers['content-type'] || '';
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;\s]+))/i);
  if (!boundaryMatch) {
    const err = new Error('Header multipart/form-data tidak valid.');
    err.status = 400;
    err.code = 'INVALID_MULTIPART';
    throw err;
  }

  const boundary = boundaryMatch[1] || boundaryMatch[2];
  const raw = await readBodyBuffer(req, maxTotalBytes);
  const boundaryBuf = Buffer.from(`--${boundary}`);
  const fields = {};
  const files = {};

  let pos = raw.indexOf(boundaryBuf);
  if (pos === -1) return { fields, files };

  while (pos !== -1) {
    pos += boundaryBuf.length;
    // End boundary "--"
    if (raw[pos] === 0x2d && raw[pos + 1] === 0x2d) break;
    // Skip CRLF
    if (raw[pos] === 0x0d && raw[pos + 1] === 0x0a) pos += 2;

    const nextPos = raw.indexOf(boundaryBuf, pos);
    if (nextPos === -1) break;

    const part = raw.subarray(pos, nextPos - 2); // strip trailing CRLF
    const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));
    if (headerEnd !== -1) {
      const headerStr = part.subarray(0, headerEnd).toString('utf8');
      const bodyBuf = part.subarray(headerEnd + 4);
      const dispMatch = headerStr.match(/content-disposition:\s*form-data;\s*name="([^"]+)"(?:;\s*filename="([^"]*)")?/i);
      if (dispMatch) {
        const name = dispMatch[1];
        const filename = dispMatch[2];
        if (filename !== undefined) {
          files[name] = { filename, buffer: Buffer.from(bodyBuf) };
        } else {
          fields[name] = bodyBuf.toString('utf8');
        }
      }
    }
    pos = nextPos;
  }

  return { fields, files };
}
