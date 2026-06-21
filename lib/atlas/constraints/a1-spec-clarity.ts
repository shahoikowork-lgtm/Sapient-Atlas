import type { Constraint } from './types'

// A1 — admitted, production-ready; not sellable until promoted (ATLAS_OS §9: V1 sells M1 only).
export const a1SpecClarity: Constraint = {
  id: 'ai_operator.spec_clarity',
  code: 'A1',
  persona: 'ai_operator',
  name: 'Specification ambiguity',
  short_description: 'Cannot specify a task precisely enough to get reliable AI output.',
  why_it_matters:
    "The AI operator's core leverage is precise specification. Vague specs produce unreliable systems, and an operator who only re-rolls until something looks right adds no durable value over a casual user — the opposite of hard to replace.",
  observable_failure_mode:
    'Prompts and specs are under-constrained, output varies run to run, failures are handled by re-rolling rather than tightening the spec, and the operator cannot say why it failed.',
  decline_gate_fit: {
    capability_shaped: true,
    legible_bar: true,
    reppable_on_real_work: true,
    thirty_day_movable: true,
  },
  bar: {
    definition:
      'A task is specified precisely enough that output is reliable across cases and any failure is diagnosable to a specific gap in the spec, not to luck.',
    pass_conditions: [
      'The spec states explicit constraints and includes worked examples',
      'Output is consistent across a set of real test cases',
      'A failure can be traced to a named gap in the spec',
    ],
    fail_conditions: [
      'The spec is under-constrained or example-free',
      'Output varies unpredictably across runs',
      'Failures are met with re-rolling rather than a spec fix',
    ],
  },
  baseline_capture:
    'On day one the user runs one live prompt several times and documents the variance; that variance is saved as the baseline.',
  reps: {
    week_1:
      'See the failure mode: run one real prompt several times, document how much the output varies, and locate the ambiguity causing it.',
    week_2:
      'Cross the valley: rewrite the spec with explicit constraints and worked examples, build a small set of real test cases, and reach consistent output — the first clear.',
    week_3:
      'Build independence: specify a genuinely new task to reliability, unaided, and when it fails, trace the failure to the spec rather than to luck.',
    week_4:
      'Prove it on fresh work: ship a real, reliable AI workflow whose consistency is demonstrated across cases and trusted by a technical peer.',
  },
  proof:
    'A real AI workflow plus its test cases showing reliable output across cases, with failures traced to the spec, accepted by a technical peer.',
  recognition:
    'The user shows the workflow and its test cases to whoever prices their work, framed as: "I can specify AI tasks to measurable reliability and diagnose failures to the spec," evidenced by the working, peer-trusted workflow.',
  thirty_day_success_criteria:
    'On a fresh task and unaided, the user specifies an AI workflow to measurable reliability and diagnoses any failure to a specific gap in the spec.',
  examples_of_real_work: [
    'A production prompt or prompt chain',
    'An extraction or classification task',
    'A drafting or rewriting workflow',
    'An agent tool definition',
    'A retrieval-augmented answer task',
  ],
  should_decline_if: [
    'The user has no real AI task to build during the sprint',
    'The real block is the model capability ceiling, not specification',
    'The constraint is actually evaluation discipline (see A2) rather than specification',
  ],
  not_v1_if: ['V1 sells the marketer flagship (M1) first; A1 is admitted and ready to promote.'],
  active_v1: false,
}
