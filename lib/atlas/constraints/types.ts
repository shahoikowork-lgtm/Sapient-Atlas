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

// Deep method knowledge — the "what good looks like" the coaching AI is anchored to, so it
// applies real, sourced expertise to the user's real work instead of improvising
// (CONSTRAINT_DESIGN_MANUAL §5-6). Optional: only authored constraints carry it; without
// it the AI falls back to the bar alone.
export const WorkedExampleSchema = z.object({
  context: z.string().min(1),
  before: z.string().min(1),
  before_why: z.string().min(1),
  after: z.string().min(1),
  after_why: z.string().min(1),
})

export const MethodSchema = z.object({
  source: z.string().min(1), // the named authority this is distilled from
  framework: z.array(z.string().min(1)).min(1),
  worked_examples: z.array(WorkedExampleSchema).min(1),
  failure_patterns: z.array(z.string().min(1)).min(1),
  diagnostic_questions: z.array(z.string().min(1)).min(1),
  fix_patterns: z.array(z.string().min(1)).min(1),
})
export type Method = z.infer<typeof MethodSchema>

// Capability map — the explicit spine the RUNTIME feedback engine is constrained to.
// A constraint decomposes into one capability, one skill, and the ordered micro-skills that
// compose it. Each micro-skill carries its own naive-checkable bar, a worked example +
// counterexample (the lesson's contrast), and exactly ONE pre-approved correction pattern
// ("the one move"). Per the design-time-approval gate (ATLAS_OS §11), the runtime AI may
// only SELECT from these conditions and this fix — it never invents coaching, strategy, or
// the user's final work. This is the human-approved logic; authoring it IS the review.
// Optional: only authored constraints carry it.
export const PROOF_KINDS = ['self', 'colleague', 'external'] as const
export type ProofKind = (typeof PROOF_KINDS)[number]

export const MicroSkillBarSchema = z.object({
  clears_when: z.string().min(1), // one-line, user-facing "beat the bar"
  pass_conditions: z.array(z.string().min(1)).min(1),
  fail_conditions: z.array(z.string().min(1)).min(1),
})

export const MicroSkillSchema = z.object({
  id: z.string().regex(/^[a-z][a-z_]*$/), // stable slug, e.g. spot_generic
  name: z.string().min(1),
  mistake: z.string().min(1), // the common failure this micro-skill removes
  bar: MicroSkillBarSchema,
  example: z.string().min(1), // what good looks like (the contrast's "good")
  counterexample: z.string().min(1), // the mistake made concrete (the contrast's "bad")
  mission_type: z.string().min(1),
  proof_kind: z.enum(PROOF_KINDS),
  fix: z.string().min(1), // the ONE pre-approved correction the runtime may emit ("one move")
  prereqs: z.array(z.string()).optional(), // micro-skill ids in THIS map that must precede it (CAPABILITY_SPEC Ch 4)
})
export type MicroSkill = z.infer<typeof MicroSkillSchema>

export const CapabilityMapSchema = z.object({
  capability: z.string().min(1),
  skill: z.string().min(1),
  micro_skills: z.array(MicroSkillSchema).min(1),
})
export type CapabilityMap = z.infer<typeof CapabilityMapSchema>

// Versioning + provenance (CAPABILITY_SPEC Ch 11, INTELLIGENCE_LAYER §3). Every shippable
// capability declares the version of its content and the named authorities behind it, so the
// data flywheel can attribute outcomes to a version and the standard stays traceable.
export const ProvenanceSchema = z.object({
  sources: z.array(z.string().min(1)).min(1), // the named authorities this capability is distilled from
  authored_at: z.string().optional(), // ISO date the content was authored
  reviewed_at: z.string().optional(), // ISO date of the last human review
})
export type Provenance = z.infer<typeof ProvenanceSchema>

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
  method: MethodSchema.optional(),
  capability_map: CapabilityMapSchema.optional(),
  baseline_capture: z.string().min(1),
  reps: RepsSchema,
  proof: z.string().min(1),
  recognition: z.string().min(1),
  thirty_day_success_criteria: z.string().min(1),
  examples_of_real_work: z.array(z.string().min(1)).min(3),
  should_decline_if: z.array(z.string().min(1)).min(1),
  not_v1_if: z.array(z.string().min(1)),
  active_v1: z.boolean(),
  // Capability-graph edges (INTELLIGENCE_LAYER §2): capability codes removed before this one,
  // and the codes this one opens next. Optional; absent = none.
  prerequisites: z.array(z.string().regex(CODE_RE)).optional(),
  unlocks: z.array(z.string().regex(CODE_RE)).optional(),
  // Versioning + provenance (CAPABILITY_SPEC Ch 11); required for an active capability (refine below).
  version: z.string().regex(/^\d+\.\d+\.\d+$/).optional(),
  provenance: ProvenanceSchema.optional(),
})

