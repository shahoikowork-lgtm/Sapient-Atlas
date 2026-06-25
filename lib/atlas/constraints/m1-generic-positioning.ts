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
      'The claim rests on a unique attribute that is false of three named competitors',
      'That attribute is tied to a value the best-fit buyer actually cares about, not a feature for its own sake',
      'The claim is specific and provable from the work, not a category abstraction',
    ],
    fail_conditions: [
      'A named competitor could make the same claim word for word',
      'The claim is a category truism such as "data-driven" or "customer-centric"',
      'It states a benefit with no unique attribute behind it',
      'A naive reader cannot say "why you" after one read',
    ],
  },
  method: {
    source:
      'Distilled from April Dunford, Obviously Awesome (competitive alternatives, unique attributes, value, best-fit market), Geoffrey Moore positioning template (Crossing the Chasm), and David Ogilvy (proof over adjectives).',
    framework: [
      'Alternative: name what the buyer would use instead of you, a named rival, a spreadsheet, or doing nothing.',
      'Unique attribute: something true of you and false of that alternative, a fact, not a benefit.',
      'Value: what that attribute unlocks that this buyer actually pays for.',
      'Best-fit buyer: the one who cares most about that value.',
      'Differentiated is not different words, it is a true thing only you can say that the buyer prices.',
    ],
    worked_examples: [
      {
        context: 'Support SaaS',
        before: 'The modern platform for customer support teams.',
        before_why:
          'A category truism, equally true of Zendesk, Intercom, and Help Scout, so a prospect cannot tell you apart.',
        after:
          'The only support tool that turns your call recordings into the objection-handling snippets your reps paste mid-chat.',
        after_why: 'Rests on a unique attribute the named rivals do not have, tied to a value the support lead prices.',
      },
      {
        context: 'Marketing analytics',
        before: 'Data-driven marketing that delivers results.',
        before_why: 'A benefit with no mechanism behind it, and every agency says it.',
        after:
          'The only team that ties each campaign to a pre-registered revenue hypothesis, so your CFO sees the number it moved.',
        after_why: 'A real, ownable attribute mapped to value the economic buyer cares about.',
      },
      {
        context: 'Proof over adjectives (any claim)',
        before: 'This car is silent.',
        before_why: 'An adjective with no proof, the reader cannot check it and does not feel it.',
        after: 'At sixty miles an hour the loudest sound is the electric clock.',
        after_why: 'Names a specific, checkable fact that cannot be faked, and makes the reader feel the silence.',
      },
    ],
    failure_patterns: [
      'Category truism: data-driven, customer-centric, AI-powered, best-in-class.',
      'Benefit with no mechanism: a value claim with no unique attribute behind it.',
      'Shared attribute: a fact a named alternative could claim word for word.',
      'Unproven superlative: best, leading, world-class with nothing behind it.',
      'Feature dump: attributes with no value and no buyer named.',
      'Inward jargon: internal language no buyer would use.',
      'Adjective standing in for a fact: an empty descriptor (powerful, premium, seamless, best-in-class) where a specific, checkable proof belongs.',
    ],
    diagnostic_questions: [
      'What would this buyer use if you did not exist? Name it.',
      'What is true of you that is false of that alternative?',
      'What does that attribute unlock that this buyer would pay for?',
      'Could a named competitor put this exact sentence on their own site?',
      'After one read, can a stranger say why you, not them?',
    ],
    fix_patterns: [
      'Replace the truism with the one mechanism only you have.',
      'Add the missing attribute behind the benefit: we do X because we have [unique attribute].',
      'If the rival shares the attribute, go to the specific version only you can claim.',
      'Cut every line a named competitor could also write.',
      'Swap the adjective for the specific checkable thing: not fast but saves two hours, not trusted but who trusted it, not durable but what it survived.',
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
