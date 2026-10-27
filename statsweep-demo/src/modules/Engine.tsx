import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Radar, ExternalLink, Search, Check, X as XIcon, Printer, Send, FileText, Landmark, Plus, Phone, Mail } from 'lucide-react'
import { useStore, SWEEP_SOURCES } from '@/lib/store'
import { Page, Card, Badge, FitBadge, Btn, Drawer, Empty, Field, inputCls, Modal } from '@/components/ui'
import { money, shortDate, stamp, daysUntil, longDate, uid, time } from '@/lib/format'
import { serviceLabel, type Score } from '@/lib/scoring'
import { draftEmail, draftCall } from '@/lib/outreach'
import type { Brain as BrainT, Cert, Opportunity, OppStage, Service, SetAside } from '@/lib/types'

type S = Opportunity & { fit: Score }
const KIND_LABEL = { bid: 'Bid', lead: 'Lead', broker: 'Broker opening' } as const
export const STAGES: [OppStage, string][] = [['found', 'Found'], ['qualified', 'Qualified'], ['contacted', 'Contacted'], ['meeting', 'Meeting or pre-bid'], ['submitted', 'Submitted'], ['won', 'Won'], ['lost', 'Lost']]
const STAGE_LABEL = Object.fromEntries(STAGES) as Record<OppStage, string>

export function DueChip({ due }: { due?: string }) {
  if (!due) return <span className="text-sm text-steel">Relationship</span>
  const d = daysUntil(due)
  return <Badge tone={d < 0 ? 'muted' : d <= 3 ? 'hot' : d <= 10 ? 'warn' : 'info'}>{d < 0 ? 'Closed' : d === 0 ? 'Due today' : `Due in ${d} d`}</Badge>
}

/* ------------------------------------------------------------------ Company Brain */
const ALL_SERVICES: Service[] = ['specimens', 'pharmacy', 'supplies', 'records', 'nemt-ambulatory', 'nemt-wheelchair', 'nemt-stretcher']
const ALL_CERTS: Cert[] = ['HIPAA', 'OSHA BBP', 'DOT HazMat (UN3373)', 'IATA DGR', 'TSA PreCheck', 'CPR / First Aid', 'Wheelchair securement', 'Defensive driving', 'Chemo / hazardous drug handling']
const ALL_SETASIDES: SetAside[] = ['Small business', 'MBE / HUB', 'WOSB', 'SDVOSB', 'DBE', 'SWaM']

