import Link from 'next/link'
import { getWorkspace } from '@/lib/app-data'
import { deriveMissions } from '@/lib/sprint'
import { humanizeDimension } from '@/lib/format'
import { Eyebrow } from '@/components/atlas'

export const dynamic = 'force-dynamic'

export default async function ProofPage() {
  const { assessment, plan, submissions } = await getWorkspace()
  const caps = (assessment?.capability_scores ?? {}) as Record<string, { score: number; evidence: string }>
  const { missions, cleared, total } = deriveMissions(plan, submissions)
  const reviewed = missions.filter((m) => m.state === 'done')

  return (
    <div>
      <div className="flex items-center justify-between">
        <Eyebrow>Proof</Eyebrow>
        {assessment?.cycle_id ? (
          <Link href={`/app/rerating/${assessment.cycle_id}`} className="text-label text-s-muted hover:text-s-text">
            Re-rating →
          </Link>
        ) : null}
      </div>
      <h1 className="mt-2 text-h2 text-s-text">Your record</h1>

      {/* Cleared missions — qualitative, no grades */}
      <section className="mt-6 rounded-2xl border border-s-line bg-s-panel p-6">
        <div className="flex items-center justify-between">
          <div className="font-mono text-eyebrow uppercase text-s-muted">Missions cleared</div>
          <div className="text-xs text-s-muted tabular">{cleared} of {total || '—'}</div>
        </div>
        {reviewed.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-2">
            {reviewed.map((m) => (
              <li key={m.week} className="flex items-center gap-3 rounded-lg border border-s-line px-3 py-2 text-sm text-s-text">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-s-accent text-[11px] text-s-accent-contrast">✓</span>
                <span className="min-w-0 flex-1 truncate">{m.n}. {m.title ?? `Mission ${m.n}`}</span>
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-s-muted">{m.phase}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-body text-s-text-2">Your proof builds as you clear missions. Mission 1 sets your baseline.</p>
        )}
      </section>

      {/* Capability read — plain language, no scores */}
      <section className="mt-4 rounded-2xl border border-s-line bg-s-panel p-6">
        <div className="font-mono text-eyebrow uppercase text-s-muted">What your work shows</div>
        {Object.keys(caps).length > 0 ? (
          <div className="mt-3 flex flex-col gap-4">
            {Object.entries(caps).map(([dim, c]) => (
              <div key={dim}>
                <div className="text-sm font-medium text-s-text">{humanizeDimension(dim)}</div>
                {c.evidence ? <p className="mt-1 text-[13px] leading-relaxed text-s-text-2">{c.evidence}</p> : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-body text-s-text-2">Your read appears here after your diagnosis is approved.</p>
        )}
      </section>

      {/* Before/after proof portfolio */}
      <section className="mt-4 rounded-2xl border border-s-line bg-s-panel p-6">
        <div className="font-mono text-eyebrow uppercase text-s-muted">Before / after</div>
        <p className="mt-2 text-body text-s-text-2">
          Your baseline rep and your final, externally-validated work collect here as you finish the Sprint.
        </p>
      </section>
    </div>
  )
}
