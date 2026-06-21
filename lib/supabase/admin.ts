import { createClient } from '@supabase/supabase-js'

// Service-role client. SERVER ONLY, bypasses RLS. Never import in a client component.
// All privileged writes go through this.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}
