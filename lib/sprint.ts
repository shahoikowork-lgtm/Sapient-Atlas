import { createAdminClient } from '@/lib/supabase/admin'
import { runThirtyDayPlan } from '@/lib/ai/thirty-day-plan'
import type { AppUser } from '@/lib/app-user'

// Generate the 30-day plan once, lazily, for a paid (sprint/continuous) user on first
// access to a plan-using page. Idempotent. Service role (writes). The page then reads
// the plan back via the RLS-scoped client. Errors are swallowed so the page never crashes.
export async function ensureSprintPlan(user: AppUser): Promise<void> {
  if (user.status !== 'sprint' && user.status !== 'continuous') return
  try {
    const admin = createAdminClient()

    const { data: cycle } = await admin
      .from('cycles').select('id').eq('user_id', user.id)
      .order('started_at', { ascending: false }).limit(1).maybeSingle()
    if (!cycle) return

    const { data: existing } = await admin.from('plans').select('id').eq('cycle_id', cycle.id).maybeSingle()
    if (existing) return

    const { data: assessment } = await admin
      .from('value_assessments').select('gaps,capability_scores')
      .eq('cycle_id', cycle.id).eq('status', 'approved').maybeSingle()
    const { data: move } = await admin
      .from('moves').select('title,thesis,target_outcome')
      .eq('cycle_id', cycle.id).in('status', ['approved', 'active', 'completed']).maybeSingle()
    if (!assessment || !move) return

    const plan = await runThirtyDayPlan({
      moveTitle: move.title,
      moveThesis: move.thesis ?? '',
      moveTarget: move.target_outcome ?? '',
      gaps: assessment.gaps,
      capabilities: assessment.capability_scores,
    })

    await admin.from('plans').insert({
      cycle_id: cycle.id,
      weekly_milestones: plan.weekly_milestones,
      current_week: 1,
      status: 'active',
    })
  } catch (err) {
    console.error('[ensureSprintPlan] failed:', err instanceof Error ? err.message : err)
  }
}

type Milestone = { week?: number; title?: string; task?: string; success_criteria?: string }
type PlanRow = { weekly_milestones?: Milestone[] } | null
type SubmissionRow = { week: number; status: string; graded_score?: number | null; feedback?: unknown }

export type Week = {
  week: number
  title?: string
  task?: string
  success_criteria?: string
  submission: SubmissionRow | null
  state: 'todo' | 'pending' | 'done'
}

// Pure: derive each week's state from the plan + the user's submissions. The current
// week is the first one with no submission yet.
export function deriveWeeks(plan: PlanRow, submissions: SubmissionRow[]): {
  weeks: Week[]
  currentWeek: number | null
} {
  const milestones = plan?.weekly_milestones ?? []
  const byWeek = new Map(submissions.map((s) => [s.week, s]))
  const weeks: Week[] = milestones.map((m, i) => {
    const week = m.week ?? i + 1
    const sub = byWeek.get(week) ?? null
    const state: Week['state'] = !sub ? 'todo' : sub.status === 'reviewed' ? 'done' : 'pending'
    return { week, title: m.title, task: m.task, success_criteria: m.success_criteria, submission: sub, state }
  })
  const currentWeek = weeks.find((w) => w.state === 'todo')?.week ?? null
  return { weeks, currentWeek }
}

// ── Mission presentation layer (no logic change) ───────────────────────────────
// The Sprint is shown to the user as an ordered ladder of missions grouped into the
// four ATLAS phases. This is a pure projection of the same plan + submissions used by
// deriveWeeks — each milestone is one mission, the submission (week-indexed) drives its
// state. The data shape, the API, and progression logic are untouched.

export const PHASES = ['SEE', 'CROSS', 'INDEPENDENCE', 'PROVE'] as const
export type Phase = (typeof PHASES)[number]

export type Mission = {
  n: number // 1-based position
  total: number
  week: number // the submission key — identical to the milestone's week
  title?: string
  task?: string
  successCriteria?: string
  phase: Phase
  state: 'done' | 'review' | 'current' | 'locked'
}

export function deriveMissions(plan: PlanRow, submissions: SubmissionRow[]): {
  missions: Mission[]
  current: Mission | null
  cleared: number
  total: number
} {
  const { weeks, currentWeek } = deriveWeeks(plan, submissions)
  const total = weeks.length
  const missions: Mission[] = weeks.map((w, i) => {
    const phase = PHASES[Math.min(3, Math.floor((i * 4) / Math.max(1, total)))]
    let state: Mission['state']
    if (w.state === 'done') state = 'done'
    else if (w.state === 'pending') state = 'review'
    else state = w.week === currentWeek ? 'current' : 'locked'
    return { n: i + 1, total, week: w.week, title: w.title, task: w.task, successCriteria: w.success_criteria, phase, state }
  })
  return {
    missions,
    current: missions.find((m) => m.state === 'current') ?? null,
    cleared: missions.filter((m) => m.state === 'done').length,
    total,
  }
}
