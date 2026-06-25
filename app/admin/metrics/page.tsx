import { getTimeToFirstWin } from '@/lib/metrics'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Admin-only (the /admin layout calls requireAdmin). The one number to run the business on:
// time from sprint start to the user's first submitted rep (their first felt win).
export default async function MetricsPage() {
  const { rows, medianHours } = await getTimeToFirstWin()

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold">Time to first win</h1>
        <p className="mt-1 text-sm text-black/55">
          Hours from sprint start (plan generated) to the first submitted rep, the first felt win. Drive it down.
        </p>
      </div>

      <div className="rounded-xl border border-black/10 p-4">
        <div className="text-xs uppercase tracking-wide text-black/40">Median across sprints</div>
        <div className="mt-1 text-2xl font-semibold">{medianHours == null ? '—' : `${medianHours}h`}</div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-black/60">No sprint has a submitted rep yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-black/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/10 text-xs uppercase tracking-wide text-black/40">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 text-right font-medium">First win</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-black/5 last:border-0">
                  <td className="px-4 py-3 text-black/70">{r.email ?? '—'}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-black/80">{r.hours}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
