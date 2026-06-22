import { generateJSON } from '@/lib/anthropic'
import type { Intake } from '@/lib/validation'
import { DeclineClassificationSchema } from '@/lib/atlas/decline-gate'
import { CONSTRAINTS } from '@/lib/atlas/constraints'

/**
 * Constraint matcher (Phase 2A). Given a professional's real work + the capability read, it
 * matches at most one library constraint and classifies this user's instance against the
 * four manual tests, the artifact's sufficiency, and any refused category. Its output is the
 * DeclineClassification consumed by classifyDecline(); it decides nothing about scope itself.
 */

const SYSTEM = `You are the constraint matcher of Sapient Atlas. Given a professional's real work and a fixed library of capability constraints, decide which single constraint best fits their work, whether it is a valid target for a 30-day capability sprint, and whether the work sample is even enough to judge.

Hard rules:
- Match AT MOST ONE constraint. Set matched_constraint_id to its exact id from the library, or null if none fits.
- Judge THIS person's instance against four tests: capability_shaped (the bottleneck is their own practice on their work, not their employer, market, luck, or feelings), legible_bar (what "good" looks like is checkable), reppable_on_real_work (they have real recurring work to practice on), thirty_day_movable (a month of deliberate practice can move it).
- refused_category: if the real block is not a practice-able work capability, name it — psychological (confidence, motivation, discipline), relational (another person's behavior), circumstantial (wrong company, market, pay), long_horizon (judgment whose results take longer than a month), one_shot (a single high-stakes event), or health. Otherwise "none".
- artifact_sufficient: false if the work sample is too thin to judge honestly.
- Honor each constraint's "decline this instance if" signals: if one applies, do not force the match — set the relevant test false or name the refused category.
- rationale: a short internal note for human review. It is NEVER shown to the user.
- Output ONLY valid JSON with exactly these keys: matched_constraint_id, capability_shaped, legible_bar, reppable_on_real_work, thirty_day_movable, artifact_sufficient, refused_category, rationale.`

function buildPrompt(intake: Intake, va: { observation: string; gaps: unknown }): string {
  const library = CONSTRAINTS.map(
    (c) =>
      `- ${c.id} — ${c.name}. Failure mode: ${c.observable_failure_mode} Bar: ${c.bar.definition} Decline this instance if: ${c.should_decline_if.join('; ')}.`,
  ).join('\n')

  return `CONSTRAINT LIBRARY (choose at most one id, exactly as written, or null):
${library}

PROFILE
Role: ${intake.role}
Seniority: ${intake.seniority || '—'}
Daily responsibilities: ${intake.responsibilities_daily || '—'}
Weekly responsibilities: ${intake.responsibilities_weekly || '—'}

REAL WORK SAMPLE
"""
${intake.work_sample}
"""

CAPABILITY READ (context)
Observation: ${va.observation}
Gaps: ${JSON.stringify(va.gaps)}

Return the JSON classification.`
}

export function runConstraintMatch(intake: Intake, va: { observation: string; gaps: unknown }) {
  return generateJSON({
    system: SYSTEM,
    prompt: buildPrompt(intake, va),
    schema: DeclineClassificationSchema,
    maxTokens: 1200,
  })
}
