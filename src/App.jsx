import { useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from './supabaseClient'

/* ---------- helpers ---------- */
const pad = (n) => String(n).padStart(2, '0')
const money = (n) => '$' + (Number(n) || 0).toFixed(2)

function hoursBetween(startISO, endISO) {
  const s = new Date(startISO).getTime()
  const e = endISO ? new Date(endISO).getTime() : Date.now()
  return Math.max(0, (e - s) / 3600000)
}
function fmtDuration(h) {
  const totalSec = Math.round(h * 3600)
  const hh = Math.floor(totalSec / 3600)
  const mm = Math.floor((totalSec % 3600) / 60)
  const ss = totalSec % 60
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}`
}
function fmtDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}
// value for <input type="datetime-local"> in LOCAL time
function toLocalInput(iso) {
  const d = iso ? new Date(iso) : new Date()
  const off = d.getTimezoneOffset()
  const local = new Date(d.getTime() - off * 60000)
  return local.toISOString().slice(0, 16)
}
const cost = (r, endISO = r.end_ts) => hoursBetween(r.start_ts, endISO) * Number(r.rate_usd || 0)

export default function App() {
  const [rentals, setRentals] = useState([])
  const [rate, setRate] = useState(0)          // shared default rate
  const [rateInput, setRateInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [now, setNow] = useState(Date.now())

  const [renter, setRenter] = useState('')
  const [note, setNote] = useState('')
  const [editRow, setEditRow] = useState(null) // rental being edited

  /* tick every second for the live timer */
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  /* initial load + realtime */
  useEffect(() => {
    fetchAll()
    const ch = supabase
      .channel('rental_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rentals' }, fetchRentals)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rental_settings' }, fetchSettings)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  async function fetchAll() { await Promise.all([fetchRentals(), fetchSettings()]); setLoading(false) }

  async function fetchRentals() {
    const { data, error } = await supabase
      .from('rentals').select('*').order('start_ts', { ascending: false })
    if (error) setErr(error.message); else setRentals(data || [])
  }
  async function fetchSettings() {
    const { data, error } = await supabase.from('rental_settings').select('*').eq('id', 1).single()
    if (!error && data) {
      setRate(Number(data.default_rate))
      setRateInput(String(Number(data.default_rate)))
    }
  }
  async function saveRate() {
    const v = parseFloat(rateInput)
    if (isNaN(v) || v < 0) { alert('Enter a valid hourly rate.'); return }
    const { error } = await supabase.from('rental_settings')
      .upsert({ id: 1, default_rate: v, updated_at: new Date().toISOString() })
    if (error) setErr(error.message); else { setRate(v); fetchSettings() }
  }

  const active = useMemo(() => rentals.find((r) => !r.end_ts), [rentals])

  async function startTrip() {
    if (active) return
    if (rate <= 0) { alert('Set an hourly rate first.'); return }
    const { error } = await supabase.from('rentals').insert({
      renter: renter.trim() || 'Renter',
      start_ts: new Date().toISOString(),
      end_ts: null,
      rate_usd: rate,
      note: note.trim(),
    })
    if (error) setErr(error.message); else { setNote(''); fetchRentals() }
  }
  async function stopTrip() {
    if (!active) return
    const { error } = await supabase.from('rentals')
      .update({ end_ts: new Date().toISOString() }).eq('id', active.id)
    if (error) setErr(error.message); else fetchRentals()
  }
  async function togglePaid(r) {
    const { error } = await supabase.from('rentals').update({ paid: !r.paid }).eq('id', r.id)
    if (error) setErr(error.message); else fetchRentals()
  }
  async function delRow(id) {
    if (!confirm('Delete this rental?')) return
    const { error } = await supabase.from('rentals').delete().eq('id', id)
    if (error) setErr(error.message); else fetchRentals()
  }
  async function saveEdit() {
    const r = editRow
    const payload = {
      renter: r.renter.trim() || 'Renter',
      start_ts: new Date(r.start_ts).toISOString(),
      end_ts: r.end_ts ? new Date(r.end_ts).toISOString() : null,
      rate_usd: Number(r.rate_usd) || 0,
      note: r.note || '',
    }
    const { error } = await supabase.from('rentals').update(payload).eq('id', r.id)
    if (error) setErr(error.message); else { setEditRow(null); fetchRentals() }
  }

  /* totals (completed trips only) */
  const totals = useMemo(() => {
    let hrs = 0, earned = 0, paid = 0
    rentals.forEach((r) => {
      if (!r.end_ts) return
      const c = cost(r)
      hrs += hoursBetween(r.start_ts, r.end_ts)
      earned += c
      if (r.paid) paid += c
    })
    return { hrs, earned, paid, due: earned - paid }
  }, [rentals, now])

  function exportXlsx() {
    if (!rentals.length) { alert('No rentals to export.'); return }
    const aoa = [['Tracker Report'], [`Generated ${new Date().toLocaleString()}`], [],
      ['Client', 'Start', 'End', 'Hours', 'Rate/hr', 'Amount', 'Paid', 'Note']]
    const done = rentals.filter((r) => r.end_ts).slice().reverse()
    done.forEach((r) => {
      const h = hoursBetween(r.start_ts, r.end_ts)
      aoa.push([r.renter, fmtDateTime(r.start_ts), fmtDateTime(r.end_ts),
        Number(h.toFixed(2)), Number(r.rate_usd), Number(cost(r).toFixed(2)),
        r.paid ? 'Yes' : 'No', r.note || ''])
    })
    aoa.push([], ['', '', 'TOTAL', Number(totals.hrs.toFixed(2)), '',
      Number(totals.earned.toFixed(2)), '', ''])
    aoa.push(['', '', 'PAID', '', '', Number(totals.paid.toFixed(2)), '', ''])
    aoa.push(['', '', 'OUTSTANDING', '', '', Number(totals.due.toFixed(2)), '', ''])
    const ws = XLSX.utils.aoa_to_sheet(aoa)
    ws['!cols'] = [{ wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 8 }, { wch: 9 }, { wch: 10 }, { wch: 6 }, { wch: 24 }]
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Rentals')
    XLSX.writeFile(wb, 'SUV-Rental-Report.xlsx')
  }

  const liveHours = active ? hoursBetween(active.start_ts) : 0

  return (
    <div className="app">
      <header className="top">
        <div className="brand">🚙 Tracker</div>
        <div className="rate-badge">{money(rate)}/hr</div>
      </header>

      {err && <div className="err">⚠️ {err}</div>}

      {/* Rate setting */}
      <section className="card">
        <label className="lbl">Hourly rate (USD)</label>
        <div className="rate-row">
          <span className="dollar">$</span>
          <input className="rate-input" type="number" inputMode="decimal" min="0" step="0.5"
            value={rateInput} onChange={(e) => setRateInput(e.target.value)} placeholder="0.00" />
          <button className="btn small" onClick={saveRate}>Save</button>
        </div>
      </section>

      {/* Live timer / start-stop */}
      <section className={`card timer ${active ? 'running' : ''}`}>
        {active ? (
          <>
            <div className="timer-renter">{active.renter}{active.note ? ` · ${active.note}` : ''}</div>
            <div className="timer-clock">{fmtDuration(liveHours)}</div>
            <div className="timer-cost">{money(cost(active, new Date().toISOString()))}</div>
            <div className="timer-sub">since {fmtDateTime(active.start_ts)} · {money(active.rate_usd)}/hr</div>
            <button className="btn stop big" onClick={stopTrip}>■ Stop trip</button>
          </>
        ) : (
          <>
            <input className="field" placeholder="Client name"
              value={renter} onChange={(e) => setRenter(e.target.value)} />
            <input className="field" placeholder="Note (optional) — e.g. airport run"
              value={note} onChange={(e) => setNote(e.target.value)} />
            <button className="btn start big" onClick={startTrip}>▶ Start trip</button>
          </>
        )}
      </section>

      {/* Totals */}
      <section className="stats">
        <div className="stat"><div className="sv">{totals.hrs.toFixed(1)}</div><div className="sk">hours</div></div>
        <div className="stat"><div className="sv">{money(totals.earned)}</div><div className="sk">earned</div></div>
        <div className="stat due"><div className="sv">{money(totals.due)}</div><div className="sk">outstanding</div></div>
      </section>

      <div className="list-head">
        <span>Rentals</span>
        <button className="btn tiny" onClick={exportXlsx}>Export Excel</button>
      </div>

      {/* Rentals list */}
      {loading ? (
        <div className="empty">Loading…</div>
      ) : rentals.filter((r) => r.end_ts).length === 0 ? (
        <div className="empty">No completed rentals yet. Start a trip above.</div>
      ) : (
        <div className="rentals">
          {rentals.filter((r) => r.end_ts).map((r) => (
            <div className="rental" key={r.id}>
              <div className="r-main">
                <div className="r-name">{r.renter}</div>
                <div className="r-time">{fmtDateTime(r.start_ts)} → {fmtDateTime(r.end_ts)}</div>
                {r.note && <div className="r-note">{r.note}</div>}
                <div className="r-meta">{fmtDuration(hoursBetween(r.start_ts, r.end_ts))} · {money(r.rate_usd)}/hr</div>
              </div>
              <div className="r-right">
                <div className="r-amount">{money(cost(r))}</div>
                <button className={`chip ${r.paid ? 'paid' : 'unpaid'}`} onClick={() => togglePaid(r)}>
                  {r.paid ? '✓ Paid' : 'Unpaid'}
                </button>
                <div className="r-actions">
                  <button className="lnk" onClick={() => setEditRow({ ...r, start_ts: toLocalInput(r.start_ts), end_ts: toLocalInput(r.end_ts) })}>Edit</button>
                  <button className="lnk danger" onClick={() => delRow(r.id)}>Del</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="foot">Installable app · Live sync via Supabase · Amounts in USD</p>

      {/* Edit sheet */}
      {editRow && (
        <div className="modal" onClick={(e) => { if (e.target.classList.contains('modal')) setEditRow(null) }}>
          <div className="sheet">
            <h3>Edit rental</h3>
            <label className="lbl">Renter</label>
            <input className="field" value={editRow.renter} onChange={(e) => setEditRow({ ...editRow, renter: e.target.value })} />
            <label className="lbl">Start</label>
            <input className="field" type="datetime-local" value={editRow.start_ts} onChange={(e) => setEditRow({ ...editRow, start_ts: e.target.value })} />
            <label className="lbl">End</label>
            <input className="field" type="datetime-local" value={editRow.end_ts || ''} onChange={(e) => setEditRow({ ...editRow, end_ts: e.target.value })} />
            <label className="lbl">Rate/hr (USD)</label>
            <input className="field" type="number" min="0" step="0.5" value={editRow.rate_usd} onChange={(e) => setEditRow({ ...editRow, rate_usd: e.target.value })} />
            <label className="lbl">Note</label>
            <input className="field" value={editRow.note || ''} onChange={(e) => setEditRow({ ...editRow, note: e.target.value })} />
            <div className="sheet-btns">
              <button className="btn ghost" onClick={() => setEditRow(null)}>Cancel</button>
              <button className="btn start" onClick={saveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
