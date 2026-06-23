import { sprintEligibility, type AtlasCycleData } from '@/lib/atlas/eligibility'
import { createAdminClient } from '@/lib/supabase/admin'

// THE single source of truth for a diagnosis's user-facing status. Derived entirely from
// existing data — no new column. Pages must call deriveDiagnosisStatus(); never re-derive
// status inline. Reuses sprintEligibility() so the accepted / waitlist decision lives in
// exactly one place.

export type DiagnosisStatus =
  | 'submitted'
  | 'reviewing'
  | 'ready'
  | 'waitlist'
  | 'sprint_available'
  | 'sprint_active'

export const DIAGNOSIS_STATUS_LABEL: Record<DiagnosisStatus, string> = {
  submitted: 'Submitted',
  reviewing: 'In review',
  ready: 'Ready',
  waitlist: 'Waitlist',
  sprint_available: 'Sprint available',
  sprint_active: 'Sprint active',
}

const VISIBLE_MOVE = new Set(['approved', 'active', 'completed'])

export function deriveDiagnosisStatus(input: {
  atlas: AtlasCycleData
  vaStatus?: string | null
  moveStatus?: string | null
  paid?: boolean
}): DiagnosisStatus {
  const { atlas, vaStatus, moveStatus, paid = false } = input

  // Not yet published by a human reviewer.
  const published = vaStatus === 'approved' && VISIBLE_MOVE.has(moveStatus ?? '')
  if (!published) {
    return vaStatus === 'pending_review' || moveStatus === 'pending_review' ? 'reviewing' : 'submitted'
  }

  // Published — layer the Sprint / waitlist outcome on top via the existing eligibility gate.
  const elig = sprintEligibility(atlas)
  if (elig.show_sprint_cta) return paid ? 'sprint_active' : 'sprint_available'
  if (elig.mode === 'waitlist') return 'waitlist'
  return 'ready'
}

// ── Data access (server-only; service role) ─────────────────────────────────────────────

export type DiagnosisRow = {
  id: string
  token: string
  createdAt: string
  userId: string
  email: string | null
  name: string | null
  role: string | null
  profession: string | null
  constraintName: string | null
  status: DiagnosisStatus
  cycleId: string | null
}

type Cycle = { id: string; profile_snapshot: unknown; created_at: string }
type Va = { id: string; cycle_id: string | null; status: string; created_at: string }
type Move = { id: string; cycle_id: string | null; status: string; assigned_at: string }
type Sub = { status: string }
type DiagRow = { id: string; result_token: string; created_at: string; user_id: string }
type UserInfo = { email: string | null; name: string | null; role: string | null }

function atlasOf(cycle: Cycle | null | undefined): AtlasCycleData {
  const snap = cycle?.profile_snapshot as { atlas?: AtlasCycleData } | null | undefined
  return snap?.atlas ?? null
}

// diagnoses and cycles are not FK-linked in V1; each submission creates one of each within
// the same request, so the cycle closest in time is the diagnosis's cycle.
function closestCycle(when: string, cycles: Cycle[]): Cycle | null {
  if (cycles.length === 0) return null
  const t = Date.parse(when)
  let best = cycles[0]
  let bestDiff = Math.abs(Date.parse(best.created_at) - t)
  for (const c of cycles.slice(1)) {
    const diff = Math.abs(Date.parse(c.created_at) - t)
    if (diff < bestDiff) {
      best = c
      bestDiff = diff
    }
  }
  return best
}

function isPaid(userStatus: string | null | undefined, subs: Sub[]): boolean {
  if (userStatus === 'sprint' || userStatus === 'continuous') return true
  return subs.some((s) => s.status === 'active' || s.status === 'trialing')
}

function buildRow(d: DiagRow, cycles: Cycle[], vas: Va[], moves: Move[], info: UserInfo, paid: boolean): DiagnosisRow {
  const cycle = closestCycle(d.created_at, cycles)
  const atlas = atlasOf(cycle)
  // vas / moves are pre-sorted newest-first, so find() returns the latest for this cycle.
  const va = cycle ? vas.find((v) => v.cycle_id === cycle.id) : undefined
  const move = cycle ? moves.find((m) => m.cycle_id === cycle.id) : undefined
  return {
    id: d.id,
    token: d.result_token,
    createdAt: d.created_at,
    userId: d.user_id,
    email: info.email,
    name: info.name,
    role: info.role,
    profession: atlas?.profession ?? null,
    constraintName: atlas?.constraint_name ?? null,
    status: deriveDiagnosisStatus({ atlas, vaStatus: va?.status, moveStatus: move?.status, paid }),
    cycleId: cycle?.id ?? null,
  }
}

function groupByUser<T extends { user_id: string }>(rows: T[]): Map<string, T[]> {
  const m = new Map<string, T[]>()
  for (const r of rows) {
    const arr = m.get(r.user_id)
    if (arr) arr.push(r)
    else m.set(r.user_id, [r])
  }
  return m
}

