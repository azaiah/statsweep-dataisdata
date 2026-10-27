// Client data layer for the Netlify API. Exposes the same small API the app uses:
//   db.collection(name).onSnapshot(cb) / .orderBy(f, dir).limit(n).onSnapshot(cb)
//   db.doc('col/id').get() / set() / update() / delete() / onSnapshot(cb)
//   db.collection(name).doc(id).set(data)
// It polls a tiny version map every few seconds and only re-downloads the shards that changed,
// so both of you see each other's edits within a few seconds. Writes are applied locally right away.

const TOKEN_KEY = 'statsweep-cc-token'
const POLL_MS = 4000
export const auth = {
  get() { try { return localStorage.getItem(TOKEN_KEY) || '' } catch { return '' } },
  set(t) { try { localStorage.setItem(TOKEN_KEY, t) } catch {} },
  clear() { try { localStorage.removeItem(TOKEN_KEY) } catch {} },
}
async function api(path, opts = {}) {
  const r = await fetch('/api/' + path, { ...opts, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + auth.get(), ...(opts.headers || {}) } })
  const d = await r.json().catch(() => ({}))
  if (r.status === 401 && path !== 'login') { auth.clear(); window.dispatchEvent(new Event('statsweep-signed-out')) }
  if (!r.ok) { const e = new Error(d.error || 'Request failed'); e.status = r.status; throw e }
  return d
}
export async function login(password) { const d = await api('login', { method: 'POST', body: JSON.stringify({ password }) }); auth.set(d.token); return true }
export const serverApi = api

export function createDb(onError) {
  const cache = {}            // collection -> { id: data }
  const shardData = {}        // "c:s" -> { id: data }
  const seen = {}             // "c:s" -> version
  const listeners = new Set() // fn(collection)
  let shards = { leads: 16, scripts: 4, activity: 4 }
  const watched = new Set()
  let timer = null, polling = false, stopped = false

  const rebuild = (c) => { const n = shards[c] || 1; const o = {}; for (let s = 0; s < n; s++) Object.assign(o, shardData[c + ':' + s] || {}); cache[c] = o }
  const emit = (c) => listeners.forEach((fn) => fn(c))
  async function refresh(force = false) {
    if (polling || stopped) return; polling = true
    try {
      const m = await api('meta'); shards = { ...shards, ...(m.shards || {}) }
      for (const c of watched) {
        const n = shards[c] || 1; let changed = false
        await Promise.all(Array.from({ length: n }, async (_, s) => {
          const k = c + ':' + s; const v = m.versions[k] || 0
          if (!force && seen[k] === v && shardData[k]) return
          const d = await api(`shard?c=${c}&s=${s}`); shardData[k] = d.docs || {}; seen[k] = v; changed = true
        }))
        if (changed || !cache[c]) { rebuild(c); emit(c) }
      }
    } catch (e) { if (e.status !== 401) onError?.(e) } finally { polling = false }
  }
  function start() { if (timer) return; refresh(true); timer = setInterval(() => { if (document.visibilityState !== 'hidden') refresh() }, POLL_MS) }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refresh() })

  function local(c, id, op, data) { // optimistic local apply
    const s = (() => { const n = shards[c] || 1; if (n === 1) return 0; let h = 0; for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h % n })()
    const k = c + ':' + s; shardData[k] = { ...(shardData[k] || {}) }
    if (op === 'delete') delete shardData[k][id]
    else if (op === 'update') shardData[k][id] = deepMerge(shardData[k][id] || {}, data)
    else shardData[k][id] = data
    if (watched.has(c)) { rebuild(c); emit(c) }
  }
  async function write(c, id, op, data) {
    if (c !== 'scripts') local(c, id, op, data)
    try { await api('write', { method: 'POST', body: JSON.stringify({ ops: [{ op, c, id, data }] }) }) } catch (e) { onError?.(e); refresh(true); throw e }
  }
  const toList = (c) => Object.entries(cache[c] || {}).map(([id, d]) => ({ id, data: () => d, exists: true }))
  function query(c, order, lim) {
    return {
      orderBy: (f, dir = 'asc') => query(c, [f, dir], lim), limit: (n) => query(c, order, n), where: () => query(c, order, lim),
      doc: (id) => docRef(c, id || Math.random().toString(36).slice(2, 12)),
      onSnapshot(next) {
        watched.add(c); start()
        const fn = (changed) => { if (changed !== c || !cache[c]) return; let docs = toList(c); if (order) docs.sort((a, b) => { const x = a.data()[order[0]] || '', y = b.data()[order[0]] || ''; return (x > y ? 1 : x < y ? -1 : 0) * (order[1] === 'desc' ? -1 : 1) }); if (lim) docs = docs.slice(0, lim); next({ docs, size: docs.length, empty: !docs.length }) }
        listeners.add(fn); if (cache[c]) fn(c); else refresh(true)
        return () => listeners.delete(fn)
      },
    }
  }
  function docRef(c, id) {
    return {
      id,
      async get() { if (cache[c] && c !== 'scripts') return { exists: id in cache[c], data: () => cache[c][id] }; const d = await api(`doc?c=${c}&id=${encodeURIComponent(id)}`); return { exists: d.exists, data: () => d.data } },
      set: (data) => write(c, id, 'set', data), update: (data) => write(c, id, 'update', data), delete: () => write(c, id, 'delete'),
      onSnapshot(next) { watched.add(c); start(); const fn = (ch) => { if (ch === c) next({ exists: !!(cache[c] || {})[id], data: () => (cache[c] || {})[id] }) }; listeners.add(fn); if (cache[c]) fn(c); return () => listeners.delete(fn) },
    }
  }
  return {
    collection: (c) => query(c),
    doc: (path) => { const [c, id] = path.split('/'); return docRef(c, id) },
    refresh: () => refresh(true),
    stop: () => { stopped = true; clearInterval(timer) },
  }
}
function deepMerge(a, b) {
  if (!a || typeof a !== 'object' || Array.isArray(a) || !b || typeof b !== 'object' || Array.isArray(b)) return b
  const o = { ...a }; for (const [k, v] of Object.entries(b)) o[k] = v && typeof v === 'object' && !Array.isArray(v) && o[k] && typeof o[k] === 'object' && !Array.isArray(o[k]) ? deepMerge(o[k], v) : v
  return o
}
