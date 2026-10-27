import { useMemo, useState } from 'react'
import { Calculator, Printer, Receipt, Users, Phone, Mail } from 'lucide-react'
import { useStore } from '@/lib/store'
import { Page, Card, Badge, Btn, Drawer, Field, inputCls, Stat, Bars, Modal, Empty } from '@/components/ui'
import { money, shortDate, uid, longDate } from '@/lib/format'
import type { QuoteInput, Rates } from '@/lib/types'

export function Customers() {
  const { s } = useStore()
  const [open, setOpen] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const c = s.customers.find((x) => x.id === open)
  const list = s.customers.filter((x) => !q || (x.name + x.contact + x.type).toLowerCase().includes(q.toLowerCase()))
  const total = s.customers.reduce((a, x) => a + x.monthly, 0)
  return (
    <Page title="Customers" help="customers" sub={`${s.customers.length} accounts worth ${money(total)} a month.`}>
      <input className={inputCls + ' mb-4 max-w-md'} placeholder="Search customers" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search customers" />
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card pad={false}>
          {list.length === 0 ? <div className="p-4"><Empty icon={<Users />} title="No customer matches that search." /></div> : (
            <ul className="divide-y divide-line">{list.map((x) => (
              <li key={x.id}><button onClick={() => setOpen(x.id)} className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left hover:bg-sterile">
                <span className="min-w-0"><span className="block font-semibold">{x.name}</span><span className="text-sm text-steel">{x.type} &middot; {x.contact}, {x.title}</span></span>
                <span className="text-right"><span className="num block font-semibold">{money(x.monthly)}/mo</span><span className="text-sm text-steel">{x.sla}</span></span>
              </button></li>
            ))}</ul>
          )}
        </Card>
        <Card><h2 className="mb-3 text-lg font-bold wide">Monthly revenue by customer</h2><Bars label="Monthly revenue by customer" fmt={(n) => money(n)} data={[...s.customers].sort((a, b) => b.monthly - a.monthly).map((x) => ({ k: x.name.replace(' (sample)', ''), v: x.monthly }))} /></Card>
      </div>
      {c && (
        <Drawer open onClose={() => setOpen(null)} title={c.name}>
          <p className="text-steel">{c.type}, customer since {shortDate(c.since)}</p>
          <div className="mt-4 rounded-xl bg-sterile p-4"><p className="font-semibold">{c.contact}</p><p className="text-sm text-steel">{c.title}</p>
            <div className="mt-3 flex flex-wrap gap-2"><a href={`tel:${c.phone}`} className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-line bg-paper px-4 font-semibold"><Phone size={16} /> {c.phone}</a><a href={`mailto:${c.email}`} className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-line bg-paper px-4 font-semibold"><Mail size={16} /> Email</a></div></div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-steel">Monthly value</dt><dd className="num font-semibold">{money(c.monthly)}</dd></div><div><dt className="text-steel">Service level</dt><dd className="font-semibold">{c.sla}</dd></div></dl>
          <h3 className="mt-5 font-bold">Notes</h3><p className="mt-1 text-[15px]">{c.notes}</p>
          <h3 className="mt-5 font-bold">Invoices</h3>
          <ul className="mt-2 divide-y divide-line text-sm">{s.invoices.filter((i) => i.customerId === c.id).map((i) => <li key={i.id} className="flex justify-between py-2"><span>{i.number}, due {shortDate(i.due)}</span><span className="flex items-center gap-2"><span className="num font-semibold">{money(i.amount)}</span><Badge tone={i.status === 'paid' ? 'ok' : i.status === 'overdue' ? 'hot' : 'warn'}>{i.status}</Badge></span></li>)}</ul>
        </Drawer>
      )}
    </Page>
  )
}

