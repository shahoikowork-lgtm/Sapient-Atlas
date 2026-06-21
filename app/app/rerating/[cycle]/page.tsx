import Link from 'next/link'
import { getAppUser } from '@/lib/app-user'
import { createClient } from '@/lib/supabase/server'
import { ensureRerating, MIN_REVIEWED_FOR_RERATING } from '@/lib/rerating'
import { money } from '@/lib/format'

export const dynamic = 'force-dynamic'

const VERDICT_LABEL: Record<string, string> = { hit: 'Hit', partial: 'Partial', miss: 'Miss' }

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
  const attributed = (Number(updated.value_mid) || 0) - (Number(previous.value_mid) || 0)
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
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Are you more valuable now?</h1>

      <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-black/10 p-5">
          <div className="text-xs uppercase tracking-wide text-black/40">Previous</div>
          <div className="mt-1 font-mono text-xl font-semibold">
            {money(previous.value_low, previous.currency)}–{money(previous.value_high, previous.currency)}
          </div>
          <div className="mt-1 text-xs text-black/45">mid {money(previous.value_mid, previous.currency)}</div>
        </div>
        <div className="rounded-2xl bg-black p-5 text-white">
          <div className="text-xs uppercase tracking-wide text-white/50">Updated</div>
          <div className="mt-1 font-mono text-xl font-semibold">
            {money(updated.value_low, updated.currency)}–{money(updated.value_high, updated.currency)}
          </div>
          <div className="mt-1 text-xs text-white/60">
            mid {money(updated.value_mid, updated.currency)} · confidence {updated.confidence}
          </div>
        </div>
      </section>

      <div className="mt-3 text-sm">
        Attributed change:{' '}
        <strong>
          {attributed >= 0 ? '+' : ''}
          {money(attributed, updated.currency)}
        </strong>
        <span className="text-black/45">
          {' '}· trajectory <span className="capitalize">{updated.trajectory}</span>
        </span>
      </div>

      {updated.confidence_reason ? (
        <p className="mt-3 text-[15px] leading-relaxed text-black/70">{updated.confidence_reason}</p>
      ) : null}

      {/* Prediction vs actual + verdict */}
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
            Predicted: <span className="capitalize">{pcd.dimension}</span> {pcd.from} → {pcd.to}
            {prediction?.pred_value_delta != null ? <> · value {money(prediction.pred_value_delta, updated.currency)}</> : null}
          </p>
        ) : null}
        {acd ? (
          <p className="mt-1 text-sm text-black/70">
            Actual: <span className="capitalize">{acd.dimension}</span> {acd.from} → {acd.to}
            {prediction?.actual_value_delta != null ? <> · value {money(prediction.actual_value_delta, updated.currency)}</> : null}
          </p>
        ) : null}
        {prediction?.learning ? <p className="mt-2 text-[13px] leading-relaxed text-black/55">{prediction.learning}</p> : null}
      </section>

      {/* Capability changes */}
      {Object.keys(newCaps).length > 0 ? (
        <section className="mt-4">
          <h2 className="text-sm font-semibold">Capability changes</h2>
          <div className="mt-3 flex flex-col gap-2">
            {Object.entries(newCaps).map(([dim, c]) => {
              const before = prevCaps[dim]?.score
              const after = c.score
              const delta = before != null ? after - before : null
              return (
                <div key={dim} className="flex items-center justify-between rounded-lg border border-black/10 px-3 py-2 text-sm">
                  <span className="capitalize">{dim}</span>
                  <span className="font-mono text-black/70">
                    {before != null ? `${before} → ` : ''}
                    {after}
                    {delta != null ? (
                      <span className={delta >= 0 ? 'text-black/45' : 'text-red-600'}>
                        {' '}({delta >= 0 ? '+' : ''}
                        {delta})
                      </span>
                    ) : null}
                  </span>
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
