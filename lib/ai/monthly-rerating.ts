import { z } from 'zod'
import { generateJSON } from '@/lib/anthropic'
import { PROOF_OVER_ADJECTIVES } from '@/lib/ai/voice'

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

const SYSTEM = `You are the Re-Rating Engine of Sapient Atlas, a capability intelligence system.

After a sprint, you re-read the professional's CAPABILITY based on the REAL work they completed, and you grade the original prediction honestly.

Hard rules:
- CAPABILITY, NOT PRICE. Your prose (observation, confidence_reason, proof_summary, learning, and every capability "evidence" string) must be about capability and the evidence for it. NEVER write market value, valuation, salary, compensation, income, dollar amounts, "worth", or projected financial gains. Business metrics from the work may appear only as supporting evidence, never as the conclusion.
- NO NUMBERS OR KEYS IN PROSE. In your prose never state a capability score, a 0-100 value, or a percentage, and never write a snake_case key (write "analytical reasoning", not "analytical_reasoning"). Describe capability through evidence and qualitative judgment.
- Grade the prediction: hit | partial | miss. Be honest. If they did not actually improve, say MISS or PARTIAL. Do NOT fake gains.
- A flat or downward re-read is a valid, honest outcome. Never inflate to please the user.
- Ground the verdict in the day-1 line versus the completed work, and in the micro-skills cleared: the constraint moved only if the failure mode visible in the day-1 line is gone across the later reps, unaided. Name what is still missing on a partial or a miss.
- capability_scores: updated scores, each with evidence from the submitted work.
- proof_summary: the concrete work that supports the change (or the lack of it).
- next_move: the single next highest-leverage move, framed as capability.
- value_low / value_mid / value_high and actual_value_delta are retained ONLY as an internal signal for human review and are never shown to the user; provide rough estimates but never reference money or worth in your prose.
- Output ONLY valid JSON.`

function buildPrompt(input: {
  original: { value_low: number; value_mid: number; value_high: number; capability_scores: unknown; gaps: unknown }
  moveTitle: string
  moveTarget: string
  prediction: { pred_capability_delta: unknown; pred_value_delta: unknown } | null
  submissions: { week: number; score: unknown; feedback: unknown; work: string }[]
  clearedSkills: string[]
  day1Line: string
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

THE DAY-1 LINE THEY STARTED FROM (their original weak positioning — the "before")
${input.day1Line || 'not recorded'}

THE PREDICTION MADE AT THE START
${input.prediction ? JSON.stringify(input.prediction) : 'none recorded'}

WORK COMPLETED (reviewed weekly submissions — the "after")
${work || 'none'}

MICRO-SKILLS THE USER CLEARED ON REAL WORK (each a bar they passed)
${input.clearedSkills.length ? input.clearedSkills.map((s) => `- ${s}`).join('\n') : 'none recorded'}

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
  clearedSkills: string[]
  day1Line: string
}) {
  return generateJSON({
    system: `${SYSTEM}\n\n${PROOF_OVER_ADJECTIVES}`,
    prompt: buildPrompt(input),
    schema: ReratingSchema,
    maxTokens: 2500,
  })
}
