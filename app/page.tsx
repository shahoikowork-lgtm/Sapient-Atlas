import {
  Nav,
  Footer,
  Section,
  Reveal,
  Eyebrow,
  ButtonLink,
  FocalSection,
  Demonstration,
  Offer,
} from '@/components/atlas'
import { ProfessionSelector } from './profession-selector'

export const metadata = {
  title: 'Sapient Atlas: The Art of Becoming Harder to Replace',
  description:
    'Show Atlas a real piece of your work. It finds the single thing limiting your growth, shows you the evidence in your own words, and tells you whether a 30-day Sprint can fix it.',
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Nav />

      {/* HERO — one column, type-led. The message is the hero; nothing competes with it. */}
      <section className="px-6 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="mx-auto max-w-4xl">
          <Eyebrow tone="muted">The Art of Becoming Harder to Replace</Eyebrow>
          <h1 className="mt-5 max-w-[15ch] text-display text-ink">
            Find the one thing holding your work back.
          </h1>
          <p className="mt-6 max-w-[52ch] text-body-lg text-text-secondary">
            Show Atlas a real piece of your work. It finds the single thing limiting your growth,
            shows you the evidence in your own words, and tells you whether a 30-day Sprint can fix it.
          </p>
          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
            <ButtonLink href="/diagnosis" size="lg">
              Get your free diagnosis
            </ButtonLink>
            <span className="text-label text-muted">
              Free. No account needed. If we can’t help, we’ll tell you.
            </span>
          </div>
        </div>
      </section>

      {/* STAKES — one serif statement; the editorial voice given real presence. */}
      <Section size="sm" width="reading" className="border-t border-hairline">
        <Reveal>
          <p className="max-w-[34ch] font-serif text-[clamp(1.5rem,3.4vw,2rem)] leading-[1.3] tracking-[-0.01em] text-ink">
            As more of the work gets automated, your edge is the judgment a tool can’t copy. Atlas
            finds where yours is thin, and helps you close it on your real work.
          </p>
        </Reveal>
      </Section>

      {/* DEMONSTRATION — what a read looks like, shown honestly, revealed in motion. */}
      <Section size="md" width="product" className="border-t border-hairline bg-surface">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <Eyebrow tone="muted">What a read looks like</Eyebrow>
            <h2 className="mt-3 max-w-[18ch] text-h1 text-ink">
              Your work, read the way a sharp outside eye would.
            </h2>
            <p className="mt-4 max-w-[46ch] text-body text-text-secondary">
              Atlas reads what you actually produce, quotes the line that gives you away, and names
              the single thing holding it back. One constraint, with the evidence attached.
            </p>
            <p className="mt-4 text-label text-muted">
              An illustration. Your read is built on your own work.
            </p>
          </div>
          <Demonstration />
        </div>
      </Section>

      {/* HONESTY CLIMAX — the dark instrument moment; the trust differentiator, given weight. */}
      <FocalSection>
        <div className="mx-auto max-w-3xl px-6 py-24 sm:py-32">
          <Eyebrow>The honest part</Eyebrow>
          <h2 className="mt-4 max-w-[18ch] text-display text-s-text">
            We tell you when we can’t help.
          </h2>
          <p className="mt-6 max-w-[58ch] text-body-lg text-s-text-2">
            The diagnosis is free. When the thing holding you back is something a 30-day Sprint can’t
            honestly move, we say so, and we point you somewhere more useful. We would rather lose the
            sale than waste your month.
          </p>
          <p className="mt-4 max-w-[58ch] text-body text-s-muted">
            Atlas isn’t a course or a coaching program. There’s nothing to watch. You work on your own
            real work until you can do it without us.
          </p>
        </div>
      </FocalSection>

      {/* WHO IT'S FOR — choose your field; honest about what is open today. */}
      <Section size="md" width="reading" className="border-t border-hairline">
        <Eyebrow tone="muted">Who it’s for</Eyebrow>
        <h2 className="mt-3 max-w-[20ch] text-h1 text-ink">
          Working digital professionals. Choose your field.
        </h2>
        <p className="mt-3 max-w-[56ch] text-body text-text-secondary">
          Atlas reads the real, finished work you already produce: a campaign, a brief, an analysis, a
          strategy doc, a piece of copy.
        </p>
        <div className="mt-7">
          <ProfessionSelector />
        </div>
      </Section>

      {/* THE OFFER — risk-reversed, honest that only the marketing Sprint is open. */}
      <Section size="md" width="reading" className="border-t border-hairline bg-surface">
        <Offer />
      </Section>

      {/* CLOSE */}
      <Section size="lg" width="reading" className="border-t border-hairline text-center">
        <h2 className="mx-auto max-w-[20ch] text-h1 text-ink">Start with the diagnosis.</h2>
        <p className="mt-3 text-body-lg text-text-secondary">
          One real piece of work. A few minutes. The one thing holding it back.
        </p>
        <div className="mt-7 flex justify-center">
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
