import type { Mission } from '@/lib/sprint'
import { derivePhaseJourney } from '@/lib/sprint'

// The Sprint shown as a path the user can see: the four phases (See, Cross, Independence,
// Prove), each cleared / current / upcoming, with the current one marked "you are here".
// A pure projection of the same missions, never a score.
function titleCase(phase: string) {
  return phase.charAt(0) + phase.slice(1).toLowerCase()
}

export function SprintJourney({ missions }: { missions: Mission[] }) {
  const steps = derivePhaseJourney(missions)

  return (
    <div className="flex flex-col">
      {steps.map((s, i) => {
        const last = i === steps.length - 1
        const done = s.state === 'done'
        const active = s.state === 'current' || s.state === 'review'
        return (
          <div key={s.phase} className="flex gap-3.5">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] ${
                  done
                    ? 'bg-s-accent text-s-accent-contrast'
                    : active
                      ? 'bg-s-accent/20 text-s-accent ring-2 ring-s-accent'
                      : 'border border-s-line text-s-muted'
                }`}
                aria-hidden="true"
              >
                {done ? '✓' : active ? '▸' : ''}
              </span>
              {!last ? (
                <span
                  className={`w-px flex-1 ${done ? 'bg-s-accent/40' : 'bg-s-line'}`}
                  style={{ minHeight: 14 }}
                  aria-hidden="true"
                />
              ) : null}
            </div>
            <div className={last ? '' : 'pb-4'}>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className={`text-sm font-medium ${active ? 'text-s-text' : 'text-s-text-2'}`}>
                  {titleCase(s.phase)}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-s-muted">
                  week {s.week}
                  {done ? ' · cleared' : active ? ' · you are here' : ''}
                </span>
              </div>
              <div className="mt-0.5 text-[13px] leading-relaxed text-s-muted">{s.description}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