export function BrainPage() {
  const { s, dispatch, scored, toast } = useStore()
  const b = s.brain
  const set = (patch: Partial<BrainT>) => dispatch({ t: 'brain', brain: { ...b, ...patch } })
  const toggle = <T,>(arr: T[], v: T) => arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]
  const avg = Math.round(scored.filter((o) => !o.fit.disqualified).reduce((a, o) => a + o.fit.score, 0) / Math.max(1, scored.filter((o) => !o.fit.disqualified).length))
  const nogo = scored.filter((o) => o.fit.disqualified).length
  const Chip = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) => <button type="button" aria-pressed={on} onClick={onClick} className={`min-h-[40px] rounded-full border px-3.5 text-sm font-semibold ${on ? 'border-night bg-night text-white' : 'border-line bg-paper text-steel hover:border-night/40'}`}>{on && <Check size={14} className="-ml-0.5 mr-1 inline" />}{children}</button>
  return (
    <Page title="Company Brain" help="brain" sub="Everything the sweep knows about Bellwether. Change anything and every bid and lead re-scores on the spot.">
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Card><p className="text-sm text-steel">Average fit across open finds</p><p className="num font-display text-3xl font-extrabold wide">{avg}</p></Card>
        <Card><p className="text-sm text-steel">No-go right now</p><p className="num font-display text-3xl font-extrabold wide">{nogo}</p><p className="text-sm text-steel">Work you can't do yet, with the reason</p></Card>
        <Card><p className="text-sm text-steel">Try it</p><p className="text-[15px]">Turn on <b>Frozen</b> or add <b>abuse and molestation</b> coverage, then open Bids and leads.</p></Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-bold wide">What you move</h2>
          <div className="mt-3 flex flex-wrap gap-2">{ALL_SERVICES.map((v) => <Chip key={v} on={b.services.includes(v)} onClick={() => set({ services: toggle(b.services, v) })}>{serviceLabel(v)}</Chip>)}</div>
          <h3 className="mt-5 font-bold">Temperature control</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <Chip on={b.temps.refrigerated} onClick={() => set({ temps: { ...b.temps, refrigerated: !b.temps.refrigerated } })}>Refrigerated 2 to 8 &deg;C</Chip>
            <Chip on={b.temps.frozen} onClick={() => set({ temps: { ...b.temps, frozen: !b.temps.frozen } })}>Frozen, dry ice</Chip>
          </div>
          <h3 className="mt-5 font-bold">Service radius</h3>
          <div className="mt-2 flex items-center gap-3"><input type="range" min={15} max={150} step={5} value={b.radiusMi} onChange={(e) => set({ radiusMi: +e.target.value })} className="w-full accent-[#0B7C7E]" aria-label="Service radius in miles" /><span className="num w-20 text-right font-bold">{b.radiusMi} mi</span></div>
          <p className="mt-2 text-sm text-steel">{b.counties.join(', ')}</p>
        </Card>
        <Card>
          <h2 className="text-lg font-bold wide">Fleet</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {([['sedans', 'Sedans'], ['cargoVans', 'Cargo vans'], ['refrigeratedVans', 'Refrigerated'], ['wheelchairVans', 'Wheelchair vans'], ['stretcherVans', 'Stretcher vans']] as const).map(([k, l]) => (
              <Field key={k} label={l}><input type="number" min={0} className={inputCls} value={b.fleet[k]} onChange={(e) => set({ fleet: { ...b.fleet, [k]: Math.max(0, +e.target.value) } })} /></Field>
            ))}
            <Field label="Drivers"><input type="number" min={0} className={inputCls} value={b.drivers} onChange={(e) => set({ drivers: +e.target.value })} /></Field>
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-bold wide">Training and certifications</h2>
          <div className="mt-3 flex flex-wrap gap-2">{ALL_CERTS.map((v) => <Chip key={v} on={b.certs.includes(v)} onClick={() => set({ certs: toggle(b.certs, v) })}>{v}</Chip>)}</div>
          <h3 className="mt-5 font-bold">Set-aside eligibility</h3>
          <div className="mt-2 flex flex-wrap gap-2">{ALL_SETASIDES.map((v) => <Chip key={v} on={b.setAsides.includes(v)} onClick={() => set({ setAsides: toggle(b.setAsides, v) })}>{v}</Chip>)}</div>
        </Card>
        <Card>
          <h2 className="text-lg font-bold wide">Insurance</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Auto liability"><select className={inputCls} value={b.insurance.autoLiability} onChange={(e) => set({ insurance: { ...b.insurance, autoLiability: +e.target.value } })}>{[500000, 1000000, 1500000, 2000000, 5000000].map((v) => <option key={v} value={v}>{money(v)}</option>)}</select></Field>
            <Field label="Cargo"><select className={inputCls} value={b.insurance.cargo} onChange={(e) => set({ insurance: { ...b.insurance, cargo: +e.target.value } })}>{[25000, 50000, 100000, 250000].map((v) => <option key={v} value={v}>{money(v)}</option>)}</select></Field>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip on={b.insurance.workersComp} onClick={() => set({ insurance: { ...b.insurance, workersComp: !b.insurance.workersComp } })}>Workers' comp</Chip>
            <Chip on={b.insurance.abuseMolestation} onClick={() => set({ insurance: { ...b.insurance, abuseMolestation: !b.insurance.abuseMolestation } })}>Abuse and molestation</Chip>
          </div>
          <p className="mt-2 text-sm text-steel">General liability {money(b.insurance.generalPerOcc)} per occurrence, {money(b.insurance.generalAgg)} aggregate.</p>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-bold wide">Registrations</h2>
          <ul className="mt-3 divide-y divide-line">{b.registrations.map((r) => <li key={r.name} className="flex flex-wrap items-center justify-between gap-2 py-2.5"><span><span className="font-semibold">{r.name}</span>{r.id && <span className="ml-2 text-sm text-steel">{r.id}</span>}</span><Badge tone={r.status === 'Active' ? 'ok' : r.status === 'In progress' ? 'warn' : 'muted'}>{r.status}</Badge></li>)}</ul>
          <p className="mt-3 text-sm text-steel">NAICS: {b.naics.join(' / ')}</p>
          <Btn className="mt-3" size="sm" onClick={() => toast('Saved. Every score is already up to date.')}>Save Company Brain</Btn>
        </Card>
      </div>
    </Page>
  )
}

