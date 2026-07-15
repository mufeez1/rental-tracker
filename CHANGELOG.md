# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/); this project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Per-trip expenses (Toll, Fuel, Car Wash, Parking, Tip, Water, Miscellaneous). Add them live on the running trip or later via the edit sheet. Expenses are reimbursable — they're added to the client's amount owed, and appear in the rental list, live total, and Excel export (with a Time/Expenses breakdown). Requires the `expenses` column: run `supabase/add_expenses_column.sql`.

### Changed
- Restructured `src/` into `pages/`, `components/`, `hooks/`, and `lib/` folders — no behavior change.
- Extracted all Supabase I/O, realtime subscriptions, and totals into a `useRentals` hook; a single `mutate()` helper replaced the error-handle-then-refetch pattern that was duplicated across every write.
- Split the single `App.jsx` screen into presentational components: `RateCard`, `TripCard`, `LiveTimer`, `Stats`, `RentalRow`, `EditSheet`. `App.jsx` is now a thin shell rendering `HomePage`.
- Moved pure helpers (`money`, `hoursBetween`, `cost`, `totalsOf`, …) into `lib/utils.js` and the Excel export into `lib/exportXlsx.js`.

### Fixed
- The live trip timer now ticks inside its own `LiveTimer` component, so the whole app no longer re-renders every second.

### Added
- `lib/utils.test.js` — runnable self-check for the money/duration/totals math (`node src/lib/utils.test.js`).

## [1.0.0]

- Initial release: SUV rental time tracker with live timer, hourly rate, paid/unpaid tracking, edit, and Excel export, backed by Supabase with realtime sync.
