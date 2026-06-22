import Link from 'next/link'
import { ButtonLink } from './Button'

// Sticky, quiet top bar: wordmark left, one primary action right. No nav clutter.
export function Nav({
  cta = { label: 'Get your free diagnosis', href: '/diagnosis' },
  note,
}: {
  cta?: { label: string; href: string } | null
  note?: string
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-paper/80 backdrop-blur supports-[backdrop-filter]:bg-paper/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="font-semibold tracking-tight text-ink transition-opacity hover:opacity-70">
          Sapient Atlas
        </Link>
        {cta ? (
          <ButtonLink href={cta.href} size="md">
            {cta.label}
          </ButtonLink>
        ) : note ? (
          <span className="text-label text-muted">{note}</span>
        ) : null}
      </div>
    </header>
  )
}
