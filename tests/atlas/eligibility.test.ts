import { describe, it, expect } from 'vitest'
import { sprintEligibility } from '@/lib/atlas/eligibility'
import { classifyDecline, type DeclineClassification } from '@/lib/atlas/decline-gate'

// A clean classification matching the active V1 flagship (M1).
const base: DeclineClassification = {
  matched_constraint_id: 'marketer.generic_positioning',
  capability_shaped: true,
  legible_bar: true,
  reppable_on_real_work: true,
  thirty_day_movable: true,
  artifact_sufficient: true,
  refused_category: 'none',
  rationale: '',
}

// Build the atlas blob exactly as the diagnosis route stores it: { decline_result }.
const atlasFor = (c: DeclineClassification) => ({ decline_result: classifyDecline(c) })

describe('Sprint eligibility', () => {
  it('shows the Sprint CTA for an accepted M1 match', () => {
    const e = sprintEligibility(atlasFor(base))
    expect(e.show_sprint_cta).toBe(true)
    expect(e.mode).toBe('accepted')
  })

  it('blocks the Sprint for a matched-but-inactive (out_of_scope) constraint', () => {
    const e = sprintEligibility(atlasFor({ ...base, matched_constraint_id: 'founder.winning_narrative' }))
    expect(e.show_sprint_cta).toBe(false)
    expect(e.mode).toBe('blocked')
    expect(e.explanation).toBeTruthy()
  })

  it('blocks the Sprint for a declined constraint', () => {
    const e = sprintEligibility(atlasFor({ ...base, refused_category: 'psychological' }))
    expect(e.show_sprint_cta).toBe(false)
    expect(e.mode).toBe('blocked')
  })

  it('blocks the Sprint and asks for more work when the artifact is thin', () => {
    const e = sprintEligibility(atlasFor({ ...base, artifact_sufficient: false }))
    expect(e.show_sprint_cta).toBe(false)
    expect(e.mode).toBe('needs_more_artifact')
    expect(e.explanation).toBeTruthy()
  })

  it('falls back to showing the CTA when no classification is present', () => {
    expect(sprintEligibility(null).show_sprint_cta).toBe(true)
    expect(sprintEligibility(undefined).mode).toBe('unknown')
    expect(sprintEligibility({}).show_sprint_cta).toBe(true)
  })

  it('never shows the CTA for any non-accepted decision', () => {
    const variants: DeclineClassification[] = [
      { ...base, refused_category: 'circumstantial' },
      { ...base, matched_constraint_id: null },
      { ...base, legible_bar: false },
      { ...base, artifact_sufficient: false },
      { ...base, matched_constraint_id: 'ai_operator.spec_clarity' },
    ]
    for (const c of variants) {
      const e = sprintEligibility(atlasFor(c))
      expect(e.show_sprint_cta).toBe(e.mode === 'accepted')
    }
  })
})
