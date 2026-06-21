import type { Constraint } from './types'

// P1 — admitted, production-ready; not sellable until promoted (ATLAS_OS §9: V1 sells M1 only).
export const p1ProblemFraming: Constraint = {
  id: 'product_manager.problem_framing',
  code: 'P1',
  persona: 'product_manager',
  name: 'Weak problem framing',
  short_description: 'Jumps to solutions; the problem statement is mushy and success is undefined.',
  why_it_matters:
    "A product manager's leverage is framing. A mushy problem produces wasted engineering and a success no one can falsify; sharp framing is the capability that makes a product manager hard to replace.",
  observable_failure_mode:
    'The PRD opens with a solution, the "problem" is a feature request in disguise, non-goals are absent, and success is not falsifiable.',
  decline_gate_fit: {
    capability_shaped: true,
    legible_bar: true,
    reppable_on_real_work: true,
    thirty_day_movable: true,
  },
  bar: {
    definition:
      'The problem is stated so sharply that the solution feels obvious, non-goals are explicit, and success is a falsifiable metric.',
    pass_conditions: [
      'An engineer reads the problem and the solution feels obvious',
      'Non-goals are explicit and load-bearing',
      'Success is stated as a falsifiable metric, not a vibe',
    ],
    fail_conditions: [
      'The statement opens with a solution',
      'Non-goals are missing or trivial',
      'Success cannot be falsified',
    ],
  },
  baseline_capture:
    "On day one the user rewrites one live PRD's problem statement; this first attempt is saved as the baseline.",
  reps: {
    week_1:
      'See the failure mode: audit three live PRDs and highlight every place a solution is stated as a problem and every missing non-goal.',
    week_2:
      'Cross the valley: rewrite one live PRD\'s problem to the bar and test "is the solution obvious now?" on an engineer — the first clear.',
    week_3:
      'Build independence: take a genuinely new, ambiguous ask and frame it cold, adding explicit non-goals and a falsifiable success metric.',
    week_4:
      'Prove it on fresh work: write a full PRD for a real upcoming initiative whose framing an engineering lead validates as unusually clear.',
  },
  proof:
    'A real PRD an engineering lead confirms is unusually clear on problem, non-goals, and falsifiable success.',
  recognition:
    'The user shows the original and rewritten PRD to their lead or stakeholders, framed as: "My problem statements are now sharp enough that the solution is obvious and success is falsifiable," evidenced by the engineering lead sign-off.',
  thirty_day_success_criteria:
    'On a fresh, ambiguous problem and unaided, the user writes a problem statement that passes the obvious-solution, explicit-non-goals, falsifiable-success bar.',
  examples_of_real_work: [
    'Feature PRD',
    'One-page problem brief',
    'RFC or design-doc intro',
    'Roadmap initiative writeup',
    'Bug-versus-feature triage note',
  ],
  should_decline_if: [
    'The user does not write or own problem docs in their role (no real reps available)',
    'The real block is stakeholder politics deciding priorities, not framing',
    'The constraint is actually prioritization (see P2) rather than framing a single problem',
  ],
  not_v1_if: ['V1 sells the marketer flagship (M1) first; P1 is admitted and ready to promote.'],
  active_v1: false,
}
