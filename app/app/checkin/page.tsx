import Link from 'next/link'
import { getAppUser } from '@/lib/app-user'
import { getWorkspace } from '@/lib/app-data'
import { ensureSprintPlan, deriveMissions } from '@/lib/sprint'
import { Eyebrow } from '@/components/atlas'
import { CheckinForm } from './checkin-form'

export const dynamic = 'force-dynamic'

export default async function MissionPage() {
  const user = await getAppUser()
  if (user) await ensureSprintPlan(user)
  const { plan, submissions } = await getWorkspace()
  const { missions, current } = deriveMissions(plan, submissions)
  const submitted = missions.filter((m) => m.state === 'done' || m.state === 'review').sort((a, b) => b.n - a.n)

  if (missions.length === 0) {
    return (
      <div>
        <Eyebrow>Mission</Eyebrow>
        <p className="mt-3 text-body text-s-text-2">
          Your path is being prepared.{' '}
          <Link href="/app" className="underline underline-offset-4">Back to Now</Link>
        </p>
      </div>
    )
  }

  return (
    <div>
      <Link href="/app/move" className="text-label text-s-muted hover:text-s-text">← Path</Link>

      {current ? (
        <section className="mt-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-eyebrow uppercase text-s-accent">{current.phase}</span>
            <span className="font-mono text-eyebrow uppercase text-s-muted tabular">
              Mission {current.n} of {current.total} · ~30 min
            </span>
          </div>
          <h1 className="mt-2 text-h2 text-s-text">{current.title ?? `Mission ${current.n}`}</h1>

          {current.task ? (
            <div className="mt-5">
              <div className="font-mono text-eyebrow uppercase text-s-muted">Do this</div>
              <p className="mt-1 text-body text-s-text-2">{current.task}</p>
              {current.steps && current.steps.length > 0 ? (
                <ol className="mt-3 flex flex-col gap-2 text-body text-s-text-2">
                  {current.steps.map((step, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="mt-px font-mono text-eyebrow text-s-muted tabular">{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
          ) : null}
          {current.successCriteria ? (
            <div className="mt-4 rounded-xl border border-s-line bg-s-panel p-4">
              <div className="font-mono text-eyebrow uppercase text-s-accent">Clears when</div>
              <p className="mt-1 text-body text-s-text">{current.successCriteria}</p>
            </div>
          ) : null}

          <div className="mt-6">
            <CheckinForm week={current.week} />
          </div>
        </section>
      ) : (
        <section className="mt-3 rounded-2xl border border-s-line bg-s-panel p-6">
          <div className="font-mono text-eyebrow uppercase text-s-accent">Nothing to submit</div>
          <p className="mt-2 text-body text-s-text-2">
            {submitted.some((m) => m.state === 'review')
              ? 'Your latest work is in review. The next mission opens once it is confirmed.'
              : 'You have cleared every mission. Your re-rating comes next.'}
          </p>
        </section>
      )}

      {submitted.length > 0 ? (
        <section className="mt-8">
          <div className="font-mono text-eyebrow uppercase text-s-muted">Submitted</div>
          <div className="mt-3 flex flex-col gap-3">
            {submitted.map((m) => {
              const fb = (submissions.find((s) => s.week === m.week)?.feedback ?? {}) as {
                strength?: string
                key_fix?: string
                next_step?: string
              }
              const reviewed = m.state === 'done'
              return (
                <div key={m.week} className="rounded-xl border border-s-line p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-s-text">
                      {m.n}. {m.title ?? `Mission ${m.n}`}
                    </span>
                    <span className="text-xs text-s-muted">{reviewed ? 'Cleared' : 'In review'}</span>
                  </div>
                  {reviewed && (fb.strength || fb.key_fix || fb.next_step) ? (
                    <div className="mt-2 flex flex-col gap-1 text-[13px] leading-relaxed text-s-text-2">
                      {fb.strength ? <p><strong className="text-s-text">Strength:</strong> {fb.strength}</p> : null}
                      {fb.key_fix ? <p><strong className="text-s-text">Key fix:</strong> {fb.key_fix}</p> : null}
                      {fb.next_step ? <p className="text-s-muted"><strong>Next:</strong> {fb.next_step}</p> : null}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </section>
      ) : null}
    </div>
  )
}
