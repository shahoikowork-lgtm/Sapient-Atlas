import type { ComponentProps } from 'react'

// Mono, uppercase, tracked label. Indigo by default; pass text-muted to mute.
export function Eyebrow({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={`font-mono text-[11px] uppercase tracking-[0.16em] text-accent ${className}`}
      {...props}
    />
  )
}
