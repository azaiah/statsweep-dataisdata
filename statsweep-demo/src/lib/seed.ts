// Sample data for the StatSweep demo. Every company, person and solicitation here is fictional.
// Dates are computed at runtime relative to "today" so the demo always looks current.
import type { State, Opportunity, Brain, Sweep, Run, Trip, Driver, Vehicle, Customer, Invoice, Outreach, Rates } from './types'

const DAY = 864e5
export const iso = (d: Date) => d.toISOString()
export const daysFrom = (n: number, h = 9, m = 0) => { const d = new Date(); d.setDate(d.getDate() + n); d.setHours(h, m, 0, 0); return d }
export const dateOnly = (n: number) => daysFrom(n).toISOString().slice(0, 10)
const at = (h: number, m = 0) => { const d = new Date(); d.setHours(h, m, 0, 0); return d.toISOString() }

export const brain: Brain = {
  company: 'Bellwether Medical Courier & Transport LLC',
  dba: 'Bellwether Medical',
  city: 'Charlotte',
  state: 'NC',
  founded: 2021,
  owner: 'Denise Carter',
  phone: '(704) 555-0148',
  email: 'dispatch@bellwethermedical.example',
  website: 'bellwethermedical.example',
  radiusMi: 60,
  counties: ['Mecklenburg', 'Cabarrus', 'Gaston', 'Union', 'Iredell', 'Lincoln', 'York (SC)', 'Lancaster (SC)'],
  services: ['specimens', 'pharmacy', 'supplies', 'records', 'nemt-ambulatory', 'nemt-wheelchair'],
  temps: { refrigerated: true, frozen: false },
  certs: ['HIPAA', 'OSHA BBP', 'DOT HazMat (UN3373)', 'CPR / First Aid', 'Wheelchair securement', 'Defensive driving'],
  setAsides: ['Small business', 'MBE / HUB'],
  insurance: { autoLiability: 1000000, generalPerOcc: 1000000, generalAgg: 2000000, cargo: 100000, workersComp: true, abuseMolestation: false },
  fleet: { sedans: 3, cargoVans: 2, refrigeratedVans: 2, wheelchairVans: 2, stretcherVans: 0 },
  drivers: 9,
  registrations: [
    { name: 'SAM.gov', id: 'UEI K7Q2MBN4WX19 (sample)', status: 'Active' },
    { name: 'NC electronic Vendor Portal', id: 'Vendor 30100xxxx (sample)', status: 'Active' },
    { name: 'NC HUB certification', id: 'MBE (sample)', status: 'Active' },
    { name: 'NC Medicaid NEMT provider enrollment', id: 'NPI on file (sample)', status: 'In progress' },
    { name: 'SC Business Opportunities vendor', id: '', status: 'Not started' },
  ],
  naics: ['492110 Couriers and express delivery', '492210 Local messengers and local delivery', '485991 Special needs transportation'],
  differentiators: ['Two refrigerated vans with continuous 2 to 8 °C logging', 'Every driver HIPAA and bloodborne-pathogen trained', 'STAT response inside 60 minutes across Mecklenburg', 'Wheelchair-accessible vans with trained securement'],
}

export const rates: Rates = { base: 28, perMile: 1.85, extraStop: 9, stat: 45, afterHours: 35, weekend: 40, waitPer15: 12, refrigerated: 22, frozen: 38, nemtAmbBase: 32, nemtWcBase: 58, nemtPerMile: 2.6 }

