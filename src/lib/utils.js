/* Pure formatting + rental math. No React, no Supabase — importable anywhere, testable. */
export const pad = (n) => String(n).padStart(2, '0')
export const money = (n) => '$' + (Number(n) || 0).toFixed(2)

export function hoursBetween(startISO, endISO) {
  const s = new Date(startISO).getTime()
  const e = endISO ? new Date(endISO).getTime() : Date.now()
  return Math.max(0, (e - s) / 3600000)
}

export function fmtDuration(h) {
  const totalSec = Math.round(h * 3600)
  const hh = Math.floor(totalSec / 3600)
  const mm = Math.floor((totalSec % 3600) / 60)
  const ss = totalSec % 60
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}`
}

export function fmtDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

// value for <input type="datetime-local"> in LOCAL time
export function toLocalInput(iso) {
  const d = iso ? new Date(iso) : new Date()
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

export const cost = (r, endISO = r.end_ts) =>
  hoursBetween(r.start_ts, endISO) * Number(r.rate_usd || 0)

// Totals across completed trips only.
export function totalsOf(rentals) {
  let hrs = 0, earned = 0, paid = 0
  for (const r of rentals) {
    if (!r.end_ts) continue
    const c = cost(r)
    hrs += hoursBetween(r.start_ts, r.end_ts)
    earned += c
    if (r.paid) paid += c
  }
  return { hrs, earned, paid, due: earned - paid }
}
