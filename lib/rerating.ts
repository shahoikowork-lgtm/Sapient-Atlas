import { createAdminClient } from '@/lib/supabase/admin'
import { runMonthlyRerating } from '@/lib/ai/monthly-rerating'
import type { AppUser } from '@/lib/app-user'

// How many reviewed weekly submissions count as "enough evidence" to re-rate.
// (Low for V1 so the loop is testable; raise toward 3-4 for production.)
export const MIN_REVIEWED_FOR_RERATING = 1

export type ReratingStatus = 'not_enough' | 'pending_review' | 'approved' | 'no_cycle' | 'error'

// Generate the monthly re-rating once, lazily, when there is enough evidence. Idempotent.
// Writes (service role): a new value_assessment (pending_review), the prediction evaluation,
// and the next move (pending_review). value_history is appended only at admin approval.
export async function ensureRerating(user: AppUser, cycleId: string): Promise<{ status: ReratingStatus }> {
  if (user.status !== 'sprint' && user.status !== 'continuous') return { status: 'not_enough' }
  try {
    const admin = createAdminClient()

    const { data: cycle } = await admin.from('cycles').select('id,user_id').eq('id', cycleId).maybeSingle()
    if (!cycle || cycle.user_id !== user.id) return { status: 'no_cycle' }

    const { data: reviewed } = await admin
      .from('submissions').select('week,graded_score,feedback,artifact_text')
      .eq('cycle_id', cycleId).eq('status', 'reviewed').order('week', { ascending: true })
    if (!reviewed || reviewed.length < MIN_REVIEWED_FOR_RERATING) return { status: 'not_enough' }

    const { data: vas } = await admin
      .from('value_assessments')
      .select('id,status,value_low,value_mid,value_high,capability_scores,gaps')
      .eq('cycle_id', cycleId).order('created_at', { ascending: true })

    // A re-rating already exists once the cycle has a second assessment.
    if (vas && vas.length >= 2) {
      const rr = vas[vas.length - 1]
      return { status: rr.status === 'approved' ? 'approved' : 'pending_review' }
    }
    const original = vas?.[0]
    if (!original) return { status: 'not_enough' }

    const { data: move } = await admin
      .from('moves').select('title,target_outcome').eq('cycle_id', cycleId)
      .in('status', ['approved', 'active', 'completed']).order('assigned_at', { ascending: true }).limit(1).maybeSingle()
    const { data: prediction } = await admin
      .from('predictions').select('id,pred_capability_delta,pred_value_delta').eq('cycle_id', cycleId).maybeSingle()

    const rr = await runMonthlyRerating({
      original: {
        value_low: original.value_low,
        value_mid: original.value_mid,
        value_high: original.value_high,
        capability_scores: original.capability_scores,
        gaps: original.gaps,
      },
      moveTitle: move?.title ?? '',
      moveTarget: move?.target_outcome ?? '',
      prediction: prediction
        ? { pred_capability_delta: prediction.pred_capability_delta, pred_value_delta: prediction.pred_value_delta }
        : null,
      submissions: reviewed.map((s) => ({
        week: s.week,
        score: s.graded_score,
        feedback: s.feedback,
        work: (s.artifact_text ?? '').slice(0, 600),
      })),
    })

    await admin.from('value_assessments').insert({
      user_id: user.id,
      cycle_id: cycleId,
      value_low: rr.value_low,
      value_mid: rr.value_mid,
      value_high: rr.value_high,
      currency: rr.currency,
      confidence: rr.confidence,
      confidence_reason: rr.confidence_reason,
      ai_exposure: rr.ai_exposure,
      trajectory: rr.trajectory,
      capability_scores: rr.capability_scores,
      gaps: original.gaps,
      observation: rr.observation,
      inputs: [rr.proof_summary],
      status: 'pending_review',
    })

    if (prediction) {
      await admin.from('predictions').update({
        evaluated_at: new Date().toISOString(),
        actual_capability_delta: rr.prediction_eval.actual_capability_delta,
        actual_value_delta: rr.prediction_eval.actual_value_delta,
        verdict: rr.prediction_eval.verdict,
        learning: rr.prediction_eval.learning,
      }).eq('id', prediction.id)
    }

    await admin.from('moves').insert({
      cycle_id: cycleId,
      user_id: user.id,
      title: rr.next_move.title,
      thesis: rr.next_move.thesis,
      target_outcome: rr.next_move.target_outcome,
      reasoning: rr.next_move.reasoning,
      confidence: rr.next_move.confidence,
      status: 'pending_review',
    })

    return { status: 'pending_review' }
  } catch (err) {
    console.error('[ensureRerating] failed:', err instanceof Error ? err.message : err)
    return { status: 'error' }
  }
}
