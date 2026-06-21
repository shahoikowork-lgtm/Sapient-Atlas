import { NextResponse } from 'next/server'
import { getAppUser } from '@/lib/app-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { runWeeklyFeedback } from '@/lib/ai/weekly-feedback'

export const runtime = 'nodejs'

// Weekly check-in submission. Logged-in user; all writes via service role. The AI
// feedback is saved as pending_review (the user does not see it until admin approval).
export async function POST(request: Request) {
  const user = await getAppUser()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  let body: { week?: number; artifact_text?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const week = Number(body.week)
  const artifactText = (body.artifact_text ?? '').trim()
  if (!week || week < 1) return NextResponse.json({ error: 'Invalid week' }, { status: 400 })
  if (artifactText.length < 20) {
    return NextResponse.json({ error: 'Please describe your work in a few sentences.' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: cycle } = await admin
    .from('cycles').select('id').eq('user_id', user.id)
    .order('started_at', { ascending: false }).limit(1).maybeSingle()
  if (!cycle) return NextResponse.json({ error: 'No active sprint' }, { status: 400 })

  // One submission per week.
  const { data: existing } = await admin
    .from('submissions').select('id')
    .eq('user_id', user.id).eq('cycle_id', cycle.id).eq('week', week).maybeSingle()
  if (existing) return NextResponse.json({ error: 'You already submitted this week.' }, { status: 409 })

  // Milestone + move for AI context.
  const { data: plan } = await admin.from('plans').select('weekly_milestones').eq('cycle_id', cycle.id).maybeSingle()
  const milestones = (plan?.weekly_milestones ?? []) as { week?: number; title?: string; task?: string }[]
  const m = milestones.find((x) => (x.week ?? 0) === week) ?? milestones[week - 1]
  const milestoneText = m ? `${m.title ?? ''}: ${m.task ?? ''}` : `Week ${week}`
  const { data: move } = await admin
    .from('moves').select('title').eq('cycle_id', cycle.id)
    .in('status', ['approved', 'active', 'completed']).maybeSingle()

  try {
    const fb = await runWeeklyFeedback({ moveTitle: move?.title ?? '', week, milestone: milestoneText, artifactText })
    const { error } = await admin.from('submissions').insert({
      user_id: user.id,
      cycle_id: cycle.id,
      week,
      artifact_text: artifactText,
      graded_score: fb.graded_score,
      feedback: fb.feedback,
      status: 'pending_review',
    })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[submissions] feedback failed:', err instanceof Error ? err.message : err)
    // Save the work so it is not lost; feedback can be generated on review.
    await admin.from('submissions').insert({
      user_id: user.id, cycle_id: cycle.id, week, artifact_text: artifactText, status: 'submitted',
    })
    return NextResponse.json({ ok: true, note: 'saved; feedback pending' })
  }
}
