import type { ComponentProps } from 'react'

// A full-bleed band that drops the warm-paper marketing page into the dark instrument
// register for one deliberate moment (the homepage honesty climax). Adds `.instrument`
// so shared components inside it render in the dark vocabulary, and paints the canvas.
export function FocalSection({ className = '', children, ...props }: ComponentProps<'section'>) {
  return (
    <section className={`instrument bg-s-bg text-s-text ${className}`} {...props}>
      {children}
    </section>
  )
}
