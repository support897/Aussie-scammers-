// "Same happened to me" taps: one quiet count per story.
// GET  /api/me-too            -> {counts: {"story-1": 3, ...}}
// POST /api/me-too {story}    -> increments and returns the new count
import { put, get } from '@vercel/blob';

const FILE = 'walls/me-too.json';
const STORIES = ['story-1', 'story-2', 'story-3', 'story-4', 'story-5', 'story-6', 'story-7'];

async function readCounts() {
  try {
    const res = await get(FILE, { access: 'private', useCache: false });
    if (!res) return {};
    const data = JSON.parse(await new Response(res.stream).text());
    return data && typeof data === 'object' ? data : {};
  } catch (e) {
    return {};
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') {
    return res.status(200).json({ counts: await readCounts() });
  }
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    body = body || {};
    if (!STORIES.includes(body.story)) return res.status(400).json({ error: 'Unknown story.' });
    const counts = await readCounts();
    counts[body.story] = (counts[body.story] || 0) + 1;
    await put(FILE, JSON.stringify(counts), { access: 'private', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 0 });
    return res.status(200).json({ ok: true, count: counts[body.story] });
  }
  return res.status(405).json({ error: 'Method not allowed.' });
}
