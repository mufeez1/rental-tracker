import { money, fmtDateTime } from '../lib/utils'
import LiveTimer from './LiveTimer'
import ExpensesEditor from './ExpensesEditor'

/* Running trip → live timer + expenses + stop. Idle → start form. */
export default function TripCard({ active, renter, note, onRenter, onNote, onStart, onStop, onExpenses }) {
  return (
    <section className={`card timer ${active ? 'running' : ''}`}>
      {active ? (
        <>
          <div className="timer-renter">{active.renter}{active.note ? ` · ${active.note}` : ''}</div>
          <LiveTimer active={active} />
          <div className="timer-sub">since {fmtDateTime(active.start_ts)} · {money(active.rate_usd)}/hr</div>
          <label className="lbl">Expenses</label>
          <ExpensesEditor expenses={active.expenses} onChange={(next) => onExpenses(active, next)} />
          <button className="btn stop big" onClick={onStop}>■ Stop trip</button>
        </>
      ) : (
        <>
          <input className="field" placeholder="Client name" value={renter} onChange={(e) => onRenter(e.target.value)} />
          <input className="field" placeholder="Note (optional) — e.g. airport run" value={note} onChange={(e) => onNote(e.target.value)} />
          <button className="btn start big" onClick={onStart}>▶ Start trip</button>
        </>
      )}
    </section>
  )
}
