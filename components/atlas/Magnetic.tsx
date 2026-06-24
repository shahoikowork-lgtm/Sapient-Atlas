'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

// Wraps a primary CTA so it drifts a few pixels toward the cursor within a small radius —
// a magnetic pull that makes the one action on the page feel responsive and expensive. The
// button keeps its own press/hover. Mouse only; touch and reduced motion render inert.
export function Magnetic({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 150, damping: 15, mass: 0.3 })
  const sy = useSpring(y, { stiffness: 150, damping: 15, mass: 0.3 })

  if (reduce) return <span className={className}>{children}</span>

  function onMove(e: React.PointerEvent) {
    if (e.pointerType !== 'mouse') return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    const max = 8
    x.set(Math.max(-max, Math.min(max, dx * 0.35)))
    y.set(Math.max(-max, Math.min(max, dy * 0.35)))
  }

  function reset() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.span
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ x: sx, y: sy, display: 'inline-block' }}
      className={className}
    >
      {children}
    </motion.span>
  )
}
