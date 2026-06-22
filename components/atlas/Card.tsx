import type { ComponentProps } from 'react'

type Tone = 'surface' | 'sunken'

const tones: Record<Tone, string> = {
  surface: 'bg-surface',
  sunken: 'bg-surface-sunken',
}

// Hairline card on a warm surface. Calm radius, no shadow by default.
export function Card({
  tone = 'surface',
  interactive = false,
  className = '',
  ...props
}: { tone?: Tone; interactive?: boolean } & ComponentProps<'div'>) {
  const hover = interactive
    ? 'transition-all duration-200 ease-out hover:border-hairline-strong hover:shadow-raised'
    : ''
  return (
    <div
      className={`rounded-2xl border border-hairline ${tones[tone]} p-6 ${hover} ${className}`}
      {...props}
    />
  )
}
