import { useEffect, useRef, useState, type ReactNode, type ButtonHTMLAttributes } from 'react'
import { X, Info } from 'lucide-react'
import { HELP } from '@/lib/help'

export function Btn({ tone = 'default', size = 'md', className = '', ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'default' | 'primary' | 'stat' | 'ghost' | 'danger'; size?: 'sm' | 'md' }) {
  const t = { default: 'border border-line bg-paper text-night hover:bg-sterile', primary: 'bg-night text-white hover:bg-night-2', stat: 'bg-stat text-white hover:bg-stat-dark', ghost: 'text-cryo-dark hover:bg-cryo-wash', danger: 'border border-stat/40 text-stat-dark hover:bg-stat-wash' }[tone]
  const s = size === 'sm' ? 'min-h-[36px] px-3 text-sm' : 'min-h-[44px] px-4'
  return <button {...p} className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${t} ${s} ${className}`} />
}

export function Badge({ tone = 'muted', children, className = '' }: { tone?: 'muted' | 'ok' | 'warn' | 'hot' | 'info' | 'new' | 'dark'; children: ReactNode; className?: string }) {
  const t = { muted: 'bg-sterile text-steel border-line', ok: 'bg-[#E5F3EB] text-ok border-[#BFE0CC]', warn: 'bg-[#FBF1DE] text-warn border-[#EFD7A8]', hot: 'bg-stat-wash text-stat-dark border-[#F4C3C7]', info: 'bg-cryo-wash text-cryo-dark border-[#BFE3E3]', new: 'bg-night text-cryo-bright border-night', dark: 'bg-night text-white border-night' }[tone]
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-semibold ${t} ${className}`}>{children}</span>
}

export function FitBadge({ score, disq }: { score: number; disq?: string }) {
  if (disq) return <span className="num inline-grid h-9 w-12 place-items-center rounded-lg bg-sterile text-xs font-bold text-steel" title={disq}>No-go</span>
  const c = score >= 80 ? 'bg-night text-cryo-bright' : score >= 60 ? 'bg-cryo-wash text-cryo-dark' : 'bg-sterile text-steel'
  return <span className={`num inline-grid h-9 w-12 place-items-center rounded-lg font-display text-lg font-extrabold ${c}`} title="Fit score">{score}</span>
}

export function Card({ children, className = '', pad = true }: { children: ReactNode; className?: string; pad?: boolean }) {
  return <section className={`min-w-0 rounded-2xl border border-line ${/\bbg-/.test(className) ? '' : 'bg-paper'} ${pad ? 'p-4 sm:p-5' : ''} ${className}`}>{children}</section>
}

export function useFocusTrap(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const el = ref.current; el?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key !== 'Tab' || !el) return
      const f = [...el.querySelectorAll<HTMLElement>('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter((x) => !x.hasAttribute('disabled'))
      if (!f.length) return
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus() }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); prev?.focus() }
  }, [open, onClose])
  return ref
}

export function Drawer({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; wide?: boolean }) {
  const ref = useFocusTrap(open, onClose)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-night/40" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" className={`flex h-full w-full flex-col bg-paper shadow-2xl outline-none ${wide ? 'max-w-3xl' : 'max-w-xl'}`}>
        <header className="flex items-start justify-between gap-3 border-b border-line p-4 sm:p-5"><div className="min-w-0 font-display text-lg font-bold leading-snug text-night wide">{title}</div><button onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg hover:bg-sterile" aria-label="Close"><X size={20} /></button></header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">{children}</div>
      </div>
    </div>
  )
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useFocusTrap(open, onClose)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-night/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-paper p-5 outline-none">
        <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold wide">{title}</h2><button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-lg hover:bg-sterile" aria-label="Close"><X size={20} /></button></div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

export function Empty({ icon, title, action }: { icon: ReactNode; title: string; action?: ReactNode }) {
  return <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-paper px-6 py-10 text-center"><span className="grid h-12 w-12 place-items-center rounded-full bg-cryo-wash text-cryo-dark">{icon}</span><p className="max-w-sm text-steel">{title}</p>{action}</div>
}

