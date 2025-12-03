// Supabase client configuration
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Lazy initialization to avoid build-time errors
let _supabase: SupabaseClient | null = null
let _supabaseAdmin: SupabaseClient | null = null

// Client-side Supabase client (uses anon key)
function getSupabaseClient(): SupabaseClient {
  if (!_supabase && supabaseUrl && supabaseAnonKey) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  }
  if (!_supabase) {
    throw new Error('Supabase client not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return _supabase
}

// Server-side Supabase client (uses service role key - bypasses RLS)
function getSupabaseAdminClient(): SupabaseClient {
  if (!_supabaseAdmin && supabaseUrl && supabaseServiceKey) {
    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  if (!_supabaseAdmin) {
    throw new Error('Supabase admin client not configured. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  }
  return _supabaseAdmin
}

// Export getter functions that lazily initialize
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    return (getSupabaseClient() as any)[prop]
  }
})

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    return (getSupabaseAdminClient() as any)[prop]
  }
})

// Helper to get server-side client for API routes
export function getSupabaseServer() {
  return getSupabaseAdminClient()
}
