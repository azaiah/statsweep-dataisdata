// Static reference content for the StatSweep Command Center: playbook, research library, growth plan,
// and the script generator that writes a custom call, voicemail, text, email, social and follow-up kit for every lead.
// Written in our own words from the sources listed in SOURCES. Not legal advice.

export const SOURCES = [
  { group: 'Lead data', items: [
    ['YellowPages: medical courier, NEMT, medical transportation and wheelchair transportation listings, 150 metros', 'https://www.yellowpages.com/'],
    ['Website check: every listed site opened over HTTPS on 2026-10-27; YellowPages "localsearch" placeholder pages counted as no website', 'https://www.yellowpages.com/'],
  ]},
  { group: 'The market', items: [
    ['Mordor Intelligence: healthcare courier services market ($48.3B in 2026, 5.7% CAGR to 2031)', 'https://www.mordorintelligence.com/industry-reports/healthcare-courier-services-market'],
    ['NEMT Platform: what NEMT brokers look for when choosing a provider in 2026', 'https://nemtplatform.com/blogs/what-nemt-brokers-look-for-when-choosing-a-provider-in-2026'],
    ['iCabbi: the major NEMT brokers in 2026 and how providers join', 'https://icabbi.com/blog/5-major-nemt-brokers-in-2026/'],
    ['Virginia DMAS: non-emergency transportation for providers', 'https://www.dmas.virginia.gov/for-providers/benefits-services-for-providers/transportation/non-emergency-transport/'],
  ]},
  { group: 'Brand and color', items: [
    ['Progress: color psychology in healthcare web design', 'https://www.progress.com/blogs/using-color-psychology-healthcare-web-design'],
    ['99designs: the logo colors of healthcare', 'https://99designs.com/logo-design/psychology-of-color/healthcare'],
  ]},
  { group: 'Sales and negotiation', items: [
    ['Fight Less, Win More (Jonathan B. Smith and Derek Gaunt), Penguin', 'https://www.penguin.co.uk/books/482360/fight-less-win-more-by-gaunt-jonathan-b-smith-derek/9781804963272'],
    ['Never Split the Difference: book notes (Graham Mann)', 'https://grahammann.net/book-notes/never-split-the-difference-chris-voss'],
    ['Black Swan Group: fixing a bad cold-calling script', 'https://www.blackswanltd.com/the-edge/fixing-a-bad-cold-calling-script'],
    ['$100M Offers summary (Readingraphics)', 'https://readingraphics.com/book-summary-100m-offers-alex-hormozi/'],
    ['$100M Offers: scarcity, urgency, bonuses, guarantees, naming (SuperSummary)', 'https://www.supersummary.com/100m-offers/section-4-summary/'],
    ['Hormozi CLOSER framework (11x guide)', 'https://www.11x.ai/guides/alex-hormozi-sales-training-method'],
  ]},
]

