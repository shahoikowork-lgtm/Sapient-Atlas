import Link from 'next/link'
import { getAppUser } from '@/lib/app-user'
import { getWorkspace } from '@/lib/app-data'
import { openBillingPortal } from './actions'
import { Eyebrow } from '@/components/atlas'
import { isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  past_due: 'Past due',
  canceled: 'Canceled',
  incomplete: 'Incomplete',
  trialing: 'Trialing',
}

export default async function YouPage({
  searchParams,
}: {
  searchParams: Promise<{ portal?: string }>
}) {
  const sp = await searchParams
  const user = await getAppUser()
  const { subscription } = await getWorkspace()
  const hasCustomer = !!subscription?.stripe_customer_id
  const admin = isAdmin(user?.email)

  return (
    <div>
      <Eyebrow>You</Eyebrow>
      <h1 className="mt-2 text-h2 text-s-text">Account</h1>

      <section className="mt-6 rounded-2xl border border-s-line bg-s-panel p-6">
        <div className="font-mono text-eyebrow uppercase text-s-muted">Email</div>
        <div className="mt-2 text-sm text-s-text">{user?.email}</div>
      </section>

      {admin ? (
        <section className="mt-4 rounded-2xl border border-s-line bg-s-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-eyebrow uppercase text-s-muted">Admin</div>
              <p className="mt-2 text-sm text-s-text-2">
                Review queue: approve diagnoses and moves before they reach users.
              </p>
            </div>
            <Link href="/admin/reviews" className="shrink-0 text-label text-s-accent hover:underline underline-offset-4">
              Open →
            </Link>
          </div>
        </section>
      ) : null}

      <section className="mt-4 rounded-2xl border border-s-line bg-s-panel p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-eyebrow uppercase text-s-muted">Diagnoses</div>
            <p className="mt-2 text-sm text-s-text-2">Your submitted work and where each read stands.</p>
          </div>
          <Link href="/app/diagnoses" className="shrink-0 text-label text-s-accent hover:underline underline-offset-4">
            View →
          </Link>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-s-line bg-s-panel p-6">
        <div className="font-mono text-eyebrow uppercase text-s-muted">Plan</div>
        {subscription ? (
          <div className="mt-2 text-sm text-s-text">
            <span className="font-medium capitalize">{subscription.type}</span> ·{' '}
            {STATUS_LABEL[subscription.status] ?? subscription.status}
          </div>
        ) : (
          <div className="mt-2 text-sm text-s-text-2">No active plan.</div>
        )}

        <div className="mt-4">
          {hasCustomer ? (
            <form action={openBillingPortal}>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-lg bg-s-accent px-4 py-2.5 text-sm font-medium text-s-accent-contrast transition-all duration-200 ease-out hover:-translate-y-px active:translate-y-0"
              >
                Open billing portal
              </button>
            </form>
          ) : (
            <p className="text-sm text-s-text-2">
              Your Value Sprint is a one-time payment, so there is no recurring billing to manage.
            </p>
          )}
          {sp.portal === 'none' ? (
            <p className="mt-2 text-xs text-s-muted">No billing account to open yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  )
}
