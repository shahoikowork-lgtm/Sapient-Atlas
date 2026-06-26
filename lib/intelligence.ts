import { createAdminClient } from '@/lib/supabase/admin'
import { deriveMissions } from '@/lib/sprint'
import { PHASES } from '@/lib/ladder'
import { getConstraintByCode } from '@/lib/atlas/constraints'
import { getMicroSkill } from '@/lib/atlas/constraints/types'

/**
 * The Capability Intelligence Engine — measurement layer (read-only).
 *
 * Two questions, answered from the data Atlas already produces (no schema change):
 *  1. getTransformationFunnel — what % of paid sprints reach a real transformation, and where
 *     the drop-off is. The one metric that matters (Hormozi): the share who become measurably
 *     more valuable. Steps mirror the four-phase arc + the day-30 re-rating verdict.
 *  2. getMicroSkillStats — the OutcomeGraph: per micro-skill, how often it clears, how many
 *     attempts it takes, and where users stall. This is what tells you which bars/corrections
 *     to sharpen — the flywheel's read-out.
 *
 * Everything keys off submissions.feedback (quality, micro_skill, cleared_micro_skill,
 * attempts) and predictions.verdict — captured from user #1.
 */

type FeedbackShape = {
  quality?: 'hit' | 'partial' | 'miss'
  micro_skill?: string | null
  cleared_micro_skill?: string | null
  attempts?: number | null
}
type SubRow = { cycle_id: string | null; week: number; status: string; feedback: FeedbackShape | null }

export type FunnelStep = { key: string; label: string; count: number; pctOfStarted: number; dropFromPrev: number }
export type TransformationFunnel = {
  started: number
  steps: FunnelStep[]
  biggestLeakKey: string | null
}

// The six steps, in order. Approximately nested (each is normally a subset of the prior).
const FUNNEL = [
  { key: 'started', label: 'Started a sprint (plan generated)' },
  { key: 'first_clear', label: 'First rep cleared (the felt win)' },
  { key: 'crossed_valley', label: 'Crossed the week-2 valley (a CROSS rep cleared)' },
  { key: 'independent', label: 'Cleared unaided (an INDEPENDENCE rep)' },
  { key: 'reached_proof', label: 'Reached real-stakes proof (a PROVE rep)' },
  { key: 'moved', label: 'Day-30 verdict: moved (real transformation)' },
] as const

export async function getTransformationFunnel(): Promise<TransformationFunnel> {
  const admin = createAdminClient()
  const [{ data: plans }, { data: subs }, { data: preds }] = await Promise.all([
    admin.from('plans').select('cycle_id, weekly_milestones'),
    admin.from('submissions').select('cycle_id, week, status, feedback'),
    admin.from('predictions').select('cycle_id, verdict'),
  ])

  const subsByCycle = new Map<string, SubRow[]>()
  for (const s of (subs ?? []) as SubRow[]) {
    if (!s.cycle_id) continue
    const arr = subsByCycle.get(s.cycle_id) ?? []
    arr.push(s)
    subsByCycle.set(s.cycle_id, arr)
  }
  const verdictByCycle = new Map<string, string>()
  for (const p of (preds ?? []) as { cycle_id: string | null; verdict: string | null }[]) {
    if (p.cycle_id && p.verdict) verdictByCycle.set(p.cycle_id, p.verdict)
  }

  const counts: Record<string, number> = { started: 0, first_clear: 0, crossed_valley: 0, independent: 0, reached_proof: 0, moved: 0 }

  for (const plan of (plans ?? []) as { cycle_id: string | null; weekly_milestones?: { week?: number }[] }[]) {
    if (!plan.cycle_id) continue
    counts.started++
    const cycleSubs = (subsByCycle.get(plan.cycle_id) ?? []).map((s) => ({ week: s.week, status: s.status, feedback: s.feedback }))
    const { missions } = deriveMissions({ weekly_milestones: plan.weekly_milestones }, cycleSubs)
    const done = missions.filter((m) => m.state === 'done')
    const maxPhase = done.reduce((mx, m) => Math.max(mx, PHASES.indexOf(m.phase)), -1)
    if (done.length > 0) counts.first_clear++
    if (maxPhase >= PHASES.indexOf('CROSS')) counts.crossed_valley++
    if (maxPhase >= PHASES.indexOf('INDEPENDENCE')) counts.independent++
    if (maxPhase >= PHASES.indexOf('PROVE')) counts.reached_proof++
    if (verdictByCycle.get(plan.cycle_id) === 'hit') counts.moved++
  }

  const started = counts.started || 0
  let prev = started
  let biggestLeakKey: string | null = null
  let biggestDrop = -1
  const steps: FunnelStep[] = FUNNEL.map((s) => {
    const count = counts[s.key]
    const dropFromPrev = prev - count
    if (s.key !== 'started' && dropFromPrev > biggestDrop) {
      biggestDrop = dropFromPrev
      biggestLeakKey = s.key
    }
    prev = count
    return { key: s.key, label: s.label, count, pctOfStarted: started ? Math.round((count / started) * 100) : 0, dropFromPrev }
  })

  return { started, steps, biggestLeakKey }
}

export type MicroSkillStat = {
  micro_skill: string
  name: string
  attempts: number // submissions that targeted this micro-skill
  clears: number // of those, how many were a hit
  clearRate: number // 0..1
  stallRate: number // 1 - clearRate
  avgAttempts: number | null // mean checks-to-lock-in (clearance latency), where recorded
}

// The OutcomeGraph read-out: per micro-skill, how it performs across all reps. Sorted worst-
// first (highest stall) so the operator sees exactly which bar/correction to sharpen next.
export async function getMicroSkillStats(): Promise<MicroSkillStat[]> {
  const admin = createAdminClient()
  const { data: subs } = await admin.from('submissions').select('feedback')
  const m1 = getConstraintByCode('M1')

  const agg = new Map<string, { attempts: number; clears: number; attemptsSum: number; attemptsN: number }>()
  for (const row of (subs ?? []) as { feedback: FeedbackShape | null }[]) {
    const ms = row.feedback?.micro_skill
    if (!ms) continue
    const a = agg.get(ms) ?? { attempts: 0, clears: 0, attemptsSum: 0, attemptsN: 0 }
    a.attempts++
    if (row.feedback?.quality === 'hit') a.clears++
    if (typeof row.feedback?.attempts === 'number' && row.feedback.attempts > 0) {
      a.attemptsSum += row.feedback.attempts
      a.attemptsN++
    }
    agg.set(ms, a)
  }

  const stats: MicroSkillStat[] = [...agg.entries()].map(([ms, a]) => {
    const clearRate = a.attempts ? a.clears / a.attempts : 0
    const name = ms === 'full' ? 'Full positioning (integrative)' : (m1 ? getMicroSkill(m1, ms)?.name ?? ms : ms)
    return {
      micro_skill: ms,
      name,
      attempts: a.attempts,
      clears: a.clears,
      clearRate,
      stallRate: 1 - clearRate,
      avgAttempts: a.attemptsN ? Math.round((a.attemptsSum / a.attemptsN) * 10) / 10 : null,
    }
  })

  stats.sort((x, y) => y.stallRate - x.stallRate || y.attempts - x.attempts)
  return stats
}
