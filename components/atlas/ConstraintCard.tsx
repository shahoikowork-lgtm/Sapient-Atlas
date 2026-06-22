type Tone = 'default' | 'highlight'

// Names one constraint in plain language. `highlight` marks the single dominant one
// (accent left edge). Used on the homepage demonstration, results "what's missing",
// and the waitlist (the user's named constraint).
export function ConstraintCard({
  title,
  detail,
  tone = 'default',
  eyebrow,
  className = '',
}: {
  title: string
  detail?: string
  tone?: Tone
  eyebrow?: string
  className?: string
}) {
  const isHi = tone === 'highlight'
  return (
    <div
      className={`rounded-2xl border bg-surface p-5 ${
        isHi ? 'border-hairline border-l-2 border-l-accent' : 'border-hairline'
      } ${className}`}
    >
      {eyebrow ? (
        <div className="mb-1.5 font-mono text-eyebrow uppercase text-accent">{eyebrow}</div>
      ) : null}
      <h3 className="text-h3 text-ink">{title}</h3>
      {detail ? <p className="mt-2 text-body text-text-secondary">{detail}</p> : null}
    </div>
  )
}
