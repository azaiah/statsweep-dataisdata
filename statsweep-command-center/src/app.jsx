import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import { PLAYBOOK, TRADE_BRIEFS, GLOSSARY, GOV_PRIMER, SOURCES, SWEEP_EXPLAINER, GROWTH, scriptsFor, hookFor, impactFor, fixesFor } from './content.js'
import { createDb, login, auth, serverApi } from './store.js'
import { GUIDE, Guide } from './guide.jsx'

/* ------------------------------------------------------------------ constants */
const TEAM = { azaiah: { key: 'azaiah', name: 'Azaiah', full: 'Azaiah Wood' }, tony: { key: 'tony', name: 'Tony', full: 'Tony Wood' } }
const OTHER = { azaiah: 'tony', tony: 'azaiah' }
const STAGES = [
  ['new', 'New'], ['contacted', 'Contacted'], ['talking', 'Talking'], ['demo', 'Demo booked'], ['proposal', 'Proposal sent'],
  ['won', 'Won'], ['onboarding', 'Onboarding'], ['live', 'Live'], ['lost', 'Lost'], ['dnc', 'Do not contact'],
]
const STAGE_LABEL = Object.fromEntries(STAGES)
const PIPE = ['contacted', 'talking', 'demo', 'proposal', 'won', 'onboarding', 'live']
const CLOSED = new Set(['won', 'onboarding', 'live', 'lost', 'dnc'])
const PKGS = { contract: { name: 'Contract Ready', setup: 4997, monthly: 497 }, route: { name: 'Route', setup: 1997, monthly: 297 }, launch: { name: 'Launch', setup: 997, monthly: 147 } }
const REGIONS = [
  { key: 'east', label: 'East', tz: 'America/New_York', abbr: 'ET' },
  { key: 'central', label: 'Central', tz: 'America/Chicago', abbr: 'CT' },
  { key: 'west', label: 'West', tz: 'America/Los_Angeles', abbr: 'MT · PT' },
]
const LISTS = [
  { key: 'build', label: 'Website + Portal', hint: 'No website of their own, or one that is broken', test: (l) => l.track === 'build' },
  { key: 'portal', label: 'Portal + engine', hint: 'Working website; sell the portal and the sweep', test: (l) => l.track === 'portal' },
  { key: 'courier', label: 'Medical couriers', hint: 'Specimen, pharmacy and medical delivery companies', test: (l) => l.trade === 'Medical courier' },
]
const TRADES = ['NEMT and wheelchair', 'Medical courier', 'Ambulance (non-emergency)']
// How we reached out, and what happened. Every contact attempt is one of these.
const CHANNELS = [['call', 'Call'], ['text', 'Text'], ['email', 'Email'], ['linkedin', 'LinkedIn'], ['instagram', 'Instagram'], ['facebook', 'Facebook'], ['inperson', 'In person'], ['inbound', 'They reached us']]
const R = (key, label, o) => ({ key, label, responded: false, stage: 'contacted', next: 2, ...o })
const RESULTS = {
  call: [R('no_answer', 'No answer'), R('voicemail', 'Left voicemail'), R('gatekeeper', 'Gatekeeper / not the owner', { next: 1 }),
    R('talked_interested', 'Answered: interested', { responded: true, stage: 'talking', next: 2 }), R('talked_later', 'Answered: not now', { responded: true, stage: 'talking', next: 30 }),
    R('demo', 'Answered: demo booked', { responded: true, stage: 'demo', next: 2 }), R('talked_no', 'Answered: not interested', { responded: true, stage: 'lost', next: 90 }),
    R('bad_number', 'Wrong or bad number', { stage: null, next: null }), R('stop', 'Said stop / do not contact', { responded: true, stage: 'dnc', next: null, optOut: true })],
  msg: [R('sent', 'Sent, no reply yet', { next: 3 }), R('replied_interested', 'Replied: interested', { responded: true, stage: 'talking', next: 1 }), R('replied_later', 'Replied: not now', { responded: true, stage: 'talking', next: 30 }),
    R('demo', 'Replied: demo booked', { responded: true, stage: 'demo', next: 2 }), R('replied_no', 'Replied: not interested', { responded: true, stage: 'lost', next: 90 }),
    R('bounced', 'Bounced / undeliverable', { stage: null, next: null }), R('stop', 'Said stop / unsubscribe', { responded: true, stage: 'dnc', next: null, optOut: true })],
  meet: [R('met_interested', 'Met: interested', { responded: true, stage: 'talking', next: 2 }), R('demo', 'Demo held', { responded: true, stage: 'proposal', next: 2 }), R('won', 'Closed: they signed', { responded: true, stage: 'won', next: null }), R('met_no', 'Met: not a fit', { responded: true, stage: 'lost', next: null })],
}
const resultsFor = (ch) => ch === 'call' ? RESULTS.call : (ch === 'inperson' || ch === 'inbound') ? [...RESULTS.meet, ...RESULTS.msg.filter((r) => r.key.startsWith('replied'))] : RESULTS.msg
const QUICK_CALL = RESULTS.call
const CHANNEL_LABEL = Object.fromEntries(CHANNELS)
const RELAY = 'https://statsweep.com/go.html'
const STORE_ME = 'statsweep-cc-me'

/* ------------------------------------------------------------------ helpers */
const ls = { get(k) { try { return localStorage.getItem(k) } catch { return null } }, set(k, v) { try { localStorage.setItem(k, v) } catch {} } }
const uid = (p) => p + '-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
const nowIso = () => new Date().toISOString()
const dayKey = (d) => { const x = new Date(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0') }
const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); d.setHours(9, 0, 0, 0); return d.toISOString() }
const fmtMoney = (n) => '$' + Math.round(n || 0).toLocaleString()
const fmtShortDate = (iso) => iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''
const logAct = (write, me, a) => write((db) => db.collection('activity').doc(uid('a')).set({ at: nowIso(), who: me, ...a })).catch(() => {})
const fmtWhen = (iso) => {
  if (!iso) return ''
  const d = new Date(iso), s = (Date.now() - d.getTime()) / 1000
  if (s < 60) return 'just now'; if (s < 3600) return Math.floor(s / 60) + 'm ago'; if (s < 86400) return Math.floor(s / 3600) + 'h ago'
  return fmtShortDate(iso)
}
function localParts(tz, now = new Date()) {
  const f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit', weekday: 'short', hour12: true })
  const parts = Object.fromEntries(f.formatToParts(now).map((p) => [p.type, p.value]))
  const h24 = Number(new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hourCycle: 'h23' }).format(now))
  const min = Number(parts.minute)
  return { label: `${parts.hour}:${parts.minute} ${parts.dayPeriod}`, weekday: parts.weekday, mins: h24 * 60 + min }
}
function callWindow(tz, now = new Date()) {
  const { label, weekday, mins } = localParts(tz, now)
  const weekend = weekday === 'Sat' || weekday === 'Sun'
  if (weekday === 'Sun') return { label, status: 'closed', text: 'Sunday' }
  if (weekend) return mins >= 480 && mins < 720 ? { label, status: 'open', text: 'Saturday morning' } : { label, status: 'closed', text: 'Weekend' }
  if ((mins >= 420 && mins < 510) || (mins >= 930 && mins < 1050)) return { label, status: 'best', text: 'Best time to call' }
  if (mins >= 420 && mins < 1080) return { label, status: 'open', text: 'Business hours' }
  return { label, status: 'closed', text: mins < 420 ? 'Too early' : 'After hours' }
}
const callable = (l, now) => l.phone && !CLOSED.has(l.stage) && callWindow(l.tz, now).status !== 'closed'
function fill(text, me, settings) {
  const m = settings?.members?.[me] || {}
  return (text || '').replaceAll('{{me}}', TEAM[me]?.name || 'Azaiah').replaceAll('{{myphone}}', m.phone || '[your number]').replaceAll('{{demo}}', settings?.demoUrl || 'https://demo.statsweep.com')
}
function relayHref(kind, { phone, body, to, subject }, settings) {
  const useRelay = settings?.useRelay === true
  if (kind === 'tel') return useRelay ? `${RELAY}#${new URLSearchParams({ a: 'tel', n: phone })}` : `tel:${phone}`
  if (kind === 'sms') {
    if (useRelay) return `${RELAY}#${new URLSearchParams({ a: 'sms', n: phone, b: body || '' })}`
    const apple = /iPhone|iPad|Mac/.test(navigator.userAgent)
    return `sms:${phone}${body ? (apple ? '&' : '?') + 'body=' + encodeURIComponent(body) : ''}`
  }
  if (kind === 'mail') return useRelay ? `${RELAY}#${new URLSearchParams({ a: 'mail', to, s: subject || '', b: body || '' })}` : `mailto:${to}?subject=${encodeURIComponent(subject || '')}&body=${encodeURIComponent(body || '')}`
  return '#'
}
const gsearch = (q) => 'https://www.google.com/search?q=' + encodeURIComponent(q)
async function copyText(t) { try { await navigator.clipboard.writeText(t); return true } catch { return false } }

/* ------------------------------------------------------------------ data layer */
const DataCtx = React.createContext(null)
function useData() { return React.useContext(DataCtx) }

function DataProvider({ children }) {
  const [db, setDb] = useState(undefined)
  const [leads, setLeads] = useState(null)
  const [tasks, setTasks] = useState([])
  const [board, setBoard] = useState([])
  const [activity, setActivity] = useState([])
  const [sweeps, setSweeps] = useState([])
  const [settings, setSettings] = useState({})
  const [finance, setFinance] = useState([])
  const [finSettings, setFinSettings] = useState({})
  const [canWrite, setCanWrite] = useState(true)
  const [err, setErr] = useState('')
  useEffect(() => {
    const d = createDb((e) => setErr(e?.message || 'Lost connection. Retrying…'))
    setDb(d)
    const map = (s) => s.docs.map((x) => ({ id: x.id, ...x.data() }))
    const onErr = (e) => setErr(e?.message || 'Lost connection.')
    const unsubs = [
      d.collection('leads').onSnapshot((s) => setLeads(map(s)), onErr),
      d.collection('tasks').onSnapshot((s) => setTasks(map(s)), onErr),
      d.collection('board').onSnapshot((s) => setBoard(map(s)), onErr),
      d.collection('activity').orderBy('at', 'desc').limit(600).onSnapshot((s) => setActivity(map(s)), onErr),
      d.collection('sweeps').onSnapshot((s) => setSweeps(map(s).sort((a, b) => (b.at || '').localeCompare(a.at || ''))), onErr),
      d.doc('settings/team').onSnapshot((s) => setSettings(s.exists ? s.data() : {}), onErr),
      d.collection('finance').onSnapshot((s) => setFinance(map(s)), onErr),
      d.doc('settings/finance').onSnapshot((s) => setFinSettings(s.exists ? s.data() : {}), onErr),
    ]
    return () => { unsubs.forEach((u) => u && u()); d.stop() }
  }, [])
  const write = useCallback(async (fn) => {
    if (!db) return false
    try { await fn(db); return true } catch (e) {
      setErr(e?.message || 'Could not save. Try again.')
      return false
    }
  }, [db])
  const value = { db, leads, tasks, board, activity, sweeps, settings, finance, finSettings, canWrite, err, setErr, write }
  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>
}

/* ------------------------------------------------------------------ actions */
function useActions(me) {
  const { write, leads } = useData()
  const leadById = useMemo(() => Object.fromEntries((leads || []).map((l) => [l.id, l])), [leads])
  const patchLead = (id, patch) => write((db) => db.doc('leads/' + id).update({ ...patch, updatedAt: nowIso(), updatedBy: me }))
  const addActivity = (a) => write((db) => db.collection('activity').doc(uid('a')).set({ at: nowIso(), who: me, ...a }))
  // One contact attempt: channel (how), result (what happened), note. Updates the lead's contact status and schedules the next touch.
  const logTouch = async (lead, { channel = 'call', result, note = '', nextOverride }) => {
    const r = resultsFor(channel).find((x) => x.key === result) || { key: result, label: result, responded: false, stage: 'contacted', next: 2 }
    const entry = { at: nowIso(), by: me, channel, result: r.key, label: `${CHANNEL_LABEL[channel] || channel}: ${r.label}`, responded: !!r.responded, optOut: !!r.optOut, note }
    const log = [...(lead.log || []), entry].slice(-80)
    const patch = { log, lastTouchAt: entry.at, lastTouchBy: me, touches: (lead.touches || 0) + 1, contacted: true, lastChannel: channel, lastResult: r.label }
    if (r.responded) { patch.responded = true; patch.respondedAt = lead.respondedAt || entry.at }
    if (r.optOut) patch.optOut = true
    if (r.key === 'bad_number') patch.badNumber = true
    if (!lead.owner) patch.owner = me
    const st = r.stage
    if (st && (lead.stage === 'new' || PIPE.indexOf(st) > PIPE.indexOf(lead.stage) || st === 'lost' || st === 'dnc')) patch.stage = st
    if (st === 'won' && !lead.wonAt) patch.wonAt = entry.at
    const next = nextOverride !== undefined ? nextOverride : r.next
    if (next !== undefined) patch.nextAt = next === null ? null : addDays(next)
    await patchLead(lead.id, patch)
    await addActivity({ type: channel, outcome: r.key, label: entry.label, responded: entry.responded, leadId: lead.id, leadName: lead.name, region: lead.region, note })
  }
  const claim = (lead, who = me) => patchLead(lead.id, { owner: who }).then(() => addActivity({ type: 'assign', label: who === me ? 'Claimed' : 'Assigned to ' + TEAM[who].name, leadId: lead.id, leadName: lead.name }))
  const setStage = (lead, stage) => patchLead(lead.id, { stage, ...(stage === 'won' && !lead.wonAt ? { wonAt: nowIso() } : {}) }).then(() => addActivity({ type: 'stage', outcome: stage === 'won' ? 'won' : stage === 'demo' ? 'demo' : 'stage', label: 'Moved to ' + STAGE_LABEL[stage], leadId: lead.id, leadName: lead.name }))
  return { patchLead, logTouch, claim, setStage, addActivity, leadById }
}

