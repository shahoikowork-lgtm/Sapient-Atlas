import { z } from 'zod'

/**
 * Atlas Constraint Engine — data-layer types (Phase 1, inert).
 *
 * Source of truth: ATLAS_OS.md (Constraint -> Bar -> Rep -> Proof) and
 * CONSTRAINT_DESIGN_MANUAL.md (the Seven Tests). This schema enforces the structural
 * half of the manual; the registry parses every constraint at import, so a malformed
 * entry fails fast. Nothing in app/ imports this yet — no schema, prompt, or UI changes.
 */

export const PERSONAS = [
  'marketer',
  'founder',
  'product_manager',
  'growth_operator',
  'ai_operator',
] as const
export type Persona = (typeof PERSONAS)[number]

// Design-time record of Manual Tests 1, 3, 4, 5. Every active constraint must be all-true.
export const DeclineGateFitSchema = z.object({
  capability_shaped: z.boolean(), // Test 1 — locus is the person's own practice
  legible_bar: z.boolean(), // Test 3 — a naive party can check the bar
  reppable_on_real_work: z.boolean(), // Test 4 — practiced on real work, small reps, in-loop feedback
  thirty_day_movable: z.boolean(), // Test 5 — meaningful shift possible in 30 days
})
export type DeclineGateFit = z.infer<typeof DeclineGateFitSchema>

export const BarSchema = z.object({
  definition: z.string().min(1),
  pass_conditions: z.array(z.string().min(1)).min(1),
  fail_conditions: z.array(z.string().min(1)).min(1),
})

// The universal arc: Week 1 See -> Week 2 Cross -> Week 3 Independence -> Week 4 Prove.
export const RepsSchema = z.object({
  week_1: z.string().min(1),
  week_2: z.string().min(1),
  week_3: z.string().min(1),
  week_4: z.string().min(1),
})

const ID_RE = /^[a-z_]+\.[a-z_]+$/ // e.g. marketer.generic_positioning
const CODE_RE = /^[A-Z][0-9]+$/ // e.g. M1

// User-facing prose must never carry scores, money, or percentages
// (ATLAS_OS "no numbers to the user" + the Bar rules).
const FORBIDDEN_PROSE = /\$|\/\s*100|0\s*-\s*100|%/

const ConstraintObject = z.object({
  id: z.string().regex(ID_RE),
  code: z.string().regex(CODE_RE),
  persona: z.enum(PERSONAS),
  name: z.string().min(1),
  short_description: z.string().min(1),
  why_it_matters: z.string().min(1),
  observable_failure_mode: z.string().min(1),
  decline_gate_fit: DeclineGateFitSchema,
  bar: BarSchema,
  baseline_capture: z.string().min(1),
  reps: RepsSchema,
  proof: z.string().min(1),
  recognition: z.string().min(1),
  thirty_day_success_criteria: z.string().min(1),
  examples_of_real_work: z.array(z.string().min(1)).min(3),
  should_decline_if: z.array(z.string().min(1)).min(1),
  not_v1_if: z.array(z.string().min(1)),
  active_v1: z.boolean(),
})

export type Constraint = z.infer<typeof ConstraintObject>

/** The fields the user reads (in some form). Linted for scores / money / percentages. */
export function userFacingProse(c: Constraint): string[] {
  return [
    c.name,
    c.short_description,
    c.why_it_matters,
    c.observable_failure_mode,
    c.bar.definition,
    ...c.bar.pass_conditions,
    ...c.bar.fail_conditions,
    c.baseline_capture,
    c.reps.week_1,
    c.reps.week_2,
    c.reps.week_3,
    c.reps.week_4,
    c.proof,
    c.recognition,
    c.thirty_day_success_criteria,
  ]
}

export const ConstraintSchema = ConstraintObject.refine(
  (c) => !c.active_v1 || Object.values(c.decline_gate_fit).every(Boolean),
  { message: 'An active constraint must pass all four decline-gate tests (Manual Tests 1, 3, 4, 5).' },
).refine((c) => userFacingProse(c).every((s) => !FORBIDDEN_PROSE.test(s)), {
  message: 'User-facing prose must contain no scores, money, or percentages (ATLAS_OS).',
})
