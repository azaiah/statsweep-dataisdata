import { useState } from 'react'
import { Truck, Thermometer, PenLine, Camera, MapPin, Check, AlertTriangle, ShieldCheck, Accessibility, Clock, Navigation } from 'lucide-react'
import { useStore, driverStatus } from '@/lib/store'
import { Page, Card, Badge, Btn, Drawer, SignaturePad, Stat, Modal, inputCls } from '@/components/ui'
import { time, shortDate, money, longDate } from '@/lib/format'
import type { Run, Stop, Trip } from '@/lib/types'

const stopTone = (s: Stop['status']) => s === 'done' ? 'ok' : s === 'arrived' ? 'info' : 'muted'
const stopLabel = (s: Stop['status'], kind: Stop['kind']) => s === 'done' ? (kind === 'pickup' ? 'Picked up' : 'Delivered') : s === 'arrived' ? 'Arrived' : 'Scheduled'

function TempChart({ log }: { log: number[] }) {
  const W = 300, H = 110, lo = 0, hi = 10
  const y = (v: number) => H - 14 - ((v - lo) / (hi - lo)) * (H - 28)
  const pts = log.map((v, i) => `${(i / Math.max(1, log.length - 1)) * W},${y(v)}`).join(' ')
  const out = log.some((v) => v < 2 || v > 8)
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Cooler temperature from ${Math.min(...log)} to ${Math.max(...log)} degrees Celsius; the safe range is 2 to 8`}>
        <rect x="0" y={y(8)} width={W} height={y(2) - y(8)} fill="#39D5CF" opacity=".14" />
        <line x1="0" x2={W} y1={y(8)} y2={y(8)} stroke="#0B7C7E" strokeDasharray="4 4" strokeWidth="1" />
        <line x1="0" x2={W} y1={y(2)} y2={y(2)} stroke="#0B7C7E" strokeDasharray="4 4" strokeWidth="1" />
        <text x="4" y={y(8) - 4} fontSize="10" fill="#5A6B7B">8 &deg;C</text><text x="4" y={y(2) + 12} fontSize="10" fill="#5A6B7B">2 &deg;C</text>
        <polyline points={pts} fill="none" stroke="#0B1F33" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
      <figcaption className={`text-sm ${out ? 'font-semibold text-stat' : 'text-steel'}`}>{out ? 'Excursion recorded: outside 2 to 8 °C' : `In range the whole run. Low ${Math.min(...log)} °C, high ${Math.max(...log)} °C, readings every 2 minutes.`}</figcaption>
    </figure>
  )
}

export function Dispatch() {
  const { s, dispatch, toast } = useStore()
  const [open, setOpen] = useState<string | null>(null)
  const [assign, setAssign] = useState<Run | null>(null)
  const run = s.runs.find((r) => r.id === open)
  const stops = s.runs.flatMap((r) => r.stops)
  const done = stops.filter((x) => x.status === 'done').length
  const blockedDrivers = s.drivers.filter((d) => driverStatus(d).blocked)
  const pending = s.requests.filter((r) => r.status === 'requested')
  return (
    <Page title="Dispatch" help="dispatch" sub={`${longDate(new Date().toISOString())}. Every route on the road, every stop, live.`}>
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Routes today" value={s.runs.length} sub={`${s.runs.filter((r) => r.stat).length} STAT`} />
        <Stat label="Stops completed" value={`${done}/${stops.length}`} sub="With signature, photo and GPS" />
        <Stat label="Pickup requests" value={pending.length} sub="From the customer portal" tone={pending.length ? 'hot' : undefined} />
        <Stat label="Drivers blocked" value={blockedDrivers.length} sub={blockedDrivers.map((d) => d.name.split(' ')[0]).join(', ') || 'Everyone is clear'} tone={blockedDrivers.length ? 'hot' : 'ok'} />
      </div>
      {pending.map((p) => (
        <div key={p.id} className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-stat bg-paper p-4">
          <div><p className="font-semibold">New pickup request from {s.customers.find((c) => c.id === p.customerId)?.name}</p><p className="text-sm text-steel">{p.from}, {p.items}, {p.temp}{p.stat ? ', STAT' : ''}, requested for {time(p.at)}</p></div>
          <Btn tone="stat" onClick={() => { dispatch({ t: 'request', r: { ...p, status: 'scheduled' } }); toast('Added to Route 1 and the driver was notified (demo)') }}>Add to Route 1</Btn>
        </div>
      ))}
      <div className="grid gap-3 lg:grid-cols-2">
        {s.runs.map((r) => {
          const d = s.drivers.find((x) => x.id === r.driverId)!; const v = s.vehicles.find((x) => x.id === r.vehicleId)!
          const next = r.stops.find((x) => x.status !== 'done')
          return (
            <Card key={r.id} className={r.stat ? 'border-stat' : ''}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div><p className="font-display text-lg font-bold wide">{r.name}</p><p className="text-sm text-steel">{d.name} in {v.unit} ({v.type})</p></div>
                <div className="flex gap-1.5">{r.stat && <Badge tone="hot">STAT</Badge>}{r.tempLog && <Badge tone="info"><Thermometer size={12} /> 2 to 8 &deg;C</Badge>}</div>
              </div>
              <ol className="mt-3 space-y-1.5">{r.stops.map((x) => <li key={x.id} className="flex items-center gap-3 text-sm"><span className="num w-[72px] shrink-0 whitespace-nowrap text-steel">{time(x.time)}</span><span className="min-w-0 flex-1 truncate">{x.kind === 'pickup' ? 'Pick up' : 'Deliver'}: {x.place}</span><Badge tone={stopTone(x.status)}>{stopLabel(x.status, x.kind)}</Badge></li>)}</ol>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                <p className="text-sm text-steel">{next ? `Next: ${next.place} at ${time(next.time)}` : 'Route complete'}</p>
                <div className="flex gap-2"><Btn size="sm" onClick={() => setAssign(r)}>Reassign</Btn><Btn size="sm" tone="primary" onClick={() => setOpen(r.id)}>Open route</Btn></div>
              </div>
            </Card>
          )
        })}
      </div>
      {run && (
        <Drawer open onClose={() => setOpen(null)} title={run.name} wide>
          <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
            <div>
              <h3 className="font-bold">Chain of custody</h3>
              <ol className="mt-2 space-y-3 border-l-2 border-cryo pl-4">
                {run.stops.map((x) => (
                  <li key={x.id} className="relative">
                    <span className={`absolute -left-[23px] top-1 h-3.5 w-3.5 rounded-full border-2 border-paper ${x.status === 'done' ? 'bg-cryo' : 'bg-line'}`} />
                    <p className="text-sm font-semibold">{time(x.time)} {x.kind === 'pickup' ? 'Picked up at' : 'Delivered to'} {x.place}</p>
                    <p className="text-sm text-steel">{x.address}. {x.items}</p>
                    {x.pod && <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-steel"><span className="inline-flex items-center gap-1"><PenLine size={12} /> {x.pod.signedBy} at {time(x.pod.at)}</span><span className="inline-flex items-center gap-1"><Camera size={12} /> Photo</span><span className="inline-flex items-center gap-1"><MapPin size={12} /> GPS matched</span></p>}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              {run.tempLog ? <><h3 className="flex items-center gap-2 font-bold"><Thermometer size={18} /> Cooler log</h3><div className="mt-2 rounded-xl bg-sterile p-3"><TempChart log={run.tempLog} /></div></> : <p className="rounded-xl bg-sterile p-3 text-sm text-steel">Ambient route. No temperature log required.</p>}
              <p className="mt-3 text-sm text-steel">The delivery record keeps a sealed-bag or order number, never a patient name.</p>
            </div>
          </div>
        </Drawer>
      )}
      <Modal open={!!assign} onClose={() => setAssign(null)} title={assign ? `Reassign ${assign.name}` : ''}>
        <p className="text-sm text-steel">Drivers with an expired credential can't take a route until it's renewed.</p>
        <ul className="mt-3 space-y-2">
          {s.drivers.filter((d) => !d.nemt).map((d) => { const st = driverStatus(d); return (
            <li key={d.id}>
              <button disabled={st.blocked} onClick={() => { if (assign) { dispatch({ t: 'assign', runId: assign.id, driverId: d.id }); toast(`${assign.name} assigned to ${d.name}`); setAssign(null) } }} className={`flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl border px-3 text-left ${st.blocked ? 'cursor-not-allowed border-stat/40 bg-stat-wash' : 'border-line hover:bg-sterile'}`}>
                <span><span className="font-semibold">{d.name}</span>{st.blocked && <span className="block text-sm text-stat-dark">Blocked: {st.expired.map((c) => c.name).join(', ')} expired {shortDate(st.expired[0].expires)}</span>}</span>
                {st.blocked ? <AlertTriangle size={18} className="text-stat" /> : assign?.driverId === d.id ? <Badge tone="info">Current</Badge> : <Check size={18} className="text-ok" />}
              </button>
            </li>
          ) })}
        </ul>
      </Modal>
    </Page>
  )
}

/* ------------------------------------------------------------------ Driver app (phone view) */
export function DriverApp() {
  const { s, dispatch, toast } = useStore()
  const run = s.runs[0]
  const [sig, setSig] = useState<Stop | null>(null)
  const [name, setName] = useState('')
  const [geo, setGeo] = useState<'idle' | 'ok' | 'denied'>('idle')
  const askGeo = () => { if (!navigator.geolocation) { setGeo('denied'); return } navigator.geolocation.getCurrentPosition(() => setGeo('ok'), () => setGeo('denied'), { timeout: 6000 }) }
  return (
    <Page title="Driver app" help="driver" sub="What Marcus sees on his phone. Try finishing the midday pickup.">
      <div className="mx-auto max-w-[420px] rounded-[36px] border-[10px] border-night bg-sterile p-3 shadow-2xl">
        <div className="rounded-2xl bg-night p-4 text-white">
          <p className="text-sm text-white/60">Good morning, Marcus</p>
          <p className="font-display text-xl font-bold wide">{run.name}</p>
          <p className="mt-1 text-sm text-white/70">{run.stops.filter((x) => x.status === 'done').length} of {run.stops.length} stops done. Cooler 4.4 &deg;C.</p>
          <button onClick={askGeo} className="mt-3 inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-white/10 px-3 text-sm"><Navigation size={15} />{geo === 'ok' ? 'Location shared' : geo === 'denied' ? 'Location not shared' : 'Share location for GPS proof'}</button>
        </div>
        <ol className="mt-3 space-y-2">
          {run.stops.map((x) => (
            <li key={x.id} className={`rounded-2xl bg-paper p-4 ${x.status === 'done' ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between gap-2"><span className="num font-semibold">{time(x.time)}</span><Badge tone={stopTone(x.status)}>{stopLabel(x.status, x.kind)}</Badge></div>
              <p className="mt-1 font-semibold">{x.kind === 'pickup' ? 'Pick up' : 'Deliver'}: {x.place}</p>
              <p className="text-sm text-steel">{x.address}. {x.items}</p>
              {x.status === 'pending' && <Btn className="mt-3 w-full" tone="primary" onClick={() => { dispatch({ t: 'stop', runId: run.id, stop: { ...x, status: 'arrived' } }); toast('Arrival time saved') }}>I'm here</Btn>}
              {x.status === 'arrived' && <Btn className="mt-3 w-full" tone="stat" onClick={() => setSig(x)}><PenLine size={16} /> Get signature</Btn>}
            </li>
          ))}
        </ol>
      </div>
      <Modal open={!!sig} onClose={() => setSig(null)} title="Proof of delivery">
        <label className="block"><span className="mb-1 block text-sm font-semibold">Name of the person signing</span><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. L. Ward" /></label>
        <label className="mt-3 flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line text-sm font-semibold"><Camera size={18} /> Take a photo<input type="file" accept="image/*" capture="environment" className="sr-only" onChange={() => toast('Photo attached')} /></label>
        <p className="mb-1 mt-3 text-sm font-semibold">Signature</p>
        <SignaturePad onDone={(url) => { if (!sig) return; dispatch({ t: 'stop', runId: run.id, stop: { ...sig, status: 'done', pod: { signedBy: name || 'Recipient', at: new Date().toISOString(), sig: url, photo: true, gps: geo === 'ok' } } }); setSig(null); setName(''); toast('Delivery record saved with time' + (geo === 'ok' ? ' and GPS' : '')) }} />
      </Modal>
    </Page>
  )
}

