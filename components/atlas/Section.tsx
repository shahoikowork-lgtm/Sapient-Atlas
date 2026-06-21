import type { ComponentProps } from 'react'

// Full-bleed section band with a centered reading column and vertical rhythm.
// Put a background utility (e.g. bg-surface) on the section to create alternating bands.
export function Section({ className = '', children, ...props }: ComponentProps<'section'>) {
  return (
    <section className={`px-6 py-16 sm:py-20 ${className}`} {...props}>
      <div className="mx-auto w-full max-w-2xl">{children}</div>
    </section>
  )
}