/* ------------------------------------------------------------------ tiny markdown */
function inline(t) {
  const out = []; let rest = t, k = 0
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/
  while (rest) {
    const m = rest.match(re)
    if (!m) { out.push(rest); break }
    if (m.index) out.push(rest.slice(0, m.index))
    const s = m[0]; out.push(s.startsWith('**') ? <strong key={k++}>{s.slice(2, -2)}</strong> : <em key={k++}>{s.slice(1, -1)}</em>)
    rest = rest.slice(m.index + s.length)
  }
  return out
}
function Md({ text }) {
  const lines = text.trim().split('\n'); const blocks = []; let i = 0, k = 0
  while (i < lines.length) {
    const ln = lines[i]
    if (!ln.trim()) { i++; continue }
    if (ln.startsWith('## ')) { blocks.push(<h3 key={k++} className="md-h">{ln.slice(3)}</h3>); i++; continue }
    if (ln.startsWith('|')) {
      const rows = []; while (i < lines.length && lines[i].startsWith('|')) { rows.push(lines[i]); i++ }
      const cells = (r) => r.split('|').slice(1, -1).map((c) => c.trim())
      const head = cells(rows[0]); const body = rows.slice(2).map(cells)
      blocks.push(<div key={k++} className="tbl-wrap"><table className="tbl"><thead><tr>{head.map((h, j) => <th key={j}>{inline(h)}</th>)}</tr></thead><tbody>{body.map((r, j) => <tr key={j}>{r.map((c, x) => <td key={x}>{inline(c)}</td>)}</tr>)}</tbody></table></div>)
      continue
    }
    if (/^(- |\d+\. )/.test(ln)) {
      const ordered = /^\d+\. /.test(ln); const items = []
      while (i < lines.length && /^(- |\d+\. )/.test(lines[i])) { items.push(lines[i].replace(/^(- |\d+\. )/, '')); i++ }
      const L = ordered ? 'ol' : 'ul'
      blocks.push(<L key={k++} className="md-list">{items.map((t, j) => <li key={j}>{inline(t)}</li>)}</L>); continue
    }
    const para = []; while (i < lines.length && lines[i].trim() && !/^(## |\||- |\d+\. )/.test(lines[i])) { para.push(lines[i]); i++ }
    blocks.push(<p key={k++}>{inline(para.join(' '))}</p>)
  }
  return <div className="md">{blocks}</div>
}

/* ------------------------------------------------------------------ small UI */
const Icon = ({ d, size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
const I = {
  home: <><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></>,
  leads: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5" /><path d="M16 4.5a3.5 3.5 0 010 7M18 14.8c1.9.8 3.1 2.6 3.5 5.2" /></>,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2" />,
  sms: <><path d="M4 5h16v11H8l-4 4z" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
  kanban: <><rect x="3" y="4" width="5" height="16" rx="1.5" /><rect x="10" y="4" width="5" height="10" rx="1.5" /><rect x="17" y="4" width="4" height="13" rx="1.5" /></>,
  check: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 12l3 3 7-7" /></>,
  board: <><path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" /></>,
  book: <><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z" /><path d="M4 19V5" /></>,
  research: <><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4-4" /></>,
  growth: <><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
  radar: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><path d="M12 12l6-6" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 00-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 00-2-1.2L14 3h-4l-.5 2.6a7 7 0 00-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 002 1.2L10 21h4l.5-2.6a7 7 0 002-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" /></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3" /></>,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  star: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />,
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  map: <><path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  shield: <path d="M12 3l8 3v6c0 4.5-3.4 8.4-8 9-4.6-.6-8-4.5-8-9V6z" />,
  logout: <><path d="M15 4h4v16h-4" /><path d="M10 8l-4 4 4 4M6 12h10" /></>,
  money: <><rect x="2.5" y="6" width="19" height="12" rx="2" /><circle cx="12" cy="12" r="2.6" /><path d="M6 9v.01M18 15v.01" /></>,
  spark: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" /></>,
}
const Avatar = ({ who, size = 26 }) => who ? <span className={`av av-${who}`} style={{ width: size, height: size, fontSize: size * 0.42 }} title={TEAM[who]?.name}>{TEAM[who]?.name[0]}</span> : <span className="av av-none" style={{ width: size, height: size, fontSize: size * 0.42 }} title="Unclaimed">?</span>
// Save feedback for add/submit buttons: '' | 'saving' | 'done' | 'empty' | 'error'
function useSaveState() { const [st, setSt] = useState(''); const t = useRef(null); const set = (v) => { clearTimeout(t.current); setSt(v); if (v === 'done' || v === 'empty') t.current = setTimeout(() => setSt(''), 2200) }; useEffect(() => () => clearTimeout(t.current), []); return [st, set] }
const saveLabel = (st, label, done = 'Added ✓') => st === 'saving' ? 'Saving…' : st === 'done' ? done : label
function FormMsg({ st, empty }) { if (st === 'empty') return <p className="form-msg warn" role="status">{empty}</p>; if (st === 'error') return <p className="form-msg err" role="alert">That didn't save. Check your connection and tap it again.</p>; if (st === 'done') return <p className="form-msg ok" role="status">Saved. Your partner will see it in a few seconds.</p>; return null }
const Chip = ({ tone = 'muted', children, title }) => <span className={`chip chip-${tone}`} title={title}>{children}</span>
function WebChip({ web }) {
  if (!web) return null
  if (web.status === 'none') return <Chip tone="hot">No website</Chip>
  if (web.status === 'outdated') return <Chip tone="warn">Outdated site{web.score ? ` ${web.score}/10` : ''}</Chip>
  if (web.status === 'decent') return <Chip tone="ok">Decent site{web.score ? ` ${web.score}/10` : ''}</Chip>
  return <Chip>Site not checked</Chip>
}
function WindowChip({ tz }) {
  const w = callWindow(tz)
  return <Chip tone={w.status === 'best' ? 'ok' : w.status === 'open' ? 'info' : 'muted'} title={w.text}><Icon d={I.clock} size={12} /> {w.label}</Chip>
}
function CopyBtn({ text, label = 'Copy' }) {
  const [done, setDone] = useState(false)
  return <button type="button" className="btn btn-ghost btn-sm" onClick={async () => { const ok = await copyText(text); setDone(ok ? 'Copied' : 'Select and copy'); setTimeout(() => setDone(false), 1500) }}><Icon d={I.copy} size={14} /> {done || label}</button>
}
function Empty({ title, children }) { return <div className="empty"><p className="empty-t">{title}</p>{children && <p className="muted">{children}</p>}</div> }
function useNow(ms = 30000) { const [n, setN] = useState(() => new Date()); useEffect(() => { const t = setInterval(() => setN(new Date()), ms); return () => clearInterval(t) }, [ms]); return n }

/* ------------------------------------------------------------------ logo (client artwork) */
function Logo({ big }) {
  return <div className={`logo ${big ? 'logo-big' : ''}`}><span className="logo-row"><img src="/favicon.svg" alt="" width={big ? 52 : 36} height={big ? 52 : 36} /><span className="logo-word">StatSweep</span></span><span className="logo-sub">Command Center</span></div>
}

/* ------------------------------------------------------------------ name picker */
function Gate({ onPick }) {
  return (
    <div className="gate">
      <div className="gate-card">
        <Logo big />
        <h1>Who's working?</h1>
        <p className="muted">Pick your name. Everything you claim, call and log is tagged to you, and you can see each other's progress live.</p>
        <div className="gate-picks">
          {Object.values(TEAM).map((t) => (
            <button key={t.key} type="button" className={`pick pick-${t.key}`} onClick={() => onPick(t.key)}>
              <Avatar who={t.key} size={56} />
              <span className="pick-name">{t.name}</span>
              <span className="muted pick-sub">Enter as {t.name}</span>
            </button>
          ))}
        </div>
        <p className="tiny muted">No password. Your pick is remembered on this device; switch any time from the sidebar.</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ charts (hand-built SVG) */
function ActivityChart({ activity }) {
  const [hover, setHover] = useState(null)
  const days = useMemo(() => { const arr = []; for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); arr.push(dayKey(d)) } return arr }, [])
  const counts = useMemo(() => {
    const m = Object.fromEntries(days.map((d) => [d, { azaiah: 0, tony: 0 }]))
    for (const a of activity) { if (!TOUCH.has(a.type)) continue; const k = dayKey(a.at); if (m[k] && m[k][a.who] !== undefined) m[k][a.who]++ }
    return m
  }, [activity, days])
  const max = Math.max(4, ...days.map((d) => Math.max(counts[d].azaiah, counts[d].tony)))
  const nice = Math.ceil(max / 4) * 4
  const W = 640, H = 200, pl = 30, pb = 24, pt = 10, cw = (W - pl) / days.length, bw = Math.min(12, cw / 3)
  const y = (v) => pt + (H - pt - pb) * (1 - v / nice)
  const total = (w) => days.reduce((s, d) => s + counts[d][w], 0)
  return (
    <div className="chart">
      <div className="legend">
        <span><i className="sw sw-a" /> Azaiah <b>{total('azaiah')}</b></span>
        <span><i className="sw sw-b" /> Tony <b>{total('tony')}</b></span>
        <span className="muted">touches, last 14 days</span>
      </div>
      <div className="chart-box">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Outreach touches per day by person" onMouseLeave={() => setHover(null)}>
          {[0, 0.25, 0.5, 0.75, 1].map((f) => <g key={f}><line x1={pl} x2={W} y1={y(nice * f)} y2={y(nice * f)} className="grid" /><text x={pl - 6} y={y(nice * f) + 4} className="axis" textAnchor="end">{Math.round(nice * f)}</text></g>)}
          {days.map((d, i) => {
            const x = pl + i * cw + cw / 2, c = counts[d]
            const bar = (v, off, cls) => v > 0 && <path d={`M${x + off} ${y(0)} V${y(v) + 4} a4 4 0 0 1 4 -4 h${bw - 8} a4 4 0 0 1 4 4 V${y(0)} Z`} className={cls} />
            return (
              <g key={d} onMouseEnter={() => setHover(i)}>
                <rect x={pl + i * cw} y={pt} width={cw} height={H - pt - pb} fill="transparent" />
                {hover === i && <rect x={pl + i * cw + 2} y={pt} width={cw - 4} height={H - pt - pb} className="hoverband" rx="6" />}
                {bar(c.azaiah, -bw - 1, 'mark-a')}{bar(c.tony, 1, 'mark-b')}
                {(i % 2 === 1 || i === 13) && <text x={x} y={H - 6} className="axis" textAnchor="middle">{i === 13 ? 'Today' : new Date(d + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</text>}
              </g>
            )
          })}
        </svg>
        {hover !== null && <div className="tip" style={{ left: `${((pl + hover * cw + cw / 2) / W) * 100}%` }}><b>{new Date(days[hover] + 'T12:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</b><span><i className="sw sw-a" /> Azaiah {counts[days[hover]].azaiah}</span><span><i className="sw sw-b" /> Tony {counts[days[hover]].tony}</span></div>}
      </div>
    </div>
  )
}
function StageBars({ leads }) {
  const rows = PIPE.map((s) => [s, leads.filter((l) => l.stage === s).length])
  const max = Math.max(1, ...rows.map((r) => r[1]))
  return (
    <div className="hbars">
      {rows.map(([s, n]) => (
        <div key={s} className="hbar" title={`${STAGE_LABEL[s]}: ${n}`}>
          <span className="hbar-l">{STAGE_LABEL[s]}</span>
          <span className="hbar-track"><span className="hbar-fill" style={{ width: `${(n / max) * 100}%` }} /></span>
          <span className="hbar-n">{n}</span>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ dashboard */
function Dashboard({ me, go, openLead }) {
  const { leads, tasks, activity, sweeps, settings } = useData()
  const now = useNow(30000)
  const L = leads || []
  const today = dayKey(now)
  const touchesToday = activity.filter((a) => dayKey(a.at) === today && TOUCH.has(a.type))
  const mineToday = touchesToday.filter((a) => a.who === me).length
  const convWeek = activity.filter((a) => (now - new Date(a.at)) < 7 * 864e5 && a.responded).length
  const wk = weekStats(activity, 1)[0]
  const demos = L.filter((l) => l.stage === 'demo').length
  const won = L.filter((l) => ['won', 'onboarding', 'live'].includes(l.stage))
  const mrr = won.reduce((s, l) => s + (l.deal?.monthly || 0), 0)
  const monthKey = today.slice(0, 7)
  const setupThisMonth = won.filter((l) => (l.wonAt || '').slice(0, 7) === monthKey).reduce((s, l) => s + (l.deal?.setup || 0), 0)
  const goal = settings.goal || 20000
  const monthRev = setupThisMonth + mrr
  const pipelineValue = L.filter((l) => ['talking', 'demo', 'proposal'].includes(l.stage)).reduce((s, l) => s + (l.deal?.setup || PKGS[l.trade === 'Medical courier' ? 'contract' : 'route'].setup), 0)
  const myTasks = tasks.filter((t) => t.assignee === me && !t.done).sort((a, b) => (a.due || '9').localeCompare(b.due || '9')).slice(0, 6)
  const due = L.filter((l) => l.owner === me && l.nextAt && new Date(l.nextAt) <= now && !CLOSED.has(l.stage)).sort((a, b) => a.nextAt.localeCompare(b.nextAt))
  const lastSweep = sweeps[0]
  const hour = Number(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone: 'America/New_York' }).format(now))
  const greet = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening'
  const regionCards = REGIONS.map((r) => {
    const w = callWindow(r.tz, now)
    const pool = L.filter((l) => l.region === r.key && callable(l, now) && (!l.owner || l.owner === me))
    return { ...r, w, n: pool.length, gov: pool.filter((l) => l.track === 'build').length }
  })
  return (
    <div className="page">
      <header className="page-h">
        <div><p className="eyebrow">{now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p><h1>{greet}, {TEAM[me].name}</h1></div>
        <div className="row gap">
          <button className="btn btn-primary" data-tour="callblock" onClick={() => go('dialer')}><Icon d={I.bolt} /> Start a call block</button>
        </div>
      </header>
      {leads && L.length === 0 && <SeedLoader />}
      <section className="kpis" data-tour="kpis">
        <div className="kpi kpi-hero">
          <p className="kpi-l">This month vs {fmtMoney(goal)} goal</p>
          <p className="kpi-v">{fmtMoney(monthRev)}</p>
          <div className="goalbar" aria-label={`${Math.round((monthRev / goal) * 100)}% of goal`}><span style={{ width: `${Math.min(100, (monthRev / goal) * 100)}%` }} /></div>
          <p className="kpi-s">{fmtMoney(setupThisMonth)} setup + {fmtMoney(mrr)} monthly recurring</p>
        </div>
        <div className="kpi"><p className="kpi-l">Your touches today</p><p className="kpi-v">{mineToday}</p><p className="kpi-s">Team: {touchesToday.length}</p></div>
        <div className="kpi"><p className="kpi-l">Conversations, 7 days</p><p className="kpi-v">{convWeek}</p><p className="kpi-s">{demos} demos booked</p></div>
        <button type="button" className="kpi kpi-btn" onClick={() => go('advisor')}><p className="kpi-l">Close rate this week</p><p className="kpi-v">{wk.demos ? Math.round(wk.rate * 100) + '%' : '—'}</p><p className="kpi-s">{wk.wins} won of {wk.demos} demos · see advisor</p></button>
        <div className="kpi"><p className="kpi-l">Open pipeline</p><p className="kpi-v">{fmtMoney(pipelineValue)}</p><p className="kpi-s">setup fees in talks</p></div>
        <div className="kpi"><p className="kpi-l">Lead pool</p><p className="kpi-v">{L.filter((l) => l.stage === 'new').length}</p><p className="kpi-s">{L.filter((l) => l.stage === 'new' && l.track === 'build').length} no site · {L.filter((l) => l.stage === 'new' && !l.owner).length} unclaimed</p></div>
      </section>
      <section className="grid-3 regions" data-tour="regions">
        {regionCards.map((r) => (
          <button key={r.key} type="button" className={`region region-${r.w.status}`} onClick={() => go('leads', { region: r.key })}>
            <div className="row between"><span className="eyebrow">{r.label}<span className="reg-abbr"> · {r.abbr}</span></span><span className={`dot dot-${r.w.status}`}>{r.w.status === 'best' ? 'Best window' : r.w.status === 'open' ? 'Open' : 'Closed'}</span></div>
            <p className="region-time">{r.w.label}</p>
            <p className="muted">{r.w.status === 'closed' ? r.w.text : `${r.n} callable now · ${r.gov} with no site`}</p>
          </button>
        ))}
      </section>
      <section className="grid-2-1">
        <div className="panel" data-tour="activity"><div className="panel-h"><h2>Team activity</h2></div><ActivityChart activity={activity} /></div>
        <div className="panel"><div className="panel-h"><h2>Pipeline</h2><button className="link" onClick={() => go('pipeline')}>Open board</button></div><StageBars leads={L} /></div>
      </section>
      <section className="grid-3">
        <div className="panel" data-tour="followups">
          <div className="panel-h"><h2>Follow-ups due</h2><span className="muted">{due.length}</span></div>
          {due.length === 0 ? <p className="muted">Nothing due. Claim leads and log touches; follow-ups schedule themselves.</p> :
            <ul className="mini">{due.slice(0, 7).map((l) => <li key={l.id}><button className="mini-row" onClick={() => openLead(l.id)}><span className="ellip">{l.name}</span><span className="muted">{l.city}, {l.state}</span></button></li>)}</ul>}
        </div>
        <div className="panel">
          <div className="panel-h"><h2>Your tasks</h2><button className="link" onClick={() => go('tasks')}>All tasks</button></div>
          {myTasks.length === 0 ? <p className="muted">No open tasks.</p> :
            <ul className="mini">{myTasks.map((t) => <li key={t.id} className="mini-row"><span className="ellip">{t.title}</span><span className={`muted ${t.due && t.due < today ? 'overdue' : ''}`}>{t.due ? fmtShortDate(t.due + 'T12:00') : ''}</span></li>)}</ul>}
        </div>
        <div className="panel">
          <div className="panel-h"><h2>Latest sweep</h2><button className="link" onClick={() => go('sweeps')}>History</button></div>
          {lastSweep ? <><p className="kpi-v sm">{lastSweep.added} new leads</p><p className="muted">{fmtShortDate(lastSweep.at)} · {lastSweep.summary}</p></> : <p className="muted">No sweeps logged yet.</p>}
          <p className="tiny muted">Next sweep: Monday 5:00 am ET</p>
        </div>
      </section>
      <section className="panel">
        <div className="panel-h"><h2>Live feed</h2></div>
        {activity.length === 0 ? <p className="muted">Calls, texts, claims and stage changes from both of you show up here as they happen.</p> :
          <ul className="feed">{activity.slice(0, 25).map((a) => <li key={a.id}><Avatar who={a.who} size={22} /><span><b>{TEAM[a.who]?.name}</b> {a.label ? a.label.charAt(0).toLowerCase() + a.label.slice(1) : ''} {a.leadName && <button className="link" onClick={() => openLead(a.leadId)}>{a.leadName}</button>}</span><span className="muted tiny">{fmtWhen(a.at)}</span></li>)}</ul>}
      </section>
    </div>
  )
}

/* ------------------------------------------------------------------ lead list */
function LeadCard({ l, me, onOpen }) {
  return (
    <button type="button" className={`lead ${l.owner ? 'owned-' + l.owner : ''}`} onClick={() => onOpen(l.id)}>
      <div className="row between gap-s">
        <span className="lead-name">{l.name}</span>
        <span className="fit" title={(l.fitWhy || []).join(' · ')}>{l.fit}</span>
      </div>
      <p className="lead-meta">{l.trade} · {l.city}, {l.state}{l.years ? ` · ${l.years} yrs` : ''}</p>
      <div className="chips">
        <WebChip web={l.web} />
        {l.years >= 10 && <Chip tone="cert">{l.years} yrs</Chip>}
        {l.stage !== 'new' && <Chip tone="info">{STAGE_LABEL[l.stage]}</Chip>}
      </div>
      <div className="row between lead-foot">
        <span className="row gap-s"><Avatar who={l.owner} size={20} /><span className="tiny muted">{l.contactName || 'Owner not named'}</span></span>
        <WindowChip tz={l.tz} />
      </div>
    </button>
  )
}
function Leads({ me, openLead, initial }) {
  const { leads } = useData()
  const now = useNow(60000)
  const [list, setList] = useState(() => ls.get('statsweep-list') || 'build')
  const [trade, setTrade] = useState('')
  const [owner, setOwner] = useState('open')
  const [stage, setStage] = useState('active')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('fit')
  const [onlyNow, setOnlyNow] = useState(false)
  const [region, setRegion] = useState(initial?.region || 'all')
  useEffect(() => { ls.set('statsweep-list', list) }, [list])
  const L = leads || []
  const def = LISTS.find((x) => x.key === list)
  const filtered = L.filter((l) => def.test(l)
    && (!trade || l.trade === trade)
    && (owner === 'all' || (owner === 'open' ? (!l.owner || l.owner === me) : owner === 'none' ? !l.owner : l.owner === owner))
    && (stage === 'all' || (stage === 'active' ? !CLOSED.has(l.stage) : l.stage === stage))
    && (!onlyNow || callable(l, now))
    && (!q || (l.name + ' ' + l.city + ' ' + l.state + ' ' + (l.contactName || '')).toLowerCase().includes(q.toLowerCase())))
  const sorter = { fit: (a, b) => b.fit - a.fit, years: (a, b) => (b.years || 0) - (a.years || 0), name: (a, b) => a.name.localeCompare(b.name), recent: (a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '') }[sort]
  const counts = Object.fromEntries(LISTS.map((x) => [x.key, L.filter((l) => x.test(l) && !CLOSED.has(l.stage)).length]))
  const cols = REGIONS.filter((r) => region === 'all' || r.key === region)
  return (
    <div className="page">
      <header className="page-h"><div><p className="eyebrow">Leads</p><h1>{def.label}</h1><p className="muted">{def.hint}</p></div></header>
      <div className="seg" role="tablist" data-tour="lists">
        {LISTS.map((x) => <button key={x.key} role="tab" aria-selected={list === x.key} className={list === x.key ? 'on' : ''} onClick={() => setList(x.key)}>{x.label} <span className="seg-n">{counts[x.key]}</span></button>)}
      </div>
      <div className="filters" data-tour="filters">
        <input className="input" type="search" placeholder="Search name, city or contact" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search leads" />
        <select className="input" value={trade} onChange={(e) => setTrade(e.target.value)} aria-label="Trade"><option value="">All trades</option>{TRADES.map((t) => <option key={t}>{t}</option>)}</select>
        <select className="input" value={owner} onChange={(e) => setOwner(e.target.value)} aria-label="Owner"><option value="open">Mine + unclaimed</option><option value="none">Unclaimed</option><option value={me}>Mine</option><option value={OTHER[me]}>{TEAM[OTHER[me]].name}'s</option><option value="all">Everyone</option></select>
        <select className="input" value={stage} onChange={(e) => setStage(e.target.value)} aria-label="Stage"><option value="active">Active</option><option value="all">All stages</option>{STAGES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <select className="input" value={region} onChange={(e) => setRegion(e.target.value)} aria-label="Region"><option value="all">All regions</option>{REGIONS.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}</select>
        <select className="input" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort"><option value="fit">Best fit</option><option value="years">Most years</option><option value="recent">Recently touched</option><option value="name">A–Z</option></select>
        <label className="toggle"><input type="checkbox" checked={onlyNow} onChange={(e) => setOnlyNow(e.target.checked)} /> Callable now</label>
      </div>
      <div className={`cols cols-${cols.length}`} data-tour="cols">
        {cols.map((r) => {
          const w = callWindow(r.tz, now)
          const items = filtered.filter((l) => l.region === r.key).sort(sorter)
          return (
            <section key={r.key} className="col">
              <header className="col-h">
                <div><p className="col-t">{r.label} <span className="muted">{r.abbr}</span></p><p className="tiny muted">{items.length} leads</p></div>
                <div className="col-clock"><span className={`dot dot-${w.status}`}>{w.label}</span><span className="tiny muted">{w.text}</span></div>
              </header>
              <div className="col-body">
                {items.length === 0 ? <p className="muted tiny pad">No leads match these filters.</p> : items.slice(0, 120).map((l) => <LeadCard key={l.id} l={l} me={me} onOpen={openLead} />)}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ lead drawer */
function ScriptBlock({ text, actions }) {
  return <div className="script"><div className="script-actions">{actions}<CopyBtn text={text} /></div><pre className="script-text">{text}</pre></div>
}
function LeadDrawer({ id, me, onClose }) {
  const { leads, settings, db, canWrite, tasks } = useData()
  const A = useActions(me)
  const l = (leads || []).find((x) => x.id === id)
  const [scripts, setScripts] = useState(null)
  const [tab, setTab] = useState('call')
  const [note, setNote] = useState('')
  const [notes, setNotes] = useState('')
  const [taskT, setTaskT] = useState('')
  const [subj, setSubj] = useState(0)
  const panelRef = useRef(null)
  useEffect(() => { const x = (leads || []).find((y) => y.id === id); setScripts(x ? scriptsFor(x) : {}) }, [id, !!l])
  const notesFocus = useRef(false)
  useEffect(() => { setNotes(l?.notes || '') }, [l?.id])
  useEffect(() => { if (!notesFocus.current) setNotes(l?.notes || '') }, [l?.notes])
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); panelRef.current?.focus(); return () => window.removeEventListener('keydown', k) }, [onClose])
  if (!l) return null
  const f = (t) => fill(t, me, settings)
  const sms = f(scripts?.sms || ''); const email = scripts?.email ? { subject: f(scripts.email.subjects[subj] || ''), body: f(scripts.email.body) } : null
  const telHref = l.phone ? relayHref('tel', { phone: l.phone }, settings) : null
  const smsHref = l.phone ? relayHref('sms', { phone: l.phone, body: sms }, settings) : null
  const mailHref = l.email && email ? relayHref('mail', { to: l.email, subject: email.subject, body: email.body }, settings) : null
  const w = callWindow(l.tz)
  const soc = l.social || {}
  const q = `${l.name} ${l.city} ${l.state}`
  const tabs = [['call', 'Call'], ['voicemail', 'Voicemail'], ['sms', 'Text'], ['email', 'Email'], ['linkedin', 'LinkedIn'], ['instagram', 'Instagram'], ['facebook', 'Facebook'], ['followups', 'Follow-ups']]
  const leadTasks = tasks.filter((t) => t.leadId === l.id && !t.done)
  return (
    <div className="drawer-wrap" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={l.name} tabIndex={-1} ref={panelRef}>
        <header className="drawer-h">
          <div className="min0">
            <p className="eyebrow">{l.track === 'build' ? 'Website + Portal' : 'Portal + engine'} · {l.trade}</p>
            <h2 className="drawer-t">{l.name}</h2>
            <p className="muted">{[l.addr, l.city, l.state, l.zip].filter(Boolean).join(', ')}{l.county ? ` · ${l.county}` : ''}</p>
            {l.updatedBy && TEAM[l.updatedBy] && <p className="attrib-row"><Avatar who={l.updatedBy} size={18} /> Last updated by {TEAM[l.updatedBy].name} · {fmtWhen(l.updatedAt)}</p>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon d={I.x} /></button>
        </header>
        <div className="drawer-body">
          <section className="contact-card" data-tour="contact">
            <div className="row between wrap gap-s">
              <div>
                <p className="contact-name">{l.contactName || 'Ask for the owner'}{l.contactTitle ? <span className="muted"> · {l.contactTitle}</span> : null}</p>
                <p className="phone-big selectable">{l.phoneDisplay || 'No phone'}</p>
                {l.email && <p className="selectable muted">{l.email}</p>}
              </div>
              <div className="text-right">
                <p className="fit fit-lg" title="Fit score">{l.fit}</p>
                <p className={`tiny ${w.status === 'closed' ? 'muted' : 'okc'}`}>Their time {w.label} · {w.text}</p>
              </div>
            </div>
            <div className="actions">
              <a className={`act act-call ${telHref ? '' : 'disabled'}`} href={telHref || undefined} target="_blank" rel="noopener"><Icon d={I.phone} /> Call</a>
              <a className={`act act-text ${smsHref && scripts ? '' : 'disabled'}`} href={smsHref || undefined} target="_blank" rel="noopener"><Icon d={I.sms} /> Text</a>
              <a className={`act act-mail ${mailHref ? '' : 'disabled'}`} href={mailHref || (l.email ? undefined : gsearch(l.name + ' ' + l.city + ' email'))} target="_blank" rel="noopener"><Icon d={I.mail} /> {l.email ? 'Email' : 'Find email'}</a>
              {l.website ? <a className="act" href={l.website} target="_blank" rel="noopener"><Icon d={I.globe} /> Website</a> : <a className="act" href={gsearch(q)} target="_blank" rel="noopener"><Icon d={I.research} /> Google</a>}
            </div>
            <div className="links">
              <a href={soc.facebook || gsearch(q + ' facebook')} target="_blank" rel="noopener">{soc.facebook ? 'Facebook' : 'Find on Facebook'}</a>
              <a href={soc.instagram || gsearch(q + ' instagram')} target="_blank" rel="noopener">{soc.instagram ? 'Instagram' : 'Find on Instagram'}</a>
              <a href={soc.linkedin || gsearch((l.contactName || l.name) + ' ' + l.name + ' linkedin')} target="_blank" rel="noopener">{soc.linkedin ? 'LinkedIn' : 'Find on LinkedIn'}</a>
              {soc.x && <a href={soc.x} target="_blank" rel="noopener">X</a>}
              {soc.youtube && <a href={soc.youtube} target="_blank" rel="noopener">YouTube</a>}
              <a href={'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([l.addr, l.city, l.state, l.zip].filter(Boolean).join(' '))} target="_blank" rel="noopener">Map</a>
              {(l.sources || []).map((s) => <a key={s.url} href={s.url} target="_blank" rel="noopener">{s.label}</a>)}
            </div>
            <p className="tiny muted">Call, Text and Email open your phone or computer's own app. Texts arrive with the script already typed; just hit send.</p>
          </section>

          <section className="owner-row" data-tour="owner">
            <div className="row gap-s wrap">
              <span className="muted tiny">Owner</span>
              {['azaiah', 'tony'].map((who) => <button key={who} className={`pill ${l.owner === who ? 'on on-' + who : ''}`} disabled={!canWrite} onClick={() => A.claim(l, who)}><Avatar who={who} size={18} /> {who === me ? 'Me' : TEAM[who].name}</button>)}
              {l.owner && <button className="pill" disabled={!canWrite} onClick={() => A.patchLead(l.id, { owner: null })}>Release</button>}
            </div>
            <div className="row gap-s wrap">
              <label className="tiny muted" htmlFor="stage-sel">Stage</label>
              <select id="stage-sel" className="input input-sm" value={l.stage} disabled={!canWrite} onChange={(e) => A.setStage(l, e.target.value)}>{STAGES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
              <label className="tiny muted" htmlFor="next-at">Next touch</label>
              <input id="next-at" type="date" className="input input-sm" value={l.nextAt ? dayKey(l.nextAt) : ''} disabled={!canWrite} onChange={(e) => A.patchLead(l.id, { nextAt: e.target.value ? new Date(e.target.value + 'T09:00').toISOString() : null }).then(() => e.target.value && A.addActivity({ type: 'schedule', label: `Scheduled the next touch for ${fmtShortDate(e.target.value + 'T12:00')} on`, leadId: l.id, leadName: l.name }))} />
            </div>
          </section>

          <ContactLog l={l} me={me} A={A} canWrite={canWrite} />

          <section>
            <p className="sec-t">Why they fit</p>
            <p className="hook">{hookFor(l)} {impactFor(l)}</p>
            <div className="chips">{(l.fitWhy || []).map((x) => <Chip key={x}>{x}</Chip>)}</div>
            <div className="two">
              <div className="mini-card"><p className="sec-t sm">Website</p><p>{l.web?.summary}</p><ul className="md-list">{(l.web?.issues || []).map((x) => <li key={x}>{x}</li>)}</ul></div>
              <div className="mini-card"><p className="sec-t sm">What we'd fix first</p><ul className="md-list">{fixesFor(l).map((x) => <li key={x}>{x}</li>)}</ul></div>
            </div>
            <div className="mini-card gov">
              <p className="sec-t sm">Listing details</p>
              <dl className="dl">
                <dt>Listed as</dt><dd>{(l.cats || []).join(' · ') || l.trade}</dd>
                <dt>Found by</dt><dd>YellowPages search "{l.searchTerm}" near {l.metro}</dd>
                {l.years ? <><dt>In business</dt><dd>{l.years} years (per listing)</dd></> : null}
                <dt>Website check</dt><dd>{l.web?.summary}</dd>
              </dl>
            </div>
          </section>

          <section data-tour="scripts">
            <p className="sec-t">Scripts for {l.name}</p>
            <div className="tabs" role="tablist">{tabs.map(([k, v]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{v}</button>)}</div>
            {!scripts ? <p className="muted">Loading scripts…</p> : !scripts.call ? <p className="muted">No scripts on file for this lead.</p> : (
              <>
                {tab === 'call' && <ScriptBlock text={f(scripts.call)} actions={telHref && <a className="btn btn-primary btn-sm" href={telHref} target="_blank" rel="noopener"><Icon d={I.phone} size={14} /> Call now</a>} />}
                {tab === 'voicemail' && <ScriptBlock text={f(scripts.voicemail)} />}
                {tab === 'sms' && <ScriptBlock text={sms} actions={smsHref && <a className="btn btn-primary btn-sm" href={smsHref} target="_blank" rel="noopener"><Icon d={I.sms} size={14} /> Open in Messages</a>} />}
                {tab === 'email' && email && <>
                  <div className="row gap-s wrap subj">{scripts.email.subjects.map((s, i) => <button key={i} className={`pill ${subj === i ? 'on' : ''}`} onClick={() => setSubj(i)}>{f(s)}</button>)}</div>
                  <ScriptBlock text={`Subject: ${email.subject}\n\n${email.body}`} actions={mailHref && <a className="btn btn-primary btn-sm" href={mailHref} target="_blank" rel="noopener"><Icon d={I.mail} size={14} /> Open in email</a>} />
                </>}
                {tab === 'linkedin' && <><ScriptBlock text={'Connection note:\n' + f(scripts.linkedin.connect)} /><ScriptBlock text={'After they accept:\n' + f(scripts.linkedin.message)} /></>}
                {tab === 'instagram' && <ScriptBlock text={f(scripts.instagram)} actions={soc.instagram && <a className="btn btn-sm" href={soc.instagram} target="_blank" rel="noopener">Open Instagram</a>} />}
                {tab === 'facebook' && <ScriptBlock text={f(scripts.facebook)} actions={soc.facebook && <a className="btn btn-sm" href={soc.facebook} target="_blank" rel="noopener">Open Facebook</a>} />}
                {tab === 'followups' && <ol className="follow">{scripts.followups.map((x, i) => <li key={i}><p className="row gap-s"><Chip tone="info">Day {x.day}</Chip><b>{x.channel}</b></p><pre className="script-text">{f(x.text)}</pre><CopyBtn text={f(x.text)} /></li>)}</ol>}
              </>
            )}
          </section>

          <section data-tour="notes">
            <p className="sec-t">Notes{l.notesBy && <span className="attrib"> · last edited by {TEAM[l.notesBy]?.name} {fmtWhen(l.notesAt)}</span>}</p>
            <textarea className="input" rows={4} value={notes} disabled={!canWrite} onFocus={() => { notesFocus.current = true }} onChange={(e) => setNotes(e.target.value)} onBlur={() => { notesFocus.current = false; if (notes !== (l.notes || '')) { A.patchLead(l.id, { notes, notesBy: me, notesAt: nowIso() }); A.addActivity({ type: 'note', label: 'Updated notes on', leadId: l.id, leadName: l.name }) } }} placeholder="Shared notes: decision-maker, which brokers they use, the black swan, timing" />
            <div className="row gap-s">
              <input className="input" value={taskT} onChange={(e) => setTaskT(e.target.value)} placeholder="Add a task for this lead (e.g. Run a sample sweep of their county)" />
              <button className="btn" disabled={!taskT.trim() || !canWrite} onClick={async () => { await A.patchLead(l.id, {}); const t = { title: taskT.trim(), assignee: l.owner || me, createdBy: me, leadId: l.id, leadName: l.name, due: dayKey(new Date(Date.now() + 864e5)), done: false, createdAt: nowIso() }; await db.collection('tasks').doc(uid('t')).set(t); A.addActivity({ type: 'task', label: `${t.assignee === me ? 'Added a task' : 'Assigned ' + TEAM[t.assignee]?.name + ' a task'}: “${t.title}” on`, leadId: l.id, leadName: l.name }); setTaskT('') }}>Add</button>
            </div>
            {leadTasks.length > 0 && <ul className="mini">{leadTasks.map((t) => <li key={t.id} className="mini-row"><span>{t.title}</span><Avatar who={t.assignee} size={18} /></li>)}</ul>}
          </section>

          <section>
            <p className="sec-t">Timeline</p>
            {(l.log || []).length === 0 ? <p className="muted">No touches yet. Found {fmtShortDate(l.foundAt)} by the {l.sweep} sweep.</p> :
              <ul className="timeline">{[...l.log].reverse().map((e, i) => <li key={i}><Avatar who={e.by} size={20} /><div><p><b>{e.label}</b> {e.responded && <Chip tone="ok">Responded</Chip>} {e.optOut && <Chip tone="hot">Opted out</Chip>} <span className="muted tiny">{TEAM[e.by]?.name} · {fmtWhen(e.at)}</span></p>{e.note && <p className="muted">{e.note}</p>}</div></li>)}</ul>}
          </section>
          {l.stage === 'won' || l.stage === 'proposal' || l.stage === 'demo' || l.stage === 'onboarding' || l.stage === 'live' ? (
            <section>
              <p className="sec-t">Deal</p>
              <div className="row gap-s wrap">{Object.entries(PKGS).map(([k, p]) => <button key={k} className={`pill ${l.deal?.pkg === k ? 'on' : ''}`} disabled={!canWrite} onClick={() => A.patchLead(l.id, { deal: { pkg: k, setup: p.setup, monthly: p.monthly, by: me } }).then(() => A.addActivity({ type: 'deal', label: `Set the ${p.name} package (${fmtMoney(p.setup)} + ${fmtMoney(p.monthly)}/mo) on`, leadId: l.id, leadName: l.name }))}>{p.name} · {fmtMoney(p.setup)} + {fmtMoney(p.monthly)}/mo</button>)}</div>
            </section>) : null}
        </div>
      </aside>
    </div>
  )
}

/* ------------------------------------------------------------------ dialer */
function Dialer({ me, openLead }) {
  const { leads, settings, canWrite, db } = useData()
  const A = useActions(me)
  const now = useNow(30000)
  const [list, setList] = useState('all')
  const [skip, setSkip] = useState([])
  const [done, setDone] = useState(0)
  const [note, setNote] = useState('')
  const [scripts, setScripts] = useState(null)
  const queue = (leads || []).filter((l) => callable(l, now) && (!l.owner || l.owner === me) && (!l.nextAt || new Date(l.nextAt) <= now) && !skip.includes(l.id)
    && (list === 'all' || LISTS.find((x) => x.key === list).test(l))).sort((a, b) => (b.owner === me) - (a.owner === me) || b.fit - a.fit)
  const l = queue[0]
  useEffect(() => { setScripts(l ? scriptsFor(l) : null) }, [l?.id])
  return (
    <div className="page">
      <header className="page-h"><div><p className="eyebrow">Call block</p><h1>Power hour</h1><p className="muted">Only leads whose local time is inside calling hours, yours first, best fit next. {done} logged this session.</p></div>
        <select className="input" value={list} onChange={(e) => setList(e.target.value)} aria-label="List"><option value="all">All lists</option>{LISTS.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}</select>
      </header>
      {!l ? <Empty title="Nobody callable right now">Every region is outside calling hours, or you've worked the whole queue. West Coast stays open until 9 pm ET.</Empty> : (
        <div className="dialer">
          <section className="panel dial-card" data-tour="dialcard">
            <p className="eyebrow">{queue.length} in queue · {l.region} · their time {callWindow(l.tz, now).label}</p>
            <h2 className="drawer-t">{l.name}</h2>
            <p className="muted">{l.contactName ? `${l.contactName}${l.contactTitle ? ', ' + l.contactTitle : ''}` : 'Ask for the owner'} · {l.trade} · {l.city}, {l.state}</p>
            <p className="phone-big selectable">{l.phoneDisplay}</p>
            <div className="actions">
              <a className="act act-call" href={relayHref('tel', { phone: l.phone }, settings)} target="_blank" rel="noopener"><Icon d={I.phone} /> Call</a>
              <a className={`act act-text ${scripts?.sms ? '' : 'disabled'}`} href={relayHref('sms', { phone: l.phone, body: fill(scripts?.sms, me, settings) }, settings)} target="_blank" rel="noopener"><Icon d={I.sms} /> Text</a>
              <button className="act" onClick={() => openLead(l.id)}>Full card</button>
            </div>
            <p className="hook">{hookFor(l)}</p>
            <input className="input" placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="outcomes">{QUICK_CALL.map((o) => <button key={o.key} className={`btn btn-sm out-${o.key}`} disabled={!canWrite} onClick={async () => { await A.logTouch(l, { channel: 'call', result: o.key, note }); setNote(''); setDone((n) => n + 1) }}>{o.label}</button>)}</div>
            <button className="btn btn-ghost" onClick={() => setSkip((s) => [...s, l.id])}>Skip for now</button>
          </section>
          <section className="panel"><p className="sec-t">Call script</p>{scripts?.call ? <pre className="script-text">{fill(scripts.call, me, settings)}</pre> : <p className="muted">Loading…</p>}</section>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ pipeline */
function Pipeline({ me, openLead }) {
  const { leads, canWrite } = useData()
  const A = useActions(me)
  const [drag, setDrag] = useState(null)
  const [showLost, setShowLost] = useState(false)
  const L = leads || []
  const cols = showLost ? [...PIPE, 'lost'] : PIPE
  return (
    <div className="page">
      <header className="page-h"><div><p className="eyebrow">Pipeline</p><h1>From first touch to live client</h1><p className="muted">Drag cards between columns, or use the stage menu on a card.</p></div><label className="toggle"><input type="checkbox" checked={showLost} onChange={(e) => setShowLost(e.target.checked)} /> Show lost</label></header>
      <div className="kanban" data-tour="kanban">
        {cols.map((s) => {
          const items = L.filter((l) => l.stage === s).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
          const val = items.reduce((t, l) => t + (l.deal?.setup || 0), 0)
          return (
            <section key={s} className={`kcol ${drag ? 'droppable' : ''}`} onDragOver={(e) => { e.preventDefault() }} onDrop={() => { const l = L.find((x) => x.id === drag); if (l && l.stage !== s && canWrite) A.setStage(l, s); setDrag(null) }}>
              <header className="kcol-h"><span>{STAGE_LABEL[s]}</span><span className="muted">{items.length}{val ? ` · ${fmtMoney(val)}` : ''}</span></header>
              <div className="kcol-body">
                {items.length === 0 && <p className="tiny muted pad">Drop a lead here.</p>}
                {items.map((l) => (
                  <div key={l.id} className="kcard" draggable={canWrite} onDragStart={() => setDrag(l.id)} onDragEnd={() => setDrag(null)}>
                    <button className="kcard-main" onClick={() => openLead(l.id)}><span className="lead-name">{l.name}</span><span className="tiny muted">{l.trade} · {l.city}, {l.state}</span></button>
                    <div className="row between"><Avatar who={l.owner} size={20} />{l.deal ? <Chip tone="cert">{PKGS[l.deal.pkg].name}</Chip> : <span className="tiny muted">{l.track === 'build' ? 'Site + portal' : 'Portal'}</span>}
                      <select className="input input-xs" value={l.stage} disabled={!canWrite} aria-label="Move to" onChange={(e) => A.setStage(l, e.target.value)}>{STAGES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ tasks */
function Tasks({ me, openLead }) {
  const { tasks, write, canWrite } = useData()
  const [title, setTitle] = useState(''); const [who, setWho] = useState(me); const [due, setDue] = useState(dayKey(new Date())); const [view, setView] = useState('open')
  const [st, setSt] = useSaveState(); const titleRef = useRef(null)
  const today = dayKey(new Date())
  const add = async (e) => {
    e.preventDefault(); if (st === 'saving') return
    const t = title.trim(); if (!t) { setSt('empty'); titleRef.current?.focus(); return }
    setSt('saving')
    const ok = await write((db) => db.collection('tasks').doc(uid('t')).set({ title: t, assignee: who, createdBy: me, due: due || today, done: false, createdAt: nowIso() }))
    if (!ok) { setSt('error'); return }
    setTitle(''); setSt('done'); if (view !== 'open') setView('open')
    logAct(write, me, { type: 'task', label: `${who === me ? 'Added a task' : 'Assigned ' + TEAM[who].name + ' a task'}: “${t}”` })
  }
  const toggle = (t) => write((db) => db.doc('tasks/' + t.id).update({ done: !t.done, doneAt: !t.done ? nowIso() : null, doneBy: me })).then(() => logAct(write, me, { type: 'task', label: `${t.done ? 'Reopened' : 'Finished'} task: “${t.title}”`, leadId: t.leadId, leadName: t.leadName }))
  const del = (t) => write((db) => db.doc('tasks/' + t.id).delete())
  const shown = tasks.filter((t) => view === 'open' ? !t.done : t.done).sort((a, b) => (a.due || '9').localeCompare(b.due || '9'))
  return (
    <div className="page">
      <header className="page-h"><div><p className="eyebrow">Tasks</p><h1>Who's doing what</h1></div>
        <div className="seg small"><button className={view === 'open' ? 'on' : ''} onClick={() => setView('open')}>Open</button><button className={view === 'done' ? 'on' : ''} onClick={() => setView('done')}>Done</button></div></header>
      <form className="task-add" onSubmit={add} data-tour="taskadd">
        <input ref={titleRef} className="input" value={title} onChange={(e) => { setTitle(e.target.value); if (st === 'empty' || st === 'error') setSt('') }} placeholder="New task, e.g. Call back Elite Medical Transport at 4 pm" aria-label="Task" enterKeyHint="done" />
        <select className="input" value={who} onChange={(e) => setWho(e.target.value)} aria-label="Assign to">{Object.values(TEAM).map((t) => <option key={t.key} value={t.key}>{t.key === me ? 'Me' : t.name}</option>)}</select>
        <input className="input" type="date" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Due" />
        <button type="submit" className="btn btn-primary" disabled={!canWrite || st === 'saving'}>{saveLabel(st, 'Add task')}</button>
      </form>
      <FormMsg st={st} empty="Type the task first, then tap Add task." />
      <div className="grid-2">
        {Object.values(TEAM).map((t) => {
          const mine = shown.filter((x) => x.assignee === t.key)
          return (
            <section key={t.key} className="panel">
              <div className="panel-h"><h2 className="row gap-s"><Avatar who={t.key} /> {t.key === me ? 'You' : t.name}</h2><span className="muted">{mine.length}</span></div>
              {mine.length === 0 ? <p className="muted">{view === 'open' ? 'All clear.' : 'Nothing finished yet.'}</p> :
                <ul className="tasks">{mine.map((x) => (
                  <li key={x.id} className={x.done ? 'done' : ''}>
                    <input type="checkbox" checked={!!x.done} onChange={() => toggle(x)} aria-label={'Done: ' + x.title} disabled={!canWrite} />
                    <div className="min0"><p>{x.title}</p><p className="tiny muted">{x.leadName && <button className="link" onClick={() => openLead(x.leadId)}>{x.leadName}</button>} {x.due && <span className={!x.done && x.due < today ? 'overdue' : ''}>Due {fmtShortDate(x.due + 'T12:00')}</span>} {x.createdBy !== x.assignee && `· from ${TEAM[x.createdBy]?.name}`}</p></div>
                    <button className="icon-btn sm" onClick={() => del(x)} aria-label="Delete task" disabled={!canWrite}><Icon d={I.x} size={14} /></button>
                  </li>))}</ul>}
            </section>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ idea board */
const BOARD_COLS = [['ideas', 'Ideas'], ['trying', 'Trying'], ['working', 'Working'], ['parked', 'Parked']]
const NOTE_COLORS = ['amber', 'violet', 'teal', 'rose', 'slate']
function Board({ me }) {
  const { board, write, canWrite } = useData()
  const [title, setTitle] = useState(''); const [body, setBody] = useState(''); const [color, setColor] = useState('amber'); const [drag, setDrag] = useState(null)
  const [st, setSt] = useSaveState(); const titleRef = useRef(null)
  const add = async (e) => {
    e.preventDefault(); if (st === 'saving') return
    let t = title.trim(); const b = body.trim()
    if (!t && b) t = b.length > 60 ? b.slice(0, 57).trim() + '…' : b // details only: use them as the title
    if (!t) { setSt('empty'); titleRef.current?.focus(); return }
    setSt('saving')
    const ok = await write((db) => db.collection('board').doc(uid('n')).set({ title: t, body: t === b ? '' : b, color, column: 'ideas', author: me, votes: {}, pinned: false, createdAt: nowIso() }))
    if (!ok) { setSt('error'); return }
    setTitle(''); setBody(''); setSt('done')
    logAct(write, me, { type: 'idea', label: `Pinned an idea: “${t}”` })
  }
  const up = (n, patch) => write((db) => db.doc('board/' + n.id).update(patch))
  return (
    <div className="page">
      <header className="page-h"><div><p className="eyebrow">Idea board</p><h1>Ideas, experiments and everything else</h1><p className="muted">Pin anything: offers to test, scripts that worked, client ideas, tools, random thoughts.</p></div></header>
      <form className="note-add" onSubmit={add} data-tour="noteadd">
        <input ref={titleRef} className="input" value={title} onChange={(e) => { setTitle(e.target.value); if (st === 'empty' || st === 'error') setSt('') }} placeholder="Idea" aria-label="Idea title" />
        <input className="input" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Details (optional)" aria-label="Idea details" />
        <div className="swatches" role="radiogroup" aria-label="Color">{NOTE_COLORS.map((c) => <button key={c} type="button" role="radio" aria-checked={color === c} className={`swatch n-${c} ${color === c ? 'on' : ''}`} onClick={() => setColor(c)} aria-label={c} />)}</div>
        <button type="submit" className="btn btn-primary" disabled={!canWrite || st === 'saving'}>{saveLabel(st, 'Pin it', 'Pinned ✓')}</button>
      </form>
      <FormMsg st={st} empty="Type your idea first, then tap Pin it." />
      <div className="board">
        {BOARD_COLS.map(([k, v]) => {
          const items = board.filter((n) => (n.column || 'ideas') === k).sort((a, b) => (b.pinned - a.pinned) || (Object.keys(b.votes || {}).length - Object.keys(a.votes || {}).length) || (b.createdAt || '').localeCompare(a.createdAt || ''))
          return (
            <section key={k} className="bcol" onDragOver={(e) => e.preventDefault()} onDrop={() => { const n = board.find((x) => x.id === drag); if (n && canWrite) { up(n, { column: k, movedBy: me }); logAct(write, me, { type: 'idea', label: `Moved “${n.title}” to ${BOARD_COLS.find((c) => c[0] === k)?.[1] || k}` }) } setDrag(null) }}>
              <header className="kcol-h"><span>{v}</span><span className="muted">{items.length}</span></header>
              <div className="bcol-body">
                {items.length === 0 && <p className="tiny muted pad">{k === 'ideas' ? 'Pin the first idea above.' : 'Drag notes here.'}</p>}
                {items.map((n) => {
                  const voted = !!(n.votes || {})[me]
                  return (
                    <article key={n.id} className={`note n-${n.color || 'amber'}`} draggable={canWrite} onDragStart={() => setDrag(n.id)}>
                      {n.pinned && <span className="pin" aria-label="Pinned">●</span>}
                      <p className="note-t">{n.title}</p>
                      {n.body && <p className="note-b">{n.body}</p>}
                      <div className="row between note-f">
                        <span className="row gap-s"><Avatar who={n.author} size={18} /><span className="tiny">{fmtWhen(n.createdAt)}</span></span>
                        <span className="row gap-s">
                          <button className={`tiny-btn ${voted ? 'on' : ''}`} disabled={!canWrite} onClick={() => up(n, { votes: { ...(n.votes || {}), [me]: !voted } })} aria-label="Upvote">▲ {Object.values(n.votes || {}).filter(Boolean).length}</button>
                          <button className="tiny-btn" disabled={!canWrite} onClick={() => up(n, { pinned: !n.pinned })}>{n.pinned ? 'Unpin' : 'Pin'}</button>
                          <select className="input input-xs" value={n.column || 'ideas'} disabled={!canWrite} aria-label="Move" onChange={(e) => up(n, { column: e.target.value })}>{BOARD_COLS.map(([a, b]) => <option key={a} value={a}>{b}</option>)}</select>
                          {n.author === me && <button className="tiny-btn" disabled={!canWrite} onClick={() => write((db) => db.doc('board/' + n.id).delete())} aria-label="Delete">✕</button>}
                        </span>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ playbook / research / growth / sweeps / settings */
function Playbook() {
  const [sel, setSel] = useState(PLAYBOOK[0].id)
  const a = PLAYBOOK.find((x) => x.id === sel)
  return (
    <div className="page">
      <header className="page-h"><div><p className="eyebrow">Playbook</p><h1>How we sell</h1><p className="muted">Hormozi for the offer, Voss and Smith & Gaunt for the conversation. Every lead's scripts are written from this.</p></div></header>
      <div className="reader">
        <nav className="toc">{PLAYBOOK.map((x) => <button key={x.id} className={sel === x.id ? 'on' : ''} onClick={() => setSel(x.id)}>{x.title}</button>)}</nav>
        <article className="panel prose"><h2>{a.title}</h2><Md text={a.md} /></article>
      </div>
    </div>
  )
}
function Research() {
  const [tab, setTab] = useState('gov'); const [trade, setTrade] = useState(TRADE_BRIEFS[0].trade); const [gq, setGq] = useState('')
  const b = TRADE_BRIEFS.find((x) => x.trade === trade)
  return (
    <div className="page">
      <header className="page-h"><div><p className="eyebrow">Research library</p><h1>Know the operator before you dial</h1></div></header>
      <div className="seg">{[['gov', 'Where the work is'], ['trades', 'Operator briefs'], ['glossary', 'Lingo'], ['sources', 'Sources']].map(([k, v]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{v}</button>)}</div>
      {tab === 'gov' && <article className="panel prose"><h2>Where the work comes from</h2><Md text={GOV_PRIMER} /></article>}
      {tab === 'trades' && <div className="reader"><nav className="toc">{TRADE_BRIEFS.map((x) => <button key={x.trade} className={trade === x.trade ? 'on' : ''} onClick={() => setTrade(x.trade)}>{x.trade}</button>)}</nav>
        <article className="panel prose"><h2>{b.trade}</h2>
          <dl className="dl wide"><dt>What they buy</dt><dd>{b.buys}</dd><dt>Typical job</dt><dd>{b.ticket}</dd><dt>Season</dt><dd>{b.season}</dd></dl>
          <h3 className="md-h">Pain points</h3><ul className="md-list">{b.pains.map((p) => <li key={p}>{p}</li>)}</ul>
          <h3 className="md-h">Talk like them</h3><div className="chips">{b.lingo.map((p) => <Chip key={p}>{p}</Chip>)}</div>
          <h3 className="md-h">Our angle</h3><p>{b.angle}</p></article></div>}
      {tab === 'glossary' && <div className="panel"><input className="input" type="search" placeholder="Search terms" value={gq} onChange={(e) => setGq(e.target.value)} aria-label="Search glossary" />
        <dl className="glossary">{GLOSSARY.filter(([t, d]) => !gq || (t + d).toLowerCase().includes(gq.toLowerCase())).map(([t, d]) => <React.Fragment key={t}><dt>{t}</dt><dd>{d}</dd></React.Fragment>)}</dl></div>}
      {tab === 'sources' && <div className="panel prose">{SOURCES.map((g) => <div key={g.group}><h3 className="md-h">{g.group}</h3><ul className="md-list">{g.items.map(([t, u]) => <li key={u}><a href={u} target="_blank" rel="noopener">{t}</a></li>)}</ul></div>)}<h3 className="md-h">How leads are found</h3><Md text={SWEEP_EXPLAINER} /></div>}
    </div>
  )
}
function Growth() {
  const { leads } = useData()
  const [v, setV] = useState({ dials: 60, people: 2, days: 20, connect: 15, demo: 20, close: 25, mixC: 30, mixG: 55 })
  const set = (k) => (e) => setV({ ...v, [k]: Number(e.target.value) })
  const dials = v.dials * v.people * v.days, convos = dials * v.connect / 100, demos = convos * v.demo / 100, closes = demos * v.close / 100
  const mixF = Math.max(0, 100 - v.mixC - v.mixG)
  const avgSetup = (v.mixC * 4997 + v.mixG * 1997 + mixF * 997) / 100, avgMo = (v.mixC * 497 + v.mixG * 297 + mixF * 147) / 100
  const setupRev = closes * avgSetup, mrrAdd = closes * avgMo
  const months = Array.from({ length: 6 }, (_, i) => setupRev + mrrAdd * (i + 1))
  const max = Math.max(20000, ...months)
  const field = (k, label, min, max, step = 1, suf = '') => <label className="calc-f"><span className="tiny muted">{label}</span><span className="row gap-s"><input type="range" min={min} max={max} step={step} value={v[k]} onChange={set(k)} /><b className="mono">{v[k]}{suf}</b></span></label>
  return (
    <div className="page">
      <header className="page-h"><div><p className="eyebrow">Growth plan</p><h1>The road to $20,000 a month</h1></div></header>
      <section className="grid-2-1">
        <div className="panel">
          <div className="panel-h"><h2>Revenue calculator</h2><span className="tiny muted">assumptions, not history</span></div>
          <div className="calc">
            {field('dials', 'Dials per person per day', 20, 150)}{field('people', 'People calling', 1, 4)}{field('days', 'Call days per month', 8, 22)}
            {field('connect', 'Connect rate', 5, 40, 1, '%')}{field('demo', 'Conversation to demo', 5, 50, 1, '%')}{field('close', 'Demo to close', 5, 60, 1, '%')}
            {field('mixC', 'Contract Ready share of deals', 0, 100, 5, '%')}{field('mixG', 'Route share of deals', 0, 100 - v.mixC, 5, '%')}
          </div>
          <div className="calc-out">
            <div><p className="kpi-l">Dials</p><p className="kpi-v sm">{Math.round(dials).toLocaleString()}</p></div>
            <div><p className="kpi-l">Conversations</p><p className="kpi-v sm">{Math.round(convos)}</p></div>
            <div><p className="kpi-l">Demos</p><p className="kpi-v sm">{Math.round(demos)}</p></div>
            <div><p className="kpi-l">New clients</p><p className="kpi-v sm">{closes.toFixed(1)}</p></div>
            <div><p className="kpi-l">Month 1 revenue</p><p className="kpi-v sm">{fmtMoney(months[0])}</p></div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-h"><h2>Monthly revenue, 6 months</h2></div>
          <div className="vbars" role="img" aria-label="Projected monthly revenue">
            {months.map((m, i) => <div key={i} className="vbar" title={fmtMoney(m)}><span className="vbar-v">{fmtMoney(m / 1000).replace('$', '$') }k</span><span className={`vbar-fill ${m >= 20000 ? 'hit' : ''}`} style={{ height: `${(m / max) * 100}%` }} /><span className="tiny muted">M{i + 1}</span></div>)}
            <div className="goal-line" style={{ bottom: `calc(${(20000 / max) * 100}% * 0.82 + 22px)` }}><span>$20K goal</span></div>
          </div>
          <p className="tiny muted">Setup fees each month plus recurring fees that stack as clients go live. {leads ? `${leads.filter((l) => !CLOSED.has(l.stage)).length} open leads in the portal today.` : ''}</p>
        </div>
      </section>
      <article className="panel prose"><Md text={GROWTH} /></article>
    </div>
  )
}
function Sweeps() {
  const { sweeps, leads } = useData()
  return (
    <div className="page">
      <header className="page-h"><div><p className="eyebrow">Sweeps</p><h1>Where new leads come from</h1></div></header>
      <section className="grid-2-1">
        <div className="panel">
          <div className="panel-h"><h2>Sweep history</h2></div>
          {sweeps.length === 0 ? <p className="muted">No sweeps logged yet.</p> :
            <ul className="sweeps">{sweeps.map((s) => <li key={s.id}><div className="row between"><b>{fmtShortDate(s.at)} · {s.added} leads</b><Chip tone="info">{s.by}</Chip></div><p className="muted">{s.summary}</p>{s.sources && <p className="tiny muted">{s.sources.join(' · ')}</p>}</li>)}</ul>}
        </div>
        <div className="panel prose"><h2>How the sweep works</h2><Md text={SWEEP_EXPLAINER} /></div>
      </section>
    </div>
  )
}
function Settings({ me }) {
  const { settings, write, canWrite } = useData()
  const [s, setS] = useState(settings)
  useEffect(() => setS(settings), [settings])
  const m = (k) => s.members?.[k] || {}
  const setM = (who, k, val) => setS({ ...s, members: { ...(s.members || {}), [who]: { ...(s.members?.[who] || {}), [k]: val } } })
  const [sst, setSst] = useSaveState()
  const save = async () => { setSst('saving'); const ok = await write((db) => db.doc('settings/team').set({ ...s, updatedAt: nowIso(), updatedBy: me })); setSst(ok ? 'done' : 'error'); if (ok) logAct(write, me, { type: 'settings', label: 'Updated team settings' }) }
  return (
    <div className="page">
      <header className="page-h"><div><p className="eyebrow">Settings</p><h1>Team settings</h1><p className="muted">These fill the scripts: your name, your callback number and the demo link.</p></div></header>
      <section className="grid-2" data-tour="settings">
        {Object.values(TEAM).map((t) => (
          <div key={t.key} className="panel">
            <div className="panel-h"><h2 className="row gap-s"><Avatar who={t.key} /> {t.name}</h2></div>
            <label className="field"><span>Callback number used in scripts</span><input className="input" value={m(t.key).phone || ''} onChange={(e) => setM(t.key, 'phone', e.target.value)} placeholder="(804) 555-0123" /></label>
            <label className="field"><span>Email</span><input className="input" value={m(t.key).email || ''} onChange={(e) => setM(t.key, 'email', e.target.value)} placeholder={t.key + '@dataisdata.com'} /></label>
          </div>
        ))}
        <div className="panel">
          <div className="panel-h"><h2>Links</h2></div>
          <label className="field"><span>Demo portal link (goes in texts and emails)</span><input className="input" value={s.demoUrl || ''} onChange={(e) => setS({ ...s, demoUrl: e.target.value })} placeholder="https://demo.statsweep.com" /></label>
          <label className="field"><span>Monthly revenue goal</span><input className="input" type="number" value={s.goal || 20000} onChange={(e) => setS({ ...s, goal: Number(e.target.value) })} /></label>
          <label className="toggle"><input type="checkbox" checked={s.useRelay === true} onChange={(e) => setS({ ...s, useRelay: e.target.checked })} /> Route call, text and email buttons through statsweep.com/go (only if a phone won't open them directly)</label>
          <div className="row gap-s"><button className="btn btn-primary" disabled={!canWrite || sst === 'saving'} onClick={save}>{saveLabel(sst, 'Save settings', 'Saved ✓')}</button></div><FormMsg st={sst} />
        </div>
      </section>
    </div>
  )
}

/* ------------------------------------------------------------------ contact log (per lead) */
function ContactLog({ l, me, A, canWrite }) {
  const [channel, setChannel] = useState('call')
  const opts = resultsFor(channel)
  const [result, setResult] = useState(opts[0].key)
  const [note, setNote] = useState('')
  const [next, setNext] = useState('auto')
  useEffect(() => { setResult(resultsFor(channel)[0].key) }, [channel])
  const log = l.log || []
  const attempts = log.filter((e) => e.channel)
  const used = [...new Set(attempts.map((e) => e.channel))]
  const responded = l.responded || attempts.some((e) => e.responded)
  const last = attempts[attempts.length - 1]
  const [st, setSt] = useSaveState()
  const save = async () => { if (st === 'saving') return; setSt('saving'); try { await A.logTouch(l, { channel, result, note, nextOverride: next === 'auto' ? undefined : next === 'none' ? null : Number(next) }); setNote(''); setNext('auto'); setSt('done') } catch { setSt('error') } }
  return (
    <section className="log-box" data-tour="contactlog">
      <p className="sec-t">Contact log</p>
      <div className="status-row">
        <div><span className="tiny muted">Contacted</span><b>{attempts.length ? `Yes · ${attempts.length}×` : 'Not yet'}</b></div>
        <div><span className="tiny muted">How</span><b>{used.length ? used.map((c) => CHANNEL_LABEL[c]).join(', ') : '—'}</b></div>
        <div><span className="tiny muted">Answered / replied</span><b className={responded ? 'okc' : ''}>{responded ? 'Yes' : attempts.length ? 'No response yet' : '—'}</b></div>
        <div><span className="tiny muted">Status</span><b className={l.optOut ? 'hotc' : ''}>{l.optOut ? 'Said stop: do not contact' : l.badNumber ? 'Bad number' : last ? last.label.split(': ').slice(1).join(': ') : 'New'}</b></div>
      </div>
      {l.optOut && <p className="banner small">They asked us to stop. Don't call, text or email this lead again.</p>}
      <div className="log-form">
        <label className="field"><span>How did you reach out?</span><select className="input" value={channel} onChange={(e) => setChannel(e.target.value)}>{CHANNELS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        <label className="field"><span>What happened?</span><select className="input" value={result} onChange={(e) => setResult(e.target.value)}>{opts.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}</select></label>
        <label className="field"><span>Next touch</span><select className="input" value={next} onChange={(e) => setNext(e.target.value)}><option value="auto">Auto (cadence)</option><option value="1">Tomorrow</option><option value="2">In 2 days</option><option value="7">Next week</option><option value="30">In a month</option><option value="none">None</option></select></label>
        <label className="field span2"><span>Notes</span><input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Who you spoke with, what they said, objections, the black swan" /></label>
        <button type="button" className="btn btn-primary" disabled={!canWrite || st === 'saving'} onClick={save}>{saveLabel(st, 'Log it', 'Logged ✓')}</button>
      </div>
      <FormMsg st={st} />
      <p className="tiny muted">Quick call results</p>
      <div className="outcomes">{QUICK_CALL.map((o) => <button key={o.key} className={`btn btn-sm out-${o.key}`} disabled={!canWrite} onClick={() => A.logTouch(l, { channel: 'call', result: o.key, note }).then(() => setNote(''))}>{o.label}</button>)}</div>
    </section>
  )
}

/* ------------------------------------------------------------------ weekly stats */
const TOUCH = new Set(['call', 'text', 'email', 'linkedin', 'instagram', 'facebook', 'inperson', 'inbound', 'dm'])
function weekStart(d) { const x = new Date(d); const day = (x.getDay() + 6) % 7; x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - day); return x }
function weekStats(activity, n = 8) {
  const out = []; const start0 = weekStart(new Date())
  for (let i = 0; i < n; i++) {
    const s = new Date(start0); s.setDate(s.getDate() - 7 * i); const e = new Date(s); e.setDate(e.getDate() + 7)
    const inW = activity.filter((a) => { const t = new Date(a.at); return t >= s && t < e })
    const per = (who) => { const w = who ? inW.filter((a) => a.who === who) : inW; const demos = w.filter((a) => a.outcome === 'demo').length, wins = w.filter((a) => a.outcome === 'won').length
      return { touches: w.filter((a) => TOUCH.has(a.type)).length, calls: w.filter((a) => a.type === 'call').length, convos: w.filter((a) => a.responded).length, demos, wins, rate: demos ? wins / demos : 0 } }
    out.push({ start: s, ...per(null), azaiah: per('azaiah'), tony: per('tony') })
  }
  return out
}

/* ------------------------------------------------------------------ advisor */
function Advisor({ me, go }) {
  const { leads, activity, finance, settings } = useData()
  const L = leads || []
  const weeks = weekStats(activity, 8)
  const w0 = weeks[0], w1 = weeks[1]
  const now = new Date()
  const calls14 = activity.filter((a) => a.type === 'call' && now - new Date(a.at) < 14 * 864e5)
  const answered14 = calls14.filter((a) => a.responded).length
  const connect = calls14.length ? answered14 / calls14.length : null
  const inBest = calls14.filter((a) => { const l = L.find((x) => x.id === a.leadId); return l && callWindow(l.tz, new Date(a.at)).status === 'best' }).length
  const overdue = L.filter((l) => l.nextAt && new Date(l.nextAt) < now && !CLOSED.has(l.stage))
  const hotGov = L.filter((l) => l.track === 'build' && !l.owner && l.stage === 'new' && l.fit >= 85)
  const stale = L.filter((l) => ['talking', 'demo', 'proposal'].includes(l.stage) && l.lastTouchAt && now - new Date(l.lastTouchAt) > 5 * 864e5)
  const workdays = Math.max(1, Math.min(5, ((now.getDay() + 6) % 7) + 1))
  const perDay = (who) => w0[who].touches / workdays
  const tips = []
  const add = (tone, title, body, action) => tips.push({ tone, title, body, action })
  if (!activity.length) add('info', 'Start logging every touch', 'The advisor learns from the contact log. Log every call, text and email, even no-answers, and this page turns into a coach within a few days.')
  ;['azaiah', 'tony'].forEach((who) => { const p = perDay(who); if (activity.length && p < 40) add('warn', `${TEAM[who].name}: ${p.toFixed(0)} ${Math.round(p) === 1 ? 'touch' : 'touches'} a day this week`, `The math to $20K a month needs roughly 60 touches per person per day. Block two 90-minute call sessions, one in the East/Central window and one for the West Coast after 3 pm ET.`, ['dialer', 'Start a call block']) })
  if (connect !== null && connect < 0.12) add('warn', `Connect rate is ${(connect * 100).toFixed(0)}%`, `Only ${(calls14.length ? (inBest / calls14.length) * 100 : 0).toFixed(0)}% of your calls landed in the best windows (7 to 8:30 am, 1:30 to 2:30 pm and 4 to 5:30 pm their time). Operators pick up before the first pickups, between dialysis waves and on the drive home.`, ['leads', 'See who is callable'])
  if (overdue.length) add('hot', `${overdue.length} follow-ups are overdue`, 'Most deals close on touch four to eight. Clear these before calling anyone new.', ['home', 'Open command center'])
  if (stale.length) add('hot', `${stale.length} warm deals went quiet for 5+ days`, `${stale.slice(0, 3).map((l) => l.name).join(', ')}${stale.length > 3 ? '…' : ''}. A short "Have you given up on…?" email usually restarts these.`, ['pipeline', 'Open pipeline'])
  if (hotGov.length) add('info', `${hotGov.length} unclaimed no-website leads scoring 85+`, 'Operators with no site of their own, a street address and years in business. The pitch is obvious and they need the full Route plan. Claim and call them first.', ['leads', 'Open the list'])
  if (w0.demos && w0.rate < 0.2) add('warn', `Close rate this week: ${(w0.rate * 100).toFixed(0)}%`, 'On demo calls, run CLOSER in order and get "That\'s right" on their problem before showing the portal. State the price once, then stop talking.', ['playbook', 'Review CLOSER'])
  if (w0.demos && w0.rate >= 0.3) add('ok', `Close rate this week: ${(w0.rate * 100).toFixed(0)}%`, 'That works. The lever now is volume: more demos booked, not a better pitch.')
  if (w1 && w0.touches < w1.touches * 0.7 && w1.touches > 20) add('warn', 'Activity is down from last week', `${w0.touches} touches so far vs ${w1.touches} last week.`)
  const fin = finance || []
  const overdueAR = fin.filter((f) => f.kind === 'income' && f.status === 'pending' && f.due && f.due < dayKey(now))
  if (overdueAR.length) add('hot', `${overdueAR.length} client invoices are overdue`, `${fmtMoney(overdueAR.reduce((s, f) => s + Number(f.amount || 0), 0))} outstanding. Collect before you spend.`, ['finance', 'Open money'])
  if (!tips.length) add('ok', 'Nothing urgent', 'Keep the cadence: call blocks every morning, West Coast in the afternoon, follow-ups cleared daily.')

  const [ai, setAi] = useState(''); const [busy, setBusy] = useState(false); const [aiErr, setAiErr] = useState('')
  const ask = async () => {
    setBusy(true); setAi(''); setAiErr('')
    const stats = { weeks: weeks.map((w) => ({ week: dayKey(w.start), touches: w.touches, calls: w.calls, conversations: w.convos, demos: w.demos, wins: w.wins, azaiah: w.azaiah, tony: w.tony })),
      connectRate14d: connect, callsInBestWindow14d: inBest, calls14d: calls14.length, overdueFollowups: overdue.length, staleWarmDeals: stale.length,
      pipeline: Object.fromEntries(STAGES.map(([k]) => [k, L.filter((l) => l.stage === k).length])), goal: settings.goal || 20000,
      wonDeals: L.filter((l) => ['won', 'onboarding', 'live'].includes(l.stage)).map((l) => ({ pkg: l.deal?.pkg, trade: l.trade })) }
    const prompt = `You are the sales coach for StatSweep, a DataIsData service run by two people (Azaiah and Tony) selling independent medical couriers and NEMT operators a website, a business portal and a weekly bid and lead sweep. Packages: Contract Ready $4,997 + $497/mo, Route $1,997 + $297/mo, Launch $997 + $147/mo. Goal: $20,000/month. Methods they use: Hormozi (value equation, Grand Slam offer, relentless follow-up), Chris Voss and Smith & Gaunt (tactical empathy, labels, calibrated questions, no-oriented questions), CLOSER on demo calls.
Here are their real numbers as JSON:\n${JSON.stringify(stats)}
Give a short, direct coaching report in plain English: (1) the single biggest bottleneck and the number that shows it, (2) three specific things to do this week, each tied to a number, (3) one thing each person is doing well or should change, if the data shows it. No fluff, under 220 words. Use short paragraphs and simple dashes for lists.`
    try { const r = await serverApi('coach', { method: 'POST', body: JSON.stringify({ prompt }) }); setAi(r.text || '') } catch (e) { setAiErr(e.message || 'The coach could not answer right now.') }
    setBusy(false)
  }
  const maxRate = 1
  return (
    <div className="page">
      <header className="page-h"><div><p className="eyebrow">Advisor</p><h1>How we improve</h1><p className="muted">Read from your contact log, pipeline and money every time you open this page.</p></div>
        <button className="btn btn-primary" onClick={ask} disabled={busy}><Icon d={I.bolt} /> {busy ? 'Thinking…' : 'Get AI coaching'}</button></header>
      {(ai || aiErr) && <section className="panel coach">{aiErr ? <p className="muted">{aiErr}</p> : <Md text={ai.replace(/^#+\s*/gm, '## ')} />}</section>}
      <section className="tips" data-tour="tips">{tips.map((t, i) => <article key={i} className={`tip-card tone-${t.tone}`}><p className="tip-t">{t.title}</p><p className="muted">{t.body}</p>{t.action && <button className="link" onClick={() => go(t.action[0])}>{t.action[1]} →</button>}</article>)}</section>
      <section className="grid-2-1">
        <div className="panel" data-tour="closerate">
          <div className="panel-h"><h2>Weekly close rate</h2><span className="tiny muted">won ÷ demos booked, by week</span></div>
          <div className="vbars rate" role="img" aria-label="Weekly close rate, last 8 weeks">
            {[...weeks].reverse().map((w, i) => <div key={i} className="vbar" title={`${fmtShortDate(w.start)}: ${w.wins} of ${w.demos}`}><span className="vbar-v">{w.demos ? Math.round(w.rate * 100) + '%' : '—'}</span><span className={`vbar-fill ${w.demos ? '' : 'zero'}`} style={{ height: `${(w.rate / maxRate) * 100}%` }} /><span className="tiny muted">{fmtShortDate(w.start)}</span></div>)}
          </div>
        </div>
        <div className="panel">
          <div className="panel-h"><h2>This week, by person</h2></div>
          <div className="tbl-wrap"><table className="tbl"><thead><tr><th></th><th>Touches</th><th>Convos</th><th>Demos</th><th>Won</th><th>Close</th></tr></thead>
            <tbody>{['azaiah', 'tony'].map((who) => { const p = w0[who]; return <tr key={who}><td className="row gap-s"><Avatar who={who} size={20} /> {TEAM[who].name}</td><td>{p.touches}</td><td>{p.convos}</td><td>{p.demos}</td><td>{p.wins}</td><td>{p.demos ? Math.round(p.rate * 100) + '%' : '—'}</td></tr> })}</tbody></table></div>
        </div>
      </section>
      <section className="panel">
        <div className="panel-h"><h2>Last 8 weeks</h2></div>
        <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Week of</th><th>Touches</th><th>Calls</th><th>Conversations</th><th>Demos</th><th>Won</th><th>Close rate</th></tr></thead>
          <tbody>{weeks.map((w, i) => <tr key={i}><td>{fmtShortDate(w.start)}</td><td>{w.touches}</td><td>{w.calls}</td><td>{w.convos}</td><td>{w.demos}</td><td>{w.wins}</td><td>{w.demos ? Math.round(w.rate * 100) + '%' : '—'}</td></tr>)}</tbody></table></div>
      </section>
    </div>
  )
}

/* ------------------------------------------------------------------ money */
const FIN_KINDS = [['income', 'Income'], ['expense', 'Expense'], ['bill', 'Bill'], ['subscription', 'Subscription'], ['payout', 'Owner payout']]
const FIN_CATS = { income: ['Setup fee', 'Monthly retainer', 'Project', 'Other income'], expense: ['Software', 'Advertising', 'Contractors', 'Equipment', 'Travel', 'Meals', 'Fees', 'Taxes', 'Other'], bill: ['Rent / office', 'Phone / internet', 'Insurance', 'Loan', 'Taxes', 'Other'], subscription: ['Software', 'Hosting', 'Data / leads', 'AI', 'Phone', 'Other'], payout: ['Owner draw'] }
const monthlyOf = (f) => f.cadence === 'yearly' ? Number(f.amount || 0) / 12 : f.cadence === 'monthly' ? Number(f.amount || 0) : 0
function bump(dateStr, cadence) { const d = new Date((dateStr || dayKey(new Date())) + 'T12:00'); if (cadence === 'yearly') d.setFullYear(d.getFullYear() + 1); else d.setMonth(d.getMonth() + 1); return dayKey(d) }
function Finance({ me }) {
  const { finance, leads, write, canWrite, finSettings } = useData()
  const F = finance || []
  const fs = { cashOnHand: 0, taxRate: 25, bufferMonths: 1, ownerTarget: { azaiah: 4000, tony: 4000 }, split: { azaiah: 50, tony: 50 }, pf: { profit: 5, owners: 50, tax: 15, opex: 30 }, ...(finSettings || {}) }
  const [tab, setTab] = useState('overview')
  const [form, setForm] = useState({ kind: 'income', title: '', party: '', category: 'Setup fee', amount: '', status: 'paid', date: dayKey(new Date()), due: '', cadence: 'once', who: me })
  const [cfg, setCfg] = useState(fs)
  useEffect(() => setCfg(fs), [JSON.stringify(finSettings || {})])
  const today = dayKey(new Date()), month = today.slice(0, 7)
  const in30 = dayKey(new Date(Date.now() + 30 * 864e5))
  const paid = F.filter((f) => f.status === 'paid')
  const sumBy = (arr) => arr.reduce((s, f) => s + Number(f.amount || 0), 0)
  const incomeM = sumBy(paid.filter((f) => f.kind === 'income' && (f.date || '').startsWith(month)))
  const spendM = sumBy(paid.filter((f) => ['expense', 'bill', 'subscription'].includes(f.kind) && (f.date || '').startsWith(month)))
  const payoutM = sumBy(paid.filter((f) => f.kind === 'payout' && (f.date || '').startsWith(month)))
  const ar = F.filter((f) => f.kind === 'income' && f.status === 'pending')
  const arOver = ar.filter((f) => f.due && f.due < today)
  const subs = F.filter((f) => f.kind === 'subscription' && f.active !== false)
  const recurringBills = F.filter((f) => f.kind === 'bill' && (f.cadence === 'monthly' || f.cadence === 'yearly') && f.active !== false)
  const fixedMonthly = subs.reduce((s, f) => s + monthlyOf(f), 0) + recurringBills.reduce((s, f) => s + monthlyOf(f), 0)
  const upcoming = [...F.filter((f) => f.kind === 'bill' && f.status === 'pending' && f.due && f.due <= in30), ...subs.filter((f) => f.nextDue && f.nextDue <= in30).map((f) => ({ ...f, due: f.nextDue }))].sort((a, b) => a.due.localeCompare(b.due))
  const upcomingTotal = sumBy(upcoming)
  const won = (leads || []).filter((l) => ['won', 'onboarding', 'live'].includes(l.stage))
  const mrr = won.reduce((s, l) => s + (l.deal?.monthly || 0), 0)
  const tax = (cfg.taxRate || 0) / 100
  const ownerNeed = Number(cfg.ownerTarget.azaiah || 0) + Number(cfg.ownerTarget.tony || 0)
  const required = fixedMonthly + ownerNeed / Math.max(0.01, 1 - tax)
  const gap = Math.max(0, required - mrr)
  const net = incomeM - spendM
  const taxReserve = Math.max(0, net) * tax
  const buffer = fixedMonthly * (cfg.bufferMonths || 0)
  const safe = Math.max(0, Number(cfg.cashOnHand || 0) - upcomingTotal - taxReserve - buffer)
  const avgSpend = (() => { const ms = [0, 1, 2].map((i) => { const d = new Date(); d.setMonth(d.getMonth() - i); return dayKey(d).slice(0, 7) }); return ms.reduce((s, m) => s + sumBy(paid.filter((f) => ['expense', 'bill', 'subscription'].includes(f.kind) && (f.date || '').startsWith(m))), 0) / 3 })()
  const burn = Math.max(fixedMonthly, avgSpend)
  const runway = burn && Number(cfg.cashOnHand) > 0 ? Number(cfg.cashOnHand) / burn : null
  const months6 = Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i)); const m = dayKey(d).slice(0, 7); return { m, inc: sumBy(paid.filter((f) => f.kind === 'income' && (f.date || '').startsWith(m))), out: sumBy(paid.filter((f) => ['expense', 'bill', 'subscription'].includes(f.kind) && (f.date || '').startsWith(m))) } })
  const max6 = Math.max(1000, ...months6.flatMap((x) => [x.inc, x.out]))
  const pf = cfg.pf, pfTot = pf.profit + pf.owners + pf.tax + pf.opex || 100
  const insights = []
  if (gap > 0) insights.push(`To cover fixed costs (${fmtMoney(fixedMonthly)}/mo), pay both owners their targets and set aside ${cfg.taxRate}% for taxes, we need ${fmtMoney(required)}/mo. Recurring revenue covers ${fmtMoney(mrr)}, so the gap is ${fmtMoney(gap)}: about ${Math.ceil(gap / 1500)} Growth or ${Math.ceil(gap / 5000)} Contracts setups this month.`)
  else insights.push(`Recurring revenue (${fmtMoney(mrr)}/mo) already covers fixed costs, owner targets and taxes. Every new setup fee is upside.`)
  if (arOver.length) insights.push(`${arOver.length} invoices are overdue (${fmtMoney(sumBy(arOver))}). Chase them before taking a payout.`)
  if (!(Number(cfg.cashOnHand) > 0)) insights.push('Enter your cash in the bank under Overview > Money settings to see runway and how much is safe to pay out.')
  if (runway !== null && runway < 3) insights.push(`Runway is ${runway.toFixed(1)} months at the current burn. Keep at least three months of fixed costs in the bank.`)
  if (subs.length) { const top = [...subs].sort((a, b) => monthlyOf(b) - monthlyOf(a))[0]; insights.push(`Subscriptions cost ${fmtMoney(subs.reduce((s, f) => s + monthlyOf(f), 0))}/mo. The biggest is ${top.title} at ${fmtMoney(monthlyOf(top))}/mo; review anything we haven't used in 30 days.`) }
  insights.push(`Safe to pay out right now: ${fmtMoney(safe)} (cash minus bills due in 30 days, the tax reserve and a ${cfg.bufferMonths}-month buffer), split ${cfg.split.azaiah}/${cfg.split.tony}: Azaiah ${fmtMoney(safe * cfg.split.azaiah / 100)}, Tony ${fmtMoney(safe * cfg.split.tony / 100)}.`)

  const [fst, setFst] = useSaveState()
  const save = async (e) => {
    e.preventDefault(); if (fst === 'saving') return
    if (!form.title.trim() || !(Number(form.amount) > 0)) { setFst('empty'); return }
    setFst('saving')
    const doc = { ...form, title: form.title.trim(), amount: Number(form.amount), createdBy: me, createdAt: nowIso() }
    if (doc.kind === 'subscription') { doc.status = 'active'; doc.nextDue = form.due || form.date; doc.cadence = form.cadence === 'once' ? 'monthly' : form.cadence; doc.active = true }
    if (doc.kind === 'payout') doc.category = 'Owner draw'
    const ok = await write((db) => db.collection('finance').doc(uid('f')).set(doc))
    if (!ok) { setFst('error'); return }
    setForm({ ...form, title: '', party: '', amount: '' }); setFst('done')
    logAct(write, me, { type: 'money', label: `Added ${(FIN_KINDS.find((k) => k[0] === doc.kind)?.[1] || doc.kind).toLowerCase()}: ${doc.title} ${fmtMoney(doc.amount)}` })
  }
  const markPaid = (f) => write((db) => db.doc('finance/' + f.id).update({ status: 'paid', date: today, paidBy: me })).then(() => logAct(write, me, { type: 'money', label: `Marked paid: ${f.title} ${fmtMoney(f.amount)}` }))
  const paySub = async (f) => { await write((db) => db.collection('finance').doc(uid('f')).set({ kind: 'expense', title: f.title, party: f.party || '', category: f.category, amount: f.amount, status: 'paid', date: today, createdBy: me, createdAt: nowIso(), fromSub: f.id })); await write((db) => db.doc('finance/' + f.id).update({ nextDue: bump(f.nextDue, f.cadence) })); logAct(write, me, { type: 'money', label: `Recorded a ${f.title} charge ${fmtMoney(f.amount)}` }) }
  const del = (f) => write((db) => db.doc('finance/' + f.id).delete()).then(() => logAct(write, me, { type: 'money', label: `Deleted ${f.title} ${fmtMoney(f.amount)} from money` }))
  const [cst, setCst] = useSaveState()
  const saveCfg = async () => { setCst('saving'); const ok = await write((db) => db.doc('settings/finance').set({ ...cfg, updatedAt: nowIso(), updatedBy: me })); setCst(ok ? 'done' : 'error'); if (ok) logAct(write, me, { type: 'money', label: 'Updated money settings' }) }
  const exportCsv = async () => {
    const rows = [['kind', 'title', 'party', 'category', 'amount', 'status', 'date', 'due', 'cadence', 'created_by'], ...F.map((f) => [f.kind, f.title, f.party, f.category, f.amount, f.status, f.date, f.due || f.nextDue || '', f.cadence || '', f.createdBy])]
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = `statsweep-money-${today}.csv`; document.body.appendChild(a); a.click(); a.remove()
  }
  const list = tab === 'overview' ? [] : F.filter((f) => tab === 'pending' ? f.status === 'pending' : f.kind === tab).sort((a, b) => (b.date || b.nextDue || '').localeCompare(a.date || a.nextDue || ''))
  const setF = (k) => (e) => { const v = e.target.value; setForm((p) => ({ ...p, [k]: v, ...(k === 'kind' ? { category: FIN_CATS[v][0], cadence: v === 'subscription' ? 'monthly' : 'once', status: v === 'subscription' ? 'active' : 'paid' } : {}) })) }
  return (
    <div className="page">
      <header className="page-h"><div><p className="eyebrow">Money</p><h1>Income, bills, subscriptions and payouts</h1><p className="muted">Shared between both of you. It analyzes itself every time something changes.</p></div><button className="btn btn-ghost" onClick={exportCsv}>Export CSV</button></header>
      <section className="kpis" data-tour="finkpis">
        <div className="kpi kpi-hero"><p className="kpi-l">Safe to pay out now</p><p className="kpi-v">{fmtMoney(safe)}</p><p className="kpi-s">Azaiah {fmtMoney(safe * cfg.split.azaiah / 100)} · Tony {fmtMoney(safe * cfg.split.tony / 100)}</p></div>
        <div className="kpi"><p className="kpi-l">Income this month</p><p className="kpi-v">{fmtMoney(incomeM)}</p><p className="kpi-s">{fmtMoney(mrr)} recurring/mo</p></div>
        <div className="kpi"><p className="kpi-l">Spent this month</p><p className="kpi-v">{fmtMoney(spendM)}</p><p className="kpi-s">Net {fmtMoney(net)} · paid out {fmtMoney(payoutM)}</p></div>
        <div className="kpi"><p className="kpi-l">Owed to us</p><p className="kpi-v">{fmtMoney(sumBy(ar))}</p><p className={`kpi-s ${arOver.length ? 'hotc' : ''}`}>{arOver.length} overdue</p></div>
        <div className="kpi"><p className="kpi-l">Due in 30 days</p><p className="kpi-v">{fmtMoney(upcomingTotal)}</p><p className="kpi-s">{upcoming.length} bills and renewals</p></div>
        <div className="kpi"><p className="kpi-l">Need per month</p><p className="kpi-v">{fmtMoney(required)}</p><p className="kpi-s">Runway {runway === null ? '—' : runway.toFixed(1) + ' mo'}</p></div>
      </section>
      <section className="panel insights" data-tour="insights"><div className="panel-h"><h2>What the numbers say</h2></div><ul className="md-list">{insights.map((t, i) => <li key={i}>{t}</li>)}</ul></section>
      <form className="fin-add panel" onSubmit={save} data-tour="finadd">
        <select className="input" value={form.kind} onChange={setF('kind')} aria-label="Type">{FIN_KINDS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <input className="input" value={form.title} onChange={setF('title')} placeholder={form.kind === 'income' ? 'e.g. Elite Medical Transport setup fee' : form.kind === 'subscription' ? 'e.g. Netlify Pro' : form.kind === 'payout' ? 'Owner draw' : 'e.g. Business insurance'} aria-label="Title" />
        {form.kind === 'payout' ? <select className="input" value={form.who} onChange={setF('who')} aria-label="Paid to">{Object.values(TEAM).map((t) => <option key={t.key} value={t.key}>{t.name}</option>)}</select>
          : <input className="input" value={form.party} onChange={setF('party')} placeholder={form.kind === 'income' ? 'Client' : 'Vendor'} aria-label="Client or vendor" />}
        <select className="input" value={form.category} onChange={setF('category')} aria-label="Category">{FIN_CATS[form.kind].map((c) => <option key={c}>{c}</option>)}</select>
        <input className="input" type="number" min="0" step="0.01" value={form.amount} onChange={setF('amount')} placeholder="Amount" aria-label="Amount" />
        {form.kind !== 'subscription' && <select className="input" value={form.status} onChange={setF('status')} aria-label="Status"><option value="paid">Paid</option><option value="pending">Pending</option></select>}
        {(form.kind === 'subscription' || form.kind === 'bill') && <select className="input" value={form.cadence} onChange={setF('cadence')} aria-label="Repeats">{form.kind === 'bill' && <option value="once">One time</option>}<option value="monthly">Monthly</option><option value="yearly">Yearly</option></select>}
        <input className="input" type="date" value={form.status === 'pending' || form.kind === 'subscription' ? form.due : form.date} onChange={setF(form.status === 'pending' || form.kind === 'subscription' ? 'due' : 'date')} aria-label={form.status === 'pending' ? 'Due date' : form.kind === 'subscription' ? 'Next renewal' : 'Date'} />
        <button type="submit" className="btn btn-primary" disabled={!canWrite || fst === 'saving'}>{saveLabel(fst, 'Add')}</button>
        <div className="fin-msg"><FormMsg st={fst} empty="Add a title and an amount, then tap Add." /></div>
      </form>
      <div className="seg">{[['overview', 'Overview'], ['income', 'Income'], ['expense', 'Expenses'], ['bill', 'Bills'], ['pending', 'Pending'], ['subscription', 'Subscriptions'], ['payout', 'Payouts']].map(([k, v]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{v}</button>)}</div>
      {tab === 'overview' ? (
        <>
          <section className="grid-2-1">
            <div className="panel">
              <div className="panel-h"><h2>Last 6 months</h2><div className="legend"><span><i className="sw sw-a" /> Income</span><span><i className="sw sw-b" /> Spent</span></div></div>
              <div className="pairs" role="img" aria-label="Income and spending by month">{months6.map((x) => <div key={x.m} className="pair" title={`${x.m}: in ${fmtMoney(x.inc)}, out ${fmtMoney(x.out)}`}><div className="pair-bars"><span className="pb a" style={{ height: `${(x.inc / max6) * 100}%` }} /><span className="pb b" style={{ height: `${(x.out / max6) * 100}%` }} /></div><span className="tiny muted">{new Date(x.m + '-15').toLocaleDateString(undefined, { month: 'short' })}</span></div>)}</div>
            </div>
            <div className="panel">
              <div className="panel-h"><h2>Upcoming 30 days</h2></div>
              {upcoming.length === 0 ? <p className="muted">No bills or renewals due.</p> : <ul className="mini">{upcoming.map((f) => <li key={f.id + f.due} className="mini-row"><span className="ellip">{f.title}</span><span className={f.due < today ? 'hotc' : 'muted'}>{fmtMoney(f.amount)} · {fmtShortDate(f.due + 'T12:00')}</span></li>)}</ul>}
            </div>
          </section>
          <section className="grid-2">
            <div className="panel">
              <div className="panel-h"><h2>Where this month's income should go</h2><span className="tiny muted">Profit First split</span></div>
              <div className="alloc">{[['profit', 'Profit (save)'], ['owners', 'Owner pay'], ['tax', 'Taxes'], ['opex', 'Operating costs']].map(([k, v]) => <div key={k}><span className="tiny muted">{v} · {pf[k]}%</span><b>{fmtMoney(incomeM * pf[k] / pfTot)}</b></div>)}</div>
              <p className="tiny muted">Owner pay splits {cfg.split.azaiah}/{cfg.split.tony}: Azaiah {fmtMoney(incomeM * pf.owners / pfTot * cfg.split.azaiah / 100)}, Tony {fmtMoney(incomeM * pf.owners / pfTot * cfg.split.tony / 100)}.</p>
            </div>
            <div className="panel">
              <div className="panel-h"><h2>Money settings</h2></div>
              <div className="cfg">
                <label className="field"><span>Cash in the bank now</span><input className="input" type="number" value={cfg.cashOnHand} onChange={(e) => setCfg({ ...cfg, cashOnHand: Number(e.target.value) })} /></label>
                <label className="field"><span>Tax set-aside %</span><input className="input" type="number" value={cfg.taxRate} onChange={(e) => setCfg({ ...cfg, taxRate: Number(e.target.value) })} /></label>
                <label className="field"><span>Buffer (months of fixed costs)</span><input className="input" type="number" value={cfg.bufferMonths} onChange={(e) => setCfg({ ...cfg, bufferMonths: Number(e.target.value) })} /></label>
                <label className="field"><span>Azaiah's monthly target</span><input className="input" type="number" value={cfg.ownerTarget.azaiah} onChange={(e) => setCfg({ ...cfg, ownerTarget: { ...cfg.ownerTarget, azaiah: Number(e.target.value) } })} /></label>
                <label className="field"><span>Tony's monthly target</span><input className="input" type="number" value={cfg.ownerTarget.tony} onChange={(e) => setCfg({ ...cfg, ownerTarget: { ...cfg.ownerTarget, tony: Number(e.target.value) } })} /></label>
                <label className="field"><span>Split % to Azaiah (rest to Tony)</span><input className="input" type="number" min="0" max="100" value={cfg.split.azaiah} onChange={(e) => { const a = Number(e.target.value); setCfg({ ...cfg, split: { azaiah: a, tony: 100 - a } }) }} /></label>
              </div>
              <button className="btn btn-primary" disabled={!canWrite || cst === 'saving'} onClick={saveCfg}>{saveLabel(cst, 'Save money settings', 'Saved ✓')}</button><FormMsg st={cst} />
            </div>
          </section>
        </>
      ) : (
        <section className="panel">
          {list.length === 0 ? <p className="muted">Nothing here yet. Add the first entry above.</p> :
            <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Item</th><th>Type</th><th>Category</th><th>Amount</th><th>{tab === 'subscription' ? 'Renews' : 'Date / due'}</th><th>Status</th><th></th></tr></thead>
              <tbody>{list.map((f) => <tr key={f.id}>
                <td><b>{f.title}</b>{(f.party || f.who) && <span className="tiny muted"> · {f.kind === 'payout' ? TEAM[f.who]?.name : f.party}</span>}{TEAM[f.createdBy] && <span className="attrib-row"><Avatar who={f.createdBy} size={16} /> Added by {TEAM[f.createdBy].name}{f.paidBy && TEAM[f.paidBy] ? ` · paid by ${TEAM[f.paidBy].name}` : ''}</span>}</td>
                <td>{FIN_KINDS.find((k) => k[0] === f.kind)?.[1]}</td><td>{f.category}</td>
                <td className="mono">{fmtMoney(f.amount)}{f.cadence && f.cadence !== 'once' ? <span className="tiny muted">/{f.cadence === 'yearly' ? 'yr' : 'mo'}</span> : null}</td>
                <td>{fmtShortDate(((f.kind === 'subscription' ? f.nextDue : f.status === 'pending' ? f.due : f.date) || '') + 'T12:00') || '—'}</td>
                <td>{f.kind === 'subscription' ? <Chip tone="info">{f.active === false ? 'Canceled' : 'Active'}</Chip> : f.status === 'pending' ? <Chip tone={f.due && f.due < today ? 'hot' : 'warn'}>{f.due && f.due < today ? 'Overdue' : 'Pending'}</Chip> : <Chip tone="ok">Paid</Chip>}</td>
                <td className="row gap-s">
                  {f.status === 'pending' && <button className="btn btn-sm" disabled={!canWrite} onClick={() => markPaid(f)}>Mark paid</button>}
                  {f.kind === 'subscription' && f.active !== false && <><button className="btn btn-sm" disabled={!canWrite} onClick={() => paySub(f)}>Record charge</button><button className="btn btn-ghost btn-sm" disabled={!canWrite} onClick={() => write((db) => db.doc('finance/' + f.id).update({ active: false }))}>Cancel</button></>}
                  <button className="icon-btn sm" disabled={!canWrite} onClick={() => del(f)} aria-label="Delete"><Icon d={I.x} size={14} /></button>
                </td></tr>)}</tbody></table></div>}
        </section>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ shell */
const NAV = [
  ['home', 'Command center', I.home], ['leads', 'Leads', I.leads], ['dialer', 'Call block', I.bolt], ['pipeline', 'Pipeline', I.kanban], ['tasks', 'Tasks', I.check],
  ['advisor', 'Advisor', I.spark], ['finance', 'Money', I.money], ['board', 'Idea board', I.board], ['playbook', 'Playbook', I.book], ['research', 'Research', I.research], ['growth', 'Growth plan', I.growth], ['sweeps', 'Sweeps', I.radar], ['settings', 'Settings', I.gear],
]
function App() {
  const [me, setMe] = useState(() => { const v = ls.get(STORE_ME); return v === 'azaiah' || v === 'tony' ? v : null })
  const hashView = (location.hash || '').slice(1)
  const [view, setView] = useState(NAV.some((n) => n[0] === hashView) ? hashView : 'home')
  const [params, setParams] = useState({})
  const [lead, setLead] = useState(null)
  const [menu, setMenu] = useState(false)
  const { err, setErr, tasks, leads } = useData()
  const guideKey = 'statsweep-guide-' + me
  const [guideOn, setGuideOn] = useState(() => ls.get('statsweep-guide-' + (me || 'x')) !== 'off')
  useEffect(() => { if (me) setGuideOn(ls.get('statsweep-guide-' + me) !== 'off') }, [me])
  const setGuide = (v) => { ls.set(guideKey, v ? 'on' : 'off'); setGuideOn(v) }
  const go = (v, p = {}) => { setView(v); setParams(p); setMenu(false); window.scrollTo(0, 0); try { history.replaceState(null, '', v === 'home' ? location.pathname : '#' + v) } catch {} }
  useEffect(() => { const f = () => { const h = (location.hash || '').slice(1); if (NAV.some((n) => n[0] === h)) { setView(h); setParams({}) } }; window.addEventListener('hashchange', f); return () => window.removeEventListener('hashchange', f) }, [])
  useEffect(() => { document.body.classList.toggle('guide-on', !!guideOn) }, [guideOn])
  if (!me) return <Gate onPick={(k) => { ls.set(STORE_ME, k); setMe(k) }} />
  const openTasks = tasks.filter((t) => t.assignee === me && !t.done).length
  const due = (leads || []).filter((l) => l.owner === me && l.nextAt && new Date(l.nextAt) <= new Date() && !CLOSED.has(l.stage)).length
  const pages = {
    home: <Dashboard me={me} go={go} openLead={setLead} />, leads: <Leads key={JSON.stringify(params)} me={me} openLead={setLead} initial={params} />, dialer: <Dialer me={me} openLead={setLead} />,
    pipeline: <Pipeline me={me} openLead={setLead} />, tasks: <Tasks me={me} openLead={setLead} />, board: <Board me={me} />, advisor: <Advisor me={me} go={go} />, finance: <Finance me={me} />, playbook: <Playbook />, research: <Research />, growth: <Growth />, sweeps: <Sweeps />, settings: <Settings me={me} />,
  }
  return (
    <div className="app">
      <aside className={`side ${menu ? 'open' : ''}`}>
        <Logo />
        <nav className="nav">{NAV.map(([k, label, icon]) => (
          <button key={k} className={view === k ? 'on' : ''} onClick={() => go(k)}><Icon d={icon} /> <span>{label}</span>
            {k === 'tasks' && openTasks > 0 && <span className="badge">{openTasks}</span>}{k === 'home' && due > 0 && <span className="badge hot">{due}</span>}</button>))}</nav>
        <label className="guide-toggle"><input type="checkbox" checked={guideOn} onChange={(e) => setGuide(e.target.checked)} /> <span>Guide</span><span className="tiny muted">{guideOn ? 'on' : 'off'}</span></label>
        <div className="side-foot">
          <div className="me"><Avatar who={me} size={32} /><div><b>{TEAM[me].name}</b><button className="link tiny" onClick={() => { const n = OTHER[me]; ls.set(STORE_ME, n); setMe(n) }}>Switch to {TEAM[OTHER[me]].name}</button> <button className="link tiny muted" onClick={() => { auth.clear(); location.reload() }}>Sign out</button></div></div>
        </div>
      </aside>
      {menu && <div className="scrim" onClick={() => setMenu(false)} />}
      <main className="main">
        <div className="topbar"><button className="icon-btn" onClick={() => setMenu(true)} aria-label="Menu"><Icon d={I.menu} /></button><span className="brand-sm"><img src="/favicon.svg" alt="" width="30" height="30" /> Command Center</span><span className="row gap-s"><button className={`icon-btn ${guideOn ? 'on' : ''}`} onClick={() => setGuide(!guideOn)} aria-label={guideOn ? 'Turn guide off' : 'Turn guide on'}>?</button><Avatar who={me} size={28} /></span></div>
        <UpdateBanner />
        {err && <div className="banner" role="alert">{err} <button className="link" onClick={() => setErr('')}>Dismiss</button></div>}
        {pages[view]}
      </main>
      {lead && <LeadDrawer id={lead} me={me} onClose={() => setLead(null)} />}
      <Guide view={view} inLead={!!lead} on={guideOn} onOff={() => setGuide(false)} />
    </div>
  )
}

// Tells you when a newer version of the portal has been deployed, so nobody keeps working on old code.
function UpdateBanner() {
  const [stale, setStale] = useState(false)
  useEffect(() => {
    if (typeof __BUILD_ID__ === 'undefined') return
    const check = async () => { try { const r = await fetch('/version.json', { cache: 'no-store' }); const d = await r.json(); if (d.v && d.v !== __BUILD_ID__) setStale(true) } catch {} }
    const t = setInterval(check, 120000); const vis = () => document.visibilityState === 'visible' && check()
    document.addEventListener('visibilitychange', vis); check()
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', vis) }
  }, [])
  if (!stale) return null
  return <div className="banner update" role="status">A new version of the portal is ready. <button className="btn btn-primary btn-sm" onClick={() => location.reload()}>Reload now</button></div>
}
function SeedLoader() {
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState('')
  const run = async () => { setBusy(true); try { let off = 0, made = 0, r; do { r = await serverApi(`seed?offset=${off}&limit=150`, { method: 'POST' }); made += r.created; off = r.next; setMsg(`Loading… ${Math.min(off, r.total)} of ${r.total}`) } while (!r.done); setMsg(`Loaded ${made} new records.`); setTimeout(() => location.reload(), 900) } catch (e) { setMsg(e.message) } setBusy(false) }
  return <div className="empty"><p className="empty-t">The lead database is empty</p><p className="muted">Load the first sweep: 3,146 real medical courier, NEMT and non-emergency transport operators across 51 states and DC, each with custom scripts.</p><div><button className="btn btn-primary" disabled={busy} onClick={run}>{busy ? 'Loading…' : 'Load the first sweep'}</button></div>{msg && <p className="muted">{msg}</p>}</div>
}
function Login({ onDone }) {
  const [pw, setPw] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  const go = async (e) => { e.preventDefault(); setBusy(true); setErr(''); try { await login(pw); onDone() } catch (x) { setErr(x.message || 'Could not sign in.') } setBusy(false) }
  return (
    <div className="gate">
      <form className="gate-card" onSubmit={go}>
        <Logo big />
        <h1>Team sign-in</h1>
        <p className="muted">Enter the team password once on this device. After that, just pick your name.</p>
        <label className="field"><span>Team password</span><input className="input" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus /></label>
        {err && <p className="hotc" role="alert">{err}</p>}
        <button className="btn btn-primary" disabled={busy || !pw}>{busy ? 'Checking…' : 'Enter'}</button>
      </form>
    </div>
  )
}
function Root() {
  const [authed, setAuthed] = useState(() => !!auth.get())
  useEffect(() => { const f = () => setAuthed(false); window.addEventListener('statsweep-signed-out', f); return () => window.removeEventListener('statsweep-signed-out', f) }, [])
  if (!authed) return <Login onDone={() => setAuthed(true)} />
  return <DataProvider><App /></DataProvider>
}
createRoot(document.getElementById('root')).render(<Root />)
