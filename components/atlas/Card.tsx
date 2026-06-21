import type { ComponentProps } from 'react'

// Hairline card on a warm surface. No shadow, calm radius.
export function Card({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div className={`rounded-2xl border border-hairline bg-surface p-6 ${className}`} {...props} />
  )
}
