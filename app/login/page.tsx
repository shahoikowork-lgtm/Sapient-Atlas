'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/atlas/Button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')
  const [googleBusy, setGoogleBusy] = useState(false)

  // Primary: OAuth. On success the browser is redirected to Google, so we only fall
  // through to the error branch (e.g. the Google provider isn't enabled in Supabase yet).
  async function continueWithGoogle() {
    setGoogleBusy(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/app`,
      },
    })
    if (error) {
      setError(
        /provider|not enabled|unsupported/i.test(error.message)
          ? 'Google sign-in isn’t available yet. Use email below for now.'
          : error.message,
      )
      setGoogleBusy(false)
    }
  }

  // Fallback: email magic link (unchanged behavior).
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
        <h1 className="text-h2 text-ink">Sign in to Sapient Atlas</h1>
        <p className="mt-2 text-body text-text-secondary">
          Continue with Google, or get a magic link by email.
        </p>
      </div>

      {/* Primary: Continue with Google */}
      <Button
        variant="secondary"
        type="button"
        size="lg"
        onClick={continueWithGoogle}
        disabled={googleBusy}
        className="w-full gap-2.5"
      >
        <GoogleIcon />
        {googleBusy ? 'Redirecting…' : 'Continue with Google'}
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-3 text-label text-muted">
        <span className="h-px flex-1 bg-hairline" />
        or continue with email
        <span className="h-px flex-1 bg-hairline" />
      </div>

      {/* Fallback: email magic link */}
      {status === 'sent' ? (
        <p className="text-body text-text-secondary">
          Check your inbox, we sent a sign-in link to <strong className="text-ink">{email}</strong>.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="rounded-lg border border-hairline bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 hover:border-hairline-strong focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <Button variant="primary" type="submit" size="lg" disabled={status === 'sending'} className="w-full">
            {status === 'sending' ? 'Sending…' : 'Send magic link'}
          </Button>
        </form>
      )}

      {error ? <p className="text-label text-danger">{error}</p> : null}
    </main>
  )
}

// The standard multi-color Google "G".
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  )
}
