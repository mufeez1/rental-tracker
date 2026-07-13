import * as XLSX from 'xlsx'
import { cost, hoursBetween, fmtDateTime } from './utils'

export function exportXlsx(completed, totals) {
  const aoa = [['Tracker Report'], [`Generated ${new Date().toLocaleString()}`], [],
    ['Client', 'Start', 'End', 'Hours', 'Rate/hr', 'Amount', 'Paid', 'Note']]
  completed.slice().reverse().forEach((r) => {
    const h = hoursBetween(r.start_ts, r.end_ts)
    aoa.push([r.renter, fmtDateTime(r.start_ts), fmtDateTime(r.end_ts),
      Number(h.toFixed(2)), Number(r.rate_usd), Number(cost(r).toFixed(2)),
      r.paid ? 'Yes' : 'No', r.note || ''])
  })
  aoa.push([], ['', '', 'TOTAL', Number(totals.hrs.toFixed(2)), '', Number(totals.earned.toFixed(2)), '', ''])
  aoa.push(['', '', 'PAID', '', '', Number(totals.paid.toFixed(2)), '', ''])
  aoa.push(['', '', 'OUTSTANDING', '', '', Number(totals.due.toFixed(2)), '', ''])
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  ws['!cols'] = [{ wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 8 }, { wch: 9 }, { wch: 10 }, { wch: 6 }, { wch: 24 }]
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Rentals')
  XLSX.writeFile(wb, 'SUV-Rental-Report.xlsx')
}
