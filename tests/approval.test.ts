import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createFakeStore, type FakeStore } from './helpers/fake-supabase'

const h = vi.hoisted(() => ({ store: null as any }))

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => h.store }))
vi.mock('@/lib/auth', () => ({
  getUser: vi.fn(async () => ({ email: 'admin@test.com' })),
  isAdmin: vi.fn(() => true),
}))
vi.mock('@/lib/email', () => ({ sendDiagnosisReadyEmail: vi.fn(async () => ({ ok: true })) }))

import { POST } from '@/app/api/admin/approve/route'
import { sendDiagnosisReadyEmail } from '@/lib/email'

beforeEach(() => {
  ;(sendDiagnosisReadyEmail as any).mockClear()
  h.store = createFakeStore({
    users: [{ id: 'u1', email: 'lead@example.com', name: 'Lee Lead', status: 'lead' }],
    diagnoses: [{ user_id: 'u1', result_token: 'tok_abc123', work_sample: 'x', answers: {} }],
    cycles: [{ id: 'c1', user_id: 'u1', status: 'active' }],
    value_assessments: [
      { id: 'va1', user_id: 'u1', cycle_id: 'c1', status: 'pending_review', value_mid: 100000, confidence: 'medium' },
    ],
    moves: [{ id: 'm1', user_id: 'u1', cycle_id: 'c1', status: 'pending_review', title: 'Move' }],
  })
})

function approveRequest(cycleId: string) {
  return new Request('https://atlas.test/api/admin/approve', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ cycleId, action: 'approve' }),
  })
}

describe('admin approval unlocks results and emails the user', () => {
  it('approves the assessment + move and sends the diagnosis-ready email', async () => {
    const res = await POST(approveRequest('c1'))
    expect(res.status).toBe(200)

    const s = h.store as FakeStore

    // Output is now visible (approved), which is what unlocks /results/[token].
    expect(s.rows('value_assessments')[0].status).toBe('approved')
    expect(s.rows('moves')[0].status).toBe('approved')
    const approved = s
      .rows('value_assessments')
      .find((v) => v.user_id === 'u1' && v.status === 'approved')
    expect(approved).toBeTruthy()

    // Transactional email: sent once, links to the private results page, no AI content.
    expect(sendDiagnosisReadyEmail).toHaveBeenCalledTimes(1)
    const arg = (sendDiagnosisReadyEmail as any).mock.calls[0][0]
    expect(arg.to).toBe('lead@example.com')
    expect(arg.resultsUrl).toBe('https://atlas.test/results/tok_abc123')

    // Initial approval is not a re-rating: no value_history point yet.
    expect(s.rows('value_history')).toHaveLength(0)
  })
})
