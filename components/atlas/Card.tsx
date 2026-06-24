import type { ComponentProps } from 'react'

type Tone = 'surface' | 'sunken'

const tones: Record<Tone, string> = {
  surface: 'bg-s-panel',
  sunken: 'bg-s-sunken',
}

// Surface-aware card. Calm radius, gentle layered depth; interactive cards lift on hover.
export function Card({
  tone = 'surface',
  interactive = false,
  className = '',
  ...props
}: { tone?: Tone; interactive?: boolean } & ComponentProps<'div'>) {
  const hover = interactive
    ? 'transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-s-line-strong hover:shadow-lifted'
    : ''
  return (
    <div
      className={`rounded-2xl border border-s-line ${tones[tone]} p-6 shadow-s ${hover} ${className}`}
      {...props}
    />
  )
}
