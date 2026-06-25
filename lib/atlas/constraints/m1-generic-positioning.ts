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
  // The capability map — the design-time-approved spine the runtime feedback engine is
  // bound to. The nine micro-skills decompose Differentiation into the smallest practiceable
  // moves; each is one mission's bar, lesson, and the single approved correction the AI may
  // give. This is the same Dunford/Moore/Ogilvy method above, restructured so the runtime
  // never improvises — it only checks a published bar and offers a pre-approved fix.
  capability_map: {
    capability: 'Differentiation',
    skill: 'Make a claim a named competitor cannot also make',
    micro_skills: [
      {
        id: 'spot_generic',
        name: 'Spot the generic claim',
        mistake: 'You cannot see which of your own lines a competitor could copy word for word.',
        bar: {
          clears_when: 'You can point to the exact lines a named competitor could put on their own site untouched.',
          pass_conditions: [
            'Names specific lines from the work that are generic',
            'For each, a named competitor could use it verbatim',
          ],
          fail_conditions: [
            'Marks nothing, or marks lines that are actually specific to you',
            'Cannot say which competitor could also claim it',
          ],
        },
        example: 'Flagged: "the all-in-one platform for modern teams" because Intercom and Zendesk could both run that exact line.',
        counterexample: 'Left "the all-in-one platform for modern teams" standing as if it were yours alone.',
        mission_type: 'Swap test',
        proof_kind: 'self',
        fix: 'Mark the line a named competitor could paste on their own site, untouched.',
      },
      {
        id: 'name_buyer',
        name: 'Name the buyer',
        mistake: 'The work is written for "everyone", so it lands with no one.',
        bar: {
          clears_when: 'You name one specific best-fit buyer the work is for.',
          pass_conditions: [
            'Names a specific buyer by role and situation',
            'Not "everyone", "businesses", or "modern teams"',
          ],
          fail_conditions: ['The audience is "everyone" or a vague group', 'No buyer is named at all'],
        },
        example: 'Support leads at Series-B SaaS drowning in repeat tickets.',
        counterexample: 'For modern teams who want to move faster.',
        mission_type: 'Name it',
        proof_kind: 'self',
        fix: 'Say who exactly this is for in five words: a role and their situation.',
      },
      {
        id: 'name_alternative',
        name: 'Name the alternative',
        mistake: 'You never name what the buyer would use instead of you.',
        bar: {
          clears_when: 'You name the specific thing the buyer would use if you did not exist.',
          pass_conditions: ['Names a real alternative: a named rival, a spreadsheet, or doing nothing'],
          fail_conditions: ['No alternative named', 'Claims "no one else does this" with nothing behind it'],
        },
        example: 'Without us they would stitch together Zendesk macros by hand.',
        counterexample: 'We are the only solution out there.',
        mission_type: 'Name it',
        proof_kind: 'self',
        fix: 'Name the one thing they would use if you did not exist: a rival, a sheet, or nothing.',
      },
      {
        id: 'name_pain',
        name: 'Name the specific pain',
        mistake: 'You state a benefit without the specific pain it removes.',
        bar: {
          clears_when: 'You name the exact problem the buyer feels, in their own words.',
          pass_conditions: ['Names a concrete, specific pain the buyer would recognize as theirs'],
          fail_conditions: ['A vague benefit such as "save time" with no specific pain', 'Pain is generic to any buyer'],
        },
        example: 'Reps paste the wrong objection rebuttal mid-chat and lose the deal.',
        counterexample: 'Helps your team be more efficient.',
        mission_type: 'Name it',
        proof_kind: 'self',
        fix: 'Write the exact problem in the buyer’s own words, not a benefit.',
      },
      {
        id: 'unique_attribute',
        name: 'Find the unique attribute',
        mistake: 'Your claim rests on an attribute a competitor shares.',
        bar: {
          clears_when: 'You state one fact that is true of you and false of the named alternative.',
          pass_conditions: ['States a concrete attribute, a fact and not a benefit', 'False of the named alternative'],
          fail_conditions: ['The attribute is a benefit, not a fact', 'A named rival could claim the same attribute'],
        },
        example: 'We turn your call recordings into the objection snippets reps paste mid-chat.',
        counterexample: 'We are powerful and easy to use.',
        mission_type: 'Find it',
        proof_kind: 'self',
        fix: 'Find the one true thing only you can say: a fact, not an adjective.',
      },
      {
        id: 'attribute_to_value',
        name: 'Connect attribute to value',
        mistake: 'You list a feature with no value the buyer pays for.',
        bar: {
          clears_when: 'You tie the attribute to what the buyer actually pays for.',
          pass_conditions: ['The attribute is linked to a value the named buyer prices', 'Reads as "X, which means you can Y"'],
          fail_conditions: ['A feature stated with no value', 'The value is generic, not what this buyer pays for'],
        },
        example: 'So your reps handle objections live instead of escalating, and fewer deals slip.',
        counterexample: 'With advanced AI-powered analytics.',
        mission_type: 'Connect',
        proof_kind: 'self',
        fix: 'Finish the sentence "which means you can ___" in the buyer’s terms.',
      },
      {
        id: 'kill_adjective',
        name: 'Kill the empty adjective',
        mistake: 'An empty adjective stands where a checkable fact belongs.',
        bar: {
          clears_when: 'Every vague adjective is replaced by a specific, checkable fact.',
          pass_conditions: ['No empty adjectives such as powerful, seamless, or leading', 'Each claim is a fact a reader could check'],
          fail_conditions: ['Relies on adjectives a reader cannot verify', 'Uses "best", "leading", or "world-class" with nothing behind it'],
        },
        example: 'At sixty miles an hour the loudest sound is the electric clock.',
        counterexample: 'This car is whisper-quiet and best-in-class.',
        mission_type: 'Proof over adjectives',
        proof_kind: 'self',
        fix: 'Swap the adjective for the specific fact: not "fast" but "saves two hours".',
      },
      {
        id: 'falsifiable_exclusion',
        name: 'Make it false of competitors',
        mistake: 'The claim sounds good but is not provably false of rivals.',
        bar: {
          clears_when: 'The claim is demonstrably false of three named competitors.',
          pass_conditions: ['Three real competitors are named', 'Each one plainly could not make the same claim'],
          fail_conditions: ['Fewer than three named, or rivals left unnamed', 'At least one named rival could claim it too'],
        },
        example: 'Tested against Zendesk, Intercom, and Help Scout, none turn calls into mid-chat snippets.',
        counterexample: 'We are better than the other tools.',
        mission_type: 'Exclusion test',
        proof_kind: 'colleague',
        fix: 'Name three real competitors and confirm each one cannot claim this line.',
      },
      {
        id: 'repeatable_playback',
        name: 'Make it repeatable',
        mistake: 'A stranger cannot repeat why-you after a single read.',
        bar: {
          clears_when: 'A naive reader plays back "why you" in one sentence after one read.',
          pass_conditions: ['One person restates the differentiator in a sentence', 'Their restatement is accurate and unaided'],
          fail_conditions: ['The reader cannot say why you', 'The restatement is vague or wrong'],
        },
        example: 'A prospect: "Oh, you are the one that turns support calls into the snippets reps paste live."',
        counterexample: 'A prospect: "So it is a support tool?"',
        mission_type: 'Playback test',
        proof_kind: 'external',
        fix: 'Get one person to say it back in their own words, then fix what they miss.',
      },
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
