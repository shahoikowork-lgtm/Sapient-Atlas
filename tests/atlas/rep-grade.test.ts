import { describe, it, expect } from 'vitest'
import {
  RepGradeSchema,
  toUserFacingRepGrade,
  userFacingRepGradeStrings,
  type RepGrade,
} from '@/lib/atlas/rep-grade'

// A representative, review-gate-clean grade for an M1 rep.
const sample: RepGrade = {
  rep_id: 'cyc-week-two',
  submission_id: 'sub-week-two',
  constraint_id: 'marketer.generic_positioning',
  bar_check: [
    {
      condition: 'A naive reader restates the differentiator in one sentence after a single read',
      status: 'pass',
      where: 'the opening line of the hero section',
    },
    {
      condition: 'The claim is false of three named competitors',
      status: 'fail',
      where: 'the subhead, which any competitor could also claim',
    },
  ],
  quality: 'partial',
  independence: 'light_scaffolding',
  difficulty: 'real_stakes',
  failure_mode_present: true,
  evidence_from_work: 'The subhead "results-driven growth partner" is true of every agency in the set.',
  reviewer_note:
    'Your hero line now names a real edge; the subhead still falls back on a category claim any competitor could make.',
  next_rep_focus: 'Rewrite the subhead so it excludes the three named competitors by a testable contrast.',
}

// User-facing surfaces must carry no numbers, scores, bands, or money.
const FORBIDDEN = /[0-9]|\$|%|\bsalary\b|\bmarket value\b|\bcompensation\b|\bband\b|\bscore\b/i

describe('RepGrade', () => {
  it('validates a well-formed grade', () => {
    expect(() => RepGradeSchema.parse(sample)).not.toThrow()
  })

  it('rejects a malformed grade', () => {
    expect(() => RepGradeSchema.parse({ ...sample, quality: 'great' })).toThrow()
    expect(() => RepGradeSchema.parse({ ...sample, bar_check: [] })).toThrow()
    expect(() => RepGradeSchema.parse({ ...sample, constraint_id: 'not-a-slug' })).toThrow()
  })

  it('projects quality to qualitative words', () => {
    expect(toUserFacingRepGrade({ ...sample, quality: 'hit' }).quality_label).toBe('Cleared the bar')
    expect(toUserFacingRepGrade({ ...sample, quality: 'partial' }).quality_label).toBe('Partly there')
    expect(toUserFacingRepGrade({ ...sample, quality: 'miss' }).quality_label).toBe('Not yet')
  })

  it('projects bar conditions to cleared / not-cleared', () => {
    const v = toUserFacingRepGrade(sample)
    expect(v.bar_check.map((b) => b.cleared)).toEqual([true, false])
  })

  it('omits internal axes from the user-facing projection', () => {
    const v = toUserFacingRepGrade(sample)
    expect(Object.keys(v).sort()).toEqual(['bar_check', 'next_rep_focus', 'quality_label', 'reviewer_note'])
    expect((v as Record<string, unknown>).independence).toBeUndefined()
    expect((v as Record<string, unknown>).difficulty).toBeUndefined()
    expect((v as Record<string, unknown>).failure_mode_present).toBeUndefined()
    expect((v as Record<string, unknown>).evidence_from_work).toBeUndefined()
  })

  it('keeps the user-facing projection free of numbers, scores, bands, and money', () => {
    for (const quality of ['hit', 'partial', 'miss'] as const) {
      const v = toUserFacingRepGrade({ ...sample, quality })
      for (const s of userFacingRepGradeStrings(v)) {
        expect(FORBIDDEN.test(s), `forbidden token in: "${s}"`).toBe(false)
      }
    }
  })
})
