import Link from 'next/link'
import { getAppUser } from '@/lib/app-user'
import { getWorkspace } from '@/lib/app-data'
import { ensureSprintPlan, deriveMissions } from '@/lib/sprint'
import { Eyebrow } from '@/components/atlas'
import { CheckinFlow } from './checkin-flow'
import { getConstraintByCode } from '@/lib/atlas/constraints'

export const dynamic = 'force-dynamic'

export default async function MissionPage() {
  const user = await getAppUser()
  if (user) await ensureSprintPlan(user)
  const { plan, submissions } = await getWorkspace()
  const { missions, current } = deriveMissions(plan, submissions)
  const submitted = missions.filter((m) => m.state === 'done' || m.state === 'review').sort((a, b) => b.n - a.n)

  // V1 sells only M1; show its worked good-vs-generic example in the move intro.
  const ex = getConstraintByCode('M1')?.method?.worked_examples?.[0]
  const example = ex ? { before: ex.before, after: ex.after } : undefined

  if (missions.length === 0) {
    return (
      <div>
        <Eyebrow>Move</Eyebrow>
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
        <div className="mt-3">
          <CheckinFlow
            week={current.week}
            phase={current.phase}
            n={current.n}
            total={current.total}
            title={current.title ?? `Move ${current.n}`}
            task={current.task ?? ''}
            steps={current.steps ?? []}
            successCriteria={current.successCriteria ?? ''}
            example={example}
          />
        </div>
      ) : (
        <section className="mt-3 rounded-2xl border border-s-line bg-s-panel p-6">
          <div className="font-mono text-eyebrow uppercase text-s-accent">Nothing to submit</div>
          <p className="mt-2 text-body text-s-text-2">
            {submitted.some((m) => m.state === 'review')
              ? 'Your latest work is in review. The next move opens once it is confirmed.'
              : 'You have cleared every move. See what changed next.'}
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
                      {m.n}. {m.title ?? `Move ${m.n}`}
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
