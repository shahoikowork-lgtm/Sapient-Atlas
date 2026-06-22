import type { ReactNode } from 'react'

// The climax of the results page: the single move, on the focal (near-black) surface.
// Intrinsically dark by design; a faint inset ring separates it from the instrument
// canvas it now sits on. No numbers: confidence is a word, on a quiet pill.
export function MoveCard({
  title,
  thesis,
  reasoning,
  targetOutcome,
  confidenceWord,
  className = '',
  children,
}: {
  title: string
  thesis?: string | null
  reasoning?: string | null
  targetOutcome?: string | null
  confidenceWord?: string | null
  className?: string
  children?: ReactNode
}) {
  return (
    <section
      className={`rounded-3xl bg-focal p-6 shadow-focal ring-1 ring-inset ring-white/[0.06] sm:p-8 ${className}`}
    >
      <div className="font-mono text-eyebrow uppercase text-focal-soft">The one move</div>
      <h2 className="mt-2 text-h2 text-on-focal">{title}</h2>
      {thesis ? <p className="mt-2 text-body-lg leading-relaxed text-on-focal-dim">{thesis}</p> : null}

      {reasoning ? (
        <div className="mt-5">
          <div className="font-mono text-eyebrow uppercase text-focal-soft">Why this move</div>
          <p className="mt-1 text-body text-on-focal-dim">{reasoning}</p>
        </div>
      ) : null}

      {targetOutcome || confidenceWord ? (
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          {targetOutcome ? (
            <div>
              <div className="font-mono text-eyebrow uppercase text-focal-soft">Target outcome</div>
              <div className="mt-1 text-body text-on-focal-dim">{targetOutcome}</div>
            </div>
          ) : null}
          {confidenceWord ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-focal-raised px-3 py-1 text-label capitalize text-on-focal-dim">
              {confidenceWord}
            </span>
          ) : null}
        </div>
      ) : null}

      {children}
    </section>
  )
}
