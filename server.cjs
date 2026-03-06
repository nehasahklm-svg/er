/**
 * Production server for the EC Election app.
 *
 * - Serves static files from ./dist
 * - Proxies /election-gov-proxy/* to result.election.gov.np
 *   (with session-cookie + CSRF-token management, exactly like the Vite dev plugin)
 *
 * Usage:
 *   node server.cjs
 *   PORT=3000 node server.cjs   (default: 3000)
 */

'use strict';

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, 'dist');
const EC_BASE = 'https://result.election.gov.np';
const SESSION_TTL = 8 * 60 * 1000; // 8 minutes

// ── MIME types ────────────────────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.txt':  'text/plain',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

// ── HTTPS helper ──────────────────────────────────────────────────────────────
function httpsGetBuffer(targetUrl, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(targetUrl);
    https.get(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ...headers,
        },
      },
      (res) => {
        const chunks = [];
        const cookies = res.headers['set-cookie'] || [];
        const contentType = res.headers['content-type'] || '';
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () =>
          resolve({ status: res.statusCode || 0, data: Buffer.concat(chunks), contentType, cookies })
        );
      }
    ).on('error', reject);
  });
}

// ── Session management ────────────────────────────────────────────────────────
let session = null;

async function refreshSession() {
  const page = await httpsGetBuffer(`${EC_BASE}/MapElectionResult2082.aspx`, {
    Accept: 'text/html,application/xhtml+xml',
    'Accept-Language': 'en-US,en;q=0.9',
  });
  const cookieStr = page.cookies.map((c) => c.split(';')[0]).join('; ');
  const csrfToken =
    page.cookies
      .find((c) => c.includes('CsrfToken'))
      ?.split('=')[1]
      ?.split(';')[0] ?? '';
  console.log('[proxy] Session refreshed');
  return { cookieStr, csrfToken, fetchedAt: Date.now() };
}

async function getSession() {
  if (!session || Date.now() - session.fetchedAt > SESSION_TTL) {
    session = await refreshSession();
  }
  return session;
}

// ── Request handler ───────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url || '/');
  const pathname = parsedUrl.pathname || '/';

  // ── Proxy handler ──────────────────────────────────────────────────────────
  if (pathname.startsWith('/election-gov-proxy')) {
    try {
      const sess = await getSession();
      const targetPath = req.url.replace('/election-gov-proxy', '') || '/';
      const targetUrl = `${EC_BASE}${targetPath}`;
      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(targetPath);

      const ecRes = await httpsGetBuffer(targetUrl, {
        Cookie: sess.cookieStr,
        'X-CSRF-Token': sess.csrfToken,
        Accept: isImage
          ? 'image/jpeg,image/*,*/*'
          : 'application/json, text/plain, */*',
        'X-Requested-With': 'XMLHttpRequest',
        Referer: `${EC_BASE}/MapElectionResult2082.aspx`,
      });

      res.writeHead(ecRes.status, {
        'Content-Type': ecRes.contentType || (isImage ? 'image/jpeg' : 'application/json; charset=utf-8'),
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': isImage ? 'public, max-age=3600' : 'public, max-age=30',
      });
      res.end(ecRes.data);
    } catch (err) {
      console.error('[proxy] Error:', err);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Proxy error', message: String(err) }));
    }
    return;
  }

  // ── Static file handler ────────────────────────────────────────────────────
  let filePath = path.join(DIST, pathname === '/' ? 'index.html' : pathname);

  // SPA fallback: serve index.html for unknown paths
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html');
  }

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`EC Election server running on http://localhost:${PORT}`);
  console.log(`Serving static files from: ${DIST}`);
  console.log(`Proxying /election-gov-proxy/* → ${EC_BASE}`);
});
