import { createAdminClient } from '@/lib/supabase/admin'
import { deriveMissions } from '@/lib/sprint'

// The operations console data (service role). One row per active paying sprint: where they
// are, their last rep, and the flags that tell the operator what needs a human. Under the
// confidence gate most reps auto-clear, so "needs review" is the short, real founder queue.
export type OpsFlags = {
  needsReview: boolean // a pending_review rep is blocking this user — confirm it so they advance
  proofToVerify: boolean // a pending_review rep in the PROVE phase (external proof to verify)
  misdiagnosisRisk: boolean // the latest confirmed rep missed — the work is not clearing
  stuck: boolean // paid but nothing cleared, or no path yet
  atRisk: boolean // not complete and quiet for a while
}

export type OpsRow = {
  userId: string
  email: string | null
  name: string | null
  accountStatus: string
  missionN: number | null
  missionTitle: string | null
  phase: string | null
  cleared: number
  total: number
  complete: boolean
  lastVerdict: string | null
  lastConfidence: string | null
  daysSinceActivity: number | null
  flags: OpsFlags
}

const DAY = 24 * 60 * 60 * 1000

export function opsRowHasFlag(r: OpsRow): boolean {
  const f = r.flags
  return f.needsReview || f.proofToVerify || f.misdiagnosisRisk || f.stuck || f.atRisk
}

export async function getOpsRows(): Promise<OpsRow[]> {
  const admin = createAdminClient()
  const { data: users } = await admin
    .from('users')
    .select('id,email,name,status')
    .in('status', ['sprint', 'continuous'])
  if (!users?.length) return []

  const rows: OpsRow[] = []
  for (const u of users) {
    const flags: OpsFlags = {
      needsReview: false,
      proofToVerify: false,
      misdiagnosisRisk: false,
      stuck: false,
      atRisk: false,
    }
    let missionN: number | null = null
    let missionTitle: string | null = null
    let phase: string | null = null
    let cleared = 0
    let total = 0
    let complete = false
    let lastVerdict: string | null = null
    let lastConfidence: string | null = null
    let daysSinceActivity: number | null = null

    const { data: cycle } = await admin
      .from('cycles')
      .select('id')
      .eq('user_id', u.id)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!cycle) {
      flags.stuck = true // paid, no cycle yet — they need a path
    } else {
      const [{ data: plan }, { data: subs }] = await Promise.all([
        admin.from('plans').select('weekly_milestones').eq('cycle_id', cycle.id).maybeSingle(),
        admin
          .from('submissions')
          .select('week,status,feedback,submitted_at')
          .eq('cycle_id', cycle.id)
          .order('week', { ascending: true }),
      ])
      const submissions = (subs ?? []).map((s) => ({
        week: s.week as number,
        status: s.status as string,
        feedback: s.feedback,
      }))
      const derived = deriveMissions(
        (plan ?? null) as { weekly_milestones?: { week?: number }[] } | null,
        submissions,
      )
      total = derived.total
      cleared = derived.cleared
      complete = total > 0 && cleared === total
      // The mission they're on = the first not-yet-cleared one (whether active or blocked
      // in review). The needsReview flag tells the operator if it's waiting on them.
      const focus = derived.missions.find((m) => m.state !== 'done')
      missionN = focus?.n ?? (complete ? total : null)
      missionTitle = focus?.title ?? null
      phase = focus?.phase ?? (complete ? 'PROVE' : null)

      const phaseByWeek = new Map(derived.missions.map((m) => [m.week, m.phase]))

      // Latest activity + its verdict/confidence (the most recently submitted rep).
      const latest = [...(subs ?? [])].sort((a, b) =>
        String(b.submitted_at).localeCompare(String(a.submitted_at)),
      )[0]
      if (latest?.submitted_at) {
        daysSinceActivity = Math.floor((Date.now() - new Date(String(latest.submitted_at)).getTime()) / DAY)
        const fb = (latest.feedback ?? {}) as { quality?: string; confidence?: string }
        lastVerdict = fb.quality ?? null
        lastConfidence = fb.confidence ?? null
      }

      flags.needsReview = (subs ?? []).some((s) => s.status === 'pending_review')
      flags.proofToVerify = (subs ?? []).some(
        (s) => s.status === 'pending_review' && phaseByWeek.get(s.week as number) === 'PROVE',
      )
      flags.misdiagnosisRisk = lastVerdict === 'miss'
      flags.stuck = total > 0 && cleared === 0 && (daysSinceActivity == null || daysSinceActivity >= 3)
      flags.atRisk = !complete && daysSinceActivity != null && daysSinceActivity >= 5
    }

    rows.push({
      userId: u.id,
      email: u.email ?? null,
      name: u.name ?? null,
      accountStatus: u.status,
      missionN,
      missionTitle,
      phase,
      cleared,
      total,
      complete,
      lastVerdict,
      lastConfidence,
      daysSinceActivity,
      flags,
    })
  }

  // Needs-review first (the real founder queue), then stuck/at-risk, then most recently active.
  const urgency = (r: OpsRow) =>
    (r.flags.needsReview ? 4 : 0) + (r.flags.proofToVerify ? 2 : 0) + (r.flags.stuck || r.flags.atRisk ? 1 : 0)
  return rows.sort(
    (a, b) =>
      urgency(b) - urgency(a) ||
      (a.daysSinceActivity ?? 9999) - (b.daysSinceActivity ?? 9999),
  )
}