export type Constraint = z.infer<typeof ConstraintObject>

/** The fields the user reads (in some form). Linted for scores / money / percentages. */
export function userFacingProse(c: Constraint): string[] {
  const prose = [
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
  // The capability map is shown to the user (the per-mission lesson + bar + correction), so
  // its prose is linted too: no scores, money, or percentages reach the user from it.
  if (c.capability_map) {
    prose.push(c.capability_map.capability, c.capability_map.skill)
    for (const ms of c.capability_map.micro_skills) {
      prose.push(
        ms.name,
        ms.mistake,
        ms.bar.clears_when,
        ...ms.bar.pass_conditions,
        ...ms.bar.fail_conditions,
        ms.example,
        ms.counterexample,
        ms.fix,
      )
    }
  }
  return prose
}

/** Look up one micro-skill in a constraint's capability map by its slug id. */
export function getMicroSkill(c: Constraint, id: string): MicroSkill | undefined {
  return c.capability_map?.micro_skills.find((m) => m.id === id)
}

/**
 * Format a constraint's deep method into a prompt block the coaching AI is anchored to:
 * the framework, the failure patterns to catch, how to fix, the diagnostic questions, and
 * worked weak->strong examples. Returns '' for a constraint with no authored method, so the
 * AI falls back to the bar alone. This is what turns generic advice into sourced method
 * applied to the user's own work.
 */
export function methodPromptBlock(c: Constraint): string {
  const m = c.method
  if (!m) return ''
  const lines: string[] = [`METHOD — apply this, do not improvise (source: ${m.source}).`, '', 'What good looks like (the chain):']
  m.framework.forEach((f) => lines.push(`- ${f}`))
  lines.push('', 'Failure patterns to catch:')
  m.failure_patterns.forEach((f) => lines.push(`- ${f}`))
  lines.push('', 'How to fix (prescribe the next move from these):')
  m.fix_patterns.forEach((f) => lines.push(`- ${f}`))
  lines.push('', 'Diagnostic questions to apply:')
  m.diagnostic_questions.forEach((q) => lines.push(`- ${q}`))
  lines.push('', 'Worked examples (weak -> strong):')
  m.worked_examples.forEach((e) =>
    lines.push(`- ${e.context}: WEAK "${e.before}" (${e.before_why}) STRONG "${e.after}" (${e.after_why})`),
  )
  return lines.join('\n')
}

export const ConstraintSchema = ConstraintObject.refine(
  (c) => !c.active_v1 || Object.values(c.decline_gate_fit).every(Boolean),
  { message: 'An active constraint must pass all four decline-gate tests (Manual Tests 1, 3, 4, 5).' },
).refine((c) => userFacingProse(c).every((s) => !FORBIDDEN_PROSE.test(s)), {
  message: 'User-facing prose must contain no scores, money, or percentages (ATLAS_OS).',
})
  .refine((c) => !c.active_v1 || (!!c.version && !!c.provenance), {
    message: 'An active capability must declare a version and provenance (CAPABILITY_SPEC Ch 11).',
  })
  .refine(
    (c) => {
      // Micro-skill prerequisites must reference a different, real micro-skill in the same map.
      if (!c.capability_map) return true
      const ids = new Set(c.capability_map.micro_skills.map((m) => m.id))
      return c.capability_map.micro_skills.every((m) =>
        (m.prereqs ?? []).every((p) => p !== m.id && ids.has(p)),
      )
    },
    { message: 'Every micro-skill prerequisite must reference a different micro-skill in the same capability map.' },
  )
