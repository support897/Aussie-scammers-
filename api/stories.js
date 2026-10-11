// Live story walls for the Aussie Scammers site.
// Stories are kept as one JSON file per category in Vercel Blob.
// GET  /api/stories?category=hackett|other   -> list, newest first
// POST /api/stories  {category, name, anonymous, scammer, whenText, text, imageDataUrl}
// All text is stored as plain text and escaped by the browser when shown.
import { put, list } from '@vercel/blob';

const FILES = { hackett: 'walls/stories-hackett.json', other: 'walls/stories-other.json' };
const MAX_TEXT = 4000;
const MAX_NAME = 60;
const MAX_WHEN = 80;
const MAX_SCAMMER = 80;
const MAX_IMAGE_BYTES = 2600000;

async function readWall(file) {
  try {
    const { blobs } = await list({ prefix: file, limit: 1 });
    const hit = blobs.find(b => b.pathname === file);
    if (!hit) return [];
    const r = await fetch(hit.url, { headers: { Authorization: 'Bearer ' + process.env.BLOB_READ_WRITE_TOKEN } });
    if (!r.ok) return [];
    const data = await r.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

async function writeWall(file, stories) {
  await put(file, JSON.stringify(stories), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    cacheControlMaxAge: 0
  });
}

function clean(v, max) {
  return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, max);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') {
    const category = FILES[req.query.category] ? req.query.category : 'hackett';
    const stories = await readWall(FILES[category]);
    return res.status(200).json({ stories });
  }
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    body = body || {};
    if (body.website) return res.status(200).json({ ok: true }); // honeypot: pretend success
    const category = FILES[body.category] ? body.category : null;
    if (!category) return res.status(400).json({ error: 'Unknown category.' });
    const text = String(body.text || '').trim().slice(0, MAX_TEXT);
    if (text.length < 20) return res.status(400).json({ error: 'Please write a little more about what happened (at least a few sentences).' });
    const anonymous = !!body.anonymous;
    const name = anonymous ? '' : clean(body.name, MAX_NAME);
    const scammer = category === 'other' ? clean(body.scammer, MAX_SCAMMER) : '';
    if (category === 'other' && scammer.length < 2) return res.status(400).json({ error: 'Please name the person or business who scammed you.' });
    let imageUrl = null;
    if (body.imageDataUrl) {
      const m = /^data:image\/(jpeg|png|webp);base64,(.+)$/.exec(String(body.imageDataUrl));
      if (!m) return res.status(400).json({ error: 'That photo type is not supported. Please use a JPG, PNG or WebP photo.' });
      const buf = Buffer.from(m[2], 'base64');
      if (buf.length > MAX_IMAGE_BYTES) return res.status(400).json({ error: 'That photo is too big. Please try a smaller one.' });
      const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
      const up = await put('walls/uploads/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext, buf, { access: 'private', contentType: 'image/' + m[1], addRandomSuffix: false });
      imageUrl = up.pathname;
    }
    const story = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      ts: Date.now(),
      category,
      name: anonymous ? null : (name || null),
      scammer: scammer || null,
      whenText: clean(body.whenText, MAX_WHEN) || null,
      text,
      image: imageUrl
    };
    const stories = await readWall(FILES[category]);
    stories.unshift(story);
    await writeWall(FILES[category], stories.slice(0, 500));
    return res.status(200).json({ ok: true, story });
  }
  return res.status(405).json({ error: 'Method not allowed.' });
}
