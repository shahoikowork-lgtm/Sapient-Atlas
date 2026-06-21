import Link from 'next/link'
import { getWorkspace } from '@/lib/app-data'
import { deriveWeeks } from '@/lib/sprint'

export const dynamic = 'force-dynamic'

export default async function ProgressPage() {
  const { assessment, valueHistory, plan, submissions } = await getWorkspace()
  const caps = (assessment?.capability_scores ?? {}) as Record<
    string,
    { score: number; evidence: string }
  >

  const { weeks } = deriveWeeks(plan, submissions)
  const reviewed = weeks.filter((w) => w.submission?.status === 'reviewed')
  const scores = reviewed
    .map((w) => w.submission?.graded_score)
    .filter((s): s is number => typeof s === 'number')
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
        {assessment?.cycle_id ? (
          <Link href={`/app/rerating/${assessment.cycle_id}`} className="text-xs underline underline-offset-4">
            Monthly re-rating
          </Link>
        ) : null}
      </div>

      {/* Sprint progress: completed weeks + scores + capability delta */}
      <section className="mt-6 rounded-2xl border border-black/10 p-6">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wide text-black/40">Sprint progress</div>
          <div className="text-xs text-black/50">
            {reviewed.length}/{weeks.length || 4} weeks reviewed{avg != null ? ` · avg ${avg}/100` : ''}
          </div>
        </div>
        {reviewed.length > 0 ? (
          <div className="mt-3 flex flex-col gap-2">
            {reviewed.map((w) => {
              const fb = (w.submission?.feedback ?? {}) as {
                capability_delta?: { dimension?: string; delta?: number }
              }
              const cd = fb.capability_delta
              return (
                <div
                  key={w.week}
                  className="flex items-center justify-between rounded-lg border border-black/10 px-3 py-2 text-sm"
                >
                  <span>Week {w.week}</span>
                  <span className="flex items-center gap-3">
                    {cd?.dimension ? (
                      <span className="text-xs text-black/45">
                        {cd.dimension} +{cd.delta}
                      </span>
                    ) : null}
                    <span className="font-mono">{w.submission?.graded_score}/100</span>
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="mt-2 text-sm text-black/50">Complete a weekly check-in to see your scores here.</p>
        )}
        <p className="mt-3 text-xs text-black/40">Streak and momentum tracking coming soon.</p>
      </section>

      {/* Value over time */}
      <section className="mt-4 rounded-2xl border border-black/10 p-6">
        <div className="text-xs uppercase tracking-wide text-black/40">Value over time</div>
        {valueHistory.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-1 font-mono text-sm">
            {valueHistory.map((v) => (
              <li key={v.id} className="flex justify-between">
                <span className="text-black/50">{v.date}</span>
                <span>{v.value_mid != null ? `$${Number(v.value_mid).toLocaleString('en-US')}` : '-'}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-black/50">
            We will chart your market value here after your first re-rating.
          </p>
        )}
      </section>

      {/* Capability scores */}
      <section className="mt-4 rounded-2xl border border-black/10 p-6">
        <div className="text-xs uppercase tracking-wide text-black/40">Capability scores</div>
        {Object.keys(caps).length > 0 ? (
          <div className="mt-3 flex flex-col gap-3">
            {Object.entries(caps).map(([dim, c]) => (
              <div key={dim}>
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize">{dim}</span>
                  <span className="font-mono text-black/60">{c.score}/100</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-black/10">
                  <div
                    className="h-1.5 rounded-full bg-black"
                    style={{ width: `${Math.max(0, Math.min(100, c.score))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-black/50">No capability scores yet.</p>
        )}
      </section>

      {/* Proof portfolio */}
      <section className="mt-4 rounded-2xl border border-black/10 p-6">
        <div className="text-xs uppercase tracking-wide text-black/40">Proof portfolio</div>
        <p className="mt-2 text-sm text-black/50">Verified before/after work will collect here.</p>
      </section>
    </div>
  )
}
