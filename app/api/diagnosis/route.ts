import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { IntakeSchema } from '@/lib/validation'
import { generateResultToken } from '@/lib/tokens'
import { runValueAssessment } from '@/lib/ai/value-assessment'
import { runOpportunityRanking } from '@/lib/ai/opportunity-ranking'
import { runConstraintMatch } from '@/lib/ai/constraint-match'
import { runExtractSignals } from '@/lib/ai/extract-signals'
import { classifyDecline } from '@/lib/atlas/decline-gate'
import { getConstraintByCode } from '@/lib/atlas/constraints'

export const runtime = 'nodejs'

// Pre-auth diagnosis intake. Everything here runs server-side with the service-role key,
// and every generated row is written as pending_review (human-in-the-loop gate).
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = IntakeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please check the form.', issues: parsed.error.flatten() },
      { status: 400 },
    )
  }
  const intake = parsed.data
  const admin = createAdminClient()

  try {
    // 1. find-or-create the lead/user (pre-auth: auth_user_id stays null)
    const { data: existing } = await admin
      .from('users')
      .select('id')
      .eq('email', intake.email)
      .limit(1)
      .maybeSingle()

    let userId: string
    const profileFields = {
      name: intake.name,
      role: intake.role,
      seniority: intake.seniority,
      years: intake.years,
      company_type: intake.company_type,
      region: intake.region,
      income_band: intake.income_band,
      goal: intake.goal,
      target: intake.target,
      unfair_advantages: intake.unfair_advantages,
    }

    if (existing?.id) {
      userId = existing.id
      await admin.from('users').update(profileFields).eq('id', userId)
    } else {
      const { data: created, error } = await admin
        .from('users')
        .insert({ email: intake.email, status: 'lead', ...profileFields })
        .select('id')
        .single()
      if (error) throw error
      userId = created.id
    }

    // 2. cycle row (the Outcome Graph log, snapshot the profile at decision time). Created
    // before the diagnosis so the diagnosis links to its exact cycle (no created_at pairing).
    const { data: cycle, error: cycleErr } = await admin
      .from('cycles')
      .insert({ user_id: userId, profile_snapshot: intake, status: 'active' })
      .select('id')
      .single()
    if (cycleErr) throw cycleErr
    const cycleId = cycle.id

    // 3. diagnosis row + bearer token for the results page, linked to the exact cycle above.
    const token = generateResultToken()
    const { error: diagErr } = await admin.from('diagnoses').insert({
      user_id: userId,
      cycle_id: cycleId,
      work_sample: intake.work_sample,
      answers: intake,
      result_token: token,
    })
    if (diagErr) throw diagErr

    // 4. Value Assessment AI -> value_assessments (pending_review)
    const va = await runValueAssessment(intake)
    const { error: vaErr } = await admin.from('value_assessments').insert({
      user_id: userId,
      cycle_id: cycleId,
      value_low: va.value_low,
      value_mid: va.value_mid,
      value_high: va.value_high,
      currency: va.currency,
      confidence: va.confidence,
      confidence_reason: va.confidence_reason,
      ai_exposure: va.ai_exposure,
      trajectory: va.trajectory,
      capability_scores: va.capability_scores,
      gaps: va.gaps,
      observation: va.observation,
      inputs: va.inputs,
      status: 'pending_review',
    })
    if (vaErr) throw vaErr

    // 5. Opportunity Ranking AI -> moves (pending_review) + predictions (Trust System)
    const opp = await runOpportunityRanking(intake, va)
    const { data: move, error: moveErr } = await admin
      .from('moves')
      .insert({
        cycle_id: cycleId,
        user_id: userId,
        title: opp.title,
        thesis: opp.thesis,
        target_outcome: opp.target_outcome,
        leverage_score: opp.leverage_score,
        confidence: opp.confidence,
        reasoning: opp.reasoning,
        deferred_alternatives: opp.deferred_alternatives,
        status: 'pending_review',
      })
      .select('id')
      .single()
    if (moveErr) throw moveErr

    const { error: predErr } = await admin.from('predictions').insert({
      cycle_id: cycleId,
      move_id: move.id,
      pred_capability_delta: opp.prediction.pred_capability_delta,
      pred_value_delta: opp.prediction.pred_value_delta,
      confidence: opp.prediction.confidence,
      horizon_days: opp.prediction.horizon_days,
    })
    if (predErr) throw predErr

    // 6. Constraint match (across the profession map) + Decline Gate. Best-effort: a failure
    // here must not fail the diagnosis. Stored in existing cycle JSONB only (no schema
    // change). Only an `accepted` M1 result may sell a Sprint; known-but-inactive or
    // non-marketing constraints route to `waitlist`; everything else routes the user away.
    try {
      // Match the constraint and pull the user's raw signals together. Signal extraction is
      // best-effort on its own (null on failure) so it can never fail the diagnosis.
      const [classification, signals] = await Promise.all([
        runConstraintMatch(intake, { observation: va.observation, gaps: va.gaps }),
        runExtractSignals(intake.work_sample).catch(() => null),
      ])
      const declineResult = classifyDecline(classification)
      // Authored bar/rep data exists only for the sellable (accepted/M1) constraint.
      const authored =
        declineResult.decision === 'accepted' && declineResult.matched_code
          ? getConstraintByCode(declineResult.matched_code)
          : undefined
      await admin
        .from('cycles')
        .update({
          profile_snapshot: {
            ...intake,
            atlas: {
              constraint_code: declineResult.matched_code,
              constraint_name: declineResult.matched_name,
              profession: declineResult.profession,
              decline_result: declineResult,
              bar: authored ? authored.bar : null,
              target_capability: authored ? authored.bar.definition : null,
              waitlist:
                declineResult.decision === 'waitlist'
                  ? {
                      constraint_code: declineResult.matched_code,
                      profession: declineResult.profession,
                      joined_at: new Date().toISOString(),
                    }
                  : null,
              signals,
            },
          },
        })
        .eq('id', cycleId)
    } catch (matchErr) {
      console.error(
        '[diagnosis] constraint match failed:',
        matchErr instanceof Error ? matchErr.message : matchErr,
      )
    }

    return NextResponse.json({ token })
  } catch (err) {
    console.error('[diagnosis] failed:', err)
    const message = err instanceof Error ? err.message : 'Diagnosis failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
