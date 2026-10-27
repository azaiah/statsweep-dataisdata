import React, { useEffect, useState } from 'react'

// Walkthrough tour. Each page has steps; a step can point at an element marked data-tour="...".
// Turn it on or off from the sidebar (Guide switch) or the "?" button on phones.
export const GUIDE = {
  home: { title: 'Command center', steps: [
    ['', 'This is home base. Everything you and Tony do (calls, texts, claims, deals) rolls up here live.'],
    ['kpis', 'Top row: progress toward the $20K month, your touches today, conversations, this week\'s close rate, open pipeline and how many fresh leads are waiting.'],
    ['regions', 'Live clocks for East, Central and West. Green means it\'s the best time to call there right now. Tap a region to jump to its callable leads. Evenings on the East Coast are prime West Coast hours.'],
    ['activity', 'Who did what over the last 14 days. Teal is Azaiah, amber is Tony.'],
    ['followups', 'Follow-ups due today. They schedule themselves every time you log a touch, so clear this list first each morning.'],
    ['callblock', 'Ready to dial? Start a call block. It feeds you only leads whose local time is inside calling hours, best fit first.'],
  ]},
  leads: { title: 'Leads', steps: [
    ['lists', 'Three lists. Website + Portal: no site of their own or a broken one, the easiest pitch. Portal + engine: working site, sell the portal and the sweep. Medical couriers: every courier in the pool.'],
    ['filters', 'Filter by trade, owner, stage and region. "Mine + unclaimed" hides your partner\'s leads so you never call the same company twice. Tick "Callable now" to see only businesses inside their calling hours.'],
    ['cols', 'Leads are split by time zone, and each column shows that region\'s local time. The number on each card is the fit score (higher is better). The colored edge shows who owns it.'],
    ['', 'Tap any card to open the full lead: call, text and email buttons, the custom scripts, the contact log and their website check and listing details.'],
  ]},
  lead: { title: 'A lead card', steps: [
    ['contact', 'Call opens your phone dialer. Text opens Messages with the custom script already typed; just hit send. Email opens your mail app with the subject and body filled in.'],
    ['owner', 'Claim the lead (or assign it to your partner) so you don\'t overlap. Set the stage and the next touch date here.'],
    ['contactlog', 'After every attempt, log how you reached them and what happened: answered, voicemail, replied, said no, or said stop. Saying stop marks them Do Not Contact for both of you.'],
    ['scripts', 'Every lead has its own call script, voicemail, text, email, LinkedIn, Instagram, Facebook and a two-week follow-up plan, written from that company\'s facts.'],
    ['notes', 'Shared notes and tasks for this lead. The timeline at the bottom shows every touch from both of you.'],
  ]},
  dialer: { title: 'Call block', steps: [
    ['', 'One lead at a time, only people inside their calling hours. Your claimed leads come first, then the best unclaimed ones.'],
    ['dialcard', 'Tap Call, run the script on the right, then tap what happened. The next lead loads automatically and the follow-up is scheduled for you.'],
  ]},
  pipeline: { title: 'Pipeline', steps: [
    ['', 'Every lead you\'ve touched moves left to right: Contacted, Talking, Demo booked, Proposal sent, Won, Onboarding, Live.'],
    ['kanban', 'Drag a card to a new column, or use the stage menu on the card (easier on a phone). Set the package on a won deal so the money tracker counts it.'],
  ]},
  tasks: { title: 'Tasks', steps: [
    ['taskadd', 'Add a task and assign it to yourself or your partner with a due date. Tasks added from a lead card link back to that lead.'],
    ['', 'Each person has a column. Overdue tasks turn red. Check them off when done.'],
  ]},
  advisor: { title: 'Advisor', steps: [
    ['', 'The advisor reads your contact log, pipeline and money every time you open it, then tells you the next most useful thing to fix.'],
    ['tips', 'Each card is one finding with a button that takes you straight to the fix.'],
    ['closerate', 'Weekly close rate is won deals divided by demos booked. The table splits it by person.'],
  ]},
  finance: { title: 'Money', steps: [
    ['finkpis', 'Safe to pay out is cash in the bank minus bills due in 30 days, the tax reserve and a buffer. It shows each person\'s split.'],
    ['insights', 'The numbers explained in plain English: what we need to make each month, the gap, how many deals close it, and what to watch.'],
    ['finadd', 'Add income, expenses, bills (one-time or recurring), subscriptions and owner payouts. Pending items show up as owed to us, or due.'],
    ['', 'Open Overview, then Money settings, to enter cash on hand, the tax rate, each person\'s monthly target and your split.'],
  ]},
  board: { title: 'Idea board', steps: [
    ['noteadd', 'Pin any idea: an offer to test, a script line that worked, a tool, a client idea.'],
    ['', 'Drag notes between Ideas, Trying, Working and Parked. Upvote what you both like and pin the important ones.'],
  ]},
  playbook: { title: 'Playbook', steps: [['', 'How we sell: the offer (Hormozi), the conversation (Voss, Smith and Gaunt), the demo call (CLOSER), objections, cadence and the rules we follow. Read it once, then come back before demo calls.']] },
  research: { title: 'Research', steps: [['', 'Where the work comes from (brokers, facilities, labs, bids), a brief for each kind of operator, a lingo glossary, and every source we used.']] },
  growth: { title: 'Growth plan', steps: [['', 'Move the sliders to match our real numbers and see what it takes to hit $20K a month. Below that is the roadmap of what to add next.']] },
  sweeps: { title: 'Sweeps', steps: [['', 'Every Monday morning Claude finds new operators, checks their websites and adds them here as New. Scripts are written for each lead automatically. This page shows each run.']] },
  settings: { title: 'Settings', steps: [['settings', 'Enter each person\'s callback number (it fills the {{myphone}} spot in scripts) and the demo link. Then save.']] },
}

export function Guide({ view, on, onOff, inLead }) {
  const page = inLead ? 'lead' : view
  const g = GUIDE[page]
  const [i, setI] = useState(0)
  useEffect(() => setI(0), [page])
  const step = g?.steps[Math.min(i, (g?.steps.length || 1) - 1)]
  useEffect(() => {
    document.querySelectorAll('.tour-hl').forEach((el) => el.classList.remove('tour-hl'))
    if (!on || !step || !step[0]) return
    const el = document.querySelector(`[data-tour="${step[0]}"]`)
    if (el) { el.classList.add('tour-hl'); el.scrollIntoView({ behavior: 'smooth', block: 'center' }) }
    return () => el && el.classList.remove('tour-hl')
  }, [on, page, i])
  if (!on || !g) return null
  const n = g.steps.length
  return (
    <aside className="guide" role="dialog" aria-label={`Guide: ${g.title}`}>
      <div className="guide-h"><span className="eyebrow">Guide · {g.title}</span><span className="tiny muted">{Math.min(i, n - 1) + 1} of {n}</span></div>
      <p className="guide-t">{step[1]}</p>
      <div className="guide-f">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onOff}>Turn guide off</button>
        <span className="row gap-s">
          <button type="button" className="btn btn-sm" disabled={i === 0} onClick={() => setI(i - 1)}>Back</button>
          {i < n - 1 ? <button type="button" className="btn btn-primary btn-sm" onClick={() => setI(i + 1)}>Next</button> : <button type="button" className="btn btn-primary btn-sm" onClick={() => setI(0)}>Start over</button>}
        </span>
      </div>
    </aside>
  )
}
