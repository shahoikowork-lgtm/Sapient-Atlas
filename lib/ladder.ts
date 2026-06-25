// Canonical Sprint ladder constants. Dependency-free so both the presentation layer
// (lib/sprint.ts) and the plan generator (lib/ai/thirty-day-plan.ts) can import it
// without a circular dependency.

export const PHASES = ['SEE', 'CROSS', 'INDEPENDENCE', 'PROVE'] as const
export type Phase = (typeof PHASES)[number]

// The M1 (Marketer · positioning) Sprint — the only active V1 constraint. Twenty-four small,
// daily-scale missions, six per phase, escalating across the four-phase arc. Titles, phases,
// and the micro-skill each mission trains are fixed here so they never drift; the AI fills
// each mission's task + success criteria for the user's own work. `micro_skill` is a slug
// from the M1 capability map (lib/atlas/constraints/m1-generic-positioning.ts), or 'full' —
// an integrative mission checked against the whole M1 bar. This is the ladder's content, not
// its logic. Pacing is completion-gated, not by count: the next opens only when this clears.
export type Rung = { title: string; phase: Phase; micro_skill: string }

export const M1_LADDER: Rung[] = [
  // SEE — make the failure mode visible on the user's own work (heavy scaffolding)
  { title: 'Rewrite Your Weakest Line', phase: 'SEE', micro_skill: 'unique_attribute' },
  { title: 'Swap-Test Your Headline', phase: 'SEE', micro_skill: 'spot_generic' },
  { title: 'Name the Alternative', phase: 'SEE', micro_skill: 'name_alternative' },
  { title: 'Name Your Buyer', phase: 'SEE', micro_skill: 'name_buyer' },
  { title: 'Name the Real Pain', phase: 'SEE', micro_skill: 'name_pain' },
  { title: 'Hunt the Empty Adjectives', phase: 'SEE', micro_skill: 'kill_adjective' },
  // CROSS — reach the first bar-clear (the valley; scaffolding coming off)
  { title: 'Find Your Unique Attribute', phase: 'CROSS', micro_skill: 'unique_attribute' },
  { title: 'Attribute to Value', phase: 'CROSS', micro_skill: 'attribute_to_value' },
  { title: 'Trade an Adjective for a Fact', phase: 'CROSS', micro_skill: 'kill_adjective' },
  { title: 'First Full Rewrite', phase: 'CROSS', micro_skill: 'full' },
  { title: 'The Exclusion Test', phase: 'CROSS', micro_skill: 'falsifiable_exclusion' },
  { title: 'Colleague Playback', phase: 'CROSS', micro_skill: 'repeatable_playback' },
  // INDEPENDENCE — reliable clears, unaided, on harder and newer work (no scaffolding)
  { title: 'New Product, Cold', phase: 'INDEPENDENCE', micro_skill: 'unique_attribute' },
  { title: 'One Sentence, No Jargon', phase: 'INDEPENDENCE', micro_skill: 'repeatable_playback' },
  { title: 'A Different Competitor', phase: 'INDEPENDENCE', micro_skill: 'falsifiable_exclusion' },
  { title: 'A Different Buyer', phase: 'INDEPENDENCE', micro_skill: 'name_buyer' },
  { title: 'Self-Grade Before You Submit', phase: 'INDEPENDENCE', micro_skill: 'full' },
  { title: 'Your Hardest Asset', phase: 'INDEPENDENCE', micro_skill: 'full' },
  // PROVE — one high-stakes independent rep, then externally validated proof (real stakes)
  { title: 'Final Unaided Rewrite', phase: 'PROVE', micro_skill: 'full' },
  { title: 'Survive the "So What?"', phase: 'PROVE', micro_skill: 'attribute_to_value' },
  { title: 'Ship It', phase: 'PROVE', micro_skill: 'full' },
  { title: 'Capture a Real Prospect’s Playback', phase: 'PROVE', micro_skill: 'repeatable_playback' },
  { title: 'The Before and After', phase: 'PROVE', micro_skill: 'full' },
  { title: 'The One Sentence for Your Boss', phase: 'PROVE', micro_skill: 'full' },
]
