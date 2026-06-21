import Link from 'next/link'
import { getAppUser } from '@/lib/app-user'
import { getWorkspace } from '@/lib/app-data'
import { ensureSprintPlan, deriveWeeks } from '@/lib/sprint'
import { leverageLabel, humanizeDimension } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function MovePage() {
  const user = await getAppUser()
  if (user) await ensureSprintPlan(user) // generate the 30-day plan on first access if missing
  const { move, prediction, plan, submissions } = await getWorkspace()

  if (!move) {
    return (
      <div className="text-sm text-black/60">
        No active move yet. <Link href="/app" className="underline underline-offset-4">Back to dashboard</Link>
      </div>
    )
  }

  const pcd = prediction?.pred_capability_delta as
    | { dimension: string; from: number; to: number }
    | undefined
  const predImproving = !pcd || pcd.to >= pcd.from
  const alts = (move.deferred_alternatives ?? []) as { title: string; why_deferred: string }[]
  const { weeks, currentWeek } = deriveWeeks(plan, submissions)

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="text-xs uppercase tracking-wide text-black/40">Current move</div>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">{move.title}</h1>
      <div className="mt-2 text-sm text-black/50">
        Confidence: <strong>{move.confidence}</strong>
        {move.leverage_score != null ? <> · {leverageLabel(move.leverage_score)}</> : null}
      </div>

      {move.thesis ? <p className="mt-6 text-[15px] leading-relaxed text-black/80">{move.thesis}</p> : null}

      {move.target_outcome ? (
        <section className="mt-6">
          <h2 className="text-sm font-semibold">Target outcome</h2>
          <p className="mt-1 text-[15px] leading-relaxed text-black/70">{move.target_outcome}</p>
        </section>
      ) : null}

      {move.reasoning ? (
        <section className="mt-6">
          <h2 className="text-sm font-semibold">Why this, and why now</h2>
          <p className="mt-1 text-[14px] leading-relaxed text-black/70">{move.reasoning}</p>
        </section>
      ) : null}

      {prediction && pcd ? (
        <section className="mt-6 rounded-2xl border border-black/10 p-5">
          <div className="text-xs uppercase tracking-wide text-black/40">
            Prediction we will check in {prediction.horizon_days ?? 30} days
          </div>
          <p className="mt-2 text-[15px] text-black/80">
            We expect {predImproving ? 'stronger, more consistent evidence of' : 'real pressure on'}{' '}
            <span className="font-medium">{humanizeDimension(pcd.dimension)}</span> in your real work.
          </p>
        </section>
      ) : null}

      {/* 30-day plan */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold">Your 30-day plan</h2>
        {weeks.length > 0 ? (
          <div className="mt-3 flex flex-col gap-2">
            {weeks.map((w) => {
              const isCurrent = w.week === currentWeek
              return (
                <div
                  key={w.week}
                  className={`rounded-xl border p-4 ${isCurrent ? 'border-black/80' : 'border-black/10'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${
                          w.state === 'done' ? 'bg-black text-white' : 'border border-black/20 text-black/40'
                        }`}
                      >
                        {w.state === 'done' ? '✓' : w.week}
                      </span>
                      <span className="text-sm font-medium">
                        Week {w.week}: {w.title}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs text-black/40">
                      {w.state === 'done'
                        ? 'Done'
                        : w.state === 'pending'
                          ? 'In review'
                          : isCurrent
                            ? 'This week'
                            : 'Upcoming'}
                    </span>
                  </div>
                  {w.task ? <p className="mt-2 text-[13px] leading-relaxed text-black/65">{w.task}</p> : null}
                  {isCurrent ? (
                    <Link
                      href="/app/checkin"
                      className="mt-3 inline-flex rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-black/85"
                    >
                      Submit week {w.week}
                    </Link>
                  ) : null}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="mt-3 rounded-xl border border-dashed border-black/15 p-4 text-sm text-black/50">
            Preparing your 30-day plan… refresh this page in a moment.
          </p>
        )}
      </section>

      {alts.length > 0 ? (
        <details className="mt-8 rounded-xl border border-black/10 p-4">
          <summary className="cursor-pointer text-xs font-medium uppercase tracking-wide text-black/40">
            Considered and set aside (internal)
          </summary>
          <ul className="mt-3 flex flex-col gap-2">
            {alts.map((a, i) => (
              <li key={i} className="text-[13px] leading-relaxed text-black/60">
                <span className="font-medium text-black/80">{a.title}.</span> {a.why_deferred}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  )
}
