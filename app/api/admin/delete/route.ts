import { NextResponse } from 'next/server'
import { getUser, isAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// Admin-only. Hard-deletes ONE diagnosis and its cycle. Deleting the cycle triggers the
// ON DELETE CASCADE on value_assessments / moves / predictions / plans / submissions /
// proof / value_history tied to it, and the diagnoses.cycle_id FK (ON DELETE SET NULL)
// detaches before the diagnosis row itself is removed. The user row and the user's OTHER
// cycles are left intact, so deleting one test submission never touches a real account's
// other data. Permanent, no undo — the UI confirms before calling this.
export async function POST(request: Request) {
  const user = await getUser()
  if (!isAdmin(user?.email)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  let body: { diagnosisId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const { diagnosisId } = body
  if (!diagnosisId) {
    return NextResponse.json({ error: 'Missing diagnosisId' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: diag, error: fetchErr } = await admin
    .from('diagnoses')
    .select('id, cycle_id')
    .eq('id', diagnosisId)
    .maybeSingle()
  if (fetchErr) return NextResponse.json({ error: 'Lookup failed' }, { status: 500 })
  if (!diag) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (diag.cycle_id) {
    const { error: cycleErr } = await admin.from('cycles').delete().eq('id', diag.cycle_id)
    if (cycleErr) return NextResponse.json({ error: 'Cycle delete failed' }, { status: 500 })
  }

  const { error: diagErr } = await admin.from('diagnoses').delete().eq('id', diagnosisId)
  if (diagErr) return NextResponse.json({ error: 'Delete failed' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
