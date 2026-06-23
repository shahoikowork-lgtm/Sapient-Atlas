// Canonical Sprint ladder constants. Dependency-free so both the presentation layer
// (lib/sprint.ts) and the plan generator (lib/ai/thirty-day-plan.ts) can import it
// without a circular dependency.

export const PHASES = ['SEE', 'CROSS', 'INDEPENDENCE', 'PROVE'] as const
export type Phase = (typeof PHASES)[number]

// The M1 (Marketer · positioning) Sprint — the only active V1 constraint. Titles and
// phases are fixed here so they never drift; the AI fills each mission's task + success
// criteria for the user's own work. This is the ladder's content, not its logic.
export const M1_LADDER: { title: string; phase: Phase }[] = [
  { title: 'Swap Test Headline', phase: 'SEE' },
  { title: 'One Sentence Positioning', phase: 'SEE' },
  { title: 'Cold Prospect Opening', phase: 'CROSS' },
  { title: 'New Asset Transfer', phase: 'CROSS' },
  { title: 'New Segment Positioning', phase: 'INDEPENDENCE' },
  { title: 'Survive "So What?"', phase: 'INDEPENDENCE' },
  { title: 'High-Stakes Final Claim', phase: 'INDEPENDENCE' },
  { title: 'Ship It', phase: 'PROVE' },
  { title: 'Capture Reality’s Reaction', phase: 'PROVE' },
]
