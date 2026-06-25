'use client'

import { useState } from 'react'
import { Button, Eyebrow } from '@/components/atlas'

export function UpgradeCta({ token }: { token: string }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function go() {
    setBusy(true)
    setErr('')
    try {
      const res = await fetch('/api/checkout/sprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data?.error || 'Could not start checkout')
      window.location.href = data.url
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Something went wrong')
      setBusy(false)
    }
  }

  return (
    <section className="rounded-2xl border border-s-line bg-s-panel p-6 sm:p-8">
      <Eyebrow tone="muted">The Why-You Sprint</Eyebrow>
      <h2 className="mt-2 font-serif text-[22px] font-semibold tracking-tight text-s-text">
        Thirty days to a prospect who repeats your positioning, unprompted.
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-s-text-2">
        The one move above becomes a daily ~10-minute rep on your own real work, checked against the bar
        every time, ending in proof a real buyer recognizes. One payment, no subscription.
      </p>

      <ul className="mt-5 flex flex-col gap-3 text-[14px] text-s-text-2">
        <li className="flex gap-2.5">
          <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-s-accent" />
          <span>
            <span className="text-s-text">Your work sounds like three competitors</span> → you leave with a claim only you can make.
          </span>
        </li>
        <li className="flex gap-2.5">
          <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-s-accent" />
          <span>
            <span className="text-s-text">No outside eye on your real work</span> → a surgical note on every rep you ship.
          </span>
        </li>
        <li className="flex gap-2.5">
          <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-s-accent" />
          <span>
            <span className="text-s-text">No way to prove you got better</span> → a real prospect plays your positioning back, unprompted.
          </span>
        </li>
      </ul>

      <div className="mt-5 rounded-xl border border-s-line bg-s-bg p-4">
        <div className="font-mono text-eyebrow uppercase text-s-muted">You also leave with</div>
        <ul className="mt-2 flex flex-col gap-1.5 text-[13.5px] text-s-text-2">
          <li>The before and after of your own work, side by side</li>
          <li>One sentence to say to your boss, in your voice</li>
          <li>Your next constraint, named, the day this one moves</li>
        </ul>
      </div>

      <p className="mt-5 text-[13.5px] leading-relaxed text-s-text-2">
        <span className="font-medium text-s-text">No faked verdict.</span> At day 30 we grade the same bar on
        fresh work and tell you the truth: moved, partly moved, or not, with the reason. If it didn&apos;t
        work, we say so.
      </p>

      <div className="mt-6">
        <Button onClick={go} disabled={busy} size="lg">
          {busy ? 'Starting checkout…' : 'Start the Why-You Sprint · $149, once'}
        </Button>
      </div>
      {err ? <p className="mt-2 text-sm text-s-danger">{err}</p> : null}
    </section>
  )
}
