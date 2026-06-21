import { ButtonLink, Card, Eyebrow, Evidence, Section, TrustStrip } from '@/components/atlas'

export const metadata = {
  title: 'Sapient Atlas — The Art of Becoming Harder to Replace',
  description: 'Paste real work. See where you can get ahead. Know your next move.',
}

const RETURNS = [
  { h: "What you're actually good at", p: 'the real strengths in your work, with the proof' },
  { h: 'Where your leverage is', p: "the strengths you're underusing, and the opportunities in your work" },
  { h: 'What to focus on first', p: 'the one thing quietly limiting you' },
  { h: 'Your highest-leverage move', p: 'the most important thing to do next, and where it takes you' },
]

const STEPS = [
  { n: '1', h: 'Paste one real piece of your work', p: 'A campaign, a brief, an analysis, a strategy doc, a piece of copy.' },
  { n: '2', h: 'See where you actually stand', p: 'Your real strengths, where your leverage is, and what to focus on next.' },
  { n: '3', h: 'Leave knowing your next move', p: 'The single most important thing to do next, and where it takes you.' },
]

const FAQ = [
  { q: 'Is this a course?', a: 'No. Nothing to watch, nothing to study. Atlas shows you where your leverage is and the one move to make next.' },
  { q: 'What do you do with my work?', a: 'It stays private and is used only to produce your results. Nothing is shared, nothing is public.' },
  { q: 'What will I actually walk away with?', a: 'A clear picture of where you stand, where your real leverage is, and the single highest-leverage move to make next.' },
  { q: 'What is the Value Sprint?', a: 'An optional, one-time 30-day program to do your one move on real work, with feedback each week and an honest look at your progress.' },
  { q: 'Do you tell me a salary or a score?', a: 'No. Atlas gives you a clear, considered judgment of where you stand, not a number.' },
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
            <ButtonLink href="/diagnosis" size="md">Find my next move</ButtonLink>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-20 pb-16 text-center sm:pt-28">
        <div className="mx-auto max-w-2xl">
          <Eyebrow className="justify-center">Know exactly where to focus next</Eyebrow>
          <h1 className="mx-auto mt-4 max-w-[17ch] font-serif text-[40px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[52px]">
            Paste real work. See where you can get ahead. Know your next move.
          </h1>
          <p className="mx-auto mt-4 font-serif text-[19px] italic text-ink/75">
            The Art of Becoming Harder to Replace
          </p>
          <p className="mx-auto mt-5 max-w-[52ch] text-[17px] leading-relaxed text-muted">
            Show Atlas one real piece of your work, and see what you&apos;re genuinely good at, where your
            real leverage is, and the one move that gets you ahead fastest.
          </p>
          <div className="mt-7 flex items-center justify-center gap-4">
            <ButtonLink href="/diagnosis" size="lg">Find my next move</ButtonLink>
            <span className="text-sm text-muted">Free · about 3 minutes</span>
          </div>
          <p className="mt-6 text-sm text-muted">See what you can&apos;t see from inside your own work.</p>
        </div>
      </section>

      {/* The problem */}
      <Section className="border-t border-hairline bg-surface">
        <h2 className="font-serif text-[28px] font-semibold leading-tight tracking-[-0.01em]">
          Some people move faster than you.
        </h2>
        <p className="mt-4 font-serif text-[19px] leading-relaxed text-ink/80">
          Not because they&apos;re smarter.<br />
          Not because they work harder.<br />
          <span className="text-ink">They see something you don&apos;t.</span>
        </p>
        <p className="mt-5 text-[17px] leading-relaxed text-muted">
          From inside your own work, it&apos;s hard to tell. Atlas shows you what&apos;s genuinely strong,
          where your leverage is, and the one move most likely to move you forward.
        </p>
      </Section>

      {/* What you'll walk away with */}
      <Section>
        <Eyebrow className="text-muted">What you&apos;ll walk away with</Eyebrow>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {RETURNS.map((r) => (
            <Card key={r.h} className="p-5">
              <div className="font-serif text-[17px] font-semibold">{r.h}</div>
              <div className="mt-1 text-sm text-muted">{r.p}</div>
            </Card>
          ))}
        </div>
      </Section>

      {/* What happens */}
      <Section id="how" className="border-t border-hairline bg-surface">
        <Eyebrow className="text-muted">What happens</Eyebrow>
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

      {/* A real example */}
      <Section>
        <div className="text-center">
          <Eyebrow className="justify-center">A real example</Eyebrow>
          <h2 className="mt-2 font-serif text-[26px] font-semibold tracking-[-0.01em]">
            This is what you&apos;ll see
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
            <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-focal-soft">Your one move</div>
            <div className="mt-1 text-[15px] font-medium text-white">
              Make dependencies explicit before the next launch.
            </div>
          </div>
        </Card>
        <div className="mt-5 text-center">
          <ButtonLink href="/diagnosis" variant="ghost">Find my next move →</ButtonLink>
        </div>
      </Section>

      {/* Clarity strip */}
      <Section className="border-t border-hairline bg-surface">
        <TrustStrip>
          <p className="text-center font-serif text-[20px] font-semibold text-accent-deep">
            Finally know exactly where to focus.
          </p>
          <p className="mx-auto mt-2 max-w-[60ch] text-center text-[15px] leading-relaxed text-accent-deep/80">
            You&apos;ll see what you&apos;re genuinely good at, where your real leverage is, and the single
            highest-leverage move to build momentum now. Specific to your work. No guessing.
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
              30 days of doing your one move on real work, with feedback each week and an honest look at how
              far you&apos;ve come at the end. Optional, one-time.
            </p>
          </div>
          <Card className="text-center">
            <div className="font-serif text-[28px] font-semibold">$149</div>
            <div className="mt-0.5 text-xs text-muted">one-time · start free</div>
            <ButtonLink href="/diagnosis" className="mt-4 w-full">Find my next move</ButtonLink>
          </Card>
        </div>
      </Section>

      {/* Final CTA */}
      <Section className="border-t border-hairline bg-surface text-center">
        <h2 className="mx-auto max-w-[22ch] font-serif text-[28px] font-semibold tracking-[-0.01em]">
          Paste real work. See where you can get ahead.
        </h2>
        <div className="mt-6 flex justify-center">
          <ButtonLink href="/diagnosis" size="lg">Find my next move</ButtonLink>
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
