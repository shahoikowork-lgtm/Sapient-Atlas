import { getTransformationFunnel, getMicroSkillStats } from '@/lib/intelligence'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Admin-only (the /admin layout calls requireAdmin). The Capability Intelligence read-out:
// the transformation funnel (the one metric — who reaches a real day-30 result, and where they
// fall off) and the per-micro-skill stall table (which bar/correction to sharpen next).
export default async function IntelligencePage() {
  const [funnel, micro] = await Promise.all([getTransformationFunnel(), getMicroSkillStats()])
  const pct = (n: number) => `${Math.round(n * 100)}%`

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-lg font-semibold">Capability intelligence</h1>
        <p className="mt-1 text-sm text-black/55">
          The one metric: the share of paid sprints that reach a real, day-30 transformation — and exactly where they fall off.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <div className="text-xs uppercase tracking-wide text-black/40">Transformation funnel · {funnel.started} started</div>
        {funnel.started === 0 ? (
          <p className="text-sm text-black/60">No sprint has started yet. The funnel fills as users run the loop.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {funnel.steps.map((s) => {
              const leak = s.key === funnel.biggestLeakKey
              return (
                <div key={s.key} className={`rounded-xl border p-3 ${leak ? 'border-s-danger/40 bg-s-danger/5' : 'border-black/10'}`}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-black/70">{s.label}</span>
                    <span className="shrink-0 tabular-nums text-black/80">
                      {s.count} · {s.pctOfStarted}%
                      {s.dropFromPrev > 0 ? <span className="ml-2 text-black/40">−{s.dropFromPrev}</span> : null}
                      {leak ? <span className="ml-2 rounded bg-s-danger/15 px-1.5 py-0.5 text-[11px] font-medium text-s-danger">biggest leak</span> : null}
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-black/5">
                    <div className={`h-2 rounded-full ${leak ? 'bg-s-danger' : 'bg-black/60'}`} style={{ width: `${s.pctOfStarted}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="text-xs uppercase tracking-wide text-black/40">Where users stall · per micro-skill (worst first)</div>
        {micro.length === 0 ? (
          <p className="text-sm text-black/60">No reps yet. This fills as users practice.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-black/10">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-black/10 text-xs uppercase tracking-wide text-black/40">
                <tr>
                  <th className="px-4 py-3 font-medium">Micro-skill</th>
                  <th className="px-4 py-3 text-right font-medium">Attempts</th>
                  <th className="px-4 py-3 text-right font-medium">Clear rate</th>
                  <th className="px-4 py-3 text-right font-medium">Avg checks</th>
                </tr>
              </thead>
              <tbody>
                {micro.map((m) => {
                  const weak = m.attempts >= 3 && m.clearRate < 0.5
                  return (
                    <tr key={m.micro_skill} className="border-b border-black/5 last:border-0">
                      <td className="px-4 py-3 text-black/70">{m.name}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-black/60">{m.attempts}</td>
                      <td className={`px-4 py-3 text-right tabular-nums ${weak ? 'font-semibold text-s-danger' : 'text-black/80'}`}>{pct(m.clearRate)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-black/60">{m.avgAttempts ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-black/40">Low clear rate or high avg checks = a bar or correction to sharpen (the flywheel&apos;s to-do list).</p>
      </section>
    </div>
  )
}
