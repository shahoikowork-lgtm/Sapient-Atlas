import Link from 'next/link'
import { getAppUser } from '@/lib/app-user'
import { getWorkspace } from '@/lib/app-data'
import { deriveMissions, deriveClearedMicroSkills } from '@/lib/sprint'
import { getConstraintByCode } from '@/lib/atlas/constraints'
import { getMicroSkill } from '@/lib/atlas/constraints/types'
import { createAdminClient } from '@/lib/supabase/admin'
import { humanizeDimension } from '@/lib/format'
import { Eyebrow } from '@/components/atlas'

export const dynamic = 'force-dynamic'

export default async function ProofPage() {
  const { assessment, plan, submissions } = await getWorkspace()
  const caps = (assessment?.capability_scores ?? {}) as Record<string, { score: number; evidence: string }>
  const { missions, cleared, total } = deriveMissions(plan, submissions)
  const reviewed = missions.filter((m) => m.state === 'done')

  // What they can do now — the distinct micro-skills cleared, read from confirmed reps.
  const m1 = getConstraintByCode('M1')
  const clearedSkills = deriveClearedMicroSkills(submissions, (slug) =>
    m1 ? getMicroSkill(m1, slug)?.name : undefined,
  )

  // The day-1 line they started from (the "before" of before/after), retained at diagnosis.
  const user = await getAppUser()
  let day1Line = ''
  if (user) {
    const { data: cyc } = await createAdminClient()
      .from('cycles')
      .select('profile_snapshot')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    const s = (cyc?.profile_snapshot as { atlas?: { signals?: { weak_line?: string } } } | null)?.atlas?.signals
    if (s?.weak_line) day1Line = s.weak_line
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <Eyebrow>Proof</Eyebrow>
        {assessment?.cycle_id ? (
          <Link href={`/app/rerating/${assessment.cycle_id}`} className="text-label text-s-muted hover:text-s-text">
            Did it work? →
          </Link>
        ) : null}
      </div>
      <h1 className="mt-2 text-h2 text-s-text">Your record</h1>

      {/* Cleared missions — qualitative, no grades */}
      <section className="mt-6 rounded-2xl border border-s-line bg-s-panel p-6">
        <div className="flex items-center justify-between">
          <div className="font-mono text-eyebrow uppercase text-s-muted">Moves cleared</div>
          <div className="text-xs text-s-muted tabular">{cleared} of {total || '—'}</div>
        </div>
        {reviewed.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-2">
            {reviewed.map((m) => (
              <li key={m.week} className="flex items-center gap-3 rounded-lg border border-s-line px-3 py-2 text-sm text-s-text">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-s-accent text-[11px] text-s-accent-contrast">✓</span>
                <span className="min-w-0 flex-1 truncate">{m.n}. {m.title ?? `Move ${m.n}`}</span>
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-s-muted">{m.phase}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-body text-s-text-2">Your proof builds as you clear moves. Move 1 is your starting point.</p>
        )}
      </section>

      {/* What they can do now — capability acquired through reps, named */}
      {clearedSkills.length > 0 ? (
        <section className="mt-4 rounded-2xl border border-s-line bg-s-panel p-6">
          <div className="font-mono text-eyebrow uppercase text-s-muted">What you can do now</div>
          <ul className="mt-3 flex flex-wrap gap-2">
            {clearedSkills.map((name) => (
              <li
                key={name}
                className="rounded-full border border-s-accent/30 bg-s-accent-tint px-3 py-1 text-[13px] text-s-text"
              >
                {name}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-s-muted">
            Each is a move you cleared on your own real work, not a lesson you watched.
          </p>
        </section>
      ) : null}

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

      {/* Before / after — anchored on the day-1 line they started from */}
      <section className="mt-4 rounded-2xl border border-s-line bg-s-panel p-6">
        <div className="font-mono text-eyebrow uppercase text-s-muted">Before / after</div>
        {day1Line ? (
          <div className="mt-3">
            <div className="text-[11px] uppercase tracking-[0.12em] text-s-muted">Where you started</div>
            <p className="mt-1 text-body text-s-text-2 line-through decoration-s-muted/40">{day1Line}</p>
            <p className="mt-3 text-[13px] leading-relaxed text-s-text-2">
              {clearedSkills.length > 0
                ? 'Your sharper, real-buyer-proven work lands here at day 30 — the after to this before.'
                : 'Clear your first move and your before/after starts taking shape here.'}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-body text-s-text-2">
            Your first attempt and your final, real-buyer-proven work collect here as you finish.
          </p>
        )}
      </section>
    </div>
  )
}
