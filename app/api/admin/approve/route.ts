import { NextResponse } from 'next/server'
import { getUser, isAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// Approve or reject a cycle's pending AI output. Approving flips the value assessment
// and the move to a visible status, which unlocks /results/[token].
export async function POST(request: Request) {
  const user = await getUser()
  if (!isAdmin(user?.email)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  let body: { cycleId?: string; submissionId?: string; action?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { cycleId, submissionId, action } = body
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Weekly feedback submission: approve -> reviewed (user sees it); reject -> back to submitted.
  if (submissionId) {
    await admin
      .from('submissions')
      .update(
        action === 'approve'
          ? { status: 'reviewed', reviewed_at: new Date().toISOString() }
          : { status: 'submitted' },
      )
      .eq('id', submissionId)
      .eq('status', 'pending_review')
    return NextResponse.json({ ok: true })
  }

  // Diagnosis (value assessment + move) approval.
  if (!cycleId) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  if (action === 'approve') {
    const { data: justApproved, error: e1 } = await admin
      .from('value_assessments')
      .update({ status: 'approved' })
      .eq('cycle_id', cycleId)
      .eq('status', 'pending_review')
      .select('user_id,value_mid,confidence')
    const { error: e2 } = await admin
      .from('moves')
      .update({ status: 'approved' })
      .eq('cycle_id', cycleId)
      .eq('status', 'pending_review')
    if (e1 || e2) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

    // If this approval gives the cycle a second assessment, it is a re-rating:
    // append a value_history point (new value + attributed change vs the original).
    if (justApproved && justApproved.length > 0) {
      const { data: approvedAll } = await admin
        .from('value_assessments')
        .select('value_mid')
        .eq('cycle_id', cycleId)
        .eq('status', 'approved')
        .order('created_at', { ascending: true })
      if (approvedAll && approvedAll.length >= 2) {
        const prevMid = Number(approvedAll[0].value_mid) || 0
        const newMid = Number(justApproved[0].value_mid) || 0
        await admin.from('value_history').insert({
          user_id: justApproved[0].user_id,
          value_mid: newMid,
          confidence: justApproved[0].confidence,
          attributed_delta: newMid - prevMid,
        })
      }
    }
  } else {
    // move_status has no 'rejected' -> 'deferred' keeps it hidden from the user.
    const { error: e1 } = await admin
      .from('value_assessments')
      .update({ status: 'rejected' })
      .eq('cycle_id', cycleId)
      .eq('status', 'pending_review')
    const { error: e2 } = await admin
      .from('moves')
      .update({ status: 'deferred' })
      .eq('cycle_id', cycleId)
      .eq('status', 'pending_review')
    if (e1 || e2) return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
