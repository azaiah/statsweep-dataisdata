/**
 * Single source of truth for every business detail on the StatSweep site.
 * Anything not yet confirmed carries a "TODO: confirm" comment. Search for it before launch.
 */

export const site = {
  name: 'StatSweep',
  presentedBy: 'DataIsData',
  presentedByUrl: 'https://dataisdata.com', // TODO: confirm DataIsData's public URL
  tagline: 'Your next route contract is already posted.',
  domain: 'https://statsweep.com', // statsweep.com was unregistered on 2026-10-27: buy it before launch
  demoUrl: 'https://demo.statsweep.com', // TODO: point at the Netlify URL of statsweep-demo until the subdomain is connected
  email: 'hello@statsweep.com', // TODO: confirm (set up forwarding to azaiah@dataisdata.com)
  phone: '', // TODO: add a sales line; the header hides the phone link while this is empty
  phoneHref: '',
  hours: 'Mon to Fri, 8:00 AM to 6:00 PM ET', // TODO: confirm
  serviceArea: 'Independent medical couriers and NEMT operators in all 50 states',
  consultationFormName: 'consultation',
  monthlyIntake: 6, // TODO: confirm the real number of new companies onboarded per month (honest scarcity)
} as const

export type Tier = {
  id: 'contract' | 'route' | 'launch'
  name: string
  setup: number // TODO: confirm with Tony
  monthly: number // TODO: confirm with Tony
  cadence: string
  for: string
  seats: string
  highlight?: string
  features: string[]
}

/** Highest tier first on purpose: it anchors the price of the other two. */
export const tiers: Tier[] = [
  {
    id: 'contract',
    name: 'Contract Ready',
    setup: 4997,
    monthly: 497,
    cadence: 'Sweeps every weekday morning',
    for: 'Couriers and NEMT fleets chasing hospital, state, federal and broker contracts',
    seats: 'Unlimited seats',
    features: [
      'Everything in Route',
      'Daily bid and lead sweeps, Monday to Friday',
      'Two bids or broker applications prepared with you, start to submission',
      'Capability statement, SAM.gov and state vendor registration support',
      'Broker-Ready Packet for the NEMT brokers that cover your state',
      'Outreach drafted to 50 labs, pharmacies and clinics in your radius',
      'Customer portal on your own domain',
      'Quarterly strategy call',
    ],
  },
  {
    id: 'route',
    name: 'Route',
    setup: 1997,
    monthly: 297,
    cadence: 'Sweeps Monday, Wednesday and Friday',
    for: 'Growing courier and transport companies with 3 to 25 vehicles',
    seats: '10 seats',
    highlight: 'Most operators start here',
    features: [
      'Website built for healthcare buyers, with an online pickup request',
      'Three sweeps a week, with an outreach draft for every find',
      'Dispatch board, driver app, chain of custody and proof of delivery',
      'Driver and vehicle compliance vault with expiry alerts',
      'Broker trip import and reconciliation',
      'Quotes, invoices and aging',
      'CRM, pipeline and weekly briefing',
    ],
  },
  {
    id: 'launch',
    name: 'Launch',
    setup: 997,
    monthly: 147,
    cadence: 'One sweep a week, with a digest',
    for: 'Owner-operators getting their first contracts on paper',
    seats: '2 seats',
    features: [
      'Website built for healthcare buyers',
      'Company Brain: your credentials, vehicles, insurance and service area',
      'Weekly sweep and digest of bids and leads',
      'CRM and quotes',
    ],
  },
]

export const tierNotes = [
  'Pay a year up front and get two months free.', // TODO: confirm
  'Setup fees credit toward an upgrade within 12 months, so starting small costs nothing later.', // TODO: confirm
  'Prices in USD. Month to month after setup. You own your website content and your data.',
]

/** Hormozi value stack: what each piece would cost to hire out on its own. Estimates, labelled as such on the page. */
export const valueStack = [
  { item: 'A healthcare-grade website with credentials wall, service-area pages and pickup request', value: 4500 },
  { item: 'A researcher checking bid portals, broker networks and local labs 5 hours a week', value: 6500 },
  { item: 'Outreach written for every find: email, call script, text and follow-ups', value: 2400 },
  { item: 'Dispatch, chain-of-custody, proof-of-delivery and driver app software for a year', value: 3600 },
  { item: 'Capability statement and vendor registrations', value: 1500 },
  { item: 'Broker-Ready Packet: credentialing checklist filled in with your details', value: 1200 },
] as const

export const guarantees = [
  { title: 'Ten in thirty', text: 'In your first 30 days the sweep surfaces at least 10 opportunities you qualify for inside your service area. If it doesn’t, we keep sweeping and your next month is free.' }, // TODO: confirm with Tony
  { title: 'Live in 21 days', text: 'Website and portal live within 21 days of the kickoff call and your documents in hand, or your first month is free.' }, // TODO: confirm with Tony
  { title: 'Nothing goes out without you', text: 'Every email, text and application waits for your approval. The engine drafts. You decide.' },
]

export const setupTimeline = [
  { when: 'Day 1', title: 'Kickoff', text: 'A 45-minute call. We fill in your Company Brain together: what you haul, your vehicles, certifications, insurance, service radius.' },
  { when: 'Days 2 to 14', title: 'Build', text: 'We build the website and configure the portal around your routes, drivers and customers. The first sweep runs.' },
  { when: 'Days 15 to 21', title: 'Load and train', text: 'Customers, drivers and their paperwork go in. Your team gets a walkthrough. Outreach drafts are waiting for your OK.' },
]
