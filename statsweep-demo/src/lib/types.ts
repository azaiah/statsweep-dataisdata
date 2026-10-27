export type Role = 'owner' | 'dispatcher' | 'driver' | 'billing' | 'customer'

export type Service = 'specimens' | 'pharmacy' | 'supplies' | 'records' | 'nemt-ambulatory' | 'nemt-wheelchair' | 'nemt-stretcher'
export type Cert = 'HIPAA' | 'OSHA BBP' | 'DOT HazMat (UN3373)' | 'IATA DGR' | 'TSA PreCheck' | 'CPR / First Aid' | 'Wheelchair securement' | 'Defensive driving' | 'Chemo / hazardous drug handling'
export type SetAside = 'Small business' | 'MBE / HUB' | 'WOSB' | 'SDVOSB' | 'DBE' | 'SWaM'

export type Brain = {
  company: string
  dba: string
  city: string
  state: string
  founded: number
  owner: string
  phone: string
  email: string
  website: string
  radiusMi: number
  counties: string[]
  services: Service[]
  temps: { refrigerated: boolean; frozen: boolean }
  certs: Cert[]
  setAsides: SetAside[]
  insurance: { autoLiability: number; generalPerOcc: number; generalAgg: number; cargo: number; workersComp: boolean; abuseMolestation: boolean }
  fleet: { sedans: number; cargoVans: number; refrigeratedVans: number; wheelchairVans: number; stretcherVans: number }
  drivers: number
  registrations: { name: string; id: string; status: 'Active' | 'In progress' | 'Not started' }[]
  naics: string[]
  differentiators: string[]
}

export type OppKind = 'bid' | 'lead' | 'broker'
export type OppStage = 'found' | 'qualified' | 'contacted' | 'meeting' | 'submitted' | 'won' | 'lost'
export type Requirements = {
  services: Service[]
  temp?: 'refrigerated' | 'frozen'
  certs?: Cert[]
  autoLiability?: number
  abuseMolestation?: boolean
  setAside?: SetAside
  wheelchairVans?: number
  vehicles?: number
}
export type Opportunity = {
  id: string
  kind: OppKind
  title: string
  org: string
  source: string
  sourceUrl: string
  city: string
  state: string
  distanceMi: number
  value: number // estimated annual value, USD
  due?: string // ISO date
  preBid?: string
  summary: string
  req: Requirements
  contactRole: string
  foundAt: string // ISO datetime
  sweepId: string
  stage: OppStage
  noBidReason?: string
  isNew?: boolean
}

export type OutreachStatus = 'draft' | 'approved' | 'sent' | 'replied'
export type Outreach = { id: string; oppId: string; channel: 'email' | 'call' | 'text'; subject?: string; body: string; status: OutreachStatus; updatedAt: string }

export type SweepSourceResult = { source: string; result: string; found: number }
export type Sweep = { id: string; label: string; startedAt: string; finishedAt: string; results: SweepSourceResult[]; added: number }

export type Stop = { id: string; time: string; place: string; address: string; kind: 'pickup' | 'delivery'; items: string; temp?: 'ambient' | 'refrigerated' | 'frozen'; status: 'pending' | 'arrived' | 'done'; pod?: { signedBy: string; at: string; sig?: string; photo?: boolean; gps: boolean } }
export type Run = { id: string; name: string; customerIds: string[]; driverId: string; vehicleId: string; stat?: boolean; stops: Stop[]; tempLog?: number[] }

export type Mobility = 'ambulatory' | 'wheelchair' | 'stretcher'
export type Trip = { id: string; broker: string; memberRef: string; pickup: string; from: string; to: string; mobility: Mobility; driverId?: string; status: 'scheduled' | 'en-route' | 'onboard' | 'completed' | 'no-show' | 'canceled'; lateMin?: number; legs: 'one-way' | 'round-trip'; fare: number }

export type Credential = { name: string; expires: string }
export type Driver = { id: string; name: string; phone: string; vehicleId: string; nemt: boolean; credentials: Credential[] }
export type Vehicle = { id: string; unit: string; type: 'Sedan' | 'Cargo van' | 'Refrigerated van' | 'Wheelchair van'; plate: string; inspection: string; registration: string }

export type Customer = { id: string; name: string; type: 'Reference lab' | 'Hospital' | 'Pharmacy' | 'Clinic' | 'Dialysis' | 'LTC facility' | 'Broker' | 'Dental lab' | 'Vet hospital'; contact: string; title: string; phone: string; email: string; monthly: number; sla: string; since: string; notes: string }

export type QuoteInput = { customer: string; miles: number; stat: boolean; afterHours: boolean; weekend: boolean; waitMin: number; temp: 'ambient' | 'refrigerated' | 'frozen'; stops: number; nemt: false | 'ambulatory' | 'wheelchair' }
export type Quote = { id: string; createdAt: string; input: QuoteInput; total: number; status: 'draft' | 'sent' | 'accepted' }
export type Rates = { base: number; perMile: number; extraStop: number; stat: number; afterHours: number; weekend: number; waitPer15: number; refrigerated: number; frozen: number; nemtAmbBase: number; nemtWcBase: number; nemtPerMile: number }

export type Invoice = { id: string; number: string; customerId: string; issued: string; due: string; amount: number; status: 'paid' | 'open' | 'overdue'; lines: { desc: string; qty: number; rate: number }[] }

export type PickupRequest = { id: string; customerId: string; at: string; from: string; items: string; temp: 'ambient' | 'refrigerated' | 'frozen'; stat: boolean; status: 'requested' | 'scheduled' }

export type State = {
  v: number
  brain: Brain
  opps: Opportunity[]
  outreach: Outreach[]
  sweeps: Sweep[]
  runs: Run[]
  trips: Trip[]
  drivers: Driver[]
  vehicles: Vehicle[]
  customers: Customer[]
  rates: Rates
  quotes: Quote[]
  invoices: Invoice[]
  requests: PickupRequest[]
  tourDone: boolean
}
