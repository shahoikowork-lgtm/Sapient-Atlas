import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { trajectoryLabel, aiExposureLabel, humanizeDimension } from '@/lib/format'
import { ButtonLink, Card, Eyebrow, Evidence } from '@/components/atlas'
import { sprintEligibility, type AtlasCycleData } from '@/lib/atlas/eligibility'
import { UpgradeCta } from './upgrade-cta'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Pre-auth, token-gated. Reads via service role (RLS would return nothing to an anonymous
// visitor); only APPROVED output is ever shown. Evidence-first capability review: the
// quoted evidence from the user's own work is the dominant, repeated element, then the
// interpretation, the constraints, and the one move. No scores, bands, bars, percentages,
// or valuation signals are shown to the user.
export default async function ResultsPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const admin = createAdminClient()

  const { data: diag } = await admin
    .from('diagnoses')
    .select('user_id')
    .eq('result_token', token)
    .maybeSingle()
  if (!diag) notFound()

  // Sprint eligibility from the stored Decline Gate result (Phase 2A). Latest cycle for the
  // user; falls back to showing the CTA when no classification is present.
  const { data: cycle } = await admin
    .from('cycles')
    .select('profile_snapshot')
    .eq('user_id', diag.user_id)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const atlas = (cycle?.profile_snapshot as { atlas?: AtlasCycleData } | null)?.atlas
  const eligibility = sprintEligibility(atlas)

  // needs_more_artifact: ask for a fuller piece of work and show no Sprint CTA.
  if (eligibility.mode === 'needs_more_artifact') {
    return (
      <div className="min-h-screen bg-paper text-ink">
        <header className="border-b border-hairline">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-3.5">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              Sapient Atlas · Your results
            </span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-2xl px-6 py-14">
          <Eyebrow className="text-muted">One more piece of real work</Eyebrow>
          <h1 className="mt-3 font-serif text-[28px] font-semibold tracking-tight">
            Show one fuller piece of your work.
          </h1>
          <p className="mt-3 text-[16px] leading-relaxed text-muted">{eligibility.explanation}</p>
          <div className="mt-6">
            <ButtonLink href="/diagnosis" size="lg">
              Share more of your work
            </ButtonLink>
          </div>
        </main>
      </div>
    )
  }

  const { data: va } = await admin
    .from('value_assessments')
    .select('*')
    .eq('user_id', diag.user_id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: move } = await admin
    .from('moves')
    .select('*')
    .eq('user_id', diag.user_id)
    .in('status', ['approved', 'active', 'completed'])
    .order('assigned_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!va || !move) {
    return (
      <div className="min-h-screen bg-paper text-ink">
        <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-3 px-6">
          <Eyebrow className="text-muted">Sapient Atlas</Eyebrow>
          <h1 className="font-serif text-[28px] font-semibold tracking-tight">
            Your read is being prepared.
          </h1>
          <p className="text-[15px] leading-relaxed text-muted">
            We&apos;ll show your capability profile and your single highest-leverage move as soon as
            they&apos;re ready, keep this link.
          </p>
        </main>
      </div>
    )
  }

  const { data: prediction } = await admin
    .from('predictions')
    .select('*')
    .eq('move_id', move.id)
    .maybeSingle()

  const capabilities: Record<string, { score: number; evidence: string }> = va.capability_scores ?? {}
  const gaps: { title: string; detail: string }[] = va.gaps ?? []
  const topGaps = gaps.slice(0, 5)
  const pcd = prediction?.pred_capability_delta as
    | { dimension: string; from: number; to: number }
    | undefined
  const horizon = prediction?.horizon_days ?? 30
  const targetDim = pcd?.dimension?.toLowerCase()
  const predImproving = !pcd || pcd.to >= pcd.from

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Masthead */}
      <header className="border-b border-hairline">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-3.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            Sapient Atlas · Your results
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-6 py-14">
        {/* 1. EVIDENCE — lead with what the work shows; the dominant, repeated element. */}
        {Object.keys(capabilities).length > 0 ? (
          <section>
            <Eyebrow className="text-muted">What your work shows</Eyebrow>
            <div className="mt-6 flex flex-col gap-9">
              {Object.entries(capabilities).map(([dim, c]) => {
                const targeted = !!targetDim && dim.toLowerCase() === targetDim
                return (
                  <div key={dim}>
                    <h2 className="font-serif text-[20px] font-semibold">{humanizeDimension(dim)}</h2>
                    {c.evidence ? (
                      <Evidence className="mt-3" quote={c.evidence} source="from your submitted work" />
                    ) : null}
                    {targeted ? (
                      <p className="mt-3 text-[13px] text-muted">
                        <span className="text-muted/70">What improves this: </span>your one move, below.
                      </p>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </section>
        ) : null}

        {/* 2. INTERPRETATION — the considered judgment, after the evidence. */}
        {va.observation ? (
          <section className="mt-10 border-t border-hairline pt-8">
            <Eyebrow className="text-muted">The read</Eyebrow>
            <p className="mt-3 text-[16px] leading-relaxed text-ink/80">{va.observation}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1 text-sm text-muted">
                Confidence <strong className="text-ink">{va.confidence}</strong>
              </span>
              {va.trajectory ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1 text-sm text-muted">
                  Capability trajectory <strong className="text-grow">{trajectoryLabel(va.trajectory)}</strong>
                </span>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* 3. CONSTRAINTS — what's missing. */}
        {topGaps.length > 0 ? (
          <section className="mt-10 border-t border-hairline pt-8">
            <h2 className="font-serif text-[20px] font-semibold tracking-tight">What&apos;s missing</h2>
            <ul className="mt-3 flex flex-col gap-2.5">
              {topGaps.map((g, i) => (
                <li key={i} className="flex gap-2.5 text-[14px] leading-relaxed text-ink/75">
                  <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>
                    <span className="font-medium text-ink">{g.title}.</span> {g.detail}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* 4. THE ONE MOVE. */}
        <section className="mt-8 rounded-2xl bg-focal p-6">
          <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-focal-soft">The one move</div>
          <h2 className="mt-2 font-serif text-[24px] font-semibold tracking-tight text-white">{move.title}</h2>
          {move.thesis ? <p className="mt-2 text-[15px] leading-relaxed text-white/85">{move.thesis}</p> : null}
          {move.reasoning ? (
            <div className="mt-5">
              <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-focal-soft">Why this move</div>
              <p className="mt-1 text-[14px] leading-relaxed text-white/75">{move.reasoning}</p>
            </div>
          ) : null}
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
            {move.target_outcome ? (
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-focal-soft">Target outcome</div>
                <div className="mt-1 text-sm text-white/85">{move.target_outcome}</div>
              </div>
            ) : null}
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-focal-soft">Confidence</div>
              <div className="mt-1 text-sm capitalize text-white/85">{move.confidence ?? 'unknown'}</div>
            </div>
          </div>
        </section>

        {/* 5. THE PREDICTION, logged and graded. */}
        {prediction && pcd ? (
          <Card className="mt-6">
            <h2 className="font-serif text-[18px] font-semibold tracking-tight">
              The prediction we&apos;ll check in {horizon} days
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/80">
              We expect {predImproving ? 'stronger, more consistent evidence of' : 'real pressure on'}{' '}
              <span className="font-medium">{humanizeDimension(pcd.dimension)}</span> in the real work you ship.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent-tint px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-accent">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" /></svg>
              Logged now · graded hit / partial / miss in {horizon} days
            </div>
          </Card>
        ) : null}

        {/* 6. FULL ANALYSIS, tucked away. */}
        {va.confidence_reason || va.ai_exposure != null ? (
          <details className="mt-6 rounded-2xl border border-hairline p-6 [&_summary]:cursor-pointer">
            <summary className="text-sm font-semibold">The full picture</summary>
            <div className="mt-4 flex flex-col gap-4">
              {va.confidence_reason ? (
                <div>
                  <Eyebrow className="text-muted">Why this read</Eyebrow>
                  <p className="mt-1 text-[14px] leading-relaxed text-ink/70">{va.confidence_reason}</p>
                </div>
              ) : null}
              {va.ai_exposure != null ? (
                <div>
                  <Eyebrow className="text-muted">How much of this can be automated</Eyebrow>
                  <p className="mt-1 text-[14px] leading-relaxed text-ink/70">
                    How much of this kind of work can already be automated:{' '}
                    <strong className="text-ink">{aiExposureLabel(va.ai_exposure).toLowerCase()}</strong>. The more of
                    your work that tools can already handle, the more your edge has to come from judgment, ownership,
                    and outcomes that can&apos;t be automated.
                  </p>
                </div>
              ) : null}
            </div>
          </details>
        ) : null}

        {/* 7. CTA — gated by Sprint eligibility (Phase 2A). Only an accepted match sells. */}
        {eligibility.show_sprint_cta ? (
          <UpgradeCta token={token} />
        ) : eligibility.explanation ? (
          <section className="mt-8 rounded-2xl border border-hairline bg-surface p-6">
            <Eyebrow className="text-muted">Where this leaves you</Eyebrow>
            <p className="mt-2 text-[15px] leading-relaxed text-ink/80">{eligibility.explanation}</p>
          </section>
        ) : null}
      </main>
    </div>
  )
}
