import Link from 'next/link'
import { getWorkspace } from '@/lib/app-data'
import { deriveWeeks } from '@/lib/sprint'
import { weekLabel } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function ProgressPage() {
  const { assessment, plan, submissions } = await getWorkspace()
  const caps = (assessment?.capability_scores ?? {}) as Record<
    string,
    { score: number; evidence: string }
  >

  const { weeks } = deriveWeeks(plan, submissions)
  const reviewed = weeks.filter((w) => w.submission?.status === 'reviewed')

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

      {/* Sprint progress: completed weeks as a qualitative read (no grades). */}
      <section className="mt-6 rounded-2xl border border-black/10 p-6">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wide text-black/40">Sprint progress</div>
          <div className="text-xs text-black/50">{reviewed.length}/{weeks.length || 4} weeks reviewed</div>
        </div>
        {reviewed.length > 0 ? (
          <div className="mt-3 flex flex-col gap-2">
            {reviewed.map((w) => {
              const fb = (w.submission?.feedback ?? {}) as {
                capability_delta?: { dimension?: string; delta?: number }
              }
              const cd = fb.capability_delta
              const sharper = cd?.dimension && (cd.delta ?? 0) > 0 ? `sharper ${cd.dimension}` : null
              return (
                <div
                  key={w.week}
                  className="flex items-center justify-between rounded-lg border border-black/10 px-3 py-2 text-sm"
                >
                  <span>Week {w.week}</span>
                  <span className="flex items-center gap-3">
                    {sharper ? <span className="text-xs text-black/45">{sharper}</span> : null}
                    <span className="text-black/70">{weekLabel(w.submission?.graded_score) || 'Reviewed'}</span>
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="mt-2 text-sm text-black/50">Complete a weekly check-in to see your progress here.</p>
        )}
        <p className="mt-3 text-xs text-black/40">Streak and momentum tracking coming soon.</p>
      </section>

      {/* Capabilities: the read in plain language (no scores, no bars). */}
      <section className="mt-4 rounded-2xl border border-black/10 p-6">
        <div className="text-xs uppercase tracking-wide text-black/40">Your capabilities</div>
        {Object.keys(caps).length > 0 ? (
          <div className="mt-3 flex flex-col gap-4">
            {Object.entries(caps).map(([dim, c]) => (
              <div key={dim}>
                <div className="text-sm font-medium capitalize">{dim}</div>
                {c.evidence ? (
                  <p className="mt-1 text-[13px] leading-relaxed text-black/60">{c.evidence}</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-black/50">
            Your capability read appears here after your diagnosis is approved.
          </p>
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
