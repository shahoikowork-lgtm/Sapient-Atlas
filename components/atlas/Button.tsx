import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

// Visual primitive. Warm-paper + deep-indigo system. No external UI deps.
type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'md' | 'lg'

const base =
  'inline-flex items-center justify-center rounded-lg font-medium transition disabled:opacity-60 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-deep',
  secondary: 'border border-hairline bg-surface text-ink hover:bg-paper',
  ghost: 'text-accent hover:text-accent-deep',
}

const sizes: Record<Size, string> = {
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-sm',
}

export function buttonClasses(variant: Variant = 'primary', size: Size = 'md', className = '') {
  return [base, variants[variant], sizes[size], className].join(' ')
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: { variant?: Variant; size?: Size } & ComponentProps<'button'>) {
  return <button className={buttonClasses(variant, size, className)} {...props} />
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: { variant?: Variant; size?: Size; children: ReactNode } & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props}>
      {children}
    </Link>
  )
}
