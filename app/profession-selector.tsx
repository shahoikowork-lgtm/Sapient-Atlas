'use client'

import { useState } from 'react'

// Makes "we analyze YOUR work" literal: pick a field and the focus line + status
// reframes. Honest about V1: Marketing's Sprint is open; the rest get the diagnosis
// today with the Sprint opening soon. The lines describe the capability focus, not any
// fabricated outcome or metric.
type Field = { key: string; open: boolean; line: string }

const FIELDS: Field[] = [
  { key: 'Marketing', open: true, line: 'Make your positioning something a prospect can repeat: why you, not the other three.' },
  { key: 'Product', open: false, line: 'Frame the problem so sharply the solution feels obvious, with explicit non-goals.' },
  { key: 'Design', open: false, line: 'Tie the work to the outcome it moves, not the screens it produces.' },
  { key: 'Engineering', open: false, line: 'Show judgment and ownership a tool can’t replace, not just shipped tickets.' },
  { key: 'Data', open: false, line: 'Anchor the analysis on the decision it changes, not the dashboard it fills.' },
  { key: 'Growth', open: false, line: 'Run work as falsifiable experiments with a pre-committed read, not activity.' },
  { key: 'AI', open: false, line: 'Specify the task so output is reliable, with failures you can diagnose.' },
  { key: 'Founders', open: false, line: 'Tell a winning narrative a cold listener can repeat back accurately.' },
]

export function ProfessionSelector() {
  const [active, setActive] = useState(0)
  const field = FIELDS[active]

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Choose your field">
        {FIELDS.map((f, i) => {
          const on = i === active
          return (
            <button
              key={f.key}
              role="tab"
              aria-selected={on}
              onClick={() => setActive(i)}
              className={`rounded-full px-3.5 py-1.5 text-label transition-colors ${
                on
                  ? 'bg-s-accent text-s-accent-contrast'
                  : 'border border-s-line bg-s-panel text-s-text-2 hover:border-s-line-strong hover:text-s-text'
              }`}
            >
              {f.key}
            </button>
          )
        })}
      </div>

      <div className="mt-5 rounded-2xl border border-s-line bg-s-panel p-5">
        <p className="text-body-lg text-s-text">{field.line}</p>
        <p className="mt-3 text-label text-s-muted">
          {field.open ? (
            <span className="text-s-grow">Sprint open today · $149, once, no subscription.</span>
          ) : (
            'Diagnosis open today. The Sprint for this field is opening soon. Get your diagnosis now and you’re first in line.'
          )}
        </p>
      </div>
    </div>
  )
}
