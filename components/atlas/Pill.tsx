import type { ReactNode } from 'react'

type Tone = 'neutral' | 'accent' | 'success'

const tones: Record<Tone, string> = {
  neutral: 'border border-hairline bg-surface text-text-secondary',
  accent: 'bg-accent-tint text-accent-deep',
  success: 'bg-accent-tint text-grow',
}

// Quiet status, word-only. Never a number, never a metric (doctrine: feel understood,
// not analyzed). Replaces clinical "Confidence: high" chips.
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
