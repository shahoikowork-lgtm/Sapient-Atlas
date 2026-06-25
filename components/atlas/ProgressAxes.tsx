import type { AxisView } from '@/lib/sprint'

// The three doctrine progress axes (quality, independence, difficulty) as qualitative
// positions: a three-step fill and a word. Never a score, number, or percentage — this is
// "where you stand and which way you're moving", read from the work, not self-reported.
export function ProgressAxes({ axes }: { axes: AxisView[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {axes.map((a) => (
        <div key={a.key} className="rounded-xl border border-s-line bg-s-panel p-3.5">
          <div className="text-sm font-medium text-s-text">{a.label}</div>
          <div className="mt-2.5 flex gap-1" aria-hidden="true">
            {[1, 2, 3].map((n) => (
              <span
                key={n}
                className={`h-1 flex-1 rounded-full ${n <= a.step ? 'bg-s-accent' : 'bg-s-line'}`}
              />
            ))}
          </div>
          <div className="mt-2 text-xs text-s-muted">{a.note}</div>
        </div>
      ))}
    </div>
  )
}
