import { z } from 'zod'
import { getCatalogEntry } from './profession-map'

/**
 * The Decline Gate — deterministic router.
 *
 * Run-time companion to CONSTRAINT_DESIGN_MANUAL.md. It takes a classification of THIS
 * user's diagnosed problem (the dominant constraint matched across the profession map + the
 * four manual tests) and routes to one of five decisions:
 *
 *  - accepted             : matched an ACTIVE V1 constraint (M1 today) — the only sellable result.
 *  - waitlist             : matched a KNOWN constraint that isn't active yet (early access).
 *  - declined             : a refused category, or a failed manual gate test.
 *  - needs_more_artifact  : the work sample is too thin to judge.
 *  - out_of_scope         : capability-shaped, but nothing on the Atlas map matched.
 *
 * Pure — no DB, no AI, no I/O.
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

export type DeclineDecision =
  | 'accepted'
  | 'waitlist'
  | 'declined'
  | 'needs_more_artifact'
  | 'out_of_scope'

// What the diagnosis read produces about the user's specific problem (the matcher output).
export const DeclineClassificationSchema = z.object({
  matched_code: z.string().nullable(), // a profession-map code (e.g. 'M1', 'D1') or null
  matched_name: z.string().nullable(),
  profession: z.string().nullable(),
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
  matched_code: string | null
  matched_name: string | null
  profession: string | null
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
 *  1. a refused category               -> declined
 *  2. an insufficient artifact         -> needs_more_artifact
 *  3. any failed manual gate test      -> declined
 *  4. matched an active V1 (M1)        -> accepted (the only result that may sell)
 *  5. matched a known map constraint   -> waitlist (early access)
 *  6. nothing on the map matched       -> out_of_scope
 */
export function classifyDecline(c: DeclineClassification): DeclineResult {
  const entry = getCatalogEntry(c.matched_code)
  // Prefer the catalog's authoritative name/profession; fall back to the matcher's.
  const ids = {
    matched_code: c.matched_code,
    matched_name: entry?.name ?? c.matched_name,
    profession: entry?.profession ?? c.profession,
  }

  // 1. A refused category is the strongest, most honest signal — decline regardless.
  if (c.refused_category !== 'none') {
    return {
      decision: 'declined',
      user_explanation: `This isn't something a 30-day sprint on your work can honestly move — it's more about ${REFUSED_PHRASE[c.refused_category]}. Here's the honest read, and what I'd actually suggest instead.`,
      internal_reason: `declined:${c.refused_category}`,
      may_sell_sprint: false,
      ...ids,
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
      ...ids,
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
      ...ids,
    }
  }

  // 4. Matched an active V1 constraint (M1 today) — the only sellable result.
  if (entry && entry.active_v1 && entry.code === 'M1') {
    return {
      decision: 'accepted',
      user_explanation: '',
      internal_reason: `accepted:${entry.code}`,
      may_sell_sprint: true,
      matched_code: entry.code,
      matched_name: entry.name,
      profession: entry.profession,
    }
  }

  // 5. Matched a known constraint that isn't active yet — early access / waitlist.
  if (entry) {
    return {
      decision: 'waitlist',
      user_explanation: `We found the capability most limiting your growth right now: ${entry.name}. The sprint for it isn't open yet — you're on the early-access list, and we'll tell you the moment it opens.`,
      internal_reason: `waitlist:${entry.code}`,
      may_sell_sprint: false,
      matched_code: entry.code,
      matched_name: entry.name,
      profession: entry.profession,
    }
  }

  // 6. Capability-shaped, but nothing on the Atlas map matched.
  return {
    decision: 'out_of_scope',
    user_explanation:
      "This looks like a real, workable capability — but it isn't one Atlas runs a sprint for yet. Here's where you stand.",
    internal_reason: 'out_of_scope:unmatched',
    may_sell_sprint: false,
    ...ids,
  }
}
