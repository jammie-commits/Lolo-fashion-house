import { HttpError, checkPassword, clearCookie, handle, isAuthed, json, readBody, sessionCookie } from './_lib.js';

const failures = new Map();

export default handle(
  async (req, res) => {
    if (req.method === 'GET') return json(res, 200, { authed: isAuthed(req) });

    if (req.method === 'DELETE') {
      res.setHeader('Set-Cookie', clearCookie());
      return json(res, 200, { authed: false });
    }

    if (req.method !== 'POST') throw new HttpError(405, 'Method not allowed');

    const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
    const recent = (failures.get(ip) || []).filter((t) => Date.now() - t < 15 * 60 * 1000);
    if (recent.length >= 8) throw new HttpError(429, 'Too many attempts. Try again in a few minutes.');

    const { password } = readBody(req);
    if (!checkPassword(password)) {
      failures.set(ip, [...recent, Date.now()]);
      await new Promise((r) => setTimeout(r, 600));
      throw new HttpError(401, 'Incorrect password');
    }

    failures.delete(ip);
    res.setHeader('Set-Cookie', sessionCookie(req));
    json(res, 200, { authed: true });
  },
  { auth: false },
);
