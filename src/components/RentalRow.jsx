import { money, amount, cost, expensesTotal, fmtDuration, fmtDateTime, hoursBetween, toLocalInput } from '../lib/utils'

export default function RentalRow({ r, onTogglePaid, onEdit, onDelete }) {
  return (
    <div className="rental">
      <div className="r-main">
        <div className="r-name">{r.renter}</div>
        <div className="r-time">{fmtDateTime(r.start_ts)} → {fmtDateTime(r.end_ts)}</div>
        {r.note && <div className="r-note">{r.note}</div>}
        <div className="r-meta">{fmtDuration(hoursBetween(r.start_ts, r.end_ts))} · {money(r.rate_usd)}/hr</div>
        {expensesTotal(r) > 0 && (
          <div className="r-meta">{(r.expenses || []).map((e) => e.type).join(', ')}</div>
        )}
      </div>
      <div className="r-right">
        {expensesTotal(r) > 0 && (
          <div className="r-split">
            <span>Rental {money(cost(r))}</span>
            <span>Expenses {money(expensesTotal(r))}</span>
          </div>
        )}
        <div className="r-amount">{money(amount(r))}</div>
        <button className={`chip ${r.paid ? 'paid' : 'unpaid'}`} onClick={() => onTogglePaid(r)}>
          {r.paid ? '✓ Paid' : 'Unpaid'}
        </button>
        <div className="r-actions">
          <button className="lnk" onClick={() => onEdit({ ...r, start_ts: toLocalInput(r.start_ts), end_ts: toLocalInput(r.end_ts) })}>Edit</button>
          <button className="lnk danger" onClick={() => onDelete(r.id)}>Del</button>
        </div>
      </div>
    </div>
  )
}
