import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const SESSION_SECONDS = 60 * 60 * 8;
export const CONTENT_PATH = 'data/content.json';
export const GALLERY_PATH = 'data/gallery.json';
export const PHOTO_DIR = 'site/assets/gallery';
export const FILE_RE = /^[A-Za-z0-9_-]+\.jpg$/;

const env = (k, d = '') => process.env[k] || d;
const secret = () => createHash('sha256').update(`lolo-admin:${env('ADMIN_PASSWORD')}`).digest();

const sign = (exp) => createHmac('sha256', secret()).update(String(exp)).digest('hex');

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
};

export const checkPassword = (candidate) => Boolean(env('ADMIN_PASSWORD')) && safeEqual(candidate ?? '', env('ADMIN_PASSWORD'));

export const sessionCookie = (req) => {
  const exp = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const proto = req.headers['x-forwarded-proto'] || (req.socket?.encrypted ? 'https' : 'http');
  const secure = proto === 'https' ? '; Secure' : '';
  return `lolo_admin=${exp}.${sign(exp)}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${SESSION_SECONDS}${secure}`;
};

export const clearCookie = () => 'lolo_admin=; Path=/api; HttpOnly; SameSite=Strict; Max-Age=0';

export const isAuthed = (req) => {
  if (!env('ADMIN_PASSWORD')) return false;
  const raw = (req.headers.cookie || '').split(';').map((c) => c.trim()).find((c) => c.startsWith('lolo_admin='));
  if (!raw) return false;
  const [exp, sig] = raw.slice('lolo_admin='.length).split('.');
  return Number(exp) > Date.now() / 1000 && safeEqual(sig ?? '', sign(exp));
};

export const json = (res, status, body) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
};

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Rejects cross-site writes and non-JSON bodies, then returns the parsed body.
export const readBody = (req) => {
  const origin = req.headers.origin;
  if (origin && new URL(origin).host !== req.headers.host) throw new HttpError(403, 'Cross-site request blocked');
  if (!String(req.headers['content-type'] || '').startsWith('application/json')) throw new HttpError(415, 'JSON required');
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
  return body ?? {};
};

export const handle = (fn, { auth = true } = {}) => async (req, res) => {
  try {
    if (auth && !isAuthed(req)) throw new HttpError(401, 'Please log in');
    await fn(req, res);
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    if (status === 500) console.error(err);
    json(res, status, { error: status === 500 ? 'Something went wrong' : err.message });
  }
};

const github = () => {
  const token = env('GITHUB_TOKEN');
  const repo = env('GITHUB_REPO', 'jammie-commits/Lolo-fashion-house');
  const branch = env('GITHUB_BRANCH', 'main');
  if (!token) throw new HttpError(500, 'GITHUB_TOKEN is not configured');
  const call = async (path, init = {}) => {
    const r = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'lolo-admin', ...init.headers },
    });
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(`GitHub ${r.status}: ${await r.text()}`);
    return r.json();
  };
  return {
    async read(path) {
      const f = await call(`${path}?ref=${branch}`);
      return f && { content: Buffer.from(f.content, 'base64'), sha: f.sha };
    },
    async write(path, buffer, message) {
      const existing = await call(`${path}?ref=${branch}`);
      await call(path, {
        method: 'PUT',
        body: JSON.stringify({ message, content: buffer.toString('base64'), branch, ...(existing && { sha: existing.sha }) }),
      });
    },
    async remove(path, message) {
      const existing = await call(`${path}?ref=${branch}`);
      if (existing) await call(path, { method: 'DELETE', body: JSON.stringify({ message, sha: existing.sha, branch }) });
    },
  };
};

// ADMIN_STORAGE=fs writes to the local checkout. It is used by the self-hosted server (server.mjs) and for local testing.
const localFs = () => ({
  read: async (path) => readFile(join(process.cwd(), path)).then((content) => ({ content })).catch(() => null),
  write: async (path, buffer) => {
    const full = join(process.cwd(), path);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, buffer);
  },
  remove: async (path) => rm(join(process.cwd(), path), { force: true }),
});

export const store = () => (env('ADMIN_STORAGE') === 'fs' && !process.env.VERCEL ? localFs() : github());

export const readJson = async (s, path) => {
  const f = await s.read(path);
  if (!f) throw new HttpError(500, `${path} is missing`);
  return JSON.parse(f.content.toString('utf8'));
};

export const writeJson = (s, path, data, message) => s.write(path, Buffer.from(`${JSON.stringify(data, null, 2)}\n`), message);

const isPhotoRef = (v) => typeof v === 'string' && FILE_RE.test(v);

export const collectPhotoRefs = (node, out = new Set()) => {
  if (isPhotoRef(node)) out.add(node);
  else if (Array.isArray(node)) node.forEach((n) => collectPhotoRefs(n, out));
  else if (node && typeof node === 'object') Object.values(node).forEach((n) => collectPhotoRefs(n, out));
  return out;
};

export const replacePhotoRef = (node, from, to) => {
  if (node === from) return to;
  if (Array.isArray(node)) return node.map((n) => replacePhotoRef(n, from, to));
  if (node && typeof node === 'object') return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, replacePhotoRef(v, from, to)]));
  return node;
};

export const decodeJpeg = (dataUrlOrBase64) => {
  const b64 = String(dataUrlOrBase64 || '').replace(/^data:image\/jpeg;base64,/, '');
  const buf = Buffer.from(b64, 'base64');
  if (buf.length < 1000 || buf.length > 3.5 * 1024 * 1024) throw new HttpError(400, 'Photo must be a JPEG under 3.5 MB');
  if (!(buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff)) throw new HttpError(400, 'Photo must be a JPEG');
  return buf;
};

export const newPhotoName = () => `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}.jpg`;
