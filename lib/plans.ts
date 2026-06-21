import type Stripe from 'stripe'

// Pricing ladder: Free Diagnosis -> $149 Value Sprint (one-time) -> $39/mo Continuous.
export type PlanKey = 'sprint' | 'continuous'

type PlanDef = {
  mode: Stripe.Checkout.SessionCreateParams.Mode
  amount: number // cents
  label: string
  interval: 'month' | null
  priceEnv: string
}

export const PLANS: Record<PlanKey, PlanDef> = {
  sprint: { mode: 'payment', amount: 14900, label: 'Value Sprint', interval: null, priceEnv: 'STRIPE_PRICE_SPRINT' },
  continuous: { mode: 'subscription', amount: 3900, label: 'Continuous', interval: 'month', priceEnv: 'STRIPE_PRICE_CONTINUOUS' },
}

// Use a configured Stripe Price id if provided, else build the line item inline
// (so checkout works in test mode without pre-creating Prices).
export function lineItemFor(plan: PlanKey): Stripe.Checkout.SessionCreateParams.LineItem {
  const p = PLANS[plan]
  const priceId = process.env[p.priceEnv]
  if (priceId) return { price: priceId, quantity: 1 }
  return {
    quantity: 1,
    price_data: {
      currency: 'usd',
      unit_amount: p.amount,
      product_data: { name: `Sapient Atlas, ${p.label}` },
      ...(p.interval ? { recurring: { interval: p.interval } } : {}),
    },
  }
}
