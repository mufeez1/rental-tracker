import { createClient } from '@supabase/supabase-js'

// Public values — safe to ship. The database is protected by Row Level Security.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
