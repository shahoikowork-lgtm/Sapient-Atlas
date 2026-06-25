import Link from 'next/link'
import { getAppUser } from '@/lib/app-user'
import { getWorkspace } from '@/lib/app-data'
import { ensureSprintPlan, deriveMissions, deriveProgressAxes } from '@/lib/sprint'
import { Eyebrow, MissionCard, SprintJourney, ProgressAxes } from '@/components/atlas'

export const dynamic = 'force-dynamic'

export default async function NowPage() {
  const user = await getAppUser()
  if (user) await ensureSprintPlan(user) // idempotent; first-open only (skeleton covers the wait)
  const { assessment, move, plan, submissions } = await getWorkspace()
  const { missions, current, cleared, total } = deriveMissions(plan, submissions)

  const reviewing = !current && missions.some((m) => m.state === 'review')
  const complete = total > 0 && cleared === total
  const axes = deriveProgressAxes(missions, submissions)

  return (
    <div>
      <Eyebrow>Now</Eyebrow>
      <h1 className="mt-2 text-h1 text-s-text">{user?.name || 'Welcome back'}</h1>
      {move ? <p className="mt-2 text-label text-s-muted">Your sprint · {move.title}</p> : null}

      {!move ? (
        <div className="mt-7 rounded-3xl border border-s-line bg-s-panel p-7">
          <div className="font-mono text-eyebrow uppercase text-s-accent">Getting ready</div>
          <h2 className="mt-2 text-h3 text-s-text">Your read is being prepared.</h2>
          <p className="mt-2 text-body text-s-text-2">
            A person is reviewing your diagnosis. Your first mission opens here once it&apos;s confirmed.
          </p>
        </div>
      ) : (
        <>
          {/* The destination: where these 30 days end, always in view. */}
          {move.target_outcome ? (
            <div className="mt-6 rounded-2xl border border-s-line bg-s-panel p-5">
              <div className="font-mono text-eyebrow uppercase tracking-[0.14em] text-s-accent">
                Where this is going
              </div>
              <p className="mt-1.5 text-body text-s-text-2">{move.target_outcome}</p>
            </div>
          ) : null}

          {/* The path: the four phases, and where you stand on them. */}
          {missions.length > 0 ? (
            <div className="mt-7">
              <SprintJourney missions={missions} />
            </div>
          ) : null}

          {/* The work now. */}
          <div className="mt-7">
            {current ? (
              <MissionCard mission={current} />
            ) : reviewing ? (
              <div className="rounded-3xl border border-s-line bg-s-panel p-7">
                <div className="font-mono text-eyebrow uppercase text-s-accent">In review</div>
                <h2 className="mt-2 text-h3 text-s-text">Your work is being checked.</h2>
                <p className="mt-2 text-body text-s-text-2">
                  The next mission opens the moment it&apos;s confirmed.
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

          {/* You're getting better: the three axes, qualitative. */}
          {current ? (
            <div className="mt-7">
              <div className="mb-2.5 font-mono text-eyebrow uppercase tracking-[0.14em] text-s-muted">
                You&apos;re getting better
              </div>
              <ProgressAxes axes={axes} />
            </div>
          ) : null}

          {/* The proof forming toward day 30. */}
          {missions.length > 0 && !complete ? (
            <div className="mt-6 rounded-2xl border border-s-line bg-s-panel p-4">
              <p className="text-sm text-s-text-2">
                <span className="font-medium text-s-text">Your proof is forming.</span>{' '}
                {cleared > 0 ? `${cleared} cleared so far. ` : ''}By day 30 you hold a real artifact, and one
                sentence you can say to your boss.
              </p>
            </div>
          ) : null}

          {missions.length > 0 ? (
            <div className="mt-5">
              <Link
                href="/app/move"
                className="text-label text-s-muted underline-offset-4 hover:text-s-text hover:underline"
              >
                Mission {current?.n ?? cleared} of {total} · see the full path →
              </Link>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
