// THE brand component: the user's own work, quoted back to them. This is the ONLY
// place the serif (the human voice) appears in the product, which makes it the visual
// fingerprint — "this is you, in your own words."
export function Evidence({
  quote,
  source,
  emphasis = false,
  className = '',
}: {
  quote: string
  source?: string
  emphasis?: boolean
  className?: string
}) {
  if (emphasis) {
    return (
      <figure
        className={`rounded-2xl border border-hairline bg-surface p-5 sm:p-6 ${className}`}
      >
        <blockquote className="border-l-2 border-accent pl-4 font-serif text-evidence text-ink">
          “{quote}”
        </blockquote>
        {source ? (
          <figcaption className="mt-3 pl-4 font-mono text-eyebrow uppercase text-muted">
            — {source}
          </figcaption>
        ) : null}
      </figure>
    )
  }
  return (
    <figure className={`border-l-2 border-accent pl-4 ${className}`}>
      <blockquote className="font-serif text-evidence text-ink">“{quote}”</blockquote>
      {source ? (
        <figcaption className="mt-2 font-mono text-eyebrow uppercase text-muted">
          — {source}
        </figcaption>
      ) : null}
    </figure>
  )
}
