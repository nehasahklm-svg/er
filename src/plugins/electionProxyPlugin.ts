import type { Plugin } from 'vite';
import https from 'https';
import type { IncomingMessage, ServerResponse } from 'http';

interface Session {
  cookieStr: string;
  csrfToken: string;
  fetchedAt: number;
}

const SESSION_TTL = 8 * 60 * 1000; // 8 minutes
const EC_BASE = 'https://result.election.gov.np';

function httpsGetBuffer(url: string, headers: Record<string, string>): Promise<{ status: number; data: Buffer; contentType: string; cookies: string[] }> {
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
        const chunks: Buffer[] = [];
        const cookies = (res.headers['set-cookie'] as string[]) || [];
        const contentType = (res.headers['content-type'] as string) || '';
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => resolve({
          status: res.statusCode ?? 0,
          data: Buffer.concat(chunks),
          contentType,
          cookies,
        }));
      }
    ).on('error', reject);
  });
}

async function refreshSession(): Promise<Session> {
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
  return { cookieStr, csrfToken, fetchedAt: Date.now() };
}

export function electionProxyPlugin(): Plugin {
  let session: Session | null = null;

  async function getSession(): Promise<Session> {
    if (!session || Date.now() - session.fetchedAt > SESSION_TTL) {
      session = await refreshSession();
    }
    return session;
  }

  return {
    name: 'election-gov-proxy',
    configureServer(server) {
      server.middlewares.use(
        '/election-gov-proxy',
        async (req: IncomingMessage, res: ServerResponse) => {
          try {
            const sess = await getSession();
            const targetPath = req.url ?? '/';
            const targetUrl = `${EC_BASE}${targetPath}`;
            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(targetPath);

            const ecRes = await httpsGetBuffer(targetUrl, {
              Cookie: sess.cookieStr,
              'X-CSRF-Token': sess.csrfToken,
              Accept: isImage ? 'image/jpeg,image/*,*/*' : 'application/json, text/plain, */*',
              'X-Requested-With': 'XMLHttpRequest',
              Referer: `${EC_BASE}/MapElectionResult2082.aspx`,
            });

            res.setHeader('Content-Type', ecRes.contentType || (isImage ? 'image/jpeg' : 'application/json; charset=utf-8'));
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cache-Control', isImage ? 'public, max-age=3600' : 'public, max-age=30');
            res.statusCode = ecRes.status;
            res.end(ecRes.data);
          } catch (err) {
            console.error('[election-proxy] Error:', err);
            res.statusCode = 502;
            res.end(JSON.stringify({ error: 'Proxy error', message: String(err) }));
          }
        }
      );
    },
  };
}
