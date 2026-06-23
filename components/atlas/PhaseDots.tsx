import type { Mission, Phase } from '@/lib/sprint'
import { PHASES } from '@/lib/sprint'

// The four-phase progress indicator: SEE · CROSS · INDEPENDENCE · PROVE. Shows location
// in the Sprint, never a score. A phase reads done (all its missions cleared), active
// (the current mission is in it), or upcoming.
function phaseState(missions: Mission[], phase: Phase): 'done' | 'active' | 'upcoming' {
  const inPhase = missions.filter((m) => m.phase === phase)
  if (inPhase.length === 0) return 'upcoming'
  if (inPhase.some((m) => m.state === 'current' || m.state === 'review')) return 'active'
  if (inPhase.every((m) => m.state === 'done')) return 'done'
  if (inPhase.some((m) => m.state === 'done')) return 'active'
  return 'upcoming'
}

export function PhaseDots({ missions }: { missions: Mission[] }) {
  return (
    <div className="flex items-center gap-3">
      {PHASES.map((p) => {
        const st = phaseState(missions, p)
        const dot =
          st === 'done'
            ? 'bg-s-accent'
            : st === 'active'
              ? 'bg-s-accent/40 ring-2 ring-s-accent'
              : 'bg-s-line'
        const text = st === 'upcoming' ? 'text-s-muted' : 'text-s-text-2'
        return (
          <div key={p} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true" />
            <span className={`font-mono text-[10px] uppercase tracking-[0.12em] ${text}`}>{p}</span>
          </div>
        )
      })}
    </div>
  )
}