type O = Omit<Opportunity, 'stage' | 'foundAt' | 'sweepId'> & { daysAgo: number; sweep: string; stage?: Opportunity['stage'] }
const raw: O[] = [
  { id: 'OPP-101', kind: 'bid', title: 'Courier services for laboratory specimens and pharmacy, VA medical center and 3 outpatient clinics', org: 'VA medical center (sample)', source: 'SAM.gov', sourceUrl: 'https://sam.gov', city: 'Salisbury', state: 'NC', distanceMi: 44, value: 186000, due: dateOnly(12), preBid: dateOnly(4), summary: 'Recurring scheduled routes 6 days a week plus STAT calls, refrigerated transport for specimens, chain-of-custody documentation required. Set aside for small business.', req: { services: ['specimens', 'pharmacy'], temp: 'refrigerated', certs: ['HIPAA', 'OSHA BBP', 'DOT HazMat (UN3373)'], autoLiability: 1000000, setAside: 'Small business', vehicles: 4 }, contactRole: 'Contracting officer', daysAgo: 1, sweep: 'S-12', stage: 'qualified' },
  { id: 'OPP-102', kind: 'bid', title: 'Statewide courier services IFB, Region 4 (Charlotte metro) interagency mail and lab samples', org: 'State Department of Administration (sample)', source: 'NC eVP', sourceUrl: 'https://evp.nc.gov', city: 'Charlotte', state: 'NC', distanceMi: 6, value: 92000, due: dateOnly(9), summary: 'Daily scheduled pickups at 31 state offices and the regional public health lab. HUB participation goals apply.', req: { services: ['specimens', 'records'], certs: ['HIPAA'], autoLiability: 1000000, setAside: 'MBE / HUB', vehicles: 3 }, contactRole: 'Procurement specialist', daysAgo: 3, sweep: 'S-11' },
  { id: 'OPP-103', kind: 'bid', title: 'Courier for county public health clinics, specimen and vaccine transport', org: 'County health department (sample)', source: 'County procurement', sourceUrl: 'https://www.mecknc.gov', city: 'Charlotte', state: 'NC', distanceMi: 4, value: 48000, due: dateOnly(6), summary: 'Twice-daily runs between 5 clinic sites and the county lab, vaccine cold-chain at 2 to 8 °C with logger data.', req: { services: ['specimens', 'pharmacy'], temp: 'refrigerated', certs: ['HIPAA', 'OSHA BBP'], vehicles: 2 }, contactRole: 'Purchasing agent', daysAgo: 1, sweep: 'S-12' },
  { id: 'OPP-104', kind: 'bid', title: 'Frozen specimen transport, university research biorepository', org: 'State university research park (sample)', source: 'State procurement', sourceUrl: 'https://evp.nc.gov', city: 'Kannapolis', state: 'NC', distanceMi: 27, value: 38000, due: dateOnly(15), summary: 'Dry-ice frozen shipments between research sites, IATA-trained handlers required for air handoffs.', req: { services: ['specimens'], temp: 'frozen', certs: ['IATA DGR', 'DOT HazMat (UN3373)'] }, contactRole: 'Biorepository manager', daysAgo: 5, sweep: 'S-11' },
  { id: 'OPP-105', kind: 'bid', title: 'Paratransit and NEMT overflow trips, city transit agency', org: 'City transit agency (sample)', source: 'City procurement', sourceUrl: 'https://charlottenc.gov', city: 'Charlotte', state: 'NC', distanceMi: 3, value: 140000, due: dateOnly(21), summary: 'Overflow ADA paratransit trips with wheelchair-accessible vehicles. DBE goal 12 percent. Abuse and molestation coverage required.', req: { services: ['nemt-ambulatory', 'nemt-wheelchair'], certs: ['CPR / First Aid', 'Wheelchair securement'], abuseMolestation: true, wheelchairVans: 4, autoLiability: 1500000 }, contactRole: 'Contract administrator', daysAgo: 2, sweep: 'S-12' },
  { id: 'OPP-106', kind: 'broker', title: 'Provider network open for wheelchair trips in 3 counties', org: 'Regional NEMT broker (sample)', source: 'Broker provider page', sourceUrl: 'https://medicaid.ncdhhs.gov', city: 'Gastonia', state: 'NC', distanceMi: 22, value: 76000, summary: 'Broker reports a shortage of wheelchair capacity in Gaston, Lincoln and Cleveland counties and is credentialing new providers.', req: { services: ['nemt-wheelchair'], certs: ['CPR / First Aid', 'Wheelchair securement', 'Defensive driving'], abuseMolestation: true, wheelchairVans: 2 }, contactRole: 'Network development manager', daysAgo: 1, sweep: 'S-12', stage: 'contacted' },
  { id: 'OPP-107', kind: 'broker', title: 'Medicaid plan transportation vendor enrollment, South Carolina border counties', org: 'Medicaid managed care plan (sample)', source: 'Plan provider page', sourceUrl: 'https://www.scdhhs.gov', city: 'Rock Hill', state: 'SC', distanceMi: 26, value: 54000, summary: 'Plan is adding ambulatory and wheelchair vendors in York and Lancaster counties for dialysis standing orders.', req: { services: ['nemt-ambulatory', 'nemt-wheelchair'], certs: ['CPR / First Aid'], wheelchairVans: 1 }, contactRole: 'Provider relations', daysAgo: 8, sweep: 'S-10' },
  { id: 'OPP-108', kind: 'lead', title: 'Reference lab opening 6 patient service centers, needs a daily route', org: 'Piedmont Diagnostic Laboratories (sample)', source: 'Organization website', sourceUrl: 'https://example.com', city: 'Huntersville', state: 'NC', distanceMi: 14, value: 64000, summary: 'Their careers and locations pages list six new draw sites opening this quarter, feeding the Huntersville core lab. No courier vendor named.', req: { services: ['specimens'], certs: ['HIPAA', 'OSHA BBP'], vehicles: 2 }, contactRole: 'Director of lab operations', daysAgo: 1, sweep: 'S-12', stage: 'meeting' },
  { id: 'OPP-109', kind: 'lead', title: 'LTC pharmacy cycle-fill and STAT deliveries to 22 facilities', org: 'Carolina Long-Term Care Pharmacy (sample)', source: 'Organization website', sourceUrl: 'https://example.com', city: 'Concord', state: 'NC', distanceMi: 21, value: 82000, summary: 'Serves 22 skilled nursing and assisted living facilities. Currently uses an in-house driver and a national gig platform for overflow.', req: { services: ['pharmacy'], certs: ['HIPAA'], vehicles: 2 }, contactRole: 'Pharmacy operations manager', daysAgo: 3, sweep: 'S-11' },
  { id: 'OPP-110', kind: 'lead', title: 'Home infusion pharmacy, refrigerated patient deliveries', org: 'Queen City Infusion (sample)', source: 'Organization website', sourceUrl: 'https://example.com', city: 'Charlotte', state: 'NC', distanceMi: 7, value: 41000, summary: 'Refrigerated deliveries to patient homes, evening and weekend windows. Temperature documentation required by their accreditor.', req: { services: ['pharmacy'], temp: 'refrigerated', certs: ['HIPAA', 'Chemo / hazardous drug handling'] }, contactRole: 'Director of pharmacy', daysAgo: 5, sweep: 'S-11' },
  { id: 'OPP-111', kind: 'lead', title: 'Independent dialysis group, monthly lab draws across 5 clinics', org: 'Southern Piedmont Kidney Care (sample)', source: 'Organization website', sourceUrl: 'https://example.com', city: 'Monroe', state: 'NC', distanceMi: 25, value: 26000, summary: 'Five clinics drawing labs on fixed monthly cycles, plus patient transport demand for 3 of the clinics.', req: { services: ['specimens', 'nemt-wheelchair'], certs: ['HIPAA', 'OSHA BBP'] }, contactRole: 'Clinic administrator', daysAgo: 8, sweep: 'S-10' },
  { id: 'OPP-112', kind: 'lead', title: 'Multi-site orthopedic group, inter-office records and supply runs', org: 'Lakeside Orthopedic Partners (sample)', source: 'Organization website', sourceUrl: 'https://example.com', city: 'Mooresville', state: 'NC', distanceMi: 29, value: 22000, summary: 'Eight offices and an ambulatory surgery center. Instrument trays and imaging media move daily.', req: { services: ['supplies', 'records'], certs: ['HIPAA'] }, contactRole: 'Practice administrator', daysAgo: 12, sweep: 'S-09', stage: 'won' },
  { id: 'OPP-113', kind: 'lead', title: 'Veterinary emergency hub, after-hours transfers and blood products', org: 'Metrolina Veterinary Emergency (sample)', source: 'Organization website', sourceUrl: 'https://example.com', city: 'Matthews', state: 'NC', distanceMi: 12, value: 18000, summary: 'Two emergency and specialty sites, STAT blood product moves and records transfers when general practices close.', req: { services: ['specimens', 'records'], temp: 'refrigerated' }, contactRole: 'Hospital manager', daysAgo: 3, sweep: 'S-11' },
  { id: 'OPP-114', kind: 'lead', title: 'Dental lab case pickup loop, 30 practices', org: 'Crown & Bridge Dental Studio (sample)', source: 'Organization website', sourceUrl: 'https://example.com', city: 'Gastonia', state: 'NC', distanceMi: 22, value: 20000, summary: 'Daily pickup and delivery of impressions and finished cases to about 30 dental offices.', req: { services: ['supplies'] }, contactRole: 'Owner', daysAgo: 12, sweep: 'S-09' },
  { id: 'OPP-115', kind: 'lead', title: 'Hospital system supplier diversity registration, courier category', org: 'Regional health system (sample)', source: 'Supplier portal', sourceUrl: 'https://example.com', city: 'Charlotte', state: 'NC', distanceMi: 5, value: 120000, summary: 'Supplier diversity program lists courier and logistics as an open category for MBE vendors this fiscal year.', req: { services: ['specimens', 'pharmacy', 'supplies'], setAside: 'MBE / HUB', autoLiability: 2000000 }, contactRole: 'Supplier diversity manager', daysAgo: 8, sweep: 'S-10' },
  { id: 'OPP-116', kind: 'bid', title: 'Stretcher transport services, county EMS overflow', org: 'County EMS (sample)', source: 'County procurement', sourceUrl: 'https://example.com', city: 'Statesville', state: 'NC', distanceMi: 41, value: 90000, due: dateOnly(10), summary: 'Non-emergency stretcher transports between facilities. Requires stretcher vans and two-person crews.', req: { services: ['nemt-stretcher'], certs: ['CPR / First Aid'] }, contactRole: 'EMS operations chief', daysAgo: 3, sweep: 'S-11', stage: 'lost' },
  { id: 'OPP-117', kind: 'broker', title: 'Adult day health center transportation contract', org: 'Sunrise Adult Day Health (sample)', source: 'Organization website', sourceUrl: 'https://example.com', city: 'Charlotte', state: 'NC', distanceMi: 8, value: 58000, summary: 'Daily round trips for about 40 participants, 12 of them wheelchair users. Current vendor contract ends next quarter.', req: { services: ['nemt-ambulatory', 'nemt-wheelchair'], certs: ['CPR / First Aid', 'Wheelchair securement'], wheelchairVans: 2 }, contactRole: 'Center director', daysAgo: 5, sweep: 'S-11' },
  { id: 'OPP-118', kind: 'bid', title: 'Courier services for state crime lab evidence and toxicology samples', org: 'State crime laboratory (sample)', source: 'NC eVP', sourceUrl: 'https://evp.nc.gov', city: 'Charlotte', state: 'NC', distanceMi: 6, value: 35000, due: dateOnly(2), summary: 'Chain-of-custody transport of toxicology samples. Background checks for every driver.', req: { services: ['specimens', 'records'], certs: ['OSHA BBP', 'DOT HazMat (UN3373)'] }, contactRole: 'Lab director', daysAgo: 12, sweep: 'S-09' },
]

