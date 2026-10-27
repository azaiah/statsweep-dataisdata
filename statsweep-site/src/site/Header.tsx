import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { site } from '@/config/site'

const nav = [
  ['#how', 'How it works'],
  ['#portal', 'What you get'],
  ['#proof', 'Proof'],
  ['#pricing', 'Pricing'],
  ['#faq', 'FAQ'],
] as const

export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => { const f = () => setScrolled(window.scrollY > 24); f(); window.addEventListener('scroll', f, { passive: true }); return () => window.removeEventListener('scroll', f) }, [])
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [open])
  return (
    <>
      <header className={`sticky top-0 z-50 transition-colors ${scrolled ? 'bg-night/95 backdrop-blur shadow-[0_1px_0_rgba(255,255,255,.08)]' : 'bg-night'}`}>
        <div className="wrap flex h-[68px] items-center justify-between gap-4">
          <Link to="/" aria-label="StatSweep home"><Logo dark /></Link>
          <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
            {nav.map(([h, l]) => <a key={h} href={'/' + h} className="text-[15px] font-medium text-white/75 hover:text-white">{l}</a>)}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <a href={site.demoUrl} className="text-[15px] font-semibold text-cryo-bright hover:text-white">Open the live demo</a>
            <a href="/#book" className="btn-stat min-h-[44px]">Book a 15-minute call</a>
          </div>
          <button className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-white lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu /></button>
        </div>
      </header>
      {open && (
        <div className="fixed inset-0 z-[60] bg-night text-white lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="wrap flex h-[68px] items-center justify-between"><Logo dark /><button className="inline-flex h-11 w-11 items-center justify-center" onClick={() => setOpen(false)} aria-label="Close menu"><X /></button></div>
          <nav className="wrap mt-4 flex flex-col" aria-label="Mobile">
            {nav.map(([h, l]) => <a key={h} href={'/' + h} onClick={() => setOpen(false)} className="border-b border-white/10 py-4 font-display text-2xl font-bold wide">{l}</a>)}
            <a href={site.demoUrl} className="py-4 text-lg font-semibold text-cryo-bright">Open the live demo</a>
            <a href="/#book" onClick={() => setOpen(false)} className="btn-stat mt-2">Book a 15-minute call</a>
          </nav>
        </div>
      )}
      {/* sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-white/10 bg-night/95 p-3 backdrop-blur lg:hidden" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <a href={site.demoUrl} className="btn-ghost-dark flex-1 px-3 text-sm">Live demo</a>
        <a href="/#book" className="btn-stat flex-[1.4] px-3 text-sm">Book a call</a>
      </div>
    </>
  )
}
