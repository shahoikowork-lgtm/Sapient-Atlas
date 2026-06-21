import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createFakeStore, type FakeStore } from './helpers/fake-supabase'

const h = vi.hoisted(() => ({
  store: null as any,
  rr: {
    value_low: 95000,
    value_mid: 118000,
    value_high: 140000,
    currency: 'USD',
    confidence: 'medium',
    confidence_reason: 'Real improvement in the work.',
    trajectory: 'rising',
    ai_exposure: 0.35,
    capability_scores: { strategy: { score: 80, evidence: 'shipped the campaign' } },
    observation: 'Scope grew.',
    proof_summary: 'Shipped the campaign with attributed pipeline.',
    prediction_eval: {
      verdict: 'hit',
      actual_capability_delta: { dimension: 'strategy', from: 70, to: 80 },
      actual_value_delta: 18000,
      learning: 'Kept pace with the prediction.',
    },
    next_move: {
      title: 'Scale the winning channel',
      thesis: 'Double down.',
      target_outcome: 'Repeatable pipeline.',
      reasoning: 'Highest leverage now.',
      confidence: 'medium',
    },
  },
}))

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => h.store }))
vi.mock('@/lib/ai/monthly-rerating', () => ({ runMonthlyRerating: vi.fn(async () => h.rr) }))
vi.mock('@/lib/auth', () => ({
  getUser: vi.fn(async () => ({ email: 'admin@test.com' })),
  isAdmin: vi.fn(() => true),
}))
vi.mock('@/lib/email', () => ({ sendDiagnosisReadyEmail: vi.fn(async () => ({ ok: true })) }))

import { ensureRerating } from '@/lib/rerating'
import { POST as approve } from '@/app/api/admin/approve/route'
import { sendDiagnosisReadyEmail } from '@/lib/email'

const user = { id: 'u1', email: 'pro@example.com', name: 'Pro', status: 'sprint' }

beforeEach(() => {
  ;(sendDiagnosisReadyEmail as any).mockClear()
  h.store = createFakeStore({
    users: [{ id: 'u1', email: 'pro@example.com', name: 'Pro', status: 'sprint' }],
    cycles: [{ id: 'c1', user_id: 'u1', status: 'active' }],
    value_assessments: [
      {
        id: 'va1',
        user_id: 'u1',
        cycle_id: 'c1',
        status: 'approved',
        value_low: 80000,
        value_mid: 100000,
        value_high: 120000,
        capability_scores: { strategy: { score: 70, evidence: 'x' } },
        gaps: [],
        confidence: 'medium',
      },
    ],
    moves: [{ id: 'm1', user_id: 'u1', cycle_id: 'c1', status: 'approved', title: 'The move', target_outcome: 'to' }],
    predictions: [
      {
        id: 'p1',
        cycle_id: 'c1',
        move_id: 'm1',
        pred_capability_delta: { dimension: 'strategy', from: 70, to: 78 },
        pred_value_delta: 12000,
      },
    ],
    submissions: [
      { id: 'sub1', user_id: 'u1', cycle_id: 'c1', week: 1, status: 'reviewed', graded_score: 82, feedback: {}, artifact_text: 'did the work' },
    ],
  })
})

describe('monthly re-rating', () => {
  it('grades the prediction, and on approval writes a value_history point', async () => {
    const result = await ensureRerating(user as any, 'c1')
    expect(result.status).toBe('pending_review')

    const s = h.store as FakeStore

    // The original prediction is graded honestly (the Trust System verdict).
    const pred = s.rows('predictions')[0]
    expect(pred.verdict).toBe('hit')
    expect(pred.actual_value_delta).toBe(18000)
    expect(pred.evaluated_at).toBeTruthy()

    // A second, pending assessment now exists on the cycle.
    expect(s.rows('value_assessments')).toHaveLength(2)
    const rerated = s.rows('value_assessments').find((v) => v.status === 'pending_review')
    expect(rerated?.value_mid).toBe(118000)

    // Approving the re-rating appends value_history with the attributed delta.
    const res = await approve(
      new Request('https://atlas.test/api/admin/approve', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ cycleId: 'c1', action: 'approve' }),
      }),
    )
    expect(res.status).toBe(200)

    expect(s.rows('value_history')).toHaveLength(1)
    expect(s.rows('value_history')[0]).toMatchObject({
      user_id: 'u1',
      value_mid: 118000,
      attributed_delta: 18000, // 118000 (re-rating) - 100000 (original)
    })

    // A re-rating is not a "diagnosis ready" moment: no email is sent.
    expect(sendDiagnosisReadyEmail).not.toHaveBeenCalled()
  })
})
