# StatSweep demo portal

A fully working sample of the portal StatSweep builds, for a fictional courier and NEMT company, **Bellwether Medical** (Charlotte, NC). Share it by link only. It is `noindex` and can't be framed.

Visitors sign in with anything, pick a seat (Owner, Dispatcher, Driver, Billing, Customer) and see what that person sees. Everything is saved in their browser and **Reset demo** restores it.

```bash
npm install
npm run dev
npm run build
```

## Screens
- **Find work:** Dashboard, Bids and leads (fit score with a factor breakdown, drafted email and call script, no-bid with reason), Sweeps (Run sweep now adds new finds stamped with the time), Pipeline (drag or Move to), Outreach (Draft, Approved, Sent, Replied), Weekly briefing with a 14-day deadline calendar, Company Brain (change anything and every score updates)
- **Run the work:** Dispatch (routes, STAT, pickup requests from customers, chain of custody, 2 to 8 °C cooler log, reassign with credential blocking), NEMT trips (on-time rate, no-shows, broker vs private pay), Driver app (phone frame, arrival, signature pad, photo, GPS), Drivers and fleet (expiry tracking; expired items block dispatch)
- **Money:** Customers, Quotes (rate card with STAT, after-hours, weekend, wait, temperature and NEMT), Invoices (aging, mark paid, printable)
- **More:** Customer portal (what a lab sees, with a pickup request form), Documents (capability statement and Broker-Ready Packet, printable), Settings

All sample organizations are fictional and marked "(sample)". Source links point to the real portals where that kind of work is posted.

Code: `src/lib` (types, seed, scoring, store, outreach templates, help text), `src/modules` (screens), `src/layout` (shell, sign-in), `src/components` (UI kit).
