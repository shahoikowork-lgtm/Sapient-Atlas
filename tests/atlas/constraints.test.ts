import { describe, it, expect } from 'vitest'
import { ConstraintSchema, userFacingProse, type Constraint } from '@/lib/atlas/constraints/types'
import {
  CONSTRAINTS,
  getConstraint,
  getConstraintByCode,
  activeConstraints,
} from '@/lib/atlas/constraints'

const EXPECTED_CODES = ['M1', 'M2', 'F1', 'P1', 'G1', 'A1']

// Beyond the schema's hard lint ($, /100, %), the manual forbids valuation language and
// snake_case keys in anything the user reads.
const FORBIDDEN_PROSE = /\$|\/\s*100|0\s*-\s*100|%|\bsalary\b|\bmarket value\b|\bcompensation\b/i
const SNAKE_CASE = /[a-z0-9]+_[a-z0-9]+/

describe('Atlas Constraint Library', () => {
  it('contains exactly the six seed constraints', () => {
    expect([...CONSTRAINTS.map((c) => c.code)].sort()).toEqual([...EXPECTED_CODES].sort())
  })

  it('every constraint validates against the schema', () => {
    for (const c of CONSTRAINTS) expect(() => ConstraintSchema.parse(c)).not.toThrow()
  })

  it('ids and codes are unique', () => {
    expect(new Set(CONSTRAINTS.map((c) => c.id)).size).toBe(CONSTRAINTS.length)
    expect(new Set(CONSTRAINTS.map((c) => c.code)).size).toBe(CONSTRAINTS.length)
  })

  it('registry lookups resolve by id and code', () => {
    expect(getConstraintByCode('M1')?.id).toBe('marketer.generic_positioning')
    expect(getConstraint('marketer.generic_positioning')?.code).toBe('M1')
    expect(getConstraint('does.not_exist')).toBeUndefined()
    expect(getConstraintByCode('Z9')).toBeUndefined()
  })

  it('only the marketer flagship is sellable in V1 (ATLAS_OS §9)', () => {
    expect(activeConstraints().map((c) => c.code)).toEqual(['M1'])
  })

  describe.each(CONSTRAINTS.map((c) => [c.code, c] as [string, Constraint]))(
    'Constraint %s satisfies the Constraint Design Manual',
    (_code, c) => {
      it('records all four decline-gate tests as passing (Tests 1, 3, 4, 5)', () => {
        expect(Object.values(c.decline_gate_fit).every(Boolean)).toBe(true)
      })

      it('has a legible bar with pass and fail conditions (Test 3)', () => {
        expect(c.bar.pass_conditions.length).toBeGreaterThanOrEqual(1)
        expect(c.bar.fail_conditions.length).toBeGreaterThanOrEqual(1)
      })

      it('lists at least three concrete real-work examples (Test 4)', () => {
        expect(c.examples_of_real_work.length).toBeGreaterThanOrEqual(3)
      })

      it('captures a baseline and four weekly reps following the arc (Tests 4, 6)', () => {
        expect(c.baseline_capture.trim().length).toBeGreaterThan(0)
        for (const week of [c.reps.week_1, c.reps.week_2, c.reps.week_3, c.reps.week_4]) {
          expect(week.trim().length).toBeGreaterThan(0)
        }
      })

      it('demands unaided application on fresh work in 30-day success (Test 6)', () => {
        expect(c.thirty_day_success_criteria).toMatch(/unaided|independent|fresh/i)
      })

      it('proof is validated by a real external receiver (Proof rules)', () => {
        expect(c.proof).toMatch(
          /prospect|colleague|engineer|founder|finance|peer|listener|stakeholder|customer|reader|lead/i,
        )
      })

      it('carries a recognition statement (Test 7: recognizable)', () => {
        expect(c.recognition.trim().length).toBeGreaterThan(0)
      })

      it('lists run-time decline signals (Manual §4 should_decline_if)', () => {
        expect(c.should_decline_if.length).toBeGreaterThanOrEqual(1)
      })

      it('keeps user-facing prose free of scores, money, and snake_case keys', () => {
        for (const s of userFacingProse(c)) {
          expect(FORBIDDEN_PROSE.test(s), `forbidden token in: "${s}"`).toBe(false)
          expect(SNAKE_CASE.test(s), `snake_case key in prose: "${s}"`).toBe(false)
        }
      })

      it('an active capability declares a semver version and provenance (CAPABILITY_SPEC Ch 11)', () => {
        if (!c.active_v1) return
        expect(c.version).toMatch(/^\d+\.\d+\.\d+$/)
        expect(c.provenance?.sources.length ?? 0).toBeGreaterThanOrEqual(1)
      })

      it('micro-skill prerequisites reference a different, real micro-skill in the same map', () => {
        if (!c.capability_map) return
        const ids = new Set(c.capability_map.micro_skills.map((m) => m.id))
        for (const m of c.capability_map.micro_skills) {
          for (const p of m.prereqs ?? []) {
            expect(p, `self-prereq on ${m.id}`).not.toBe(m.id)
            expect(ids.has(p), `unknown prereq "${p}" on ${m.id}`).toBe(true)
          }
        }
      })
    },
  )
})
