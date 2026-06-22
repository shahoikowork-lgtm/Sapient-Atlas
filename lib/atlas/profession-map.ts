/**
 * The Atlas Profession Map — a lightweight, data-only catalog of every known constraint
 * across the nine digital professions (BAR_LIBRARY.md + the Profession Map).
 *
 * Purpose: let diagnosis identify the dominant constraint for ANY digital professional, and
 * let the Decline Gate tell `waitlist` (a known, not-yet-active constraint) from
 * `out_of_scope` (nothing on the map matched). It carries names + a one-line signal for
 * matching — NOT bars, reps, or sellability beyond the `active_v1` flag. Full bar/rep data
 * lives only on authored constraints (today: M1). Only M1 is `active_v1: true`.
 */

export const PROFESSIONS = [
  'marketing',
  'product_management',
  'design',
  'software_engineering',
  'data_analytics',
  'growth',
  'sales',
  'ai_operator',
  'founder',
] as const
export type Profession = (typeof PROFESSIONS)[number]

export type CatalogEntry = {
  code: string // e.g. 'M1', 'P1', 'D1', 'DA1', 'SA1'
  name: string
  profession: Profession
  signal: string // one-line observable failure mode, for matching
  active_v1: boolean // sellable in V1 — only M1
}

export const PROFESSION_MAP: CatalogEntry[] = [
  // Marketing
  { code: 'M1', name: 'Generic positioning', profession: 'marketing', active_v1: true, signal: "claims any competitor could make; no 'why you'" },
  { code: 'M2', name: 'Activity reporting', profession: 'marketing', active_v1: false, signal: 'reports outputs, not the business outcome moved' },
  { code: 'M3', name: 'ICP clarity', profession: 'marketing', active_v1: false, signal: 'speaks to everyone; no one excluded' },
  { code: 'M4', name: 'Messaging', profession: 'marketing', active_v1: false, signal: 'features, not the change for the reader' },
  { code: 'M5', name: 'Experiment design', profession: 'marketing', active_v1: false, signal: 'tactics with no hypothesis or threshold' },
  // Product Management
  { code: 'P1', name: 'Weak problem framing', profession: 'product_management', active_v1: false, signal: 'opens with a solution; no falsifiable success' },
  { code: 'P2', name: 'Roadmap as wishlist', profession: 'product_management', active_v1: false, signal: "everything 'high'; no trade-off reasoning" },
  { code: 'P3', name: 'No falsifiable success metric', profession: 'product_management', active_v1: false, signal: "success can't be falsified" },
  { code: 'P4', name: 'Decision narrative', profession: 'product_management', active_v1: false, signal: "can't win buy-in from the written case" },
  { code: 'P5', name: 'Discovery rigor', profession: 'product_management', active_v1: false, signal: 'builds on assumption; problem unvalidated' },
  // Design
  { code: 'D1', name: 'Decoration not decision', profession: 'design', active_v1: false, signal: 'design serves no user/business decision' },
  { code: 'D2', name: 'Solution before problem', profession: 'design', active_v1: false, signal: 'jumps to UI before the user problem' },
  { code: 'D3', name: 'No rationale', profession: 'design', active_v1: false, signal: "can't defend choices beyond 'looks better'" },
  { code: 'D4', name: 'Unmeasured usability', profession: 'design', active_v1: false, signal: 'ships without a falsifiable usability claim' },
  { code: 'D5', name: 'Handoff ambiguity', profession: 'design', active_v1: false, signal: "specs an engineer can't build from" },
  // Software Engineering
  { code: 'E1', name: 'Unclear design doc', profession: 'software_engineering', active_v1: false, signal: "reviewers can't tell the decision or trade-off" },
  { code: 'E2', name: 'No test discipline', profession: 'software_engineering', active_v1: false, signal: 'ships without a falsifiable test' },
  { code: 'E3', name: 'Unreadable change', profession: 'software_engineering', active_v1: false, signal: "PRs reviewers can't follow" },
  { code: 'E4', name: 'Tech problem framing', profession: 'software_engineering', active_v1: false, signal: 'solution before constraints and non-goals' },
  { code: 'E5', name: 'Poor decomposition', profession: 'software_engineering', active_v1: false, signal: "can't break work into verifiable steps" },
  // Data Analytics
  { code: 'DA1', name: 'Numbers not decisions', profession: 'data_analytics', active_v1: false, signal: 'analysis drives no decision' },
  { code: 'DA2', name: 'No sharp question', profession: 'data_analytics', active_v1: false, signal: 'analysis with no falsifiable question' },
  { code: 'DA3', name: 'No causal discipline', profession: 'data_analytics', active_v1: false, signal: 'treats correlation as cause' },
  { code: 'DA4', name: 'Unreadable report', profession: 'data_analytics', active_v1: false, signal: "stakeholders can't read the 'so what'" },
  { code: 'DA5', name: 'No metric definition', profession: 'data_analytics', active_v1: false, signal: 'vanity or ambiguous metrics' },
  // Growth
  { code: 'G1', name: 'Activity not experiments', profession: 'growth', active_v1: false, signal: 'tactics with no pre-registered read' },
  { code: 'G2', name: 'Vanity metrics', profession: 'growth', active_v1: false, signal: 'celebrates proxies, ignores the value metric' },
  { code: 'G3', name: 'Retention-blind', profession: 'growth', active_v1: false, signal: 'acquisition only; no retention causal chain' },
  { code: 'G4', name: 'No activation definition', profession: 'growth', active_v1: false, signal: "can't define the aha moment" },
  { code: 'G5', name: 'No funnel hypothesis', profession: 'growth', active_v1: false, signal: 'local optimization, no system model' },
  // Sales
  { code: 'SA1', name: 'Feature-dump pitch', profession: 'sales', active_v1: false, signal: "pitches features, not the buyer's problem" },
  { code: 'SA2', name: 'No discovery rigor', profession: 'sales', active_v1: false, signal: "doesn't surface the real pain" },
  { code: 'SA3', name: 'No qualification discipline', profession: 'sales', active_v1: false, signal: 'chases bad-fit deals' },
  { code: 'SA4', name: 'Weak written follow-up', profession: 'sales', active_v1: false, signal: "can't advance a deal in writing" },
  { code: 'SA5', name: 'No value narrative', profession: 'sales', active_v1: false, signal: 'no business case for the buyer' },
  // AI Operators
  { code: 'A1', name: 'Spec ambiguity', profession: 'ai_operator', active_v1: false, signal: 'under-constrained prompts; output varies' },
  { code: 'A2', name: 'No evaluation discipline', profession: 'ai_operator', active_v1: false, signal: 'ships on vibes; no eval' },
  { code: 'A3', name: 'No failure taxonomy', profession: 'ai_operator', active_v1: false, signal: 'failures uncategorized' },
  { code: 'A4', name: 'Ungrounded retrieval', profession: 'ai_operator', active_v1: false, signal: "answers don't trace to a source" },
  { code: 'A5', name: 'Poor task decomposition', profession: 'ai_operator', active_v1: false, signal: 'one giant prompt, not reliable steps' },
  // Founders
  { code: 'F1', name: 'Unclear winning narrative', profession: 'founder', active_v1: false, signal: 'pitch is a feature list' },
  { code: 'F2', name: 'Cannot say no', profession: 'founder', active_v1: false, signal: 'nine priorities; nothing killed' },
  { code: 'F3', name: 'Vague ICP', profession: 'founder', active_v1: false, signal: "no clear who-it's-for" },
  { code: 'F4', name: 'No crisp wedge', profession: 'founder', active_v1: false, signal: 'no beachhead or why-now' },
  { code: 'F5', name: 'No falsifiable strategy', profession: 'founder', active_v1: false, signal: 'strategy as vibes, no testable bet' },
]

const byCode = new Map(PROFESSION_MAP.map((e) => [e.code, e]))

/** Resolve a catalog entry by code. Returns undefined for null/unknown codes. */
export function getCatalogEntry(code: string | null | undefined): CatalogEntry | undefined {
  return code ? byCode.get(code) : undefined
}

/** True only for a code that is on the map AND sellable in V1 (M1 today). */
export function isActiveV1Code(code: string | null | undefined): boolean {
  const e = getCatalogEntry(code)
  return !!e && e.active_v1
}

/** True if the code names a known Atlas constraint (any profession, active or not). */
export function isKnownCode(code: string | null | undefined): boolean {
  return !!getCatalogEntry(code)
}

export function catalogCodes(): string[] {
  return PROFESSION_MAP.map((e) => e.code)
}
