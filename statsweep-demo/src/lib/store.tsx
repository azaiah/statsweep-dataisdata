import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import type { State, Role, Opportunity, OppStage, Brain, Outreach, Stop, Trip, Quote, Invoice, PickupRequest, Rates, Driver } from './types'
import { seed, sweepPool, materialize } from './seed'
import { scoreOpportunity, type Score } from './scoring'

const KEY = 'statsweep-demo-v1'
const load = (): State => { try { const s = localStorage.getItem(KEY); if (s) { const p = JSON.parse(s); if (p.v === 1) return p } } catch { /* storage blocked: fall back to memory */ } return seed() }

type A =
  | { t: 'reset' }
  | { t: 'brain'; brain: Brain }
  | { t: 'stage'; id: string; stage: OppStage; reason?: string }
  | { t: 'addOpps'; opps: Opportunity[]; sweep: State['sweeps'][number] }
  | { t: 'outreach'; o: Outreach }
  | { t: 'stop'; runId: string; stop: Stop }
  | { t: 'trip'; trip: Trip }
  | { t: 'assign'; runId: string; driverId: string }
  | { t: 'quote'; q: Quote }
  | { t: 'rates'; rates: Rates }
  | { t: 'invoice'; inv: Invoice }
  | { t: 'request'; r: PickupRequest }
  | { t: 'driver'; d: Driver }
  | { t: 'tour'; done: boolean }

function reducer(s: State, a: A): State {
  switch (a.t) {
    case 'reset': return seed()
    case 'brain': return { ...s, brain: a.brain }
    case 'stage': return { ...s, opps: s.opps.map((o) => o.id === a.id ? { ...o, stage: a.stage, noBidReason: a.reason ?? o.noBidReason, isNew: false } : o) }
    case 'addOpps': return { ...s, opps: [...a.opps, ...s.opps], sweeps: [a.sweep, ...s.sweeps] }
    case 'outreach': return { ...s, outreach: s.outreach.some((x) => x.id === a.o.id) ? s.outreach.map((x) => x.id === a.o.id ? a.o : x) : [a.o, ...s.outreach] }
    case 'stop': return { ...s, runs: s.runs.map((r) => r.id !== a.runId ? r : { ...r, stops: r.stops.map((x) => x.id === a.stop.id ? a.stop : x) }) }
    case 'trip': return { ...s, trips: s.trips.map((t) => t.id === a.trip.id ? a.trip : t) }
    case 'assign': return { ...s, runs: s.runs.map((r) => r.id === a.runId ? { ...r, driverId: a.driverId } : r) }
    case 'quote': return { ...s, quotes: [a.q, ...s.quotes.filter((q) => q.id !== a.q.id)] }
    case 'rates': return { ...s, rates: a.rates }
    case 'invoice': return { ...s, invoices: s.invoices.some((i) => i.id === a.inv.id) ? s.invoices.map((i) => i.id === a.inv.id ? a.inv : i) : [a.inv, ...s.invoices] }
    case 'request': return { ...s, requests: s.requests.some((r) => r.id === a.r.id) ? s.requests.map((r) => r.id === a.r.id ? a.r : r) : [a.r, ...s.requests] }
    case 'driver': return { ...s, drivers: s.drivers.map((d) => d.id === a.d.id ? a.d : d) }
    case 'tour': return { ...s, tourDone: a.done }
  }
}

type Ctx = {
  s: State; dispatch: (a: A) => void
  role: Role; setRole: (r: Role) => void
  scored: (Opportunity & { fit: Score })[]
  runSweep: (onStep: (i: number) => void) => Promise<number>
  toast: (msg: string) => void; toastMsg: string
}
const C = createContext<Ctx | null>(null)
export const useStore = () => { const c = useContext(C); if (!c) throw new Error('no store'); return c }

export const SWEEP_SOURCES = ['SAM.gov', 'NC eVP', 'SC Business Opportunities', 'County procurement (8 counties)', 'City procurement', 'NC Medicaid and plan provider pages', 'NEMT broker provider pages', 'Hospital supplier portals', 'Lab, pharmacy and clinic websites']

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, dispatch] = useReducer(reducer, undefined, load)
  const [role, setRoleState] = useState<Role>(() => { try { return (sessionStorage.getItem('statsweep-role') as Role) || 'owner' } catch { return 'owner' } })
  const [toastMsg, setToast] = useState('')
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* ignore */ } }, [s])
  useEffect(() => { if (!toastMsg) return; const t = setTimeout(() => setToast(''), 2600); return () => clearTimeout(t) }, [toastMsg])
  const setRole = (r: Role) => { setRoleState(r); try { sessionStorage.setItem('statsweep-role', r) } catch { /* ignore */ } }
  const scored = useMemo(() => s.opps.map((o) => ({ ...o, fit: scoreOpportunity(o, s.brain) })), [s.opps, s.brain])
  const runSweep = async (onStep: (i: number) => void) => {
    const start = new Date()
    for (let i = 0; i < SWEEP_SOURCES.length; i++) { onStep(i); await new Promise((r) => setTimeout(r, 380 + Math.random() * 260)) }
    const have = new Set(s.opps.map((o) => o.id))
    const fresh = sweepPool.filter((o) => !have.has(o.id))
    const n = Math.min(fresh.length, 2 + Math.floor(Math.random() * 3))
    const pick = fresh.sort(() => Math.random() - 0.5).slice(0, n)
    const id = 'S-' + (12 + s.sweeps.length - 3)
    const now = new Date().toISOString()
    const opps = pick.map((o) => ({ ...materialize({ ...o, sweep: id }, now), isNew: true }))
    const results = SWEEP_SOURCES.map((src) => { const k = opps.filter((o) => sourceBucket(o.source) === src).length; return { source: src, found: k, result: k ? `${k} new` : 'Nothing new that fits' } })
    dispatch({ t: 'addOpps', opps, sweep: { id, label: id, startedAt: start.toISOString(), finishedAt: new Date().toISOString(), results, added: opps.length } })
    return opps.length
  }
  return <C.Provider value={{ s, dispatch, role, setRole, scored, runSweep, toast: setToast, toastMsg }}>{children}</C.Provider>
}

function sourceBucket(src: string) {
  if (src === 'SAM.gov') return 'SAM.gov'
  if (src.includes('eVP') || src === 'State procurement') return 'NC eVP'
  if (src.includes('County') || src.includes('District')) return 'County procurement (8 counties)'
  if (src.includes('City')) return 'City procurement'
  if (src.includes('Plan')) return 'NC Medicaid and plan provider pages'
  if (src.includes('Broker')) return 'NEMT broker provider pages'
  if (src.includes('Supplier')) return 'Hospital supplier portals'
  return 'Lab, pharmacy and clinic websites'
}

/** Compliance: what is expired or expiring for a driver. Expired items block dispatch. */
export function driverStatus(d: Driver) {
  const now = Date.now()
  const items = d.credentials.map((c) => ({ ...c, days: Math.ceil((new Date(c.expires + 'T23:59').getTime() - now) / 864e5) }))
  const expired = items.filter((c) => c.days < 0)
  const soon = items.filter((c) => c.days >= 0 && c.days <= 30)
  return { items, expired, soon, blocked: expired.length > 0 }
}
