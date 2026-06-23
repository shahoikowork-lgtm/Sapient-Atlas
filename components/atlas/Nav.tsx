import Link from 'next/link'
import { ButtonLink } from './Button'

// Sticky, quiet top bar: wordmark left; account access + primary CTA right. Static by
// design — no session read — so the marketing pages stay statically rendered. A returning
// user uses the subtle "Sign in" link (→ /login); the filled CTA stays the primary action.
// Surface-aware (defaults to paper for the marketing pages).
export function Nav({
  cta = { label: 'Get diagnosis', href: '/diagnosis' },
  signIn = true,
  note,
}: {
  cta?: { label: string; href: string } | null
  signIn?: boolean
  note?: string
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-s-line bg-s-bg/80 backdrop-blur supports-[backdrop-filter]:bg-s-bg/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
        <Link href="/" className="font-semibold tracking-tight text-s-text transition-opacity hover:opacity-70">
          Sapient Atlas
        </Link>
        <nav className="flex items-center gap-4 sm:gap-5">
          {signIn ? (
            <Link
              href="/login"
              className="hidden text-label text-s-muted underline-offset-4 transition-colors hover:text-s-text hover:underline sm:inline"
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
