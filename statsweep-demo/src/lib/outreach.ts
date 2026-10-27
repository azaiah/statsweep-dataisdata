import type { Brain, Opportunity } from './types'
import { serviceLabel } from './scoring'

/** Local template generator: the demo always produces a usable draft without an AI key. */
export function draftEmail(o: Opportunity, b: Brain) {
  const svc = o.req.services.map(serviceLabel).join(', ').toLowerCase()
  const first = o.kind === 'bid'
    ? `I saw the ${o.source} posting for "${o.title}" and wanted to confirm a few details before we respond.`
    : o.kind === 'broker'
    ? `I noticed ${o.org} is credentialing new transportation providers around ${o.city}, and we'd like to apply.`
    : `I was reading about ${o.org}: ${o.summary.split('.')[0].toLowerCase()}.`
  const subject = o.kind === 'bid' ? `Question on ${o.title.split(',')[0]}` : o.kind === 'broker' ? `${b.dba}: provider capacity near ${o.city}` : `A courier for ${o.org.replace(' (sample)', '')}`
  const body = `Hi,

${first} ${b.dba} is a ${b.city}-based medical courier and transportation company. We handle ${svc} today, ${o.distanceMi} miles from you.

A few things that matter for this work:
- ${b.differentiators.slice(0, 3).join('\n- ')}

Would it be a bad idea to set up a 10-minute call this week so I can understand how you handle this now?

${b.owner}
${b.dba}
${b.phone}`
  return { subject, body }
}

export function draftCall(o: Opportunity, b: Brain) {
  return `OPENER (slow, warm)
"Hi, this is ${b.owner.split(' ')[0]} with ${b.dba}. I know I'm calling out of the blue. Is now a bad time for thirty seconds?"

WHY I'M CALLING
"I saw ${o.kind === 'bid' ? 'your ' + o.source + ' posting' : 'that ' + o.org.replace(' (sample)', '') + ' ' + o.summary.split('.')[0].toLowerCase()}. We run ${o.req.services.map(serviceLabel).join(' and ').toLowerCase()} in ${o.city} every day."

LABEL, THEN WAIT
"It sounds like getting this covered reliably has been a headache."

CALIBRATED QUESTIONS
- How are you handling this today?
- What happens when a pickup gets missed?
- What would a new courier have to prove in the first 30 days?

ASK (no-oriented)
"Would you be against a 10-minute call this week to see if we're a fit?"`
}