/** Pool the "Run sweep now" button draws new finds from. */
export const sweepPool: O[] = [
  { id: 'OPP-201', kind: 'lead', title: 'Fertility clinic, temperature-logged specimen moves between 3 offices', org: 'Blue Ridge Fertility (sample)', source: 'Organization website', sourceUrl: 'https://example.com', city: 'Charlotte', state: 'NC', distanceMi: 9, value: 16000, summary: 'Three offices and an embryology lab. Specimen moves need continuous temperature records.', req: { services: ['specimens'], temp: 'refrigerated', certs: ['HIPAA'] }, contactRole: 'Lab supervisor', daysAgo: 0, sweep: 'NEW' },
  { id: 'OPP-202', kind: 'bid', title: 'Courier services for county detention health unit pharmacy deliveries', org: 'County sheriff (sample)', source: 'County procurement', sourceUrl: 'https://example.com', city: 'Concord', state: 'NC', distanceMi: 21, value: 24000, due: dateOnly(14), summary: 'Daily pharmacy deliveries to the detention health unit with signed receipt.', req: { services: ['pharmacy'], certs: ['HIPAA'] }, contactRole: 'Purchasing officer', daysAgo: 0, sweep: 'NEW' },
  { id: 'OPP-203', kind: 'broker', title: 'Dialysis standing-order trips, 2 new clinics opening', org: 'Regional NEMT broker (sample)', source: 'Broker provider page', sourceUrl: 'https://example.com', city: 'Rock Hill', state: 'SC', distanceMi: 26, value: 47000, summary: 'Two dialysis clinics opening with Monday, Wednesday, Friday standing orders. Ambulatory and wheelchair.', req: { services: ['nemt-ambulatory', 'nemt-wheelchair'], certs: ['CPR / First Aid'], wheelchairVans: 1 }, contactRole: 'Network manager', daysAgo: 0, sweep: 'NEW' },
  { id: 'OPP-204', kind: 'lead', title: 'Hospice group, evening medication and DME deliveries', org: 'Carolina Comfort Hospice (sample)', source: 'Organization website', sourceUrl: 'https://example.com', city: 'Gastonia', state: 'NC', distanceMi: 22, value: 21000, summary: 'Comfort-kit medications and equipment to patient homes after 5 pm.', req: { services: ['pharmacy', 'supplies'], certs: ['HIPAA'] }, contactRole: 'Director of patient services', daysAgo: 0, sweep: 'NEW' },
  { id: 'OPP-205', kind: 'bid', title: 'Medical records storage pickup and delivery, school district health services', org: 'Public school district (sample)', source: 'District procurement', sourceUrl: 'https://example.com', city: 'Charlotte', state: 'NC', distanceMi: 5, value: 12000, due: dateOnly(18), summary: 'Weekly pickup of sealed health records boxes from 40 schools.', req: { services: ['records'], certs: ['HIPAA'] }, contactRole: 'Purchasing', daysAgo: 0, sweep: 'NEW' },
  { id: 'OPP-206', kind: 'lead', title: 'Clinical research site, trial kit and specimen runs', org: 'Piedmont Clinical Research (sample)', source: 'Organization website', sourceUrl: 'https://example.com', city: 'Charlotte', state: 'NC', distanceMi: 7, value: 19000, summary: 'Ambient trial kits and same-day specimen handoffs to a central lab courier.', req: { services: ['specimens', 'supplies'], certs: ['HIPAA', 'DOT HazMat (UN3373)'] }, contactRole: 'Site director', daysAgo: 0, sweep: 'NEW' },
]

