import Link from 'next/link'
import { getAllDiagnoses, DIAGNOSIS_STATUS_LABEL } from '@/lib/diagnoses'
import { humanizeDimension } from '@/lib/format'
import { DeleteDiagnosisButton } from './delete-button'
import { ApproveDiagnosisButton } from './approve-button'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Admin-only (the /admin layout calls requireAdmin). Every diagnosis, newest first, with a
// derived status, profession/constraint, the shareable result link, and an Open action.
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function AdminReviewsPage() {
  const rows = await getAllDiagnoses()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-lg font-semibold">Diagnoses ({rows.length})</h1>
        <div className="flex items-center gap-4">
          <Link href="/admin/metrics" className="text-xs text-black/50 underline underline-offset-4">
            Time to first win →
          </Link>
          <Link href="/admin/review" className="text-xs text-black/50 underline underline-offset-4">
            Pending-only queue →
          </Link>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="text-sm text-black/60">No diagnoses yet. New diagnoses appear here, newest first.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-black/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/10 text-xs uppercase tracking-wide text-black/40">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Constraint</th>
                <th className="px-4 py-3 font-medium">Result</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-black/80">{r.email ?? '—'}</div>
                    {r.name ? <div className="text-xs text-black/40">{r.name}</div> : null}
                  </td>
                  <td className="px-4 py-3 text-black/60">{r.role ?? '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-black/60">{fmtDate(r.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className="whitespace-nowrap rounded-full bg-black/[0.06] px-2 py-0.5 text-[11px] font-medium text-black/70">
                      {DIAGNOSIS_STATUS_LABEL[r.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-black/60">
                    {r.constraintName ?? '—'}
                    {r.profession ? <span className="text-black/35"> · {humanizeDimension(r.profession)}</span> : null}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`/results/${r.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs underline underline-offset-4"
                    >
                      link ↗
                    </a>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {r.status === 'reviewing' && r.cycleId ? (
                        <ApproveDiagnosisButton cycleId={r.cycleId} />
                      ) : null}
                      <Link
                        href={`/admin/reviews/${r.id}`}
                        className="whitespace-nowrap rounded-md border border-black/15 px-2.5 py-1 text-xs hover:bg-black/5"
                      >
                        Open
                      </Link>
                      <DeleteDiagnosisButton diagnosisId={r.id} email={r.email} />
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
