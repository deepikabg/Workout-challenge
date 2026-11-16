// Tiny static server for local runs and journey tests: node scripts/serve.mjs [port]
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml' };

export function startServer(port = 8080) {
  return new Promise(resolve => {
    const srv = createServer(async (req, res) => {
      const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
      const file = join(ROOT, path.endsWith('/') ? path + 'index.html' : path);
      if (!file.startsWith(ROOT) || /[/\\]\.(git|pipeline)([/\\]|$)/.test(file)) { res.writeHead(404); return res.end(); }
      try { const body = await readFile(file); res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' }); res.end(body); }
      catch { res.writeHead(404); res.end('not found'); }
    }).listen(port, '127.0.0.1', () => resolve({ url: `http://127.0.0.1:${srv.address().port}/`, close: () => srv.close() }));
  });
}
if (import.meta.url === `file://${process.argv[1]}`) startServer(+process.argv[2] || 8080).then(s => console.log('Serving', s.url));
