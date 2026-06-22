'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

// Restrained scroll reveal: a short fade with an 8px rise, played once when the
// element scrolls into view. This is the only entrance motion in the product, kept
// deliberately quiet (Stripe/Linear register, not a "motion showcase"). When the
// user prefers reduced motion, it renders its children with no animation at all.
//
// Composes from Server Components: `children` is a serializable RSC payload, so a
// server-rendered section can be wrapped in <Reveal> without becoming a Client
// Component itself.
export function Reveal({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: ReactNode
  /** Small stagger, in seconds. Keep within ~0–0.2 for restraint. */
  delay?: number
  className?: string
  /** Element to render. Defaults to a div. */
  as?: 'div' | 'section' | 'li'
}) {
  const reduce = useReducedMotion()
  const MotionTag = motion[as]

  if (reduce) {
    const Tag = as
    return <Tag className={className}>{children}</Tag>
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  )
}
