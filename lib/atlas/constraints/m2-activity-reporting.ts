import type { Constraint } from './types'

// M2 — admitted, production-ready; not sellable until promoted (ATLAS_OS §9: V1 sells M1 only).
export const m2ActivityReporting: Constraint = {
  id: 'marketer.activity_reporting',
  code: 'M2',
  persona: 'marketer',
  name: 'Activity reporting',
  short_description: 'Reporting what was done (outputs) instead of what moved (business outcomes).',
  why_it_matters:
    'A marketer who cannot tie work to a business outcome is the first cut in a downturn and the easiest to replace with a tool. Outcome-legibility is what makes the work defensible.',
  observable_failure_mode:
    'Updates list outputs — emails sent, posts shipped, campaigns launched — and never name the business metric they moved or a falsifiable hypothesis about one.',
  decline_gate_fit: {
    capability_shaped: true,
    legible_bar: true,
    reppable_on_real_work: true,
    thirty_day_movable: true,
  },
  bar: {
    definition:
      'Every claim of work ties to a business outcome, or to an explicit falsifiable hypothesis about one, in the language a founder or finance lead uses.',
    pass_conditions: [
      'Each piece of work names the outcome it moved or the hypothesis it tested',
      'The metric is one a founder or finance lead recognizes as value',
      'A skeptical reader asking "so what moved?" is answered in the artifact itself',
    ],
    fail_conditions: [
      'The update lists activity with no outcome named',
      'The metric is a vanity proxy unconnected to value',
      'The reader is left asking "so what?"',
    ],
  },
  baseline_capture:
    "On day one the user rewrites last week's status update to lead with outcomes; this first attempt is saved as the baseline.",
  reps: {
    week_1:
      'See the failure mode: audit three recent updates and mark every line that reports activity with no business outcome attached.',
    week_2:
      'Cross the valley: reframe one real campaign as a business case — the outcome it targets and the hypothesis behind it — and reach the first update that clears the bar.',
    week_3:
      'Build independence: present a real result with its metric and an honest read of attribution, unaided, including what cannot be attributed.',
    week_4:
      'Prove it on fresh work: produce a full outcome-framed plan or report for a real initiative that a founder accepts without asking "so what moved?"',
  },
  proof:
    'A real report or brief that leads with a business outcome and survives a skeptical founder or finance reader asking "so what actually moved?"',
  recognition:
    'The user brings the outcome-framed report to the person who prices their work, framed as: "I now report what my work moves in the business, not just what I shipped," evidenced by the real report a founder accepted.',
  thirty_day_success_criteria:
    'On fresh, real work and unaided, the user frames work in outcome and business terms that a founder accepts without prompting.',
  examples_of_real_work: [
    'Weekly marketing status update',
    'Campaign wrap report',
    'Quarterly business review slide',
    'Channel performance summary',
    'Budget request memo',
  ],
  should_decline_if: [
    'The user has no access to outcome data and cannot get it (a data-access circumstance, not a capability)',
    'The real block is that the business has no measurable outcomes to tie to',
    'The constraint is actually data-analysis skill rather than outcome framing',
  ],
  not_v1_if: ['V1 sells the marketer flagship (M1) first; M2 is admitted and ready to promote.'],
  active_v1: false,
}
