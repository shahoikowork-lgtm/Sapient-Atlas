import { createAdminClient } from '@/lib/supabase/admin'
import type { PlanKey } from '@/lib/plans'

// Stripe subscription.status -> our subscription_status enum
// ('active','past_due','canceled','incomplete','trialing').
const SUB_STATUS_MAP: Record<string, string> = {
  active: 'active',
  trialing: 'trialing',
  past_due: 'past_due',
  canceled: 'canceled',
  incomplete: 'incomplete',
  incomplete_expired: 'canceled',
  unpaid: 'past_due',
  paused: 'past_due',
}

// Called from the webhook on checkout.session.completed. Writes the subscriptions
// row and flips users.status. Idempotent per (user, type).
export async function fulfillCheckout(opts: {
  userId: string
  type: PlanKey
  stripeCustomerId?: string | null
  stripeSubId?: string | null
  renewsAt?: string | null
}) {
  const admin = createAdminClient()
  const { userId, type, stripeCustomerId = null, stripeSubId = null, renewsAt = null } = opts

  const { data: existing } = await admin
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('type', type)
    .limit(1)
    .maybeSingle()

  const row = {
    user_id: userId,
    type,
    status: 'active',
    stripe_customer_id: stripeCustomerId,
    stripe_sub_id: stripeSubId,
    renews_at: renewsAt,
  }

  if (existing?.id) {
    await admin.from('subscriptions').update(row).eq('id', existing.id)
  } else {
    await admin.from('subscriptions').insert(row)
  }

  await admin
    .from('users')
    .update({ status: type === 'sprint' ? 'sprint' : 'continuous' })
    .eq('id', userId)
}

// Called on customer.subscription.updated / .deleted (incl. Customer Portal cancel).
export async function updateSubscriptionFromStripe(
  stripeSubId: string,
  stripeStatus: string,
) {
  const admin = createAdminClient()
  const mapped = SUB_STATUS_MAP[stripeStatus] ?? 'past_due'

  const patch: Record<string, unknown> = { status: mapped }
  if (mapped === 'canceled') patch.canceled_at = new Date().toISOString()

  const { data: sub } = await admin
    .from('subscriptions')
    .update(patch)
    .eq('stripe_sub_id', stripeSubId)
    .select('user_id')
    .maybeSingle()

  // On a hard cancel, downgrade the user.
  if (sub?.user_id && mapped === 'canceled') {
    await admin.from('users').update({ status: 'cancelled' }).eq('id', sub.user_id)
  }
}
