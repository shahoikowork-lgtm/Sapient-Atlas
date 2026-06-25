'use client'

import { useState } from 'react'

// The day-30 win, made deployable (the Recognition Layer, ATLAS_OS §7): the one sentence to
// say to the person who prices your work, ready to copy. The proof itself is the user's own
// before/after, shown alongside on the re-rating. "I got better" becomes "the market noticed."
export function DeployProof({ statement }: { statement: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(statement)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard blocked; the statement is still on screen to copy by hand
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-s-line bg-s-panel p-6">
      <div className="font-mono text-eyebrow uppercase text-s-accent">Say this to the person who prices your work</div>
      <p className="mt-2.5 text-body-lg text-s-text">&ldquo;{statement}&rdquo;</p>
      <p className="mt-2 text-[13px] leading-relaxed text-s-muted">
        Show them the before and after of your own work next to it. The proof is yours, in their language.
      </p>
      <button
        type="button"
        onClick={copy}
        className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-s-line px-4 py-2.5 text-sm font-medium text-s-text-2 transition-colors hover:border-s-line-strong hover:text-s-text"
      >
        {copied ? 'Copied' : 'Copy the sentence'}
      </button>
    </section>
  )
}
