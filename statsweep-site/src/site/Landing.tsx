import { useEffect } from 'react'
import { ArrowRight, Check, ShieldCheck, Thermometer, MapPin, PenLine, Truck, Accessibility, FlaskConical, Pill, FileText, Radar, Brain, Gauge, Send, KanbanSquare, Newspaper, ClipboardCheck, Receipt, UserRound, Smartphone, X } from 'lucide-react'
import { RunSheet } from './RunSheet'
import { ConsultForm } from './ConsultForm'
import { Faq } from './Faq'
import { site, tiers, tierNotes, valueStack, guarantees, setupTimeline } from '@/config/site'

const money = (n: number) => '$' + n.toLocaleString('en-US')

export function Landing() {
  useEffect(() => { document.title = 'StatSweep: bids, leads and a business portal for medical couriers and NEMT operators' }, [])
  return (
    <>
      <Hero />
      <Sources />
      <Problem />
      <How />
      <WhatYouGet />
      <WhoFor />
      <Proof />
      <Offer />
      <Timeline />
      <Promises />
      <Faq />
      <Book />
    </>
  )
}

/* ------------------------------------------------------------------ hero */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-night text-white">
      <div className="grain absolute inset-0" aria-hidden="true" />
      <div className="wrap relative grid gap-12 pb-16 pt-12 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-10 lg:pb-24 lg:pt-20">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-cryo-bright">For independent medical couriers and NEMT operators</p>
          <h1 className="display mt-4 text-[2.6rem] text-white sm:text-[3.6rem] lg:text-[3.55rem] xl:text-[3.9rem]">Your next route contract is already posted.</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
            Labs, pharmacies, hospitals, state agencies and NEMT brokers put work out every week. StatSweep finds the work you qualify for, writes the pitch, and gives you the website and business portal to win it and run it.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#book" className="btn-stat text-[17px]">Book a 15-minute call</a>
            <a href={site.demoUrl} className="btn-ghost-dark text-[17px]">Click through the live demo <ArrowRight size={18} /></a>
          </div>
          <ul className="mt-9 grid max-w-xl gap-x-6 gap-y-2 text-[15px] text-white/70 sm:grid-cols-2">
            <li className="flex gap-2"><Check size={18} className="mt-0.5 shrink-0 text-cryo-bright" /> Live in 21 days</li>
            <li className="flex gap-2"><Check size={18} className="mt-0.5 shrink-0 text-cryo-bright" /> Nothing sent without your OK</li>
            <li className="flex gap-2"><Check size={18} className="mt-0.5 shrink-0 text-cryo-bright" /> Every find cites its source</li>
            <li className="flex gap-2"><Check size={18} className="mt-0.5 shrink-0 text-cryo-bright" /> Month to month, you own your data</li>
          </ul>
        </div>
        <RunSheet />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ sources: a transit line of stops */
