'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ButtonLink } from './Button'

// Sticky top bar: transparent over the hero, gaining a hairline + blur once the page scrolls
// past the fold. Wordmark and account link use the animated underline. No session read, so
// the marketing pages stay statically rendered. Surface-aware (defaults to paper).
export function Nav({
  cta = { label: 'Get diagnosis', href: '/diagnosis' },
  signIn = true,
  note,
}: {
  cta?: { label: string; href: string } | null
  signIn?: boolean
  note?: string
}) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-30 transition-colors duration-300 ${
        scrolled
          ? 'border-b border-s-line bg-s-bg/80 backdrop-blur supports-[backdrop-filter]:bg-s-bg/70'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
        <Link href="/" className="link-underline font-semibold tracking-tight text-s-text">
          Sapient Atlas
        </Link>
        <nav className="flex items-center gap-4 sm:gap-5">
          {signIn ? (
            <Link
              href="/login"
              className="link-underline text-label text-s-muted transition-colors hover:text-s-text"
            >
              Sign in
            </Link>
          ) : null}
          {cta ? (
            <ButtonLink href={cta.href} size="md">
              {cta.label}
            </ButtonLink>
          ) : note ? (
            <span className="text-label text-s-muted">{note}</span>
          ) : null}
        </nav>
      </div>
    </header>
  )
}
