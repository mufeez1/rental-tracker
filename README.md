# 🚙 Tracker (PWA)

A mobile-first, installable app to track rental hours and bill by the hour (USD).
Built with React + Vite + Supabase. Live Start/Stop timer captures exact time; each trip
shows the running cost. Supports multiple renters, per-trip Paid toggle, running totals,
and an Excel export for invoicing.

## Install on a phone
Open the site in the phone browser, then:
- **iPhone (Safari):** Share → *Add to Home Screen*
- **Android (Chrome):** menu → *Install app* / *Add to Home screen*

It then runs full-screen like a native app and works offline for the shell.

## Run locally
```bash
npm install
npm run dev
```

## Deploy
Already wired to a Supabase database (URL + public key baked into
`src/supabaseClient.js`; safe to expose — protected by Row Level Security).

- **Netlify:** `npm run build` then deploy the `dist/` folder (or connect the repo).
- **GitHub repo (optional):** `./deploy.sh suv-rental-tracker` creates the repo and pushes.

## Data model (Supabase)
- `rentals` — one row per trip: renter, start_ts, end_ts, rate_usd, note, paid.
- `rental_settings` — singleton row holding the shared default hourly rate.
