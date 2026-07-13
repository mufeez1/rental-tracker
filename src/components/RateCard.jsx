export default function RateCard({ value, onChange, onSave }) {
  return (
    <section className="card">
      <label className="lbl">Hourly rate (USD)</label>
      <div className="rate-row">
        <span className="dollar">$</span>
        <input className="rate-input" type="number" inputMode="decimal" min="0" step="0.5"
          value={value} onChange={(e) => onChange(e.target.value)} placeholder="0.00" />
        <button className="btn small" onClick={onSave}>Save</button>
      </div>
    </section>
  )
}
