import Link from 'next/link'
import { getAppUser } from '@/lib/app-user'
import { getWorkspace } from '@/lib/app-data'
import { trajectoryLabel } from '@/lib/format'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  lead: 'Lead',
  diagnosed: 'Diagnosed',
  sprint: 'Value Sprint',
  continuous: 'Continuous',
  lapsed: 'Lapsed',
  cancelled: 'Cancelled',
}

export default async function DashboardPage() {
  const user = await getAppUser()
  const { assessment, move, prediction, subscription } = await getWorkspace()
  const pcd = prediction?.pred_capability_delta as
    | { dimension: string; from: number; to: number }
    | undefined

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-black/40">Your workspace</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{user?.name || 'Welcome back'}</h1>
        </div>
        <span className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
          {STATUS_LABEL[user?.status ?? ''] ?? user?.status}
        </span>
      </div>

      {/* Capability read */}
      <section className="mt-8 rounded-2xl border border-black/10 p-6">
        <div className="text-xs uppercase tracking-wide text-black/40">Capability read</div>
        {assessment ? (
          <>
            {assessment.observation ? (
              <p className="mt-2 text-[15px] leading-relaxed text-black/75">{assessment.observation}</p>
            ) : null}
            <div className="mt-2 text-sm text-black/50">
              Confidence <strong>{assessment.confidence}</strong> · capability trajectory{' '}
              <strong>{trajectoryLabel(assessment.trajectory)}</strong>
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-black/50">Your capability read is being prepared. Check back shortly.</p>
        )}
      </section>

      {/* The one move + prediction */}
      <section className="mt-4 rounded-2xl bg-black p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wide text-white/50">Your move this sprint</div>
          {move ? (
            <Link href="/app/move" className="text-xs text-white/70 underline underline-offset-4 hover:text-white">
              Open
            </Link>
          ) : null}
        </div>
        {move ? (
          <>
            <h2 className="mt-2 text-lg font-semibold tracking-tight">{move.title}</h2>
            {move.thesis ? <p className="mt-2 text-sm leading-relaxed text-white/70">{move.thesis}</p> : null}
            {prediction && pcd ? (
              <div className="mt-4 border-t border-white/10 pt-3 text-xs text-white/60">
                30-day prediction: stronger evidence of <span className="capitalize text-white/80">{pcd.dimension}</span>
              </div>
            ) : null}
          </>
        ) : (
          <p className="mt-2 text-sm text-white/70">Your move appears here once your diagnosis is approved.</p>
        )}
      </section>

      {/* Monthly re-rating */}
      {assessment?.cycle_id ? (
        <section className="mt-4 rounded-2xl border border-black/10 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-black/40">Monthly re-rating</div>
              <p className="mt-2 text-sm text-black/60">
                See how your capability moved this sprint, and your next move.
              </p>
            </div>
            <Link href={`/app/rerating/${assessment.cycle_id}`} className="shrink-0 text-xs underline underline-offset-4">
              Open
            </Link>
          </div>
        </section>
      ) : null}

      {/* Next action + progress placeholder */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-black/10 p-6">
          <div className="text-xs uppercase tracking-wide text-black/40">Next action</div>
          <p className="mt-2 text-sm leading-relaxed text-black/70">
            Start executing your move on real work this week. Weekly check-ins and feedback open as your
            sprint progresses.
          </p>
        </section>
        <section className="rounded-2xl border border-black/10 p-6">
          <div className="text-xs uppercase tracking-wide text-black/40">Proof / progress</div>
          <p className="mt-2 text-sm leading-relaxed text-black/50">
            Your before/after proof collects here as you complete work.{' '}
            <Link href="/app/progress" className="underline underline-offset-4">View progress</Link>
          </p>
        </section>
      </div>

      {/* Billing */}
      <section className="mt-4 rounded-2xl border border-black/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-black/40">Billing</div>
            <p className="mt-2 text-sm text-black/70">
              {subscription ? (
                <>
                  Plan: <strong className="capitalize">{subscription.type}</strong> ·{' '}
                  <span className="capitalize">{subscription.status}</span>
                </>
              ) : (
                'No active plan.'
              )}
            </p>
          </div>
          <Link href="/app/settings" className="text-xs underline underline-offset-4">
            Settings
          </Link>
        </div>
      </section>
    </div>
  )
}