/* ------------------------------------------------------------------ Opportunities */
export function Opportunities() {
  const { scored } = useStore()
  const [kind, setKind] = useState<'all' | 'bid' | 'lead' | 'broker'>('all')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<'fit' | 'due' | 'value' | 'new'>('fit')
  const [showNogo, setShowNogo] = useState(false)
  const [open, setOpen] = useState<string | null>(null)
  const list = useMemo(() => scored.filter((o) => (kind === 'all' || o.kind === kind) && (showNogo || !o.fit.disqualified) && (!q || (o.title + o.org + o.city).toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => sort === 'fit' ? b.fit.score - a.fit.score : sort === 'value' ? b.value - a.value : sort === 'new' ? b.foundAt.localeCompare(a.foundAt) : daysUntil(a.due) - daysUntil(b.due)), [scored, kind, q, sort, showNogo])
  const counts = { all: scored.length, bid: scored.filter((o) => o.kind === 'bid').length, lead: scored.filter((o) => o.kind === 'lead').length, broker: scored.filter((o) => o.kind === 'broker').length }
  const cur = scored.find((o) => o.id === open)
  return (
    <Page title="Bids and leads" help="opps" sub="Public bids, broker openings and local businesses to call, scored against your Company Brain." actions={<Link to="/sweeps" className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-night px-4 font-semibold text-white"><Radar size={18} /> Run a sweep</Link>}>
      <div className="mb-4 flex flex-wrap gap-2" role="tablist">
        {(['all', 'bid', 'lead', 'broker'] as const).map((k) => <button key={k} role="tab" aria-selected={kind === k} onClick={() => setKind(k)} className={`min-h-[40px] rounded-full px-4 text-sm font-semibold ${kind === k ? 'bg-night text-white' : 'border border-line bg-paper text-steel'}`}>{k === 'all' ? 'Everything' : k === 'broker' ? 'Broker openings' : KIND_LABEL[k] + 's'} <span className="num opacity-70">{counts[k]}</span></button>)}
      </div>
      <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_180px_auto]">
        <label className="relative"><Search size={18} className="absolute left-3 top-3 text-steel" /><input className={inputCls + ' pl-10'} placeholder="Search title, organization or city" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" /></label>
        <select className={inputCls} value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort"><option value="fit">Best fit first</option><option value="due">Deadline first</option><option value="value">Highest value</option><option value="new">Newest first</option></select>
        <label className="flex min-h-[44px] items-center gap-2 text-sm"><input type="checkbox" checked={showNogo} onChange={(e) => setShowNogo(e.target.checked)} className="h-4 w-4 accent-[#0B7C7E]" /> Show no-go</label>
      </div>
      {list.length === 0 ? <Empty icon={<Landmark />} title="Nothing matches these filters. Clear the search or run a sweep." /> : (
        <Card pad={false}>
          <ul className="divide-y divide-line">
            {list.map((o) => (
              <li key={o.id}>
                <button onClick={() => setOpen(o.id)} className="grid w-full grid-cols-[auto_1fr] gap-3 p-4 text-left hover:bg-sterile sm:grid-cols-[auto_1fr_auto_auto] sm:items-center">
                  <FitBadge score={o.fit.score} disq={o.fit.disqualified} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5"><Badge tone={o.kind === 'bid' ? 'dark' : o.kind === 'broker' ? 'info' : 'muted'}>{KIND_LABEL[o.kind]}</Badge>{o.isNew && <Badge tone="new">New {shortDate(o.foundAt)}, {time(o.foundAt)}</Badge>}{o.stage !== 'found' && <Badge tone="ok">{STAGE_LABEL[o.stage]}</Badge>}</div>
                    <p className="mt-1 font-semibold leading-snug text-night">{o.title}</p>
                    <p className="text-sm text-steel">{o.org} &middot; {o.city}, {o.state} &middot; {o.distanceMi} mi &middot; {o.source}</p>
                  </div>
                  <div className="col-start-2 sm:col-start-auto sm:text-right"><p className="num font-semibold">{money(o.value)}<span className="text-sm font-normal text-steel">/yr est.</span></p></div>
                  <div className="col-start-2 sm:col-start-auto"><DueChip due={o.due} /></div>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
      <OppDrawer o={cur} onClose={() => setOpen(null)} />
    </Page>
  )
}

export function OppDrawer({ o, onClose }: { o?: S; onClose: () => void }) {
  const { s, dispatch, toast } = useStore()
  const [nobid, setNobid] = useState(false)
  const [reason, setReason] = useState('Outside our capacity right now')
  if (!o) return null
  const em = draftEmail(o, s.brain)
  const addOutreach = () => { dispatch({ t: 'outreach', o: { id: uid('X'), oppId: o.id, channel: 'email', subject: em.subject, body: em.body, status: 'draft', updatedAt: new Date().toISOString() } }); if (o.stage === 'found') dispatch({ t: 'stage', id: o.id, stage: 'qualified' }); toast('Draft added to Outreach. Nothing is sent until you approve it.') }
  return (
    <Drawer open onClose={onClose} wide title={<><span className="mb-1 flex flex-wrap gap-1.5"><Badge tone={o.kind === 'bid' ? 'dark' : 'info'}>{KIND_LABEL[o.kind]}</Badge><DueChip due={o.due} /></span>{o.title}</>}>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div>
          <p className="font-semibold">{o.org}</p>
          <p className="text-steel">{o.city}, {o.state}, {o.distanceMi} miles away</p>
          <p className="mt-3 leading-relaxed">{o.summary}</p>
        </div>
        <div className="sm:text-right"><p className="text-sm text-steel">Estimated value</p><p className="num font-display text-2xl font-extrabold wide">{money(o.value)}</p><p className="text-sm text-steel">per year</p></div>
      </div>
      <dl className="mt-4 grid gap-x-6 gap-y-2 rounded-xl bg-sterile p-4 text-sm sm:grid-cols-2">
        <div><dt className="text-steel">Found</dt><dd className="font-semibold">{stamp(o.foundAt)} by sweep {o.sweepId}</dd></div>
        <div><dt className="text-steel">Source</dt><dd><a href={o.sourceUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1 font-semibold text-cryo-dark underline">{o.source} <ExternalLink size={13} /></a></dd></div>
        {o.due && <div><dt className="text-steel">Response due</dt><dd className="font-semibold">{longDate(o.due)}</dd></div>}
        {o.preBid && <div><dt className="text-steel">Pre-bid meeting</dt><dd className="font-semibold">{longDate(o.preBid)}</dd></div>}
        <div><dt className="text-steel">Who to reach</dt><dd className="font-semibold">{o.contactRole}</dd></div>
        <div><dt className="text-steel">Needs</dt><dd className="font-semibold">{o.req.services.map(serviceLabel).join(', ')}{o.req.temp ? `, ${o.req.temp}` : ''}</dd></div>
      </dl>
      <h3 className="mt-6 text-lg font-bold wide">Go or no-go</h3>
      {o.fit.disqualified ? <p className="mt-2 rounded-xl bg-stat-wash p-3 font-semibold text-stat-dark">No-go: {o.fit.disqualified} Change the Company Brain if this has changed.</p> : (
        <div className="mt-2 space-y-2">
          <p className="text-sm text-steel">Fit score <b className="text-night">{o.fit.score} of 100</b></p>
          {o.fit.factors.map((f) => (
            <div key={f.name} className="grid grid-cols-[130px_1fr_48px] items-center gap-3 text-sm">
              <span className="font-semibold">{f.name}</span>
              <span><span className="block h-2.5 rounded-full bg-sterile"><span className={`block h-2.5 rounded-full ${f.points === f.max ? 'bg-cryo' : f.points === 0 ? 'bg-stat' : 'bg-[#E0A33A]'}`} style={{ width: `${(f.points / f.max) * 100}%` }} /></span><span className="mt-0.5 block text-xs text-steel">{f.note}</span></span>
              <span className="num text-right font-semibold">{f.points}/{f.max}</span>
            </div>
          ))}
        </div>
      )}
      <h3 className="mt-6 text-lg font-bold wide">Drafted outreach</h3>
      <div className="mt-2 rounded-xl border border-line p-3"><p className="text-sm font-semibold">Subject: {em.subject}</p><pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink">{em.body}</pre></div>
      <details className="mt-2 rounded-xl border border-line p-3"><summary className="cursor-pointer text-sm font-semibold">Call script</summary><pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed">{draftCall(o, s.brain)}</pre></details>
      <div className="sticky bottom-0 -mx-4 mt-6 flex flex-wrap gap-2 border-t border-line bg-paper p-4 sm:-mx-5 sm:px-5">
        <Btn tone="primary" onClick={() => { dispatch({ t: 'stage', id: o.id, stage: o.stage === 'found' ? 'qualified' : o.stage }); toast('On your pipeline'); }}><Plus size={16} /> Add to pipeline</Btn>
        <Btn onClick={addOutreach}><Send size={16} /> Send draft to Outreach</Btn>
        <Link to="/documents" className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-line px-4 font-semibold"><FileText size={16} /> Capability statement</Link>
        <Btn tone="danger" onClick={() => setNobid(true)}><XIcon size={16} /> No-bid</Btn>
      </div>
      <Modal open={nobid} onClose={() => setNobid(false)} title="Mark as no-bid">
        <p className="text-steel">The reason teaches the sweep what to skip next time.</p>
        <select className={inputCls + ' mt-3'} value={reason} onChange={(e) => setReason(e.target.value)}>{['Outside our capacity right now', 'Missing a required credential', 'Price too low to be worth it', 'Too far from our routes', 'Incumbent is locked in'].map((r) => <option key={r}>{r}</option>)}</select>
        <Btn tone="stat" className="mt-4 w-full" onClick={() => { dispatch({ t: 'stage', id: o.id, stage: 'lost', reason }); setNobid(false); onClose(); toast('Marked no-bid: ' + reason) }}>Mark no-bid</Btn>
      </Modal>
    </Drawer>
  )
}

/* ------------------------------------------------------------------ Sweeps */
export function Sweeps() {
  const { s, runSweep, toast } = useStore()
  const [running, setRunning] = useState(false)
  const [step, setStep] = useState(-1)
  const go = async () => { setRunning(true); const n = await runSweep(setStep); setRunning(false); setStep(-1); toast(n ? `Sweep finished: ${n} new finds, stamped ${time(new Date().toISOString())}` : 'Sweep finished: nothing new that fits') }
  return (
    <Page title="Sweeps" help="sweeps" sub="Every run, every source, with what it returned. Honest results include nothing new and pages that didn't load." actions={<Btn tone="stat" onClick={go} disabled={running}><Radar size={18} className={running ? 'animate-spin' : ''} /> {running ? 'Sweeping…' : 'Run sweep now'}</Btn>}>
      {running && (
        <Card className="mb-4">
          <p className="font-semibold">Sweep in progress</p>
          <ol className="mt-3 grid gap-1.5 sm:grid-cols-2">{SWEEP_SOURCES.map((src, i) => <li key={src} className="flex items-center gap-2 text-sm">{i < step ? <Check size={16} className="text-ok" /> : i === step ? <Radar size={16} className="animate-spin text-cryo" /> : <span className="h-4 w-4 rounded-full border border-line" />}<span className={i <= step ? 'text-night' : 'text-steel'}>{src}</span></li>)}</ol>
        </Card>
      )}
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Card><p className="text-sm text-steel">Your plan</p><p className="font-display text-xl font-bold wide">Route</p><p className="text-sm text-steel">Sweeps Monday, Wednesday and Friday at 6:00 am ET</p></Card>
        <Card><p className="text-sm text-steel">Last run</p><p className="font-display text-xl font-bold wide">{s.sweeps[0] ? stamp(s.sweeps[0].startedAt) : 'None yet'}</p><p className="text-sm text-steel">{s.sweeps[0]?.added ?? 0} new finds</p></Card>
        <Card><p className="text-sm text-steel">Sources on</p><p className="num font-display text-xl font-bold wide">{SWEEP_SOURCES.length}</p><p className="text-sm text-steel">Inside {s.brain.radiusMi} miles of {s.brain.city}</p></Card>
      </div>
      <div className="space-y-3">
        {s.sweeps.map((w) => (
          <Card key={w.id}>
            <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-display text-lg font-bold wide">Sweep {w.label}</p><Badge tone={w.added ? 'new' : 'muted'}>{w.added} new</Badge></div>
            <p className="text-sm text-steel">{longDate(w.startedAt)}, started {time(w.startedAt)}, finished {time(w.finishedAt)} ET</p>
            <ul className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">{w.results.map((r) => <li key={r.source} className="flex justify-between gap-3 border-b border-line/60 py-1.5"><span className="text-steel">{r.source}</span><span className={`text-right ${r.found ? 'font-semibold text-night' : r.result.includes('not load') ? 'text-warn' : 'text-steel'}`}>{r.result}</span></li>)}</ul>
          </Card>
        ))}
      </div>
    </Page>
  )
}

/* ------------------------------------------------------------------ Pipeline */
export function Pipeline() {
  const { scored, dispatch } = useStore()
  const [drag, setDrag] = useState<string | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  const cols = STAGES
  const items = scored.filter((o) => o.stage !== 'found' || o.fit.score >= 80)
  const won = scored.filter((o) => o.stage === 'won'), lost = scored.filter((o) => o.stage === 'lost')
  return (
    <Page title="Pipeline" help="pipeline" sub="Qualified finds plus anything scoring 80 or more, from first look to signed contract.">
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card><p className="text-sm text-steel">Open value</p><p className="num font-display text-2xl font-extrabold wide">{money(items.filter((o) => !['won', 'lost'].includes(o.stage)).reduce((a, o) => a + o.value, 0))}</p></Card>
        <Card><p className="text-sm text-steel">Won value</p><p className="num font-display text-2xl font-extrabold text-ok wide">{money(won.reduce((a, o) => a + o.value, 0))}</p></Card>
        <Card><p className="text-sm text-steel">Win rate</p><p className="num font-display text-2xl font-extrabold wide">{won.length + lost.length ? Math.round((won.length / (won.length + lost.length)) * 100) + '%' : '—'}</p></Card>
        <Card><p className="text-sm text-steel">Due in 7 days</p><p className="num font-display text-2xl font-extrabold text-stat wide">{items.filter((o) => daysUntil(o.due) >= 0 && daysUntil(o.due) <= 7).length}</p></Card>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-3">
        {cols.map(([k, label]) => {
          const list = items.filter((o) => o.stage === k)
          return (
            <section key={k} className={`w-[270px] shrink-0 rounded-2xl bg-paper/60 p-2 ring-1 ring-line ${drag ? 'ring-cryo' : ''}`} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (drag) dispatch({ t: 'stage', id: drag, stage: k }); setDrag(null) }} aria-label={label}>
              <header className="flex items-center justify-between px-2 py-1.5"><span className="font-semibold">{label}</span><span className="num text-sm text-steel">{list.length}</span></header>
              <div className="space-y-2">
                {list.length === 0 && <p className="px-2 py-4 text-center text-sm text-steel">Drop a card here</p>}
                {list.map((o) => (
                  <article key={o.id} draggable onDragStart={() => setDrag(o.id)} onDragEnd={() => setDrag(null)} className={`rounded-xl border bg-paper p-3 ${daysUntil(o.due) <= 3 && daysUntil(o.due) >= 0 ? 'border-stat' : 'border-line'}`}>
                    <button className="block w-full text-left" onClick={() => setOpen(o.id)}><p className="text-sm font-semibold leading-snug">{o.title}</p><p className="mt-1 text-xs text-steel">{o.org}</p></button>
                    <div className="mt-2 flex items-center justify-between gap-2"><span className="num text-sm font-semibold">{money(o.value)}</span><FitBadge score={o.fit.score} disq={o.fit.disqualified} /></div>
                    <select aria-label="Move to" className="mt-2 min-h-[36px] w-full rounded-lg border border-line bg-sterile px-2 text-sm" value={o.stage} onChange={(e) => dispatch({ t: 'stage', id: o.id, stage: e.target.value as OppStage })}>{STAGES.map(([v, l]) => <option key={v} value={v}>Move to: {l}</option>)}</select>
                  </article>
                ))}
              </div>
            </section>
          )
        })}
      </div>
      <OppDrawer o={scored.find((o) => o.id === open)} onClose={() => setOpen(null)} />
    </Page>
  )
}

/* ------------------------------------------------------------------ Outreach */
export function OutreachPage() {
  const { s, dispatch, scored, toast } = useStore()
  const [edit, setEdit] = useState<string | null>(null)
  const [text, setText] = useState('')
  const rows = s.outreach.map((x) => { const o = scored.find((y) => y.id === x.oppId)!; const d = o ? draftEmail(o, s.brain) : { subject: '', body: '' }; return { ...x, o, subject: x.subject || d.subject, body: x.body || (x.channel === 'call' && o ? draftCall(o, s.brain) : d.body) } }).filter((x) => x.o)
  const next = { draft: 'approved', approved: 'sent', sent: 'replied', replied: 'replied' } as const
  const label = { draft: 'Approve', approved: 'Mark sent (demo)', sent: 'Mark replied', replied: 'Replied' }
  return (
    <Page title="Outreach" help="outreach" sub="Every draft waits for your approval. Edit, approve, then send from your own email or phone.">
      {rows.length === 0 ? <Empty icon={<Send />} title="No drafts yet. Open a bid or lead and send its draft here." action={<Link className="font-semibold text-cryo-dark underline" to="/opportunities">Open bids and leads</Link>} /> : (
        <div className="grid gap-3 lg:grid-cols-2">
          {rows.map((x) => (
            <Card key={x.id}>
              <div className="flex flex-wrap items-center justify-between gap-2"><Badge tone={x.status === 'replied' ? 'ok' : x.status === 'sent' ? 'info' : x.status === 'approved' ? 'dark' : 'warn'}>{x.status.charAt(0).toUpperCase() + x.status.slice(1)}</Badge><span className="flex items-center gap-1 text-sm text-steel">{x.channel === 'call' ? <Phone size={14} /> : <Mail size={14} />}{x.channel === 'call' ? 'Call script' : 'Email'}</span></div>
              <p className="mt-2 font-semibold">{x.o.org}</p>
              <p className="text-sm text-steel">{x.o.title}</p>
              {x.channel === 'email' && <p className="mt-3 text-sm font-semibold">Subject: {x.subject}</p>}
              {edit === x.id ? <textarea className={inputCls + ' mt-2 h-56 py-2 text-sm'} value={text} onChange={(e) => setText(e.target.value)} aria-label="Edit draft" /> : <pre className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-xl bg-sterile p-3 font-sans text-sm leading-relaxed">{x.body}</pre>}
              <div className="mt-3 flex flex-wrap gap-2">
                {edit === x.id ? <Btn size="sm" tone="primary" onClick={() => { dispatch({ t: 'outreach', o: { ...x, body: text, updatedAt: new Date().toISOString() } }); setEdit(null); toast('Draft saved') }}>Save edit</Btn> : x.status === 'draft' && <Btn size="sm" onClick={() => { setEdit(x.id); setText(x.body) }}>Edit</Btn>}
                {x.status !== 'replied' && <Btn size="sm" tone={x.status === 'draft' ? 'stat' : 'default'} onClick={() => { dispatch({ t: 'outreach', o: { ...x, status: next[x.status], updatedAt: new Date().toISOString() } }); if (next[x.status] === 'sent' && x.o.stage === 'qualified') dispatch({ t: 'stage', id: x.o.id, stage: 'contacted' }); toast(next[x.status] === 'approved' ? 'Approved. Ready to send from your email.' : 'Updated') }}>{label[x.status]}</Btn>}
                <Btn size="sm" tone="ghost" onClick={() => { navigator.clipboard?.writeText((x.channel === 'email' ? 'Subject: ' + x.subject + '\n\n' : '') + x.body).then(() => toast('Copied')).catch(() => toast('Select the text and copy it')) }}>Copy</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Page>
  )
}

/* ------------------------------------------------------------------ Weekly briefing */
export function Briefing() {
  const { s, scored } = useStore()
  const live = scored.filter((o) => !o.fit.disqualified && o.stage !== 'lost')
  const week = live.filter((o) => Date.now() - new Date(o.foundAt).getTime() < 7 * 864e5).sort((a, b) => b.fit.score - a.fit.score)
  const urgent = live.filter((o) => daysUntil(o.due) >= 0 && daysUntil(o.due) <= 7).sort((a, b) => daysUntil(a.due) - daysUntil(b.due))
  const drafts = s.outreach.filter((x) => x.status === 'draft').length
  const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d.toISOString().slice(0, 10) })
  return (
    <Page title="Weekly briefing" help="briefing" sub={`Week of ${longDate(new Date().toISOString())}. Written for the owner, in plain English.`} actions={<Btn onClick={() => window.print()}><Printer size={16} /> Print or save PDF</Btn>}>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <h2 className="text-xl font-bold wide">The short version</h2>
          <p className="mt-3 leading-relaxed">The sweep found <b>{week.length} opportunities</b> you qualify for in the last 7 days, worth an estimated <b>{money(week.reduce((a, o) => a + o.value, 0))}</b> a year. <b>{urgent.length}</b> have a deadline inside a week. {drafts ? <><b>{drafts} outreach {drafts === 1 ? 'draft is' : 'drafts are'}</b> waiting for your approval.</> : 'No drafts are waiting on you.'}</p>
          <h3 className="mt-5 font-bold">Your next three moves</h3>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            {urgent[0] && <li>Decide on <b>{urgent[0].title}</b>. It is due {longDate(urgent[0].due)} and scores {urgent[0].fit.score}.</li>}
            {week[0] && <li>Call the {week[0].contactRole.toLowerCase()} at <b>{week[0].org}</b>. The call script is on the card.</li>}
            <li>{drafts ? `Approve the ${drafts} waiting ${drafts === 1 ? 'draft' : 'drafts'} in Outreach.` : 'Add abuse and molestation coverage: it unlocks the broker and paratransit work on the board.'}</li>
          </ol>
          <h3 className="mt-5 font-bold">New this week, best fit first</h3>
          <ul className="mt-2 divide-y divide-line">{week.slice(0, 8).map((o) => <li key={o.id} className="flex items-center justify-between gap-3 py-2"><span className="min-w-0"><span className="block font-semibold leading-snug">{o.title}</span><span className="text-sm text-steel">{o.org}, found {stamp(o.foundAt)}</span></span><FitBadge score={o.fit.score} /></li>)}</ul>
        </Card>
        <Card>
          <h2 className="text-xl font-bold wide">Next 14 days</h2>
          <ol className="mt-3 space-y-1">
            {days.map((d) => { const due = live.filter((o) => o.due === d || o.preBid === d); return (
              <li key={d} className={`flex gap-3 rounded-lg px-2 py-1.5 text-sm ${due.length ? 'bg-sterile' : ''}`}><span className="num w-24 shrink-0 font-semibold text-steel">{longDate(d)}</span><span className="min-w-0">{due.length ? due.map((o) => <span key={o.id} className="block"><b>{o.preBid === d ? 'Pre-bid' : 'Due'}:</b> {o.title.split(',')[0]}</span>) : <span className="text-steel">Clear</span>}</span></li>
            ) })}
          </ol>
        </Card>
      </div>
    </Page>
  )
}
