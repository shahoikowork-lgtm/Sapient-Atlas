'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from './Button'
import { Magnetic } from './Magnetic'

// The final CTA, made direct: paste real work right here. On start, the work is carried to
// the diagnosis page (which prefills it) and the visitor lands one step in. Empty is fine,
// it simply opens the diagnosis. Does not touch the diagnosis submit contract.
export function DiagnosisEntry() {
  const router = useRouter()
  const [work, setWork] = useState('')

  function start() {
    const v = work.trim()
    try {
      if (v) sessionStorage.setItem('atlas_work_sample', v)
    } catch {
      // sessionStorage unavailable, proceed; the diagnosis page collects the work itself.
    }
    router.push('/diagnosis')
  }

  return (
    <div className="mx-auto max-w-xl text-left">
      <div className="rounded-2xl border border-s-line bg-s-panel p-4 shadow-s transition-colors focus-within:border-s-accent/50">
        <label htmlFor="home-work" className="font-mono text-eyebrow uppercase tracking-[0.14em] text-s-accent">
          Paste real work
        </label>
        <textarea
          id="home-work"
          value={work}
          onChange={(e) => setWork(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') start()
          }}
          placeholder="A campaign, a brief, a landing page, an analysis, a strategy doc."
          className="mt-2.5 min-h-[120px] w-full resize-y rounded-lg border border-s-line bg-s-bg px-3 py-2.5 font-mono text-[13px] leading-relaxed text-s-text outline-none transition-colors placeholder:text-s-muted/60 hover:border-s-line-strong focus:border-s-accent focus:ring-2 focus:ring-s-accent/20"
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Magnetic>
          <Button type="button" size="lg" onClick={start}>
            Get your free diagnosis
          </Button>
        </Magnetic>
        <span className="text-label text-s-muted">Free. No account.</span>
      </div>
    </div>
  )
}