export const PLAYBOOK = [
{ id: 'offer', title: 'Our offer, built the Hormozi way', md: `
Value = **dream outcome x how sure they are it will work**, divided by **how long it takes x how much effort it costs them**. Every line we say should push one of those four.

## The dream outcome, in their words
- **NEMT operators:** "My vans stay full every day, and I'm not one broker away from zero trips."
- **Medical couriers:** "I have three or four steady lab and pharmacy routes I can count on, and I stop chasing one-off deliveries."
- **Non-emergency ambulance:** "Facilities call us first for discharges and transfers, and the paperwork doesn't eat my nights."

## How we raise their certainty
- **The live demo** they click through before paying: dispatch, chain of custody, driver app, NEMT trips, bids and leads.
- **Their own facts in the pitch:** their city, their years in business, what their website (or lack of one) looks like today.
- **Proof from a real courier:** our first client, a medical courier in Richmond, Virginia. Seven sweeps found 59 opportunities worth an estimated $2.8M a year, each with its source. Say "estimated," always.
- **A sample sweep of their county before the demo.** Specific beats clever.

## How we shrink time and effort
- Live in **21 days**. We load their customers, drivers and paperwork.
- **Nothing goes out without their approval.** They keep control.
- Works on a phone. No install.

## The stack (anchor high, then step down)
| Plan | Setup | Monthly | Best for |
|---|---|---|---|
| Contract Ready | $4,997 | $497 | Fleets chasing hospital, state, federal and broker contracts |
| Route | $1,997 | $297 | Growing operators, 3 to 25 vehicles (most start here) |
| Launch | $997 | $147 | Owner-operators getting organized |

**Value-stack line:** "Hired out separately, a site like this, a part-time researcher checking bids and brokers, written outreach, dispatch software, a capability statement and a broker packet run about $19,700 the first year."

**Payback line:** "At our first client, the median opportunity on the board was worth about $30,000 a year. One of those pays for the top plan nearly three times."

## Bonuses (name them, hand them over one at a time, only to close a specific gap)
- **The Broker-Ready Packet:** every credential, insurance limit and driver document their state's brokers ask for, filled in.
- **Capability statement in 48 hours.**
- **The 50-stop outreach run:** 50 labs, pharmacies, clinics and facilities in their radius, each with a written intro.
- **Driver file audit:** licenses, HIPAA, bloodborne-pathogen, CPR and securement checked, expiry alerts set.

## Guarantees (confirm with Tony before using)
- **Ten in thirty:** at least 10 qualified opportunities in their service area in 30 days, or next month is free.
- **Live in 21 days** once we have their documents, or first month free.

## Honest scarcity and urgency
- We set up portals by hand, so we take a limited number of new companies a month. Say the real number from Settings.
- Founding price: the setup fee is locked for the first clients. Only say it while it's true.
`},
{ id: 'voss', title: 'Tactical empathy on the phone (Voss, Smith and Gaunt)', md: `
These owners are usually driving, dispatching or both when we call. The goal of a cold call is **not** to sell. It is to make them feel understood in 30 seconds and earn ten minutes later.

## The tools, in order
1. **Tone first.** Slow, low, warm. Smile. Playful on the opener, calm for anything hard.
2. **Accusation audit.** "You're probably thinking this is another marketing company that wants to sell you leads. Fair. Give me thirty seconds and tell me if it's useless."
3. **No-oriented questions.** "Is now a bad time?" beats "Do you have a minute?" "Would it be crazy to..." beats "Can I..."
4. **Labels, then silence.** "It sounds like most of your trips come from one broker." Then stop. Never start with "I hear that..."
5. **Mirrors.** Repeat their last 1 to 3 words as a question. "Volume dropped?" Wait.
6. **Calibrated questions.** What and how. "How are new facilities finding you?" "What happens when the broker cuts your county?"
7. **Dynamic silence.** Count to four after a label or question. The real answer comes after the pause.
8. **Summarize until "That's right."** "You're right" means stop talking. "That's right" means they feel heard.
9. **Rule of three.** Get the yes, the "That's right," and an implementation answer: "What would get in the way of Thursday at 10?"

## Five levels of listening (Smith and Gaunt)
Level 1 is half-present. Level 2 is waiting to talk. Level 3 hears their logic, level 4 their emotion, level 5 both at once. Write down **feelings** on the contact log, not just facts: "scared of losing the broker," "tired of dispatching at night."

## Fight less, win more on the phone
- Don't argue with an objection. Label it and get curious.
- Keep the relationship bigger than this one call. A "not now" handled well becomes a yes in 60 days.
- Let them feel in control: no-oriented asks, their pick of two times, "you decide."

## Read the counterpart
- **Assertive:** fast, direct. Give them the short version. Let them vent first.
- **Analyst:** quiet, wants numbers. Send details, don't rush, silence is them thinking.
- **Accommodator:** friendly and says yes easily. Pin down how and when, or the yes is empty.

## Black swans in this niche
- One broker is 80 percent of their volume, and a scorecard dip scares them.
- A spouse or partner does the books and makes the call.
- They lost a facility contract because they couldn't prove on-time numbers.
- Their insurance doesn't include abuse and molestation coverage, so they can't join a broker.
- They were burned by a web person who took a deposit and vanished.
Keep asking calibrated questions until one surfaces. It changes the pitch.
`},
{ id: 'closer', title: 'The demo call: CLOSER', md: `
For the booked 15 to 20 minute call, not the cold call. Open the demo portal in their seat (Owner), then switch to Driver and Customer.

1. **Clarify** why they're here. "What made you say yes to this call?"
2. **Label** the problem. "So the real issue is that almost all of your trips come through one broker."
3. **Overview** past pain. "What have you tried? What happened?"
4. **Sell the vacation.** Show their week: the sweep finds a dialysis center contract and two lab routes, the drafts are written, dispatch and proof of delivery are on one board, invoices go out on time.
5. **Explain away concerns** with **AAA**: Acknowledge ("Makes sense"), Associate ("Our first courier client worried about the same thing"), Ask ("What specifically do you want to think through?").
6. **Reinforce** the decision. Say what happens on day one and who they'll hear from.

**On price:** state it once, plainly, then stop talking. Anchor with Contract Ready first.
`},
{ id: 'objections', title: 'Objection bank', md: `
| They say | We say (label first, then a calibrated question) |
|---|---|
| "We get all our trips from the broker." | "It sounds like the broker keeps your vans busy. What happens to your week if they cut your county or change the scorecard?" |
| "We're busy enough." | "That's a good problem. What happens in a slow month?" |
| "Just send me something." | "Happy to. So I send the right thing, what would have to be true for this to be worth ten minutes?" |
| "How much is it?" | "Depends on what you turn on. Most operators start at Route. Before price matters, is steadier contract work even a priority this year?" |
| "I have a website guy." | "Makes sense, I'm not trying to replace him. How is he helping you find facility and lab contracts once people land on the site?" |
| "I tried marketing and got burned." | "It sounds like someone promised a lot and didn't deliver. What did they promise?" Then: every find links to where we found it, and you approve everything. |
| "I need to talk to my partner." | "That makes sense. What do you think they'll push back on?" Offer a 15-minute call with both. |
| "Leads are a scam." | "Agreed, shared leads are. We don't sell leads. The sweep runs for your company only, and you can see the source of every find." |
| "We're too small." | "That's who this is built for. Most of the operators we call run under ten vehicles. What would one steady route do for you?" |
| "Not interested." | "Fair. Have you given up on getting off the broker treadmill this year, or is it just bad timing?" |
`},
{ id: 'cadence', title: 'Cadence and channels', md: `
## The 21-day sequence (every lead card has it written out)
- **Day 0:** call. No answer: voicemail, then the text a minute later.
- **Day 1:** email with the demo link.
- **Day 3:** call again at a different time window.
- **Day 5:** Facebook or Instagram message if they have a page (most NEMT operators do).
- **Day 8:** "short video" text: one sentence plus the demo link.
- **Day 12:** call, then the "Have you given up on..." email.
- **Day 21:** break-up text. Leave the door open.

## Best call windows (their local time)
- 7:00 to 8:30 am, before the first pickups.
- 1:30 to 2:30 pm, between dialysis waves.
- 4:00 to 5:30 pm, on the drive home.
Saturday morning works for owner-operators. Never Sunday.

## Daily rhythm
Two 90-minute call blocks: East and Central in the morning, West Coast after 3 pm ET. Clear follow-ups first, then new leads.
`},
{ id: 'compliance', title: 'Rules we follow', md: `
- **Calls:** business numbers listed publicly. Call between 8 am and 9 pm their time; we aim for business hours. If they say stop, log "Said stop" and the lead is marked do-not-contact for both of us.
- **Texts:** a business number from a public listing is still a phone number. Text only after a call attempt, identify ourselves, and always include "Reply STOP to opt out." Honor STOP immediately.
- **Email (CAN-SPAM):** real name, real subject, our business address, and an easy opt-out line in every email.
- **Never** claim a result we haven't delivered, say we're partnered with a broker, or name our first client without their permission.
- **Health information:** we don't collect it. Their customers' patient data never touches our sales process.
`},
]

