import { useState, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Brain, Radar, Landmark, KanbanSquare, Send, Newspaper, Truck, Smartphone, Accessibility, Users, ShieldCheck, Calculator, Receipt, UserRound, FileText, Settings, MoreHorizontal, RotateCcw, LogOut, X, type LucideIcon } from 'lucide-react'
import { useStore } from '@/lib/store'
import type { Role } from '@/lib/types'
import { Mark } from '@/components/Mark'

export type NavItem = { to: string; label: string; icon: LucideIcon; roles: Role[]; group: string }
const ALL: Role[] = ['owner', 'dispatcher', 'billing']
export const NAV: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ALL, group: 'Today' },
  { to: '/opportunities', label: 'Bids and leads', icon: Landmark, roles: ['owner'], group: 'Find work' },
  { to: '/sweeps', label: 'Sweeps', icon: Radar, roles: ['owner'], group: 'Find work' },
  { to: '/pipeline', label: 'Pipeline', icon: KanbanSquare, roles: ['owner'], group: 'Find work' },
  { to: '/outreach', label: 'Outreach', icon: Send, roles: ['owner'], group: 'Find work' },
  { to: '/briefing', label: 'Weekly briefing', icon: Newspaper, roles: ['owner'], group: 'Find work' },
  { to: '/brain', label: 'Company Brain', icon: Brain, roles: ['owner'], group: 'Find work' },
  { to: '/dispatch', label: 'Dispatch', icon: Truck, roles: ['owner', 'dispatcher'], group: 'Run the work' },
  { to: '/nemt', label: 'NEMT trips', icon: Accessibility, roles: ['owner', 'dispatcher', 'billing'], group: 'Run the work' },
  { to: '/driver', label: 'Driver app', icon: Smartphone, roles: ['owner', 'dispatcher', 'driver'], group: 'Run the work' },
  { to: '/fleet', label: 'Drivers and fleet', icon: ShieldCheck, roles: ['owner', 'dispatcher'], group: 'Run the work' },
  { to: '/customers', label: 'Customers', icon: Users, roles: ALL, group: 'Money' },
  { to: '/quotes', label: 'Quotes', icon: Calculator, roles: ALL, group: 'Money' },
  { to: '/invoices', label: 'Invoices', icon: Receipt, roles: ['owner', 'billing'], group: 'Money' },
  { to: '/client', label: 'Customer portal', icon: UserRound, roles: ['owner', 'customer'], group: 'More' },
  { to: '/documents', label: 'Documents', icon: FileText, roles: ['owner'], group: 'More' },
  { to: '/settings', label: 'Settings', icon: Settings, roles: ['owner', 'dispatcher', 'billing', 'driver', 'customer'], group: 'More' },
]
export const ROLES: { k: Role; label: string; who: string }[] = [
  { k: 'owner', label: 'Owner', who: 'Denise Carter' },
  { k: 'dispatcher', label: 'Dispatcher', who: 'Luis Ramos' },
  { k: 'driver', label: 'Driver', who: 'Marcus Dean' },
  { k: 'billing', label: 'Billing', who: 'Priya Shah' },
  { k: 'customer', label: 'Customer (lab)', who: 'Dr. Paul Kim, Northside Reference Lab' },
]
export const navFor = (r: Role) => NAV.filter((n) => n.roles.includes(r))
export const homeFor = (r: Role) => r === 'driver' ? '/driver' : r === 'customer' ? '/client' : '/'

