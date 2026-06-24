'use client'

import { motion, useReducedMotion } from 'framer-motion'

// The hero signature: the swap test, made literal. Your headline, pasted onto three
// competitors' sites, and nothing breaks. If the same line is true of all of them, it
// never said why you. One quick motion on load; the end-state is legible immediately and
// reduced-motion renders it whole. Content is illustrative of the mechanic (labeled on the
// page), never a real user or testimonial.
const EASE = [0.22, 1, 0.36, 1] as const

export function SwapTest({
  line,
  sites,
  verdictTitle,
  verdictDetail,
}: {
  line: string
  sites: string[]
  verdictTitle: string
  verdictDetail: string
}) {
  const reduce = useReducedMotion()
  return (
    <div className="overflow-hidden rounded-2xl border border-s-line bg-s-panel shadow-s">
      {/* your line, stated once */}
      <div className="border-b border-s-line px-5 py-4">
        <div className="font-mono text-eyebrow uppercase tracking-[0.14em] text-s-muted">Your headline</div>
        <p className="mt-2 inline-block rounded bg-s-accent-tint px-2 py-1 font-mono text-[12.5px] text-s-accent-strong sm:text-[13px]">
          “{line}”
        </p>
      </div>

      {/* the swap test: the same line on three rivals' sites, nothing breaks */}
      <div className="px-4 py-4">
        <div className="px-1 font-mono text-eyebrow uppercase tracking-[0.14em] text-s-muted">
          Paste it onto their sites
        </div>
        <div className="mt-3 flex flex-col gap-1.5">
          {sites.map((site, i) => (
            <motion.div
              key={site}
              initial={reduce ? false : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : 0.15 + i * 0.13 }}
              className="flex items-center gap-3 rounded-lg border border-s-line px-3 py-2.5"
            >
              <span className="w-24 shrink-0 truncate font-mono text-[11px] text-s-muted">{site}</span>
              <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-s-text-2">“{line}”</span>
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-s-muted">
                nothing breaks
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* the verdict */}
      <div className="border-t border-s-line bg-s-accent-tint/50 px-5 py-4">
        <div className="font-mono text-eyebrow uppercase tracking-[0.14em] text-s-accent">
          The one thing holding it back
        </div>
        <p className="mt-1.5 text-h2 text-s-text">{verdictTitle}</p>
        <p className="mt-1 max-w-[42ch] text-body text-s-text-2">{verdictDetail}</p>
      </div>
    </div>
  )
}
