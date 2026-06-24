import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

// Visual primitive. Surface-aware (paper + instrument); no external UI deps.
type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'md' | 'lg'

// Restrained micro-interaction: a near-imperceptible lift on hover, a settle on press.
// Duration-scoped, so the global prefers-reduced-motion guard neutralizes it on opt-out.
const base =
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 ease-out will-change-transform hover:-translate-y-px active:translate-y-0 active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-s-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-s-bg'

const variants: Record<Variant, string> = {
  primary: 'bg-s-accent text-s-accent-contrast hover:bg-s-accent-strong shadow-btn hover:shadow-btn-hover',
  secondary: 'border border-s-line bg-s-panel text-s-text shadow-btn hover:bg-s-sunken hover:border-s-line-strong hover:shadow-btn-hover',
  ghost: 'text-s-accent hover:text-s-accent-strong hover:translate-y-0',
}

const sizes: Record<Size, string> = {
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-sm min-h-11',
}

export function buttonClasses(variant: Variant = 'primary', size: Size = 'md', className = '') {
  return [base, variants[variant], sizes[size], className].join(' ')
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-90" d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}: { variant?: Variant; size?: Size; loading?: boolean } & ComponentProps<'button'>) {
  return (
    <button
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <Spinner />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  )
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
