// Serves photos uploaded to the private Blob store.
// GET /api/image?path=walls/uploads/<file>.jpg
import { list } from '@vercel/blob';

const TYPES = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

export default async function handler(req, res) {
  const path = String((req.query && req.query.path) || '');
  if (!path.startsWith('walls/uploads/') || path.includes('..')) {
    return res.status(400).send('Bad path.');
  }
  try {
    const { blobs } = await list({ prefix: path, limit: 1 });
    const hit = blobs.find(b => b.pathname === path);
    if (!hit) return res.status(404).send('Not found.');
    const r = await fetch(hit.url, { headers: { Authorization: 'Bearer ' + process.env.BLOB_READ_WRITE_TOKEN } });
    if (!r.ok) return res.status(502).send('Could not load the photo.');
    const ext = path.split('.').pop().toLowerCase();
    res.setHeader('Content-Type', TYPES[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    const buf = Buffer.from(await r.arrayBuffer());
    return res.status(200).send(buf);
  } catch (e) {
    return res.status(500).send('Could not load the photo.');
  }
}
