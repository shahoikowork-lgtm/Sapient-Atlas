import type { DeclineResult } from './decline-gate'

/**
 * Sprint eligibility — what the public results page shows, derived from the stored Decline
 * Gate result (Phase 2A). Pure; no DB, no AI. The explanation is mechanism-free by
 * construction (it comes straight from the Decline Gate's user_explanation).
 */

export type SprintEligibilityMode = 'accepted' | 'needs_more_artifact' | 'blocked' | 'unknown'

export type SprintEligibility = {
  show_sprint_cta: boolean
  mode: SprintEligibilityMode
  explanation: string | null
}

// The slice of cycles.profile_snapshot.atlas this helper reads.
export type AtlasCycleData = { decline_result?: DeclineResult } | null | undefined

/**
 * Only an `accepted` (sellable) result shows the Sprint CTA. `declined` and `out_of_scope`
 * are "blocked" — the read is shown, the CTA is not. `needs_more_artifact` asks for more
 * work. When no classification is present (an older cycle, or a best-effort miss at
 * diagnosis time), fall back to prior behavior and show the CTA.
 */
export function sprintEligibility(atlas: AtlasCycleData): SprintEligibility {
  const dr = atlas?.decline_result
  if (!dr) return { show_sprint_cta: true, mode: 'unknown', explanation: null }
  if (dr.decision === 'accepted' && dr.may_sell_sprint) {
    return { show_sprint_cta: true, mode: 'accepted', explanation: null }
  }
  if (dr.decision === 'needs_more_artifact') {
    return { show_sprint_cta: false, mode: 'needs_more_artifact', explanation: dr.user_explanation }
  }
  // declined | out_of_scope
  return { show_sprint_cta: false, mode: 'blocked', explanation: dr.user_explanation }
}
