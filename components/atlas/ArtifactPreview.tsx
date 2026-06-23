// The demonstration object: a short, illustrative piece of "real work" rendered as a
// styled artifact surface, with one line optionally highlighted (the span the Evidence
// pulls from). Content is illustrative of the product mechanic, never a claimed user
// outcome or metric. Surface-aware.
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
    <div className={`overflow-hidden rounded-2xl border border-s-line bg-s-panel shadow-s ${className}`}>
      <div className="flex items-center justify-between border-b border-s-line px-4 py-2.5">
        <span className="font-mono text-eyebrow uppercase text-s-muted">{kind}</span>
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-s-line-strong" />
          <span className="h-2 w-2 rounded-full bg-s-line-strong" />
          <span className="h-2 w-2 rounded-full bg-s-line-strong" />
        </span>
      </div>
      <div className="space-y-2 p-4 font-mono text-[12px] leading-relaxed break-words sm:text-[13px]">
        {lines.map((line, i) => {
          const hit = i === highlightIndex
          return (
            <p
              key={i}
              className={
                hit
                  ? 'rounded bg-s-accent-tint px-1.5 py-0.5 text-s-accent-strong'
                  : 'text-s-text-2'
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
