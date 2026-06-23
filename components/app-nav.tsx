'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

// NOW · PATH · PROOF · YOU. Desktop = slim left rail; mobile = bottom tab bar. One active
// state, calm. (Check-in lives inside a mission, so it maps to PATH, not its own item.)
type Item = { href: string; label: string; match: (p: string) => boolean; icon: ReactNode }

const I = {
  now: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="2.5" /></svg>
  ),
  path: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 6h14M5 12h14M5 18h14" /><circle cx="3" cy="6" r="1" fill="currentColor" stroke="none" /><circle cx="3" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="3" cy="18" r="1" fill="currentColor" stroke="none" /></svg>
  ),
  proof: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" /></svg>
  ),
  you: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" /></svg>
  ),
}

const ITEMS: Item[] = [
  { href: '/app', label: 'Now', match: (p) => p === '/app', icon: I.now },
  { href: '/app/move', label: 'Path', match: (p) => p.startsWith('/app/move') || p.startsWith('/app/checkin'), icon: I.path },
  { href: '/app/progress', label: 'Proof', match: (p) => p.startsWith('/app/progress') || p.startsWith('/app/rerating'), icon: I.proof },
  { href: '/app/settings', label: 'You', match: (p) => p.startsWith('/app/settings'), icon: I.you },
]

export function AppNav({ email }: { email?: string | null }) {
  const pathname = usePathname() || '/app'

  return (
    <>
      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[200px] flex-col border-r border-s-line bg-s-bg px-3 py-5 md:flex">
        <Link href="/app" className="px-2 text-sm font-semibold tracking-tight text-s-text">
          Sapient Atlas
        </Link>
        <nav className="mt-6 flex flex-col gap-1">
          {ITEMS.map((it) => {
            const on = it.match(pathname)
            return (
              <Link
                key={it.href}
                href={it.href}
                aria-current={on ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  on ? 'bg-s-panel text-s-text' : 'text-s-muted hover:text-s-text hover:bg-s-panel/60'
                }`}
              >
                {it.icon}
                {it.label}
              </Link>
            )
          })}
        </nav>
        {email ? <div className="mt-auto truncate px-3 text-[11px] text-s-muted">{email}</div> : null}
      </aside>

      {/* Mobile bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-s-line bg-s-bg/95 backdrop-blur md:hidden">
        {ITEMS.map((it) => {
          const on = it.match(pathname)
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-current={on ? 'page' : undefined}
              className={`flex min-h-[56px] flex-col items-center justify-center gap-1 text-[11px] ${
                on ? 'text-s-accent' : 'text-s-muted'
              }`}
            >
              {it.icon}
              {it.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
