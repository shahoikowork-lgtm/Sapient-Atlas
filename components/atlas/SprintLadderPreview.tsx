'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { M1_LADDER, PHASES } from '@/lib/ladder'

// The Sprint as a rising arc, not a syllabus. Four phases; the bar tightens across them,
// ending at reality. Heights and bar phrases are presentation only, the ladder's content
// and logic live in lib/ladder.ts and are not duplicated here. Renders in the dark
// instrument register (inside FocalSection). The scroll trigger lives on the stable parent
// grid (never collapsed) so the bars, which start at scaleY 0, reliably animate into view.
const EASE = [0.22, 1, 0.36, 1] as const

const PHASE_COPY: Record<(typeof PHASES)[number], { move: string; bar: string }> = {
  SEE: { move: 'See the failure on your own work', bar: 'Distinct from the obvious claim' },
  CROSS: { move: 'Clear the bar once, with help', bar: 'Distinct, and false of three rivals' },
  INDEPENDENCE: { move: 'Clear it again, unaided, on harder work', bar: 'Provable on fresh work, no help' },
  PROVE: { move: 'One real claim, out in the world', bar: 'A prospect repeats it back' },
}

const HEIGHTS = ['28%', '52%', '76%', '100%']

export function SprintLadderPreview() {
  const reduce = useReducedMotion()

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.12, delayChildren: reduce ? 0 : 0.05 } },
  }
  const barV: Variants = reduce
    ? { hidden: { scaleY: 1 }, show: { scaleY: 1 } }
    : { hidden: { scaleY: 0 }, show: { scaleY: 1, transition: { duration: 0.5, ease: EASE } } }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-4 sm:gap-x-4"
    >
      {PHASES.map((phase, i) => {
        const count = M1_LADDER.filter((m) => m.phase === phase).length
        const last = i === PHASES.length - 1
        const c = PHASE_COPY[phase]
        return (
          <div key={phase} className="flex flex-col">
            {/* the rising bar: the standard, tightening across the arc */}
            <div className="relative mb-4 h-20 w-full">
              <div className="absolute inset-x-0 bottom-0 h-px bg-s-line" />
              <motion.div
                variants={barV}
                style={{ height: HEIGHTS[i], transformOrigin: 'bottom' }}
                className={`absolute inset-x-0 bottom-0 rounded-t ${last ? 'bg-s-accent' : 'bg-s-line-strong'}`}
              />
              <span className="absolute left-0 top-0 font-mono text-[11px] text-s-muted tabular">0{i + 1}</span>
            </div>

            {/* the phase */}
            <div className="font-mono text-eyebrow uppercase tracking-[0.14em] text-s-text">{phase}</div>
            <p className="mt-1.5 text-sm text-s-text-2">{c.move}</p>

            <div className="mt-3 border-t border-s-line pt-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-s-muted">The bar</div>
              <p className="mt-0.5 text-[12.5px] leading-snug text-s-text">{c.bar}</p>
            </div>

            <div className="mt-2 font-mono text-[11px] text-s-muted tabular">
              {count} mission{count === 1 ? '' : 's'}
            </div>
          </div>
        )
      })}
    </motion.div>
  )
}