export function priceQuote(i: QuoteInput, r: Rates) {
  const lines: [string, number][] = []
  if (i.nemt) {
    lines.push([i.nemt === 'wheelchair' ? 'Wheelchair trip base' : 'Ambulatory trip base', i.nemt === 'wheelchair' ? r.nemtWcBase : r.nemtAmbBase])
    lines.push([`${i.miles} loaded miles at ${money(r.nemtPerMile, true)}`, i.miles * r.nemtPerMile])
  } else {
    lines.push(['Base pickup', r.base])
    lines.push([`${i.miles} miles at ${money(r.perMile, true)}`, i.miles * r.perMile])
    if (i.stops > 1) lines.push([`${i.stops - 1} extra stops`, (i.stops - 1) * r.extraStop])
    if (i.temp === 'refrigerated') lines.push(['Refrigerated 2 to 8 °C', r.refrigerated])
    if (i.temp === 'frozen') lines.push(['Frozen, dry ice', r.frozen])
  }
  if (i.stat) lines.push(['STAT, within 60 minutes', r.stat])
  if (i.afterHours) lines.push(['After hours', r.afterHours])
  if (i.weekend) lines.push(['Weekend or holiday', r.weekend])
  if (i.waitMin > 0) lines.push([`Wait time, ${i.waitMin} min`, Math.ceil(i.waitMin / 15) * r.waitPer15])
  return { lines, total: Math.round(lines.reduce((a, l) => a + l[1], 0) * 100) / 100 }
}

export function Quotes() {
  const { s, dispatch, toast } = useStore()
  const [i, setI] = useState<QuoteInput>({ customer: s.customers[1].name, miles: 18, stat: true, afterHours: false, weekend: false, waitMin: 0, temp: 'refrigerated', stops: 2, nemt: false })
  const [rates, setRates] = useState(false)
  const p = useMemo(() => priceQuote(i, s.rates), [i, s.rates])
  const set = (k: keyof QuoteInput) => (e: { target: { value: string; checked?: boolean; type?: string } }) => setI({ ...i, [k]: e.target.type === 'checkbox' ? e.target.checked : ['miles', 'waitMin', 'stops'].includes(k) ? Math.max(0, +e.target.value) : e.target.value })
  return (
    <Page title="Quotes" help="quotes" sub="Price any run in seconds from your own rate card." actions={<Btn onClick={() => setRates(true)}>Edit rates</Btn>}>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Customer"><input className={inputCls} value={i.customer} onChange={set('customer')} list="cust" /><datalist id="cust">{s.customers.map((c) => <option key={c.id} value={c.name} />)}</datalist></Field>
            <Field label="Job type"><select className={inputCls} value={i.nemt || 'courier'} onChange={(e) => setI({ ...i, nemt: e.target.value === 'courier' ? false : e.target.value as 'ambulatory' | 'wheelchair' })}><option value="courier">Courier delivery</option><option value="ambulatory">NEMT ambulatory</option><option value="wheelchair">NEMT wheelchair</option></select></Field>
            <Field label="Miles"><input type="number" className={inputCls} value={i.miles} onChange={set('miles')} /></Field>
            {!i.nemt && <Field label="Stops"><input type="number" min={1} className={inputCls} value={i.stops} onChange={set('stops')} /></Field>}
            {!i.nemt && <Field label="Temperature"><select className={inputCls} value={i.temp} onChange={set('temp')}><option value="ambient">Ambient</option><option value="refrigerated">Refrigerated 2 to 8 &deg;C</option><option value="frozen">Frozen</option></select></Field>}
            <Field label="Wait time (minutes)"><input type="number" step={15} className={inputCls} value={i.waitMin} onChange={set('waitMin')} /></Field>
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            {([['stat', 'STAT'], ['afterHours', 'After hours'], ['weekend', 'Weekend or holiday']] as const).map(([k, l]) => <label key={k} className="flex min-h-[44px] items-center gap-2 font-semibold"><input type="checkbox" checked={i[k]} onChange={set(k)} className="h-5 w-5 accent-[#D42A36]" /> {l}</label>)}
          </div>
        </Card>
        <Card className="bg-night text-white">
          <p className="text-sm text-white/60">Quote for {i.customer}</p>
          <ul className="mt-3 space-y-2">{p.lines.map(([l, v]) => <li key={l} className="flex justify-between gap-3 text-[15px]"><span className="text-white/80">{l}</span><span className="num font-semibold">{money(v, true)}</span></li>)}</ul>
          <p className="mt-4 flex items-end justify-between border-t border-white/15 pt-4"><span className="text-white/70">Total</span><span className="num font-display text-4xl font-extrabold wide">{money(p.total, true)}</span></p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Btn tone="stat" onClick={() => { dispatch({ t: 'quote', q: { id: uid('Q'), createdAt: new Date().toISOString(), input: i, total: p.total, status: 'sent' } }); toast('Quote saved and marked sent (demo)') }}>Save and send</Btn>
            <Btn className="!border-white/30 !bg-transparent !text-white" onClick={() => window.print()}><Printer size={16} /> Print</Btn>
          </div>
        </Card>
      </div>
      <h2 className="mb-3 mt-8 font-display text-xl font-bold wide">Recent quotes</h2>
      {s.quotes.length === 0 ? <Empty icon={<Calculator />} title="Saved quotes appear here. Build one above and tap Save and send." /> : (
        <Card pad={false}><ul className="divide-y divide-line">{s.quotes.map((q) => <li key={q.id} className="flex flex-wrap justify-between gap-2 p-4"><span><span className="font-semibold">{q.input.customer}</span><span className="block text-sm text-steel">{q.input.nemt ? `NEMT ${q.input.nemt}` : `${q.input.stops} stops, ${q.input.temp}`}, {q.input.miles} mi{q.input.stat ? ', STAT' : ''}</span></span><span className="flex items-center gap-2"><span className="num font-semibold">{money(q.total, true)}</span><Badge tone="info">{q.status}</Badge></span></li>)}</ul></Card>
      )}
      <RateCard open={rates} onClose={() => setRates(false)} />
    </Page>
  )
}

