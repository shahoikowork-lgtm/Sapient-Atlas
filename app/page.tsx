import {
  ButtonLink,
  Card,
  Eyebrow,
  Section,
  Reveal,
  Evidence,
  ConstraintCard,
  ArtifactPreview,
  Nav,
  Footer,
} from '@/components/atlas'
import { ProfessionSelector } from './profession-selector'

export const metadata = {
  title: 'Sapient Atlas — The Art of Becoming Harder to Replace',
  description:
    'Show Atlas one real piece of your work. It finds the single biggest thing limiting your growth, shows you the evidence, and tells you whether a 30-day Sprint can fix it.',
}

// Illustrative demonstration artifact (a generic SaaS landing draft). Shows the product
// mechanic — not a claimed user outcome or metric.
const DEMO_LINES = [
  'The all-in-one platform for modern teams.',
  'Powerful, intuitive, and built to scale.',
  'Trusted by fast-moving companies everywhere.',
]

const STEPS = [
  {
    n: '1',
    h: 'See it',
    p: 'Show Atlas one real piece of your work. It names the single thing limiting your growth and shows you the evidence, in your own words.',
  },
  {
    n: '2',
    h: 'Work it',
    p: 'When a 30-day Sprint can move it, you work on your own real projects, with focused feedback at each step. No lessons, no videos.',
  },
  {
    n: '3',
    h: 'Prove it',
    p: 'At the end you do it again on a fresh piece, and a real prospect, colleague, or client confirms it. You keep the before and after.',
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Nav />

      {/* 1 — DEMONSTRATION HERO: show the product thinking before a word about it. */}
      <section className="px-6 pt-16 pb-20 sm:pt-24">
        <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <h1 className="max-w-[16ch] text-display text-ink">
              See the one thing holding your work back.
            </h1>
            <p className="mt-5 max-w-[48ch] text-body-lg text-text-secondary">
              Show Atlas one real piece of your work. It finds the single biggest thing limiting
              your growth, shows you the evidence, and tells you whether a 30-day Sprint can fix it.
            </p>
            <div className="mt-7">
              <ButtonLink href="/diagnosis" size="lg">
                Get your free diagnosis
              </ButtonLink>
            </div>
            <p className="mt-4 text-label text-muted">
              Free. No account needed. We tell you if we can&apos;t help.
            </p>
          </div>

          {/* The demonstration: artifact → evidence → constraint, resolving once. */}
          <Reveal>
            <div className="flex flex-col gap-4">
              <ArtifactPreview kind="Landing page · draft" lines={DEMO_LINES} highlightIndex={1} />
              <Evidence
                quote="Powerful, intuitive, and built to scale."
                source="from the submitted work"
              />
              <ConstraintCard
                eyebrow="The one thing holding it back"
                title="Generic positioning"
                detail="This line is true of three competitors too. A prospect can’t tell why you."
                tone="highlight"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2 — HOW IT WORKS: the real spine, See → Work → Prove. */}
      <Section id="how" size="md" width="reading" className="border-t border-hairline bg-surface">
        <Eyebrow className="text-muted">How it works</Eyebrow>
        <div className="mt-6 flex flex-col gap-5">
          {STEPS.map((s) => (
            <div key={s.n} className="group flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent font-mono text-sm text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                {s.n}
              </span>
              <div>
                <div className="text-h3 text-ink">{s.h}</div>
                <p className="mt-1 text-body text-text-secondary">{s.p}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 3 — THE BOUNDARY: the strongest trust device, said once. */}
      <Section size="md" width="reading" className="border-t border-hairline">
        <h2 className="max-w-[20ch] text-h1 text-ink">We tell you when we can&apos;t help.</h2>
        <p className="mt-4 max-w-[60ch] text-body-lg text-text-secondary">
          The diagnosis is free. When the thing holding you back is something a 30-day Sprint cannot
          honestly move, we say so, and we point you somewhere more useful. We would rather lose the
          sale than waste your month. Atlas is not a course or a coaching program. There is nothing
          to watch. You work on your own real work until you can do it without us.
        </p>
      </Section>

      {/* 4 — WHO IT'S FOR + OFFER. */}
      <Section size="md" width="reading" className="border-t border-hairline bg-surface">
        <Eyebrow className="text-muted">Who it&apos;s for</Eyebrow>
        <h2 className="mt-3 max-w-[22ch] text-h1 text-ink">
          Working digital professionals. Choose your field.
        </h2>
        <p className="mt-3 max-w-[58ch] text-body text-text-secondary">
          Atlas reads the real, finished work you already produce — a campaign, a brief, an analysis,
          a strategy doc, a piece of copy.
        </p>
        <div className="mt-7">
          <ProfessionSelector />
        </div>

        <Card className="mt-8 p-6 sm:p-8" interactive>
          <h3 className="text-h2 text-ink">The first Sprint is open for marketers.</h3>
          <p className="mt-3 text-body text-text-secondary">
            If your work sounds like your competitors&apos;, positioning is the fix — whether you
            work in SEO, paid ads, content, product marketing, email, demand generation, or growth.
            Thirty days, on your own campaigns and pages. By the end, a real prospect can say why you
            and not the other three. It is $149, once, with no subscription.
          </p>
          <div className="mt-5">
            <ButtonLink href="/diagnosis" size="lg">
              Get your free diagnosis
            </ButtonLink>
          </div>
        </Card>
      </Section>

      {/* Closing */}
      <Section size="lg" width="reading" className="border-t border-hairline text-center">
        <h2 className="mx-auto max-w-[22ch] text-h1 text-ink">Start with the diagnosis.</h2>
        <p className="mt-3 text-body-lg text-text-secondary">
          One real piece of work. A few minutes. The one thing holding it back.
        </p>
        <div className="mt-6 flex justify-center">
          <ButtonLink href="/diagnosis" size="lg">
            Get your free diagnosis
          </ButtonLink>
        </div>
        <p className="mt-3 text-label text-muted">
          Your work stays private. We use it only to produce your diagnosis.
        </p>
      </Section>

      <Footer />
    </div>
  )
}
