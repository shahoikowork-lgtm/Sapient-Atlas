import { z } from 'zod'
import { generateJSON } from '@/lib/anthropic'
import type { Intake } from '@/lib/validation'
import type { ValueAssessment } from '@/lib/ai/value-assessment'

// Maps to the moves table (+ a nested prediction that maps to the predictions table).
export const OpportunitySchema = z.object({
  title: z.string(),
  thesis: z.string(),
  target_outcome: z.string(),
  leverage_score: z.number(),
  confidence: z.enum(['low', 'medium', 'high']),
  reasoning: z.string(),
  deferred_alternatives: z.array(z.object({ title: z.string(), why_deferred: z.string() })),
  prediction: z.object({
    pred_capability_delta: z.object({
      dimension: z.string(),
      from: z.number(),
      to: z.number(),
    }),
    pred_value_delta: z.number(),
    confidence: z.enum(['low', 'medium', 'high']),
    horizon_days: z.number().default(30),
  }),
})

export type Opportunity = z.infer<typeof OpportunitySchema>

const SYSTEM = `You are the Opportunity Engine of Sapient Atlas, a capability intelligence system.

Given a professional's profile, real work sample, and capability read, you identify the SINGLE highest-leverage move that will most improve their CAPABILITY within 30 days.

Hard rules:
- EXACTLY ONE move. Not a menu. The one with the best capability gain per unit of effort.
- CAPABILITY, NOT PRICE. title, thesis, target_outcome and reasoning must be about capability, execution, and leverage. NEVER write market value, valuation, salary, compensation, income, dollar amounts, "worth", or projected financial gains. Business metrics may appear only as evidence from the work, never as the goal.
- NO NUMBERS OR KEYS IN PROSE. In title, thesis, target_outcome and reasoning, never state a capability score, a 0-100 value, or a percentage (e.g., not "a score of 82"), and never write a snake_case key (write "analytical reasoning", not "analytical_reasoning"). Describe capability qualitatively.
- Ground it in their biggest constraint and their actual work — reference specifics.
- Provide a FALSIFIABLE 30-day prediction: one capability dimension moving from X to Y. This is checked later. Be honest; do not inflate.
- State confidence (low|medium|high) and evidence-based reasoning.
- deferred_alternatives are the moves you considered and rejected, with why. These stay internal and are never shown to the user.
- pred_value_delta is retained ONLY as an internal signal and is never shown to the user; provide a rough estimate but never reference money or worth in any prose.
- Output ONLY valid JSON.`

function buildPrompt(intake: Intake, va: ValueAssessment): string {
  return `PROFILE
Role: ${intake.role} | Seniority: ${intake.seniority || '—'} | Goal: ${intake.goal || '—'} | Target: ${intake.target || '—'}
Daily responsibilities: ${intake.responsibilities_daily || '—'}
Weekly responsibilities: ${intake.responsibilities_weekly || '—'}

REAL WORK SAMPLE
"""
${intake.work_sample}
"""

VALUE ASSESSMENT (from the Value Engine)
${JSON.stringify(va)}

Return a JSON object with EXACTLY these keys:
{
  "title": string, "thesis": string, "target_outcome": string,
  "leverage_score": number, "confidence": "low|medium|high", "reasoning": string,
  "deferred_alternatives": [ { "title": string, "why_deferred": string } ],
  "prediction": {
    "pred_capability_delta": { "dimension": string, "from": number, "to": number },
    "pred_value_delta": number, "confidence": "low|medium|high", "horizon_days": 30
  }
}`
}

export function runOpportunityRanking(intake: Intake, va: ValueAssessment) {
  return generateJSON({
    system: SYSTEM,
    prompt: buildPrompt(intake, va),
    schema: OpportunitySchema,
    maxTokens: 2000,
  })
}
