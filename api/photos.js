import {
  CONTENT_PATH,
  FILE_RE,
  GALLERY_PATH,
  HttpError,
  PHOTO_DIR,
  collectPhotoRefs,
  decodeJpeg,
  handle,
  json,
  newPhotoName,
  readBody,
  readJson,
  replacePhotoRef,
  store,
  writeJson,
} from './_lib.js';

const text = (v, max) => String(v ?? '').trim().slice(0, max);

export default handle(async (req, res) => {
  const s = store();
  const gallery = await readJson(s, GALLERY_PATH);

  if (req.method === 'GET') {
    const content = await readJson(s, CONTENT_PATH);
    return json(res, 200, { photos: gallery, used: [...collectPhotoRefs(content)] });
  }

  const body = readBody(req);
  const entry = body.file && gallery.find((g) => g.file === body.file);
  if (body.file && (!FILE_RE.test(body.file) || !entry)) throw new HttpError(404, 'Photo not found');

  if (req.method === 'POST') {
    const file = newPhotoName();
    await s.write(`${PHOTO_DIR}/${file}`, decodeJpeg(body.image), 'Admin: add photo');
    const added = { file, alt: text(body.alt, 200) || 'Outfit made by LoLo Fashion House', listed: body.listed !== false };
    await writeJson(s, GALLERY_PATH, [...gallery, added], 'Admin: add photo to gallery');
    return json(res, 201, { photo: added });
  }

  // Update caption/visibility, or swap in a new image while keeping every place the old one was used.
  if (req.method === 'PUT') {
    if (!entry) throw new HttpError(400, 'file is required');
    let next = { ...entry };
    if (body.alt !== undefined) next.alt = text(body.alt, 200) || entry.alt;
    if (body.listed !== undefined) next.listed = Boolean(body.listed);

    if (body.image) {
      const file = newPhotoName();
      await s.write(`${PHOTO_DIR}/${file}`, decodeJpeg(body.image), 'Admin: replace photo');
      next = { ...next, file };
      const content = await readJson(s, CONTENT_PATH);
      await writeJson(s, CONTENT_PATH, replacePhotoRef(content, entry.file, file), 'Admin: point content at replaced photo');
      await writeJson(s, GALLERY_PATH, gallery.map((g) => (g.file === entry.file ? next : g)), 'Admin: update gallery');
      await s.remove(`${PHOTO_DIR}/${entry.file}`, 'Admin: remove replaced photo');
    } else {
      await writeJson(s, GALLERY_PATH, gallery.map((g) => (g.file === entry.file ? next : g)), 'Admin: update photo details');
    }
    return json(res, 200, { photo: next });
  }

  if (req.method === 'DELETE') {
    if (!entry) throw new HttpError(400, 'file is required');
    const content = await readJson(s, CONTENT_PATH);
    if (collectPhotoRefs(content).has(entry.file)) {
      throw new HttpError(409, 'This photo is used on a page. Choose a different photo there first, then delete it.');
    }
    await writeJson(s, GALLERY_PATH, gallery.filter((g) => g.file !== entry.file), 'Admin: remove photo from gallery');
    await s.remove(`${PHOTO_DIR}/${entry.file}`, 'Admin: delete photo');
    return json(res, 200, { ok: true });
  }

  throw new HttpError(405, 'Method not allowed');
});
