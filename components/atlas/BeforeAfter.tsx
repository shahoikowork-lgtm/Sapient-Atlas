'use client'

import { motion, useReducedMotion } from 'framer-motion'

// Proof made literal: the same work, before and after. "Before" is present and muted; "after"
// resolves sharp as it enters view. Illustrative of the mechanic (labeled on the page).
export function BeforeAfter({
  before,
  after,
  claim,
}: {
  before: string
  after: string
  claim: string
}) {
  const reduce = useReducedMotion()
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <figure className="rounded-2xl border border-s-line bg-s-panel p-5 opacity-70">
        <figcaption className="font-mono text-eyebrow uppercase text-s-muted">Before</figcaption>
        <blockquote className="mt-3 font-serif text-evidence text-s-text-2">“{before}”</blockquote>
      </figure>
      <motion.figure
        initial={reduce ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl border border-s-accent/40 bg-s-panel p-5 shadow-s"
      >
        <figcaption className="font-mono text-eyebrow uppercase text-s-accent">After</figcaption>
        <blockquote className="mt-3 border-l-2 border-s-accent pl-4 font-serif text-evidence text-s-text">
          “{after}”
        </blockquote>
        <p className="mt-3 text-label text-s-muted">{claim}</p>
      </motion.figure>
    </div>
  )
}
