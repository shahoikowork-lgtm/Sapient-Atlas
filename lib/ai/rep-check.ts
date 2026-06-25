import { z } from 'zod'
import { generateJSON } from '@/lib/anthropic'
import { BarCheckItemSchema, QUALITY } from '@/lib/atlas/rep-grade'

// The instant, per-rep bar-check (ATLAS_OS §6, layer 1). It does not coach, praise, or
// advise — it VERIFIES the user's submitted work against the stated conditions of the
// mission's bar and returns each condition pass/fail with the exact spot in their work.
// Because it only checks conditions the bar already published, it crosses no human-review
// gate and is shown live on submit. The substantive note is a separate, gated layer.
export const RepCheckSchema = z.object({
  quality: z.enum(QUALITY), // hit | partial | miss overall — qualitative, never a score
  bar_check: z.array(BarCheckItemSchema).min(1),
})
export type RepCheck = z.infer<typeof RepCheckSchema>

const SYSTEM = `You are the bar-check of Sapient Atlas. You do not coach, praise, advise, or suggest next steps. You ONLY verify a submitted piece of real work against the stated conditions of a published bar.

Hard rules:
- Break the bar into its distinct, checkable conditions (each separate thing the bar explicitly requires).
- For EACH condition return status "pass" if the submitted work plainly meets it, else "fail". When genuinely unsure, return "fail" — the bar is strict and honest.
- "where": name or quote the EXACT spot in the user's OWN submitted work that decides it — what is there, or precisely what is missing. Specific to their text. Never generic.
- "quality" overall: "hit" only if every condition passes; "partial" if some pass and some fail; "miss" if none pass or the core condition fails.
- NEVER output a score, number, percentage, grade, band, or money. NEVER give advice, encouragement, or a next step. Conditions, pass/fail, and where — nothing else.
- Output ONLY valid JSON.`

function buildPrompt(input: { missionTitle: string; bar: string; artifactText: string }): string {
  return `MISSION: ${input.missionTitle}

THE BAR (this rep clears when):
"""
${input.bar}
"""

THE WORK THEY SUBMITTED:
"""
${input.artifactText}
"""

Return JSON only:
{
  "quality": "hit" | "partial" | "miss",
  "bar_check": [ { "condition": string, "status": "pass" | "fail", "where": string } ]
}`
}

export function runRepCheck(input: { missionTitle: string; bar: string; artifactText: string }) {
  return generateJSON({
    system: SYSTEM,
    prompt: buildPrompt(input),
    schema: RepCheckSchema,
    maxTokens: 1200,
  })
}
