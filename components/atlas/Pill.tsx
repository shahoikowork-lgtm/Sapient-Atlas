import type { ReactNode } from 'react'

type Tone = 'neutral' | 'accent' | 'success'

const tones: Record<Tone, string> = {
  neutral: 'border border-s-line bg-s-panel text-s-text-2',
  accent: 'bg-s-accent-tint text-s-accent-strong',
  success: 'border border-s-line bg-s-panel text-s-grow',
}

// Quiet status, word-only. Never a number, never a metric (doctrine: feel understood,
// not analyzed). Surface-aware.
export function Pill({
  tone = 'neutral',
  className = '',
  children,
}: {
  tone?: Tone
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-label ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
