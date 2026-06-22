import { generateJSON } from '@/lib/anthropic'
import type { Intake } from '@/lib/validation'
import { DeclineClassificationSchema } from '@/lib/atlas/decline-gate'
import { PROFESSION_MAP } from '@/lib/atlas/profession-map'

/**
 * Constraint matcher. A professional from ANY of the nine digital fields submits real work;
 * this matches the single dominant constraint from the cross-profession catalog, judges it
 * against the four manual tests + artifact sufficiency + any refused category, and emits the
 * DeclineClassification consumed by classifyDecline(). It decides nothing about scope or
 * sellability itself — the Decline Gate does that (only M1 is sellable in V1).
 */

const SYSTEM = `You are the constraint matcher of Sapient Atlas. A professional from any digital field submits their real work. Identify the SINGLE capability constraint, from a fixed cross-profession catalog, that most limits their growth — then judge whether it is a valid target for a 30-day capability sprint and whether the work sample is even enough to judge.

Hard rules:
- Match AT MOST ONE constraint. Set matched_code to its EXACT code from the catalog (e.g. "M1", "D1", "DA1"), or null if nothing fits. Also return matched_name and profession from that same catalog row (or null).
- Judge THIS person's instance against four tests: capability_shaped (the bottleneck is their own practice on their work, not their employer, market, luck, or feelings), legible_bar (what "good" looks like is checkable), reppable_on_real_work (they have real recurring work to practice on), thirty_day_movable (a month of deliberate practice can move it).
- refused_category: if the real block is not a practice-able work capability, name it — psychological (confidence, motivation, discipline), relational (another person's behavior), circumstantial (wrong company, market, pay), long_horizon (judgment whose results take longer than a month), one_shot (a single high-stakes event), or health. Otherwise "none".
- artifact_sufficient: false if the work sample is too thin to judge honestly.
- rationale: a short internal note for human review. It is NEVER shown to the user.
- Output ONLY valid JSON with exactly these keys: matched_code, matched_name, profession, capability_shaped, legible_bar, reppable_on_real_work, thirty_day_movable, artifact_sufficient, refused_category, rationale.`

function buildPrompt(intake: Intake, va: { observation: string; gaps: unknown }): string {
  const catalog = PROFESSION_MAP.map(
    (e) => `- ${e.code} [${e.profession}] ${e.name}: ${e.signal}`,
  ).join('\n')

  return `CONSTRAINT CATALOG (choose at most one code, exactly as written, or null):
${catalog}

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
    maxTokens: 1400,
  })
}
