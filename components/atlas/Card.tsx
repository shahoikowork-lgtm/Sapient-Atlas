import type { ComponentProps } from 'react'

type Tone = 'surface' | 'sunken'

const tones: Record<Tone, string> = {
  surface: 'bg-s-panel',
  sunken: 'bg-s-sunken',
}

// Hairline card, surface-aware. Calm radius, no shadow by default.
export function Card({
  tone = 'surface',
  interactive = false,
  className = '',
  ...props
}: { tone?: Tone; interactive?: boolean } & ComponentProps<'div'>) {
  const hover = interactive
    ? 'transition-all duration-200 ease-out hover:border-s-line-strong hover:shadow-s'
    : ''
  return (
    <div
      className={`rounded-2xl border border-s-line ${tones[tone]} p-6 ${hover} ${className}`}
      {...props}
    />
  )
}
