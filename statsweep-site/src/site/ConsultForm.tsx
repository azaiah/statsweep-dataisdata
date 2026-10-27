import { useState, type FormEvent } from 'react'
import { site } from '@/config/site'

const encode = (d: Record<string, string>) => Object.entries(d).map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v)).join('&')
type F = { name: string; company: string; kind: string; vehicles: string; state: string; phone: string; email: string; want: string; message: string }
const empty: F = { name: '', company: '', kind: 'Medical courier', vehicles: '1 to 3', state: '', phone: '', email: '', want: 'More contracts', message: '' }

export function ConsultForm() {
  const [f, setF] = useState<F>(empty)
  const [errs, setErrs] = useState<Partial<Record<keyof F, string>>>({})
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'failed'>('idle')
  const set = (k: keyof F) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const n: typeof errs = {}
    if (!f.name.trim()) n.name = 'Add your name.'
    if (!f.company.trim()) n.company = 'Add your company name.'
    if (!f.state.trim()) n.state = 'Add the state or metro you serve.'
    if (!/^\S+@\S+\.\S+$/.test(f.email)) n.email = 'Add an email we can reply to.'
    if (f.phone.replace(/\D/g, '').length < 10) n.phone = 'Add a 10-digit phone number.'
    setErrs(n); if (Object.keys(n).length) return
    setState('sending')
    try {
      const r = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: encode({ 'form-name': site.consultationFormName, ...f }) })
      if (!r.ok) throw new Error(String(r.status))
      setState('done')
    } catch { setState('failed') }
  }
  if (state === 'done') return (
    <div className="card p-8" role="status">
      <h3 className="text-2xl font-bold wide">Request received</h3>
      <p className="mt-3 leading-relaxed text-steel">We'll run a sample sweep for {f.company || 'your company'} in {f.state || 'your area'} and reach out within one business day to book the call.</p>
      <a href={site.demoUrl} className="btn-ghost mt-6">Open the live demo while you wait</a>
    </div>
  )
  const summary = `Name: ${f.name}\nCompany: ${f.company}\nType: ${f.kind}\nVehicles: ${f.vehicles}\nArea: ${f.state}\nPhone: ${f.phone}\nEmail: ${f.email}\nWants: ${f.want}\n${f.message}`
  const field = (k: keyof F, label: string, props: Record<string, string> = {}) => (
    <div>
      <label htmlFor={k} className="label">{label}</label>
      <input id={k} name={k} className="input" value={f[k]} onChange={set(k)} aria-invalid={!!errs[k]} aria-describedby={errs[k] ? k + '-e' : undefined} {...props} />
      {errs[k] && <p id={k + '-e'} className="mt-1 text-sm text-stat">{errs[k]}</p>}
    </div>
  )
  return (
    <form className="card grid gap-4 p-6 sm:grid-cols-2 sm:p-8" onSubmit={submit} noValidate name={site.consultationFormName}>
      {field('name', 'Your name', { autoComplete: 'name' })}
      {field('company', 'Company', { autoComplete: 'organization' })}
      <div>
        <label htmlFor="kind" className="label">What you run</label>
        <select id="kind" className="input" value={f.kind} onChange={set('kind')}><option>Medical courier</option><option>NEMT</option><option>Both</option><option>Starting a company</option></select>
      </div>
      <div>
        <label htmlFor="vehicles" className="label">Vehicles</label>
        <select id="vehicles" className="input" value={f.vehicles} onChange={set('vehicles')}><option>1 to 3</option><option>4 to 10</option><option>11 to 25</option><option>26 or more</option></select>
      </div>
      {field('state', 'State or metro you serve', { placeholder: 'e.g. Charlotte, NC' })}
      {field('phone', 'Mobile phone', { type: 'tel', autoComplete: 'tel', inputMode: 'tel' })}
      <div className="sm:col-span-2">{field('email', 'Email', { type: 'email', autoComplete: 'email' })}</div>
      <div className="sm:col-span-2">
        <label htmlFor="want" className="label">What do you want more of?</label>
        <select id="want" className="input" value={f.want} onChange={set('want')}><option>More contracts</option><option>Broker and Medicaid work</option><option>Local lab and pharmacy customers</option><option>Getting organized</option><option>All of it</option></select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="message" className="label">Anything we should know? <span className="font-normal text-steel">(optional)</span></label>
        <textarea id="message" rows={3} className="input py-3" value={f.message} onChange={set('message')} placeholder="Brokers you work with now, certifications, what's been hard" />
      </div>
      <div className="sm:col-span-2">
        <button className="btn-stat w-full text-[17px]" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Book my call and sample sweep'}</button>
        <p className="mt-3 text-sm text-steel">We use this only to contact you about StatSweep. No spam, no list selling.</p>
      </div>
      {state === 'failed' && (
        <div className="sm:col-span-2 rounded-xl bg-stat-wash p-4" role="alert">
          <p className="font-semibold text-stat-dark">That didn't send. Email it to us instead:</p>
          <textarea readOnly className="input mt-2 h-32 py-2 text-sm" value={summary} aria-label="Your request, ready to copy" />
          <a className="btn-ghost mt-2" href={`mailto:${site.email}?subject=${encodeURIComponent('StatSweep call: ' + f.company)}&body=${encodeURIComponent(summary)}`}>Open in email</a>
        </div>
      )}
    </form>
  )
}
