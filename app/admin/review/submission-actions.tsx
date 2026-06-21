'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SubmissionActions({ submissionId }: { submissionId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function act(action: 'approve' | 'reject') {
    setBusy(true)
    setErr('')
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, action }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Failed')
      }
      router.refresh()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed')
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={busy}
        onClick={() => act('approve')}
        className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        Approve
      </button>
      <button
        disabled={busy}
        onClick={() => act('reject')}
        className="rounded-md border border-black/15 px-3 py-1.5 text-sm disabled:opacity-50"
      >
        Reject
      </button>
      {err ? <span className="text-xs text-red-600">{err}</span> : null}
    </div>
  )
}
