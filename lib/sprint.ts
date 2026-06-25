import { createAdminClient } from '@/lib/supabase/admin'
import { runThirtyDayPlan } from '@/lib/ai/thirty-day-plan'
import type { AppUser } from '@/lib/app-user'
import { PHASES } from './ladder'
import type { Phase } from './ladder'

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

    // The user's own submitted work — Mission 1 (the day-one win) rewrites its weakest line.
    const { data: diag } = await admin
      .from('diagnoses').select('work_sample')
      .eq('cycle_id', cycle.id).order('created_at', { ascending: false }).limit(1).maybeSingle()

    const plan = await runThirtyDayPlan({
      moveTitle: move.title,
      moveThesis: move.thesis ?? '',
      moveTarget: move.target_outcome ?? '',
      gaps: assessment.gaps,
      capabilities: assessment.capability_scores,
      workSample: diag?.work_sample ?? '',
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

type Milestone = { week?: number; title?: string; task?: string; steps?: string[]; success_criteria?: string; phase?: string }
type PlanRow = { weekly_milestones?: Milestone[] } | null
type SubmissionRow = { week: number; status: string; graded_score?: number | null; feedback?: unknown }

export type Week = {
  week: number
  title?: string
  task?: string
  steps?: string[]
  success_criteria?: string
  phase?: string
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
    return { week, title: m.title, task: m.task, steps: m.steps, success_criteria: m.success_criteria, phase: m.phase, submission: sub, state }
  })
  const currentWeek = weeks.find((w) => w.state === 'todo')?.week ?? null
  return { weeks, currentWeek }
}

// ── Mission presentation layer (no logic change) ───────────────────────────────
// The Sprint is shown to the user as an ordered ladder of missions grouped into the
// four ATLAS phases. This is a pure projection of the same plan + submissions used by
// deriveWeeks — each milestone is one mission, the submission (week-indexed) drives its
// state. The data shape, the API, and progression logic are untouched.

// Re-exported so existing consumers keep importing PHASES / Phase / M1_LADDER from here.
export { PHASES, M1_LADDER } from './ladder'
export type { Phase } from './ladder'

export type Mission = {
  n: number // 1-based position
  total: number
  week: number // the submission key — identical to the milestone's week
  title?: string
  task?: string
  steps?: string[]
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
    // Prefer the milestone's own phase (canonical M1 ladder); fall back to a proportional
    // mapping for any legacy plan that predates the phase field.
    const phase = (PHASES as readonly string[]).includes(w.phase ?? '')
      ? (w.phase as Phase)
      : PHASES[Math.min(3, Math.floor((i * 4) / Math.max(1, total)))]
    let state: Mission['state']
    if (w.state === 'done') state = 'done'
    else if (w.state === 'pending') state = 'review'
    else state = w.week === currentWeek ? 'current' : 'locked'
    return { n: i + 1, total, week: w.week, title: w.title, task: w.task, steps: w.steps, successCriteria: w.success_criteria, phase, state }
  })
  return {
    missions,
    current: missions.find((m) => m.state === 'current') ?? null,
    cleared: missions.filter((m) => m.state === 'done').length,
    total,
  }
}

// ── The visible journey (ATLAS_OS §5) ──────────────────────────────────────────
// Pure projections of the same missions/submissions: the four-phase Sprint arc as a path
// the user can see, and the three doctrine progress axes as qualitative positions. No
// score, number, band, or self-report — position and direction only.

export const PHASE_META: Record<Phase, { week: number; description: string }> = {
  SEE: { week: 1, description: 'See the failure mode in your own work.' },
  CROSS: { week: 2, description: 'The week the bar clears for the first time.' },
  INDEPENDENCE: { week: 3, description: 'Clear it unaided, on harder work.' },
  PROVE: { week: 4, description: 'One high-stakes rep, then real external proof.' },
}

export type PhaseStep = {
  phase: Phase
  week: number
  description: string
  state: 'done' | 'current' | 'review' | 'upcoming'
}

// The four phases with each one's state, derived from where the missions stand.
export function derivePhaseJourney(missions: Mission[]): PhaseStep[] {
  return PHASES.map((phase) => {
    const inPhase = missions.filter((m) => m.phase === phase)
    let state: PhaseStep['state'] = 'upcoming'
    if (inPhase.length > 0) {
      if (inPhase.some((m) => m.state === 'current')) state = 'current'
      else if (inPhase.some((m) => m.state === 'review')) state = 'review'
      else if (inPhase.every((m) => m.state === 'done')) state = 'done'
      else if (inPhase.some((m) => m.state === 'done')) state = 'current'
    }
    return { phase, week: PHASE_META[phase].week, description: PHASE_META[phase].description, state }
  })
}

// A qualitative position on one progress axis: a 1-3 step and a word. Never a score.
export type AxisView = { key: string; label: string; note: string; step: 1 | 2 | 3 }

// The three doctrine axes. Independence and difficulty are structural — the Sprint arc
// withdraws scaffolding and raises stakes by phase, so the phase is the honest reading.
// Quality is the real signal: the latest rep's bar-check verdict (hit / partial / miss).
export function deriveProgressAxes(missions: Mission[], submissions: SubmissionRow[]): AxisView[] {
  const active = missions.find((m) => m.state === 'current') ?? missions.find((m) => m.state === 'review')
  const phase: Phase =
    active?.phase ?? (missions.length > 0 && missions.every((m) => m.state === 'done') ? 'PROVE' : 'SEE')
  const ladder: 1 | 2 | 3 = phase === 'SEE' ? 1 : phase === 'CROSS' ? 2 : 3

  const graded = submissions.filter((s) => (s.feedback as { quality?: string } | null)?.quality)
  const latestQuality = graded.length
    ? ((graded[graded.length - 1].feedback as { quality?: string }).quality as 'hit' | 'partial' | 'miss')
    : null
  const qStep: 1 | 2 | 3 = latestQuality === 'hit' ? 3 : latestQuality === 'partial' ? 2 : 1
  const qNote =
    latestQuality === 'hit'
      ? 'hitting the bar'
      : latestQuality === 'partial'
        ? 'partly there'
        : latestQuality === 'miss'
          ? 'not yet, keep repping'
          : 'first rep ahead'

  return [
    { key: 'quality', label: 'Quality', note: qNote, step: qStep },
    {
      key: 'independence',
      label: 'Independence',
      note: ladder === 1 ? 'heavy support' : ladder === 2 ? 'less support' : 'on your own',
      step: ladder,
    },
    {
      key: 'difficulty',
      label: 'Difficulty',
      note: ladder === 1 ? 'low stakes' : ladder === 2 ? 'real stakes' : 'high stakes',
      step: ladder,
    },
  ]
}
