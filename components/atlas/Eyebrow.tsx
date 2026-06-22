import type { ComponentProps } from 'react'

// Mono, uppercase, tracked label (the "label voice"). Surface-aware: accent by default,
// muted via tone="muted". Metadata only, never prose.
export function Eyebrow({
  tone = 'accent',
  className = '',
  ...props
}: { tone?: 'accent' | 'muted' } & ComponentProps<'div'>) {
  const color = tone === 'muted' ? 'text-s-muted' : 'text-s-accent'
  return <div className={`font-mono text-eyebrow uppercase ${color} ${className}`} {...props} />
}
