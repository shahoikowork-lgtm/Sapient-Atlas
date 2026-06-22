'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

// The designed wait. Not a spinner: a calm sequence that shows the experience of the
// work being read and the field of considerations narrowing to one. Honest about the
// ~20s. Shows the experience, never the mechanism (no AI / models / pipeline talk).
// Renders inside the dark instrument register on the diagnosis surface.

const PHASES = [
  'Reading your work…',
  'Looking for what’s already strong…',
  'Finding the one thing holding it back…',
  'Putting your read together…',
]

// The "considerations narrowing to one" composition.
const BARS = [0, 1, 2, 3, 4]

export function AnalysisState() {
  const reduce = useReducedMotion()
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setPhase((p) => (p + 1) % PHASES.length), 3200)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="font-mono text-eyebrow uppercase text-s-accent">Your diagnosis</div>

      <div className="mt-8 flex w-full max-w-xs flex-col gap-2.5" aria-hidden="true">
        {BARS.map((i) => {
          const isFocus = i === 2
          if (reduce) {
            return (
              <div
                key={i}
                className={`h-2.5 rounded-full ${isFocus ? 'bg-s-accent' : 'bg-s-line'}`}
                style={{ width: isFocus ? '100%' : `${60 + i * 6}%` }}
              />
            )
          }
          return (
            <motion.div
              key={i}
              className={`h-2.5 rounded-full ${isFocus ? 'bg-s-accent' : 'bg-s-line'}`}
              initial={{ opacity: 0.35, width: `${55 + i * 7}%` }}
              animate={isFocus ? { opacity: 1, width: '100%' } : { opacity: [0.5, 0.25, 0.5] }}
              transition={
                isFocus
                  ? { duration: 1.6, ease: [0.22, 1, 0.36, 1] }
                  : { duration: 2.4, repeat: Infinity, delay: i * 0.2 }
              }
            />
          )
        })}
      </div>

      <p className="mt-8 text-body-lg text-s-text" aria-live="polite">
        {PHASES[phase]}
      </p>
      <p className="mt-2 text-label text-s-muted">This takes about 20 seconds. Your work stays private.</p>
    </div>
  )
}
