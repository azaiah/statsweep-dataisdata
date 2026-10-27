import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Radar, Truck, Receipt, AlertTriangle, Landmark, Printer, Check, X, PenLine, Package, Send, ArrowRight } from 'lucide-react'
import { useStore, driverStatus } from '@/lib/store'
import { Page, Card, Badge, Btn, Stat, FitBadge, Modal, Field, inputCls } from '@/components/ui'
import { money, stamp, time, daysUntil, shortDate, uid, longDate } from '@/lib/format'
import { serviceLabel } from '@/lib/scoring'
import { DueChip } from './Engine'
import { Mark } from '@/components/Mark'

const TIPS = [
  'Log the sealed-bag number on every pickup. It is the fastest way to answer "where is my specimen?"',
  'Brokers score on-time pickup more than anything else. Leave 10 minutes of slack on dialysis runs.',
  'A capability statement is the first thing a procurement officer asks for. Keep yours current.',
  'Labs buy reliability. Your temperature log is a sales document. Send it monthly.',
  'Call lab managers between 10 and 11 am, after the morning rush and before the midday collection.',
  'Renew bloodborne-pathogen training a month early. An expired card can pause your driver in an audit.',
]

export function Dashboard() {
  const { s, scored, role } = useStore()
  const [tip, setTip] = useState(() => new Date().getDate() % TIPS.length)
  const newest = s.sweeps[0]
  const fresh = scored.filter((o) => o.sweepId === newest?.id && !o.fit.disqualified).sort((a, b) => b.fit.score - a.fit.score)
  const dueSoon = scored.filter((o) => daysUntil(o.due) >= 0 && daysUntil(o.due) <= 10 && !['lost', 'won'].includes(o.stage) && !o.fit.disqualified).sort((a, b) => daysUntil(a.due) - daysUntil(b.due))
  const blocked = s.drivers.filter((d) => driverStatus(d).blocked)
  const overdue = s.invoices.filter((i) => i.status === 'overdue')
  const stops = s.runs.flatMap((r) => r.stops)
  const pipe = scored.filter((o) => ['qualified', 'contacted', 'meeting', 'submitted'].includes(o.stage)).reduce((a, o) => a + o.value, 0)
  const alerts = [
    ...blocked.map((d) => ({ to: '/fleet', text: `${d.name} is blocked from dispatch: ${driverStatus(d).expired.map((c) => c.name).join(', ')} expired.` })),
    ...s.vehicles.filter((v) => daysUntil(v.inspection) < 0).map((v) => ({ to: '/fleet', text: `${v.unit} inspection expired ${shortDate(v.inspection)}.` })),
    ...overdue.map((i) => ({ to: '/invoices', text: `Invoice ${i.number} for ${money(i.amount)} is overdue.` })),
    ...dueSoon.filter((o) => daysUntil(o.due) <= 3).map((o) => ({ to: '/opportunities', text: `${o.title.split(',')[0]} is due ${longDate(o.due)}.` })),
  ]
  const hour = new Date().getHours()
  return (
    <Page title={`${hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'}, Denise`} help="dashboard" sub={longDate(new Date().toISOString())}>
      {alerts.length > 0 && (
        <Card className="mb-4 border-stat">
          <p className="flex items-center gap-2 font-bold text-stat-dark"><AlertTriangle size={18} /> Needs you today</p>
          <ul className="mt-2 space-y-1.5">{alerts.map((a) => <li key={a.text}><Link to={a.to} className="text-[15px] hover:underline">{a.text}</Link></li>)}</ul>
        </Card>
      )}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Link to="/opportunities"><Stat label="New finds, last sweep" value={fresh.length} sub={newest ? `Sweep ${newest.label}, ${stamp(newest.startedAt)}` : ''} /></Link>
        <Link to="/pipeline"><Stat label="Open pipeline" value={money(pipe)} sub="Estimated annual value" /></Link>
        <Link to="/dispatch"><Stat label="Stops done today" value={`${stops.filter((x) => x.status === 'done').length}/${stops.length}`} sub={`${s.runs.length} routes, ${s.trips.length} NEMT trips`} /></Link>
        <Link to="/invoices"><Stat label="Owed to you" value={money(s.invoices.filter((i) => i.status !== 'paid').reduce((a, i) => a + i.amount, 0))} sub={`${overdue.length} overdue`} tone={overdue.length ? 'hot' : undefined} /></Link>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        {role === 'owner' ? (
          <Card>
            <div className="flex items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-lg font-bold wide"><Radar size={18} className="text-cryo" /> Latest sweep</h2><Link to="/sweeps" className="text-sm font-semibold text-cryo-dark hover:underline">All sweeps</Link></div>
            <p className="text-sm text-steel">{newest ? `Started ${time(newest.startedAt)}, finished ${time(newest.finishedAt)}, ${newest.results.length} sources checked` : 'No sweeps yet'}</p>
            <ul className="mt-3 divide-y divide-line">{fresh.slice(0, 5).map((o) => <li key={o.id} className="flex items-center gap-3 py-2.5"><FitBadge score={o.fit.score} /><span className="min-w-0 flex-1"><span className="block text-[15px] font-semibold leading-snug">{o.title}</span><span className="text-sm text-steel">{o.org}</span></span><DueChip due={o.due} /></li>)}</ul>
            {fresh.length === 0 && <p className="py-3 text-steel">Nothing new fit on the last run. Run a sweep to check again.</p>}
          </Card>
        ) : (
          <Card><h2 className="text-lg font-bold wide">Today on the road</h2><ul className="mt-3 divide-y divide-line">{s.runs.map((r) => <li key={r.id} className="flex justify-between py-2.5"><span className="font-semibold">{r.name}</span><span className="text-sm text-steel">{r.stops.filter((x) => x.status === 'done').length}/{r.stops.length} stops</span></li>)}</ul></Card>
        )}
        <div className="min-w-0 space-y-4">
          <Card>
            <h2 className="text-lg font-bold wide">Due in the next 10 days</h2>
            {dueSoon.length === 0 ? <p className="mt-2 text-steel">No deadlines coming up.</p> : <ul className="mt-2 space-y-2">{dueSoon.slice(0, 5).map((o) => <li key={o.id} className="flex items-center justify-between gap-2 text-sm"><span className="min-w-0 flex-1 truncate">{o.title.split(',')[0]}</span><DueChip due={o.due} /></li>)}</ul>}
          </Card>
          <Card className="bg-carbon">
            <p className="text-sm font-bold">Tip of the day</p>
            <p className="mt-1 text-[15px] leading-relaxed">{TIPS[tip]}</p>
            <div className="mt-3 flex gap-2"><Btn size="sm" onClick={() => setTip((tip + TIPS.length - 1) % TIPS.length)}>Previous</Btn><Btn size="sm" onClick={() => setTip((tip + 1) % TIPS.length)}>Next tip</Btn></div>
          </Card>
        </div>
      </div>
    </Page>
  )
}

