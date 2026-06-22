import { ConstraintCard } from './ConstraintCard'
import { Eyebrow } from './Eyebrow'

// The majority path, reframed from dead-end to earned early access. Leads with the
// user's own named constraint, sets honest expectations ("Sprints open one field at a
// time"), and confirms their place. No checkout (doctrine). No fabricated action: the
// user already gave their email at diagnosis, so "we'll let you know" is honest.
export function WaitlistState({
  constraintName,
  explanation,
  className = '',
}: {
  constraintName?: string | null
  explanation?: string | null
  className?: string
}) {
  const text = explanation ?? ''
  return (
    <section className={`rounded-3xl border border-s-accent/30 bg-s-accent-tint p-6 sm:p-8 ${className}`}>
      <Eyebrow>Early access</Eyebrow>
      <h2 className="mt-2 text-h2 text-s-text">
        You have your diagnosis. Your Sprint is next in line.
      </h2>

      {constraintName ? (
        <div className="mt-5">
          <ConstraintCard
            eyebrow="The one thing to work on"
            title={constraintName}
            detail={text || undefined}
            tone="highlight"
          />
        </div>
      ) : (
        <p className="mt-3 text-body-lg text-s-text-2">{text}</p>
      )}

      <div className="mt-6 space-y-2 text-body text-s-text-2">
        <p>
          Sprints open one field at a time, so we get every one right before the next. Yours is on
          the path, and you’re first in line when it opens.
        </p>
        <p className="text-label text-s-muted">
          We have your details from the diagnosis. Keep this link to return to your read anytime.
        </p>
      </div>
    </section>
  )
}
