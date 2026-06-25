import { createAdminClient } from '@/lib/supabase/admin'

export type FirstWinRow = { email: string | null; hours: number }

// Time-to-first-win — the number to run the business on (Hormozi): hours from a paid sprint's
// start (when the plan is generated, i.e. the user enters the app) to their FIRST submitted
// rep (the instant bar-check, their first felt win). Derived entirely from existing rows; no
// analytics infrastructure. Drive this down and completion, return, and referrals follow.
export async function getTimeToFirstWin(): Promise<{ rows: FirstWinRow[]; medianHours: number | null }> {
  const admin = createAdminClient()
  const [{ data: plans }, { data: subs }, { data: users }] = await Promise.all([
    admin.from('plans').select('cycle_id, created_at'),
    admin.from('submissions').select('user_id, cycle_id, created_at').order('created_at', { ascending: true }),
    admin.from('users').select('id, email'),
  ])

  // Sprint start per cycle = when its plan was generated.
  const start = new Map<string, number>()
  for (const p of (plans ?? []) as { cycle_id: string | null; created_at: string | null }[]) {
    if (p.cycle_id && p.created_at) start.set(p.cycle_id, Date.parse(p.created_at))
  }
  const emailById = new Map<string, string | null>(
    ((users ?? []) as { id: string; email: string | null }[]).map((u) => [u.id, u.email ?? null]),
  )

  // First submission per cycle (subs are pre-sorted oldest-first).
  const firstByCycle = new Map<string, { user_id: string; t: number }>()
  for (const s of (subs ?? []) as { user_id: string; cycle_id: string | null; created_at: string | null }[]) {
    if (!s.cycle_id || !s.created_at) continue
    if (!firstByCycle.has(s.cycle_id)) firstByCycle.set(s.cycle_id, { user_id: s.user_id, t: Date.parse(s.created_at) })
  }

  const rows: FirstWinRow[] = []
  for (const [cycleId, first] of firstByCycle) {
    const s0 = start.get(cycleId)
    if (s0 == null) continue
    rows.push({ email: emailById.get(first.user_id) ?? null, hours: Math.max(0, Math.round((first.t - s0) / 3_600_000)) })
  }
  rows.sort((a, b) => a.hours - b.hours)
  const medianHours = rows.length ? rows[Math.floor((rows.length - 1) / 2)].hours : null
  return { rows, medianHours }
}
