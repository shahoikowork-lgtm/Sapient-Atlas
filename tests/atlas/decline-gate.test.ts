import { describe, it, expect } from 'vitest'
import {
  classifyDecline,
  DeclineClassificationSchema,
  type DeclineClassification,
  type DeclineResult,
} from '@/lib/atlas/decline-gate'
import { activeConstraints } from '@/lib/atlas/constraints'

// A clean classification that matches the active V1 flagship (M1).
const base: DeclineClassification = {
  matched_constraint_id: 'marketer.generic_positioning',
  capability_shaped: true,
  legible_bar: true,
  reppable_on_real_work: true,
  thirty_day_movable: true,
  artifact_sufficient: true,
  refused_category: 'none',
  rationale: 'matches M1',
}

describe('Decline Gate', () => {
  it('accepts a clean match to the active flagship and may sell a Sprint', () => {
    const r = classifyDecline(base)
    expect(r.decision).toBe('accepted')
    expect(r.may_sell_sprint).toBe(true)
    expect(r.matched_constraint_id).toBe('marketer.generic_positioning')
    expect(r.internal_reason).toBe('accepted:marketer.generic_positioning')
    expect(r.user_explanation).toBe('')
  })

  it('declines a refused category (Decline Gate refusals)', () => {
    const r = classifyDecline({ ...base, refused_category: 'psychological' })
    expect(r.decision).toBe('declined')
    expect(r.may_sell_sprint).toBe(false)
    expect(r.internal_reason).toBe('declined:psychological')
  })

  it('declines when a manual gate test fails', () => {
    const r = classifyDecline({ ...base, legible_bar: false })
    expect(r.decision).toBe('declined')
    expect(r.may_sell_sprint).toBe(false)
    expect(r.internal_reason).toContain('failed_gate')
    expect(r.internal_reason).toContain('legible_bar')
  })

  it('asks for more artifact when the read is not confident', () => {
    const r = classifyDecline({ ...base, artifact_sufficient: false })
    expect(r.decision).toBe('needs_more_artifact')
    expect(r.may_sell_sprint).toBe(false)
  })

  it('returns out_of_scope for a matched but inactive constraint', () => {
    const r = classifyDecline({ ...base, matched_constraint_id: 'founder.winning_narrative' })
    expect(r.decision).toBe('out_of_scope')
    expect(r.may_sell_sprint).toBe(false)
    expect(r.internal_reason).toBe('out_of_scope:founder.winning_narrative(inactive)')
  })

  it('returns out_of_scope when nothing in the library matches', () => {
    const r = classifyDecline({ ...base, matched_constraint_id: null })
    expect(r.decision).toBe('out_of_scope')
    expect(r.internal_reason).toBe('out_of_scope:unmatched')
  })

  it('treats a refused category as higher precedence than a thin artifact', () => {
    const r = classifyDecline({ ...base, refused_category: 'relational', artifact_sufficient: false })
    expect(r.decision).toBe('declined')
    expect(r.internal_reason).toBe('declined:relational')
  })

  it('only the accepted decision may sell a Sprint', () => {
    const results: DeclineResult[] = [
      classifyDecline(base), // accepted
      classifyDecline({ ...base, refused_category: 'health' }), // declined
      classifyDecline({ ...base, thirty_day_movable: false }), // declined
      classifyDecline({ ...base, artifact_sufficient: false }), // needs_more_artifact
      classifyDecline({ ...base, matched_constraint_id: null }), // out_of_scope
    ]
    for (const r of results) {
      expect(r.may_sell_sprint).toBe(r.decision === 'accepted')
    }
  })

  it('resolves only the marketer flagship (M1) as sellable, so only M1 is accepted', () => {
    expect(activeConstraints().map((c) => c.code)).toEqual(['M1'])
    // Every other (admitted but inactive) constraint is out_of_scope, never accepted.
    for (const id of [
      'marketer.activity_reporting',
      'founder.winning_narrative',
      'product_manager.problem_framing',
      'growth_operator.experiment_thinking',
      'ai_operator.spec_clarity',
    ]) {
      const r = classifyDecline({ ...base, matched_constraint_id: id })
      expect(r.decision).toBe('out_of_scope')
      expect(r.may_sell_sprint).toBe(false)
    }
  })

  it('validates the classification schema and rejects a bad refused_category', () => {
    expect(() => DeclineClassificationSchema.parse(base)).not.toThrow()
    expect(() => DeclineClassificationSchema.parse({ ...base, refused_category: 'lazy' })).toThrow()
  })
})
