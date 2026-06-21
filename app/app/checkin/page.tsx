import Link from 'next/link'
import { getAppUser } from '@/lib/app-user'
import { getWorkspace } from '@/lib/app-data'
import { ensureSprintPlan, deriveWeeks } from '@/lib/sprint'
import { CheckinForm } from './checkin-form'

export const dynamic = 'force-dynamic'

export default async function CheckinPage() {
  const user = await getAppUser()
  if (user) await ensureSprintPlan(user)
  const { plan, submissions } = await getWorkspace()
  const { weeks, currentWeek } = deriveWeeks(plan, submissions)

  if (!plan || weeks.length === 0) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight">Weekly check-in</h1>
        <p className="mt-3 text-sm text-black/50">
          Your 30-day plan is being prepared. Open{' '}
          <Link href="/app/move" className="underline underline-offset-4">Current Move</Link> to
          generate it, then come back to submit your week.
        </p>
      </div>
    )
  }

  const current = currentWeek != null ? weeks.find((w) => w.week === currentWeek) : null
  const submitted = weeks.filter((w) => w.submission).sort((a, b) => b.week - a.week)

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Weekly check-in</h1>

      {current ? (
        <section className="mt-6 rounded-2xl border border-black/10 p-6">
          <div className="text-xs uppercase tracking-wide text-black/40">This week · Week {current.week}</div>
          <h2 className="mt-1 text-base font-semibold">{current.title}</h2>
          {current.task ? <p className="mt-1 text-sm leading-relaxed text-black/70">{current.task}</p> : null}
          {current.success_criteria ? (
            <p className="mt-2 text-xs text-black/45">Done when: {current.success_criteria}</p>
          ) : null}
          <div className="mt-4">
            <CheckinForm week={current.week} />
          </div>
        </section>
      ) : (
        <section className="mt-6 rounded-2xl border border-black/10 p-6">
          <div className="text-xs uppercase tracking-wide text-black/40">Sprint complete</div>
          <p className="mt-2 text-sm text-black/70">You have submitted all weeks. Your re-rating comes next.</p>
        </section>
      )}

      {submitted.length > 0 ? (
        <section className="mt-6">
          <h2 className="text-sm font-semibold">Your submissions</h2>
          <div className="mt-3 flex flex-col gap-3">
            {submitted.map((w) => {
              const sub = w.submission
              const reviewed = sub?.status === 'reviewed'
              const fb = (sub?.feedback ?? {}) as { strength?: string; key_fix?: string; next_step?: string }
              return (
                <div key={w.week} className="rounded-xl border border-black/10 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Week {w.week}</span>
                    {reviewed ? (
                      <span className="font-mono text-sm">{sub?.graded_score}/100</span>
                    ) : (
                      <span className="text-xs text-black/40">Awaiting review</span>
                    )}
                  </div>
                  {reviewed ? (
                    <div className="mt-2 flex flex-col gap-1 text-[13px] leading-relaxed text-black/70">
                      {fb.strength ? <p><strong>Strength:</strong> {fb.strength}</p> : null}
                      {fb.key_fix ? <p><strong>Key fix:</strong> {fb.key_fix}</p> : null}
                      {fb.next_step ? <p className="text-black/50"><strong>Next:</strong> {fb.next_step}</p> : null}
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
