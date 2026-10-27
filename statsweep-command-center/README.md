# StatSweep Command Center (internal team portal)

The private sales portal for Azaiah and Tony. It's the Gundy Command Center architecture, rebuilt for medical couriers and NEMT operators.

- **3,146 real leads** in 51 states and DC, split by time zone, with call windows in each lead's local time
- **A script kit for every lead**, written from that company's facts at open time: call (Voss: accusation audit, labels, calibrated and no-oriented questions), voicemail, text, email with 3 subjects, LinkedIn, Instagram, Facebook and a 21-day follow-up plan
- Contact log on every lead (call, text, email, social, in person; results schedule the next touch automatically; "said stop" marks do-not-contact for both of you)
- Call block (power hour), Pipeline, Tasks, Idea board, Advisor (weekly close rate plus optional AI coaching), Money (Profit First split, safe payout, runway), Playbook (Hormozi offer, Voss and Smith & Gaunt, CLOSER, objections, cadence, rules), Research (where the work comes from, operator briefs, glossary, sources), Growth plan calculator, Sweeps, Settings, built-in guide

## How it works
- **Front end:** React, bundled by `build.mjs` (esbuild) into one page, `dist/index.html`.
- **Back end:** one Netlify Function (`netlify/functions/api.mjs`) storing everything in **Netlify Blobs**. No database account needed.
- **Live:** the page checks for changes every 4 seconds, so you see each other's calls, claims and notes almost immediately.
- **Sign-in:** one shared team password (once per device), then pick Azaiah or Tony.
- **Weekly sweep:** a scheduled Claude run can post new leads to `/api/ingest` with the `INGEST_KEY`. It can only add leads and sweep records.

## Netlify setup
1. Import the repo. Build settings come from `netlify.toml`.
2. Environment variables: `TEAM_PASSWORD` (required), `INGEST_KEY` (for the weekly sweep), `ANTHROPIC_API_KEY` (optional AI coach).
3. Deploy, sign in, pick your name, then click **Load the first sweep** on the Command center. It loads in slices, runs once and never overwrites anything.
4. Settings: enter each person's callback number (fills `{{myphone}}` in scripts) and the demo link (fills `{{demo}}`).

## Local
```bash
npm install
npm run build
npx netlify-cli dev   # site + functions locally
```

## Files
```
src/app.jsx                 the app (pages, lead drawer, contact log, dialer, money, advisor)
src/content.js              playbook, research library, growth plan, and scriptsFor(lead), the script generator
src/store.js                talks to /api, polls for changes, applies edits instantly
src/guide.jsx               walkthrough tour
src/styles.css              StatSweep tokens (dark and light)
netlify/functions/api.mjs   login, sync, writes, ingest, seed, AI coach
netlify/functions/seed-data.mjs   the first sweep (2026-10-27)
```