export function Page({ title, sub, help, actions, children }: { title: string; sub?: string; help?: keyof typeof HELP; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl overflow-x-clip px-4 pb-28 pt-5 sm:px-6 lg:pb-12">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2"><h1 className="font-display text-2xl font-extrabold text-night wide sm:text-3xl">{title}</h1>{help && <HelpButton k={help} />}</div>
          {sub && <p className="mt-1 max-w-2xl text-steel">{sub}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </header>
      {children}
    </div>
  )
}

export function HelpButton({ k }: { k: keyof typeof HELP }) {
  const [open, setOpen] = useState(false)
  const h = HELP[k]
  return (
    <>
      <button onClick={() => setOpen(true)} className="grid h-9 w-9 place-items-center rounded-full text-cryo-dark hover:bg-cryo-wash" aria-label={`What you can do on ${h.title}`}><Info size={19} /></button>
      <Modal open={open} onClose={() => setOpen(false)} title={h.title}>
        <ul className="space-y-2.5">{h.items.map((x) => <li key={x} className="flex gap-2.5 text-[15px] leading-relaxed"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cryo" />{x}</li>)}</ul>
      </Modal>
    </>
  )
}

export function Stat({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: 'hot' | 'ok' }) {
  return <div className="rounded-2xl border border-line bg-paper p-4"><p className="text-sm text-steel">{label}</p><p className={`num mt-1 font-display text-3xl font-extrabold wide ${tone === 'hot' ? 'text-stat' : tone === 'ok' ? 'text-ok' : 'text-night'}`}>{value}</p>{sub && <p className="mt-1 text-sm text-steel">{sub}</p>}</div>
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="block"><span className="mb-1 block text-sm font-semibold text-night">{label}</span>{children}{hint && <span className="mt-1 block text-xs text-steel">{hint}</span>}</label>
}
export const inputCls = 'min-h-[44px] w-full rounded-xl border border-line bg-paper px-3 text-[15px] text-ink focus:border-cryo focus:outline-none focus:ring-2 focus:ring-cryo-bright/40'

/** Signature pad on canvas (demo e-signature for proof of delivery). */
export function SignaturePad({ onDone }: { onDone: (dataUrl: string) => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false); const [has, setHas] = useState(false)
  useEffect(() => { const c = ref.current!; const r = c.getBoundingClientRect(); c.width = r.width * 2; c.height = r.height * 2; const g = c.getContext('2d')!; g.scale(2, 2); g.lineWidth = 2.4; g.lineCap = 'round'; g.strokeStyle = '#0B1F33' }, [])
  const pos = (e: React.PointerEvent) => { const r = ref.current!.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] }
  return (
    <div>
      <canvas ref={ref} className="h-36 w-full touch-none rounded-xl border-2 border-dashed border-line bg-sterile" aria-label="Signature area"
        onPointerDown={(e) => { drawing.current = true; const g = ref.current!.getContext('2d')!; const [x, y] = pos(e); g.beginPath(); g.moveTo(x, y); ref.current!.setPointerCapture(e.pointerId) }}
        onPointerMove={(e) => { if (!drawing.current) return; const g = ref.current!.getContext('2d')!; const [x, y] = pos(e); g.lineTo(x, y); g.stroke(); setHas(true) }}
        onPointerUp={() => { drawing.current = false }} />
      <div className="mt-2 flex gap-2">
        <Btn size="sm" onClick={() => { const c = ref.current!; c.getContext('2d')!.clearRect(0, 0, c.width, c.height); setHas(false) }}>Clear</Btn>
        <Btn size="sm" tone="primary" disabled={!has} onClick={() => onDone(ref.current!.toDataURL('image/png'))}>Save signature</Btn>
      </div>
    </div>
  )
}

/** Plain SVG bar chart with direct labels and a table view toggle. */
export function Bars({ data, label, fmt }: { data: { k: string; v: number }[]; label: string; fmt: (n: number) => string }) {
  const [table, setTable] = useState(false)
  const max = Math.max(1, ...data.map((d) => d.v))
  return (
    <div>
      <div className="mb-2 flex justify-end"><button className="text-sm font-semibold text-cryo-dark hover:underline" onClick={() => setTable(!table)}>{table ? 'Show chart' : 'Show table'}</button></div>
      {table ? (
        <table className="w-full text-sm"><caption className="sr-only">{label}</caption><tbody>{data.map((d) => <tr key={d.k} className="border-b border-line"><td className="py-2">{d.k}</td><td className="num py-2 text-right font-semibold">{fmt(d.v)}</td></tr>)}</tbody></table>
      ) : (
        <div role="img" aria-label={label} className="space-y-2.5">
          {data.map((d) => (
            <div key={d.k} className="grid grid-cols-[minmax(90px,150px)_1fr_auto] items-center gap-3 text-sm">
              <span className="truncate text-steel" title={d.k}>{d.k}</span>
              <span className="h-3 rounded-full bg-sterile"><span className="block h-3 rounded-full bg-cryo" style={{ width: `${(d.v / max) * 100}%` }} /></span>
              <span className="num font-semibold">{fmt(d.v)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
