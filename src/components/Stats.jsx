import { money } from '../lib/utils'

export default function Stats({ totals }) {
  return (
    <>
      <section className="stats">
        <div className="stat"><div className="sv">{totals.hrs.toFixed(1)}</div><div className="sk">hours</div></div>
        <div className="stat"><div className="sv">{money(totals.earned - totals.expenses)}</div><div className="sk">time earned</div></div>
        <div className="stat"><div className="sv">{money(totals.expenses)}</div><div className="sk">expenses</div></div>
      </section>
      <section className="stats two">
        <div className="stat"><div className="sv">{money(totals.earned)}</div><div className="sk">total</div></div>
        <div className="stat due"><div className="sv">{money(totals.due)}</div><div className="sk">outstanding</div></div>
      </section>
    </>
  )
}
