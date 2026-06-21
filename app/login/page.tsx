'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/app`,
      },
    })

    if (error) {
      setError(error.message)
      setStatus('error')
    } else {
      setStatus('sent')
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="text-xl font-semibold">Sign in to Sapient Atlas</h1>
        <p className="mt-1 text-sm text-black/60">
          We&apos;ll email you a magic link to sign in.
        </p>
      </div>

      {status === 'sent' ? (
        <p className="text-sm">
          Check your inbox, we sent a sign-in link to <strong>{email}</strong>.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40"
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {status === 'sending' ? 'Sending…' : 'Send magic link'}
          </button>
          {status === 'error' ? <p className="text-sm text-red-600">{error}</p> : null}
        </form>
      )}
    </main>
  )
}
