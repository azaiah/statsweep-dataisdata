import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

type Row = { t: string; src: string; what: string; fit: number; kind: 'Bid' | 'Lead' | 'Broker' }
const ROWS: Row[] = [
  { t: '06:02', src: 'SAM.gov', what: 'VA medical center: recurring lab and pharmacy courier runs', fit: 91, kind: 'Bid' },
  { t: '06:04', src: 'State procurement', what: 'Statewide courier services IFB, Region 3 routes', fit: 84, kind: 'Bid' },
  { t: '06:07', src: 'Reference lab', what: 'Adding 6 patient service centers, needs a daily route', fit: 88, kind: 'Lead' },
  { t: '06:09', src: 'NEMT broker', what: 'Provider network open: wheelchair trips, 3 counties', fit: 79, kind: 'Broker' },
  { t: '06:11', src: 'LTC pharmacy', what: 'Cycle-fill and STAT deliveries to 22 facilities', fit: 86, kind: 'Lead' },
]

function stamp() {
  const d = new Date()
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

/** The hero object: a carbon-copy chain-of-custody manifest that fills in as the sweep runs. */
export function RunSheet() {
  const reduce = useReducedMotion()
  const [date, setDate] = useState('')
  useEffect(() => setDate(stamp()), [])
  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <div className="sheet relative rounded-[6px] pb-4">
        <div className="perf opacity-90" aria-hidden="true" />
        <div className="flex items-start justify-between gap-3 px-5 pt-3">
          <div>
            <p className="font-display text-[13px] font-extrabold tracking-wide wide">SWEEP RUN SHEET</p>
            <p className="text-[12px] text-ink/70">Chain of custody from posting to your pipeline</p>
          </div>
          <div className="text-right">
            <p className="num font-display text-[13px] font-bold">{date || ' '}</p>
            <p className="text-[12px] text-ink/70">Started 06:00 ET</p>
          </div>
        </div>
        <div className="mx-5 mt-3 grid grid-cols-[44px_1fr_40px] gap-x-3 border-b-2 border-ink/80 pb-1 text-[11px] font-bold text-ink/80 sm:grid-cols-[48px_104px_1fr_40px]">
          <span>Time</span><span className="hidden sm:block">Picked up at</span><span>Contents</span><span className="text-right">Fit</span>
        </div>
        <ol className="sheet-rule mx-5" aria-label="Sample sweep results">
          {ROWS.map((r, i) => (
            <motion.li
              key={r.t}
              className="grid min-h-[40px] grid-cols-[44px_1fr_40px] items-center gap-x-3 py-1.5 text-[13px] sm:grid-cols-[48px_104px_1fr_40px]"
              initial={reduce ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.32, duration: 0.35 }}
            >
              <span className="num font-semibold">{r.t}</span>
              <span className="hidden font-semibold sm:block">{r.src}</span>
              <span className="leading-snug"><span className="mr-1.5 rounded bg-ink/10 px-1.5 py-px text-[11px] font-bold">{r.kind}</span>{r.what}<span className="block text-[11px] text-ink/60 sm:hidden">{r.src}</span></span>
              <span className="num text-right font-display text-[15px] font-extrabold">{r.fit}</span>
            </motion.li>
          ))}
        </ol>
        <div className="mx-5 mt-3 flex flex-wrap items-end justify-between gap-3">
          <p className="text-[12px] text-ink/70">5 found, 5 scored, 5 outreach drafts waiting for your OK.<br />Sample run. Your sweep uses your real service area.</p>
          <motion.span
            className="inline-block rotate-[-6deg] rounded-md border-[3px] border-stat px-2.5 py-1 font-display text-[15px] font-extrabold tracking-wider text-stat wide"
            initial={reduce ? false : { opacity: 0, scale: 1.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + ROWS.length * 0.32 + 0.15, type: 'spring', stiffness: 380, damping: 18 }}
          >
            DELIVERED
          </motion.span>
        </div>
      </div>
    </div>
  )
}
