import { useState } from 'react'
import { EXPENSE_TYPES, money } from '../lib/utils'

/* Controlled list of trip expenses. `expenses` is an array of { type, amount, note };
   onChange gets the next array. Persistence is the parent's job. */
export default function ExpensesEditor({ expenses = [], onChange }) {
  const [type, setType] = useState(EXPENSE_TYPES[0])
  const [amount, setAmount] = useState('')

  function add() {
    const v = parseFloat(amount)
    if (isNaN(v) || v < 0) { alert('Enter a valid expense amount.'); return }
    onChange([...expenses, { type, amount: v, note: '' }])
    setAmount('')
  }
  const remove = (i) => onChange(expenses.filter((_, idx) => idx !== i))

  return (
    <div className="expenses">
      {expenses.length > 0 && (
        <ul className="exp-list">
          {expenses.map((e, i) => (
            <li key={i} className="exp-item">
              <span>{e.type}</span>
              <span className="exp-amt">{money(e.amount)}</span>
              <button className="lnk danger" onClick={() => remove(i)}>✕</button>
            </li>
          ))}
        </ul>
      )}
      <div className="exp-add">
        <select className="field" value={type} onChange={(e) => setType(e.target.value)}>
          {EXPENSE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input className="field" type="number" inputMode="decimal" min="0" step="0.5"
          placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <button className="btn small" onClick={add}>+ Add</button>
      </div>
    </div>
  )
}
