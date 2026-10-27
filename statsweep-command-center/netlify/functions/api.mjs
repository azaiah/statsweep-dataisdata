// StatSweep Command Center API: one Netlify Function, data in Netlify Blobs.
//
// Storage layout (store "statsweep-command-center", strong consistency):
//   meta                    -> { versions: { "<collection>:<shard>": number } }   (tiny; clients poll this)
//   c/<collection>/<shard>  -> { docs: { [id]: data } }
// Big collections are split into shards so no single blob gets large and two people rarely write the same blob.
// Every write uses an etag check and retries, so simultaneous edits don't overwrite each other.
//
// Env vars (Netlify > Site configuration > Environment variables):
//   TEAM_PASSWORD      required. Shared password for Azaiah and Tony; also signs session tokens.
//   INGEST_KEY         required for the weekly sweep. Lets the sweep add new leads (and nothing else).
//   ANTHROPIC_API_KEY  optional. Turns on "Get AI coaching" on the Advisor page.
import { getStore } from '@netlify/blobs'
import crypto from 'node:crypto'

const SHARDS = { leads: 16, scripts: 4, activity: 4 }
const ALLOWED = new Set(['leads', 'scripts', 'activity', 'tasks', 'board', 'finance', 'sweeps', 'settings'])
const INGEST_ALLOWED = new Set(['leads', 'scripts', 'sweeps'])
const ACTIVITY_CAP = 600 // per shard (2,400 total), oldest pruned
const TOKEN_DAYS = 60

const store = () => getStore({ name: 'statsweep-command-center', consistency: 'strong' })
const shardCount = (c) => SHARDS[c] || 1
function shardOf(c, id) {
  const n = shardCount(c); if (n === 1) return 0
  let h = 0; for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h % n
}
const key = (c, s) => `c/${c}/${s}`
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })

/* ---------- auth ---------- */
const secret = () => process.env.TEAM_PASSWORD || ''
function sign(payload) { return crypto.createHmac('sha256', 'statsweep:' + secret()).update(payload).digest('base64url') }
function makeToken() { const p = Buffer.from(JSON.stringify({ exp: Date.now() + TOKEN_DAYS * 864e5 })).toString('base64url'); return p + '.' + sign(p) }
function checkToken(req) {
  const t = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  const [p, s] = t.split('.'); if (!p || !s || !secret()) return false
  const good = sign(p); if (s.length !== good.length || !crypto.timingSafeEqual(Buffer.from(s), Buffer.from(good))) return false
  try { return JSON.parse(Buffer.from(p, 'base64url').toString()).exp > Date.now() } catch { return false }
}
function safeEqual(a, b) { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y) }

/* ---------- blob helpers with optimistic concurrency ---------- */
async function readShard(st, c, s) { const r = await st.getWithMetadata(key(c, s), { type: 'json' }); return { data: r?.data || { docs: {} }, etag: r?.etag } }
async function writeWithRetry(st, k, mutate, tries = 8) {
  for (let i = 0; i < tries; i++) {
    const r = await st.getWithMetadata(k, { type: 'json' })
    const cur = r?.data, etag = r?.etag
    const next = mutate(cur ? structuredClone(cur) : null)
    if (next === undefined) return cur
    const res = etag ? await st.setJSON(k, next, { onlyIfMatch: etag }) : await st.setJSON(k, next, { onlyIfNew: true })
    if (res?.modified !== false) return next
    await new Promise((ok) => setTimeout(ok, 30 + Math.random() * 120))
  }
  throw new Error('Too many simultaneous edits. Try again.')
}
async function bumpVersions(st, shardKeys) {
  await writeWithRetry(st, 'meta', (m) => { m = m || { versions: {} }; for (const k of shardKeys) m.versions[k] = (m.versions[k] || 0) + 1; m.updatedAt = new Date().toISOString(); return m })
}
function merge(a, b) { // deep merge objects; arrays and scalars replace
  if (!a || typeof a !== 'object' || Array.isArray(a) || !b || typeof b !== 'object' || Array.isArray(b)) return b
  const o = { ...a }; for (const [k, v] of Object.entries(b)) o[k] = (v && typeof v === 'object' && !Array.isArray(v) && o[k] && typeof o[k] === 'object' && !Array.isArray(o[k])) ? merge(o[k], v) : v
  return o
}
// ops: [{ op: 'set'|'update'|'delete'|'create', c, id, data }]
async function applyOps(st, ops) {
  const groups = new Map()
  for (const o of ops) {
    if (!ALLOWED.has(o.c) || !o.id || !/^[A-Za-z0-9_\-.:@+~]{1,200}$/.test(o.id)) throw new Error('Bad document path: ' + o.c + '/' + o.id)
    const s = shardOf(o.c, o.id); const k = o.c + ':' + s
    if (!groups.has(k)) groups.set(k, { c: o.c, s, ops: [] }); groups.get(k).ops.push(o)
  }
  const changed = []; let created = 0, skipped = 0
  for (const [k, g] of groups) {
    let didChange = false
    await writeWithRetry(st, key(g.c, g.s), (cur) => {
      cur = cur || { docs: {} }; didChange = false
      for (const o of g.ops) {
        const exists = Object.prototype.hasOwnProperty.call(cur.docs, o.id)
        if (o.op === 'delete') { if (exists) { delete cur.docs[o.id]; didChange = true } }
        else if (o.op === 'create') { if (exists) skipped++; else { cur.docs[o.id] = o.data; created++; didChange = true } }
        else if (o.op === 'update') { cur.docs[o.id] = merge(cur.docs[o.id] || {}, o.data); didChange = true }
        else { cur.docs[o.id] = o.data; didChange = true }
      }
      if (g.c === 'activity') { const ids = Object.keys(cur.docs); if (ids.length > ACTIVITY_CAP) { ids.sort((a, b) => String(cur.docs[a].at).localeCompare(String(cur.docs[b].at))).slice(0, ids.length - ACTIVITY_CAP).forEach((id) => delete cur.docs[id]) } }
      return didChange ? cur : undefined
    })
    if (didChange) changed.push(k)
  }
  if (changed.length) await bumpVersions(st, changed)
  return { changed, created, skipped }
}

