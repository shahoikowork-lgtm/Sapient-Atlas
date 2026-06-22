type Tone = 'default' | 'highlight'

// Names one constraint in plain language. `highlight` marks the single dominant one
// (accent left edge). Used on the homepage demonstration, results "what's missing",
// and the waitlist (the user's named constraint). Surface-aware.
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
      className={`rounded-2xl border bg-s-panel p-5 ${
        isHi ? 'border-s-line border-l-2 border-l-s-accent' : 'border-s-line'
      } ${className}`}
    >
      {eyebrow ? (
        <div className="mb-1.5 font-mono text-eyebrow uppercase text-s-accent">{eyebrow}</div>
      ) : null}
      <h3 className="text-h3 text-s-text">{title}</h3>
      {detail ? <p className="mt-2 text-body text-s-text-2">{detail}</p> : null}
    </div>
  )
}
