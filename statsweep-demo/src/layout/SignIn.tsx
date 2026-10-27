import { useState, type FormEvent } from 'react'
import { Mark } from '@/components/Mark'
import { ROLES } from './Shell'
import type { Role } from '@/lib/types'

export function SignIn({ onEnter }: { onEnter: (r: Role) => void }) {
  const [email, setEmail] = useState('demo@bellwethermedical.example')
  const [pw, setPw] = useState('demo')
  const [role, setRole] = useState<Role>('owner')
  const go = (e: FormEvent) => { e.preventDefault(); onEnter(role) }
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-night p-10 text-white lg:flex">
        <div className="flex items-center gap-3"><Mark size={44} /><div><p className="font-display text-2xl font-extrabold wide">StatSweep</p><p className="text-sm text-white/60">presented by DataIsData</p></div></div>
        <div>
          <p className="font-display text-4xl font-extrabold leading-tight wide">The portal we build for medical couriers and NEMT operators.</p>
          <p className="mt-4 max-w-md text-lg text-white/70">You're about to step into the portal of Bellwether Medical, a fictional courier and transport company in Charlotte, North Carolina. Every screen works. Nothing you do here leaves this browser.</p>
        </div>
        <p className="text-sm text-white/50">Sample data. No real patients, solicitations or customers.</p>
      </div>
      <div className="flex items-center justify-center bg-sterile p-5">
        <form onSubmit={go} className="w-full max-w-md rounded-3xl bg-paper p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3 lg:hidden"><Mark size={40} /><p className="font-display text-xl font-extrabold wide">StatSweep demo</p></div>
          <h1 className="font-display text-2xl font-extrabold wide">Sign in to the demo</h1>
          <p className="mt-2 text-steel">Any email and password work. They're filled in for you, so you can go straight to Enter.</p>
          <label className="mt-5 block"><span className="mb-1 block text-sm font-semibold">Email</span><input className="min-h-[48px] w-full rounded-xl border border-line px-3" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" /></label>
          <label className="mt-3 block"><span className="mb-1 block text-sm font-semibold">Password</span><input type="password" className="min-h-[48px] w-full rounded-xl border border-line px-3" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="off" /></label>
          <fieldset className="mt-5">
            <legend className="mb-2 text-sm font-semibold">Pick a seat to see what that person sees</legend>
            <div className="grid gap-2">
              {ROLES.map((r) => (
                <label key={r.k} className={`flex min-h-[52px] cursor-pointer items-center gap-3 rounded-xl border px-3 ${role === r.k ? 'border-night bg-sterile' : 'border-line'}`}>
                  <input type="radio" name="role" checked={role === r.k} onChange={() => setRole(r.k)} className="h-4 w-4 accent-[#0B1F33]" />
                  <span><span className="font-semibold">{r.label}</span><span className="block text-sm text-steel">{r.who}</span></span>
                </label>
              ))}
            </div>
          </fieldset>
          <button className="mt-6 min-h-[52px] w-full rounded-xl bg-stat text-lg font-semibold text-white hover:bg-stat-dark">Enter the demo</button>
          <p className="mt-3 text-center text-sm text-steel">You can switch seats any time from the top bar.</p>
        </form>
      </div>
    </div>
  )
}
