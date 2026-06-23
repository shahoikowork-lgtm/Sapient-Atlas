import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDiagnosisDetail, DIAGNOSIS_STATUS_LABEL } from '@/lib/diagnoses'
import { trajectoryLabel, humanizeDimension } from '@/lib/format'
import { ReviewActions } from '@/app/admin/review/review-actions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Admin-only (the /admin layout calls requireAdmin). Full detail for one diagnosis, with the
// approve/reject action reusing the existing /api/admin/approve flow (keyed by cycle).
const HIDDEN_ANSWER_KEYS = new Set(['work_sample', 'email', 'name', 'role'])

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-black/10 p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-black/40">{title}</div>
      <div className="mt-2">{children}</div>
    </section>
  )
}

export default async function AdminReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const detail = await getDiagnosisDetail(id)
  if (!detail) notFound()

  const a = detail.assessment
  const m = detail.move
  const dr = detail.atlas?.decline_result
  const context = Object.entries(detail.answers).filter(
    ([k, v]) => !HIDDEN_ANSWER_KEYS.has(k) && v != null && v !== '',
  )

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <Link href="/admin/reviews" className="text-xs text-black/50 underline underline-offset-4">
          ← All diagnoses
        </Link>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold">{detail.user?.email ?? 'Unknown user'}</h1>
            <div className="text-xs text-black/50">
              {detail.user?.role ?? '—'} · submitted {fmtDate(detail.createdAt)}
            </div>
          </div>
          <span className="shrink-0 whitespace-nowrap rounded-full bg-black/[0.06] px-2.5 py-1 text-[11px] font-medium text-black/70">
            {DIAGNOSIS_STATUS_LABEL[detail.status]}
          </span>
        </div>
      </div>

      {/* Review action — reuses the existing approve/reject flow. Only meaningful while pending. */}
      {detail.hasPending && detail.cycleId ? (
        <div className="rounded-xl border border-black/10 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-black/40">Review</div>
          <p className="mt-1 text-xs text-black/50">
            Approving publishes the read and unlocks the result link for the user.
          </p>
          <div className="mt-3">
            <ReviewActions cycleId={detail.cycleId} />
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-black/10 p-4 text-sm text-black/55">
          Current status: <strong className="text-black/75">{DIAGNOSIS_STATUS_LABEL[detail.status]}</strong>. No pending
          output to review.
        </div>
      )}

      <Section title="Submitted work">
        <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-black/[0.03] p-4 text-[12px] leading-relaxed text-black/75">
          {detail.workSample || '(no work sample)'}
        </pre>
      </Section>

      {context.length > 0 ? (
        <Section title="User context">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {context.map(([k, v]) => (
              <div key={k} className="text-sm">
                <dt className="text-xs uppercase tracking-wide text-black/35">{k.replace(/_/g, ' ')}</dt>
                <dd className="text-black/70">{String(v)}</dd>
              </div>
            ))}
          </dl>
        </Section>
      ) : null}

      <Section title="AI read">
        {a ? (
          <>
            {a.observation ? <p className="text-[13px] leading-relaxed text-black/75">{a.observation}</p> : null}
            <div className="mt-2 text-xs text-black/50">
              confidence <strong>{a.confidence ?? '—'}</strong> · trajectory <strong>{trajectoryLabel(a.trajectory)}</strong>
              {a.ai_exposure != null ? <> · AI exposure {Math.round(Number(a.ai_exposure) * 100)}%</> : null}
            </div>
            {Array.isArray(a.gaps) && a.gaps.length > 0 ? (
              <ul className="mt-3 list-disc pl-5 text-[13px] text-black/65">
                {a.gaps.map((g, i) => (
                  <li key={i}>
                    {g.title ? <strong>{g.title}. </strong> : null}
                    {g.detail}
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-black/50">No assessment generated.</p>
        )}
        {m ? (
          <div className="mt-4 border-t border-black/10 pt-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-black/40">Proposed move</div>
            <div className="mt-1 text-sm font-medium text-black/80">{m.title}</div>
            {m.thesis ? <p className="mt-1 text-[13px] leading-relaxed text-black/65">{m.thesis}</p> : null}
            {m.reasoning ? <p className="mt-1 text-[12px] leading-relaxed text-black/50">{m.reasoning}</p> : null}
          </div>
        ) : null}
      </Section>

      <Section title="Constraint match & decline gate">
        <div className="text-sm text-black/75">
          {detail.atlas?.constraint_name ?? '—'}
          {detail.atlas?.profession ? (
            <span className="text-black/40"> · {humanizeDimension(detail.atlas.profession)}</span>
          ) : null}
        </div>
        {dr ? (
          <div className="mt-2 text-xs text-black/55">
            decision <strong className="text-black/75">{dr.decision}</strong>
            {dr.may_sell_sprint != null ? <> · may sell sprint: {String(dr.may_sell_sprint)}</> : null}
            {dr.user_explanation ? <p className="mt-2 text-black/60">{dr.user_explanation}</p> : null}
          </div>
        ) : (
          <p className="mt-1 text-xs text-black/40">No decline-gate classification stored.</p>
        )}
      </Section>

      <Section title="Result link">
        <a
          href={`/results/${detail.token}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm underline underline-offset-4 break-all"
        >
          /results/{detail.token}
        </a>
        <p className="mt-1 text-xs text-black/40">
          The user’s shareable, token-gated link. Works even before approval (shows the “being reviewed” state).
        </p>
      </Section>
    </div>
  )
}
