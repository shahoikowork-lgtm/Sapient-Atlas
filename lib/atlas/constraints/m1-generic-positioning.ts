import type { Constraint } from './types'

// M1 — the V1 flagship and the only constraint sellable in V1 (ATLAS_OS §9).
export const m1GenericPositioning: Constraint = {
  id: 'marketer.generic_positioning',
  code: 'M1',
  persona: 'marketer',
  name: 'Generic positioning',
  short_description:
    'Claims that are equally true of any competitor — nothing a prospect can repeat as "why you."',
  why_it_matters:
    'In an AI-flooded market, undifferentiated messaging is invisible and easy to replace. The ability to make a claim only you can make is the scarce, defensible capability a marketer is kept for.',
  observable_failure_mode:
    'Every claim ("data-driven", "customer-centric", "results-focused") is equally true of three competitors; a prospect cannot finish the sentence "why you, not them."',
  decline_gate_fit: {
    capability_shaped: true,
    legible_bar: true,
    reppable_on_real_work: true,
    thirty_day_movable: true,
  },
  bar: {
    definition:
      'A prospect can repeat "why you, not them" in one sentence, and it is demonstrably false of three named competitors.',
    pass_conditions: [
      'A naive reader restates the differentiator in one sentence after a single read',
      'The claim is false of three named competitors',
      'The claim is specific and provable from the work, not a category abstraction',
    ],
    fail_conditions: [
      'A named competitor could make the same claim word for word',
      'The claim is a category truism such as "data-driven" or "customer-centric"',
      'A naive reader cannot say "why you" after one read',
    ],
  },
  baseline_capture:
    'On day one the user rewrites one live claim from their own work; this first attempt is saved as the baseline to compare against at the end of the sprint.',
  reps: {
    week_1:
      'See the failure mode: take five live claims from real assets and, for each, name the three competitors it is also true of (it will be all of them).',
    week_2:
      'Cross the valley: rewrite the claims for one real campaign until each excludes three named competitors; test "who does this exclude?" on a colleague and reach the first claim that clears the bar.',
    week_3:
      'Build independence: write a full positioning for a different product or segment, unaided, under the tighter rule of one sentence and no jargon.',
    week_4:
      'Prove it on fresh work: ship a complete positioning or page for a real launch and have a real prospect play back "why you" in their own words.',
  },
  proof:
    'A live positioning or page for real work that a real prospect or colleague can correctly distinguish from three named competitors, unaided.',
  recognition:
    'The user shows the original and rewritten positioning to the person who prices their work, framed as: "I can now write positioning a prospect repeats back and that no competitor could claim," evidenced by the real launch asset and the prospect playback.',
  thirty_day_success_criteria:
    'On fresh, real work and unaided, the user produces a differentiation claim that a naive reader repeats in one sentence and that is false of three named competitors.',
  examples_of_real_work: [
    'Homepage hero and subhead',
    'Product one-pager',
    'Sales-deck positioning slide',
    'Landing page for a live campaign',
    'Cold-outbound value proposition',
  ],
  should_decline_if: [
    'The real block is that the product genuinely has no differentiator (a product or strategy problem, not a capability)',
    'The user has no access to real positioning work to rep on during the sprint',
    'The user cannot name real competitors to test exclusion against',
    'The real constraint is confidence or visibility rather than the ability to differentiate',
  ],
  not_v1_if: [],
  active_v1: true,
}
