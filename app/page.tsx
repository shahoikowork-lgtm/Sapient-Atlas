import { ButtonLink, Card, Eyebrow, Section } from '@/components/atlas'

export const metadata = {
  title: 'Sapient Atlas — The Art of Becoming Harder to Replace',
  description:
    'Upload a real piece of work. Atlas identifies the biggest thing slowing your growth, shows you the evidence, and tells you whether we can help you fix it in 30 days.',
}

const AFTER = [
  "What you're already doing well",
  "What's limiting your growth",
  "Why it's happening",
  'What to work on next',
]

const PROFESSIONS = [
  { who: 'Marketers', work: 'landing pages, campaigns, positioning docs' },
  { who: 'Product managers', work: 'PRDs, specs, roadmaps' },
  { who: 'Designers', work: 'design docs, UX cases, flows' },
  { who: 'Engineers', work: 'RFCs, technical design docs, pull requests' },
  { who: 'Data analysts', work: 'dashboards, analyses, reports' },
  { who: 'Growth operators', work: 'experiment docs, funnel breakdowns' },
  { who: 'AI operators', work: 'prompts, workflows, evals' },
  { who: 'Founders', work: 'pitch decks, strategy memos, narratives' },
]

const STEPS = [
  {
    n: '1',
    h: 'Get your diagnosis',
    p: 'Show us one real piece of work. You get your diagnosis in a few minutes, free.',
  },
  {
    n: '2',
    h: "Start your Sprint, if it's open",
    p: 'When the thing holding you back is one we can fix in 30 days, you start a Sprint and work on your real work, with focused feedback at each step.',
  },
  {
    n: '3',
    h: 'Prove it',
    p: 'At the end you do the work again on a fresh piece, and a real prospect, colleague, or client confirms it. You keep the before and after.',
  },
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
            <ButtonLink href="/diagnosis" size="md">Get your free diagnosis</ButtonLink>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-20 pb-16 text-center sm:pt-28">
        <div className="mx-auto max-w-2xl">
          <h1 className="mx-auto max-w-[20ch] font-serif text-[40px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[52px]">
            Find the one thing holding your work back.
          </h1>
          <p className="mx-auto mt-5 max-w-[56ch] text-[17px] leading-relaxed text-muted">
            Upload a real piece of work. Atlas identifies the biggest thing slowing your growth, shows you
            the evidence, and tells you whether we can help you fix it in 30 days.
          </p>
          <div className="mt-7 flex items-center justify-center gap-4">
            <ButtonLink href="/diagnosis" size="lg">Get your free diagnosis</ButtonLink>
            <a href="#how" className="text-sm text-muted hover:text-ink">See how it works</a>
          </div>
          <p className="mx-auto mt-6 max-w-[60ch] text-[15px] leading-relaxed text-muted">
            Free for every digital professional. The first paid Sprint is open to marketers working on
            positioning. Everyone else gets the diagnosis and early access.
          </p>
          <p className="mt-3 text-sm text-muted">
            Free diagnosis. No account needed. We tell you if we can&apos;t help.
          </p>
        </div>
      </section>

      {/* After your diagnosis */}
      <Section className="border-t border-hairline bg-surface">
        <h2 className="font-serif text-[24px] font-semibold tracking-[-0.01em]">
          After your diagnosis you&apos;ll know:
        </h2>
        <ul className="mt-5 flex flex-col gap-2.5">
          {AFTER.map((a) => (
            <li key={a} className="flex gap-2.5 text-[16px] leading-relaxed text-ink/80">
              <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span>{a}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[15px] text-muted">No score. No grade. A clear answer you can act on.</p>
      </Section>

      {/* Bring your real work */}
      <Section>
        <h2 className="font-serif text-[24px] font-semibold tracking-[-0.01em]">
          Bring the work you already do.
        </h2>
        <p className="mt-3 text-[16px] leading-relaxed text-muted">
          Atlas analyzes real, finished work. One piece is enough to start.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          {PROFESSIONS.map((p) => (
            <div key={p.who} className="border-t border-hairline pt-3">
              <div className="font-medium text-ink">{p.who}</div>
              <div className="mt-0.5 text-sm text-muted">{p.work}</div>
            </div>
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

      {/* The first Sprint */}
      <Section>
        <Card className="p-6">
          <h2 className="font-serif text-[24px] font-semibold tracking-[-0.01em]">
            The first Sprint is for marketers.
          </h2>
          <p className="mt-3 text-[16px] leading-relaxed text-ink/80">
            One Sprint is open today: positioning for marketers whose work sounds like their competitors&apos;.
            Thirty days, on your own campaigns and pages. By the end, a real prospect can say why you and not
            the other three. It is $149, once, with no subscription.
          </p>
          <div className="mt-5">
            <ButtonLink href="/diagnosis" size="lg">Get your free diagnosis</ButtonLink>
          </div>
        </Card>
      </Section>

      {/* Everyone else */}
      <Section className="border-t border-hairline bg-surface">
        <h2 className="font-serif text-[24px] font-semibold tracking-[-0.01em]">
          Everyone else starts with the diagnosis.
        </h2>
        <p className="mt-3 max-w-[64ch] text-[16px] leading-relaxed text-muted">
          Product managers, designers, engineers, data analysts, growth and AI operators, founders. You can
          get the same diagnosis today and see the biggest thing holding your work back, with the evidence. Your Sprint is not
          open yet, so we will not sell you one. Tell us you want it and you will be first in line when it
          opens.
        </p>
      </Section>

      {/* Not a course */}
      <Section>
        <h2 className="font-serif text-[24px] font-semibold tracking-[-0.01em]">No lessons. No videos.</h2>
        <p className="mt-3 max-w-[64ch] text-[16px] leading-relaxed text-muted">
          Atlas is not a course or a coaching program. There is nothing to watch and nothing to memorize. You
          work on the thing that is actually holding you back, on your own work, until you can do it without
          us.
        </p>
      </Section>

      {/* The honest part */}
      <Section className="border-t border-hairline bg-surface">
        <h2 className="font-serif text-[24px] font-semibold tracking-[-0.01em]">
          We tell you when we can&apos;t help.
        </h2>
        <p className="mt-3 max-w-[64ch] text-[16px] leading-relaxed text-muted">
          The diagnosis is free. When what&apos;s holding you back is something a 30-day Sprint cannot honestly move, we
          say so, and we point you somewhere more useful. We would rather lose the sale than waste your month.
        </p>
      </Section>

      {/* Closing */}
      <Section className="border-t border-hairline text-center">
        <h2 className="mx-auto max-w-[22ch] font-serif text-[28px] font-semibold tracking-[-0.01em]">
          Start with the diagnosis.
        </h2>
        <p className="mt-3 text-[16px] leading-relaxed text-muted">
          One real piece of work. A few minutes. The one thing holding it back.
        </p>
        <div className="mt-6 flex justify-center">
          <ButtonLink href="/diagnosis" size="lg">Get your free diagnosis</ButtonLink>
        </div>
        <p className="mt-3 text-sm text-muted">
          Your work stays private. We use it only to produce your diagnosis.
        </p>
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
