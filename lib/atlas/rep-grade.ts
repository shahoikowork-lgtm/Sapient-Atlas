import { z } from 'zod'

/**
 * RepGrade — the per-rep proof object + user-facing projection (Phase 1, inert).
 *
 * In Phase 2 this is stored inside submissions.feedback (jsonb). The three axes (quality,
 * independence, difficulty) are the doctrine's progress axes, read from the artifact. The
 * user-facing projection is qualitative ONLY: no numbers, scores, bands, or money — and the
 * internal axes (independence, difficulty, failure_mode_present, evidence quote) are omitted.
 * Pure; no DB; not wired anywhere.
 */

const SLUG_RE = /^[a-z_]+\.[a-z_]+$/ // a constraint id, e.g. marketer.generic_positioning

export const BarCheckItemSchema = z.object({
  condition: z.string().min(1), // a pass_condition from the bar
  status: z.enum(['pass', 'fail']),
  where: z.string().min(1), // the exact spot in the user's own work
})
export type BarCheckItem = z.infer<typeof BarCheckItemSchema>

export const QUALITY = ['hit', 'partial', 'miss'] as const
export const INDEPENDENCE = ['heavy_scaffolding', 'light_scaffolding', 'independent'] as const
export const DIFFICULTY = ['low_stakes', 'real_stakes', 'high_stakes'] as const

export const RepGradeSchema = z.object({
  rep_id: z.string().min(1),
  submission_id: z.string().min(1),
  constraint_id: z.string().regex(SLUG_RE),
  bar_check: z.array(BarCheckItemSchema).min(1),
  quality: z.enum(QUALITY), // qualitative, never a score
  independence: z.enum(INDEPENDENCE),
  difficulty: z.enum(DIFFICULTY),
  failure_mode_present: z.boolean(),
  evidence_from_work: z.string().min(1),
  reviewer_note: z.string().min(1),
  next_rep_focus: z.string().min(1),
})
export type RepGrade = z.infer<typeof RepGradeSchema>

export const QUALITY_LABEL: Record<(typeof QUALITY)[number], string> = {
  hit: 'Cleared the bar',
  partial: 'Partly there',
  miss: 'Not yet',
}

export type UserFacingRepGrade = {
  quality_label: string
  bar_check: { condition: string; cleared: boolean; where: string }[]
  reviewer_note: string
  next_rep_focus: string
}

/**
 * Project a RepGrade to what the user sees: hit/partial/miss as words, the bar conditions
 * as cleared / not-cleared with where they live, and the surgical note. No score, number,
 * band, or money. Internal axes and the raw evidence quote are deliberately omitted.
 */
export function toUserFacingRepGrade(g: RepGrade): UserFacingRepGrade {
  return {
    quality_label: QUALITY_LABEL[g.quality],
    bar_check: g.bar_check.map((b) => ({
      condition: b.condition,
      cleared: b.status === 'pass',
      where: b.where,
    })),
    reviewer_note: g.reviewer_note,
    next_rep_focus: g.next_rep_focus,
  }
}

/** The displayed strings, for linting (must be free of numbers / scores / money / bands). */
export function userFacingRepGradeStrings(v: UserFacingRepGrade): string[] {
  return [
    v.quality_label,
    ...v.bar_check.flatMap((b) => [b.condition, b.where]),
    v.reviewer_note,
    v.next_rep_focus,
  ]
}

// ── Instant per-rep bar-check (ATLAS_OS §6, layer 1) ────────────────────────────
// The ungated, mechanical layer: the bar rendered as a checklist, each condition cleared /
// not-cleared with where it lives in the user's own work, plus the qualitative verdict. No
// score, number, band, or money, and no coaching — pure verification against the published
// bar, so it crosses no human-review gate and is shown immediately on submit. The
// substantive note (reviewer_note / next_rep_focus) stays behind the weekly gate.
export type UserFacingRepCheck = {
  quality_label: string
  items: { condition: string; cleared: boolean; where: string }[]
}

export function toUserFacingRepCheck(c: {
  quality: (typeof QUALITY)[number]
  bar_check: BarCheckItem[]
}): UserFacingRepCheck {
  return {
    quality_label: QUALITY_LABEL[c.quality],
    items: c.bar_check.map((b) => ({ condition: b.condition, cleared: b.status === 'pass', where: b.where })),
  }
}
