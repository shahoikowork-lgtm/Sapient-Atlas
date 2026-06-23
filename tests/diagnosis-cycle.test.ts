import { describe, it, expect } from 'vitest'
import { resolveCycle } from '@/lib/diagnoses'

type Cycle = { id: string; profile_snapshot: unknown; created_at: string }

const older: Cycle = { id: 'cycle_old', profile_snapshot: {}, created_at: '2026-06-01T00:00:00.000Z' }
const newer: Cycle = { id: 'cycle_new', profile_snapshot: {}, created_at: '2026-06-20T00:00:00.000Z' }
const byId = new Map<string, Cycle>([
  [older.id, older],
  [newer.id, newer],
])
const all = [newer, older]

describe('resolveCycle', () => {
  it('uses the exact cycle_id link when present — even over a closer-in-time cycle', () => {
    // created_at matches `newer`, but the explicit link points at `older`, so the link wins.
    const c = resolveCycle({ cycle_id: 'cycle_old', created_at: newer.created_at }, byId, all)
    expect(c?.id).toBe('cycle_old')
  })

  it('falls back to created_at pairing when cycle_id is null (pre-migration rows)', () => {
    const c = resolveCycle({ cycle_id: null, created_at: '2026-06-02T00:00:00.000Z' }, byId, all)
    expect(c?.id).toBe('cycle_old') // closest to Jun 1
  })

  it('falls back to created_at pairing when cycle_id is stale / not found', () => {
    const c = resolveCycle({ cycle_id: 'cycle_missing', created_at: newer.created_at }, byId, all)
    expect(c?.id).toBe('cycle_new') // closest to Jun 20
  })

  it('returns null when the user has no cycles', () => {
    expect(resolveCycle({ cycle_id: 'whatever', created_at: newer.created_at }, new Map(), [])).toBeNull()
  })
})
