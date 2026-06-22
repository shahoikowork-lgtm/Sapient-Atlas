import type { ComponentProps } from 'react'

type Size = 'sm' | 'md' | 'lg'
type Width = 'reading' | 'product' | 'page'

const sizes: Record<Size, string> = {
  sm: 'py-16 sm:py-20',
  md: 'py-20 sm:py-28',
  lg: 'py-24 sm:py-40',
}

const widths: Record<Width, string> = {
  reading: 'max-w-2xl', // ~672px prose column
  product: 'max-w-5xl', // ~1040px demonstration / interface
  page: 'max-w-6xl', // ~1152px nav / footer
}

// Full-bleed band with a centered column and a vertical-rhythm tier. Put a background
// utility (e.g. bg-surface) on the section to create alternating bands.
export function Section({
  size = 'md',
  width = 'reading',
  className = '',
  children,
  ...props
}: { size?: Size; width?: Width } & ComponentProps<'section'>) {
  return (
    <section className={`px-6 ${sizes[size]} ${className}`} {...props}>
      <div className={`mx-auto w-full ${widths[width]}`}>{children}</div>
    </section>
  )
}
