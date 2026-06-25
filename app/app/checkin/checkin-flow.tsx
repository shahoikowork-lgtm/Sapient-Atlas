'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type RepCheck = {
  quality_label: string
  items: { condition: string; cleared: boolean; where: string }[]
}

// The guided move: one small step at a time, never a wall of text. Walk the user through the
// move's steps (one screen each), collect their real work, submit, then show the bar-check —
// the win. Same substance as the old single-form check-in (the work and the bar are
// unchanged); only the delivery is broken into bite-sized screens so it never reads like
// homework. The artifact sent to the API is the link + each step's work, joined.
export function CheckinFlow({
  week,
  phase,
  n,
  total,
  title,
  task,
  steps,
  successCriteria,
  example,
  barConditions = [],
}: {
  week: number
  phase: string
  n: number
  total: number
  title: string
  task: string
  steps: string[]
  successCriteria: string
  example?: { before: string; after: string }
  barConditions?: string[]
}) {
  const router = useRouter()
  const [screen, setScreen] = useState(0) // 0 = intro · 1..steps.length = steps · > steps.length = submit
  const [inputs, setInputs] = useState<string[]>(() => steps.map(() => ''))
  const [link, setLink] = useState('')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [err, setErr] = useState('')
  const [check, setCheck] = useState<RepCheck | null>(null)

  const totalSteps = steps.length
  const onSubmitScreen = screen > totalSteps

  function setInput(i: number, v: string) {
    setInputs((prev) => prev.map((x, idx) => (idx === i ? v : x)))
  }

  const artifactText = [
    link.trim() ? `Link to the work: ${link.trim()}` : '',
    ...steps.map((s, i) => (inputs[i].trim() ? `${s}\n${inputs[i].trim()}` : '')),
    note.trim(),
  ]
    .filter(Boolean)
    .join('\n\n')
  const canSubmit = artifactText.length >= 20

  // Preview: check the work against the bar but persist NOTHING, so the user can tighten and
  // re-check as many times as they want before locking it in. Never burns the one submission.
  async function previewCheck() {
    if (!canSubmit) return
    setStatus('submitting')
    setErr('')
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week, artifact_text: artifactText, preview: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Check failed')
      if (data?.check?.items?.length) {
        setCheck(data.check as RepCheck)
        setStatus('idle')
      } else {
        await finalSubmit() // nothing to check against; just lock it in
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Something went wrong')
      setStatus('error')
    }
  }

  // Lock it in: the real submission (persists + runs the gated weekly note), then advance.
  async function finalSubmit() {
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
      router.push('/app')
      router.refresh()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Something went wrong')
      setStatus('error')
    }
  }

  const accentBtn =
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-s-accent px-5 py-2.5 text-sm font-medium text-s-accent-contrast transition-all duration-200 ease-out hover:-translate-y-px active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0'
  const ghostBtn =
    'inline-flex min-h-11 items-center rounded-lg border border-s-line px-4 py-2.5 text-sm font-medium text-s-text-2 transition-colors hover:border-s-line-strong hover:text-s-text'
  const inputCls =
    'rounded-lg border border-s-line bg-s-panel px-3 py-2.5 text-sm text-s-text outline-none transition-colors placeholder:text-s-muted/60 hover:border-s-line-strong focus:border-s-accent focus:ring-2 focus:ring-s-accent/20'

  // ── Win: the bar-check ──────────────────────────────────────────────────────────
  if (check) {
    const allCleared = check.items.every((it) => it.cleared)
    return (
      <div className="flex flex-col gap-4">
        <div>
          <div className="font-mono text-eyebrow uppercase text-s-accent">Your move, against the bar</div>
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
        {allCleared ? (
          <p className="text-xs text-s-muted">That line is yours now. A competitor can&apos;t claim it.</p>
        ) : (
          <p className="text-xs text-s-muted">Free rep, no penalty. What isn&apos;t yours yet is right there, fix it and go again.</p>
        )}
        <div className="flex items-center gap-3">
          {!allCleared ? (
            <button type="button" onClick={() => setCheck(null)} className={accentBtn}>
              Tighten it →
            </button>
          ) : null}
          <button
            type="button"
            onClick={finalSubmit}
            disabled={status === 'submitting'}
            className={allCleared ? accentBtn : ghostBtn}
          >
            {status === 'submitting' ? 'Saving…' : allCleared ? 'Lock it in →' : 'Submit anyway'}
          </button>
        </div>
        {err ? <p role="alert" className="text-[12.5px] text-s-danger">{err}</p> : null}
      </div>
    )
  }

  const progress = (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {Array.from({ length: totalSteps + 1 }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 flex-1 rounded-full ${i < screen ? 'bg-s-accent' : i === screen ? 'bg-s-accent/50' : 'bg-s-line'}`}
        />
      ))}
    </div>
  )

  // ── Intro ───────────────────────────────────────────────────────────────────────
  if (screen === 0) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-eyebrow uppercase text-s-accent">{phase}</span>
          <span className="font-mono text-eyebrow uppercase text-s-muted tabular">
            Move {n} of {total} · ~10 min
          </span>
        </div>
        <h1 className="text-h2 text-s-text">{title}</h1>
        <p className="text-label text-s-muted">Step {n} toward a buyer saying &ldquo;why you.&rdquo;</p>
        {task ? <p className="text-body text-s-text-2">{task}</p> : null}
        {example ? (
          <div className="rounded-xl border border-s-line bg-s-panel p-4">
            <div className="font-mono text-eyebrow uppercase text-s-muted">What good looks like</div>
            <p className="mt-2 text-[13.5px] leading-relaxed text-s-muted line-through decoration-s-muted/40">{example.before}</p>
            <p className="mt-1.5 text-body text-s-text">{example.after}</p>
          </div>
        ) : null}
        <button type="button" onClick={() => setScreen(1)} className={`${accentBtn} self-start`}>
          Let&apos;s go →
        </button>
      </div>
    )
  }

  // ── One step at a time ────────────────────────────────────────────────────────────
  if (!onSubmitScreen) {
    const i = screen - 1
    return (
      <div className="flex flex-col gap-5">
        {progress}
        <div>
          <div className="font-mono text-eyebrow uppercase text-s-muted">Step {screen} of {totalSteps}</div>
          <p className="mt-2 text-h3 text-s-text">{steps[i]}</p>
        </div>
        <textarea
          value={inputs[i]}
          onChange={(e) => setInput(i, e.target.value)}
          placeholder="Do it here — paste or type your work for this step."
          className={`min-h-[120px] resize-y ${inputCls}`}
        />
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setScreen((s) => s - 1)} className={ghostBtn}>
            ← Back
          </button>
          <button type="button" onClick={() => setScreen((s) => s + 1)} className={accentBtn}>
            {screen === totalSteps ? 'Last step →' : 'Next →'}
          </button>
        </div>
      </div>
    )
  }

  // ── Submit ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">
      {progress}
      {successCriteria ? (
        <div className="rounded-xl border border-s-line bg-s-panel p-4">
          <div className="font-mono text-eyebrow uppercase text-s-accent">Beat the bar</div>
          <p className="mt-1 text-body text-s-text">{successCriteria}</p>
        </div>
      ) : null}

      {barConditions.length > 0 ? (
        <div>
          <div className="font-mono text-eyebrow uppercase text-s-muted">Run it past the bar</div>
          <ul className="mt-2 flex flex-col gap-2">
            {barConditions.map((c, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-s-text-2">
                <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <label htmlFor="flow-link" className="font-mono text-eyebrow uppercase text-s-accent">
          Link to your work (optional)
        </label>
        <input
          id="flow-link"
          type="text"
          inputMode="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Google Doc, Sheet, Figma, or a live page"
          className={`min-h-11 ${inputCls}`}
        />
      </div>

      {totalSteps === 0 ? (
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Paste the real work you did."
          className={`min-h-[140px] resize-y ${inputCls}`}
        />
      ) : null}

      {err ? (
        <p role="alert" className="text-[12.5px] text-s-danger">{err}</p>
      ) : (
        <span className="text-[11px] text-s-muted">Your work stays private.</span>
      )}

      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setScreen((s) => s - 1)} className={ghostBtn}>
          ← Back
        </button>
        <button
          type="button"
          onClick={previewCheck}
          disabled={status === 'submitting' || !canSubmit}
          aria-busy={status === 'submitting' || undefined}
          className={accentBtn}
        >
          {status === 'submitting' ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-90" d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Checking…
            </>
          ) : (
            'Check it →'
          )}
        </button>
      </div>
    </div>
  )
}
