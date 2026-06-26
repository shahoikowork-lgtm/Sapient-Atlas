import { ButtonLink, Eyebrow, WaitlistState } from '@/components/atlas'
import type { SprintEligibilityMode } from '@/lib/atlas/eligibility'
import { UpgradeCta } from './upgrade-cta'

// The instant, map-bound diagnosis read — the conversion moment, shown the second the user
// submits, with NO wait for human approval. It is built ONLY from data already computed at
// diagnosis time and approved at design time: the extracted swap-test signals (their own
// quoted line + named competitor), the Decline Gate decision, the matched constraint, and the
// authored capability map (why it matters, the bar, the one pre-approved first move). It
// composes no free-form coaching. The full human-reviewed read (the AI's value assessment and
// the personalized move) stays gated and replaces this once a person approves it.
export function InstantRead({
  token,
  movable,
  mode,
  weakLine,
  competitor,
  constraintName,
  whyItMatters,
  barDefinition,
  barConditions = [],
  firstMove,
  explanation,
}: {
  token: string
  movable: boolean
  mode: SprintEligibilityMode
  weakLine?: string
  competitor?: string
  constraintName?: string | null
  whyItMatters?: string | null
  barDefinition?: string | null
  barConditions?: string[]
  firstMove?: string | null
  explanation?: string | null
}) {
  return (
    <div className="flex flex-col">
      <Eyebrow tone="muted">Your read</Eyebrow>
      <h1 className="mt-3 text-h1 text-s-text">
        {movable ? 'Here’s the line making you replaceable.' : 'Here’s the honest read.'}
      </h1>

      {/* The swap test — the "that's me" moment, from their own quoted work. */}
      {weakLine ? (
        <section className="mt-6 rounded-2xl border border-s-line bg-s-panel p-6">
          <div className="font-mono text-eyebrow uppercase text-s-muted">The line that gives you away</div>
          <p className="mt-3 border-l-2 border-s-accent pl-4 text-body-lg text-s-text">&ldquo;{weakLine}&rdquo;</p>
          <p className="mt-4 text-body text-s-text-2">
            <span className="text-s-text">{competitor || 'A direct competitor'}</span>{' '}
            could put that exact line on their own site, word for word. A prospect can&apos;t tell why you, not them.
          </p>
        </section>
      ) : null}

      {/* The named constraint — one quotable, screenshot-worthy line. */}
      {constraintName ? (
        <section className="mt-6 rounded-2xl border border-s-accent/30 bg-s-accent-tint p-6">
          <div className="font-mono text-eyebrow uppercase text-s-accent">The one thing holding your work back</div>
          <h2 className="mt-2 text-h2 text-s-text">{constraintName}</h2>
        </section>
      ) : null}

      {movable ? (
        <>
          {whyItMatters ? (
            <section className="mt-8">
              <Eyebrow tone="muted">Why it matters</Eyebrow>
              <p className="mt-3 text-body-lg text-s-text">{whyItMatters}</p>
            </section>
          ) : null}

          {barDefinition ? (
            <section className="mt-8 border-t border-s-line pt-8">
              <Eyebrow tone="muted">What &ldquo;good&rdquo; looks like</Eyebrow>
              <p className="mt-3 text-body-lg text-s-text">{barDefinition}</p>
              {barConditions.length > 0 ? (
                <ul className="mt-4 flex flex-col gap-2">
                  {barConditions.map((c, i) => (
                    <li key={i} className="flex gap-3 text-body text-s-text-2">
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-s-accent" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ) : null}

          <section className="mt-8 border-t border-s-line pt-8">
            <Eyebrow tone="muted">Your first move — free, ~8 minutes</Eyebrow>
            <p className="mt-3 text-body-lg text-s-text">
              Rewrite that line into a claim only you can make — one {competitor || 'a competitor'} couldn&apos;t put
              on their own site.
            </p>
            {firstMove ? <p className="mt-2 text-body text-s-text-2">{firstMove}</p> : null}
          </section>

          <p className="mt-8 text-body text-s-text-2">
            <span className="text-s-text">This is movable in 30 days</span> — on your own real work, about ten
            minutes a day.
          </p>

          {/* The offer. Shown only to Decline-Gate-cleared (accepted) leads — the sell decision,
              made at diagnosis, is independent of the human review of the full written read. */}
          <div className="mt-6">
            <UpgradeCta token={token} />
          </div>
        </>
      ) : mode === 'waitlist' ? (
        <div className="mt-8">
          <WaitlistState constraintName={constraintName ?? null} explanation={explanation ?? null} />
        </div>
      ) : (
        <section className="mt-8 rounded-2xl border border-s-line bg-s-panel p-6">
          <Eyebrow tone="muted">Where this leaves you</Eyebrow>
          {explanation ? <p className="mt-2 text-body-lg text-s-text-2">{explanation}</p> : null}
          <p className="mt-4 text-body text-s-text-2">
            If you have other real work, a different piece might map to something a 30-day sprint can move. No dead end
            here.
          </p>
          <div className="mt-4">
            <ButtonLink href="/diagnosis" size="lg">Try a different piece of your work</ButtonLink>
          </div>
        </section>
      )}

      {/* The full reviewed read is still coming — the human-review gate is intact. */}
      <p className="mt-10 border-t border-s-line pt-6 text-label text-s-muted">
        This is your instant read — the part we can show you straight away. A person is reviewing your full capability
        profile now; the deeper version arrives shortly, on this same link.
      </p>
    </div>
  )
}
