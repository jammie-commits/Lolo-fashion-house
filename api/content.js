import { CONTENT_PATH, GALLERY_PATH, HttpError, collectPhotoRefs, handle, json, readBody, readJson, store, writeJson } from './_lib.js';

const isPlainObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

// The editor may change text and photo choices, but never the shape of the data the build relies on.
const sameShape = (a, b, path = 'content') => {
  if (typeof a === 'string') {
    if (typeof b !== 'string') throw new HttpError(400, `${path} must be text`);
    return;
  }
  if (Array.isArray(a)) {
    if (!Array.isArray(b)) throw new HttpError(400, `${path} must be a list`);
    if (a.length) b.forEach((x, i) => sameShape(a[Math.min(i, a.length - 1)], x, `${path}[${i}]`));
    return;
  }
  if (isPlainObject(a)) {
    if (!isPlainObject(b)) throw new HttpError(400, `${path} must be an object`);
    for (const k of Object.keys(a)) {
      if (!(k in b)) throw new HttpError(400, `${path}.${k} is missing`);
      sameShape(a[k], b[k], `${path}.${k}`);
    }
    for (const k of Object.keys(b)) if (!(k in a)) throw new HttpError(400, `Unknown field ${path}.${k}`);
  }
};

export default handle(async (req, res) => {
  const s = store();
  const current = await readJson(s, CONTENT_PATH);

  if (req.method === 'GET') return json(res, 200, { content: current });
  if (req.method !== 'PUT') throw new HttpError(405, 'Method not allowed');

  const { content } = readBody(req);
  if (!isPlainObject(content) || JSON.stringify(content).length > 200_000) throw new HttpError(400, 'Invalid content');
  sameShape(current, content);

  const gallery = await readJson(s, GALLERY_PATH);
  const known = new Set(gallery.map((g) => g.file));
  for (const ref of collectPhotoRefs(content)) {
    if (!known.has(ref)) throw new HttpError(400, `Photo ${ref} is not in the gallery`);
  }

  await writeJson(s, CONTENT_PATH, content, 'Admin: update site content');
  json(res, 200, { ok: true });
});
