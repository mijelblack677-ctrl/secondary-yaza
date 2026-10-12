'use strict';

/**
 * Swallows a request body into a Buffer.
 */
function drain(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

/**
 * Builds a multipart/form-data body + Content-Type header for { fields, files },
 * where each file is { name, filename, contentType, buffer }.
 */
function buildMultipart(fields, files) {
  const boundary = '----SecondaryYazaFormBoundary' + Math.random().toString(16).slice(2);
  const body = [];

  for (const f of fields) {
    body.push(
      `--${boundary}\r\nContent-Disposition: form-data; name="${f.name}"\r\n\r\n${f.value}`
    );
  }

  for (const file of files) {
    body.push(
      `--${boundary}\r\nContent-Disposition: form-data; name="${file.fieldName}"; filename="${file.filename.replace(/\r?\n/g, '')}"\r\n` +
      `Content-Type: ${file.contentType || 'application/octet-stream'}\r\n\r\n`
    );
  }

  body.push(`\r\n--${boundary}--\r\n`);
  const raw = body.join('').replace(/\r\n/g, '\r\n');
  return { body: Buffer.from(raw, 'utf8'), header: `multipart/form-data; boundary=${boundary}` };
}

/**
 * POST to the running server.
 */
async function postJson(url, headers, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body,
  });
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, body: JSON.parse(text) };
  } catch (_) {
    return { ok: res.ok, status: res.status, body: text };
  }
}

module.exports = {
  drain,
  buildMultipart,
  postJson,
};