export const materialize = (o: O, nowStamp?: string): Opportunity => {
  const { daysAgo, sweep, stage, ...rest } = o
  return { ...rest, foundAt: nowStamp || iso(new Date(Date.now() - daysAgo * DAY - 3 * 36e5)), sweepId: sweep, stage: stage || 'found' }
}

const SOURCES = ['SAM.gov', 'NC eVP', 'SC Business Opportunities', 'County procurement (8 counties)', 'City procurement', 'NC Medicaid and plan provider pages', 'NEMT broker provider pages', 'Hospital supplier portals', 'Lab, pharmacy and clinic websites']
const mkSweep = (id: string, daysAgo: number, counts: number[], notes: Record<number, string> = {}): Sweep => {
  const s = daysFrom(-daysAgo, 6, 0); const f = new Date(s.getTime() + (19 + daysAgo) * 6e4)
  const results = SOURCES.map((src, i) => ({ source: src, found: counts[i] || 0, result: notes[i] || (counts[i] ? `${counts[i]} new` : 'Nothing new that fits') }))
  return { id, label: id, startedAt: iso(s), finishedAt: iso(f), results, added: counts.reduce((a, b) => a + b, 0) }
}
export const sweeps: Sweep[] = [
  mkSweep('S-12', 1, [1, 0, 0, 1, 1, 0, 1, 0, 1]),
  mkSweep('S-11', 3, [0, 2, 0, 1, 0, 0, 1, 0, 3], { 2: 'Search page did not load this run; retried next sweep' }),
  mkSweep('S-10', 8, [0, 0, 0, 0, 0, 1, 0, 1, 1]),
  mkSweep('S-09', 12, [0, 1, 0, 0, 0, 0, 0, 0, 3]),
]

