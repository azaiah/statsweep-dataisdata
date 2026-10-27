import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const QA: [string, string][] = [
  ['How fast is setup?', 'Twenty-one days from the kickoff call, once we have your documents. Days 2 to 14 we build the website and configure the portal; days 15 to 21 we load your customers and drivers and train your team. Your first sweep runs during the build.'],
  ['Where do the leads and bids come from?', 'Public sources: SAM.gov and VA contracting, state and county procurement portals, NEMT broker and Medicaid plan provider pages, health system supplier pages, and the public websites of labs, pharmacies, clinics and facilities in your radius. Every find shows the link it came from and the date we opened it.'],
  ['Are these shared leads?', 'No. We don’t sell leads. The sweep runs for your company and your service area only, and what it finds is yours.'],
  ['Do you guarantee I’ll win contracts?', 'No, and anyone who does is guessing. We guarantee the work: at least 10 qualified opportunities in your first 30 days, prepared and ready for you to pursue, or your next month is free.'],
  ['I already use a broker’s dispatch platform. Do I have to switch?', 'No. Keep the broker platform for broker trips. The portal imports those trips so your private-pay, facility and courier work live next to them on one board, with one set of driver records.'],
  ['Is this HIPAA compliant?', 'The portal is built to keep protected health information to the minimum a delivery needs: a sealed-bag or order number, not a patient name. Driver HIPAA training is tracked in the compliance vault. If you need a business associate agreement for a specific customer, we’ll go through it with you on the kickoff call.'],
  ['Do I need to install anything?', 'No. The portal runs in a browser on any phone, tablet or computer. Drivers add it to their home screen like an app.'],
  ['Can I cancel?', 'Yes. Plans are month to month after setup. If you leave, you keep your website content, your customer list and an export of your records.'],
  ['Who is DataIsData?', 'DataIsData is the web development and AI automation agency that builds and runs StatSweep. We built the first version for a medical courier in Richmond, Virginia, and now set it up for operators across the country.'],
]

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" className="scroll-mt-20 py-16 sm:py-24" aria-labelledby="faq-h">
      <div className="wrap max-w-3xl">
        <h2 id="faq-h" className="h2">Questions operators ask us</h2>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {QA.map(([q, a], i) => (
            <div key={q}>
              <h3 className="m-0 font-sans text-base">
                <button className="flex min-h-[56px] w-full items-center justify-between gap-4 py-4 text-left text-lg font-semibold text-night" aria-expanded={open === i} aria-controls={'faq-' + i} onClick={() => setOpen(open === i ? null : i)}>
                  {q}{open === i ? <Minus size={20} className="shrink-0 text-cryo" /> : <Plus size={20} className="shrink-0 text-cryo" />}
                </button>
              </h3>
              <div id={'faq-' + i} hidden={open !== i} className="pb-5 leading-relaxed text-steel">{a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
