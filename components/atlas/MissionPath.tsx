import Link from 'next/link'
import type { Mission, Phase } from '@/lib/sprint'
import { PHASES } from '@/lib/sprint'

// The visible journey: missions grouped into the four phases, each with a clear state.
// Only the current mission is openable. "Mission n of total" is position, not a grade.

function StatusMark({ state }: { state: Mission['state'] }) {
  const base = 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px]'
  if (state === 'done')
    return (
      <span className={`${base} bg-s-accent text-s-accent-contrast`} aria-label="Cleared">
        ✓
      </span>
    )
  if (state === 'current')
    return <span className={`${base} bg-s-accent/30 ring-2 ring-s-accent`} aria-label="Current" />
  if (state === 'review')
    return <span className={`${base} bg-s-line text-s-text-2`} aria-label="In review">◐</span>
  return <span className={`${base} border border-s-line text-s-muted`} aria-label="Locked" />
}

function statusLabel(state: Mission['state']): string {
  return state === 'done'
    ? 'Cleared'
    : state === 'current'
      ? 'This mission'
      : state === 'review'
        ? 'In review'
        : 'Locked'
}

export function MissionPath({ missions }: { missions: Mission[] }) {
  return (
    <div className="flex flex-col gap-6">
      {PHASES.map((phase: Phase) => {
        const inPhase = missions.filter((m) => m.phase === phase)
        if (inPhase.length === 0) return null
        return (
          <div key={phase}>
            <div className="mb-2 font-mono text-eyebrow uppercase tracking-[0.14em] text-s-muted">{phase}</div>
            <div className="flex flex-col">
              {inPhase.map((m) => {
                const openable = m.state === 'current'
                const row = (
                  <div
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                      m.state === 'current'
                        ? 'border-s-accent/60 bg-s-panel'
                        : 'border-s-line'
                    } ${m.state === 'locked' ? 'opacity-60' : ''}`}
                  >
                    <StatusMark state={m.state} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-s-text">
                        {m.n}. {m.title ?? `Mission ${m.n}`}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-s-muted">{statusLabel(m.state)}</span>
                    {openable ? <span className="shrink-0 text-s-accent">→</span> : null}
                  </div>
                )
                return (
                  <div key={m.week} className="py-1">
                    {openable ? (
                      <Link href="/app/checkin" className="block transition-opacity hover:opacity-90">
                        {row}
                      </Link>
                    ) : (
                      row
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
