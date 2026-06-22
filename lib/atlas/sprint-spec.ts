import { z } from 'zod'
import { BarSchema, type Constraint } from './constraints/types'

/**
 * SprintSpec — the structured Sprint object + pure mappers (Phase 1, inert).
 *
 * Maps onto the EXISTING schema with NO migration: the spec is split across
 * cycles.profile_snapshot.atlas, the plans row (weekly_milestones / current_week / status),
 * and a week-0 submission (the baseline rep). Pure functions only — no DB calls, nothing
 * wired into app/.
 */

export type Bar = z.infer<typeof BarSchema>

// The universal arc postures (ATLAS_OS §5).
export const WEEKLY_POSTURES = {
  1: 'See — heavy scaffolding',
  2: 'Cross the valley — scaffolding coming off',
  3: 'Independence — no scaffolding',
  4: 'Prove — real stakes',
} as const

const WeeklyObjectiveSchema = z.object({
  week: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  objective: z.string().min(1),
  posture: z.string().min(1),
})

const BaselineRepSchema = z.object({
  submission_id: z.string().nullable(),
  captured: z.boolean(),
  summary: z.string().nullable(),
})

export const SprintSpecSchema = z.object({
  cycle_id: z.string().min(1),
  constraint_id: z.string().min(1),
  target_capability: z.string().min(1),
  bar: BarSchema,
  baseline_rep: BaselineRepSchema,
  rep_queue: z.array(z.string()),
  weekly_objectives: z.array(WeeklyObjectiveSchema).length(4),
  proof_requirements: z.array(z.string()).min(1),
  re_rating_requirements: z.array(z.string()).min(1),
  recognition_statement: z.object({ drafted: z.boolean(), text: z.string().nullable() }),
  current_week: z.number().int().min(1).max(4),
  status: z.enum(['active', 'complete', 'abandoned']),
})
export type SprintSpec = z.infer<typeof SprintSpecSchema>

// ---- builder ---------------------------------------------------------------

/** Assemble a SprintSpec from an admitted constraint at purchase time. Pure. */
export function buildSprintSpec(input: {
  constraint: Constraint
  cycleId: string
  repQueue?: string[]
  baseline?: { submission_id: string | null; captured: boolean; summary: string | null }
}): SprintSpec {
  const { constraint, cycleId } = input
  return {
    cycle_id: cycleId,
    constraint_id: constraint.id,
    target_capability: constraint.bar.definition,
    bar: constraint.bar,
    baseline_rep: input.baseline ?? { submission_id: null, captured: false, summary: null },
    rep_queue: input.repQueue ?? [],
    weekly_objectives: [
      { week: 1, objective: constraint.reps.week_1, posture: WEEKLY_POSTURES[1] },
      { week: 2, objective: constraint.reps.week_2, posture: WEEKLY_POSTURES[2] },
      { week: 3, objective: constraint.reps.week_3, posture: WEEKLY_POSTURES[3] },
      { week: 4, objective: constraint.reps.week_4, posture: WEEKLY_POSTURES[4] },
    ],
    proof_requirements: [constraint.proof],
    re_rating_requirements: [constraint.thirty_day_success_criteria],
    recognition_statement: { drafted: false, text: null },
    current_week: 1,
    status: 'active',
  }
}

// ---- mapping onto existing tables / jsonb (no migration, no DB) -------------

// Stored inside cycles.profile_snapshot.atlas (additive jsonb key).
export type CycleAtlasSnapshot = {
  constraint_id: string
  target_capability: string
  bar: Bar
  rep_queue: string[]
  proof_requirements: string[]
  re_rating_requirements: string[]
  recognition: { drafted: boolean; text: string | null }
}

// Items carried inside the existing plans.weekly_milestones jsonb array; additive keys that
// do not disturb the existing { week, title, task, success_criteria } reader.
export type PlanMilestone = { week: 1 | 2 | 3 | 4; objective: string; posture: string }

export type PlanRowShape = {
  cycle_id: string
  weekly_milestones: PlanMilestone[]
  current_week: number
  status: string
}

// The baseline rep stored as a week-0 submission (unique(cycle_id, week) already permits it).
export type BaselineSubmissionShape =
  | { cycle_id: string; week: 0; artifact_text: string | null; submission_id: string | null }
  | null

export type SprintStorageBundle = {
  cycle_atlas: CycleAtlasSnapshot
  plan: PlanRowShape
  baseline: BaselineSubmissionShape
}

/** SprintSpec -> the jsonb-shaped rows it would occupy in the existing schema. Pure. */
export function toStorage(spec: SprintSpec): SprintStorageBundle {
  return {
    cycle_atlas: {
      constraint_id: spec.constraint_id,
      target_capability: spec.target_capability,
      bar: spec.bar,
      rep_queue: spec.rep_queue,
      proof_requirements: spec.proof_requirements,
      re_rating_requirements: spec.re_rating_requirements,
      recognition: spec.recognition_statement,
    },
    plan: {
      cycle_id: spec.cycle_id,
      weekly_milestones: spec.weekly_objectives.map((w) => ({
        week: w.week,
        objective: w.objective,
        posture: w.posture,
      })),
      current_week: spec.current_week,
      status: spec.status,
    },
    baseline: spec.baseline_rep.captured
      ? {
          cycle_id: spec.cycle_id,
          week: 0,
          artifact_text: spec.baseline_rep.summary,
          submission_id: spec.baseline_rep.submission_id,
        }
      : null,
  }
}

/** The inverse of toStorage. fromStorage(toStorage(spec)) deep-equals a well-formed spec. */
export function fromStorage(bundle: SprintStorageBundle): SprintSpec {
  const a = bundle.cycle_atlas
  const p = bundle.plan
  return {
    cycle_id: p.cycle_id,
    constraint_id: a.constraint_id,
    target_capability: a.target_capability,
    bar: a.bar,
    baseline_rep: bundle.baseline
      ? {
          submission_id: bundle.baseline.submission_id,
          captured: true,
          summary: bundle.baseline.artifact_text,
        }
      : { submission_id: null, captured: false, summary: null },
    rep_queue: a.rep_queue,
    weekly_objectives: p.weekly_milestones.map((m) => ({
      week: m.week,
      objective: m.objective,
      posture: m.posture,
    })),
    proof_requirements: a.proof_requirements,
    re_rating_requirements: a.re_rating_requirements,
    recognition_statement: a.recognition,
    current_week: p.current_week,
    status: p.status as SprintSpec['status'],
  }
}
