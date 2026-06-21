import { NextResponse } from 'next/server'
import { getUser, isAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendDiagnosisReadyEmail } from '@/lib/email'

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

    // A second approved assessment on the cycle is a re-rating: append a
    // value_history point (new value + attributed change vs the original). The
    // first approval is the initial diagnosis: email the user that it is ready
    // (transactional, link only, no AI content, sent only after this human approval).
    if (justApproved && justApproved.length > 0) {
      const userId = justApproved[0].user_id
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
          user_id: userId,
          value_mid: newMid,
          confidence: justApproved[0].confidence,
          attributed_delta: newMid - prevMid,
        })
      } else {
        await notifyDiagnosisReady(admin, userId, new URL(request.url).origin)
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

// Email the user that their initial diagnosis is approved and ready. Best-effort:
// never throws, so a mail failure can't fail the approval. Looks up the recipient
// and their results token and sends only the transactional link (no AI content).
async function notifyDiagnosisReady(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  origin: string,
) {
  try {
    const { data: u } = await admin
      .from('users')
      .select('email,name')
      .eq('id', userId)
      .maybeSingle()
    if (!u?.email) return

    const { data: d } = await admin
      .from('diagnoses')
      .select('result_token')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (!d?.result_token) return

    const base = (process.env.NEXT_PUBLIC_SITE_URL || origin).replace(/\/$/, '')
    await sendDiagnosisReadyEmail({
      to: u.email,
      name: u.name,
      resultsUrl: `${base}/results/${d.result_token}`,
    })
  } catch (err) {
    console.error('[approve] diagnosis-ready email failed:', err instanceof Error ? err.message : err)
  }
}
