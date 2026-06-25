'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type RepCheck = {
  quality_label: string
  items: { condition: string; cleared: boolean; where: string }[]
}

// Submits the mission's real work, then closes the loop: the work is checked against the
// mission's bar and the result (each condition cleared / not, with where it lives in the
// user's own work) is shown immediately, before the next mission. The user can link to the
// work (Doc / Sheet / Figma / live page), paste it, or both — the link is folded into
// artifact_text. POST /api/submissions {week, artifact_text} -> { ok, check }.
export function CheckinForm({ week }: { week: number }) {
  const router = useRouter()
  const [link, setLink] = useState('')
  const [text, setText] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [err, setErr] = useState('')
  const [check, setCheck] = useState<RepCheck | null>(null)

  const trimmedLink = link.trim()
  const trimmedText = text.trim()
  const artifactText = [trimmedLink ? `Link to the work: ${trimmedLink}` : '', trimmedText]
    .filter(Boolean)
    .join('\n\n')
  const canSubmit = artifactText.length >= 20

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setStatus('submitting')
    setErr('')
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week, artifact_text: artifactText }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Submit failed')
      if (data?.check?.items?.length) {
        setCheck(data.check as RepCheck)
        setStatus('idle')
      } else {
        // No instant check available (e.g. legacy plan without a bar): just advance.
        router.push('/app')
        router.refresh()
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Something went wrong')
      setStatus('error')
    }
  }

  function onContinue() {
    router.push('/app')
    router.refresh()
  }

  // Loop closed: the rep, checked against the bar. Qualitative only — no score, no coaching.
  if (check) {
    const allCleared = check.items.every((it) => it.cleared)
    return (
      <div className="flex flex-col gap-4">
        <div>
          <div className="font-mono text-eyebrow uppercase text-s-accent">Your rep, against the bar</div>
          <h2 className="mt-1 text-h3 text-s-text">{check.quality_label}</h2>
        </div>

        <ul className="flex flex-col gap-2.5">
          {check.items.map((it, i) => (
            <li key={i} className="flex gap-3 rounded-xl border border-s-line bg-s-panel p-3.5">
              <span
                aria-hidden="true"
                className={`mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${
                  it.cleared ? 'bg-s-accent/15 text-s-accent' : 'bg-s-danger/15 text-s-danger'
                }`}
              >
                {it.cleared ? '✓' : '✕'}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-medium text-s-text">{it.condition}</div>
                <div className="mt-0.5 text-[13px] leading-relaxed text-s-text-2">{it.where}</div>
              </div>
            </li>
          ))}
        </ul>

        {!allCleared ? (
          <p className="text-xs text-s-muted">What isn&apos;t cleared yet is exactly what the next reps build.</p>
        ) : null}

        <button
          type="button"
          onClick={onContinue}
          className="inline-flex min-h-11 items-center justify-center self-start rounded-lg bg-s-accent px-5 py-2.5 text-sm font-medium text-s-accent-contrast transition-all duration-200 ease-out hover:-translate-y-px active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-s-accent/40"
        >
          Continue →
        </button>
      </div>
    )
  }

  const wordCount = trimmedText ? trimmedText.split(/\s+/).length : 0
  const submitting = status === 'submitting'

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="mission-link" className="font-mono text-eyebrow uppercase text-s-accent">
          Link to your work
        </label>
        <input
          id="mission-link"
          type="text"
          inputMode="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Google Doc, Sheet, Figma, or a live page — paste the URL"
          className="min-h-11 rounded-lg border border-s-line bg-s-panel px-3 py-2.5 text-sm text-s-text outline-none transition-colors placeholder:text-s-muted/60 hover:border-s-line-strong focus:border-s-accent focus:ring-2 focus:ring-s-accent/20"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="mission-work" className="font-mono text-eyebrow uppercase text-s-accent">
          Or paste it here
        </label>
        <textarea
          id="mission-work"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the real work you did — or a note on what the link contains."
          className="min-h-[160px] resize-y rounded-lg border border-s-line bg-s-panel px-3 py-2.5 text-sm text-s-text outline-none transition-colors placeholder:text-s-muted/60 hover:border-s-line-strong focus:border-s-accent focus:ring-2 focus:ring-s-accent/20"
        />
      </div>

      <div className="flex items-center justify-between">
        {err ? (
          <p role="alert" className="text-[12.5px] text-s-danger">{err}</p>
        ) : (
          <span className="text-[11px] text-s-muted">Your work stays private. A link or a paste — either works.</span>
        )}
        <span className="text-[11px] text-s-muted tabular">
          {wordCount > 0 ? `${wordCount} word${wordCount === 1 ? '' : 's'}` : ''}
        </span>
      </div>

      <button
        type="submit"
        disabled={submitting || !canSubmit}
        aria-busy={submitting || undefined}
        className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg bg-s-accent px-5 py-2.5 text-sm font-medium text-s-accent-contrast transition-all duration-200 ease-out hover:-translate-y-px active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-s-accent/40"
      >
        {submitting ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-90" d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Checking your rep…
          </>
        ) : (
          'Submit mission'
        )}
      </button>
    </form>
  )
}
