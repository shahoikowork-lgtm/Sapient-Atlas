'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'

// A single large idea that lands in clauses as it enters view. Split the sentence on the
// `|` marker; each segment fades up in sequence. Reduced-motion renders it whole.
export function ClauseReveal({
  text,
  className = '',
}: {
  text: string // clauses separated by " | "
  className?: string
}) {
  const reduce = useReducedMotion()
  const clauses = text.split('|').map((c) => c.trim())

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.18 } },
  }
  const item: Variants = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
      }

  return (
    <motion.p
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
      className={className}
    >
      {clauses.map((c, i) => (
        <motion.span key={i} variants={item} className="inline">
          {c}
          {i < clauses.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </motion.p>
  )
}
