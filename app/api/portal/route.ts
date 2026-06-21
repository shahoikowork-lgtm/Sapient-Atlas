import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// Customer Portal session (allows cancellation / payment-method updates).
// Identified by result_token -> the user's Stripe customer.
export async function POST(request: Request) {
  let body: { token?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (!body.token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

  const admin = createAdminClient()
  const { data: diag } = await admin
    .from('diagnoses').select('user_id').eq('result_token', body.token).maybeSingle()
  if (!diag) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: sub } = await admin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', diag.user_id)
    .not('stripe_customer_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: 'No billing account yet' }, { status: 404 })
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${site}/results/${body.token}`,
    })
    return NextResponse.json({ url: portal.url })
  } catch (err) {
    console.error('[portal] stripe error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Could not open billing portal' }, { status: 500 })
  }
}
