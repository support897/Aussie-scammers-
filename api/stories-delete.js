// Remove one story from a wall. Needs the WALL_ADMIN_KEY environment variable.
// POST /api/stories-delete {category, id, key}
import { put, list } from '@vercel/blob';

const FILES = { hackett: 'walls/stories-hackett.json', other: 'walls/stories-other.json' };

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};
  if (!process.env.WALL_ADMIN_KEY || body.key !== process.env.WALL_ADMIN_KEY) {
    return res.status(403).json({ error: 'Wrong key.' });
  }
  const category = FILES[body.category] ? body.category : null;
  if (!category || !body.id) return res.status(400).json({ error: 'Missing category or id.' });
  const file = FILES[category];
  try {
    const { blobs } = await list({ prefix: file, limit: 1 });
    const hit = blobs.find(b => b.pathname === file);
    if (!hit) return res.status(404).json({ error: 'Wall not found.' });
    const r = await fetch(hit.url, { headers: { Authorization: 'Bearer ' + process.env.BLOB_READ_WRITE_TOKEN } });
    const stories = await r.json();
    const kept = (Array.isArray(stories) ? stories : []).filter(s => s.id !== body.id);
    await put(file, JSON.stringify(kept), { access: 'private', contentType: 'application/json', addRandomSuffix: false, cacheControlMaxAge: 0 });
    return res.status(200).json({ ok: true, removed: stories.length - kept.length });
  } catch (e) {
    return res.status(500).json({ error: 'Could not remove the story.' });
  }
}
