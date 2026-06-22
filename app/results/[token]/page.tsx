import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { trajectoryLabel, aiExposureLabel, humanizeDimension } from '@/lib/format'
import { ButtonLink, Card, Eyebrow, Evidence, Pill, MoveCard, WaitlistState } from '@/components/atlas'
import { sprintEligibility, type AtlasCycleData } from '@/lib/atlas/eligibility'
import { UpgradeCta } from './upgrade-cta'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Pre-auth, token-gated. Reads via service role (RLS would return nothing to an anonymous
// visitor); only APPROVED output is ever shown. Evidence-first capability review: the
// quoted evidence from the user's own work is the dominant, repeated element, then the
// interpretation, the constraints, and the one move. No scores, bands, bars, percentages,
// or valuation signals are shown to the user. Rendered in the dark instrument register.
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
  const constraintName = atlas?.constraint_name ?? null

  const Header = () => (
    <header className="border-b border-s-line">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-3.5">
        <a href="/" className="font-semibold tracking-tight text-s-text transition-opacity hover:opacity-70">
          Sapient Atlas
        </a>
        <span className="font-mono text-eyebrow uppercase text-s-muted">Your results</span>
      </div>
    </header>
  )

  // needs_more_artifact: ask for a fuller piece of work and show no Sprint CTA.
  if (eligibility.mode === 'needs_more_artifact') {
    return (
      <div className="instrument min-h-screen bg-s-bg text-s-text">
        <Header />
        <main className="mx-auto w-full max-w-2xl px-6 py-14">
          <Eyebrow tone="muted">One more piece of real work</Eyebrow>
          <h1 className="mt-3 text-h1 text-s-text">Show one fuller piece of your work.</h1>
          <p className="mt-3 text-body-lg text-s-text-2">{eligibility.explanation}</p>
          <div className="mt-6">
            <ButtonLink href="/diagnosis" size="lg">Share more of your work</ButtonLink>
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
      <div className="instrument min-h-screen bg-s-bg text-s-text">
        <Header />
        <main className="mx-auto w-full max-w-2xl px-6 py-20">
          <Eyebrow tone="muted">Your read is being prepared</Eyebrow>
          <h1 className="mt-3 text-h1 text-s-text">A person is reviewing your work.</h1>
          <p className="mt-3 max-w-[56ch] text-body-lg text-s-text-2">
            Atlas never auto-publishes a read. Yours is being checked by a person before you see it,
            so what you get is something we stand behind. We’ll show your capability profile and
            your single highest-leverage move as soon as it’s ready. Keep this link.
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
    <div className="instrument min-h-screen bg-s-bg text-s-text">
      <Header />

      <main className="mx-auto w-full max-w-2xl px-6 py-14">
        {/* 1. EVIDENCE — lead with what the work shows; the dominant, repeated element. */}
        {Object.keys(capabilities).length > 0 ? (
          <section>
            <Eyebrow tone="muted">What your work shows</Eyebrow>
            <div className="mt-6 flex flex-col gap-8">
              {Object.entries(capabilities).map(([dim, c]) => {
                const targeted = !!targetDim && dim.toLowerCase() === targetDim
                return (
                  <div key={dim}>
                    <h2 className="text-h3 text-s-text">{humanizeDimension(dim)}</h2>
                    {c.evidence ? (
                      <Evidence className="mt-3" quote={c.evidence} source="from your submitted work" />
                    ) : null}
                    {targeted ? (
                      <p className="mt-3 text-label text-s-muted">
                        <span className="text-s-muted/70">What improves this: </span>your one move, below.
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
          <section className="mt-12 border-t border-s-line pt-10">
            <Eyebrow tone="muted">The read</Eyebrow>
            <p className="mt-3 text-body-lg text-s-text">{va.observation}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {va.confidence ? <Pill>We’re confident in this read</Pill> : null}
              {va.trajectory ? (
                <Pill tone="success">Your work is trending {trajectoryLabel(va.trajectory).toLowerCase()}</Pill>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* 3. CONSTRAINTS — what's missing. */}
        {topGaps.length > 0 ? (
          <section className="mt-12 border-t border-s-line pt-10">
            <h2 className="text-h3 text-s-text">What’s missing</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {topGaps.map((g, i) => (
                <li key={i} className="flex gap-3 text-body text-s-text-2">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-s-accent" />
                  <span>
                    <span className="font-medium text-s-text">{g.title}.</span> {g.detail}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* 4. THE ONE MOVE — the climax. */}
        <div className="mt-12">
          <p className="mb-4 text-label text-s-muted">The single thing to work on</p>
          <MoveCard
            title={move.title}
            thesis={move.thesis}
            reasoning={move.reasoning}
            targetOutcome={move.target_outcome}
            confidenceWord={move.confidence ?? null}
          />
        </div>

        {/* 5. THE PREDICTION, logged and graded. */}
        {prediction && pcd ? (
          <Card className="mt-6">
            <h2 className="text-h3 text-s-text">The prediction we’ll check in {horizon} days</h2>
            <p className="mt-3 text-body text-s-text-2">
              We expect {predImproving ? 'stronger, more consistent evidence of' : 'real pressure on'}{' '}
              <span className="font-medium text-s-text">{humanizeDimension(pcd.dimension)}</span> in the
              real work you ship.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-s-accent-tint px-3 py-1.5 font-mono text-eyebrow uppercase text-s-accent">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" /></svg>
              Logged now · graded hit / partial / miss in {horizon} days
            </div>
          </Card>
        ) : null}

        {/* 6. FULL ANALYSIS, tucked away. */}
        {va.confidence_reason || va.ai_exposure != null ? (
          <details className="mt-6 rounded-2xl border border-s-line p-6 [&_summary]:cursor-pointer">
            <summary className="text-sm font-semibold text-s-text">The full picture</summary>
            <div className="mt-4 flex flex-col gap-4">
              {va.confidence_reason ? (
                <div>
                  <Eyebrow tone="muted">Why this read</Eyebrow>
                  <p className="mt-1 text-body text-s-text-2">{va.confidence_reason}</p>
                </div>
              ) : null}
              {va.ai_exposure != null ? (
                <div>
                  <Eyebrow tone="muted">How much of this can be automated</Eyebrow>
                  <p className="mt-1 text-body text-s-text-2">
                    How much of this kind of work can already be automated:{' '}
                    <strong className="text-s-text">{aiExposureLabel(va.ai_exposure).toLowerCase()}</strong>. The more of
                    your work that tools can already handle, the more your edge has to come from judgment, ownership,
                    and outcomes that can’t be automated.
                  </p>
                </div>
              ) : null}
            </div>
          </details>
        ) : null}

        {/* 7. NEXT STEP — the designed decision surface, gated by Sprint eligibility. */}
        <div className="mt-12 border-t border-s-line pt-10">
          {eligibility.show_sprint_cta ? (
            <UpgradeCta token={token} />
          ) : eligibility.mode === 'waitlist' ? (
            <WaitlistState constraintName={constraintName} explanation={eligibility.explanation} />
          ) : eligibility.explanation ? (
            <section className="rounded-2xl border border-s-line bg-s-panel p-6">
              <Eyebrow tone="muted">Where this leaves you</Eyebrow>
              <p className="mt-2 text-body-lg text-s-text-2">{eligibility.explanation}</p>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  )
}
