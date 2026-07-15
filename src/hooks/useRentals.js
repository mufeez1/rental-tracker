import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { totalsOf } from '../lib/utils'

/* All rental data + Supabase I/O in one place. Component just renders what it returns. */
export function useRentals() {
  const [rentals, setRentals] = useState([])
  const [rate, setRate] = useState(0)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  async function fetchRentals() {
    const { data, error } = await supabase
      .from('rentals').select('*').order('start_ts', { ascending: false })
    if (error) setErr(error.message)
    else setRentals(data || [])
  }
  async function fetchSettings() {
    const { data, error } = await supabase
      .from('rental_settings').select('*').eq('id', 1).single()
    if (!error && data) setRate(Number(data.default_rate))
  }

  // Run a Supabase write, surface its error, refetch on success. Collapses the 6x repeat.
  const mutate = async (query, after = fetchRentals) => {
    const { error } = await query
    if (error) setErr(error.message)
    else await after()
  }

  useEffect(() => {
    Promise.all([fetchRentals(), fetchSettings()]).then(() => setLoading(false))
    const ch = supabase
      .channel('rental_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rentals' }, fetchRentals)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rental_settings' }, fetchSettings)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  const active = useMemo(() => rentals.find((r) => !r.end_ts), [rentals])
  const completed = useMemo(() => rentals.filter((r) => r.end_ts), [rentals])
  const totals = useMemo(() => totalsOf(rentals), [rentals])

  const api = {
    saveRate: (v) => mutate(
      supabase.from('rental_settings').upsert({ id: 1, default_rate: v, updated_at: new Date().toISOString() }),
      fetchSettings,
    ),
    startTrip: ({ renter, note }) => mutate(supabase.from('rentals').insert({
      renter: renter.trim() || 'Renter', start_ts: new Date().toISOString(),
      end_ts: null, rate_usd: rate, note: note.trim(), expenses: [],
    })),
    stopTrip: (r) => mutate(supabase.from('rentals').update({ end_ts: new Date().toISOString() }).eq('id', r.id)),
    updateExpenses: (r, expenses) => mutate(supabase.from('rentals').update({ expenses }).eq('id', r.id)),
    togglePaid: (r) => mutate(supabase.from('rentals').update({ paid: !r.paid }).eq('id', r.id)),
    del: (id) => mutate(supabase.from('rentals').delete().eq('id', id)),
    saveEdit: (r) => mutate(supabase.from('rentals').update({
      renter: r.renter.trim() || 'Renter',
      start_ts: new Date(r.start_ts).toISOString(),
      end_ts: r.end_ts ? new Date(r.end_ts).toISOString() : null,
      rate_usd: Number(r.rate_usd) || 0, note: r.note || '',
      expenses: r.expenses || [],
    }).eq('id', r.id)),
  }

  return { rentals, completed, active, rate, totals, loading, err, ...api }
}
