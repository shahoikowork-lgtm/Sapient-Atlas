import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { lineItemFor, PLANS } from '@/lib/plans'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// $39/mo Continuous subscription. Intended to be offered after the first re-rating.
// Identified by result_token (V1); a logged-in path can be added with the dashboard.
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
  if (!diag) return NextResponse.json({ error: 'Diagnosis not found' }, { status: 404 })
  const { data: user } = await admin
    .from('users').select('id,email').eq('id', diag.user_id).maybeSingle()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  try {
    const session = await stripe.checkout.sessions.create({
      mode: PLANS.continuous.mode,
      line_items: [lineItemFor('continuous')],
      customer_email: user.email,
      success_url: `${site}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/upgrade/cancel`,
      metadata: { user_id: user.id, plan: 'continuous', result_token: body.token },
      subscription_data: { metadata: { user_id: user.id, plan: 'continuous' } },
    })
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[checkout/continuous] stripe error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Could not start checkout' }, { status: 500 })
  }
}
