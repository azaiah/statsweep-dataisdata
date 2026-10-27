# StatSweep, presented by DataIsData

**Websites, business portals and a weekly bid-and-lead engine for independent medical couriers and NEMT operators.**
The CSL system, packaged and sold the way Gundy Consultations sells it to contractors.

Name check (2026-10-27): `statsweep.com` returned "not registered" from the Verisign registry, and no business uses the name. **Buy the domain first.**

## Live now (until statsweep.com is connected)
- Marketing site: https://statsweep.netlify.app
- Demo portal: https://statsweep-demo.netlify.app
- Team portal: https://statsweep-team.netlify.app

All three deploy from this one repo (`azaiah/statsweep-dataisdata`). The marketing site uses the root `netlify.toml` (base `statsweep-site`). The demo and team projects set their base directory in Netlify (`statsweep-demo`, `statsweep-command-center`) and read the `netlify.toml` inside that folder.

**When the domain is live:** in Netlify add `statsweep.com` to the statsweep project, `demo.statsweep.com` to statsweep-demo and `team.statsweep.com` to statsweep-team. Then search the repo for `statsweep.netlify.app` and `statsweep-demo.netlify.app` and swap in the real domains (site config, `index.html`, sitemap, robots, both `netlify.toml` redirects, the demo's "Back" link, and the team portal's demo link in Settings). The netlify.app addresses keep working either way.

## What's in this folder

| Folder | What it is | Where it goes |
|---|---|---|
| `statsweep-site/` | Marketing site: hero, sources, problem, how it works, portal, who it's for, proof, offer, guarantees, FAQ, booking form | statsweep.com (Netlify) |
| `statsweep-demo/` | Fully working demo portal for a fictional courier (Bellwether Medical, Charlotte NC). 17 screens, 5 seats | demo.statsweep.com (Netlify, link-only, noindex) |
| `statsweep-command-center/` | Private sales portal for Azaiah and Tony: 3,146 real leads, a script kit per lead, dialer, pipeline, tasks, advisor, money, playbook | team.statsweep.com (Netlify + Netlify Blobs) |
| `brand/` | Logo (SVG mark, light and dark PNG lockups, 512 icon), link-preview image | everywhere |
| `leads/StatSweep-leads-2026-10-27.csv` | The same 3,146 leads as a spreadsheet | your records |

## Brand
- **Night route** `#0B1F33`: trust, the 5 am route. **Cryo teal** `#0B7C7E` / `#39D5CF`: clinical calm, cold chain, tech. **STAT red** `#D42A36`: urgency, used only for primary actions and deadlines. **Carbon-copy yellow** `#F6E7A8`: the chain-of-custody manifest, the hero object. **Sterile** `#F2F6F7` page background.
- Why: healthcare buyers read blue and teal as safe and calm; red signals urgency but needs neutrals around it; this niche's competitors all use a red cross on blue, so we use the language of the work itself instead (manifests, sealed bags, temperature logs, radar sweeps).
- Type: **Archivo** (expanded width, like fleet livery) for headlines, **Public Sans** (plain, US-government-form clarity) for text.
- Mark: a radar scope mid-sweep with a red medical blip where it just found something. Built as SVG, so no Kie.ai credits were used.

## Deploy (about 30 minutes)
1. Buy `statsweep.com`.
2. Push each of the three folders to its own GitHub repo (e.g. `azaiah/statsweep-site`, `azaiah/statsweep-demo`, `azaiah/statsweep-command-center`).
3. Netlify > Add new project > Import from GitHub, once per repo. Build settings come from each `netlify.toml`.
4. **Command Center only:** Project configuration > Environment variables:
   - `TEAM_PASSWORD`: the shared password for you and Tony
   - `INGEST_KEY`: a long random string for the weekly sweep
   - `ANTHROPIC_API_KEY` (optional): turns on "Get AI coaching" on the Advisor page
   Then open the site, sign in, pick your name and click **Load the first sweep** on the Command center.
5. Domains: `statsweep.com` to the site, `demo.statsweep.com` to the demo, `team.statsweep.com` to the Command Center.
6. Site: Netlify > Forms > `consultation` > add an email notification.

**No separate database needed.** The site and demo are static; the demo stores everything in the visitor's browser. The Command Center keeps its shared data in Netlify Blobs, which comes with Netlify.

## Confirm before launch (all in `statsweep-site/src/config/site.ts`, marked TODO)
- Prices: Contract Ready $4,997 + $497/mo, Route $1,997 + $297/mo (anchor), Launch $997 + $147/mo
- Guarantees: "Ten in thirty" and "Live in 21 days". Both are promises DataIsData has to keep
- Monthly intake number (honest scarcity): currently 6
- Sales email (`hello@statsweep.com`) and a phone number
- **Proof section uses CSL's real numbers without naming CSL** (59 opportunities, $2.8M estimated, $30K median, July 21 to Oct 14, 2026). Get Darren's OK before going live
- Privacy and Terms are starter text for counsel

## How the leads were found
YellowPages searches for "medical courier", "non emergency medical transportation", "medical transportation" and "wheelchair transportation" in 150 metros (every state), plus "medical delivery", "lab courier" and "pharmacy delivery service" in 70 metros. Kept only businesses that are both medical and transport. Removed fire and municipal services, volunteer squads, hospitals, air ambulance, national brokers and carriers, home-care franchises, toll-free-only listings and duplicates. Every listed website was opened over HTTPS on 2026-10-27.

Result: **3,146 operators in 51 states and DC**. 1,941 have no website of their own (YellowPages placeholder or nothing), 277 have a weak or broken one, and 928 have a working site and get the portal-and-engine pitch. By type: 1,647 NEMT and wheelchair, 1,331 non-emergency ambulance, 168 medical couriers.

Contact names and emails aren't in public listings. The scripts open with "Is this the owner?" and the lead card has one-tap Google, Facebook, Instagram and LinkedIn searches to find them.
