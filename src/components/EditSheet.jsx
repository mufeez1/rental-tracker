import ExpensesEditor from './ExpensesEditor'

/* Controlled edit sheet. `row` is the working copy held by the parent. */
export default function EditSheet({ row, onChange, onCancel, onSave }) {
  const set = (patch) => onChange({ ...row, ...patch })
  return (
    <div className="modal" onClick={(e) => { if (e.target.classList.contains('modal')) onCancel() }}>
      <div className="sheet">
        <h3>Edit rental</h3>
        <label className="lbl">Renter</label>
        <input className="field" value={row.renter} onChange={(e) => set({ renter: e.target.value })} />
        <label className="lbl">Start</label>
        <input className="field" type="datetime-local" value={row.start_ts} onChange={(e) => set({ start_ts: e.target.value })} />
        <label className="lbl">End</label>
        <input className="field" type="datetime-local" value={row.end_ts || ''} onChange={(e) => set({ end_ts: e.target.value })} />
        <label className="lbl">Rate/hr (USD)</label>
        <input className="field" type="number" min="0" step="0.5" value={row.rate_usd} onChange={(e) => set({ rate_usd: e.target.value })} />
        <label className="lbl">Note</label>
        <input className="field" value={row.note || ''} onChange={(e) => set({ note: e.target.value })} />
        <label className="lbl">Expenses</label>
        <ExpensesEditor expenses={row.expenses} onChange={(next) => set({ expenses: next })} />
        <div className="sheet-btns">
          <button className="btn ghost" onClick={onCancel}>Cancel</button>
          <button className="btn start" onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  )
}
