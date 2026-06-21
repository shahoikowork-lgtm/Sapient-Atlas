import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { trajectoryLabel, aiExposureLabel } from '@/lib/format'
import { UpgradeCta } from './upgrade-cta'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Pre-auth, token-gated. Reads via service role (RLS would return nothing to an anonymous
// visitor); only APPROVED output is ever shown. Pure-narrative capability review: each
// dimension is presented as an expert read (heading + evidence), with constraints and the
// one move as the page-level "what's missing" and "what improves it". No scores, bands,
// bars, percentages, or other false-precision signals are shown to the user.
export default async function ResultsPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const admin = createAdminClient()

  const { data: diag } = await admin
    .from('diagnoses')
    .select('user_id')
    .eq('result_token', token)
    .maybeSingle()
  if (!diag) notFound()

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
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-3 px-6">
        <div className="text-sm font-medium text-black/50">Sapient Atlas</div>
        <h1 className="text-2xl font-semibold tracking-tight">Your capability read is being reviewed.</h1>
        <p className="text-[15px] leading-relaxed text-black/60">
          Every Atlas read is checked by a human before you see it. Your capability profile and your
          single highest-leverage move will appear here shortly, keep this link.
        </p>
      </main>
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
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <div className="text-sm font-medium text-black/50">Sapient Atlas · Your capability read</div>

      {/* 1. CAPABILITY READ (hero): an expert review. The read leads; each dimension is a
          heading with the evidence as its substance. No scores, bands, or bars. */}
      <section className="mt-6">
        {va.observation ? (
          <p className="text-[19px] leading-relaxed text-black/90">{va.observation}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-black/15 px-3 py-1 text-sm text-black/60">
            Confidence <strong className="text-black/80">{va.confidence}</strong>
          </span>
          {va.trajectory ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-black/15 px-3 py-1 text-sm text-black/60">
              Capability trajectory <strong className="text-black/80">{trajectoryLabel(va.trajectory)}</strong>
            </span>
          ) : null}
        </div>

        {Object.keys(capabilities).length > 0 ? (
          <div className="mt-6 flex flex-col gap-3">
            {Object.entries(capabilities).map(([dim, c]) => {
              const targeted = !!targetDim && dim.toLowerCase() === targetDim
              return (
                <div
                  key={dim}
                  className={`rounded-2xl border p-5 ${targeted ? 'border-black/70' : 'border-black/10'}`}
                >
                  <h3 className="text-[16px] font-semibold capitalize">{dim}</h3>
                  {c.evidence ? (
                    <div className="mt-2">
                      <div className="text-xs uppercase tracking-wide text-black/40">Evidence</div>
                      <p className="mt-1 text-[14px] leading-relaxed text-black/75">{c.evidence}</p>
                    </div>
                  ) : null}
                  {targeted ? (
                    <div className="mt-3 border-t border-black/10 pt-3 text-[13px] text-black/60">
                      <span className="text-black/40">What improves this: </span>your one move, below.
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        ) : null}
      </section>

      {/* 2. WHAT'S MISSING — the constraints (page-level). */}
      {topGaps.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-lg font-semibold tracking-tight">What&apos;s missing</h2>
          <ul className="mt-3 flex flex-col gap-2.5">
            {topGaps.map((g, i) => (
              <li key={i} className="flex gap-2.5 text-[14px] leading-relaxed text-black/70">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-black/70" />
                <span>
                  <span className="font-medium text-black/90">{g.title}.</span> {g.detail}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* 3. YOUR ONE MOVE — what improves it. */}
      <section className="mt-12 rounded-2xl bg-black p-6 text-white">
        <div className="text-xs font-medium uppercase tracking-wide text-white/50">Your one move</div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">{move.title}</h2>
        {move.thesis ? <p className="mt-2 text-[15px] leading-relaxed text-white/80">{move.thesis}</p> : null}
        {move.reasoning ? (
          <div className="mt-5">
            <div className="text-xs uppercase tracking-wide text-white/40">Why this move</div>
            <p className="mt-1 text-[14px] leading-relaxed text-white/75">{move.reasoning}</p>
          </div>
        ) : null}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
          {move.target_outcome ? (
            <div>
              <div className="text-xs uppercase tracking-wide text-white/40">Target outcome</div>
              <div className="mt-1 text-sm text-white/85">{move.target_outcome}</div>
            </div>
          ) : null}
          <div>
            <div className="text-xs uppercase tracking-wide text-white/40">Confidence</div>
            <div className="mt-1 text-sm capitalize text-white/85">{move.confidence ?? 'unknown'}</div>
          </div>
        </div>
      </section>

      {/* 4. THE 30-DAY PREDICTION — falsifiable, stated in plain language (no numbers). */}
      {prediction && pcd ? (
        <section className="mt-12 rounded-2xl border border-black/10 p-6">
          <h2 className="text-lg font-semibold tracking-tight">The prediction we&apos;ll check in {horizon} days</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-black/80">
            We expect {predImproving ? 'stronger, more consistent evidence of' : 'real pressure on'}{' '}
            <span className="font-medium capitalize">{pcd.dimension}</span> in the real work you ship.
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-black/55">
            In {horizon} days we compare your actual, completed work against this and grade it honestly:{' '}
            <strong className="text-black/75">hit</strong> (clearly happened),{' '}
            <strong className="text-black/75">partial</strong> (some movement), or{' '}
            <strong className="text-black/75">miss</strong> (no real change). Logged either way.
          </p>
        </section>
      ) : null}

      {/* 5. FULL ANALYSIS — confidence reasoning + AI exposure (qualitative), tucked away. */}
      {va.confidence_reason || va.ai_exposure != null ? (
        <details className="mt-12 rounded-2xl border border-black/10 p-6 [&_summary]:cursor-pointer">
          <summary className="text-sm font-semibold">Full analysis</summary>
          <div className="mt-4 flex flex-col gap-4">
            {va.confidence_reason ? (
              <div>
                <div className="text-xs uppercase tracking-wide text-black/40">Why this read</div>
                <p className="mt-1 text-[14px] leading-relaxed text-black/65">{va.confidence_reason}</p>
              </div>
            ) : null}
            {va.ai_exposure != null ? (
              <div>
                <div className="text-xs uppercase tracking-wide text-black/40">AI exposure</div>
                <p className="mt-1 text-[14px] leading-relaxed text-black/65">
                  AI exposure for this kind of role is{' '}
                  <strong className="text-black/80">{aiExposureLabel(va.ai_exposure).toLowerCase()}</strong>. The more of
                  your work that competent AI use can already do, the more your edge has to come from judgment,
                  ownership, and outcomes AI cannot yet carry.
                </p>
              </div>
            ) : null}
          </div>
        </details>
      ) : null}

      {/* 6. VALUE SPRINT CTA — 30 days of reviewed execution (a product price, not a valuation). */}
      <UpgradeCta token={token} />
    </main>
  )
}
