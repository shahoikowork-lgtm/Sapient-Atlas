import { z } from 'zod'
import { generateJSON } from '@/lib/anthropic'

export const ReratingSchema = z.object({
  value_low: z.number(),
  value_mid: z.number(),
  value_high: z.number(),
  currency: z.string().default('USD'),
  confidence: z.enum(['low', 'medium', 'high']),
  confidence_reason: z.string(),
  trajectory: z.enum(['rising', 'holding', 'slipping']),
  ai_exposure: z.number().min(0).max(1),
  capability_scores: z.record(z.string(), z.object({ score: z.number(), evidence: z.string() })),
  observation: z.string(),
  proof_summary: z.string(),
  prediction_eval: z.object({
    verdict: z.enum(['hit', 'partial', 'miss']),
    actual_capability_delta: z.object({ dimension: z.string(), from: z.number(), to: z.number() }),
    actual_value_delta: z.number(),
    learning: z.string(),
  }),
  next_move: z.object({
    title: z.string(),
    thesis: z.string(),
    target_outcome: z.string(),
    reasoning: z.string(),
    confidence: z.enum(['low', 'medium', 'high']),
  }),
})
export type Rerating = z.infer<typeof ReratingSchema>

const SYSTEM = `You are the Re-Rating Engine of Sapient Atlas.

After a sprint, you re-rate the professional's market value based on the REAL work they completed, and you grade the original prediction honestly.

Hard rules:
- Ranges, not points (low/mid/high annual USD). Confidence explicit.
- Grade the prediction: hit | partial | miss. Be honest. If they did not actually improve, say MISS or PARTIAL. Do NOT fake gains.
- A flat or downward re-rating is a valid, honest outcome. Never inflate value to please the user.
- capability_scores: updated scores, each with evidence from the submitted work.
- proof_summary: the concrete work that supports the change (or the lack of it).
- next_move: the single next highest-leverage move.
- Output ONLY valid JSON.`

function buildPrompt(input: {
  original: { value_low: number; value_mid: number; value_high: number; capability_scores: unknown; gaps: unknown }
  moveTitle: string
  moveTarget: string
  prediction: { pred_capability_delta: unknown; pred_value_delta: unknown } | null
  submissions: { week: number; score: unknown; feedback: unknown; work: string }[]
}): string {
  const work = input.submissions
    .map((s) => `Week ${s.week} (scored ${s.score}/100):\nFeedback: ${JSON.stringify(s.feedback)}\nWork: ${s.work}`)
    .join('\n\n')
  return `ORIGINAL ASSESSMENT (start of sprint)
Value: ${input.original.value_low}-${input.original.value_high} (mid ${input.original.value_mid})
Capabilities: ${JSON.stringify(input.original.capability_scores)}
Gaps: ${JSON.stringify(input.original.gaps)}

THE MOVE
${input.moveTitle}. Target: ${input.moveTarget}

THE PREDICTION MADE AT THE START
${input.prediction ? JSON.stringify(input.prediction) : 'none recorded'}

WORK COMPLETED (reviewed weekly submissions)
${work || 'none'}

Re-rate honestly. Return a JSON object:
{
  "value_low": number, "value_mid": number, "value_high": number, "currency": "USD",
  "confidence": "low|medium|high", "confidence_reason": string,
  "trajectory": "rising|holding|slipping", "ai_exposure": number(0..1),
  "capability_scores": { "<dimension>": { "score": number, "evidence": string } },
  "observation": string,
  "proof_summary": string,
  "prediction_eval": {
    "verdict": "hit|partial|miss",
    "actual_capability_delta": { "dimension": string, "from": number, "to": number },
    "actual_value_delta": number,
    "learning": string
  },
  "next_move": { "title": string, "thesis": string, "target_outcome": string, "reasoning": string, "confidence": "low|medium|high" }
}`
}

export function runMonthlyRerating(input: {
  original: { value_low: number; value_mid: number; value_high: number; capability_scores: unknown; gaps: unknown }
  moveTitle: string
  moveTarget: string
  prediction: { pred_capability_delta: unknown; pred_value_delta: unknown } | null
  submissions: { week: number; score: unknown; feedback: unknown; work: string }[]
}) {
  return generateJSON({
    system: SYSTEM,
    prompt: buildPrompt(input),
    schema: ReratingSchema,
    maxTokens: 2500,
  })
}
