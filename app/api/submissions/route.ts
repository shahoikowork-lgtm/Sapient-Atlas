import { NextResponse } from 'next/server'
import { getAppUser } from '@/lib/app-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { runWeeklyFeedback } from '@/lib/ai/weekly-feedback'
import { runRepCheck } from '@/lib/ai/rep-check'
import { toUserFacingRepCheck } from '@/lib/atlas/rep-grade'

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

  // Milestone (title + bar) + move for the two feedback layers.
  const { data: plan } = await admin.from('plans').select('weekly_milestones').eq('cycle_id', cycle.id).maybeSingle()
  const milestones = (plan?.weekly_milestones ?? []) as {
    week?: number
    title?: string
    task?: string
    success_criteria?: string
  }[]
  const m = milestones.find((x) => (x.week ?? 0) === week) ?? milestones[week - 1]
  const milestoneText = m ? `${m.title ?? ''}: ${m.task ?? ''}` : `Week ${week}`
  const missionTitle = m?.title ?? `Week ${week}`
  const bar = m?.success_criteria ?? ''
  const { data: move } = await admin
    .from('moves').select('title').eq('cycle_id', cycle.id)
    .in('status', ['approved', 'active', 'completed']).maybeSingle()

  // Two feedback layers (ATLAS_OS §6). The instant bar-check is mechanical, crosses no gate,
  // and is returned live so the user sees where their rep cleared the bar before the next
  // mission. The weekly note is substantive: saved pending_review, delivered only after a
  // human approves it. Run together (one round-trip of latency) and degrade independently.
  const [checkRes, fbRes] = await Promise.allSettled([
    bar
      ? runRepCheck({ missionTitle, bar, artifactText })
      : Promise.reject(new Error('no bar for this mission')),
    runWeeklyFeedback({ moveTitle: move?.title ?? '', week, milestone: milestoneText, artifactText }),
  ])
  const check = checkRes.status === 'fulfilled' ? checkRes.value : null
  const fb = fbRes.status === 'fulfilled' ? fbRes.value : null
  if (checkRes.status === 'rejected') {
    console.error('[submissions] bar-check failed:', checkRes.reason instanceof Error ? checkRes.reason.message : checkRes.reason)
  }
  if (fbRes.status === 'rejected') {
    console.error('[submissions] weekly feedback failed:', fbRes.reason instanceof Error ? fbRes.reason.message : fbRes.reason)
  }

  // Always persist the work. The instant bar-check is folded into the feedback jsonb so it
  // is retained next to the (gated) weekly note; a failure of either never loses the rep.
  const feedback =
    fb || check
      ? { ...(fb?.feedback ?? {}), ...(check ? { bar_check: check.bar_check, quality: check.quality } : {}) }
      : null
  const { error: insErr } = await admin.from('submissions').insert({
    user_id: user.id,
    cycle_id: cycle.id,
    week,
    artifact_text: artifactText,
    graded_score: fb?.graded_score ?? null,
    feedback,
    status: fb ? 'pending_review' : 'submitted',
  })
  if (insErr) {
    console.error('[submissions] insert failed:', insErr.message)
    return NextResponse.json({ error: 'Could not save your work. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, check: check ? toUserFacingRepCheck(check) : null })
}