export const vehicles: Vehicle[] = [
  { id: 'V1', unit: 'Unit 11', type: 'Refrigerated van', plate: 'NC PKR-4411', inspection: dateOnly(120), registration: dateOnly(200) },
  { id: 'V2', unit: 'Unit 12', type: 'Refrigerated van', plate: 'NC PKR-4412', inspection: dateOnly(22), registration: dateOnly(160) },
  { id: 'V3', unit: 'Unit 21', type: 'Cargo van', plate: 'NC TLM-2121', inspection: dateOnly(64), registration: dateOnly(90) },
  { id: 'V4', unit: 'Unit 22', type: 'Cargo van', plate: 'NC TLM-2122', inspection: dateOnly(-3), registration: dateOnly(75) },
  { id: 'V5', unit: 'Unit 31', type: 'Sedan', plate: 'NC HBW-3131', inspection: dateOnly(180), registration: dateOnly(240) },
  { id: 'V6', unit: 'Unit 41', type: 'Wheelchair van', plate: 'NC WAV-4141', inspection: dateOnly(48), registration: dateOnly(130) },
  { id: 'V7', unit: 'Unit 42', type: 'Wheelchair van', plate: 'NC WAV-4142', inspection: dateOnly(9), registration: dateOnly(310) },
]
const creds = (lic: number, hipaa: number, bbp: number, extra: [string, number][] = []) => [
  { name: "Driver's license", expires: dateOnly(lic) }, { name: 'HIPAA training', expires: dateOnly(hipaa) }, { name: 'OSHA bloodborne pathogens', expires: dateOnly(bbp) }, ...extra.map(([n, d]) => ({ name: n, expires: dateOnly(d) })),
]
export const drivers: Driver[] = [
  { id: 'D1', name: 'Marcus Dean', phone: '(704) 555-0191', vehicleId: 'V1', nemt: false, credentials: creds(700, 210, 190, [['DOT HazMat UN3373', 300]]) },
  { id: 'D2', name: 'Keisha Ortiz', phone: '(704) 555-0172', vehicleId: 'V2', nemt: false, credentials: creds(420, 25, 160, [['DOT HazMat UN3373', 140]]) },
  { id: 'D3', name: 'Tyrone Bell', phone: '(704) 555-0133', vehicleId: 'V3', nemt: false, credentials: creds(900, 300, -5) },
  { id: 'D4', name: 'Alicia Monroe', phone: '(704) 555-0164', vehicleId: 'V5', nemt: false, credentials: creds(330, 260, 240) },
  { id: 'D5', name: 'Raymond Pruitt', phone: '(704) 555-0119', vehicleId: 'V6', nemt: true, credentials: creds(510, 190, 200, [['CPR / First Aid', 55], ['Wheelchair securement', 300]]) },
  { id: 'D6', name: 'Grace Nwosu', phone: '(704) 555-0127', vehicleId: 'V7', nemt: true, credentials: creds(640, 150, 150, [['CPR / First Aid', 12], ['Wheelchair securement', 280]]) },
]

