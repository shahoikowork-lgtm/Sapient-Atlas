import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { fulfillCheckout, updateSubscriptionFromStripe } from '@/lib/payments'
import type { PlanKey } from '@/lib/plans'

export const runtime = 'nodejs'

// Stripe webhook. Verifies the signature against STRIPE_WEBHOOK_SECRET before any
// DB write. All writes go through the service role inside lib/payments.
export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!sig || !secret) {
    return NextResponse.json({ error: 'Missing signature/secret' }, { status: 400 })
  }

  const rawBody = await request.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object as Stripe.Checkout.Session
        const userId = s.metadata?.user_id
        const plan = s.metadata?.plan as PlanKey | undefined
        if (userId && (plan === 'sprint' || plan === 'continuous')) {
          await fulfillCheckout({
            userId,
            type: plan,
            stripeCustomerId: typeof s.customer === 'string' ? s.customer : (s.customer?.id ?? null),
            stripeSubId: typeof s.subscription === 'string' ? s.subscription : (s.subscription?.id ?? null),
          })
        }
        break
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await updateSubscriptionFromStripe(sub.id, sub.status)
        break
      }
      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break
    }
  } catch (err) {
    console.error('[stripe webhook] handler error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
