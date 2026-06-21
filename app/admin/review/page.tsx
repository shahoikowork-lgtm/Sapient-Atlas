import { createAdminClient } from '@/lib/supabase/admin'
import { ReviewActions } from './review-actions'
import { SubmissionActions } from './submission-actions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Admin-only (the /admin layout calls requireAdmin). Two queues: pending diagnosis
// output (value assessment + move) and pending weekly feedback submissions.
export default async function ReviewPage() {
  const admin = createAdminClient()

  const { data: vas } = await admin
    .from('value_assessments')
    .select('*')
    .eq('status', 'pending_review')
    .order('created_at', { ascending: false })

  const diagItems = await Promise.all(
    (vas ?? []).map(async (va) => {
      const { data: user } = await admin
        .from('users').select('email,name,role').eq('id', va.user_id).maybeSingle()
      const { data: move } = await admin
        .from('moves').select('*').eq('cycle_id', va.cycle_id).eq('status', 'pending_review').maybeSingle()
      const { data: prior } = await admin
        .from('value_assessments').select('id').eq('cycle_id', va.cycle_id).eq('status', 'approved').limit(1)
      return { va, user, move, isRerating: (prior?.length ?? 0) > 0 }
    }),
  )

  const { data: subs } = await admin
    .from('submissions')
    .select('*')
    .eq('status', 'pending_review')
    .order('submitted_at', { ascending: false })

  const subItems = await Promise.all(
    (subs ?? []).map(async (s) => {
      const { data: user } = await admin.from('users').select('email,name').eq('id', s.user_id).maybeSingle()
      return { s, user }
    }),
  )

  if (diagItems.length === 0 && subItems.length === 0) {
    return (
      <div className="text-sm text-black/60">
        Nothing pending review. New diagnoses and weekly check-ins appear here.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      {diagItems.length > 0 ? (
        <div className="flex flex-col gap-6">
          <h1 className="text-lg font-semibold">Pending assessments ({diagItems.length})</h1>
          {diagItems.map(({ va, user, move, isRerating }) => (
            <div key={va.id} className="rounded-xl border border-black/10 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium">
                    {user?.name ?? 'Unknown'} · <span className="text-black/60">{user?.role ?? '-'}</span>
                    {isRerating ? (
                      <span className="ml-2 rounded bg-black/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">re-rating</span>
                    ) : null}
                  </div>
                  <div className="text-xs text-black/40">{user?.email}</div>
                </div>
                {va.cycle_id ? <ReviewActions cycleId={va.cycle_id} /> : null}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-black/[0.03] p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-black/40">Value assessment</div>
                  <div className="mt-2 font-mono text-sm">
                    {va.value_low}–{va.value_high} {va.currency} · conf {va.confidence}
                  </div>
                  <div className="mt-1 text-xs text-black/50">
                    trajectory {va.trajectory} · AI exposure{' '}
                    {va.ai_exposure != null ? `${Math.round(va.ai_exposure * 100)}%` : '-'}
                  </div>
                  {va.observation ? <p className="mt-2 text-[13px] leading-relaxed text-black/70">{va.observation}</p> : null}
                  <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words text-[11px] leading-relaxed text-black/50">
                    {JSON.stringify(va.capability_scores, null, 2)}
                  </pre>
                </div>

                <div className="rounded-lg bg-black/[0.03] p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-black/40">Move</div>
                  {move ? (
                    <>
                      <div className="mt-2 text-sm font-medium">{move.title}</div>
                      {move.thesis ? <p className="mt-1 text-[13px] leading-relaxed text-black/70">{move.thesis}</p> : null}
                      {move.reasoning ? <p className="mt-2 text-[12px] leading-relaxed text-black/55">{move.reasoning}</p> : null}
                      <div className="mt-2 text-xs text-black/40">
                        leverage {move.leverage_score} · conf {move.confidence}
                      </div>
                    </>
                  ) : (
                    <div className="mt-2 text-xs text-black/40">No move generated.</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {subItems.length > 0 ? (
        <div className="flex flex-col gap-4">
          <h1 className="text-lg font-semibold">Pending weekly feedback ({subItems.length})</h1>
          {subItems.map(({ s, user }) => {
            const fb = (s.feedback ?? {}) as {
              strength?: string
              key_fix?: string
              next_step?: string
              capability_delta?: { dimension?: string; delta?: number }
            }
            return (
              <div key={s.id} className="rounded-xl border border-black/10 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium">
                      {user?.name ?? 'Unknown'} · <span className="text-black/60">Week {s.week}</span>
                    </div>
                    <div className="text-xs text-black/40">{user?.email}</div>
                  </div>
                  <SubmissionActions submissionId={s.id} />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-black/[0.03] p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-black/40">Submitted work</div>
                    <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words text-[12px] leading-relaxed text-black/70">
                      {s.artifact_text}
                    </pre>
                  </div>
                  <div className="rounded-lg bg-black/[0.03] p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-black/40">
                      AI feedback (score {s.graded_score ?? '-'})
                    </div>
                    {fb.strength ? <p className="mt-2 text-[13px] text-black/70"><strong>Strength:</strong> {fb.strength}</p> : null}
                    {fb.key_fix ? <p className="mt-1 text-[13px] text-black/70"><strong>Key fix:</strong> {fb.key_fix}</p> : null}
                    {fb.capability_delta ? (
                      <p className="mt-1 text-[12px] text-black/50">
                        {fb.capability_delta.dimension} +{fb.capability_delta.delta}
                      </p>
                    ) : null}
                    {fb.next_step ? <p className="mt-1 text-[12px] text-black/50"><strong>Next:</strong> {fb.next_step}</p> : null}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