export const customers: Customer[] = [
  { id: 'C1', name: 'Lakeside Orthopedic Partners (sample)', type: 'Clinic', contact: 'Renee Holt', title: 'Practice administrator', phone: '(704) 555-0102', email: 'rholt@lakeside.example', monthly: 1850, sla: 'Daily route, 2 runs', since: dateOnly(-12), notes: 'Won from the S-09 sweep. Trays go to the ASC by 7:30 am.' },
  { id: 'C2', name: 'Northside Reference Lab (sample)', type: 'Reference lab', contact: 'Dr. Paul Kim', title: 'Lab director', phone: '(704) 555-0110', email: 'pkim@northside.example', monthly: 6400, sla: '6 days, STAT in 60 min', since: '2023-03-01', notes: 'Biggest account. Wants temperature reports monthly.' },
  { id: 'C3', name: 'Mercy Infusion Pharmacy (sample)', type: 'Pharmacy', contact: 'Tasha Greene', title: 'Pharmacist in charge', phone: '(704) 555-0145', email: 'tgreene@mercyinf.example', monthly: 3100, sla: '2 to 8 °C, same day', since: '2024-06-15', notes: 'Evening windows. Asks for photo on porch drops.' },
  { id: 'C4', name: 'Lakeview Dialysis (sample)', type: 'Dialysis', contact: 'Omar Haddad', title: 'Clinic manager', phone: '(704) 555-0158', email: 'ohaddad@lakeview.example', monthly: 1400, sla: 'Monthly draw cycle', since: '2025-01-10', notes: 'Also refers patient rides.' },
  { id: 'C5', name: 'Regional NEMT broker (sample)', type: 'Broker', contact: 'Network team', title: 'Provider relations', phone: '(800) 555-0100', email: 'network@broker.example', monthly: 9200, sla: '95% on time, 98% acceptance', since: '2023-09-01', notes: 'Scorecard reviewed quarterly.' },
  { id: 'C6', name: 'Brookdale Senior Living (sample)', type: 'LTC facility', contact: 'Janet Fry', title: 'Executive director', phone: '(704) 555-0181', email: 'jfry@brookdale.example', monthly: 900, sla: 'Appointment rides', since: '2025-08-01', notes: 'Private-pay rides, invoiced monthly.' },
]

