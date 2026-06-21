import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

// All workspace reads go through the RLS-scoped server client: the policies already
// restrict to the user's own rows and only expose approved assessments / visible moves.
// Cached so the whole bundle loads once per request.
export const getWorkspace = cache(async () => {
  const supabase = await createClient()

  const { data: assessment } = await supabase
    .from('value_assessments')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: move } = await supabase
    .from('moves')
    .select('*')
    .in('status', ['approved', 'active', 'completed'])
    .order('assigned_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let prediction = null
  if (move) {
    const { data } = await supabase.from('predictions').select('*').eq('move_id', move.id).maybeSingle()
    prediction = data
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: valueHistory } = await supabase
    .from('value_history')
    .select('*')
    .order('date', { ascending: true })

  const { data: plan } = await supabase
    .from('plans')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: submissions } = await supabase
    .from('submissions')
    .select('*')
    .order('week', { ascending: true })

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
