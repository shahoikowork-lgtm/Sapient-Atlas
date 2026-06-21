import { getAppUser } from '@/lib/app-user'
import { getWorkspace } from '@/lib/app-data'
import { openBillingPortal } from './actions'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  past_due: 'Past due',
  canceled: 'Canceled',
  incomplete: 'Incomplete',
  trialing: 'Trialing',
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ portal?: string }>
}) {
  const sp = await searchParams
  const user = await getAppUser()
  const { subscription } = await getWorkspace()
  const hasCustomer = !!subscription?.stripe_customer_id

  return (
    <div className="mx-auto w-full max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <section className="mt-6 rounded-2xl border border-black/10 p-6">
        <div className="text-xs uppercase tracking-wide text-black/40">Account</div>
        <div className="mt-2 text-sm">{user?.email}</div>
      </section>

      <section className="mt-4 rounded-2xl border border-black/10 p-6">
        <div className="text-xs uppercase tracking-wide text-black/40">Subscription</div>
        {subscription ? (
          <div className="mt-2 text-sm">
            <span className="font-medium capitalize">{subscription.type}</span> ·{' '}
            {STATUS_LABEL[subscription.status] ?? subscription.status}
          </div>
        ) : (
          <div className="mt-2 text-sm text-black/50">No active subscription.</div>
        )}

        <div className="mt-4">
          {hasCustomer ? (
            <form action={openBillingPortal}>
              <button
                type="submit"
                className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-black/85"
              >
                Open billing portal
              </button>
            </form>
          ) : (
            <p className="text-sm text-black/50">
              Your Value Sprint is a one-time payment, so there is no recurring billing to manage. The
              billing portal becomes available with a Continuous subscription.
            </p>
          )}
          {sp.portal === 'none' ? (
            <p className="mt-2 text-xs text-black/40">No billing account to open yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  )
}
