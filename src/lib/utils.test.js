// Runnable self-check: `node src/utils.test.js`. No framework.
import assert from 'node:assert'
import { money, fmtDuration, hoursBetween, cost, totalsOf } from './utils.js' // same folder — unchanged

assert.equal(money(12.5), '$12.50')
assert.equal(money(null), '$0.00')
assert.equal(fmtDuration(1.5), '01:30:00')
assert.equal(hoursBetween('2026-01-01T00:00:00Z', '2026-01-01T02:00:00Z'), 2)
assert.equal(hoursBetween('2026-01-01T02:00:00Z', '2026-01-01T00:00:00Z'), 0) // clamps negatives

const r = { start_ts: '2026-01-01T00:00:00Z', end_ts: '2026-01-01T02:00:00Z', rate_usd: 10, paid: true }
assert.equal(cost(r), 20)

const t = totalsOf([r, { ...r, paid: false }, { start_ts: '2026-01-01T00:00:00Z', end_ts: null, rate_usd: 10 }])
assert.equal(t.earned, 40) // active trip excluded
assert.equal(t.paid, 20)
assert.equal(t.due, 20)

console.log('utils.test.js: all passed')
