import { z } from 'zod'
import { generateJSON } from '@/lib/anthropic'
import { M1_LADDER } from '@/lib/ladder'

// V1 sells one constraint: Marketer · M1 (positioning). The Sprint is the fixed 9-mission
// M1 ladder. The titles and phases are pinned in code (M1_LADDER) so they never drift; the
// model only personalizes each mission's `task` (the rep on the user's real work) and
// `success_criteria` (their bar). The progression logic and the ladder are unchanged.

const RungSchema = z.object({
  title: z.string().optional(),
  task: z.string(),
  success_criteria: z.string(),
})

export const ThirtyDayPlanSchema = z.object({
  weekly_milestones: z
    .array(
      z.object({
        week: z.number(),
        title: z.string(),
        task: z.string(),
        success_criteria: z.string(),
        phase: z.string().optional(),
      }),
    )
    .min(1),
})
export type ThirtyDayPlan = z.infer<typeof ThirtyDayPlanSchema>

const GenSchema = z.object({ missions: z.array(RungSchema).min(1) })

const LADDER_LIST = M1_LADDER.map((m, i) => `${i + 1}. ${m.title} (phase: ${m.phase})`).join('\n')

const SYSTEM = `You are the Execution Engine of Sapient Atlas.

The user is on the Marketer positioning Sprint: a fixed ladder of 9 missions, each a small rep done on the user's REAL work, escalating across four phases (SEE → CROSS → INDEPENDENCE → PROVE).

The 9 mission titles are FIXED and given to you. Do not rename, reorder, add, or drop any. For EACH of the 9, write:
- task: one specific action done on the user's real campaigns/pages this rep, producing an artifact. Not reading, not research, not courses.
- success_criteria: how they will know this rep cleared the bar, in concrete, checkable terms.

Hard rules:
- Exactly 9 missions, in the given order.
- Grounded in the user's move and gaps. No generic advice.
- Each builds on the last toward the move's target outcome.
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

THE 9 MISSIONS (fixed titles, in order)
${LADDER_LIST}

Return JSON with exactly 9 entries, in this order, one per mission above:
{
  "missions": [
    { "task": string, "success_criteria": string }
    // ...9 total, aligned to missions 1..9
  ]
}`
}

export async function runThirtyDayPlan(input: {
  moveTitle: string
  moveThesis: string
  moveTarget: string
  gaps: unknown
  capabilities: unknown
}): Promise<ThirtyDayPlan> {
  const gen = await generateJSON({
    system: SYSTEM,
    prompt: buildPrompt(input),
    schema: GenSchema,
    maxTokens: 2500,
  })

  // Pin titles + phases from the canonical ladder; zip in the model's per-mission detail by
  // index. Titles are guaranteed exact regardless of model drift; missing detail degrades
  // safely to a grounded fallback so the plan always has all 9 missions.
  const weekly_milestones = M1_LADDER.map((rung, i) => {
    const detail = gen.missions[i]
    return {
      week: i + 1,
      title: rung.title,
      phase: rung.phase,
      task: detail?.task ?? `Apply "${rung.title}" to a real piece of your current work.`,
      success_criteria:
        detail?.success_criteria ?? 'A real prospect or colleague can tell why you, not a competitor.',
    }
  })

  return { weekly_milestones }
}
