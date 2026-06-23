import Link from 'next/link'
import { getAppUser } from '@/lib/app-user'
import { getWorkspace } from '@/lib/app-data'
import { ensureSprintPlan, deriveMissions } from '@/lib/sprint'
import { Eyebrow, MissionPath } from '@/components/atlas'

export const dynamic = 'force-dynamic'

export default async function PathPage() {
  const user = await getAppUser()
  if (user) await ensureSprintPlan(user)
  const { move, plan, submissions } = await getWorkspace()
  const { missions, current, cleared, total } = deriveMissions(plan, submissions)

  if (!move) {
    return (
      <div>
        <Eyebrow>Path</Eyebrow>
        <p className="mt-3 text-body text-s-text-2">
          No active Sprint yet. <Link href="/app" className="underline underline-offset-4">Back to Now</Link>
        </p>
      </div>
    )
  }

  return (
    <div>
      <Eyebrow>Path</Eyebrow>
      <h1 className="mt-2 text-h2 text-s-text">{move.title}</h1>
      <p className="mt-1 text-label text-s-muted tabular">
        Mission {current?.n ?? cleared} of {total} · {cleared} cleared
      </p>

      <div className="mt-7">
        {missions.length > 0 ? (
          <MissionPath missions={missions} />
        ) : (
          <p className="rounded-xl border border-dashed border-s-line p-4 text-body text-s-muted">
            Preparing your missions… refresh in a moment.
          </p>
        )}
      </div>
    </div>
  )
}
