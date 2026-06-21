import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createFakeStore, type FakeStore } from './helpers/fake-supabase'

// Hoisted fixtures so the vi.mock factories can reference them.
const h = vi.hoisted(() => ({
  store: null as any,
  va: {
    value_low: 80000,
    value_mid: 100000,
    value_high: 120000,
    currency: 'USD',
    confidence: 'medium',
    confidence_reason: 'Solid, real work sample.',
    ai_exposure: 0.4,
    trajectory: 'holding',
    capability_scores: { strategy: { score: 70, evidence: 'clear plan' } },
    gaps: [{ title: 'Distribution', detail: 'No owned channel' }],
    observation: 'Strong execution, thin scope.',
    inputs: ['the work sample'],
  },
  opp: {
    title: 'Ship a measurable revenue win',
    thesis: 'Own one outcome end to end.',
    target_outcome: 'A campaign with attributed pipeline.',
    leverage_score: 8,
    confidence: 'high',
    reasoning: 'Closes the biggest gap.',
    deferred_alternatives: [{ title: 'Rebrand', why_deferred: 'Lower leverage' }],
    prediction: {
      pred_capability_delta: { dimension: 'strategy', from: 70, to: 78 },
      pred_value_delta: 12000,
      confidence: 'medium',
      horizon_days: 30,
    },
  },
}))

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => h.store }))
vi.mock('@/lib/ai/value-assessment', () => ({ runValueAssessment: vi.fn(async () => h.va) }))
vi.mock('@/lib/ai/opportunity-ranking', () => ({ runOpportunityRanking: vi.fn(async () => h.opp) }))

import { POST } from '@/app/api/diagnosis/route'

const intake = {
  name: 'Dana Pro',
  email: 'dana@example.com',
  role: 'Performance marketer',
  work_sample:
    'Here is a real campaign brief I wrote last quarter, with budget, audience targeting, and a measurement plan.',
}

beforeEach(() => {
  h.store = createFakeStore({
    users: [],
    diagnoses: [],
    cycles: [],
    value_assessments: [],
    moves: [],
    predictions: [],
  })
})

describe('diagnosis API', () => {
  it('creates user, diagnosis, cycle, value_assessment, move and prediction', async () => {
    const req = new Request('https://atlas.test/api/diagnosis', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(intake),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = (await res.json()) as { token: string }
    expect(typeof json.token).toBe('string')
    expect(json.token.length).toBeGreaterThan(10)

    const s = h.store as FakeStore

    expect(s.rows('users')).toHaveLength(1)
    expect(s.rows('users')[0]).toMatchObject({
      email: 'dana@example.com',
      status: 'lead',
      role: 'Performance marketer',
    })

    expect(s.rows('diagnoses')).toHaveLength(1)
    expect(s.rows('diagnoses')[0].result_token).toBe(json.token)

    expect(s.rows('cycles')).toHaveLength(1)
    expect(s.rows('cycles')[0]).toMatchObject({ status: 'active' })

    expect(s.rows('value_assessments')).toHaveLength(1)
    expect(s.rows('value_assessments')[0]).toMatchObject({
      status: 'pending_review',
      value_mid: 100000,
    })

    expect(s.rows('moves')).toHaveLength(1)
    expect(s.rows('moves')[0]).toMatchObject({
      status: 'pending_review',
      title: 'Ship a measurable revenue win',
    })

    expect(s.rows('predictions')).toHaveLength(1)
    expect(s.rows('predictions')[0].move_id).toBe(s.rows('moves')[0].id)
    expect(s.rows('predictions')[0].pred_value_delta).toBe(12000)

    // Everything is linked to the same user + cycle, and saved pending_review.
    const userId = s.rows('users')[0].id
    const cycleId = s.rows('cycles')[0].id
    expect(s.rows('value_assessments')[0].user_id).toBe(userId)
    expect(s.rows('value_assessments')[0].cycle_id).toBe(cycleId)
    expect(s.rows('moves')[0].cycle_id).toBe(cycleId)
  })
})
