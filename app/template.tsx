'use client'

import { usePathname } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

// The threshold. Crossing from the warm marketing world into the dark "instrument"
// (diagnosis / app / results) is the moment Atlas becomes a place you enter, not a page
// you read — so those routes fade up on arrival. Marketing routes render instantly (no
// transition) so the homepage lands crisp. Opacity only, so no transform is left on the
// wrapper to break the sticky headers underneath. Reduced motion → no transition.
const isInstrument = (p: string) =>
  p.startsWith('/diagnosis') ||
  p.startsWith('/app') ||
  p.startsWith('/results') ||
  p.startsWith('/upgrade')

export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const reduce = useReducedMotion()

  if (reduce || !isInstrument(pathname)) return <>{children}</>

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
