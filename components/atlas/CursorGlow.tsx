'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'

// A soft accent light that trails the cursor across a dark instrument surface — "alive
// under your hand." Listens on its parent section, renders a translate-only glow (no
// per-frame repaint), behind content, never interactive. Mouse + motion only.
export function CursorGlow() {
  const reduce = useReducedMotion()
  const wrapRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(-9999)
  const y = useMotionValue(-9999)
  const sx = useSpring(x, { stiffness: 120, damping: 26, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 120, damping: 26, mass: 0.6 })

  useEffect(() => {
    if (reduce) return
    const parent = wrapRef.current?.parentElement
    if (!parent) return
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const r = parent.getBoundingClientRect()
      x.set(e.clientX - r.left)
      y.set(e.clientY - r.top)
    }
    const onLeave = () => {
      x.set(-9999)
      y.set(-9999)
    }
    parent.addEventListener('pointermove', onMove)
    parent.addEventListener('pointerleave', onLeave)
    return () => {
      parent.removeEventListener('pointermove', onMove)
      parent.removeEventListener('pointerleave', onLeave)
    }
  }, [reduce, x, y])

  if (reduce) return null

  return (
    <div ref={wrapRef} aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <motion.div
        className="absolute h-[480px] w-[480px] rounded-full"
        style={{
          x: sx,
          y: sy,
          left: -240,
          top: -240,
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--color-s-accent) 13%, transparent), transparent 65%)',
        }}
      />
    </div>
  )
}
