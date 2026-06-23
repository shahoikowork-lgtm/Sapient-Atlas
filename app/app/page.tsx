import Link from 'next/link'
import { getAppUser } from '@/lib/app-user'
import { getWorkspace } from '@/lib/app-data'
import { ensureSprintPlan, deriveMissions } from '@/lib/sprint'
import { Eyebrow, MissionCard, PhaseDots } from '@/components/atlas'

export const dynamic = 'force-dynamic'

export default async function NowPage() {
  const user = await getAppUser()
  if (user) await ensureSprintPlan(user) // idempotent; first-open only (skeleton covers the wait)
  const { assessment, move, plan, submissions } = await getWorkspace()
  const { missions, current, cleared, total } = deriveMissions(plan, submissions)

  const reviewing = !current && missions.some((m) => m.state === 'review')
  const complete = total > 0 && cleared === total

  return (
    <div>
      <Eyebrow>Now</Eyebrow>
      <h1 className="mt-2 text-h1 text-s-text">{user?.name || 'Welcome back'}</h1>

      {move ? (
        <p className="mt-2 text-label text-s-muted">Your Sprint · {move.title}</p>
      ) : null}

      <div className="mt-7">
        {!move ? (
          <div className="rounded-3xl border border-s-line bg-s-panel p-7">
            <div className="font-mono text-eyebrow uppercase text-s-accent">Getting ready</div>
            <h2 className="mt-2 text-h3 text-s-text">Your read is being prepared.</h2>
            <p className="mt-2 text-body text-s-text-2">
              A person is reviewing your diagnosis. Your first mission opens here once it&apos;s confirmed.
            </p>
          </div>
        ) : current ? (
          <MissionCard mission={current} />
        ) : reviewing ? (
          <div className="rounded-3xl border border-s-line bg-s-panel p-7">
            <div className="font-mono text-eyebrow uppercase text-s-accent">In review</div>
            <h2 className="mt-2 text-h3 text-s-text">Your work is being checked.</h2>
            <p className="mt-2 text-body text-s-text-2">
              A person is reviewing what you submitted. The next mission opens the moment it&apos;s confirmed.
            </p>
          </div>
        ) : complete ? (
          <div className="rounded-3xl bg-focal p-7 shadow-focal ring-1 ring-inset ring-white/[0.06]">
            <div className="font-mono text-eyebrow uppercase text-focal-soft">Sprint complete</div>
            <h2 className="mt-2 text-h2 text-on-focal">Every mission cleared.</h2>
            <p className="mt-2 text-body text-on-focal-dim">
              Next: your re-rating shows what moved, and your next constraint.
            </p>
            {assessment?.cycle_id ? (
              <Link
                href={`/app/rerating/${assessment.cycle_id}`}
                className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-on-focal px-5 py-2.5 text-sm font-medium text-focal"
              >
                See your re-rating →
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="rounded-3xl border border-s-line bg-s-panel p-7">
            <div className="font-mono text-eyebrow uppercase text-s-accent">Building your path</div>
            <h2 className="mt-2 text-h3 text-s-text">Preparing your missions…</h2>
            <p className="mt-2 text-body text-s-text-2">This takes a moment. Refresh shortly.</p>
          </div>
        )}
      </div>

      {missions.length > 0 ? (
        <div className="mt-6 flex flex-col gap-3">
          <PhaseDots missions={missions} />
          <Link href="/app/move" className="text-label text-s-muted underline-offset-4 hover:text-s-text hover:underline">
            Mission {current?.n ?? cleared} of {total} · {cleared} cleared · see the full path →
          </Link>
        </div>
      ) : null}
    </div>
  )
}
