'use server'

import { redirect } from 'next/navigation'
import { requireAppUser } from '@/lib/app-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'

// Opens the Stripe Customer Portal for the signed-in user. Service role is used only to
// look up the Stripe customer id; the portal session itself returns to /app/settings.
export async function openBillingPortal() {
  const user = await requireAppUser()
  const admin = createAdminClient()

  const { data: sub } = await admin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .not('stripe_customer_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!sub?.stripe_customer_id) redirect('/app/settings?portal=none')

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const portal = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${site}/app/settings`,
  })
  redirect(portal.url)
}
