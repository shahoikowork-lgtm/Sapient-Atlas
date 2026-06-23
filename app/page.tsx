import {
  Nav,
  Footer,
  Section,
  Eyebrow,
  ButtonLink,
  FocalSection,
  ReadStage,
  ScrollStage,
  ClauseReveal,
  BeforeAfter,
  SprintLadderPreview,
  type ReadDemo,
} from '@/components/atlas'
import { ProfessionSelector } from './profession-selector'

export const metadata = {
  title: 'Sapient Atlas: The Art of Becoming Harder to Replace',
  description:
    'Show Atlas a real piece of your work. It finds the single thing limiting your growth, shows you the evidence in your own words, and gives you a 30-day path to fix it.',
}

// Illustrative demonstration of the product mechanic (labeled as such). Not a real user or
// testimonial. Shared by the hero read and the scroll-pinned read.
const DEMO: ReadDemo = {
  kind: 'Landing page · draft',
  lines: [
    'The all-in-one platform for modern teams.',
    'Powerful, intuitive, and built to scale.',
    'Trusted by fast-moving companies everywhere.',
  ],
  highlightIndex: 1,
  quote: 'Powerful, intuitive, and built to scale.',
  source: 'from the submitted work',
  constraintTitle: 'Generic positioning',
  constraintDetail: 'This line is true of three competitors too. A prospect can’t tell why you.',
}

export default function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-paper text-ink">
      <Nav />

      {/* 1 — HERO: the live read. The product performs before a word of pitch. */}
      <section className="px-6 pt-16 pb-20 sm:pt-24">
        <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[5fr_6fr] lg:gap-16">
          <div>
            <Eyebrow tone="muted">The Art of Becoming Harder to Replace</Eyebrow>
            <h1 className="mt-5 max-w-[15ch] text-display text-ink">
              Find the one thing between you and your next level.
            </h1>
            <p className="mt-5 max-w-[46ch] text-body-lg text-text-secondary">
              Show Atlas a real piece of your work. It finds the single thing limiting your growth and
              shows you the evidence, in your own words.
            </p>
            <div className="mt-7">
              <ButtonLink href="/diagnosis" size="lg">
                Get your free diagnosis
              </ButtonLink>
            </div>
            <p className="mt-4 text-label text-muted">
              Free. No account. We tell you if we can’t help.
            </p>
          </div>
          <ReadStage demo={DEMO} />
        </div>
      </section>

      {/* 2 — TENSION: why this matters now. One idea, landed in clauses. */}
      <Section size="md" width="reading" className="border-t border-hairline">
        <ClauseReveal
          text={
            'As more of the work gets automated, | your edge is the judgment a tool can’t copy. | Atlas finds where yours is thin, | and helps you close it on your real work.'
          }
          className="max-w-[34ch] font-serif text-[clamp(1.5rem,3.4vw,2rem)] leading-[1.3] tracking-[-0.01em] text-ink"
        />
      </Section>

      {/* 3 — THE READ: scroll-pinned demonstration of how the constraint is found. */}
      <Section size="md" width="product" className="border-t border-hairline bg-surface">
        <Eyebrow tone="muted">How it works</Eyebrow>
        <h2 className="mt-3 max-w-[20ch] text-h1 text-ink">Your work, read the way a sharp outside eye would.</h2>
        <div className="mt-10">
          <ScrollStage demo={DEMO} />
        </div>
      </Section>

      {/* 4 — THE SPRINT: the instrument moment. Register flips to dark. */}
      <FocalSection>
        <div className="mx-auto max-w-3xl px-6 py-24 sm:py-32">
          <Eyebrow>The Sprint</Eyebrow>
          <h2 className="mt-4 max-w-[18ch] text-display text-s-text">Thirty days. Nine missions, on your own work.</h2>
          <p className="mt-6 max-w-[56ch] text-body-lg text-s-text-2">
            Not a course. Not advice. Each mission is a rep that builds the capability, escalating as
            you go, until you can do it without us.
          </p>
          <div className="mt-10">
            <SprintLadderPreview />
          </div>
        </div>
      </FocalSection>

      {/* 5 — THE PROOF: reality validates it; you keep the before/after. */}
      <Section size="md" width="reading" className="border-t border-hairline">
        <Eyebrow tone="muted">The proof</Eyebrow>
        <h2 className="mt-3 max-w-[22ch] text-h1 text-ink">You prove it on fresh work.</h2>
        <p className="mt-3 max-w-[52ch] text-body text-text-secondary">
          A real prospect, colleague, or client confirms it. You keep the before and the after.
        </p>
        <div className="mt-8">
          <BeforeAfter
            before="Powerful, intuitive, and built to scale."
            after="The only roadmap tool that ships your Q3 launch without a PM."
            claim="A prospect can now say why you, not the other three."
          />
        </div>
        <p className="mt-4 text-label text-muted">An illustration. Your proof is built on your own work.</p>
      </Section>

      {/* 6 — THE SHIFT: what you become. The emotional peak. */}
      <Section size="lg" width="reading" className="border-t border-hairline text-center">
        <ClauseReveal
          text={'You don’t get a certificate. | You get harder to replace, | and the proof to show it.'}
          className="mx-auto max-w-[24ch] font-serif text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.2] tracking-[-0.02em] text-ink"
        />
      </Section>

      {/* 7 — WHO / OFFER + the honest boundary. */}
      <Section size="md" width="reading" className="border-t border-hairline bg-surface">
        <Eyebrow tone="muted">Who it’s for</Eyebrow>
        <h2 className="mt-3 max-w-[22ch] text-h1 text-ink">Working digital professionals. Choose your field.</h2>
        <p className="mt-3 max-w-[56ch] text-body text-text-secondary">
          Atlas reads the real, finished work you already produce: a campaign, a brief, an analysis, a
          strategy doc, a piece of copy.
        </p>
        <div className="mt-7">
          <ProfessionSelector />
        </div>

        <div className="mt-10 rounded-3xl border border-hairline bg-paper p-6 sm:p-8">
          <h3 className="max-w-[24ch] text-h2 text-ink">We tell you when we can’t help.</h3>
          <p className="mt-3 max-w-[58ch] text-body text-text-secondary">
            The diagnosis is free. When a 30-day Sprint can’t honestly move the thing holding you back,
            we say so and point you somewhere more useful. We’d rather lose the sale than waste your
            month. The first paid Sprint is open to marketers, for $149, once. No subscription.
          </p>
          <div className="mt-5">
            <ButtonLink href="/diagnosis" size="lg">
              Get your free diagnosis
            </ButtonLink>
          </div>
        </div>
      </Section>

      {/* 8 — CLOSE */}
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
