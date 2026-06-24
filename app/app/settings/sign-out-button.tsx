'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// Signs the user out (clears the Supabase session) and reloads to /login, so accounts can
// be switched from the UI. A full navigation guarantees a fresh, sessionless load.
export function SignOutButton() {
  const [busy, setBusy] = useState(false)

  async function onSignOut() {
    setBusy(true)
    try {
      await createClient().auth.signOut()
    } catch {
      // ignore — the redirect below forces a fresh, sessionless load either way
    }
    window.location.href = '/login'
  }

  return (
    <button
      type="button"
      onClick={onSignOut}
      disabled={busy}
      className="inline-flex min-h-11 shrink-0 items-center rounded-lg border border-s-line px-4 py-2.5 text-sm font-medium text-s-text-2 transition-colors hover:border-s-line-strong hover:text-s-text disabled:opacity-60"
    >
      {busy ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
