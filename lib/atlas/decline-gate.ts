import { z } from 'zod'
import { getConstraint } from './constraints'

/**
 * The Decline Gate — deterministic router (Phase 1, inert).
 *
 * Run-time companion to CONSTRAINT_DESIGN_MANUAL.md: it takes a classification of THIS
 * user's diagnosed problem (the four manual tests + scope) and routes to exactly one of
 * four decisions. Only `accepted` may sell a Sprint. Pure — no DB, no AI, no I/O. Nothing
 * in app/ imports this yet.
 */

export const REFUSED_CATEGORIES = [
  'psychological',
  'relational',
  'circumstantial',
  'long_horizon',
  'one_shot',
  'health',
  'none',
] as const
export type RefusedCategory = (typeof REFUSED_CATEGORIES)[number]

export type DeclineDecision = 'accepted' | 'declined' | 'needs_more_artifact' | 'out_of_scope'

// What the diagnosis read produces about the user's specific problem (the AI's output).
export const DeclineClassificationSchema = z.object({
  matched_constraint_id: z.string().nullable(),
  capability_shaped: z.boolean(), // Manual Test 1
  legible_bar: z.boolean(), // Manual Test 3
  reppable_on_real_work: z.boolean(), // Manual Test 4
  thirty_day_movable: z.boolean(), // Manual Test 5
  artifact_sufficient: z.boolean(),
  refused_category: z.enum(REFUSED_CATEGORIES),
  rationale: z.string(), // internal only
})
export type DeclineClassification = z.infer<typeof DeclineClassificationSchema>

export type DeclineResult = {
  decision: DeclineDecision
  user_explanation: string // user-facing, qualitative, mechanism-free
  internal_reason: string // logged for audit
  may_sell_sprint: boolean
  matched_constraint_id: string | null
}

const GATE_TESTS = [
  'capability_shaped',
  'legible_bar',
  'reppable_on_real_work',
  'thirty_day_movable',
] as const

const REFUSED_PHRASE: Record<RefusedCategory, string> = {
  psychological: 'how you feel about the work rather than a capability you can practice',
  relational: "someone else's behavior rather than your own work",
  circumstantial: 'your situation rather than a capability you can practice',
  long_horizon: 'a long-horizon judgment that takes longer than a month to show',
  one_shot: 'a single high-stakes event you cannot practice safely',
  health: 'something outside work that Atlas is not the right tool for',
  none: 'something a 30-day sprint on your real work cannot honestly move',
}

/**
 * Route a classification to a decision. Precedence is deliberate and deterministic:
 *  1. an explicit refused category   -> declined (the honest "not a capability" answer)
 *  2. an insufficient artifact        -> needs_more_artifact
 *  3. any failed manual gate test     -> declined
 *  4. no active-V1 constraint matched -> out_of_scope
 *  5. otherwise                       -> accepted (the only result that may sell)
 */
export function classifyDecline(c: DeclineClassification): DeclineResult {
  // 1. A refused category is the strongest, most honest signal — decline regardless.
  if (c.refused_category !== 'none') {
    return {
      decision: 'declined',
      user_explanation: `This isn't something a 30-day sprint on your work can honestly move — it's more about ${REFUSED_PHRASE[c.refused_category]}. Here's the honest read, and what I'd actually suggest instead.`,
      internal_reason: `declined:${c.refused_category}`,
      may_sell_sprint: false,
      matched_constraint_id: c.matched_constraint_id,
    }
  }

  // 2. No refusal, but the read isn't confident enough to judge — ask for more work.
  if (!c.artifact_sufficient) {
    return {
      decision: 'needs_more_artifact',
      user_explanation:
        "I need to see a bit more of your real work to give you something honest — share one fuller piece and I'll take another look.",
      internal_reason: 'needs_more_artifact',
      may_sell_sprint: false,
      matched_constraint_id: c.matched_constraint_id,
    }
  }

  // 3. Artifact was sufficient to judge, and a manual gate test failed — honest decline.
  const failed = GATE_TESTS.filter((t) => !c[t])
  if (failed.length > 0) {
    return {
      decision: 'declined',
      user_explanation:
        "This isn't something a 30-day sprint on your real work can honestly move yet. Here's the honest read of where you stand.",
      internal_reason: `declined:failed_gate(${failed.join(',')})`,
      may_sell_sprint: false,
      matched_constraint_id: c.matched_constraint_id,
    }
  }

  // 4. A valid capability constraint, but not one Atlas sells in V1 (unmatched or inactive).
  const matched = c.matched_constraint_id ? getConstraint(c.matched_constraint_id) : undefined
  if (!matched || !matched.active_v1) {
    return {
      decision: 'out_of_scope',
      user_explanation:
        "This is a real, workable capability — just not one Atlas runs sprints for yet. I can show you where you stand; the sprint for this is coming.",
      internal_reason: matched ? `out_of_scope:${matched.id}(inactive)` : 'out_of_scope:unmatched',
      may_sell_sprint: false,
      matched_constraint_id: matched ? matched.id : c.matched_constraint_id,
    }
  }

  // 5. Gate passed, artifact sufficient, matched to an active V1 constraint — sell the Sprint.
  return {
    decision: 'accepted',
    user_explanation: '',
    internal_reason: `accepted:${matched.id}`,
    may_sell_sprint: true,
    matched_constraint_id: matched.id,
  }
}