const stop = (id: string, h: number, m: number, place: string, address: string, kind: 'pickup' | 'delivery', items: string, temp: 'ambient' | 'refrigerated', status: 'pending' | 'arrived' | 'done', signedBy?: string) => ({ id, time: at(h, m), place, address, kind, items, temp, status, pod: status === 'done' ? { signedBy: signedBy || 'Front desk', at: at(h, m + 2), photo: true, gps: true } : undefined })
export const runs: Run[] = [
  { id: 'R1', name: 'Route 1: north lab loop', customerIds: ['C2'], driverId: 'D1', vehicleId: 'V1', tempLog: [4.2, 4.0, 4.4, 4.9, 5.1, 4.6, 4.3, 4.1, 4.5, 4.8, 4.4], stops: [
    stop('s1', 6, 50, 'Northside PSC Huntersville', '1240 Gilead Rd', 'pickup', '18 specimens, sealed bag 22-114', 'refrigerated', 'done', 'L. Ward'),
    stop('s2', 7, 15, 'Northside PSC Cornelius', '900 Catawba Ave', 'pickup', '11 specimens, sealed bag 22-115', 'refrigerated', 'done', 'M. Jones'),
    stop('s3', 7, 45, 'Northside Reference Lab', '400 Arrowpoint Blvd', 'delivery', '29 specimens, 2 bags', 'refrigerated', 'done', 'K. Ortiz'),
    stop('s4', 11, 30, 'Northside PSC Mooresville', '115 Medical Park Rd', 'pickup', 'Midday collection', 'refrigerated', 'pending'),
  ] },
  { id: 'R2', name: 'Route 2: infusion deliveries', customerIds: ['C3'], driverId: 'D2', vehicleId: 'V2', tempLog: [3.8, 4.1, 3.9, 4.4, 4.2, 4.0, 3.7], stops: [
    stop('s5', 8, 0, 'Mercy Infusion Pharmacy', '2200 Randolph Rd', 'pickup', '3 totes, cold packs', 'refrigerated', 'done', 'T. Greene'),
    stop('s6', 8, 40, 'Patient home (order 55812)', 'Myers Park', 'delivery', '1 tote', 'refrigerated', 'arrived'),
    stop('s7', 9, 20, 'Patient home (order 55819)', 'Dilworth', 'delivery', '2 totes', 'refrigerated', 'pending'),
  ] },
  { id: 'R3', name: 'Route 3: ortho trays', customerIds: ['C1'], driverId: 'D4', vehicleId: 'V5', stops: [
    stop('s8', 6, 45, 'Lakeside Ortho Mooresville', '170 Medical Park Rd', 'pickup', '4 instrument trays', 'ambient', 'done', 'R. Holt'),
    stop('s9', 7, 25, 'Lakeside Surgery Center', '9625 Lakeside Dr', 'delivery', '4 instrument trays', 'ambient', 'done', 'OR desk'),
    stop('s10', 14, 0, 'Lakeside Ortho Huntersville', '16455 Statesville Rd', 'pickup', 'Imaging media, records', 'ambient', 'pending'),
  ] },
  { id: 'R4', name: 'STAT: Lakeview Dialysis draw', customerIds: ['C4'], driverId: 'D3', vehicleId: 'V3', stat: true, stops: [
    stop('s11', 10, 5, 'Lakeview Dialysis', '3810 Monroe Rd', 'pickup', 'STAT potassium, 2 tubes', 'ambient', 'pending'),
    stop('s12', 10, 40, 'Northside Reference Lab', '400 Arrowpoint Blvd', 'delivery', 'STAT, 2 tubes', 'ambient', 'pending'),
  ] },
]

