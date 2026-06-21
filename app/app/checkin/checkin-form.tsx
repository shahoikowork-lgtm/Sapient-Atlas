'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CheckinForm({ week }: { week: number }) {
  const router = useRouter()
  const [text, setText] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [err, setErr] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErr('')
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week, artifact_text: text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Submit failed')
      setText('')
      router.refresh()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Something went wrong')
      setStatus('error')
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
        placeholder="Paste or describe the real work you did this week toward the milestone."
        className="min-h-[160px] rounded-lg border border-black/15 px-3 py-2 text-sm outline-none transition focus:border-black/40"
      />
      <div className="rounded-lg border border-dashed border-black/15 px-3 py-2 text-xs text-black/40">
        Attach a work sample (file upload coming soon)
      </div>
      {err ? <p className="text-sm text-red-600">{err}</p> : null}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="self-start rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black/85 disabled:opacity-60"
      >
        {status === 'submitting' ? 'Submitting… (~15s)' : 'Submit this week'}
      </button>
    </form>
  )
}
