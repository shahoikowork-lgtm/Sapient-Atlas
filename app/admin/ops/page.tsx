import Link from 'next/link'
import { getOpsRows, opsRowHasFlag, type OpsRow } from '@/lib/admin-ops'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const VERDICT: Record<string, string> = { hit: 'Hit', partial: 'Partial', miss: 'Miss' }

const TONES: Record<string, string> = {
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  violet: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  gray: 'bg-black/5 text-black/60 ring-black/10',
}

function Flag({ tone, children }: { tone: keyof typeof TONES; children: React.ReactNode }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${TONES[tone]}`}>
      {children}
    </span>
  )
}

function relDays(days: number | null): string {
  if (days == null) return '—'
  if (days <= 0) return 'today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

// Admin-only (the /admin layout calls requireAdmin). The operations console: every active
// sprint at a glance, sorted so what needs a human floats to the top. Replaces "just a review
// queue" — the queue still lives at /admin/review for the edge cases the gate routes there.
export default async function OpsPage() {
  const rows = await getOpsRows()
  const needs = rows.filter((r) => r.flags.needsReview).length

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-lg font-semibold">Operations</h1>
          <div className="flex gap-3 text-xs">
            <Link href="/admin/review" className="text-black/60 underline underline-offset-4">Review queue →</Link>
            <Link href="/admin/metrics" className="text-black/60 underline underline-offset-4">Time to first win →</Link>
            <Link href="/admin/reviews" className="text-black/60 underline underline-offset-4">All diagnoses →</Link>
          </div>
        </div>
        <p className="mt-1 text-sm text-black/55">
          Every active sprint, where it stands, and what needs you.{' '}
          {needs > 0 ? (
            <span className="font-medium text-red-700">{needs} need review.</span>
          ) : (
            'Nothing is blocked right now.'
          )}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-black/60">No active sprints yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-black/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/10 text-xs uppercase tracking-wide text-black/40">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Mission</th>
                <th className="px-4 py-3 font-medium">Last rep</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3 font-medium">Flags</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: OpsRow) => (
                <tr key={r.userId} className="border-b border-black/5 align-top last:border-0">
                  <td className="px-4 py-3">
                    <div className="text-black/80">{r.email ?? '—'}</div>
                    {r.name ? <div className="text-xs text-black/45">{r.name}</div> : null}
                  </td>
                  <td className="px-4 py-3">
                    {r.complete ? (
                      <span className="text-black/80">Complete · {r.total}/{r.total}</span>
                    ) : r.missionN ? (
                      <>
                        <div>
                          <span className="text-black/80 tabular-nums">{r.missionN}/{r.total || '—'}</span>{' '}
                          <span className="text-black/45">{r.phase}</span>
                        </div>
                        {r.missionTitle ? <div className="text-xs text-black/45">{r.missionTitle}</div> : null}
                      </>
                    ) : (
                      <span className="text-black/45">Not started</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {r.lastVerdict ? (
                      <span className="text-black/70">{VERDICT[r.lastVerdict] ?? r.lastVerdict}</span>
                    ) : (
                      <span className="text-black/40">—</span>
                    )}
                    {r.lastConfidence ? <span className="ml-1 text-xs text-black/40">({r.lastConfidence})</span> : null}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-black/60">{relDays(r.daysSinceActivity)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {r.flags.needsReview ? <Flag tone="red">Needs review</Flag> : null}
                      {r.flags.proofToVerify ? <Flag tone="violet">Proof to verify</Flag> : null}
                      {r.flags.misdiagnosisRisk ? <Flag tone="amber">Not clearing</Flag> : null}
                      {r.flags.stuck ? <Flag tone="amber">Stuck</Flag> : null}
                      {r.flags.atRisk ? <Flag tone="gray">At risk</Flag> : null}
                      {!opsRowHasFlag(r) ? <span className="text-xs text-black/35">on track</span> : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
