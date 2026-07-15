import { useEffect, useState } from 'react'
import { money, amount, fmtDuration, hoursBetween } from '../lib/utils'

/* Ticks itself every second so the page doesn't re-render on every tick. */
export default function LiveTimer({ active }) {
  const [, tick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <>
      <div className="timer-clock">{fmtDuration(hoursBetween(active.start_ts))}</div>
      <div className="timer-cost">{money(amount(active, new Date().toISOString()))}</div>
    </>
  )
}
