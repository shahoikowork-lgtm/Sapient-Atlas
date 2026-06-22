import { describe, it, expect } from 'vitest'
import { sprintEligibility } from '@/lib/atlas/eligibility'
import { classifyDecline, type DeclineClassification } from '@/lib/atlas/decline-gate'

// A clean classification matching the active V1 flagship (M1).
const base: DeclineClassification = {
  matched_code: 'M1',
  matched_name: 'Generic positioning',
  profession: 'marketing',
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
  it('shows the Sprint CTA only for an accepted M1 match', () => {
    const e = sprintEligibility(atlasFor(base))
    expect(e.show_sprint_cta).toBe(true)
    expect(e.mode).toBe('accepted')
  })

  it('waitlists a known-but-inactive constraint, no CTA', () => {
    const e = sprintEligibility(atlasFor({ ...base, matched_code: 'M2' }))
    expect(e.show_sprint_cta).toBe(false)
    expect(e.mode).toBe('waitlist')
    expect(e.explanation).toBeTruthy()
  })

  it('waitlists a non-marketing constraint, no CTA', () => {
    const e = sprintEligibility(atlasFor({ ...base, matched_code: 'D1' }))
    expect(e.show_sprint_cta).toBe(false)
    expect(e.mode).toBe('waitlist')
  })

  it('marks a declined constraint, no CTA', () => {
    const e = sprintEligibility(atlasFor({ ...base, refused_category: 'psychological' }))
    expect(e.show_sprint_cta).toBe(false)
    expect(e.mode).toBe('declined')
  })

  it('marks out_of_scope (off-map) with no CTA', () => {
    const e = sprintEligibility(atlasFor({ ...base, matched_code: null }))
    expect(e.show_sprint_cta).toBe(false)
    expect(e.mode).toBe('out_of_scope')
  })

  it('asks for more work when the artifact is thin, no CTA', () => {
    const e = sprintEligibility(atlasFor({ ...base, artifact_sufficient: false }))
    expect(e.show_sprint_cta).toBe(false)
    expect(e.mode).toBe('needs_more_artifact')
  })

  it('falls back to the CTA when no classification is present', () => {
    expect(sprintEligibility(null).show_sprint_cta).toBe(true)
    expect(sprintEligibility(undefined).mode).toBe('unknown')
    expect(sprintEligibility({}).show_sprint_cta).toBe(true)
  })

  it('never shows the CTA for any non-accepted decision', () => {
    const variants: DeclineClassification[] = [
      { ...base, matched_code: 'M2' }, // waitlist
      { ...base, matched_code: 'D1' }, // waitlist
      { ...base, matched_code: null }, // out_of_scope
      { ...base, refused_category: 'circumstantial' }, // declined
      { ...base, legible_bar: false }, // declined
      { ...base, artifact_sufficient: false }, // needs_more_artifact
    ]
    for (const c of variants) {
      const e = sprintEligibility(atlasFor(c))
      expect(e.show_sprint_cta).toBe(e.mode === 'accepted')
    }
  })
})