/* ------------------------------------------------------------------ Customer portal (lab view) */
export function ClientPortal() {
  const { s, dispatch, toast } = useStore()
  const me = s.customers[1]
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ from: 'Northside PSC Matthews', items: '', temp: 'refrigerated' as 'ambient' | 'refrigerated' | 'frozen', stat: false, when: '15:00' })
  const runs = s.runs.filter((r) => r.customerIds.includes(me.id))
  const mine = s.requests.filter((r) => r.customerId === me.id)
  return (
    <Page title="Customer portal" help="client" sub="What Northside Reference Lab sees on Bellwether's own domain.">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-night p-5 text-white">
        <div className="flex items-center gap-3"><Mark size={40} /><div><p className="font-display text-lg font-bold wide">Bellwether Medical</p><p className="text-sm text-white/70">Signed in as {me.contact}, {me.name.replace(' (sample)', '')}</p></div></div>
        <Btn tone="stat" onClick={() => setOpen(true)}><Package size={18} /> Request a pickup</Btn>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <h2 className="text-lg font-bold wide">Your pickups today</h2>
          <ul className="mt-3 divide-y divide-line">{runs.flatMap((r) => r.stops).map((x) => <li key={x.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5"><span><span className="num font-semibold">{time(x.time)}</span> {x.place}<span className="block text-sm text-steel">{x.items}</span></span>{x.pod ? <span className="text-right text-sm"><Badge tone="ok">{x.kind === 'pickup' ? 'Picked up' : 'Delivered'}</Badge><span className="mt-1 flex items-center gap-1 text-xs text-steel"><PenLine size={12} /> {x.pod.signedBy}, {time(x.pod.at)}</span></span> : <Badge>Scheduled</Badge>}</li>)}</ul>
          {mine.length > 0 && <><h3 className="mt-4 font-bold">Your requests</h3><ul className="mt-2 space-y-1 text-sm">{mine.map((r) => <li key={r.id} className="flex justify-between"><span>{r.from}, {time(r.at)}{r.stat ? ', STAT' : ''}</span><Badge tone={r.status === 'scheduled' ? 'ok' : 'warn'}>{r.status === 'scheduled' ? 'Scheduled' : 'Received'}</Badge></li>)}</ul></>}
        </Card>
        <div className="space-y-4">
          <Card><h2 className="text-lg font-bold wide">This month</h2><p className="mt-2 text-[15px]">Every refrigerated pickup stayed inside 2 to 8 &deg;C. Temperature report and delivery proofs are ready to download.</p><Btn className="mt-3" size="sm" onClick={() => toast('Report downloaded (demo)')}>Download temperature report</Btn></Card>
          <Card><h2 className="text-lg font-bold wide">Invoices</h2><ul className="mt-2 divide-y divide-line text-sm">{s.invoices.filter((i) => i.customerId === me.id).map((i) => <li key={i.id} className="flex justify-between py-2"><span>{i.number}</span><span className="flex gap-2"><span className="num">{money(i.amount)}</span><Badge tone={i.status === 'paid' ? 'ok' : 'warn'}>{i.status}</Badge></span></li>)}</ul></Card>
        </div>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Request a pickup">
        <div className="grid gap-3">
          <Field label="Pickup location"><input className={inputCls} value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} /></Field>
          <Field label="What's going"><input className={inputCls} value={f.items} onChange={(e) => setF({ ...f, items: e.target.value })} placeholder="e.g. 8 specimens, one sealed bag" /></Field>
          <div className="grid grid-cols-2 gap-3"><Field label="Temperature"><select className={inputCls} value={f.temp} onChange={(e) => setF({ ...f, temp: e.target.value as typeof f.temp })}><option value="ambient">Ambient</option><option value="refrigerated">Refrigerated</option><option value="frozen">Frozen</option></select></Field><Field label="Ready at"><input type="time" className={inputCls} value={f.when} onChange={(e) => setF({ ...f, when: e.target.value })} /></Field></div>
          <label className="flex min-h-[44px] items-center gap-2 font-semibold"><input type="checkbox" checked={f.stat} onChange={(e) => setF({ ...f, stat: e.target.checked })} className="h-5 w-5 accent-[#D42A36]" /> STAT, pick up within 60 minutes</label>
          <p className="text-xs text-steel">Don't include patient names. Use your order or bag number.</p>
          <Btn tone="stat" onClick={() => { const [h, m] = f.when.split(':').map(Number); const d = new Date(); d.setHours(h, m, 0, 0); dispatch({ t: 'request', r: { id: uid('P'), customerId: me.id, at: d.toISOString(), from: f.from, items: f.items || 'Specimens', temp: f.temp, stat: f.stat, status: 'requested' } }); setOpen(false); toast('Pickup requested. It is now on the dispatch board.') }}>Send request</Btn>
        </div>
      </Modal>
    </Page>
  )
}

/* ------------------------------------------------------------------ Documents */
export function Documents() {
  const { s } = useStore()
  const b = s.brain
  const [doc, setDoc] = useState<'cap' | 'broker'>('cap')
  const packet: [string, boolean][] = [
    ['National Provider Identifier (NPI) for transportation', true], ['State Medicaid transportation provider enrollment', b.registrations.some((r) => r.name.includes('Medicaid') && r.status === 'Active')], ['SAM.gov registration with UEI', b.registrations.some((r) => r.name === 'SAM.gov' && r.status === 'Active')],
    [`Auto liability at least $1M (you carry ${money(b.insurance.autoLiability)})`, b.insurance.autoLiability >= 1000000], [`General liability $1M / $2M`, b.insurance.generalPerOcc >= 1000000 && b.insurance.generalAgg >= 2000000], ['Abuse and molestation coverage', b.insurance.abuseMolestation], ["Workers' compensation", b.insurance.workersComp],
    ['Driver background, sex-offender registry and MVR checks', true], ['Drug screening for every driver', true], ['CPR and first aid for every NEMT driver', b.certs.includes('CPR / First Aid')], ['Wheelchair securement training', b.certs.includes('Wheelchair securement')], ['Defensive driving', b.certs.includes('Defensive driving')],
    ['Vehicle inspections current, ADA lifts or ramps', s.vehicles.every((v) => daysUntil(v.inspection) >= 0)], ['Digital dispatch with GPS, timestamps and signatures', true],
  ]
  const missing = packet.filter((p) => !p[1]).length
  return (
    <Page title="Documents" help="docs" sub="Built from your Company Brain, so they're never out of date." actions={<Btn onClick={() => window.print()}><Printer size={16} /> Print or save PDF</Btn>}>
      <div className="mb-4 flex gap-2" role="tablist">
        <button role="tab" aria-selected={doc === 'cap'} onClick={() => setDoc('cap')} className={`min-h-[42px] rounded-full px-4 font-semibold ${doc === 'cap' ? 'bg-night text-white' : 'border border-line bg-paper'}`}>Capability statement</button>
        <button role="tab" aria-selected={doc === 'broker'} onClick={() => setDoc('broker')} className={`min-h-[42px] rounded-full px-4 font-semibold ${doc === 'broker' ? 'bg-night text-white' : 'border border-line bg-paper'}`}>Broker-Ready Packet {missing > 0 && <span className="ml-1 rounded-full bg-stat px-1.5 text-xs text-white">{missing}</span>}</button>
      </div>
      {doc === 'cap' ? (
        <article className="printable mx-auto max-w-3xl rounded-2xl border border-line bg-paper p-6 sm:p-10">
          <header className="flex flex-wrap items-start justify-between gap-4 border-b-4 border-night pb-4">
            <div><p className="font-display text-3xl font-extrabold wide">{b.dba}</p><p className="text-steel">{b.company}</p></div>
            <div className="text-right text-sm"><p>{b.city}, {b.state}</p><p>{b.phone}</p><p>{b.email}</p></div>
          </header>
          <div className="mt-5 grid gap-6 sm:grid-cols-[1.3fr_1fr]">
            <div>
              <h2 className="font-display text-lg font-bold wide">Core capabilities</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">{b.services.map((x) => <li key={x}>{serviceLabel(x)} transport{x === 'specimens' && b.temps.refrigerated ? ', ambient and refrigerated 2 to 8 °C' : ''}</li>)}</ul>
              <h2 className="mt-5 font-display text-lg font-bold wide">What sets us apart</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">{b.differentiators.map((x) => <li key={x}>{x}</li>)}</ul>
              <h2 className="mt-5 font-display text-lg font-bold wide">Past performance</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">{s.customers.slice(0, 4).map((c) => <li key={c.id}>{c.name.replace(' (sample)', '')}: {c.sla}</li>)}</ul>
            </div>
            <div className="space-y-4 rounded-xl bg-sterile p-4 text-sm">
              <div><p className="font-bold">NAICS</p>{b.naics.map((n) => <p key={n}>{n}</p>)}</div>
              <div><p className="font-bold">Certifications</p><p>{b.setAsides.join(', ')}</p></div>
              <div><p className="font-bold">Training</p><p>{b.certs.join(', ')}</p></div>
              <div><p className="font-bold">Registrations</p>{b.registrations.filter((r) => r.status === 'Active').map((r) => <p key={r.name}>{r.name}{r.id ? `: ${r.id}` : ''}</p>)}</div>
              <div><p className="font-bold">Insurance</p><p>Auto {money(b.insurance.autoLiability)}, general {money(b.insurance.generalPerOcc)}/{money(b.insurance.generalAgg)}, cargo {money(b.insurance.cargo)}</p></div>
              <div><p className="font-bold">Coverage</p><p>{b.radiusMi}-mile radius: {b.counties.join(', ')}</p></div>
              <div><p className="font-bold">Fleet</p><p>{b.fleet.refrigeratedVans} refrigerated, {b.fleet.cargoVans} cargo, {b.fleet.sedans} sedans, {b.fleet.wheelchairVans} wheelchair</p></div>
            </div>
          </div>
        </article>
      ) : (
        <Card className="mx-auto max-w-3xl">
          <h2 className="text-xl font-bold wide">Broker-Ready Packet</h2>
          <p className="mt-1 text-steel">What NEMT brokers and Medicaid plans typically ask for at credentialing. {missing ? `${missing} items still missing.` : 'You have everything on the list.'}</p>
          <ul className="mt-4 divide-y divide-line">{packet.map(([t, ok]) => <li key={t} className="flex items-center gap-3 py-2.5">{ok ? <Check className="shrink-0 text-ok" /> : <X className="shrink-0 text-stat" />}<span className={ok ? '' : 'font-semibold'}>{t}</span></li>)}</ul>
          <p className="mt-4 text-sm text-steel">Requirements vary by broker and state. In the live portal this list is built for the brokers that cover your counties.</p>
        </Card>
      )}
    </Page>
  )
}

export function SettingsPage() {
  const { dispatch, toast } = useStore()
  const [confirm, setConfirm] = useState(false)
  return (
    <Page title="Settings" help="settings" sub="Demo controls. In the live portal this is where seats, notifications and sweep sources live.">
      <div className="grid gap-4 md:grid-cols-2">
        <Card><h2 className="font-bold">Reset the demo</h2><p className="mt-1 text-steel">Puts every screen back to the original sample data.</p><Btn className="mt-3" tone="danger" onClick={() => setConfirm(true)}>Reset demo</Btn></Card>
        <Card><h2 className="font-bold">Replay the tour</h2><p className="mt-1 text-steel">The four-step walkthrough you saw on the way in.</p><Btn className="mt-3" onClick={() => { dispatch({ t: 'tour', done: false }); toast('Tour will start now') }}>Replay tour</Btn></Card>
        <Card><h2 className="font-bold">Seats and roles</h2><p className="mt-1 text-steel">Owner, dispatcher, driver, billing and customer seats each see only what they need. Switch seats from the top bar.</p></Card>
        <Card><h2 className="font-bold">Want this for your company?</h2><p className="mt-1 text-steel">We build it around your routes, drivers and customers in 21 days.</p><a href="https://statsweep.com/#book" className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-stat px-4 font-semibold text-white">Book a 15-minute call <ArrowRight size={16} /></a></Card>
      </div>
      <Modal open={confirm} onClose={() => setConfirm(false)} title="Reset the demo?"><p className="text-steel">Everything you changed goes back to the sample data.</p><Btn tone="stat" className="mt-4 w-full" onClick={() => { dispatch({ t: 'reset' }); setConfirm(false); toast('Demo reset') }}>Reset demo</Btn></Modal>
    </Page>
  )
}

const TOUR = [
  { icon: Landmark, title: 'It finds the work', text: 'Bids, broker openings and local labs and pharmacies, scored against what you can actually do.' },
  { icon: Send, title: 'It writes the pitch', text: 'Every find comes with an email and a call script. Nothing goes out until you approve it.' },
  { icon: Truck, title: 'It runs the routes', text: 'Dispatch, chain of custody, temperature logs, proof of delivery and NEMT trips in one place.' },
  { icon: Receipt, title: 'It gets you paid', text: 'Quotes from your rate card, invoices, aging, and a portal your customers log into.' },
]
export function Tour() {
  const { s, dispatch } = useStore()
  const [i, setI] = useState(0)
  if (s.tourDone) return null
  const t = TOUR[i]
  return (
    <Modal open onClose={() => dispatch({ t: 'tour', done: true })} title={`${i + 1} of ${TOUR.length}`}>
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-night text-cryo-bright"><t.icon size={26} /></span>
      <p className="mt-4 font-display text-2xl font-extrabold wide">{t.title}</p>
      <p className="mt-2 text-[16px] leading-relaxed text-steel">{t.text}</p>
      <div className="mt-6 flex justify-between gap-2"><Btn onClick={() => dispatch({ t: 'tour', done: true })}>Skip tour</Btn><Btn tone="primary" onClick={() => i < TOUR.length - 1 ? setI(i + 1) : dispatch({ t: 'tour', done: true })}>{i < TOUR.length - 1 ? 'Next' : 'Start exploring'}</Btn></div>
    </Modal>
  )
}