// A single user's diagnoses, newest first. Scoped strictly to the server-resolved userId.
export async function getUserDiagnoses(userId: string): Promise<DiagnosisRow[]> {
  const admin = createAdminClient()
  const [diag, cyc, va, mv, usr, sub] = await Promise.all([
    admin.from('diagnoses').select('id,result_token,created_at,user_id').eq('user_id', userId).order('created_at', { ascending: false }),
    admin.from('cycles').select('id,profile_snapshot,created_at').eq('user_id', userId).order('created_at', { ascending: false }),
    admin.from('value_assessments').select('id,cycle_id,status,created_at').eq('user_id', userId).order('created_at', { ascending: false }),
    admin.from('moves').select('id,cycle_id,status,assigned_at').eq('user_id', userId).order('assigned_at', { ascending: false }),
    admin.from('users').select('email,name,role,status').eq('id', userId).maybeSingle(),
    admin.from('subscriptions').select('status').eq('user_id', userId),
  ])
  const user = usr.data as (UserInfo & { status: string | null }) | null
  const paid = isPaid(user?.status, (sub.data as Sub[]) ?? [])
  const info: UserInfo = { email: user?.email ?? null, name: user?.name ?? null, role: user?.role ?? null }
  return ((diag.data as DiagRow[]) ?? []).map((d) =>
    buildRow(d, (cyc.data as Cycle[]) ?? [], (va.data as Va[]) ?? [], (mv.data as Move[]) ?? [], info, paid),
  )
}

// All diagnoses across users, newest first (admin queue).
export async function getAllDiagnoses(limit = 200): Promise<DiagnosisRow[]> {
  const admin = createAdminClient()
  const { data: diagData } = await admin
    .from('diagnoses')
    .select('id,result_token,created_at,user_id')
    .order('created_at', { ascending: false })
    .limit(limit)
  const ds = (diagData as DiagRow[]) ?? []
  if (ds.length === 0) return []
  const userIds = [...new Set(ds.map((d) => d.user_id))]
  const [usr, cyc, va, mv, sub] = await Promise.all([
    admin.from('users').select('id,email,name,role,status').in('id', userIds),
    admin.from('cycles').select('id,user_id,profile_snapshot,created_at').in('user_id', userIds).order('created_at', { ascending: false }),
    admin.from('value_assessments').select('id,user_id,cycle_id,status,created_at').in('user_id', userIds).order('created_at', { ascending: false }),
    admin.from('moves').select('id,user_id,cycle_id,status,assigned_at').in('user_id', userIds).order('assigned_at', { ascending: false }),
    admin.from('subscriptions').select('user_id,status').in('user_id', userIds),
  ])
  const usersById = new Map(
    ((usr.data as ({ id: string } & UserInfo & { status: string | null })[]) ?? []).map((u) => [u.id, u]),
  )
  const cyclesByUser = groupByUser((cyc.data as (Cycle & { user_id: string })[]) ?? [])
  const vasByUser = groupByUser((va.data as (Va & { user_id: string })[]) ?? [])
  const movesByUser = groupByUser((mv.data as (Move & { user_id: string })[]) ?? [])
  const subsByUser = groupByUser((sub.data as (Sub & { user_id: string })[]) ?? [])
  return ds.map((d) => {
    const u = usersById.get(d.user_id)
    const paid = isPaid(u?.status, subsByUser.get(d.user_id) ?? [])
    return buildRow(
      d,
      cyclesByUser.get(d.user_id) ?? [],
      vasByUser.get(d.user_id) ?? [],
      movesByUser.get(d.user_id) ?? [],
      { email: u?.email ?? null, name: u?.name ?? null, role: u?.role ?? null },
      paid,
    )
  })
}

export type DiagnosisDetail = {
  id: string
  token: string
  createdAt: string
  workSample: string | null
  answers: Record<string, unknown>
  user: (UserInfo & { status: string | null }) | null
  cycleId: string | null
  atlas: AtlasCycleData
  assessment:
    | {
        observation: string | null
        confidence: string | null
        trajectory: string | null
        ai_exposure: number | null
        gaps: { title?: string; detail?: string }[] | null
        status: string | null
      }
    | null
  move: { title: string | null; thesis: string | null; reasoning: string | null; status: string | null } | null
  status: DiagnosisStatus
  hasPending: boolean
}

// Full detail for one diagnosis (admin detail view).
export async function getDiagnosisDetail(id: string): Promise<DiagnosisDetail | null> {
  const admin = createAdminClient()
  const { data: d } = await admin.from('diagnoses').select('*').eq('id', id).maybeSingle()
  if (!d) return null

  const [usr, cyc, sub] = await Promise.all([
    admin.from('users').select('email,name,role,status').eq('id', d.user_id).maybeSingle(),
    admin.from('cycles').select('id,profile_snapshot,created_at').eq('user_id', d.user_id).order('created_at', { ascending: false }),
    admin.from('subscriptions').select('status').eq('user_id', d.user_id),
  ])
  const user = usr.data as DiagnosisDetail['user']
  const cycle = closestCycle(d.created_at, (cyc.data as Cycle[]) ?? [])
  const atlas = atlasOf(cycle)

  let assessment: DiagnosisDetail['assessment'] = null
  let move: DiagnosisDetail['move'] = null
  if (cycle) {
    const { data: va } = await admin
      .from('value_assessments')
      .select('*')
      .eq('cycle_id', cycle.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    const { data: mv } = await admin
      .from('moves')
      .select('*')
      .eq('cycle_id', cycle.id)
      .order('assigned_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    assessment = (va as DiagnosisDetail['assessment']) ?? null
    move = (mv as DiagnosisDetail['move']) ?? null
  }

  const paid = isPaid(user?.status, (sub.data as Sub[]) ?? [])
  const status = deriveDiagnosisStatus({
    atlas,
    vaStatus: assessment?.status,
    moveStatus: move?.status,
    paid,
  })

  return {
    id: d.id,
    token: d.result_token,
    createdAt: d.created_at,
    workSample: d.work_sample ?? null,
    answers: (d.answers as Record<string, unknown>) ?? {},
    user,
    cycleId: cycle?.id ?? null,
    atlas,
    assessment,
    move,
    status,
    hasPending: assessment?.status === 'pending_review',
  }
}
