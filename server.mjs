// Self-hosted LoLo server: serves the generated site and runs the admin API.
// Admin edits are written to data/ and site/assets/gallery on this machine, then the pages are regenerated.
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { gzipSync } from 'node:zlib';
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
process.chdir(root);
process.env.ADMIN_STORAGE = 'fs';

if (!process.env.ADMIN_PASSWORD) {
  console.error('ADMIN_PASSWORD is not set. Refusing to start.');
  process.exit(1);
}

const { default: auth } = await import('./api/auth.js');
const { default: content } = await import('./api/content.js');
const { default: photos } = await import('./api/photos.js');
const routes = { '/api/auth': auth, '/api/content': content, '/api/photos': photos };

const PORT = Number(process.env.PORT || 3000);
const siteDir = join(root, 'site');
const MAX_BODY = 8 * 1024 * 1024;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
};

let building = false;
let queued = false;
const rebuild = () => {
  if (building) {
    queued = true;
    return;
  }
  building = true;
  const child = spawn(process.execPath, ['scripts/build.mjs'], { cwd: root, stdio: 'inherit' });
  child.on('close', () => {
    building = false;
    if (queued) {
      queued = false;
      rebuild();
    }
  });
};

const readJsonBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(Object.assign(new Error('Too large'), { status: 413 }));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {});
      } catch {
        reject(Object.assign(new Error('Invalid JSON'), { status: 400 }));
      }
    });
    req.on('error', reject);
  });

const send = (res, status, body, headers = {}) => {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', ...headers });
  res.end(body);
};

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

const serveStatic = async (req, res, pathname) => {
  let rel = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  if (rel.endsWith('/')) rel += 'index.html';
  let file = join(siteDir, rel);
  if (!file.startsWith(siteDir)) return send(res, 403, 'Forbidden');
  let info = await stat(file).catch(() => null);
  if (info?.isDirectory()) {
    file = join(file, 'index.html');
    info = await stat(file).catch(() => null);
  }
  if (!info) return send(res, 404, 'Not found', securityHeaders);

  const ext = extname(file).toLowerCase();
  const headers = {
    ...securityHeaders,
    'Content-Type': types[ext] || 'application/octet-stream',
    'Content-Length': info.size,
    'Cache-Control': ext === '.html' || ext === '.xml' ? 'no-cache' : ext === '.jpg' ? 'public, max-age=604800' : 'public, max-age=3600',
  };
  if (pathname.startsWith('/admin')) {
    headers['X-Robots-Tag'] = 'noindex, nofollow';
    headers['Cache-Control'] = 'no-store';
  }
  if (/\.(html|css|js|xml|json|svg|txt)$/.test(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
    const body = gzipSync(await readFile(file));
    res.writeHead(200, { ...headers, 'Content-Length': body.length, 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' });
    return res.end(req.method === 'HEAD' ? undefined : body);
  }
  res.writeHead(200, headers);
  if (req.method === 'HEAD') return res.end();
  createReadStream(file).pipe(res);
};

createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, 'http://localhost');
    const route = routes[pathname];
    if (route) {
      if (req.method !== 'GET' && req.method !== 'DELETE' && req.method !== 'HEAD') req.body = await readJsonBody(req);
      if (req.method !== 'GET') {
        res.on('finish', () => {
          if (pathname !== '/api/auth' && res.statusCode < 300) rebuild();
        });
      }
      return await route(req, res);
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
    await serveStatic(req, res, pathname);
  } catch (err) {
    if (!res.headersSent) send(res, err.status || 500, err.status ? err.message : 'Server error');
    else res.end();
    if (!err.status) console.error(err);
  }
}).listen(PORT, () => console.log(`LoLo server listening on :${PORT}`));
