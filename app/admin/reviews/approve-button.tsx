'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Admin-only one-click approve for a diagnosis's pending output, straight from the queue
// list (the API re-checks admin). Same effect as the detail page's Approve: flips the value
// assessment + move to visible, which publishes the result and unlocks the user's sprint.
export function ApproveDiagnosisButton({ cycleId }: { cycleId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function onApprove() {
    setBusy(true)
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycleId, action: 'approve' }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(`Approve failed: ${data?.error ?? res.statusText}`)
        setBusy(false)
        return
      }
      router.refresh()
    } catch {
      alert('Approve failed: network error')
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={onApprove}
      disabled={busy}
      className="whitespace-nowrap rounded-md bg-black px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-black/80 disabled:opacity-50"
    >
      {busy ? 'Approving…' : 'Approve'}
    </button>
  )
}