export const TRADE_BRIEFS = [
  { trade: 'NEMT and wheelchair', buys: 'Steady trip volume, facility contracts, private-pay riders, broker standing.', ticket: 'Broker trips $25 to $95 each; a dialysis center or adult day contract can run $3,000 to $10,000 a month.', season: 'Year-round; dialysis is three days a week, every week.',
    pains: ['Most volume comes from one broker, and scorecards decide who gets trips', 'Trip records need GPS, timestamps and signatures or claims get denied', 'Driver CPR, securement and background checks expire and pause assignments', 'Payment delays of 30 to 60 days strain cash', 'No website, so facilities and families cannot find or vet them'],
    lingo: ['trip', 'leg', 'will-call', 'standing order', 'ambulatory', 'wheelchair', 'stretcher', 'no-show', 'kickback', 'on-time %', 'broker', 'MCO', 'PCS form', 'securement', 'ambulette'],
    angle: 'Get them off the broker treadmill: the sweep finds direct facility contracts (dialysis, adult day, senior living, rehab), county and city paratransit overflow bids, and new broker openings, and the portal tracks the on-time numbers brokers score them on.' },
  { trade: 'Medical courier', buys: 'Recurring lab, pharmacy and clinic routes; STAT work; temperature-controlled jobs.', ticket: 'A daily lab or LTC pharmacy route often runs $1,500 to $7,000 a month.', season: 'Steady; flu season and year-end budgets bring STAT spikes.',
    pains: ['Living on one-off deliveries and gig apps', 'National carriers and lab fleets take the big contracts', 'Proving chain of custody and temperature control to win labs', 'No capability statement for procurement officers', 'Website is a free directory page or nothing'],
    lingo: ['STAT', 'route', 'chain of custody', 'POD', 'UN3373', 'Category B', 'ambient', '2 to 8', 'dry ice', 'PSC', 'draw site', 'reference lab', 'LTC', 'cycle fill'],
    angle: 'Turn them from a delivery driver into a contracted route provider: the sweep finds labs opening draw sites, LTC and infusion pharmacies, multi-site clinics and state or county courier bids, and the portal proves chain of custody on every stop.' },
  { trade: 'Ambulance (non-emergency)', buys: 'Facility transfer and discharge contracts, stretcher and BLS volume.', ticket: 'Facility agreements are worth $5,000 to $25,000 a month.', season: 'Year-round; hospital discharge peaks mid-week.',
    pains: ['Hospitals and facilities rotate providers on responsiveness', 'Crew certifications and vehicle inspections to track', 'County and municipal contracts go out on portals nobody watches', 'Website that hasn’t changed in a decade'],
    lingo: ['BLS', 'ALS', 'stretcher', 'interfacility', 'discharge', 'PCS', 'crew', 'unit', 'response time'],
    angle: 'Lead with county and city bids for overflow and interfacility transport, plus the compliance vault for crews and units. Keep it short: many are larger shops, so qualify size early.' },
]

