import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

// All workspace reads go through the RLS-scoped server client (policies expose only the
// user's own approved / visible rows). The "current sprint" is anchored on the latest
// visible move; the assessment, plan, and submissions are scoped to that move's cycle so an
// older or completed cycle never bleeds into the active workspace. Subscription and
// value_history are account-level and stay un-scoped. Cached so the bundle loads once per
// request.
export const getWorkspace = cache(async () => {
  const supabase = await createClient()

  const [{ data: move }, { data: subscription }, { data: valueHistory }] = await Promise.all([
    supabase
      .from('moves')
      .select('*')
      .in('status', ['approved', 'active', 'completed'])
      .order('assigned_at', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
    supabase.from('subscriptions').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('value_history').select('*').order('date', { ascending: true }),
  ])

  const cycleId: string | null = move?.cycle_id ?? null

  // No active sprint yet: only the account-level rows are meaningful.
  if (!move || !cycleId) {
    const { data: assessment } = await supabase
      .from('value_assessments')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    return {
      assessment,
      move: move ?? null,
      prediction: null,
      subscription,
      valueHistory: valueHistory ?? [],
      plan: null,
      submissions: [],
    }
  }

  const [{ data: assessment }, { data: plan }, { data: submissions }, { data: prediction }] = await Promise.all([
    supabase
      .from('value_assessments')
      .select('*')
      .eq('cycle_id', cycleId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from('plans').select('*').eq('cycle_id', cycleId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('submissions').select('*').eq('cycle_id', cycleId).order('week', { ascending: true }),
    supabase.from('predictions').select('*').eq('move_id', move.id).maybeSingle(),
  ])

  return {
    assessment,
    move,
    prediction,
    subscription,
    valueHistory: valueHistory ?? [],
    plan,
    submissions: submissions ?? [],
  }
})
