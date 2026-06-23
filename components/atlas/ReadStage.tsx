'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { ArtifactPreview } from './ArtifactPreview'
import { Evidence } from './Evidence'
import { ConstraintCard } from './ConstraintCard'

// The hero demonstration: a real piece of work being read, in sequence, on load. The
// visitor watches Atlas think before reading a claim. Plays once; reduced-motion shows the
// resolved end-state. Content is illustrative of the mechanic (labeled on the page), never a
// fabricated user or testimonial.
export type ReadDemo = {
  kind: string
  lines: string[]
  highlightIndex: number
  quote: string
  source: string
  constraintTitle: string
  constraintDetail: string
}

export function ReadStage({ demo }: { demo: ReadDemo }) {
  const reduce = useReducedMotion()

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.5, delayChildren: reduce ? 0 : 0.25 } },
  }
  const item: Variants = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
      }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-4">
      <motion.div variants={item}>
        <ArtifactPreview kind={demo.kind} lines={demo.lines} highlightIndex={demo.highlightIndex} />
      </motion.div>

      <motion.div variants={item} className="flex items-center gap-3 px-1" aria-hidden="true">
        <span className="font-mono text-eyebrow uppercase text-s-muted">Reading</span>
        <span className="h-px flex-1 bg-s-line" />
      </motion.div>

      <motion.div variants={item}>
        <Evidence quote={demo.quote} source={demo.source} />
      </motion.div>

      <motion.div variants={item}>
        <ConstraintCard
          eyebrow="The one thing holding it back"
          title={demo.constraintTitle}
          detail={demo.constraintDetail}
          tone="highlight"
        />
      </motion.div>
    </motion.div>
  )
}
