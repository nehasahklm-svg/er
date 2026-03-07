/**
 * Vercel Serverless Function for EC Election Proxy
 * Handles proxying requests to result.election.gov.np with session management
 */

const https = require('https');

const EC_BASE = 'https://result.election.gov.np';
const SESSION_TTL = 8 * 60 * 1000; // 8 minutes

// Global session cache (persists across invocations in the same container)
let sessionCache = null;

/**
 * Fetch data from a URL using HTTPS
 */
function httpsGetBuffer(url, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
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
          resolve({
            status: res.statusCode || 0,
            data: Buffer.concat(chunks),
            contentType,
            cookies,
          })
        );
      }
    ).on('error', reject);
  });
}

/**
 * Refresh the session by fetching a new page and extracting cookies/CSRF token
 */
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
  
  console.log('[Vercel Proxy] Session refreshed');
  return { cookieStr, csrfToken, fetchedAt: Date.now() };
}

/**
 * Get or refresh the session
 */
async function getSession() {
  if (!sessionCache || Date.now() - sessionCache.fetchedAt > SESSION_TTL) {
    sessionCache = await refreshSession();
  }
  return sessionCache;
}

/**
 * Main handler for Vercel serverless function
 */
module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Get session (with automatic refresh)
    const session = await getSession();
    
    // Build target URL from query parameters
    const { path: targetPath, ...queryParams } = req.query;
    
    // Reconstruct the full path with query string
    let fullPath = `/${targetPath || ''}`;
    const queryString = new URLSearchParams(queryParams).toString();
    if (queryString) {
      fullPath += `?${queryString}`;
    }
    
    const targetUrl = `${EC_BASE}${fullPath}`;
    
    // Check if it's an image request
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fullPath);
    
    // Fetch from EC with session
    const ecRes = await httpsGetBuffer(targetUrl, {
      Cookie: session.cookieStr,
      'X-CSRF-Token': session.csrfToken,
      Accept: isImage ? 'image/jpeg,image/*,*/*' : 'application/json, text/plain, */*',
      'X-Requested-With': 'XMLHttpRequest',
      Referer: `${EC_BASE}/MapElectionResult2082.aspx`,
    });
    
    // Set response headers
    res.setHeader('Content-Type', ecRes.contentType || (isImage ? 'image/jpeg' : 'application/json; charset=utf-8'));
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', isImage ? 'public, max-age=3600' : 'public, max-age=30');
    res.status(ecRes.status).send(ecRes.data);
    
  } catch (err) {
    console.error('[Vercel Proxy] Error:', err);
    res.status(502).json({ 
      error: 'Proxy error', 
      message: err.message 
    });
  }
};
