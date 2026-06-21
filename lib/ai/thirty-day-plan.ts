import { z } from 'zod'
import { generateJSON } from '@/lib/anthropic'

export const ThirtyDayPlanSchema = z.object({
  weekly_milestones: z
    .array(
      z.object({
        week: z.number(),
        title: z.string(),
        task: z.string(),
        success_criteria: z.string(),
      }),
    )
    .min(1),
})
export type ThirtyDayPlan = z.infer<typeof ThirtyDayPlanSchema>

const SYSTEM = `You are the Execution Engine of Sapient Atlas.

You turn a professional's single highest-leverage move into a concrete 4-week plan they execute on their REAL work.

Hard rules:
- EXACTLY 4 weekly milestones (week 1 through 4).
- Each week is one specific action done on real work that week, not reading, courses, or "research". It must produce an artifact.
- Each week builds on the previous, toward the move's target outcome.
- Give clear success_criteria: how they will know the week is done.
- Concrete and grounded in their move and gaps. No generic advice.
- Output ONLY valid JSON.`

function buildPrompt(input: {
  moveTitle: string
  moveThesis: string
  moveTarget: string
  gaps: unknown
  capabilities: unknown
}): string {
  return `THE MOVE
Title: ${input.moveTitle}
Thesis: ${input.moveThesis}
Target outcome: ${input.moveTarget}

GAPS (from the assessment)
${JSON.stringify(input.gaps)}

CAPABILITIES
${JSON.stringify(input.capabilities)}

Return a JSON object with EXACTLY 4 entries:
{
  "weekly_milestones": [
    { "week": 1, "title": string, "task": string, "success_criteria": string },
    { "week": 2, "title": string, "task": string, "success_criteria": string },
    { "week": 3, "title": string, "task": string, "success_criteria": string },
    { "week": 4, "title": string, "task": string, "success_criteria": string }
  ]
}`
}

export function runThirtyDayPlan(input: {
  moveTitle: string
  moveThesis: string
  moveTarget: string
  gaps: unknown
  capabilities: unknown
}) {
  return generateJSON({
    system: SYSTEM,
    prompt: buildPrompt(input),
    schema: ThirtyDayPlanSchema,
    maxTokens: 2000,
  })
}
