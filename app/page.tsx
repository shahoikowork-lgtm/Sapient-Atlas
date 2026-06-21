import { ButtonLink, Card, Eyebrow, Evidence, ReviewSeal, Section, TrustStrip } from '@/components/atlas'

export const metadata = {
  title: 'Sapient Atlas — The Art of Becoming Harder to Replace',
  description: 'Paste real work. Get a capability read. Know your next move.',
}

const RETURNS = [
  { h: 'Observed capabilities', p: 'read from your real work, with the evidence' },
  { h: "What's capping you", p: 'the constraints, named plainly' },
  { h: 'The one move', p: 'your single highest-leverage next step' },
  { h: 'A 30-day prediction', p: 'logged now, graded honestly later' },
]

const STEPS = [
  { n: '1', h: 'Paste real work', p: 'A campaign, a brief, an analysis, a strategy doc, a piece of copy.' },
  { n: '2', h: 'Atlas reads it, a human checks it', p: 'The model does the read; a person reviews it before it reaches you.' },
  { n: '3', h: 'You get your read and your move', p: 'What is strong, what is missing, and the one thing to do next.' },
]

const FAQ = [
  { q: 'Is this a course?', a: 'No. There is nothing to watch and nothing to study. Atlas reads your actual work and tells you your next move.' },
  { q: 'What do you do with my work?', a: 'It stays private and is used only to produce your read. A human reviews the read before you see it.' },
  { q: 'Is it just an AI answer?', a: 'The model does the first read, but every read is checked by a human before it reaches you, and each one names its evidence, reasoning, confidence, and a prediction we later grade.' },
  { q: 'What is the Value Sprint?', a: 'An optional, one-time 30-day program to execute your one move on real work, with weekly feedback and an honest re-rating at the end.' },
  { q: 'Do you tell me a salary or a score?', a: 'No. Atlas reads capability and gives a considered judgment, not a number.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-hairline bg-paper/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
          <span className="font-serif text-base font-semibold tracking-tight">Sapient Atlas</span>
          <nav className="flex items-center gap-5 text-sm text-muted">
            <a href="#how" className="hidden hover:text-ink sm:inline">How it works</a>
            <a href="#faq" className="hidden hover:text-ink sm:inline">FAQ</a>
            <ButtonLink href="/diagnosis" size="md">Start free diagnosis</ButtonLink>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-20 pb-16 text-center sm:pt-28">
        <div className="mx-auto max-w-2xl">
          <Eyebrow className="justify-center">Capability intelligence</Eyebrow>
          <h1 className="mx-auto mt-4 max-w-[17ch] font-serif text-[40px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[52px]">
            Paste real work. Get a capability read. Know your next move.
          </h1>
          <p className="mx-auto mt-4 font-serif text-[19px] italic text-ink/75">
            The Art of Becoming Harder to Replace
          </p>
          <p className="mx-auto mt-5 max-w-[52ch] text-[17px] leading-relaxed text-muted">
            Atlas reads one real piece of your work and tells you what&apos;s strong, what&apos;s missing,
            and your single highest-leverage move.
          </p>
          <div className="mt-7 flex items-center justify-center gap-4">
            <ButtonLink href="/diagnosis" size="lg">Start free diagnosis</ButtonLink>
            <span className="text-sm text-muted">Free · about 3 minutes</span>
          </div>
          <div className="mt-6 flex justify-center">
            <ReviewSeal label="Reviewed by a human before you ever see it" />
          </div>
        </div>
      </section>

      {/* Pain */}
      <Section className="border-t border-hairline bg-surface">
        <Eyebrow className="text-muted">The problem</Eyebrow>
        <h2 className="mt-3 font-serif text-[26px] font-semibold leading-tight tracking-[-0.01em]">
          AI can already do the generic parts of digital work.
        </h2>
        <p className="mt-3 text-[17px] leading-relaxed text-muted">
          So the real question isn&apos;t whether you&apos;re busy, it&apos;s what makes you harder to replace.
          Atlas reads your real work to show which capabilities are actually visible, what&apos;s missing, and
          the one move that would make you more defensible.
        </p>
      </Section>

      {/* What Atlas returns */}
      <Section>
        <Eyebrow className="text-muted">What Atlas returns</Eyebrow>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {RETURNS.map((r) => (
            <Card key={r.h} className="p-5">
              <div className="font-serif text-[17px] font-semibold">{r.h}</div>
              <div className="mt-1 text-sm text-muted">{r.p}</div>
            </Card>
          ))}
        </div>
      </Section>

      {/* How it works */}
      <Section id="how" className="border-t border-hairline bg-surface">
        <Eyebrow className="text-muted">How it works</Eyebrow>
        <div className="mt-5 flex flex-col gap-5">
          {STEPS.map((s) => (
            <div key={s.n} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent font-mono text-sm text-accent">
                {s.n}
              </span>
              <div>
                <div className="font-serif text-[18px] font-semibold">{s.h}</div>
                <p className="mt-1 text-[15px] leading-relaxed text-muted">{s.p}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Example output — the evidence centerpiece */}
      <Section>
        <div className="text-center">
          <Eyebrow className="justify-center">Example output</Eyebrow>
          <h2 className="mt-2 font-serif text-[26px] font-semibold tracking-[-0.01em]">
            This is what a read looks like
          </h2>
        </div>
        <Card className="mt-6">
          <p className="font-serif text-[19px] leading-snug">
            You operate at a strong individual-contributor level. Your ceiling right now is scope, not skill.
          </p>
          <div className="mt-5">
            <Eyebrow className="text-muted">Execution · evidence</Eyebrow>
            <Evidence
              className="mt-2"
              quote="Tight sequencing and clear ownership across the launch, but two dependencies were left implicit."
              source="from your launch brief"
            />
          </div>
          <div className="mt-5 rounded-xl bg-focal p-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-focal-soft">The one move</div>
            <div className="mt-1 text-[15px] font-medium text-white">
              Make dependencies explicit before the next launch.
            </div>
          </div>
        </Card>
        <div className="mt-5 text-center">
          <ButtonLink href="/diagnosis" variant="ghost">See your own read →</ButtonLink>
        </div>
      </Section>

      {/* Trust strip */}
      <Section className="border-t border-hairline bg-surface">
        <TrustStrip>
          <div className="flex items-center justify-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v6c0 4-3 7-7 8-4-1-7-4-7-8V6l7-3z" /></svg>
            </span>
            <span className="font-medium text-accent-deep">Why this isn&apos;t another AI answer</span>
          </div>
          <p className="mx-auto mt-2 max-w-[60ch] text-center text-[15px] leading-relaxed text-accent-deep/80">
            Every read names the <strong>evidence</strong> from your work, the <strong>reasoning</strong>,
            its <strong>confidence</strong>, and a <strong>prediction we log and grade</strong>. AI reads it.
            A human checks it before you see it.
          </p>
        </TrustStrip>
      </Section>

      {/* Value Sprint */}
      <Section>
        <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[1.3fr_1fr]">
          <div>
            <Eyebrow className="text-muted">If you want to act on it</Eyebrow>
            <h2 className="mt-2 font-serif text-[24px] font-semibold tracking-[-0.01em]">The Value Sprint</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              30 days of execution on your real work, weekly feedback, and an honest re-rating at the end.
              Optional, one-time.
            </p>
          </div>
          <Card className="text-center">
            <div className="font-serif text-[28px] font-semibold">$149</div>
            <div className="mt-0.5 text-xs text-muted">one-time · start with the free read</div>
            <ButtonLink href="/diagnosis" className="mt-4 w-full">Start free diagnosis</ButtonLink>
          </Card>
        </div>
      </Section>

      {/* Final CTA */}
      <Section className="border-t border-hairline bg-surface text-center">
        <h2 className="mx-auto max-w-[22ch] font-serif text-[28px] font-semibold tracking-[-0.01em]">
          Paste real work. Get a capability read.
        </h2>
        <div className="mt-6 flex justify-center">
          <ButtonLink href="/diagnosis" size="lg">Start free diagnosis</ButtonLink>
        </div>
        <p className="mt-3 text-sm text-muted">Free · about 3 minutes · your work stays private</p>
      </Section>

      {/* FAQ */}
      <Section id="faq" className="border-t border-hairline">
        <Eyebrow className="text-muted">FAQ</Eyebrow>
        <div className="mt-4 divide-y divide-hairline border-y border-hairline">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-4 [&_summary]:cursor-pointer">
              <summary className="flex items-center justify-between gap-4 text-[15px] font-medium">
                {f.q}
                <span className="text-muted transition group-open:rotate-180" aria-hidden="true">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                </span>
              </summary>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t border-hairline px-6 py-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between text-sm text-muted">
          <span className="font-serif font-semibold text-ink">Sapient Atlas</span>
          <span className="italic">The Art of Becoming Harder to Replace</span>
        </div>
      </footer>
    </div>
  )
}
