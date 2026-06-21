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
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight">Monthly re-rating</h1>
        <p className="mt-3 text-sm text-black/50">
          Not enough evidence yet. Complete a weekly check-in and get feedback, then your re-rating
          appears here.
        </p>
        <Link href="/app/checkin" className="mt-4 inline-flex rounded-lg bg-black px-4 py-2 text-sm font-medium text-white">
          Go to check-in
        </Link>
      </div>
    )
  }

  if (approvedVas.length < 2) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight">Monthly re-rating</h1>
        <p className="mt-3 text-sm text-black/50">
          Your re-rating is being reviewed. Every re-rating is checked by a human before you see it.
          Check back shortly.
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
    verdict === 'hit' ? 'bg-black text-white' : verdict === 'partial' ? 'bg-black/10 text-black' : 'border border-black/25 text-black/60'

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="text-xs uppercase tracking-wide text-black/40">Monthly re-rating</div>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Did your capability move?</h1>

      <div className="mt-3 text-sm text-black/60">
        Capability trajectory: <strong>{trajectoryLabel(updated.trajectory)}</strong> · confidence {updated.confidence}
      </div>

      {updated.confidence_reason ? (
        <p className="mt-3 text-[15px] leading-relaxed text-black/70">{updated.confidence_reason}</p>
      ) : null}

      {/* Prediction vs actual + verdict (qualitative, no numbers) */}
      <section className="mt-8 rounded-2xl border border-black/10 p-6">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wide text-black/40">Prediction vs actual</div>
          {verdict ? (
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${verdictTone}`}>
              {VERDICT_LABEL[verdict] ?? verdict}
            </span>
          ) : null}
        </div>
        {pcd ? (
          <p className="mt-3 text-sm text-black/70">
            Predicted: stronger evidence of <span>{humanizeDimension(pcd.dimension)}</span>
          </p>
        ) : null}
        {acd ? (
          <p className="mt-1 text-sm text-black/70">
            Actual: {actualText(acd.from, acd.to)} <span>{humanizeDimension(acd.dimension)}</span>
          </p>
        ) : null}
        {prediction?.learning ? <p className="mt-2 text-[13px] leading-relaxed text-black/55">{prediction.learning}</p> : null}
      </section>

      {/* Capability changes (qualitative direction, no scores) */}
      {Object.keys(newCaps).length > 0 ? (
        <section className="mt-4">
          <h2 className="text-sm font-semibold">Capability changes</h2>
          <div className="mt-3 flex flex-col gap-2">
            {Object.entries(newCaps).map(([dim, c]) => {
              const before = prevCaps[dim]?.score
              const delta = before != null ? c.score - before : null
              return (
                <div key={dim} className="flex items-center justify-between gap-4 rounded-lg border border-black/10 px-3 py-2 text-sm">
                  <span className="font-medium">{humanizeDimension(dim)}</span>
                  <span className="text-right text-black/55">{changeText(delta)}</span>
                </div>
              )
            })}
          </div>
        </section>
      ) : null}

      {/* Proof */}
      {proof || updated.observation ? (
        <section className="mt-6 rounded-2xl border border-black/10 p-6">
          <div className="text-xs uppercase tracking-wide text-black/40">What supports this</div>
          {proof ? <p className="mt-2 text-[14px] leading-relaxed text-black/70">{proof}</p> : null}
          {updated.observation ? <p className="mt-2 text-[13px] leading-relaxed text-black/55">{updated.observation}</p> : null}
        </section>
      ) : null}

      {/* Next move */}
      {nextMove ? (
        <section className="mt-6 rounded-2xl bg-black p-6 text-white">
          <div className="text-xs uppercase tracking-wide text-white/50">Your next move</div>
          <h2 className="mt-2 text-lg font-semibold tracking-tight">{nextMove.title}</h2>
          {nextMove.thesis ? <p className="mt-2 text-sm leading-relaxed text-white/70">{nextMove.thesis}</p> : null}
        </section>
      ) : null}

      <div className="mt-8">
        <Link href="/app/move" className="inline-flex rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-black/85">
          Continue your sprint
        </Link>
      </div>
    </div>
  )
}
