import Link from 'next/link'
import { getAppUser } from '@/lib/app-user'
import { getUserDiagnoses, DIAGNOSIS_STATUS_LABEL, type DiagnosisStatus } from '@/lib/diagnoses'
import { humanizeDimension } from '@/lib/format'

export const dynamic = 'force-dynamic'

// Statuses where an approved read (or waitlist / sprint state) is viewable at /results/[token].
const VIEWABLE = new Set<DiagnosisStatus>(['ready', 'waitlist', 'sprint_available', 'sprint_active'])

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default async function DiagnosesPage() {
  const user = await getAppUser()
  const rows = user ? await getUserDiagnoses(user.id) : []

  return (
    <div>
      <Link href="/app/settings" className="text-label text-s-muted hover:text-s-text">← You</Link>
      <h1 className="mt-3 text-h2 text-s-text">Your diagnoses</h1>
      <p className="mt-1 text-label text-s-muted">Every piece of work you’ve submitted, and where each one stands.</p>

      {rows.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-s-line bg-s-panel p-6 text-body text-s-text-2">
          No diagnoses yet.{' '}
          <Link href="/diagnosis" className="text-s-accent underline underline-offset-4">
            Start one
          </Link>
          .
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {rows.map((r) => (
            <li key={r.id} className="rounded-2xl border border-s-line bg-s-panel p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-s-accent-tint px-2 py-0.5 text-[11px] font-medium text-s-accent">
                      {DIAGNOSIS_STATUS_LABEL[r.status]}
                    </span>
                    <span className="text-xs text-s-muted">{fmtDate(r.createdAt)}</span>
                  </div>
                  <div className="mt-2 text-sm font-medium text-s-text">{r.constraintName ?? 'Read in progress'}</div>
                  <div className="mt-0.5 text-xs text-s-muted">
                    {[r.role, r.profession ? humanizeDimension(r.profession) : null].filter(Boolean).join(' · ') || '—'}
                  </div>
                </div>
                <div className="shrink-0">
                  {VIEWABLE.has(r.status) ? (
                    <Link href={`/results/${r.token}`} className="text-xs text-s-accent underline underline-offset-4">
                      View result
                    </Link>
                  ) : (
                    <span className="text-xs text-s-muted">We’ll email you</span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
