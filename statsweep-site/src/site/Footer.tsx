import { Link } from 'react-router-dom'
import { Logo, DataIsDataBadge } from '@/components/Logo'
import { site } from '@/config/site'

export function Footer() {
  return (
    <footer className="bg-night pb-28 pt-14 text-white lg:pb-14">
      <div className="wrap grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo dark />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">Websites, business portals and a weekly bid and lead engine for independent medical couriers and NEMT operators.</p>
          <div className="mt-5"><DataIsDataBadge /></div>
        </div>
        <div>
          <p className="font-display text-sm font-bold text-white wide">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li><a href="/#how" className="hover:text-white">How it works</a></li>
            <li><a href="/#portal" className="hover:text-white">What you get</a></li>
            <li><a href="/#pricing" className="hover:text-white">Pricing</a></li>
            <li><a href={site.demoUrl} className="hover:text-white">Live demo</a></li>
          </ul>
        </div>
        <div>
          <p className="font-display text-sm font-bold text-white wide">Talk to us</p>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li><a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a></li>
            {site.phone && <li><a href={site.phoneHref} className="hover:text-white">{site.phone}</a></li>}
            <li>{site.hours}</li>
            <li className="pt-2"><Link to="/privacy" className="hover:text-white">Privacy</Link> <span className="text-white/30">/</span> <Link to="/terms" className="hover:text-white">Terms</Link></li>
          </ul>
        </div>
      </div>
      <p className="wrap mt-12 text-xs text-white/45">&copy; {new Date().getFullYear()} DataIsData. StatSweep is a DataIsData service. Broker, agency and portal names on this site describe where we look for opportunities; they are not partners or endorsements.</p>
    </footer>
  )
}
