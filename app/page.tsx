import {
  Nav,
  Footer,
  Section,
  Eyebrow,
  ButtonLink,
  FocalSection,
  ScrollStage,
  BeforeAfter,
  SprintLadderPreview,
  SwapTest,
  DiagnosisEntry,
  type ReadDemo,
} from '@/components/atlas'
import { ProfessionSelector } from './profession-selector'

export const metadata = {
  title: 'Sapient Atlas: The Art of Becoming Harder to Replace',
  description:
    'Show Atlas a real piece of your work. It finds the single thing limiting your growth, shows you the evidence in your own words, and gives you a 30-day path to fix it.',
}

// Illustrative demonstration of the product mechanic (labeled as such). Not a real user or
// testimonial. Shared by the swap-test hero and the scroll-pinned read.
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
  constraintDetail: 'The same line is true of three competitors. A prospect can’t tell why you.',
}

export default function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-paper text-ink">
      <Nav />

      {/* 1 — HERO: the split, then the swap test. The product performs before a word of pitch. */}
      <section className="atmos-paper px-6 pt-16 pb-20 sm:pt-24">
        <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[5fr_6fr] lg:gap-16">
          <div>
            <Eyebrow tone="muted">The Art of Becoming Harder to Replace</Eyebrow>
            <h1 className="mt-5 max-w-[15ch] text-display text-ink">
              Most work is becoming replaceable. Make sure yours isn’t.
            </h1>
            <p className="mt-5 max-w-[44ch] text-body-lg text-text-secondary">
              Show Atlas one real piece of your work. It finds the one capability keeping you replaceable, in your own
              words.
            </p>
            <div className="mt-7">
              <ButtonLink href="/diagnosis" size="lg">
                Get your free diagnosis
              </ButtonLink>
            </div>
            <p className="mt-4 text-label text-muted">Free. No account. We tell you if we can’t help.</p>
          </div>
          <SwapTest
            line={DEMO.quote}
            sites={['Competitor A', 'Competitor B', 'Competitor C']}
            verdictTitle={DEMO.constraintTitle}
            verdictDetail={DEMO.constraintDetail}
          />
        </div>
      </section>

      {/* 2 — STAKES: the conviction and the clock. One statement, set plainly. */}
      <Section size="md" width="reading" className="border-t border-hairline">
        <p className="max-w-[36ch] font-serif text-[clamp(1.5rem,3.4vw,2rem)] leading-[1.3] tracking-[-0.01em] text-ink">
          Every year, more of what you do becomes something a tool does for free. The professionals who stay valuable
          aren’t the ones who use AI. They’re the ones who can do what it can’t, and prove it. That line is being drawn
          now.
        </p>
      </Section>

      {/* 3 — THE DIAGNOSIS: scroll-pinned demonstration of how the constraint is found. */}
      <Section size="md" width="product" className="border-t border-hairline bg-surface">
        <Eyebrow tone="muted">The diagnosis</Eyebrow>
        <h2 className="mt-3 max-w-[20ch] text-h1 text-ink">Your work, read the way a sharp outside buyer would.</h2>
        <div className="mt-10">
          <ScrollStage demo={DEMO} />
        </div>
      </Section>

      {/* 4 — THE SPRINT: the instrument moment. Register flips to dark. The bar rises. */}
      <FocalSection>
        <div className="mx-auto max-w-4xl px-6 py-24 sm:py-32">
          <Eyebrow>The Sprint</Eyebrow>
          <h2 className="mt-4 max-w-[18ch] text-display text-s-text">Thirty days. The bar rises every week.</h2>
          <p className="mt-6 max-w-[52ch] text-body-lg text-s-text-2">
            Reps on your own real work, each one harder than the last, until you can do, unaided, what you can’t do
            today.
          </p>
          <div className="mt-12">
            <SprintLadderPreview />
          </div>
        </div>
      </FocalSection>

      {/* 5 — THE PROOF: reality validates it; you keep the before/after. */}
      <Section size="md" width="reading" className="border-t border-hairline">
        <Eyebrow tone="muted">The proof</Eyebrow>
        <h2 className="mt-3 max-w-[22ch] text-h1 text-ink">A real buyer recognizes you. Unprompted.</h2>
        <p className="mt-3 max-w-[52ch] text-body text-text-secondary">
          Atlas doesn’t grant the proof. Reality does, a prospect, a colleague, a client. You keep the before and the
          after, and the words to show it.
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

      {/* 6 — NOT FOR EVERYONE: selectivity, the decline gate as the standard. */}
      <Section size="md" width="reading" className="border-t border-hairline bg-surface">
        <Eyebrow tone="muted">Not for everyone</Eyebrow>
        <h2 className="mt-3 max-w-[24ch] text-h1 text-ink">Atlas isn’t for everyone.</h2>
        <p className="mt-3 max-w-[50ch] text-body text-text-secondary">
          If the thing holding you back isn’t a capability we can move in 30 days, we’ll tell you, and we won’t sell you
          a Sprint. We’d rather decline you than waste your month. For the ones we can help, it starts with your real
          work.
        </p>
        <div className="mt-7">
          <ProfessionSelector />
        </div>
      </Section>

      {/* 7 — CLOSE: who you become, then one strong final CTA, the work pasted inline. */}
      <Section size="lg" width="reading" className="border-t border-hairline text-center">
        <p className="mx-auto max-w-[30ch] font-serif text-[clamp(1.5rem,3.4vw,2.1rem)] leading-[1.25] tracking-[-0.01em] text-ink">
          You don’t get a certificate. You become someone they can’t replace, with the proof to show it.
        </p>
        <div className="mt-10">
          <DiagnosisEntry />
        </div>
        <p className="mx-auto mt-6 max-w-[52ch] text-label text-muted">
          Free. If a 30-day Sprint can’t honestly move what’s holding you back, we say so. The first paid Sprint is
          $149, once. No subscription.
        </p>
      </Section>

      <Footer />
    </div>
  )
}
