import type { ReactNode } from 'react'

// Indigo-tint band for the trust message. Pages compose the content.
export function TrustStrip({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-accent-tint px-6 py-6 ${className}`}>{children}</div>
  )
}
