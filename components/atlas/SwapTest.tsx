'use client'

import { motion, useReducedMotion } from 'framer-motion'

// The hero signature: the swap test, made literal. A scan reads your headline; the same line
// stamps onto three competitors and nothing breaks; the verdict seals with weight. The
// end-state is legible immediately and reduced-motion renders it whole. Content is
// illustrative of the mechanic (labeled on the page), never a real user or testimonial.
const EASE = [0.22, 1, 0.36, 1] as const
const EMPHASIS = [0.65, 0, 0.35, 1] as const

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
    <div className="relative overflow-hidden rounded-2xl border border-s-line bg-s-panel shadow-s">
      {/* the scan — the instrument reads the work, once, on arrival */}
      {!reduce ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 z-20 h-px bg-s-accent"
          style={{ boxShadow: '0 0 10px 1px var(--color-s-accent)' }}
          initial={{ top: '0%', opacity: 0 }}
          animate={{ top: '100%', opacity: [0, 0.85, 0.85, 0] }}
          transition={{ duration: 0.75, ease: EASE, times: [0, 0.12, 0.88, 1] }}
        />
      ) : null}

      {/* your line, stated once */}
      <div className="border-b border-s-line px-5 py-4">
        <div className="font-mono text-eyebrow uppercase tracking-[0.14em] text-s-muted">Your headline</div>
        <p className="mt-2 inline-block rounded bg-s-accent-tint px-2 py-1 font-mono text-[12.5px] text-s-accent-strong sm:text-[13px]">
          “{line}”
        </p>
      </div>

      {/* the swap test: the same line stamps onto three rivals' sites, nothing breaks */}
      <div className="px-4 py-4">
        <div className="px-1 font-mono text-eyebrow uppercase tracking-[0.14em] text-s-muted">
          Paste it onto their sites
        </div>
        <div className="mt-3 flex flex-col gap-1.5">
          {sites.map((site, i) => (
            <motion.div
              key={site}
              initial={reduce ? false : { opacity: 0, scale: 1.04, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.32, ease: EMPHASIS, delay: reduce ? 0 : 0.32 + i * 0.1 }}
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

      {/* the verdict — seals with weight after the rows land */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 8, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: EMPHASIS, delay: reduce ? 0 : 0.74 }}
        className="relative border-t border-s-line bg-s-accent-tint/50 px-5 py-4"
      >
        {!reduce ? (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-b-2xl ring-1 ring-s-accent"
            initial={{ opacity: 0.5, scale: 0.96 }}
            animate={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.82 }}
          />
        ) : null}
        <div className="font-mono text-eyebrow uppercase tracking-[0.14em] text-s-accent">
          The one thing holding it back
        </div>
        <p className="mt-1.5 text-h2 text-s-text">{verdictTitle}</p>
        <p className="mt-1 max-w-[42ch] text-body text-s-text-2">{verdictDetail}</p>
      </motion.div>
    </div>
  )
}
