// The strongest visual element in the product: the user's own work, quoted back to
// them. Promoted type, indigo citation rule, attributed source. Presentation only.
export function Evidence({
  quote,
  source,
  className = '',
}: {
  quote: string
  source?: string
  className?: string
}) {
  return (
    <figure className={`border-l-2 border-accent pl-4 ${className}`}>
      <blockquote className="text-[18px] leading-relaxed text-ink/90">“{quote}”</blockquote>
      {source ? (
        <figcaption className="mt-2 font-mono text-[11px] uppercase tracking-[0.07em] text-muted">
          — {source}
        </figcaption>
      ) : null}
    </figure>
  )
}
