import Link from 'next/link'
import { getAppUser } from '@/lib/app-user'
import { getWorkspace } from '@/lib/app-data'
import { ensureSprintPlan, deriveMissions } from '@/lib/sprint'
import { Eyebrow } from '@/components/atlas'
import { CheckinFlow } from './checkin-flow'
import { getConstraintByCode } from '@/lib/atlas/constraints'
import { getMicroSkill } from '@/lib/atlas/constraints/types'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export default async function MissionPage() {
  const user = await getAppUser()
  if (user) await ensureSprintPlan(user)
  const { plan, submissions } = await getWorkspace()
  const { missions, current } = deriveMissions(plan, submissions)
  const submitted = missions.filter((m) => m.state === 'done' || m.state === 'review').sort((a, b) => b.n - a.n)

  // V1 sells only M1. The lesson's contrast + bar checklist come from the CURRENT mission's
  // focus micro-skill; integrative ('full') missions fall back to the constraint's headline
  // worked example and the whole-bar conditions.
  const m1 = getConstraintByCode('M1')
  const ms = current?.microSkill && m1 ? getMicroSkill(m1, current.microSkill) : undefined
  const ex = m1?.method?.worked_examples?.[0]
  const example = ms
    ? { before: ms.counterexample, after: ms.example }
    : ex
      ? { before: ex.before, after: ex.after }
      : undefined
  const barConditions = ms ? ms.bar.pass_conditions : (m1?.bar?.pass_conditions ?? [])

  // Their own material from the diagnosis (day-1 line + competitor) so the move starts from
  // their real work, not a blank box. Best-effort: absent for older cycles, the flow copes.
  let signals: { weakLine: string; competitor: string } | undefined
  if (user) {
    const { data: cyc } = await createAdminClient()
      .from('cycles')
      .select('profile_snapshot')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    const s = (cyc?.profile_snapshot as { atlas?: { signals?: { weak_line?: string; competitor?: string } } } | null)
      ?.atlas?.signals
    if (s?.weak_line) signals = { weakLine: s.weak_line, competitor: s.competitor ?? '' }
  }

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
            barConditions={barConditions}
            signals={signals}
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
              const sub = submissions.find((s) => s.week === m.week)
              const fb = (sub?.feedback ?? {}) as {
                strength?: string
                key_fix?: string
                next_step?: string
                auto_cleared?: boolean
              }
              const cleared = m.state === 'done'
              // The free-prose weekly note appears only after a human approves it — never on an
              // auto-cleared rep, where the user already saw the approved instant feedback.
              const humanReviewed =
                (sub as { status?: string } | undefined)?.status === 'reviewed' && fb.auto_cleared !== true
              return (
                <div key={m.week} className="rounded-xl border border-s-line p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-s-text">
                      {m.n}. {m.title ?? `Move ${m.n}`}
                    </span>
                    <span className="text-xs text-s-muted">{cleared ? 'Cleared' : 'In review'}</span>
                  </div>
                  {humanReviewed && (fb.strength || fb.key_fix || fb.next_step) ? (
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
