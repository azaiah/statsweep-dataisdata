import type { Brain, Opportunity, Service } from './types'

export type Factor = { name: string; points: number; max: number; note: string }
export type Score = { score: number; factors: Factor[]; disqualified?: string }

const SERVICE_LABEL: Record<Service, string> = {
  specimens: 'Specimens', pharmacy: 'Pharmacy', supplies: 'Medical supplies', records: 'Records',
  'nemt-ambulatory': 'NEMT ambulatory', 'nemt-wheelchair': 'NEMT wheelchair', 'nemt-stretcher': 'NEMT stretcher',
}
export const serviceLabel = (s: Service) => SERVICE_LABEL[s]

/** Pure, testable fit score. 0 to 100 with reasons, or a disqualifier when the work can't be done. */
export function scoreOpportunity(o: Opportunity, b: Brain): Score {
  const f: Factor[] = []
  const r = o.req
  const missingSvc = r.services.filter((s) => !b.services.includes(s))
  if (r.services.includes('nemt-stretcher') && b.fleet.stretcherVans === 0) return { score: 0, factors: [], disqualified: 'Needs stretcher vans; you have none in the Company Brain.' }
  if (missingSvc.length === r.services.length) return { score: 0, factors: [], disqualified: `You don't offer ${missingSvc.map(serviceLabel).join(' or ')}.` }
  if (r.temp === 'frozen' && !b.temps.frozen) return { score: 0, factors: [], disqualified: 'Needs frozen (dry-ice) transport; you are set up for ambient and refrigerated only.' }
  if (o.due && new Date(o.due + 'T17:00').getTime() < Date.now()) return { score: 0, factors: [], disqualified: 'The response deadline has passed.' }
  if (o.distanceMi > b.radiusMi * 1.5) return { score: 0, factors: [], disqualified: `${o.distanceMi} miles out, well beyond your ${b.radiusMi}-mile radius.` }

  // Service match (30)
  const svc = Math.round(25 * (1 - missingSvc.length / r.services.length))
  f.push({ name: 'Service match', points: svc, max: 25, note: missingSvc.length ? `Missing ${missingSvc.map(serviceLabel).join(', ')}` : 'You run every service it needs' })
  // Temperature (10)
  const tempOk = !r.temp || (r.temp === 'refrigerated' ? b.temps.refrigerated : b.temps.frozen)
  f.push({ name: 'Temperature control', points: tempOk ? 10 : 0, max: 10, note: !r.temp ? 'Ambient only' : tempOk ? `${r.temp === 'refrigerated' ? '2 to 8 °C' : 'Frozen'} capable` : 'Needs refrigerated vans' })
  // Distance (15)
  const d = o.distanceMi <= 10 ? 15 : o.distanceMi <= 20 ? 12 : o.distanceMi <= 35 ? 8 : o.distanceMi <= b.radiusMi ? 5 : 1
  f.push({ name: 'Distance', points: d, max: 15, note: `${o.distanceMi} mi from ${b.city}, radius ${b.radiusMi} mi` })
  // Credentials (15)
  const need = r.certs || []; const miss = need.filter((c) => !b.certs.includes(c))
  f.push({ name: 'Credentials', points: need.length ? Math.round(15 * (1 - miss.length / need.length)) : 15, max: 15, note: miss.length ? `Missing ${miss.join(', ')}` : need.length ? 'All required training on file' : 'No special credentials listed' })
  // Insurance (10)
  let ins = 10; const insNotes: string[] = []
  if (r.autoLiability && b.insurance.autoLiability < r.autoLiability) { ins -= 5; insNotes.push(`auto liability ${fmtM(r.autoLiability)} required, you carry ${fmtM(b.insurance.autoLiability)}`) }
  if (r.abuseMolestation && !b.insurance.abuseMolestation) { ins -= 5; insNotes.push('abuse and molestation coverage required') }
  f.push({ name: 'Insurance', points: ins, max: 10, note: insNotes.length ? capital(insNotes.join('; ')) : 'Your limits meet the requirement' })
  // Capacity (10)
  let cap = 10; const capNotes: string[] = []
  const totalVeh = b.fleet.sedans + b.fleet.cargoVans + b.fleet.refrigeratedVans + b.fleet.wheelchairVans + b.fleet.stretcherVans
  if (r.vehicles && totalVeh < r.vehicles) { cap -= 5; capNotes.push(`needs ${r.vehicles} vehicles, you have ${totalVeh}`) }
  if (r.wheelchairVans && b.fleet.wheelchairVans < r.wheelchairVans) { cap -= 5; capNotes.push(`needs ${r.wheelchairVans} wheelchair vans, you have ${b.fleet.wheelchairVans}`) }
  f.push({ name: 'Capacity', points: Math.max(0, cap), max: 10, note: capNotes.length ? capital(capNotes.join('; ')) : 'Your fleet covers it' })
  // Set-aside (5)
  f.push({ name: 'Set-aside', points: !r.setAside ? 1 : b.setAsides.includes(r.setAside) ? 5 : 0, max: 5, note: !r.setAside ? 'Open competition' : b.setAsides.includes(r.setAside) ? `You qualify: ${r.setAside}` : `Set aside for ${r.setAside}` })
  // Value (10)
  const v = o.value >= 100000 ? 10 : o.value >= 60000 ? 8 : o.value >= 35000 ? 6 : o.value >= 20000 ? 4 : 2
  f.push({ name: 'Contract value', points: v, max: 10, note: `About $${Math.round(o.value / 1000)}K a year, estimated` })
  const score = Math.max(0, Math.min(100, f.reduce((s, x) => s + x.points, 0)))
  return { score, factors: f }
}
const fmtM = (n: number) => '$' + (n / 1e6).toFixed(n % 1e6 ? 1 : 0) + 'M'
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
