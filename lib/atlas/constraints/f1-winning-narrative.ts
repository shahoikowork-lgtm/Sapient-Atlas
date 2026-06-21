import type { Constraint } from './types'

// F1 — admitted, production-ready; not sellable until promoted (ATLAS_OS §9: V1 sells M1 only).
export const f1WinningNarrative: Constraint = {
  id: 'founder.winning_narrative',
  code: 'F1',
  persona: 'founder',
  name: 'Unclear winning narrative',
  short_description: 'Cannot compress the company into a sharp story a listener can repeat.',
  why_it_matters:
    "A founder who cannot tell the story cannot raise, recruit, or sell. The narrative is the founder's primary instrument of leverage, and no one can do it for them.",
  observable_failure_mode:
    'The pitch is a feature list or a meandering origin story; a listener cannot repeat the problem, why now, or why this team wins.',
  decline_gate_fit: {
    capability_shaped: true,
    legible_bar: true,
    reppable_on_real_work: true,
    thirty_day_movable: true,
  },
  bar: {
    definition:
      'A naive listener repeats the problem, why-now, and why-this-team-wins in three sentences, unprompted.',
    pass_conditions: [
      'A first-time listener plays back the problem, why-now, and why-team in three sentences',
      'The playback is accurate, not a vague gist',
      'The narrative survives the single hardest objection without collapsing',
    ],
    fail_conditions: [
      'The listener repeats features or history instead of the thesis',
      'The listener cannot say why now or why this team',
      'The story falls apart under the first hard question',
    ],
  },
  baseline_capture:
    'On day one the user pitches to two real people and asks each to repeat it back; the gap between intent and playback is saved as the baseline.',
  reps: {
    week_1:
      'See the failure mode: pitch to two people, record what they repeat back, and mark exactly where the problem, why-now, or why-team failed to land.',
    week_2:
      'Cross the valley: write the three-sentence version and test it on real people until one of them repeats it accurately — the first clear of the bar.',
    week_3:
      'Build independence: deliver the full narrative arc to a naive listener and handle the single hardest objection in a real conversation, unaided.',
    week_4:
      'Prove it on fresh work: deliver the narrative in a real high-stakes context (an investor meeting, an all-hands, or a recruit close) where a cold listener repeats the thesis back.',
  },
  proof:
    'A real pitch — deck, email, or recorded conversation — where a cold, first-time listener accurately plays back the problem, why-now, and why-team.',
  recognition:
    'The narrative itself does the recognizing: the user deploys it to investors, recruits, or customers, and the proof is those listeners repeating it accurately and acting on it.',
  thirty_day_success_criteria:
    'On a fresh audience and unaided, the user delivers a narrative a cold listener repeats accurately and that survives the top objection.',
  examples_of_real_work: [
    'Investor pitch deck',
    'Cold investor intro email',
    'Recruiting pitch to a candidate',
    'All-hands company narrative',
    'Customer sales narrative',
  ],
  should_decline_if: [
    'The real block is that the strategy itself is unclear (a strategy problem, not a storytelling capability)',
    'The user has no real audience to pitch to during the sprint',
    'The constraint is actually confidence on stage rather than the narrative itself',
  ],
  not_v1_if: ['V1 sells the marketer flagship (M1) first; F1 is admitted and ready to promote.'],
  active_v1: false,
}
