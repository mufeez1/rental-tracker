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
- **GitHub repo (optional):** `./deploy.sh rental-tracker` creates the repo and pushes.

## Data model (Supabase)
- `rentals` — one row per trip: renter, start_ts, end_ts, rate_usd, note, paid, created_at, expenses.
- `rental_settings` — singleton row holding the shared default hourly rate.
- <img width="289" height="520" alt="image" src="https://github.com/user-attachments/assets/00ac5162-8e1b-4261-ae3f-5ee2d7754d34" />

## App Preview
<img width="523" height="731" alt="image" src="https://github.com/user-attachments/assets/1205765f-54af-48fa-8eee-4bd71d8bff80" />

<img width="600" height="704" alt="image" src="https://github.com/user-attachments/assets/cbd43d6e-25fc-4adc-8f53-94ba7a1fcd0c" />


