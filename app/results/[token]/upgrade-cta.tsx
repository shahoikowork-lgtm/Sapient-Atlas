'use client'

import { useState } from 'react'

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
    <section className="mt-12 rounded-2xl border border-black/10 p-6">
      <div className="text-xs font-medium uppercase tracking-wide text-black/40">Make the move</div>
      <h2 className="mt-2 text-xl font-semibold tracking-tight">Value Sprint, 30 days of execution</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-black/65">
        We turn this one move into a 30-day plan on your real work, check your progress each week, and
        re-rate your value at the end. One-time payment.
      </p>
      <button
        onClick={go}
        disabled={busy}
        className="mt-4 inline-flex items-center justify-center rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-black/85 disabled:opacity-60"
      >
        {busy ? 'Starting checkout…' : 'Start your Value Sprint, $149'}
      </button>
      {err ? <p className="mt-2 text-sm text-red-600">{err}</p> : null}
    </section>
  )
}
