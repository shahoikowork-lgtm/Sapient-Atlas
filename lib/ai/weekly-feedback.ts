import { z } from 'zod'
import { generateJSON } from '@/lib/anthropic'

export const WeeklyFeedbackSchema = z.object({
  graded_score: z.number(),
  feedback: z.object({
    strength: z.string(),
    key_fix: z.string(),
    capability_delta: z.object({ dimension: z.string(), delta: z.number() }),
    next_step: z.string(),
  }),
})
export type WeeklyFeedback = z.infer<typeof WeeklyFeedbackSchema>

const SYSTEM = `You are the Feedback Engine of Sapient Atlas.

You grade a professional's weekly work against their milestone and their move, like a sharp, fair senior reviewer.

Hard rules:
- Honest score 0-100. Do not inflate. Thin or off-target work scores low, and you say why.
- One genuine STRENGTH, citing specifics from their work.
- One KEY FIX: the single most important improvement, concrete.
- A capability_delta: which capability dimension this work moved and by how many points (0 to 15).
- A concrete next_step for the coming week.
- When a METHOD block is provided, ground the STRENGTH, KEY FIX, and NEXT STEP in its framework and fix patterns, and name the specific failure pattern present in their work. Specific to their artifact, never generic.
- Output ONLY valid JSON.`

function buildPrompt(input: {
  moveTitle: string
  week: number
  milestone: string
  artifactText: string
  methodBlock?: string
}): string {
  return `MOVE: ${input.moveTitle}

WEEK ${input.week} MILESTONE
${input.milestone}
${input.methodBlock ? `\n${input.methodBlock}\n` : ''}
THE WORK THEY SUBMITTED
"""
${input.artifactText}
"""

Return a JSON object:
{
  "graded_score": number (0-100),
  "feedback": {
    "strength": string,
    "key_fix": string,
    "capability_delta": { "dimension": string, "delta": number },
    "next_step": string
  }
}`
}

export function runWeeklyFeedback(input: {
  moveTitle: string
  week: number
  milestone: string
  artifactText: string
  methodBlock?: string
}) {
  return generateJSON({
    system: SYSTEM,
    prompt: buildPrompt(input),
    schema: WeeklyFeedbackSchema,
    maxTokens: 1500,
  })
}