export const GLOSSARY = [
  ['NEMT', 'Non-emergency medical transportation: rides to medical appointments for people who can’t drive, mostly paid by Medicaid.'],
  ['Broker', 'A company a state or health plan hires to schedule and pay NEMT trips. Operators sign up as providers.'],
  ['MCO', 'Managed care organization: the health plans that run Medicaid in most states. Some contract transport directly.'],
  ['Leg', 'One direction of a trip. A round trip is two legs.'],
  ['Will-call', 'A return ride with no set time: the member calls when the appointment ends.'],
  ['Standing order', 'A recurring trip, like dialysis three times a week.'],
  ['Kickback', 'When a provider returns a trip assignment to the broker. Brokers track the rate.'],
  ['On-time performance', 'Share of pickups within the window (often 15 minutes). Brokers want 95 percent.'],
  ['Ambulette', 'New York term for a wheelchair van.'],
  ['Securement', 'Strapping a wheelchair to the vehicle floor correctly. Drivers are trained and certified.'],
  ['PCS form', 'Physician certification statement, needed for some stretcher and ambulance transports.'],
  ['STAT', 'Immediately. A STAT pickup usually means within 60 minutes or less.'],
  ['Chain of custody', 'The signed, timed record of who held a specimen or package at every step.'],
  ['POD', 'Proof of delivery: signature, time, photo and often GPS.'],
  ['UN3373', 'The shipping label for Biological Substance, Category B (most clinical specimens).'],
  ['Ambient / 2 to 8 / frozen', 'The three temperature classes couriers move: room temperature, refrigerated and dry ice.'],
  ['PSC', 'Patient service center: a lab’s draw site, where specimens are collected and picked up.'],
  ['LTC pharmacy', 'Long-term care pharmacy that supplies nursing homes and assisted living, often with cycle-fill deliveries.'],
  ['HIPAA', 'The US privacy law for health information. Couriers train drivers on it and keep patient data off manifests.'],
  ['OSHA BBP', 'Bloodborne pathogens standard. Courier drivers who handle specimens need the training.'],
  ['Capability statement', 'A one-page summary of a company’s services, codes, certifications and past work, used in procurement.'],
  ['NAICS 492110 / 485991', 'Industry codes for couriers and special-needs transportation, used in government bids.'],
]