/* ---------- routes ---------- */
export default async (req) => {
  const url = new URL(req.url)
  const path = url.pathname.replace(/^\/api\/?/, '')
  const st = store()
  try {
    if (path === 'login' && req.method === 'POST') {
      if (!secret()) return json({ error: 'The team password has not been set up yet (TEAM_PASSWORD in Netlify).' }, 503)
      const { password } = await req.json().catch(() => ({}))
      if (!password || !safeEqual(password, secret())) { await new Promise((ok) => setTimeout(ok, 600)); return json({ error: 'Wrong password.' }, 401) }
      return json({ token: makeToken() })
    }

    // Weekly sweep import: create-only for leads/scripts (dedupe by id), set for sweeps.
    if (path === 'ingest' && req.method === 'POST') {
      const k = req.headers.get('x-ingest-key') || ''
      if (!process.env.INGEST_KEY || !safeEqual(k, process.env.INGEST_KEY)) return json({ error: 'Bad ingest key.' }, 401)
      const { docs = [] } = await req.json()
      if (!Array.isArray(docs) || docs.length > 500) return json({ error: 'Send 1-500 docs per request.' }, 400)
      const ops = docs.map((d) => { if (!INGEST_ALLOWED.has(d.c)) throw new Error('Ingest can only add leads, scripts and sweeps.'); return { op: d.c === 'sweeps' ? 'set' : 'create', c: d.c, id: d.id, data: d.data } })
      return json(await applyOps(st, ops))
    }
    if (path === 'ingest/ids' && req.method === 'GET') {
      const k = req.headers.get('x-ingest-key') || ''
      if (!process.env.INGEST_KEY || !safeEqual(k, process.env.INGEST_KEY)) return json({ error: 'Bad ingest key.' }, 401)
      const out = []
      for (let s = 0; s < shardCount('leads'); s++) { const { data } = await readShard(st, 'leads', s); for (const [id, d] of Object.entries(data.docs)) out.push({ id, name: d.name, city: d.city, state: d.state }) }
      return json({ leads: out })
    }

    if (!checkToken(req)) return json({ error: 'Sign in again.' }, 401)

    if (path === 'meta' && req.method === 'GET') {
      const m = await st.get('meta', { type: 'json' })
      return json({ versions: m?.versions || {}, shards: SHARDS })
    }
    if (path === 'shard' && req.method === 'GET') {
      const c = url.searchParams.get('c'), s = Number(url.searchParams.get('s') || 0)
      if (!ALLOWED.has(c) || c === 'scripts') return json({ error: 'Unknown collection' }, 400)
      const { data } = await readShard(st, c, s)
      return json({ docs: data.docs })
    }
    if (path === 'doc' && req.method === 'GET') {
      const c = url.searchParams.get('c'), id = url.searchParams.get('id')
      if (!ALLOWED.has(c)) return json({ error: 'Unknown collection' }, 400)
      const { data } = await readShard(st, c, shardOf(c, id))
      return json({ exists: Object.prototype.hasOwnProperty.call(data.docs, id), data: data.docs[id] || null })
    }
    if (path === 'write' && req.method === 'POST') {
      const { ops = [] } = await req.json()
      if (!Array.isArray(ops) || !ops.length || ops.length > 200) return json({ error: 'Send 1-200 ops.' }, 400)
      return json(await applyOps(st, ops.map((o) => ({ op: o.op, c: o.c, id: o.id, data: o.data }))))
    }
    if (path === 'seed' && req.method === 'POST') {
      // One-time import of the first sweep (bundled with the function). Never overwrites existing leads.
      const seed = (await import('./seed-data.mjs')).default
      const ops = []
      for (const [c, docs] of Object.entries(seed)) for (const [id, data] of Object.entries(docs)) ops.push({ op: 'create', c, id, data })
      // Loaded in slices (?offset=&limit=) so each request finishes well inside Netlify's function time limit.
      const offset = Math.max(0, Number(url.searchParams.get('offset') || 0)), limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') || 150)))
      const slice = ops.slice(offset, offset + limit)
      const r = slice.length ? await applyOps(st, slice) : { created: 0, skipped: 0 }
      return json({ created: r.created, skipped: r.skipped, next: offset + slice.length, total: ops.length, done: offset + slice.length >= ops.length })
    }
    if (path === 'coach' && req.method === 'POST') {
      if (!process.env.ANTHROPIC_API_KEY) return json({ error: 'AI coaching is off. Add ANTHROPIC_API_KEY in Netlify to turn it on.' }, 503)
      const { prompt } = await req.json()
      const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5', max_tokens: 700, messages: [{ role: 'user', content: String(prompt).slice(0, 12000) }] }) })
      const d = await r.json()
      if (!r.ok) return json({ error: d?.error?.message || 'The AI coach could not answer.' }, 502)
      return json({ text: (d.content || []).map((x) => x.text || '').join('') })
    }
    if (path === 'config' && req.method === 'GET') return json({ coach: !!process.env.ANTHROPIC_API_KEY })
    return json({ error: 'Not found' }, 404)
  } catch (e) {
    return json({ error: e?.message || 'Server error' }, 500)
  }
}

export const config = { path: '/api/*' }
