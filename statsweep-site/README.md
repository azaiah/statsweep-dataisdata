# StatSweep marketing site

Vite + React 18 + TypeScript + Tailwind 3 + framer-motion + lucide-react. Fonts are self-hosted (Fontsource), so there are no Google Fonts calls.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # typecheck + build to dist/
```

- Every business detail, price, guarantee and the monthly intake number lives in `src/config/site.ts`. Search for `TODO`.
- The booking form posts to Netlify Forms (`consultation`). The hidden copy in `index.html` lets Netlify detect it. If the POST fails, visitors get a copy-and-email fallback.
- `/demo` redirects to `https://demo.statsweep.com` (see `netlify.toml`). Change it if the demo lives elsewhere.
- `public/go.html` is the call/text/email relay the Command Center can use on phones that block `tel:` and `sms:` links in web apps.
- `public/og-image.png` is the link preview (1200x630). The source is `../brand/og.html`.