export const GOV_PRIMER = `
## Where the work actually comes from
- **NEMT brokers and Medicaid plans.** States contract brokers (or plans) by region. Brokers credential providers and assign trips. They open their networks when a county is short on capacity, especially wheelchair and rural coverage.
- **Facilities directly.** Dialysis centers, adult day health centers, senior living, rehab hospitals and behavioral health programs often pay a transport company directly, outside Medicaid.
- **Labs, pharmacies and clinics.** Reference labs, LTC and infusion pharmacies, multi-site practices, dialysis groups, dental labs and vet hospitals contract couriers for routes and STAT runs.
- **State, county and city bids.** Statewide courier contracts, public health lab courier work, paratransit overflow, county EMS overflow. Posted on state portals (eVA, eVP and the like) and county purchasing pages.
- **Federal.** VA medical centers and other agencies post courier and transport work on SAM.gov, often set aside for small, veteran-owned or disadvantaged businesses.

## What brokers ask for (so we can talk like we know)
Active NPI, EIN, state Medicaid enrollment, SAM.gov registration with a UEI, and operating authority. Drivers need background, sex-offender registry and MVR checks, drug screening, CPR and first aid, defensive driving and wheelchair securement training. Insurance commonly runs $1M per occurrence and $2M aggregate general liability, auto liability of at least $500K, the broker named as additional insured, and for some brokers abuse and molestation coverage and workers' comp. Digital dispatch with GPS, timestamps and signatures. Performance targets near 95 percent on-time and acceptance. Credentialing takes 4 to 16 weeks depending on the broker.

## Why that matters for our pitch
Most small operators fail credentialing on paperwork, not on driving. The Broker-Ready Packet and the compliance vault fix exactly that.
`

