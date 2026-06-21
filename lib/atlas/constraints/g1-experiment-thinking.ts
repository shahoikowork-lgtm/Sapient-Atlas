import type { Constraint } from './types'

// G1 — admitted, production-ready; not sellable until promoted (ATLAS_OS §9: V1 sells M1 only).
export const g1ExperimentThinking: Constraint = {
  id: 'growth_operator.experiment_thinking',
  code: 'G1',
  persona: 'growth_operator',
  name: 'Runs activity, not experiments',
  short_description: 'Runs tactics with no hypothesis or threshold, so nothing can be learned.',
  why_it_matters:
    'Growth without falsifiable experiments is just spending. An operator who cannot run a real experiment cannot compound learning and is indistinguishable from luck.',
  observable_failure_mode:
    'Tactics are launched with no stated hypothesis and no success threshold set in advance; results are described as "it kind of worked" with no learning extracted.',
  decline_gate_fit: {
    capability_shaped: true,
    legible_bar: true,
    reppable_on_real_work: true,
    thirty_day_movable: true,
  },
  bar: {
    definition:
      'Every growth action is a falsifiable experiment: a hypothesis, a metric, a threshold, and a read of hit or miss committed before the result is known.',
    pass_conditions: [
      'The action states a hypothesis that could be wrong',
      'A metric and a pass threshold are set before launch',
      'After the result, the hit-or-miss read and the learning are explicit',
    ],
    fail_conditions: [
      'No hypothesis is stated',
      'No threshold is set in advance',
      'The result yields no clear learning',
    ],
  },
  baseline_capture:
    'On day one the user takes one live tactic and tries to write its hypothesis and threshold; the difficulty of doing so after the fact is the baseline.',
  reps: {
    week_1:
      'See the failure mode: take three recent tactics and try to reconstruct a hypothesis and threshold for each — and notice you cannot do it cleanly.',
    week_2:
      'Cross the valley: convert one live tactic into a pre-registered experiment — hypothesis, metric, threshold — and launch it. The first clear.',
    week_3:
      'Build independence: design a sharper experiment that isolates a single variable, and read the result honestly, unaided.',
    week_4:
      'Prove it on fresh work: run a real experiment that drives a decision, with a clean pre-committed hit-or-miss verdict and the learning it produced.',
  },
  proof:
    'A real experiment document with a pre-registered hypothesis and threshold and an honest post-read that a data-literate peer accepts as sound.',
  recognition:
    'The user shares the experiment and its honest read with whoever prices their work, framed as: "I now run growth as falsifiable experiments that compound into learning, not one-off tactics," evidenced by the pre-registered document and verdict.',
  thirty_day_success_criteria:
    'On a fresh growth question and unaided, the user runs a pre-registered, falsifiable experiment and extracts the learning that changes the next decision.',
  examples_of_real_work: [
    'Channel test plan',
    'Landing-page experiment',
    'Lifecycle email test',
    'Pricing or paywall test',
    'Onboarding funnel experiment',
  ],
  should_decline_if: [
    'The user lacks the access or traffic to run a real experiment during the sprint',
    'The real block is the analytics or tooling, not experimental thinking',
    'The constraint is actually picking the right metric (see G2) rather than experimental rigor',
  ],
  not_v1_if: ['V1 sells the marketer flagship (M1) first; G1 is admitted and ready to promote.'],
  active_v1: false,
}
