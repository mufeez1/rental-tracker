import { useState } from 'react'
import { useRentals } from '../hooks/useRentals'
import { money } from '../lib/utils'
import { exportXlsx } from '../lib/exportXlsx'
import RateCard from '../components/RateCard'
import TripCard from '../components/TripCard'
import Stats from '../components/Stats'
import RentalRow from '../components/RentalRow'
import EditSheet from '../components/EditSheet'

export default function HomePage() {
  const { rentals, completed, active, rate, totals, loading, err,
    saveRate, startTrip, stopTrip, togglePaid, del, saveEdit, updateExpenses } = useRentals()

  const [rateInput, setRateInput] = useState('')
  const [renter, setRenter] = useState('')
  const [note, setNote] = useState('')
  const [editRow, setEditRow] = useState(null)

  // rate loads async; seed the input the first time it arrives
  if (rateInput === '' && rate) setRateInput(String(rate))

  function onSaveRate() {
    const v = parseFloat(rateInput)
    if (isNaN(v) || v < 0) { alert('Enter a valid hourly rate.'); return }
    saveRate(v)
  }
  function onStart() {
    if (active) return
    if (rate <= 0) { alert('Set an hourly rate first.'); return }
    startTrip({ renter, note })
    setNote('')
  }
  function onExport() {
    if (!rentals.length) { alert('No rentals to export.'); return }
    exportXlsx(completed, totals)
  }
  function onDelete(id) { if (confirm('Delete this rental?')) del(id) }

  return (
    <div className="app">
      <header className="top">
        <div className="brand">🚙 Tracker</div>
        <div className="rate-badge">{money(rate)}/hr</div>
      </header>

      {err && <div className="err">⚠️ {err}</div>}

      <RateCard value={rateInput} onChange={setRateInput} onSave={onSaveRate} />
      <TripCard active={active} renter={renter} note={note}
        onRenter={setRenter} onNote={setNote} onStart={onStart} onStop={() => stopTrip(active)}
        onExpenses={updateExpenses} />
      <Stats totals={totals} />

      <div className="list-head">
        <span>Rentals</span>
        <button className="btn tiny" onClick={onExport}>Export Excel</button>
      </div>

      {loading ? (
        <div className="empty">Loading…</div>
      ) : completed.length === 0 ? (
        <div className="empty">No completed rentals yet. Start a trip above.</div>
      ) : (
        <div className="rentals">
          {completed.map((r) => (
            <RentalRow key={r.id} r={r} onTogglePaid={togglePaid} onEdit={setEditRow} onDelete={onDelete} />
          ))}
        </div>
      )}

      <p className="foot">Installable app · Live sync via Supabase · Amounts in USD</p>

      {editRow && (
        <EditSheet row={editRow} onChange={setEditRow}
          onCancel={() => setEditRow(null)}
          onSave={() => { saveEdit(editRow); setEditRow(null) }} />
      )}
    </div>
  )
}
