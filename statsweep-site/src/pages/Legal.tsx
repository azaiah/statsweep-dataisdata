import { useEffect, type ReactNode } from 'react'
import { site } from '@/config/site'

function Page({ title, children }: { title: string; children: ReactNode }) {
  useEffect(() => { document.title = `${title} | StatSweep` }, [title])
  return (
    <div className="wrap max-w-3xl py-14 sm:py-20">
      <p className="rounded-lg bg-carbon px-4 py-2 text-sm">Starter text, to be reviewed by counsel before launch.</p>
      <h1 className="display mt-6 text-4xl sm:text-5xl">{title}</h1>
      <div className="mt-8 space-y-5 leading-relaxed text-steel [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-night">{children}</div>
    </div>
  )
}

export function Privacy() {
  return (
    <Page title="Privacy policy">
      <p>Last updated October 27, 2026. StatSweep is a service of DataIsData. This policy covers statsweep.com and the consultation form on it.</p>
      <h2>What we collect</h2>
      <p>When you request a call we collect the details you type: name, company, phone, email, service area and your message. Our host records standard server logs (IP address, browser, pages requested) for security.</p>
      <h2>How we use it</h2>
      <p>To contact you about StatSweep, run the sample sweep you asked for, and improve the site. We do not sell or rent your information.</p>
      <h2>Client portals</h2>
      <p>Data inside a client's StatSweep portal belongs to that client and is governed by our service agreement with them, including any business associate agreement.</p>
      <h2>Your choices</h2>
      <p>Ask us to see, correct or delete what we hold about you at <a className="text-cryo underline" href={`mailto:${site.email}`}>{site.email}</a>.</p>
    </Page>
  )
}

export function Terms() {
  return (
    <Page title="Terms of service">
      <p>Last updated October 27, 2026. These terms govern your use of statsweep.com, a website operated by DataIsData.</p>
      <h2>Information on this site</h2>
      <p>Opportunity examples on this site and in the demo are samples. Figures from our first client are estimates recorded in that client's portal and are not a promise of results.</p>
      <h2>Services</h2>
      <p>Paid StatSweep services are provided under a separate written agreement, which controls if it conflicts with these terms.</p>
      <h2>Third-party names</h2>
      <p>Names of agencies, brokers, portals and companies describe public sources we search. They are not partners and do not endorse StatSweep.</p>
      <h2>Contact</h2>
      <p><a className="text-cryo underline" href={`mailto:${site.email}`}>{site.email}</a></p>
    </Page>
  )
}
