'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Admin-only delete control for a single diagnosis (the API re-checks admin). Confirms,
// then hard-deletes the diagnosis + its cycle and refreshes the queue. Used to clear test
// submissions; never deletes the user row or the account's other data.
export function DeleteDiagnosisButton({
  diagnosisId,
  email,
}: {
  diagnosisId: string
  email: string | null
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function onDelete() {
    const ok = window.confirm(
      `Delete the diagnosis from ${email ?? 'this user'}?\n\n` +
        'This permanently removes the submission and its cycle. It cannot be undone.',
    )
    if (!ok) return

    setBusy(true)
    try {
      const res = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnosisId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(`Delete failed: ${data?.error ?? res.statusText}`)
        setBusy(false)
        return
      }
      router.refresh()
    } catch {
      alert('Delete failed: network error')
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={busy}
      className="whitespace-nowrap rounded-md border border-red-300 px-2.5 py-1 text-xs text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
    >
      {busy ? 'Deleting…' : 'Delete'}
    </button>
  )
}
