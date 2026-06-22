import type { DeclineResult } from './decline-gate'

/**
 * Sprint eligibility — what the public results page shows, derived from the stored Decline
 * Gate result. Pure; no DB, no AI. The explanation is mechanism-free by construction (it
 * comes straight from the Decline Gate's user_explanation).
 *
 * Only an `accepted` (active V1 / M1) result shows the Sprint CTA. Every other decision maps
 * 1:1 to its own mode with NO CTA — `waitlist` (early access), `declined`, `out_of_scope`,
 * `needs_more_artifact`. When no classification is present, fall back to showing the CTA.
 */

export type SprintEligibilityMode =
  | 'accepted'
  | 'waitlist'
  | 'declined'
  | 'out_of_scope'
  | 'needs_more_artifact'
  | 'unknown'

export type SprintEligibility = {
  show_sprint_cta: boolean
  mode: SprintEligibilityMode
  explanation: string | null
}

// The slice of cycles.profile_snapshot.atlas this helper (and the results page) reads.
export type AtlasCycleData =
  | { decline_result?: DeclineResult; constraint_name?: string | null; profession?: string | null }
  | null
  | undefined

export function sprintEligibility(atlas: AtlasCycleData): SprintEligibility {
  const dr = atlas?.decline_result
  if (!dr) return { show_sprint_cta: true, mode: 'unknown', explanation: null }
  if (dr.decision === 'accepted' && dr.may_sell_sprint) {
    return { show_sprint_cta: true, mode: 'accepted', explanation: null }
  }
  // waitlist | declined | out_of_scope | needs_more_artifact — each is its own mode, no CTA.
  return { show_sprint_cta: false, mode: dr.decision, explanation: dr.user_explanation }
}
