import { M1_LADDER } from '@/lib/ladder'
import { PHASES } from '@/lib/ladder'

// A calm, static preview of the M1 Sprint ladder (the 9 missions across the four phases),
// for the marketing site. No user state, no scores — just the shape of the path. Renders in
// the dark instrument register (inside FocalSection).
export function SprintLadderPreview() {
  let n = 0
  return (
    <div className="flex flex-col gap-6">
      {PHASES.map((phase) => {
        const inPhase = M1_LADDER.filter((m) => m.phase === phase)
        return (
          <div key={phase}>
            <div className="mb-2 font-mono text-eyebrow uppercase tracking-[0.14em] text-s-muted">{phase}</div>
            <div className="flex flex-col gap-1.5">
              {inPhase.map((m) => {
                n += 1
                const num = n
                return (
                  <div key={m.title} className="flex items-center gap-3 rounded-lg border border-s-line px-4 py-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-s-line text-[11px] text-s-muted tabular">
                      {num}
                    </span>
                    <span className="text-sm text-s-text">{m.title}</span>
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