function RateCard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { s, dispatch, toast } = useStore()
  const [r, setR] = useState(s.rates)
  const L: [keyof Rates, string][] = [['base', 'Base pickup'], ['perMile', 'Per mile'], ['extraStop', 'Extra stop'], ['stat', 'STAT surcharge'], ['afterHours', 'After hours'], ['weekend', 'Weekend'], ['waitPer15', 'Wait, per 15 min'], ['refrigerated', 'Refrigerated'], ['frozen', 'Frozen'], ['nemtAmbBase', 'NEMT ambulatory base'], ['nemtWcBase', 'NEMT wheelchair base'], ['nemtPerMile', 'NEMT per mile']]
  return (
    <Modal open={open} onClose={onClose} title="Your rate card">
      <div className="grid grid-cols-2 gap-3">{L.map(([k, l]) => <Field key={k} label={l}><input type="number" step="0.05" className={inputCls} value={r[k]} onChange={(e) => setR({ ...r, [k]: +e.target.value })} /></Field>)}</div>
      <Btn tone="primary" className="mt-4 w-full" onClick={() => { dispatch({ t: 'rates', rates: r }); toast('Rates saved. Every new quote uses them.'); onClose() }}>Save rates</Btn>
    </Modal>
  )
}

export function Invoices() {
  const { s, dispatch, toast } = useStore()
  const [print, setPrint] = useState<string | null>(null)
  const open = s.invoices.filter((i) => i.status !== 'paid')
  const overdue = s.invoices.filter((i) => i.status === 'overdue')
  const name = (id: string) => s.customers.find((c) => c.id === id)?.name || ''
  const inv = s.invoices.find((i) => i.id === print)
  const aging = [['Current', open.filter((i) => i.status === 'open')], ['1 to 30 days late', overdue.filter((i) => Date.now() - new Date(i.due).getTime() <= 30 * 864e5)], ['Over 30 days', overdue.filter((i) => Date.now() - new Date(i.due).getTime() > 30 * 864e5)]] as const
  return (
    <Page title="Invoices" help="invoices" sub="What you're owed, what's late, and what's been paid.">
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Owed to you" value={money(open.reduce((a, i) => a + i.amount, 0))} sub={`${open.length} invoices`} />
        <Stat label="Overdue" value={money(overdue.reduce((a, i) => a + i.amount, 0))} sub={`${overdue.length} invoices`} tone="hot" />
        <Stat label="Paid this month" value={money(s.invoices.filter((i) => i.status === 'paid').reduce((a, i) => a + i.amount, 0))} tone="ok" />
        <Stat label="Recurring per month" value={money(s.customers.reduce((a, c) => a + c.monthly, 0))} />
      </div>
      <Card className="mb-4"><h2 className="font-bold">Aging</h2><div className="mt-2 grid gap-3 sm:grid-cols-3">{aging.map(([l, arr]) => <div key={l} className="rounded-xl bg-sterile p-3"><p className="text-sm text-steel">{l}</p><p className="num text-xl font-bold">{money(arr.reduce((a, i) => a + i.amount, 0))}</p></div>)}</div></Card>
      {s.invoices.length === 0 ? <Empty icon={<Receipt />} title="No invoices yet." /> : (
        <Card pad={false}><ul className="divide-y divide-line">{s.invoices.map((i) => (
          <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <span className="min-w-0"><span className="font-semibold">{i.number}</span> <span className="text-steel">{name(i.customerId)}</span><span className="block text-sm text-steel">Issued {shortDate(i.issued)}, due {shortDate(i.due)}</span></span>
            <span className="flex flex-wrap items-center gap-2"><span className="num font-semibold">{money(i.amount)}</span><Badge tone={i.status === 'paid' ? 'ok' : i.status === 'overdue' ? 'hot' : 'warn'}>{i.status}</Badge>{i.status !== 'paid' && <Btn size="sm" onClick={() => { dispatch({ t: 'invoice', inv: { ...i, status: 'paid' } }); toast(`${i.number} marked paid`) }}>Mark paid</Btn>}<Btn size="sm" tone="ghost" onClick={() => setPrint(i.id)}><Printer size={14} /> View</Btn></span>
          </li>
        ))}</ul></Card>
      )}
      {inv && (
        <Drawer open onClose={() => setPrint(null)} title={`Invoice ${inv.number}`}>
          <div className="printable rounded-xl border border-line p-5">
            <div className="flex justify-between"><div><p className="font-display text-lg font-extrabold wide">{s.brain.dba}</p><p className="text-sm text-steel">{s.brain.city}, {s.brain.state} &middot; {s.brain.phone}</p></div><div className="text-right text-sm"><p className="font-semibold">Invoice {inv.number}</p><p>Issued {longDate(inv.issued)}</p><p>Due {longDate(inv.due)}</p></div></div>
            <p className="mt-5 text-sm text-steel">Bill to</p><p className="font-semibold">{name(inv.customerId)}</p>
            <table className="mt-4 w-full text-sm"><thead><tr className="border-b border-line text-left"><th className="py-2">Description</th><th className="py-2 text-right">Amount</th></tr></thead><tbody>{inv.lines.map((l) => <tr key={l.desc} className="border-b border-line/60"><td className="py-2">{l.desc}</td><td className="num py-2 text-right">{money(l.qty * l.rate, true)}</td></tr>)}</tbody><tfoot><tr><td className="pt-3 font-bold">Total</td><td className="num pt-3 text-right text-lg font-bold">{money(inv.amount, true)}</td></tr></tfoot></table>
          </div>
          <Btn className="mt-4" onClick={() => window.print()}><Printer size={16} /> Print</Btn>
        </Drawer>
      )}
    </Page>
  )
}
