import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL       = (import.meta.env.VITE_SUPABASE_URL      as string) ?? ''
const SUPABASE_ANON_KEY  = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? ''

export const supabase = createClient(
  SUPABASE_URL      || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-anon-key',
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
)

export const supabaseConfigured =
  !!SUPABASE_URL && SUPABASE_URL !== 'https://placeholder.supabase.co'

export type AuthProvider = 'google' | 'github'
