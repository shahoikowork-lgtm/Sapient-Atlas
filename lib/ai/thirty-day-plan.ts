import { z } from 'zod'
import { generateJSON } from '@/lib/anthropic'
import { PROOF_OVER_ADJECTIVES } from '@/lib/ai/voice'
import { M1_LADDER } from '@/lib/ladder'
import { getConstraintByCode } from '@/lib/atlas/constraints'

// V1 sells one constraint: Marketer · M1 (positioning). The Sprint is the fixed 24-mission
// M1 ladder. Titles, phases, and each mission's focus micro-skill are pinned in code
// (M1_LADDER) so they never drift; the model only personalizes each mission's `task` (the
// rep on the user's real work) and `success_criteria` (their bar). Progression is
// completion-gated downstream; here we only author the content.

const RungSchema = z.object({
  title: z.string().optional(),
  task: z.string(),
  steps: z.array(z.string()).max(4).optional(),
  success_criteria: z.string(),
})

export const ThirtyDayPlanSchema = z.object({
  weekly_milestones: z
    .array(
      z.object({
        week: z.number(),
        title: z.string(),
        task: z.string(),
        steps: z.array(z.string()).optional(),
        success_criteria: z.string(),
        phase: z.string().optional(),
        micro_skill: z.string().optional(),
      }),
    )
    .min(1),
})
export type ThirtyDayPlan = z.infer<typeof ThirtyDayPlanSchema>

const GenSchema = z.object({ missions: z.array(RungSchema).min(1) })

const LADDER_LIST = M1_LADDER.map((m, i) => `${i + 1}. ${m.title} (phase: ${m.phase}, focus: ${m.micro_skill})`).join('\n')

// Legend so the model knows what each mission's focus micro-skill means (from the M1 map).
const MICRO_LEGEND = [
  ...(getConstraintByCode('M1')?.capability_map?.micro_skills ?? []).map(
    (m) => `- ${m.id}: ${m.name} — clears when ${m.bar.clears_when}`,
  ),
  '- full: integrative — the whole claim clears the full bar (a prospect repeats why-you, false of three named competitors).',
].join('\n')

const SYSTEM = `You are the Execution Engine of Sapient Atlas.

The user is on the Marketer positioning Sprint: a fixed ladder of small missions, each a ~10-minute rep done on the user's REAL work, escalating across four phases (SEE -> CROSS -> INDEPENDENCE -> PROVE).

Each mission trains ONE named micro-skill (its "focus"), given with the ladder and explained in the legend. The titles, order, phases, and focus are FIXED. Do not rename, reorder, add, or drop any. For EACH mission, write:
- task: ONE short sentence naming the single ~10-minute action of this move on ONE piece of the user's real work (one headline, one opener, one section) that exercises THIS mission's focus micro-skill — the directive, scannable at a glance. Not a paragraph, not a 40-minute project, not reading or research.
- steps: 2 to 4 short imperative steps (a few words each) for how to do it on their real work. Concrete and specific, no filler.
- success_criteria: how they will know this rep cleared the bar, in concrete checkable terms true to the focus micro-skill. One or two sentences.

Hard rules:
- Output exactly one entry per mission listed below, in the given order.
- MISSION 1 is the day-one win: its task is to rewrite the single weakest, most generic line taken from the user's OWN submitted work (shown below) so a named competitor could not also claim it. Quote that exact line in the task. Doable in ~10 minutes.
- Every move is ~10 minutes on one small artifact, low activation energy. Tiny and near-daily, never a 40-minute project.
- Grounded in the user's move, gaps, named competitor, and submitted work. No generic advice.
- Each builds on the last toward the move's target outcome.
- PATTERN, NOT ANSWER: each task teaches a reusable move the user can repeat alone on new work (e.g. "make any line a competitor cannot copy"), never a one-off answer to memorize.
- ESCALATE across the ladder: withdraw the scaffolding (more help early, blank and unaided by INDEPENDENCE) and raise the stakes (a private draft early, a live page a real prospect reads by PROVE). Name the change plainly in the task.
- Output ONLY valid JSON.`

function buildPrompt(input: {
  moveTitle: string
  moveThesis: string
  moveTarget: string
  competitor: string
  gaps: unknown
  capabilities: unknown
  workSample: string
}): string {
  const count = M1_LADDER.length
  return `THE MOVE
Title: ${input.moveTitle}
Thesis: ${input.moveThesis}
Target outcome: ${input.moveTarget}
Their named competitor: ${input.competitor || '—'}

GAPS (from the assessment)
${JSON.stringify(input.gaps)}

CAPABILITIES
${JSON.stringify(input.capabilities)}

MICRO-SKILL LEGEND (what each mission's focus means)
${MICRO_LEGEND}

THE USER'S SUBMITTED WORK (take Mission 1's weakest line from this)
"""
${input.workSample || '(no work sample on file)'}
"""

THE ${count} MISSIONS (fixed titles + focus, in order)
${LADDER_LIST}

Return JSON with exactly ${count} entries, in this order, one per mission above:
{
  "missions": [
    { "task": string, "steps": string[], "success_criteria": string }
    // ...${count} total, aligned to missions 1..${count}
  ]
}`
}

export async function runThirtyDayPlan(input: {
  moveTitle: string
  moveThesis: string
  moveTarget: string
  competitor?: string
  gaps: unknown
  capabilities: unknown
  workSample: string
}): Promise<ThirtyDayPlan> {
  const gen = await generateJSON({
    system: `${SYSTEM}\n\n${PROOF_OVER_ADJECTIVES}`,
    prompt: buildPrompt({ ...input, competitor: input.competitor ?? '' }),
    schema: GenSchema,
    maxTokens: 4000,
  })

  // Pin titles, phases, and focus micro-skill from the canonical ladder; zip in the model's
  // per-mission detail by index. Titles/phase/focus are guaranteed exact regardless of model
  // drift; missing detail degrades safely to a grounded fallback so the plan always has all
  // the missions.
  const weekly_milestones = M1_LADDER.map((rung, i) => {
    const detail = gen.missions[i]
    return {
      week: i + 1,
      title: rung.title,
      phase: rung.phase,
      micro_skill: rung.micro_skill,
      task: detail?.task ?? `Apply "${rung.title}" to a real piece of your current work.`,
      steps: detail?.steps,
      success_criteria:
        detail?.success_criteria ?? 'A real prospect or colleague can tell why you, not a competitor.',
    }
  })

  return { weekly_milestones }
}
