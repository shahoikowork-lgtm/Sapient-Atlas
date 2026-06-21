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
    <section className="mt-8 rounded-2xl border border-hairline bg-surface p-6">
      <Eyebrow className="text-muted">Make the move</Eyebrow>
      <h2 className="mt-2 font-serif text-[22px] font-semibold tracking-tight">
        The Value Sprint, 30 days of execution
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        You know the move. The Sprint turns it into a 30-day plan on your real work, checks your progress
        each week, and re-rates your capability profile at the end. One-time payment.
      </p>
      <ul className="mt-4 flex flex-col gap-2 text-[14px] text-ink/75">
        <li className="flex gap-2.5">
          <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          A 30-day execution plan built on your real work
        </li>
        <li className="flex gap-2.5">
          <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          Weekly feedback on what you actually ship
        </li>
        <li className="flex gap-2.5">
          <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          A re-rating of your capability profile at the end
        </li>
      </ul>
      <div className="mt-5">
        <Button onClick={go} disabled={busy} size="lg">
          {busy ? 'Starting checkout…' : 'Start your Value Sprint · $149'}
        </Button>
      </div>
      {err ? <p className="mt-2 text-sm text-red-700">{err}</p> : null}
    </section>
  )
}
