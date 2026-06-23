import Link from 'next/link'
import { getAppUser } from '@/lib/app-user'
import { createClient } from '@/lib/supabase/server'
import { ensureRerating, MIN_REVIEWED_FOR_RERATING } from '@/lib/rerating'
import { trajectoryLabel, humanizeDimension } from '@/lib/format'

export const dynamic = 'force-dynamic'

const VERDICT_LABEL: Record<string, string> = { hit: 'Hit', partial: 'Partial', miss: 'Miss' }

// Direction of a capability move, expressed qualitatively (no numbers). The raw scores
// stay in the backend; we only render whether the evidence got stronger or weaker.
function changeText(delta: number | null): string {
  if (delta == null) return 'Assessed this sprint'
  if (delta > 3) return 'Stronger, more consistent evidence'
  if (delta < -3) return 'Weaker evidence than at the start'
  return 'Little change'
}
function actualText(from?: number, to?: number): string {
  if (from == null || to == null) return 'assessed'
  const d = to - from
  if (d > 3) return 'stronger evidence of'
  if (d < -3) return 'weaker evidence of'
  return 'little change in'
}

export default async function ReratingPage({ params }: { params: Promise<{ cycle: string }> }) {
  const { cycle } = await params
  const user = await getAppUser()
  if (user) await ensureRerating(user, cycle) // lazy generation when eligible

  const supabase = await createClient() // RLS-scoped: only approved assessments are returned
  const { data: vas } = await supabase
    .from('value_assessments').select('*').eq('cycle_id', cycle).eq('status', 'approved')
    .order('created_at', { ascending: true })
  const { data: reviewedSubs } = await supabase
    .from('submissions').select('week').eq('cycle_id', cycle).eq('status', 'reviewed')
  const { data: prediction } = await supabase
    .from('predictions').select('*').eq('cycle_id', cycle).maybeSingle()
  const { data: moves } = await supabase
    .from('moves').select('*').eq('cycle_id', cycle)
    .in('status', ['approved', 'active', 'completed']).order('assigned_at', { ascending: true })

  const reviewedCount = reviewedSubs?.length ?? 0
  const approvedVas = vas ?? []

  if (reviewedCount < MIN_REVIEWED_FOR_RERATING) {
    return (
      <div>
        <h1 className="text-h2 text-s-text">Re-rating</h1>
        <p className="mt-3 text-body text-s-text-2">
          Not enough evidence yet. Clear a mission and get it reviewed, then your re-rating appears here.
        </p>
        <Link href="/app/checkin" className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-s-accent px-4 py-2.5 text-sm font-medium text-s-accent-contrast">
          Go to your mission
        </Link>
      </div>
    )
  }

  if (approvedVas.length < 2) {
    return (
      <div>
        <h1 className="text-h2 text-s-text">Re-rating</h1>
        <p className="mt-3 text-body text-s-text-2">
          Your re-rating is being reviewed. Every re-rating is checked by a person before you see it. Check back shortly.
        </p>
      </div>
    )
  }

  const previous = approvedVas[0]
  const updated = approvedVas[approvedVas.length - 1]
  const verdict = prediction?.verdict as string | undefined
  const pcd = prediction?.pred_capability_delta as { dimension?: string; from?: number; to?: number } | undefined
  const acd = prediction?.actual_capability_delta as { dimension?: string; from?: number; to?: number } | undefined
  const proof = ((updated.inputs ?? []) as string[])[0]
  const nextMove = moves && moves.length > 1 ? moves[moves.length - 1] : null
  const prevCaps = (previous.capability_scores ?? {}) as Record<string, { score: number }>
  const newCaps = (updated.capability_scores ?? {}) as Record<string, { score: number; evidence?: string }>
  const verdictTone =
    verdict === 'hit' ? 'bg-s-accent text-s-accent-contrast' : verdict === 'partial' ? 'bg-s-accent-tint text-s-accent' : 'border border-s-line text-s-muted'

  return (
    <div>
      <div className="font-mono text-eyebrow uppercase text-s-muted">Re-rating</div>
      <h1 className="mt-2 text-h2 text-s-text">Did your capability move?</h1>

      <div className="mt-3 text-sm text-s-text-2">
        Capability trajectory: <strong className="text-s-text">{trajectoryLabel(updated.trajectory)}</strong>
      </div>

      {updated.confidence_reason ? (
        <p className="mt-3 text-body text-s-text-2">{updated.confidence_reason}</p>
      ) : null}

      {/* Prediction vs actual + verdict (qualitative, no numbers) */}
      <section className="mt-8 rounded-2xl border border-s-line bg-s-panel p-6">
        <div className="flex items-center justify-between">
          <div className="font-mono text-eyebrow uppercase text-s-muted">Prediction vs actual</div>
          {verdict ? (
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${verdictTone}`}>
              {VERDICT_LABEL[verdict] ?? verdict}
            </span>
          ) : null}
        </div>
        {pcd ? (
          <p className="mt-3 text-sm text-s-text-2">
            Predicted: stronger evidence of <span>{humanizeDimension(pcd.dimension)}</span>
          </p>
        ) : null}
        {acd ? (
          <p className="mt-1 text-sm text-s-text-2">
            Actual: {actualText(acd.from, acd.to)} <span>{humanizeDimension(acd.dimension)}</span>
          </p>
        ) : null}
        {prediction?.learning ? <p className="mt-2 text-[13px] leading-relaxed text-s-muted">{prediction.learning}</p> : null}
      </section>

      {/* Capability changes (qualitative direction, no scores) */}
      {Object.keys(newCaps).length > 0 ? (
        <section className="mt-4">
          <h2 className="text-h3 text-s-text">Capability changes</h2>
          <div className="mt-3 flex flex-col gap-2">
            {Object.entries(newCaps).map(([dim, c]) => {
              const before = prevCaps[dim]?.score
              const delta = before != null ? c.score - before : null
              return (
                <div key={dim} className="flex items-center justify-between gap-4 rounded-lg border border-s-line px-3 py-2 text-sm text-s-text">
                  <span className="font-medium">{humanizeDimension(dim)}</span>
                  <span className="text-right text-s-muted">{changeText(delta)}</span>
                </div>
              )
            })}
          </div>
        </section>
      ) : null}

      {/* Proof */}
      {proof || updated.observation ? (
        <section className="mt-6 rounded-2xl border border-s-line bg-s-panel p-6">
          <div className="font-mono text-eyebrow uppercase text-s-muted">What supports this</div>
          {proof ? <p className="mt-2 text-[14px] leading-relaxed text-s-text-2">{proof}</p> : null}
          {updated.observation ? <p className="mt-2 text-[13px] leading-relaxed text-s-muted">{updated.observation}</p> : null}
        </section>
      ) : null}

      {/* Next move */}
      {nextMove ? (
        <section className="mt-6 rounded-3xl bg-focal p-6 shadow-focal ring-1 ring-inset ring-white/[0.06]">
          <div className="font-mono text-eyebrow uppercase text-focal-soft">Your next move</div>
          <h2 className="mt-2 text-h3 text-on-focal">{nextMove.title}</h2>
          {nextMove.thesis ? <p className="mt-2 text-body text-on-focal-dim">{nextMove.thesis}</p> : null}
        </section>
      ) : null}

      <div className="mt-8">
        <Link href="/app/move" className="inline-flex min-h-11 items-center rounded-lg bg-s-accent px-5 py-3 text-sm font-medium text-s-accent-contrast hover:-translate-y-px transition-transform">
          Continue your sprint
        </Link>
      </div>
    </div>
  )
}