export const SWEEP_EXPLAINER = `
## How the first sweep was built (2026-10-27)
1. Searched YellowPages for "medical courier," "non emergency medical transportation," "medical transportation" and "wheelchair transportation" in 150 metros across every state, plus "medical delivery," "lab courier" and "pharmacy delivery service" in 70 large metros.
2. Kept only businesses whose name or category is both medical and transportation. Dropped fire departments, municipal and volunteer squads, hospitals and health systems, air ambulance, national brokers and carriers, franchises, toll-free-only listings and duplicates by phone and name.
3. Checked every listed website. A YellowPages "localsearch" placeholder page, a social page or no link at all counts as **no website**. Free site-builder pages, and sites that would not load over HTTPS when we opened them, count as **weak or broken**.
4. Scored each lead for fit: website gap first, then trade, years in business and whether a street address is listed.
5. Every lead links to the listing it came from.

## Weekly sweep
Every Monday morning a scheduled Claude run finds new operators, checks their websites, and posts only new businesses to /api/ingest. It can add leads and sweep records. It can't read or change anything else.
`

export const GROWTH = `
## The plan to $20,000 a month
- **Month 1:** 60 touches per person per day across the 3,000-plus lead pool. Target 8 demos, 3 closes (mostly Route).
- **Month 2:** add the "sample sweep before the demo" step for every booked call. Target 12 demos, 4 closes, one Contract Ready.
- **Month 3:** referrals from the first clients, plus facility and broker partners who see the portal. Recurring revenue starts to carry the month.

## What to build next
- A one-click "sample sweep" PDF for any lead's county, generated from the demo engine.
- A Spanish-language version of the scripts (many NEMT owners in Florida, Texas, California and New York prefer it).
- Partnerships with insurance agents who write NEMT policies: they meet every new operator first.
`

/* ------------------------------------------------------------------ script generator */
const tradeWord = (l) => l.trade === 'Medical courier' ? 'medical courier' : l.trade === 'Ambulance (non-emergency)' ? 'non-emergency ambulance' : 'medical transportation'
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, '') } catch { return '' } }

/** What we noticed about them, said the way you'd say it out loud. */
export function hookFor(l) {
  const yrs = l.years ? `has been at it ${l.years} years` : 'is listed'
  if (l.web?.status === 'none') return `I was looking at ${tradeWord(l)} companies in ${l.city} and saw ${l.name} ${yrs}, but when someone searches for you there's no website of your own, just a directory listing.`
  if (l.web?.status === 'outdated') return `I was looking at ${tradeWord(l)} companies in ${l.city}. ${l.name} ${yrs}, but ${l.web.summary.charAt(0).toLowerCase() + l.web.summary.slice(1)}`
  return `I was looking at ${tradeWord(l)} companies in ${l.city} and came across ${l.name}${l.website ? ` and your site at ${host(l.website)}` : ''}.`
}
export function impactFor(l) {
  if (l.trade === 'Medical courier') return l.web?.status === 'decent'
    ? 'The site is fine. What I wanted to ask about is the labs, pharmacies and clinics near you that are hiring couriers right now, and whether anyone on your team has time to find them.'
    : 'So when a lab manager or a pharmacy looks you up before giving you a route, there’s nothing to show them that you handle specimens and chain of custody properly.'
  if (l.trade === 'Ambulance (non-emergency)') return l.web?.status === 'decent'
    ? 'What I wanted to ask about is the county and facility transport contracts going out near you, and who on your team watches for them.'
    : 'So when a hospital case manager or a facility looks you up, they can’t see your units, your certifications or how to book you.'
  return l.web?.status === 'decent'
    ? 'What I wanted to ask about is how much of your volume comes from one broker, because there are dialysis centers, adult day programs and county contracts near you that pay transport companies directly.'
    : 'So when a dialysis center, an adult day program or a family looks you up, they can’t book you or see that you’re licensed and insured, and they call whoever has a site.'
}
export function fixesFor(l) {
  const site = l.web?.status === 'decent' ? null : 'A website on your own domain with your insurance, certifications and an online booking form that drops into dispatch'
  const t = l.trade === 'Medical courier'
    ? ['A weekly list of labs, pharmacies and clinics near ' + l.city + ' that need routes, with the outreach written', 'Chain of custody, temperature logs and proof of delivery on every stop']
    : l.trade === 'Ambulance (non-emergency)'
    ? ['A weekly list of county, city and facility transport bids near ' + l.city, 'Crew and unit compliance tracking with expiry alerts']
    : ['A weekly list of facility contracts and broker openings near ' + l.city, 'Trip tracking with the on-time numbers brokers score you on']
  return [site, ...t].filter(Boolean)
}
const pitch = (l) => l.trade === 'Medical courier'
  ? `We build medical couriers a website that labs and pharmacies trust, wired to a portal that finds new routes and bids every week near ${l.city}, writes the outreach for each one, and runs dispatch, chain of custody and billing. Live in 21 days.`
  : l.trade === 'Ambulance (non-emergency)'
  ? `We build transport companies a website and a portal that finds county, city and facility contracts every week near ${l.city}, writes the outreach, and tracks crews, units and billing in one place. Live in 21 days.`
  : `We build NEMT companies a website families and facilities can book from, wired to a portal that finds facility contracts and broker openings every week near ${l.city}, writes the outreach for each one, and runs trips, drivers and billing. Live in 21 days.`
