// serve.mjs — servidor estático de desenvolvimento (zero dependências)
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const PORT = process.env.PORT || 8123;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.css': 'text/css',
  '.md': 'text/plain; charset=utf-8',
};

createServer(async (req, res) => {
  // endpoint de desenvolvimento: salva um screenshot do canvas (POST dataURL)
  if (req.method === 'POST' && req.url.startsWith('/shot')) {
    let body = '';
    for await (const c of req) body += c;
    const b64 = body.replace(/^data:image\/png;base64,/, '');
    const name = new URL(req.url, 'http://x').searchParams.get('name') || 'shot';
    await writeFile(join(ROOT, 'tools', name + '.png'), Buffer.from(b64, 'base64'));
    res.writeHead(200); return res.end('ok');
  }
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path.endsWith('/')) path += 'index.html';
  const file = normalize(join(ROOT, path));
  if (!file.startsWith(normalize(ROOT))) { res.writeHead(403); return res.end(); }
  try {
    const data = await readFile(file);
    res.writeHead(200, {
      'Content-Type': MIME[extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(data);
  } catch {
    res.writeHead(404); res.end('404');
  }
}).listen(PORT, () => console.log(`Murrinha em http://localhost:${PORT}`));
