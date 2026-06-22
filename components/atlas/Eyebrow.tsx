import type { ComponentProps } from 'react'

// Mono, uppercase, tracked label (the "label voice"). Indigo by default; pass
// text-muted to mute. Metadata only — never prose.
export function Eyebrow({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={`font-mono text-eyebrow uppercase text-accent ${className}`}
      {...props}
    />
  )
}