/* ------------------------------------------------------------------ NEMT trips */
export function Nemt() {
  const { s, dispatch, toast } = useStore()
  const t = s.trips
  const completed = t.filter((x) => x.status === 'completed')
  const onTime = completed.filter((x) => (x.lateMin || 0) <= 15).length
  const noShow = t.filter((x) => x.status === 'no-show').length
  const next: Record<Trip['status'], Trip['status']> = { scheduled: 'en-route', 'en-route': 'onboard', onboard: 'completed', completed: 'completed', 'no-show': 'no-show', canceled: 'canceled' }
  const label: Record<Trip['status'], string> = { scheduled: 'Scheduled', 'en-route': 'En route', onboard: 'Onboard', completed: 'Completed', 'no-show': 'No-show', canceled: 'Canceled' }
  return (
    <Page title="NEMT trips" help="nemt" sub="Broker trips imported next to private-pay and facility rides, with the numbers brokers score you on.">
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Trips today" value={t.length} sub={`${t.filter((x) => x.mobility === 'wheelchair').length} wheelchair`} />
        <Stat label="On-time rate" value={completed.length ? Math.round((onTime / completed.length) * 100) + '%' : '—'} sub="Broker target 95%" tone="ok" />
        <Stat label="No-shows" value={noShow} sub="Logged with timestamp and photo" />
        <Stat label="Billable today" value={money(t.reduce((a, x) => a + x.fare, 0))} sub="Reconciled against the broker file" />
      </div>
      <Card pad={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead><tr className="border-b border-line text-left text-steel"><th className="p-3 font-semibold">Pickup</th><th className="p-3 font-semibold">Source</th><th className="p-3 font-semibold">Member</th><th className="p-3 font-semibold">From and to</th><th className="p-3 font-semibold">Mobility</th><th className="p-3 font-semibold">Driver</th><th className="p-3 font-semibold">Status</th><th className="p-3" /></tr></thead>
            <tbody>
              {t.map((x) => (
                <tr key={x.id} className="border-b border-line/70">
                  <td className="num p-3 font-semibold">{time(x.pickup)}</td>
                  <td className="p-3">{x.broker}</td>
                  <td className="p-3 text-steel">{x.memberRef}</td>
                  <td className="p-3"><span className="block">{x.from}</span><span className="text-steel">to {x.to}, {x.legs}</span></td>
                  <td className="p-3">{x.mobility === 'wheelchair' ? <Badge tone="info"><Accessibility size={12} /> Wheelchair</Badge> : <Badge>Ambulatory</Badge>}</td>
                  <td className="p-3">{s.drivers.find((d) => d.id === x.driverId)?.name || <span className="font-semibold text-stat">Unassigned</span>}</td>
                  <td className="p-3"><Badge tone={x.status === 'completed' ? 'ok' : x.status === 'no-show' ? 'hot' : x.status === 'scheduled' ? 'muted' : 'info'}>{label[x.status]}{x.lateMin ? `, ${x.lateMin} min late` : ''}</Badge></td>
                  <td className="p-3 text-right">{!['completed', 'no-show', 'canceled'].includes(x.status) && <Btn size="sm" onClick={() => { if (!x.driverId) { dispatch({ t: 'trip', trip: { ...x, driverId: x.mobility === 'wheelchair' ? 'D5' : 'D6' } }); toast('Assigned to the next free driver with the right vehicle') } else { dispatch({ t: 'trip', trip: { ...x, status: next[x.status] } }); toast(label[next[x.status]]) } }}>{x.driverId ? 'Next step' : 'Assign'}</Btn>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="mt-3 flex items-center gap-2 text-sm text-steel"><Clock size={15} /> In the live portal, trips import from the broker's export file or portal each morning, and completed trips export back for billing.</p>
    </Page>
  )
}

/* ------------------------------------------------------------------ Drivers and fleet compliance */
export function Fleet() {
  const { s, dispatch, toast } = useStore()
  const vehicleDays = (d: string) => Math.ceil((new Date(d + 'T23:59').getTime() - Date.now()) / 864e5)
  const renew = (driverId: string, name: string) => { const d = s.drivers.find((x) => x.id === driverId)!; const nd = new Date(); nd.setFullYear(nd.getFullYear() + 1); dispatch({ t: 'driver', d: { ...d, credentials: d.credentials.map((c) => c.name === name ? { ...c, expires: nd.toISOString().slice(0, 10) } : c) } }); toast(`${name} renewed for ${d.name}. Dispatch block lifted.`) }
  return (
    <Page title="Drivers and fleet" help="fleet" sub="Every credential and inspection with its expiry. Expired items block dispatch until renewed.">
      <div className="grid gap-3 lg:grid-cols-2">
        {s.drivers.map((d) => { const st = driverStatus(d); const v = s.vehicles.find((x) => x.id === d.vehicleId)
          return (
            <Card key={d.id} className={st.blocked ? 'border-stat' : ''}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div><p className="font-display text-lg font-bold wide">{d.name}</p><p className="text-sm text-steel">{d.nemt ? 'NEMT driver' : 'Courier'} &middot; {v?.unit} &middot; {d.phone}</p></div>
                {st.blocked ? <Badge tone="hot"><AlertTriangle size={12} /> Blocked from dispatch</Badge> : st.soon.length ? <Badge tone="warn">{st.soon.length} expiring soon</Badge> : <Badge tone="ok"><ShieldCheck size={12} /> Clear</Badge>}
              </div>
              <ul className="mt-3 divide-y divide-line text-sm">
                {st.items.map((c) => (
                  <li key={c.name} className="flex items-center justify-between gap-3 py-2">
                    <span>{c.name}</span>
                    <span className="flex items-center gap-2"><span className={`num ${c.days < 0 ? 'font-semibold text-stat' : c.days <= 30 ? 'font-semibold text-warn' : 'text-steel'}`}>{c.days < 0 ? `Expired ${shortDate(c.expires)}` : c.days <= 30 ? `${c.days} days left` : `to ${shortDate(c.expires)}`}</span>{c.days <= 30 && <Btn size="sm" onClick={() => renew(d.id, c.name)}>Upload renewal</Btn>}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) })}
      </div>
      <h2 className="mb-3 mt-8 font-display text-xl font-bold wide">Vehicles</h2>
      <Card pad={false}>
        <ul className="divide-y divide-line">
          {s.vehicles.map((v) => { const di = vehicleDays(v.inspection); return (
            <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <span className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-cryo-wash text-cryo-dark">{v.type === 'Wheelchair van' ? <Accessibility size={18} /> : <Truck size={18} />}</span><span><span className="font-semibold">{v.unit}</span><span className="block text-sm text-steel">{v.type}, {v.plate}</span></span></span>
              <span className="text-sm"><span className={di < 0 ? 'font-semibold text-stat' : di <= 30 ? 'font-semibold text-warn' : 'text-steel'}>Inspection {di < 0 ? `expired ${shortDate(v.inspection)}` : `due ${shortDate(v.inspection)}`}</span><span className="block text-steel">Registration to {shortDate(v.registration)}</span></span>
            </li>
          ) })}
        </ul>
      </Card>
    </Page>
  )
}
