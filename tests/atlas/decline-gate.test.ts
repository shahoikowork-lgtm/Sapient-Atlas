import { describe, it, expect } from 'vitest'
import {
  classifyDecline,
  DeclineClassificationSchema,
  type DeclineClassification,
  type DeclineResult,
} from '@/lib/atlas/decline-gate'

// A clean classification that matches the active V1 flagship (M1).
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
  rationale: 'matches M1',
}

describe('Decline Gate', () => {
  it('accepts a clean match to the active flagship (M1) and may sell', () => {
    const r = classifyDecline(base)
    expect(r.decision).toBe('accepted')
    expect(r.may_sell_sprint).toBe(true)
    expect(r.matched_code).toBe('M1')
    expect(r.internal_reason).toBe('accepted:M1')
    expect(r.user_explanation).toBe('')
  })

  it('waitlists a known-but-inactive marketing constraint (M2)', () => {
    const r = classifyDecline({ ...base, matched_code: 'M2', matched_name: 'Activity reporting' })
    expect(r.decision).toBe('waitlist')
    expect(r.may_sell_sprint).toBe(false)
    expect(r.internal_reason).toBe('waitlist:M2')
    expect(r.matched_name).toBe('Activity reporting')
    expect(r.user_explanation).toBeTruthy()
  })

  it('waitlists non-marketing constraints across the profession map', () => {
    for (const code of ['D1', 'P1', 'SA1', 'E1', 'DA1', 'A1', 'F1', 'G1']) {
      const r = classifyDecline({ ...base, matched_code: code })
      expect(r.decision).toBe('waitlist')
      expect(r.may_sell_sprint).toBe(false)
    }
  })

  it('declines a refused category', () => {
    const r = classifyDecline({ ...base, refused_category: 'psychological' })
    expect(r.decision).toBe('declined')
    expect(r.internal_reason).toBe('declined:psychological')
  })

  it('declines when a manual gate test fails', () => {
    const r = classifyDecline({ ...base, legible_bar: false })
    expect(r.decision).toBe('declined')
    expect(r.internal_reason).toContain('failed_gate')
    expect(r.internal_reason).toContain('legible_bar')
  })

  it('asks for more artifact when the read is not confident', () => {
    const r = classifyDecline({ ...base, artifact_sufficient: false })
    expect(r.decision).toBe('needs_more_artifact')
  })

  it('returns out_of_scope when nothing on the map matched (null)', () => {
    const r = classifyDecline({ ...base, matched_code: null })
    expect(r.decision).toBe('out_of_scope')
    expect(r.internal_reason).toBe('out_of_scope:unmatched')
  })

  it('returns out_of_scope for an unknown (off-map) code', () => {
    const r = classifyDecline({ ...base, matched_code: 'ZZ9' })
    expect(r.decision).toBe('out_of_scope')
  })

  it('treats a refused category as higher precedence than a thin artifact', () => {
    const r = classifyDecline({ ...base, refused_category: 'relational', artifact_sufficient: false })
    expect(r.decision).toBe('declined')
    expect(r.internal_reason).toBe('declined:relational')
  })

  it('only the accepted decision may sell a Sprint', () => {
    const results: DeclineResult[] = [
      classifyDecline(base), // accepted
      classifyDecline({ ...base, matched_code: 'M2' }), // waitlist
      classifyDecline({ ...base, matched_code: 'D1' }), // waitlist
      classifyDecline({ ...base, refused_category: 'health' }), // declined
      classifyDecline({ ...base, thirty_day_movable: false }), // declined
      classifyDecline({ ...base, artifact_sufficient: false }), // needs_more_artifact
      classifyDecline({ ...base, matched_code: null }), // out_of_scope
    ]
    for (const r of results) {
      expect(r.may_sell_sprint).toBe(r.decision === 'accepted')
    }
  })

  it('only M1 is ever accepted; every other catalog code waitlists', () => {
    for (const code of ['M2', 'M3', 'M4', 'M5', 'P1', 'D1', 'E1', 'DA1', 'G1', 'SA1', 'A1', 'F1']) {
      const r = classifyDecline({ ...base, matched_code: code })
      expect(r.decision).toBe('waitlist')
    }
  })

  it('validates the classification schema and rejects a bad refused_category', () => {
    expect(() => DeclineClassificationSchema.parse(base)).not.toThrow()
    expect(() => DeclineClassificationSchema.parse({ ...base, refused_category: 'lazy' })).toThrow()
  })
})