const label = (l) => l.trade === 'Medical courier' ? 'It seems like most of your work comes from a few regular customers and one-off calls.' : l.trade === 'Ambulance (non-emergency)' ? 'It seems like most of your transports come from the same few facilities.' : 'It seems like most of your trips come through a broker right now.'
const questions = (l) => l.trade === 'Medical courier'
  ? ['How are new labs and pharmacies finding you right now?', 'What happens to a STAT call that comes in while every driver is out?', 'If you added two steady routes this quarter, what would that change for you?', 'How do you show a new customer your chain of custody today?']
  : ['How much of your volume comes from one broker?', 'What happens to your week if they change your county or your scorecard?', 'How are dialysis centers and senior living places finding you now?', 'If you had two direct facility contracts, what would that do for you this year?']

export function scriptsFor(l) {
  const hook = hookFor(l), impact = impactFor(l), first = l.contactFirst || 'there'
  const short = l.web?.status === 'none' ? `${l.name} doesn't have its own website yet` : l.web?.status === 'outdated' ? `${l.name}'s website isn't loading properly` : `there's contract work near ${l.city} that fits ${l.name}`
  const call = `OPENER (warm, slow, smile)
"Hi, is this the owner? ... Hey, it's {{me}} with StatSweep. I know I'm calling out of the blue and you're probably between runs, so I'll be quick. Is now a bad time for thirty seconds?"
  - If "bad time": "Totally fair. Would it be crazy to grab ten minutes tomorrow morning before your first pickups?" (book it, hang up)

ACCUSATION AUDIT (if they sound guarded)
"You're probably thinking this is another company trying to sell you leads. Fair. We don't sell leads. Give me thirty seconds and tell me if it's useless."

REASON FOR THE CALL (custom to ${l.name})
"${hook} ${impact}"

LABEL, THEN GO QUIET (count to four)
"${label(l)}"

CALIBRATED QUESTIONS (pick two, let them talk)
${questions(l).map((q) => '- ' + q).join('\n')}

SELL THE VACATION (only after they've told you the problem)
"${pitch(l)}"

ASK (no-oriented)
"Would you be against me sending a two-minute demo you can click through? It's a working portal for a sample company like yours."
  - Then: "What's the best cell or email for that?" Read it back.
  - Book it: "Does Tuesday or Wednesday work better for fifteen minutes? I'll run a sample sweep of ${l.city} first so you see real opportunities."

IF THEY PUSH BACK
- "We get everything from the broker." -> "It sounds like the broker keeps you busy. What happens if they cut your county or change the scorecard?"
- "Just send me something." -> "Happy to. So I send the right thing, what would have to be true for this to be worth fifteen minutes?"
- "How much?" -> "Depends what you turn on. Most operators start with the Route plan. Before price matters, is steadier contract work a priority this year?"
- "Not interested." -> "Fair enough. Have you given up on getting contracts outside the broker this year, or is it just bad timing?"

CLOSE THE LOOP
Summarize what they said until you hear "That's right." Confirm the next step and the time. Log it.`
  const voicemail = `Hi, this is {{me}} with StatSweep. Quick one for ${l.name}. I put something together about ${l.trade === 'Medical courier' ? 'lab and pharmacy routes' : 'facility contracts'} near ${l.city} I think you'll want to see. Call or text me at {{myphone}}. Again, {{me}}, {{myphone}}.`
  const sms = `Hi, it's {{me}} with StatSweep. Just tried calling. I noticed ${short}. Here's a 2-minute demo of the site + portal we build for ${tradeWord(l)} companies: {{demo}} Worth 15 minutes this week? Reply STOP to opt out.`
  const email = {
    subjects: [`${l.name} on Google`, `${l.trade === 'Medical courier' ? 'Lab and pharmacy routes' : 'Facility contracts'} near ${l.city}`, `Quick question for ${l.name}`],
    body: `Hi ${first},

${hook} ${impact}

${pitch(l)}

Here's a working demo you can click through, built for a sample company like yours: {{demo}}

Would it be a bad idea to spend fifteen minutes this week looking at what yours would look like? I'll run a sample sweep of ${l.city} first so you see real opportunities, not a slideshow.

{{me}}
StatSweep, a DataIsData service
{{myphone}}

StatSweep by DataIsData. Not interested? Reply "no thanks" and I won't email again.`,
  }
  const linkedin = { connect: `Hi ${first}, I work with ${tradeWord(l)} companies on finding steady contract work beyond the brokers. Saw ${l.name} and wanted to connect.`, message: `Thanks for connecting. ${hook} I put together a quick demo of what we'd build for a company like ${l.name}: {{demo}}. Worth a look?` }
  const instagram = `Hey! Quick question: when a facility or family finds ${l.name} online, where do you want them to land? Right now ${short}. I made a quick demo of what we build for ${tradeWord(l)} companies: {{demo}}`
  const facebook = `Hi, {{me}} here with StatSweep. ${hook} We build a website and a portal that finds ${l.trade === 'Medical courier' ? 'lab and pharmacy routes' : 'facility contracts and broker openings'} near ${l.city}. Here's a 2-minute demo: {{demo}} Would it be crazy to talk for 15 minutes this week?`
  const followups = [
    { day: 0, channel: 'Call, voicemail, then text', text: sms },
    { day: 1, channel: 'Email', text: `Subject: ${email.subjects[0]}\n\n${email.body}` },
    { day: 3, channel: 'Call (different window)', text: 'Call between 1:30 and 2:30 pm their time. Open with: "Did I catch you at a bad time again?"' },
    { day: 5, channel: 'Facebook or Instagram', text: facebook },
    { day: 8, channel: 'Text', text: `{{me}} again from StatSweep. One thing I didn't mention: every opportunity we find for you shows where it came from, and nothing goes out without your OK. Demo: {{demo}} Reply STOP to opt out.` },
    { day: 12, channel: 'Email', text: `Subject: Have you given up on ${l.trade === 'Medical courier' ? 'adding routes' : 'contracts outside the broker'}?\n\nHi ${first},\n\nI haven't heard back, so I'm guessing it's bad timing or this isn't a priority. Have you given up on ${l.trade === 'Medical courier' ? 'adding steady lab and pharmacy routes' : 'getting direct facility contracts'} this year?\n\nEither answer is fine. A one-word reply helps me know whether to keep you posted.\n\n{{me}}\nStatSweep\n{{myphone}}` },
    { day: 21, channel: 'Text (break-up)', text: `Hi, {{me}} from StatSweep. I'll stop reaching out. If steadier contract work becomes a priority, the demo stays here: {{demo}} Rooting for you. Reply STOP to opt out.` },
  ]
  return { call, voicemail, sms, email, linkedin, instagram, facebook, followups }
}
