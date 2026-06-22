import { describe, it, expect } from 'vitest'
import {
  buildSprintSpec,
  toStorage,
  fromStorage,
  SprintSpecSchema,
  WEEKLY_POSTURES,
  type SprintSpec,
} from '@/lib/atlas/sprint-spec'
import { getConstraintByCode } from '@/lib/atlas/constraints'

const m1 = getConstraintByCode('M1')!

describe('SprintSpec', () => {
  it('builds a valid spec from an admitted constraint', () => {
    const spec = buildSprintSpec({ constraint: m1, cycleId: 'cyc_one', repQueue: ['Homepage hero'] })
    expect(() => SprintSpecSchema.parse(spec)).not.toThrow()
    expect(spec.constraint_id).toBe('marketer.generic_positioning')
    expect(spec.status).toBe('active')
    expect(spec.current_week).toBe(1)
    expect(spec.baseline_rep).toEqual({ submission_id: null, captured: false, summary: null })
  })

  it('lays out the four-week universal arc with the right postures', () => {
    const spec = buildSprintSpec({ constraint: m1, cycleId: 'cyc_one' })
    expect(spec.weekly_objectives.map((w) => w.week)).toEqual([1, 2, 3, 4])
    expect(spec.weekly_objectives.map((w) => w.posture)).toEqual([
      WEEKLY_POSTURES[1],
      WEEKLY_POSTURES[2],
      WEEKLY_POSTURES[3],
      WEEKLY_POSTURES[4],
    ])
    expect(spec.weekly_objectives[1].objective).toBe(m1.reps.week_2)
  })

  it('maps onto the existing jsonb shapes', () => {
    const spec = buildSprintSpec({ constraint: m1, cycleId: 'cyc_one' })
    const bundle = toStorage(spec)
    expect(bundle.cycle_atlas.constraint_id).toBe('marketer.generic_positioning')
    expect(bundle.plan.cycle_id).toBe('cyc_one')
    expect(bundle.plan.weekly_milestones).toHaveLength(4)
    expect(bundle.baseline).toBeNull() // not captured yet
  })

  it('round-trips through the storage mapping (no baseline)', () => {
    const spec = buildSprintSpec({ constraint: m1, cycleId: 'cyc_one', repQueue: ['Hero', 'Cold email'] })
    expect(fromStorage(toStorage(spec))).toEqual(spec)
  })

  it('round-trips through the storage mapping (with a captured baseline)', () => {
    const built = buildSprintSpec({ constraint: m1, cycleId: 'cyc_two' })
    const spec: SprintSpec = {
      ...built,
      baseline_rep: { submission_id: 'sub_zero', captured: true, summary: 'My first rewritten claim.' },
      current_week: 3,
      status: 'active',
    }
    const round = fromStorage(toStorage(spec))
    expect(round).toEqual(spec)
    expect(toStorage(spec).baseline).not.toBeNull()
  })
})
