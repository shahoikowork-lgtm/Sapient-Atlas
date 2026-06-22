'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { ArtifactPreview } from './ArtifactPreview'
import { Evidence } from './Evidence'
import { ConstraintCard } from './ConstraintCard'

// The one signature motion on the marketing page: a read happening, in sequence. An
// illustrative artifact, one line lifted out as evidence, then the single constraint
// named. Revealed once when scrolled into view. The content is an illustration of the
// mechanic (labeled as such by the page), never a fabricated user or testimonial.

const ARTIFACT = [
  'The all-in-one platform for modern teams.',
  'Powerful, intuitive, and built to scale.',
  'Trusted by fast-moving companies everywhere.',
]

export function Demonstration() {
  const reduce = useReducedMotion()

  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduce ? 0 : 0.55, delayChildren: reduce ? 0 : 0.15 },
    },
  }
  const item: Variants = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
      }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      className="flex flex-col gap-4"
    >
      <motion.div variants={item}>
        <ArtifactPreview kind="Landing page · draft" lines={ARTIFACT} highlightIndex={1} />
      </motion.div>

      <motion.div variants={item} className="flex items-center gap-3 px-1" aria-hidden="true">
        <span className="font-mono text-eyebrow uppercase text-s-muted">Reading</span>
        <span className="h-px flex-1 bg-s-line" />
      </motion.div>

      <motion.div variants={item}>
        <Evidence quote="Powerful, intuitive, and built to scale." source="from the submitted work" />
      </motion.div>

      <motion.div variants={item}>
        <ConstraintCard
          eyebrow="The one thing holding it back"
          title="Generic positioning"
          detail="This line is true of three competitors too. A prospect can’t tell why you."
          tone="highlight"
        />
      </motion.div>
    </motion.div>
  )
}
