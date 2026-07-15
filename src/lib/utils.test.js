// Runnable self-check: `node src/utils.test.js`. No framework.
import assert from 'node:assert'
import { money, fmtDuration, hoursBetween, cost, amount, expensesTotal, totalsOf } from './utils.js'

assert.equal(money(12.5), '$12.50')
assert.equal(money(null), '$0.00')
assert.equal(fmtDuration(1.5), '01:30:00')
assert.equal(hoursBetween('2026-01-01T00:00:00Z', '2026-01-01T02:00:00Z'), 2)
assert.equal(hoursBetween('2026-01-01T02:00:00Z', '2026-01-01T00:00:00Z'), 0) // clamps negatives

const r = {
  start_ts: '2026-01-01T00:00:00Z', end_ts: '2026-01-01T02:00:00Z', rate_usd: 10, paid: true,
  expenses: [{ type: 'Toll', amount: 8 }, { type: 'Fuel', amount: '22' }],
}
assert.equal(cost(r), 20)            // time only
assert.equal(expensesTotal(r), 30)   // string amounts coerced
assert.equal(amount(r), 50)          // time + expenses
assert.equal(expensesTotal({}), 0)   // missing expenses -> 0

const t = totalsOf([r, { ...r, paid: false }, { start_ts: '2026-01-01T00:00:00Z', end_ts: null, rate_usd: 10 }])
assert.equal(t.earned, 100)  // 50 + 50, active trip excluded
assert.equal(t.expenses, 60)
assert.equal(t.paid, 50)
assert.equal(t.due, 50)

console.log('utils.test.js: all passed')