const STOPS = [
  { name: 'SAM.gov and VA medical centers', note: 'Federal courier and transport solicitations' },
  { name: 'State and county procurement', note: 'eVA, state DGS portals, county and city bids' },
  { name: 'NEMT brokers and Medicaid plans', note: 'Provider network openings by county' },
  { name: 'Hospitals and health systems', note: 'Supplier registration and courier gaps' },
  { name: 'Reference and independent labs', note: 'New draw sites and route expansions' },
  { name: 'LTC, specialty and infusion pharmacies', note: 'Facility delivery and STAT runs' },
  { name: 'Clinics, dialysis, dental and vet', note: 'Multi-site practices that move specimens' },
]
function Sources() {
  return (
    <section className="bg-paper py-16 sm:py-20" aria-labelledby="sources-h">
      <div className="wrap">
        <h2 id="sources-h" className="h2 max-w-3xl">Seven places your next customer posts work. The sweep stops at every one.</h2>
        <p className="lede">Most operators check one broker portal and their email. The sweep runs the whole line on your schedule, inside your service radius, and logs the date and time of every stop.</p>
        <div className="relative mt-12">
          <div className="route-line" aria-hidden="true" />
          <ol className="relative grid gap-6 lg:grid-cols-7 lg:gap-4">
            {STOPS.map((s) => (
              <li key={s.name} className="flex gap-4 lg:block">
                <span className="relative z-10 mt-0.5 grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full border-4 border-cryo bg-paper lg:mx-0" aria-hidden="true"><span className="h-3 w-3 rounded-full bg-night" /></span>
                <div className="lg:mt-4">
                  <p className="font-display text-[17px] font-bold leading-tight wide">{s.name}</p>
                  <p className="mt-1 text-sm leading-snug text-steel">{s.note}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ problem */
function Problem() {
  const items = [
    { title: 'One broker away from zero trips', text: 'When most of your volume comes from a single broker, a scoring change or a lost county can empty your schedule overnight, usually with no explanation.' },
    { title: 'The bids you never saw', text: 'Courier and transport contracts go up on federal, state and county portals with two-week deadlines. Nobody on your team has time to check them while driving.' },
    { title: 'Paperwork that costs you money', text: 'A missing timestamp or signature gets a trip denied. An expired driver certification pauses assignments in an audit. Paper manifests and group texts hide both until it is too late.' },
  ]
  return (
    <section className="py-16 sm:py-20" aria-labelledby="problem-h">
      <div className="wrap">
        <h2 id="problem-h" className="h2 max-w-3xl">You are great at the run. The business around the run is what keeps you small.</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {items.map((p) => (
            <article key={p.title} className="border-t-4 border-stat bg-paper p-6">
              <h3 className="text-xl font-bold wide">{p.title}</h3>
              <p className="mt-3 leading-relaxed text-steel">{p.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ how it works (a real sequence) */
function How() {
  const steps = [
    { icon: Brain, title: 'It learns your company', text: 'The Company Brain holds what you haul, your vehicles, temperature capability, certifications, insurance limits, broker enrollments and service radius.' },
    { icon: Radar, title: 'It sweeps', text: 'Daily, three times a week or weekly, depending on your plan. Every source checked is logged with a date and time.' },
    { icon: Gauge, title: 'It scores', text: 'Each find gets a fit score from 0 to 100 with the reasons. Work you can’t legally or practically do is dropped, with the reason shown.' },
    { icon: FileText, title: 'It drafts', text: 'An intro email, a call script, a text and a follow-up plan for each lead. Capability statements and application worksheets for each bid.' },
    { icon: ShieldCheck, title: 'You approve', text: 'Nothing goes out in your name until you click approve. You can edit any draft first.' },
    { icon: KanbanSquare, title: 'It tracks', text: 'Every find lands on one pipeline with its source link and the date it was found, from first touch to signed contract.' },
  ]
  return (
    <section id="how" className="scroll-mt-20 bg-night py-16 text-white sm:py-24" aria-labelledby="how-h">
      <div className="wrap">
        <h2 id="how-h" className="h2 max-w-3xl text-white">How the sweep turns a posting into a signed route</h2>
        <ol className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="relative pl-14">
              <span className="num absolute left-0 top-0 grid h-10 w-10 place-items-center rounded-full bg-cryo-bright font-display text-lg font-extrabold text-night">{i + 1}</span>
              <h3 className="flex items-center gap-2 text-xl font-bold text-white wide"><s.icon size={20} className="text-cryo-bright" aria-hidden="true" /> {s.title}</h3>
              <p className="mt-2 leading-relaxed text-white/70">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ what you get */
function ProductShot() {
  const stops = [
    { time: '07:40', place: 'Northside Reference Lab', item: '14 specimens, ambient', state: 'Delivered', sig: 'K. Ortiz' },
    { time: '08:15', place: 'Mercy Infusion Pharmacy', item: '3 totes, 2 to 8 °C', state: 'In transit', sig: '' },
    { time: '09:05', place: 'Lakeview Dialysis', item: 'Monthly draw kit pickup', state: 'Next', sig: '' },
  ]
  return (
    <figure className="overflow-hidden rounded-2xl border border-night/15 bg-paper shadow-[0_40px_80px_-40px_rgba(11,31,51,.45)]" aria-label="Sample of the dispatch screen in the portal">
      <div className="flex items-center gap-2 border-b border-line bg-sterile px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-stat/70" /><span className="h-2.5 w-2.5 rounded-full bg-carbon-deep" /><span className="h-2.5 w-2.5 rounded-full bg-cryo/60" />
        <span className="ml-3 text-xs text-steel">Dispatch, Route 4, sample data</span>
      </div>
      <div className="grid gap-0 md:grid-cols-[1.1fr_1fr]">
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="font-display font-bold wide">Route 4: Marcus D.</p>
            <span className="rounded-full bg-cryo-wash px-2.5 py-1 text-xs font-semibold text-cryo-dark">On time</span>
          </div>
          <ol className="mt-4 space-y-3">
            {stops.map((s) => (
              <li key={s.time} className="flex gap-3">
                <span className="num w-12 shrink-0 pt-0.5 text-sm font-semibold text-steel">{s.time}</span>
                <div className="min-w-0 flex-1 rounded-xl border border-line p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{s.place}</p><span className={`text-xs font-bold ${s.state === 'Delivered' ? 'text-ok' : s.state === 'In transit' ? 'text-cryo-dark' : 'text-steel'}`}>{s.state}</span></div>
                  <p className="text-sm text-steel">{s.item}</p>
                  {s.sig && <p className="mt-1 flex items-center gap-1 text-xs text-steel"><PenLine size={12} /> Signed by {s.sig}, photo on file</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="border-t border-line bg-night p-4 text-white sm:p-5 md:border-l md:border-t-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-cryo-bright"><Thermometer size={16} /> Cooler 2 log</p>
          <svg viewBox="0 0 240 90" className="mt-3 w-full" role="img" aria-label="Temperature stayed between 3.4 and 5.1 degrees, inside the 2 to 8 degree range">
            <rect x="0" y="18" width="240" height="54" fill="#39D5CF" opacity=".12" />
            <text x="236" y="15" textAnchor="end" fill="#BFE7F2" fontSize="9">8 &deg;C</text>
            <text x="236" y="84" textAnchor="end" fill="#BFE7F2" fontSize="9">2 &deg;C</text>
            <polyline fill="none" stroke="#39D5CF" strokeWidth="2.5" strokeLinejoin="round" points="0,52 20,48 40,50 60,44 80,46 100,41 120,43 140,47 160,45 180,39 200,42 220,44 240,43" />
          </svg>
          <p className="mt-2 text-sm text-white/70">In range for 41 minutes. Readings every 2 minutes, attached to the delivery record.</p>
          <div className="mt-5 rounded-xl bg-white/5 p-3">
            <p className="text-sm font-semibold">Chain of custody</p>
            <ul className="mt-2 space-y-1.5 text-sm text-white/75">
              <li className="flex justify-between gap-2"><span>Picked up, sealed bag 22-118</span><span className="num">07:22</span></li>
              <li className="flex justify-between gap-2"><span>Scanned at lab intake</span><span className="num">07:40</span></li>
              <li className="flex justify-between gap-2"><span>POD signed, GPS matched</span><span className="num">07:41</span></li>
            </ul>
          </div>
        </div>
      </div>
    </figure>
  )
}

function WhatYouGet() {
  const parts = [
    { title: 'A website healthcare buyers trust', text: 'Your credentials, insurance and coverage map up front. A pickup request form that drops straight into your dispatch board. Service-area pages so local labs and clinics find you.' },
    { title: 'A portal your whole team runs on', text: 'Dispatch, drivers, compliance, quotes and billing in one place, on a phone or a desktop. Replaces the spreadsheet, the group text and the paper manifest.' },
    { title: 'An engine that finds the work', text: 'Bids, broker openings and local leads, scored against your Company Brain, with the outreach already written.' },
  ]
  const modules = [
    { icon: Truck, t: 'Dispatch board and routes' },
    { icon: ClipboardCheck, t: 'Chain of custody and proof of delivery' },
    { icon: Thermometer, t: 'Temperature logs for 2 to 8 °C and frozen' },
    { icon: Smartphone, t: 'Driver app with photo, signature and GPS' },
    { icon: ShieldCheck, t: 'Driver and vehicle compliance vault' },
    { icon: Accessibility, t: 'NEMT trips, broker import and reconciliation' },
    { icon: Receipt, t: 'Quotes, STAT and after-hours rates, invoices' },
    { icon: UserRound, t: 'Customer portal for your labs and pharmacies' },
    { icon: Send, t: 'Outreach drafts and follow-up cadence' },
    { icon: Newspaper, t: 'Weekly briefing in plain English' },
  ]
  return (
    <section id="portal" className="scroll-mt-20 py-16 sm:py-24" aria-labelledby="get-h">
      <div className="wrap">
        <h2 id="get-h" className="h2 max-w-3xl">Three things, built for you, working as one</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {parts.map((p) => (
            <div key={p.title} className="border-t-2 border-night pt-5">
              <h3 className="text-2xl font-bold wide">{p.title}</h3>
              <p className="mt-3 leading-relaxed text-steel">{p.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-start">
          <ProductShot />
          <div>
            <h3 className="text-2xl font-bold wide">Inside the portal</h3>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {modules.map((m) => <li key={m.t} className="flex items-center gap-3 text-[16px]"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-cryo-wash text-cryo-dark"><m.icon size={18} aria-hidden="true" /></span>{m.t}</li>)}
            </ul>
            <a href={site.demoUrl} className="btn-ghost mt-7">Try every screen in the demo <ArrowRight size={18} /></a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ who it's for */
function WhoFor() {
  const cols = [
    { icon: FlaskConical, title: 'Medical couriers', lead: 'Specimens, prescriptions, supplies and records between labs, pharmacies, clinics and hospitals.',
      on: ['Lab, pharmacy, LTC and dialysis lead lists for your radius', 'State, county and federal courier bids', 'Chain of custody, temperature logs and POD', 'Customer portal so your labs see every pickup', 'Capability statement and supplier registrations'] },
    { icon: Accessibility, title: 'NEMT operators', lead: 'Ambulatory, wheelchair and stretcher trips for Medicaid members, dialysis patients, seniors and facilities.',
      on: ['Broker and Medicaid plan provider openings by county', 'Facility contracts: dialysis, adult day, senior living', 'Trip import, on-time and no-show tracking', 'Driver credential tracking for broker audits', 'Broker-Ready Packet for the brokers in your state'] },
  ]
  return (
    <section className="bg-paper py-16 sm:py-24" aria-labelledby="who-h">
      <div className="wrap">
        <h2 id="who-h" className="h2 max-w-3xl">One system. Two kinds of operator.</h2>
        <p className="lede">Many operators do both. Turn on what you run today and add the rest when you're ready.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {cols.map((c) => (
            <article key={c.title} className="rounded-2xl bg-sterile p-6 sm:p-8">
              <c.icon size={30} className="text-cryo-dark" aria-hidden="true" />
              <h3 className="mt-4 text-3xl font-bold wide">{c.title}</h3>
              <p className="mt-2 leading-relaxed text-steel">{c.lead}</p>
              <p className="mt-6 text-sm font-bold text-night">What we turn on</p>
              <ul className="mt-3 space-y-2.5">{c.on.map((x) => <li key={x} className="flex gap-2.5"><Check size={18} className="mt-0.5 shrink-0 text-cryo" /> <span>{x}</span></li>)}</ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ proof (real numbers from our first client) */
function Proof() {
  const stats = [
    { n: '59', l: 'opportunities found and scored' },
    { n: '43', l: 'veterinary hub leads on a separate board' },
    { n: '$2.8M', l: 'estimated contract value surfaced' },
    { n: '$30K', l: 'median estimated value per opportunity, per year' },
  ]
  return (
    <section id="proof" className="scroll-mt-20 py-16 sm:py-24" aria-labelledby="proof-h">
      <div className="wrap grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <h2 id="proof-h" className="h2">Built first for a real courier</h2>
          <p className="lede">StatSweep is the system DataIsData built and runs for a HIPAA-compliant medical courier in Richmond, Virginia, our first client. Over seven sweeps from July to October 2026 it found federal VA courier work, state courier bids, long-term-care pharmacies, multi-site lab routes and NEMT broker enrollments, each with a link to where it came from.</p>
          <p className="mt-4 max-w-prose leading-relaxed text-steel">One route at that median value covers a full year of the top plan, setup included, nearly three times over.</p>
        </div>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-line">
          {stats.map((s) => (
            <div key={s.l} className="bg-paper p-6 sm:p-8">
              <dt className="sr-only">{s.l}</dt>
              <dd className="num display text-4xl text-night sm:text-5xl">{s.n}</dd>
              <dd className="mt-2 text-sm leading-snug text-steel">{s.l}</dd>
            </div>
          ))}
        </dl>
      </div>
      <p className="wrap mt-4 text-xs text-steel">Figures from that client's portal, July 21 to October 14, 2026. Contract values are the engine's estimates of annual revenue or published ceilings, not money collected.</p>
    </section>
  )
}

/* ------------------------------------------------------------------ the offer */
function Offer() {
  const total = valueStack.reduce((s, v) => s + v.value, 0)
  return (
    <section id="pricing" className="scroll-mt-20 bg-night py-16 text-white sm:py-24" aria-labelledby="price-h">
      <div className="wrap">
        <h2 id="price-h" className="h2 max-w-3xl text-white">What you'd pay to piece this together yourself</h2>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div className="sheet rounded-[6px] text-ink">
            <div className="perf" aria-hidden="true" />
            <div className="px-5 pb-5 pt-3">
              <p className="font-display text-[13px] font-extrabold wide">ITEMIZED, FIRST YEAR</p>
              <table className="mt-3 w-full text-[15px]">
                <caption className="sr-only">Estimated cost to hire each piece separately</caption>
                <tbody>
                  {valueStack.map((v) => <tr key={v.item} className="border-b border-ink/15"><td className="py-2.5 pr-4 leading-snug">{v.item}</td><td className="num py-2.5 text-right font-semibold">{money(v.value)}</td></tr>)}
                </tbody>
                <tfoot><tr><td className="pt-3 font-display font-extrabold wide">Hired out separately</td><td className="num pt-3 text-right font-display text-xl font-extrabold">{money(total)}</td></tr></tfoot>
              </table>
              <p className="mt-3 text-[12px] text-ink/65">Our estimates of typical market rates for a small business, for comparison.</p>
            </div>
          </div>
          <div>
            <p className="text-lg leading-relaxed text-white/80">You get every line on that sheet, run as one system, starting at <strong className="text-white">{money(tiers[2].setup)}</strong> to set up. And you never pay a per-lead fee: every lead the sweep finds is yours alone, not shared with five other operators.</p>
            <h3 className="mt-8 text-2xl font-bold text-white wide">Our guarantees</h3>
            <ul className="mt-4 space-y-4">
              {guarantees.map((g) => <li key={g.title} className="flex gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-cryo-bright" /><div><p className="font-semibold text-white">{g.title}</p><p className="text-white/70">{g.text}</p></div></li>)}
            </ul>
          </div>
        </div>

        <h3 className="mt-16 text-3xl font-bold text-white wide sm:text-4xl">Your investment</h3>
        <p className="mt-3 max-w-prose text-white/70">One route contract at our first client's median value covers a full year of Contract Ready, setup included, nearly three times over.</p>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {tiers.map((t) => (
            <article key={t.id} className={`relative flex flex-col rounded-2xl p-6 sm:p-7 ${t.highlight ? 'bg-paper text-ink ring-4 ring-cryo-bright' : 'bg-night-2 text-white'}`}>
              {t.highlight && <p className="absolute -top-3.5 left-6 rounded-full bg-cryo-bright px-3 py-1 text-sm font-bold text-night">{t.highlight}</p>}
              <h3 className={`text-2xl font-bold wide ${t.highlight ? '' : 'text-white'}`}>{t.name}</h3>
              <p className={`mt-1 text-sm ${t.highlight ? 'text-steel' : 'text-white/65'}`}>{t.for}</p>
              <p className="mt-5"><span className="num display text-5xl">{money(t.setup)}</span> <span className={t.highlight ? 'text-steel' : 'text-white/65'}>setup</span></p>
              <p className="num mt-1 text-lg font-semibold">then {money(t.monthly)}/month</p>
              <p className={`mt-1 text-sm ${t.highlight ? 'text-cryo-dark' : 'text-cryo-bright'}`}>{t.cadence} &middot; {t.seats}</p>
              <ul className="mt-6 flex-1 space-y-2.5 text-[15px]">{t.features.map((f) => <li key={f} className="flex gap-2.5"><Check size={18} className={`mt-0.5 shrink-0 ${t.highlight ? 'text-cryo' : 'text-cryo-bright'}`} />{f}</li>)}</ul>
              <a href="#book" className={t.highlight ? 'btn-stat mt-7' : 'btn-ghost-dark mt-7'}>Book a call about {t.name}</a>
            </article>
          ))}
        </div>
        <ul className="mt-6 space-y-1 text-sm text-white/60">{tierNotes.map((n) => <li key={n}>{n}</li>)}</ul>

        <div className="mt-14 rounded-2xl border border-white/15 p-6 sm:p-8">
          <h3 className="text-2xl font-bold text-white wide">Included when you start this month</h3>
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              ['The Broker-Ready Packet', 'Every credential, insurance limit and driver document the NEMT brokers in your state ask for, filled in with your details and a checklist of what is missing.'],
              ['Capability statement in 48 hours', 'The one-page document procurement officers and lab managers ask for. Printable and on your website.'],
              ['The 50-stop outreach run', 'Fifty labs, pharmacies, clinics and facilities inside your radius, with a written introduction for each one.'],
              ['Driver file audit', 'We check every driver’s license, HIPAA and bloodborne-pathogen training and insurance, and set the expiry alerts.'],
            ].map(([t, d]) => <li key={t} className="flex gap-3"><Check className="mt-0.5 shrink-0 text-cryo-bright" /><div><p className="font-semibold text-white">{t}</p><p className="text-white/70">{d}</p></div></li>)}
          </ul>
          <p className="mt-6 text-white/75">We set up every portal by hand, so we take on {site.monthlyIntake} new companies a month. When this month is full, new sign-ups start next month.</p>
        </div>
      </div>
    </section>
  )
}

function Timeline() {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="time-h">
      <div className="wrap">
        <h2 id="time-h" className="h2 max-w-3xl">From kickoff call to first contract pitch in three weeks</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {setupTimeline.map((s) => (
            <li key={s.when} className="border-l-4 border-cryo pl-5">
              <p className="text-sm font-bold text-cryo-dark">{s.when}</p>
              <h3 className="mt-1 text-xl font-bold wide">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-steel">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Promises() {
  const yes = ['Real sources: every find links to where we found it, with the date we opened it', 'Your approval before anything is sent or submitted', 'Plain-English weekly briefing, even when the honest answer is "nothing new fits"', 'Your website content, customer list and records stay yours if you leave']
  const no = ['Sell you shared leads that five other operators also bought', 'Promise a contract: we find and prepare, you win the work', 'Submit a broker application or bid without you', 'Write fake reviews or invent credentials you don’t hold']
  return (
    <section className="bg-paper py-16 sm:py-20" aria-labelledby="prom-h">
      <div className="wrap">
        <h2 id="prom-h" className="h2 max-w-3xl">What we promise, and what we won't do</h2>
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <ul className="space-y-3">{yes.map((x) => <li key={x} className="flex gap-3"><Check className="mt-0.5 shrink-0 text-ok" /><span>{x}</span></li>)}</ul>
          <ul className="space-y-3">{no.map((x) => <li key={x} className="flex gap-3"><X className="mt-0.5 shrink-0 text-stat" /><span>We won't {x.charAt(0).toLowerCase() + x.slice(1)}</span></li>)}</ul>
        </div>
      </div>
    </section>
  )
}

function Book() {
  return (
    <section id="book" className="scroll-mt-20 bg-sterile py-16 sm:py-24" aria-labelledby="book-h">
      <div className="wrap grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 id="book-h" className="h2">Book a 15-minute call</h2>
          <p className="lede">Tell us what you run and where. Before the call we run a sample sweep of your service area, so you see real opportunities with your name on them, not a slideshow.</p>
          <ul className="mt-6 space-y-3 text-[16px]">
            <li className="flex gap-3"><MapPin className="mt-0.5 shrink-0 text-cryo" /> A sample sweep of your county and the ones around it</li>
            <li className="flex gap-3"><Pill className="mt-0.5 shrink-0 text-cryo" /> Which labs, pharmacies and brokers near you are worth calling first</li>
            <li className="flex gap-3"><Check className="mt-0.5 shrink-0 text-cryo" /> A straight answer on which plan fits, or if none does</li>
          </ul>
        </div>
        <ConsultForm />
      </div>
    </section>
  )
}
