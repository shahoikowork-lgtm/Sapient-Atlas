// The demonstration object: a short, illustrative piece of "real work" rendered as a
// styled artifact surface, with one line optionally highlighted (the span the Evidence
// pulls from). Used on the homepage hero and the profession selector. Content is
// illustrative of the product mechanic — never a claimed user outcome or metric.
export function ArtifactPreview({
  kind,
  lines,
  highlightIndex,
  className = '',
}: {
  kind: string
  lines: string[]
  highlightIndex?: number
  className?: string
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-hairline bg-surface shadow-raised ${className}`}
    >
      <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
        <span className="font-mono text-eyebrow uppercase text-muted">{kind}</span>
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-hairline-strong" />
          <span className="h-2 w-2 rounded-full bg-hairline-strong" />
          <span className="h-2 w-2 rounded-full bg-hairline-strong" />
        </span>
      </div>
      <div className="space-y-2 p-4 font-mono text-[13px] leading-relaxed">
        {lines.map((line, i) => {
          const hit = i === highlightIndex
          return (
            <p
              key={i}
              className={
                hit
                  ? 'rounded bg-accent-tint px-1.5 py-0.5 text-accent-deep'
                  : 'text-text-secondary'
              }
            >
              {line}
            </p>
          )
        })}
      </div>
    </div>
  )
}
