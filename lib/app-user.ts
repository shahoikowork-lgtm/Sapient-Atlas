import { cache } from 'react'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export type AppUser = {
  id: string
  email: string
  name: string | null
  status: string
}

// Resolve the app `users` row for the logged-in auth user. On first login we link the
// pre-auth diagnosis/payment row (auth_user_id IS NULL) to this auth user by email.
// The link write needs the service role; cached so it runs once per request.
export const getAppUser = cache(async (): Promise<AppUser | null> => {
  const authUser = await getUser()
  if (!authUser) return null
  const admin = createAdminClient()

  const { data: byAuth } = await admin
    .from('users')
    .select('id,email,name,status')
    .eq('auth_user_id', authUser.id)
    .maybeSingle()
  if (byAuth) return byAuth as AppUser

  if (authUser.email) {
    const { data: linked } = await admin
      .from('users')
      .update({ auth_user_id: authUser.id })
      .eq('email', authUser.email)
      .is('auth_user_id', null)
      .select('id,email,name,status')
      .maybeSingle()
    if (linked) return linked as AppUser

    const { data: existing } = await admin
      .from('users')
      .select('id,email,name,status')
      .eq('email', authUser.email)
      .maybeSingle()
    if (existing) return existing as AppUser
  }
  return null
})

// Gate for /app pages: redirect to /login if signed out, or /diagnosis if signed in
// without a workspace yet.
export async function requireAppUser(): Promise<AppUser> {
  const user = await getAppUser()
  if (user) return user
  const authUser = await getUser()
  redirect(authUser ? '/diagnosis' : '/login')
}
