'use client'

import { useState } from 'react'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { ArtifactPreview } from './ArtifactPreview'
import { Evidence } from './Evidence'
import { ConstraintCard } from './ConstraintCard'
import type { ReadDemo } from './ReadStage'

// The scroll-pinned demonstration: one artifact stays in view while three narrated steps
// scroll past, each driving one transformation — read → find (evidence) → name (constraint).
// Spatial continuity, not a slideshow. Step changes on scroll-into-view (robust, no scroll
// math); reduced-motion still works (the stage simply reflects the active step).

const STEPS = [
  { title: 'It reads your real work', body: 'Not a quiz, not a form. The actual campaign, brief, or page you already produced.' },
  { title: 'It finds what’s holding it back', body: 'It surfaces the line that gives you away, and shows you the evidence in your own words.' },
  { title: 'It names the one move', body: 'The single change that shifts the most. One constraint, with the reason it matters.' },
]

export function ScrollStage({ demo }: { demo: ReadDemo }) {
  const reduce = useReducedMotion()
  const [active, setActive] = useState(0)

  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-16">
      {/* Visual stage — pinned while the steps scroll */}
      <div className="order-1 md:order-2">
        <div className="sticky top-24">
          <ArtifactPreview
            kind={demo.kind}
            lines={demo.lines}
            highlightIndex={active >= 1 ? demo.highlightIndex : undefined}
          />
          <div className="mt-4 min-h-[160px]">
            <AnimatePresence mode="wait">
              {active >= 1 ? (
                <motion.div
                  key={active}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col gap-4"
                >
                  <Evidence quote={demo.quote} source={demo.source} />
                  {active >= 2 ? (
                    <ConstraintCard
                      eyebrow="The one thing holding it back"
                      title={demo.constraintTitle}
                      detail={demo.constraintDetail}
                      tone="highlight"
                    />
                  ) : null}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Steps — tall blocks that drive the active step */}
      <div className="order-2 flex flex-col md:order-1">
        {STEPS.map((s, i) => (
          <motion.div
            key={i}
            onViewportEnter={() => setActive(i)}
            viewport={{ amount: 0.6, margin: '0px 0px -30% 0px' }}
            className="flex min-h-[64vh] flex-col justify-center"
          >
            <div className="font-mono text-eyebrow uppercase text-s-muted">Step {i + 1}</div>
            <h3 className={`mt-2 text-h2 transition-opacity duration-300 ${active === i ? 'text-s-text' : 'text-s-muted'}`}>
              {s.title}
            </h3>
            <p className="mt-3 max-w-[42ch] text-body-lg text-s-text-2">{s.body}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