export function Shell({ children, onSignOut }: { children: ReactNode; onSignOut: () => void }) {
  const { role, setRole, dispatch, toast, toastMsg } = useStore()
  const nav = navFor(role)
  const navigate = useNavigate()
  const loc = useLocation()
  const [more, setMore] = useState(false)
  const groups = [...new Set(nav.map((n) => n.group))]
  const bottom = nav.slice(0, 4)
  const changeRole = (r: Role) => { setRole(r); navigate(homeFor(r)) }
  const reset = () => { dispatch({ t: 'reset' }); toast('Demo reset to the sample data') }
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col overflow-y-auto bg-night text-white lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-5"><Mark size={34} /><div className="leading-tight"><p className="font-display text-lg font-extrabold wide">StatSweep</p><p className="text-xs text-white/55">Bellwether Medical</p></div></div>
        <nav className="flex-1 px-3 pb-4" aria-label="Portal">
          {groups.map((g) => (
            <div key={g} className="mb-3">
              <p className="px-3 pb-1 pt-2 text-xs font-semibold text-white/45">{g}</p>
              {nav.filter((n) => n.group === g).map((n) => (
                <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => `flex min-h-[42px] items-center gap-3 rounded-xl px-3 text-[15px] ${isActive ? 'bg-white/10 font-semibold text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                  <n.icon size={18} aria-hidden="true" /> {n.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4 text-sm">
          <button onClick={reset} className="flex min-h-[40px] w-full items-center gap-2 rounded-lg px-2 text-white/70 hover:bg-white/5 hover:text-white"><RotateCcw size={16} /> Reset demo</button>
          <button onClick={onSignOut} className="flex min-h-[40px] w-full items-center gap-2 rounded-lg px-2 text-white/70 hover:bg-white/5 hover:text-white"><LogOut size={16} /> Sign out</button>
          <a href="https://statsweep.com" className="mt-1 block px-2 text-white/50 hover:text-white">Back to statsweep.com</a>
        </div>
      </aside>
      <div className="min-w-0">
        <div className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
            <div className="flex items-center gap-2 lg:hidden"><Mark size={30} /><span className="font-display font-extrabold wide">StatSweep</span></div>
            <p className="hidden text-sm text-steel lg:block">Sample data for a fictional company. Resets when you tap Reset demo.</p>
            <label className="flex items-center gap-2 text-sm"><span className="hidden text-steel sm:inline">Viewing as</span>
              <select aria-label="Switch seat" value={role} onChange={(e) => changeRole(e.target.value as Role)} className="min-h-[40px] rounded-lg border border-line bg-paper px-2 font-semibold">
                {ROLES.map((r) => <option key={r.k} value={r.k}>{r.label}</option>)}
              </select>
            </label>
          </div>
          <p className="bg-carbon px-4 py-1 text-center text-xs font-semibold text-ink lg:hidden">Sample data. Fictional company.</p>
        </div>
        <div key={loc.pathname}>{children}</div>
      </div>
      {/* mobile bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-line bg-paper lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} aria-label="Portal mobile">
        {bottom.map((n) => <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => `flex min-h-[58px] flex-col items-center justify-center gap-0.5 text-[11px] ${isActive ? 'font-bold text-night' : 'text-steel'}`}><n.icon size={20} />{n.label.split(' ')[0]}</NavLink>)}
        <button onClick={() => setMore(true)} className="flex min-h-[58px] flex-col items-center justify-center gap-0.5 text-[11px] text-steel"><MoreHorizontal size={20} />More</button>
      </nav>
      {more && (
        <div className="fixed inset-0 z-[60] bg-night/50 lg:hidden" onClick={() => setMore(false)}>
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-paper p-4" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="More">
            <div className="flex items-center justify-between"><p className="font-display text-lg font-bold wide">Everything</p><button onClick={() => setMore(false)} className="grid h-11 w-11 place-items-center" aria-label="Close"><X /></button></div>
            <div className="mt-2 grid grid-cols-2 gap-2">{nav.map((n) => <NavLink key={n.to} to={n.to} end={n.to === '/'} onClick={() => setMore(false)} className="flex min-h-[52px] items-center gap-2.5 rounded-xl border border-line px-3 text-sm font-semibold"><n.icon size={18} className="text-cryo-dark" />{n.label}</NavLink>)}</div>
            <div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => { reset(); setMore(false) }} className="min-h-[48px] rounded-xl border border-line text-sm font-semibold">Reset demo</button><button onClick={onSignOut} className="min-h-[48px] rounded-xl border border-line text-sm font-semibold">Sign out</button></div>
          </div>
        </div>
      )}
      {toastMsg && <div role="status" className="fixed bottom-20 left-1/2 z-[90] -translate-x-1/2 rounded-xl bg-night px-4 py-3 text-sm font-semibold text-white shadow-xl lg:bottom-6">{toastMsg}</div>}
    </div>
  )
}