export const trips: Trip[] = [
  { id: 'T1', broker: 'Regional NEMT broker', memberRef: 'M-****4821', pickup: at(6, 30), from: 'Home, east Charlotte', to: 'Lakeview Dialysis', mobility: 'wheelchair', driverId: 'D5', status: 'completed', lateMin: 0, legs: 'round-trip', fare: 74 },
  { id: 'T2', broker: 'Regional NEMT broker', memberRef: 'M-****1177', pickup: at(7, 0), from: 'Home, Matthews', to: 'Novant clinic (sample)', mobility: 'ambulatory', driverId: 'D6', status: 'completed', lateMin: 4, legs: 'one-way', fare: 38 },
  { id: 'T3', broker: 'Regional NEMT broker', memberRef: 'M-****9034', pickup: at(9, 15), from: 'Brookdale Senior Living', to: 'Cardiology office (sample)', mobility: 'wheelchair', driverId: 'D5', status: 'onboard', legs: 'round-trip', fare: 81 },
  { id: 'T4', broker: 'Private pay', memberRef: 'Brookdale resident', pickup: at(10, 30), from: 'Brookdale Senior Living', to: 'Eye center (sample)', mobility: 'ambulatory', driverId: 'D6', status: 'en-route', legs: 'round-trip', fare: 64 },
  { id: 'T5', broker: 'Regional NEMT broker', memberRef: 'M-****5560', pickup: at(11, 0), from: 'Home, Gastonia', to: 'Dialysis center (sample)', mobility: 'wheelchair', status: 'scheduled', legs: 'round-trip', fare: 96 },
  { id: 'T6', broker: 'Regional NEMT broker', memberRef: 'M-****2208', pickup: at(13, 30), from: 'Home, Concord', to: 'Physical therapy (sample)', mobility: 'ambulatory', driverId: 'D6', status: 'scheduled', legs: 'one-way', fare: 42 },
  { id: 'T7', broker: 'Regional NEMT broker', memberRef: 'M-****6612', pickup: at(8, 0), from: 'Home, Huntersville', to: 'Imaging center (sample)', mobility: 'ambulatory', status: 'no-show', legs: 'one-way', fare: 0 },
]

const inv = (id: string, n: string, c: string, issued: number, due: number, amount: number, status: Invoice['status'], desc: string): Invoice => ({ id, number: n, customerId: c, issued: dateOnly(issued), due: dateOnly(due), amount, status, lines: [{ desc, qty: 1, rate: amount }] })
export const invoices: Invoice[] = [
  inv('I1', 'BW-1041', 'C2', -34, -4, 6400, 'paid', 'Scheduled routes and STAT calls, last month'),
  inv('I2', 'BW-1042', 'C3', -34, -4, 3180, 'overdue', 'Refrigerated deliveries, last month'),
  inv('I3', 'BW-1043', 'C5', -20, 10, 9240, 'open', 'NEMT trips, broker billing period'),
  inv('I4', 'BW-1044', 'C1', -6, 24, 1850, 'open', 'Daily tray route, first month'),
  inv('I5', 'BW-1045', 'C6', -38, -8, 940, 'overdue', 'Private-pay rides'),
  inv('I6', 'BW-1046', 'C4', -12, 18, 1400, 'paid', 'Monthly draw cycle'),
]

const outreach: Outreach[] = [
  { id: 'X1', oppId: 'OPP-108', channel: 'email', subject: 'Courier for your six new draw sites', body: '', status: 'replied', updatedAt: iso(new Date(Date.now() - 2 * DAY)) },
  { id: 'X2', oppId: 'OPP-106', channel: 'email', subject: 'Wheelchair capacity in Gaston and Lincoln', body: '', status: 'sent', updatedAt: iso(new Date(Date.now() - DAY)) },
  { id: 'X3', oppId: 'OPP-109', channel: 'email', subject: 'STAT deliveries to your 22 facilities', body: '', status: 'draft', updatedAt: iso(new Date()) },
  { id: 'X4', oppId: 'OPP-117', channel: 'call', body: '', status: 'approved', updatedAt: iso(new Date()) },
]

export function seed(): State {
  return {
    v: 1,
    brain: structuredClone(brain),
    opps: raw.map((o) => materialize(o)),
    outreach,
    sweeps: structuredClone(sweeps),
    runs: structuredClone(runs),
    trips: structuredClone(trips),
    drivers: structuredClone(drivers),
    vehicles: structuredClone(vehicles),
    customers: structuredClone(customers),
    rates: { ...rates },
    quotes: [],
    invoices: structuredClone(invoices),
    requests: [
      { id: 'P1', customerId: 'C2', at: at(13, 0), from: 'Northside PSC Matthews', items: 'Afternoon collection', temp: 'refrigerated', stat: false, status: 'requested' },
    ],
    tourDone: false,
  }
}
