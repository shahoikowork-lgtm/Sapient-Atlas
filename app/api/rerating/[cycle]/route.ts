import { NextResponse } from 'next/server'
import { getAppUser } from '@/lib/app-user'
import { ensureRerating } from '@/lib/rerating'

export const runtime = 'nodejs'

// Trigger the monthly re-rating for a cycle. Logged-in user; ensureRerating does all
// writes via service role and is gated on enough reviewed submissions.
export async function POST(_request: Request, { params }: { params: Promise<{ cycle: string }> }) {
  const user = await getAppUser()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  const { cycle } = await params
  const result = await ensureRerating(user, cycle)
  return NextResponse.json(result)
}
