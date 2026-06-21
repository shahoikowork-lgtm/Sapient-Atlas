import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export function isAdmin(email?: string | null) {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase())
}

// Returns the signed-in auth user, or null.
export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Server-side gate for /app pages. Redirects to /login if not signed in.
export async function requireUser() {
  const user = await getUser()
  if (!user) redirect('/login')
  return user
}

// Server-side gate for /admin pages. Redirects non-admins to /app.
export async function requireAdmin() {
  const user = await requireUser()
  if (!isAdmin(user.email)) redirect('/app')
  return user
}
