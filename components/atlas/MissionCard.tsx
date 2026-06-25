import Link from 'next/link'
import type { Mission } from '@/lib/sprint'

// The hero of the NOW screen: the single current mission, on the focal surface, with one
// action. Time estimate is guidance (reps are ~20–40 min by doctrine), never a metric.
export function MissionCard({
  mission,
  href = '/app/checkin',
  cta = "Start today's move",
  estimate = '~10 min',
}: {
  mission: Mission
  href?: string
  cta?: string
  estimate?: string
}) {
  return (
    <div className="rounded-3xl bg-focal p-6 shadow-focal ring-1 ring-inset ring-white/[0.06] sm:p-7">
      <div className="flex items-center justify-between">
        <span className="font-mono text-eyebrow uppercase text-focal-soft">{mission.phase}</span>
        <span className="font-mono text-eyebrow uppercase text-focal-soft tabular">
          Move {mission.n} of {mission.total} · {estimate}
        </span>
      </div>
      <h2 className="mt-3 text-h2 text-on-focal">{mission.title ?? `Move ${mission.n}`}</h2>

      {mission.task ? (
        <div className="mt-4">
          <div className="font-mono text-eyebrow uppercase text-focal-soft">Do this</div>
          <p className="mt-1 text-body text-on-focal-dim">{mission.task}</p>
          {mission.steps && mission.steps.length > 0 ? (
            <ol className="mt-3 flex flex-col gap-2 text-body text-on-focal-dim">
              {mission.steps.map((step, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="mt-px font-mono text-eyebrow text-focal-soft tabular">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      ) : null}

      {mission.successCriteria ? (
        <div className="mt-4">
          <div className="font-mono text-eyebrow uppercase text-focal-soft">Clears when</div>
          <p className="mt-1 text-body text-on-focal-dim">{mission.successCriteria}</p>
        </div>
      ) : null}

      <Link
        href={href}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-on-focal px-5 py-2.5 text-sm font-medium text-focal transition-all duration-200 ease-out hover:-translate-y-px active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        {cta} →
      </Link>
    </div>
  )
}
