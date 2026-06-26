import { NextResponse } from 'next/server'
import { getAppUser } from '@/lib/app-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { runWeeklyFeedback } from '@/lib/ai/weekly-feedback'
import { runRepCheck } from '@/lib/ai/rep-check'
import { toUserFacingRepCheck } from '@/lib/atlas/rep-grade'
import { getConstraintByCode } from '@/lib/atlas/constraints'
import { methodPromptBlock } from '@/lib/atlas/constraints/types'
import { resolveMissionBar } from '@/lib/atlas/mission-bar'

export const runtime = 'nodejs'

// Weekly check-in submission. Logged-in user; all writes via service role. The AI
// feedback is saved as pending_review (the user does not see it until admin approval).
export async function POST(request: Request) {
  const user = await getAppUser()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  let body: { week?: number; artifact_text?: string; preview?: boolean; intent?: 'lock_in' | 'coach'; attempts?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const week = Number(body.week)
  const artifactText = (body.artifact_text ?? '').trim()
  if (!week || week < 1) return NextResponse.json({ error: 'Invalid week' }, { status: 400 })
  if (artifactText.length < 20) {
    return NextResponse.json({ error: 'Please describe your work in a few sentences.' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: cycle } = await admin
    .from('cycles').select('id').eq('user_id', user.id)
    .order('started_at', { ascending: false }).limit(1).maybeSingle()
  if (!cycle) return NextResponse.json({ error: 'No active sprint' }, { status: 400 })

  // Milestone (title + bar) + the deep method — needed for the bar-check in both preview and
  // the real submit. V1 sells only M1, so the active constraint (the sourced "what good looks
  // like" that keeps feedback specific, not generic) is M1.
  const { data: plan } = await admin.from('plans').select('weekly_milestones').eq('cycle_id', cycle.id).maybeSingle()
  const milestones = (plan?.weekly_milestones ?? []) as {
    week?: number
    title?: string
    task?: string
    success_criteria?: string
    micro_skill?: string
  }[]
  const m = milestones.find((x) => (x.week ?? 0) === week) ?? milestones[week - 1]
  const milestoneText = m ? `${m.title ?? ''}: ${m.task ?? ''}` : `Week ${week}`
  const missionTitle = m?.title ?? `Week ${week}`
  // The bar the rep is checked against and the one approved correction both come from the M1
  // capability map via the mission's focus micro-skill — pre-authored, never AI-invented.
  const { barText: bar, fix: oneMove } = resolveMissionBar(m?.micro_skill)
  const constraint = getConstraintByCode('M1')
  const methodBlock = constraint ? methodPromptBlock(constraint) : undefined

  // Preview: check the work against the bar but persist NOTHING — this powers the
  // tighten-and-recheck loop, so a re-check never burns the one-per-mission submission.
  if (body.preview) {
    try {
      const check = await runRepCheck({ missionTitle, bar, artifactText, methodBlock })
      return NextResponse.json({ ok: true, check: toUserFacingRepCheck(check, oneMove) })
    } catch (err) {
      console.error('[submissions] preview bar-check failed:', err instanceof Error ? err.message : err)
      return NextResponse.json({ ok: true, check: null })
    }
  }

  // Real submit: one per week.
  const { data: existing } = await admin
    .from('submissions').select('id')
    .eq('user_id', user.id).eq('cycle_id', cycle.id).eq('week', week).maybeSingle()
  if (existing) return NextResponse.json({ error: 'You already submitted this week.' }, { status: 409 })

  const { data: move } = await admin
    .from('moves').select('title').eq('cycle_id', cycle.id)
    .in('status', ['approved', 'active', 'completed']).maybeSingle()

  // The instant bar-check (ATLAS_OS §6, design-time-approval gate) decides what happens BEFORE
  // we persist anything, so run it first and on its own.
  const intent = body.intent === 'coach' ? 'coach' : 'lock_in'
  let check: Awaited<ReturnType<typeof runRepCheck>> | null = null
  try {
    check = await runRepCheck({ missionTitle, bar, artifactText, methodBlock })
  } catch (err) {
    console.error('[submissions] bar-check failed:', err instanceof Error ? err.message : err)
  }

  // The confidence gate (fork #1, ATLAS_OS §11). High-confidence verdicts are instant and need
  // no human: a HIT clears and the next mission opens; a miss/partial returns the one approved
  // correction for an IMMEDIATE RETRY — no human, no persisted submission, no block, so the rep
  // is never burned. Only a LOW-confidence verdict (off-mission, ambiguous, or it would need
  // new strategy), a failed check, or the user explicitly asking ('coach') routes to a human.
  const isHit = check?.quality === 'hit'
  const highConf = check?.confidence === 'high'
  let outcome: 'cleared' | 'retry' | 'review'
  if (intent === 'coach' || !check) outcome = 'review'
  else if (highConf && isHit) outcome = 'cleared'
  else if (highConf) outcome = 'retry'
  else outcome = 'review'

  // Confident "Not yet": instant feedback only. Persist nothing, block nothing — the user makes
  // the one change and checks again. This is what keeps the founder out of every attempt.
  if (outcome === 'retry') {
    return NextResponse.json({ ok: true, outcome, check: check ? toUserFacingRepCheck(check, oneMove) : null })
  }

  // 'cleared' or 'review' persist. The weekly note (free prose, always gated) is generated only
  // for a rep that is actually saved — never wasted on a retry.
  let fb: Awaited<ReturnType<typeof runWeeklyFeedback>> | null = null
  try {
    fb = await runWeeklyFeedback({ moveTitle: move?.title ?? '', week, milestone: milestoneText, artifactText, methodBlock })
  } catch (err) {
    console.error('[submissions] weekly feedback failed:', err instanceof Error ? err.message : err)
  }

  const autoCleared = outcome === 'cleared'
  const status = autoCleared ? 'reviewed' : 'pending_review'

  // Persist the work + both layers. The cleared micro-skill is recorded for progress capture.
  // attempts (how many checks the user ran before locking in) and correction_shown (the
  // pre-approved "one move" for this micro-skill) are the OutcomeGraph's raw material: they make
  // clearance latency and correction efficacy computable from user #1 — the flywheel's fuel.
  const attempts = Number.isFinite(body.attempts) && (body.attempts as number) > 0 ? Math.min(Math.round(body.attempts as number), 99) : null
  const feedback = {
    ...(fb?.feedback ?? {}),
    ...(check ? { bar_check: check.bar_check, quality: check.quality, confidence: check.confidence } : {}),
    micro_skill: m?.micro_skill ?? null,
    cleared_micro_skill: isHit ? (m?.micro_skill ?? 'full') : null,
    auto_cleared: autoCleared,
    attempts,
    correction_shown: oneMove,
  }
  const { error: insErr } = await admin.from('submissions').insert({
    user_id: user.id,
    cycle_id: cycle.id,
    week,
    artifact_text: artifactText,
    graded_score: fb?.graded_score ?? null,
    feedback,
    status,
  })
  if (insErr) {
    console.error('[submissions] insert failed:', insErr.message)
    return NextResponse.json({ error: 'Could not save your work. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, outcome, check: check ? toUserFacingRepCheck(check, oneMove) : null })
}
