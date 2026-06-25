'use client'

import { useState } from 'react'

// The referral ask at the proudest moment (the day-30 win): the user just got harder to
// replace, so this is when they will name a colleague. We share the free diagnosis, not a
// discount code. Honest distribution, asked at peak emotion.
export function ReferralAsk() {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/diagnosis`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard blocked; the link is sapientatlas.com/diagnosis
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-s-line bg-s-panel p-6">
      <div className="font-mono text-eyebrow uppercase text-s-accent">Who else is replaceable?</div>
      <p className="mt-2 text-body text-s-text-2">
        You just got harder to replace. Send a colleague the free diagnosis, it costs them one piece of real work.
      </p>
      <button
        type="button"
        onClick={copy}
        className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-s-line px-4 py-2.5 text-sm font-medium text-s-text-2 transition-colors hover:border-s-line-strong hover:text-s-text"
      >
        {copied ? 'Copied' : 'Copy the invite link'}
      </button>
    </section>
  )
}
