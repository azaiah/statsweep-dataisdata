import { useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { StoreProvider, useStore } from '@/lib/store'
import { Shell, homeFor, navFor } from '@/layout/Shell'
import { SignIn } from '@/layout/SignIn'
import { BrainPage, Opportunities, Sweeps, Pipeline, OutreachPage, Briefing } from '@/modules/Engine'
import { Dispatch, DriverApp, Nemt, Fleet } from '@/modules/Ops'
import { Customers, Quotes, Invoices } from '@/modules/Money'
import { Dashboard, ClientPortal, Documents, SettingsPage, Tour } from '@/modules/More'
import type { Role } from '@/lib/types'

const PAGES: Record<string, JSX.Element> = {
  '/': <Dashboard />, '/brain': <BrainPage />, '/opportunities': <Opportunities />, '/sweeps': <Sweeps />, '/pipeline': <Pipeline />, '/outreach': <OutreachPage />, '/briefing': <Briefing />,
  '/dispatch': <Dispatch />, '/driver': <DriverApp />, '/nemt': <Nemt />, '/fleet': <Fleet />, '/customers': <Customers />, '/quotes': <Quotes />, '/invoices': <Invoices />,
  '/client': <ClientPortal />, '/documents': <Documents />, '/settings': <SettingsPage />,
}

function Inner() {
  const { role, setRole } = useStore()
  const navigate = useNavigate()
  const [signed, setSigned] = useState(() => { try { return sessionStorage.getItem('statsweep-in') === '1' } catch { return false } })
  const enter = (r: Role) => { setRole(r); setSigned(true); try { sessionStorage.setItem('statsweep-in', '1') } catch { /* ignore */ } navigate(homeFor(r)) }
  const out = () => { setSigned(false); try { sessionStorage.removeItem('statsweep-in') } catch { /* ignore */ } navigate('/') }
  if (!signed) return <SignIn onEnter={enter} />
  const allowed = navFor(role).map((n) => n.to)
  return (
    <Shell onSignOut={out}>
      <Routes>
        {Object.entries(PAGES).map(([p, el]) => <Route key={p} path={p} element={allowed.includes(p) ? el : <Navigate to={homeFor(role)} replace />} />)}
        <Route path="*" element={<Navigate to={homeFor(role)} replace />} />
      </Routes>
      {role === 'owner' && <Tour />}
    </Shell>
  )
}

export default function App() { return <StoreProvider><Inner /></StoreProvider> }
