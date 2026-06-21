import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createFakeStore, type FakeStore } from './helpers/fake-supabase'

const h = vi.hoisted(() => ({ store: null as any }))

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => h.store }))
// Mock only the Stripe client (signature verification); the real lib/payments
// fulfillment logic runs against the in-memory store.
vi.mock('@/lib/stripe', () => ({ stripe: { webhooks: { constructEvent: vi.fn() } } }))

import { POST } from '@/app/api/webhooks/stripe/route'
import { stripe } from '@/lib/stripe'

beforeEach(() => {
  h.store = createFakeStore({
    users: [{ id: 'u1', email: 'paid@example.com', status: 'lead' }],
    subscriptions: [],
  })
  ;(stripe.webhooks.constructEvent as any).mockReset()
})

function webhookRequest(body = '{}') {
  return new Request('https://atlas.test/api/webhooks/stripe', {
    method: 'POST',
    headers: { 'stripe-signature': 'sig', 'content-type': 'application/json' },
    body,
  })
}

describe('stripe webhook, sprint fulfillment', () => {
  it('fulfills a sprint checkout and flips the user to sprint', async () => {
    ;(stripe.webhooks.constructEvent as any).mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { user_id: 'u1', plan: 'sprint' },
          customer: 'cus_123',
          subscription: null,
        },
      },
    })

    const res = await POST(webhookRequest())
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ received: true })

    const s = h.store as FakeStore

    expect(s.rows('subscriptions')).toHaveLength(1)
    expect(s.rows('subscriptions')[0]).toMatchObject({
      user_id: 'u1',
      type: 'sprint',
      status: 'active',
      stripe_customer_id: 'cus_123',
    })

    // user.status changes to 'sprint'
    expect(s.rows('users')[0].status).toBe('sprint')
  })
})
