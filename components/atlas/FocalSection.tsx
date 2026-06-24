import type { ComponentProps } from 'react'
import { CursorGlow } from './CursorGlow'

// A full-bleed band that drops the warm-paper marketing page into the dark instrument
// register for one deliberate moment (the homepage Sprint climax). Adds `.instrument` so
// shared components inside it render in the dark vocabulary, plus an ambient cursor glow.
export function FocalSection({ className = '', children, ...props }: ComponentProps<'section'>) {
  return (
    <section className={`instrument relative overflow-hidden bg-s-bg text-s-text ${className}`} {...props}>
      <CursorGlow />
      <div className="relative z-10">{children}</div>
    </section>
  )
}
