import { z } from 'zod'
import { generateJSON } from '@/lib/anthropic'
import { BarCheckItemSchema, QUALITY } from '@/lib/atlas/rep-grade'

// The instant, per-rep bar-check (ATLAS_OS §6, layer 1). It does not coach, praise, or advise —
// it VERIFIES the user's submitted work against the stated conditions of the mission's bar and
// returns each condition pass/fail with the exact spot in their work.
//
// HARDENED (Phase 2): the grader runs SEVERAL independent passes and aggregates them by
// self-consistency. Confidence is NOT asked of the model (self-reported confidence is
// unreliable) — it is computed from inter-pass AGREEMENT, asymmetrically: a HIT is "high"
// confidence only when EVERY pass agrees (unanimous), so an auto-clear demands unanimity and
// false-positives approach zero; a not-yet verdict needs only a strong (>=2/3) majority.

// Bump on any change to the grading prompt or the aggregation, so every stored verdict is
// attributable + reproducible (CAPABILITY_SPEC Ch 11, INTELLIGENCE_LAYER §3).
export const GRADER_VERSION = '2.0.0'

const DEFAULT_PASSES = 3
const PASS_TEMPERATURE = 0.5 // sample diverse passes so agreement is a real signal (self-consistency)

type Quality = (typeof QUALITY)[number]

// One independent pass: verify the work against the bar's conditions. No self-reported confidence.
const RepPassSchema = z.object({
  quality: z.enum(QUALITY),
  bar_check: z.array(BarCheckItemSchema).min(1),
})
type RepPass = z.infer<typeof RepPassSchema>

// The aggregated verdict the gate consumes. `confidence` is calibrated inter-pass agreement.
export type RepCheck = {
  quality: Quality
  confidence: 'high' | 'low'
  bar_check: RepPass['bar_check']
  passes: number // how many passes actually returned
  agreement: number // fraction of passes that voted the winning quality (0..1)
  grader_version: string
}

const SYSTEM = `You are the bar-check of Sapient Atlas. You do not coach, praise, advise, or suggest next steps. You ONLY verify a submitted piece of real work against the stated conditions of a published bar.

Hard rules:
- Break the bar into its distinct, checkable conditions (each separate thing the bar explicitly requires).
- For EACH condition return status "pass" if the submitted work plainly meets it, else "fail". When genuinely unsure, return "fail" — the bar is strict and honest.
- When a METHOD block is provided, judge against it too: any failure pattern it names that is present in the work is a "fail", and you apply its diagnostic questions. Do not invent criteria beyond the bar and the method.
- "where": name or quote the EXACT spot in the user's OWN submitted work that decides it — what is there, or precisely what is missing. Specific to their text. Never generic.
- "quality" overall: "hit" only if every condition passes; "partial" if some pass and some fail; "miss" if none pass or the core condition fails.
- NEVER output a score, number, percentage, grade, band, or money. NEVER give advice, encouragement, or a next step. Conditions, pass/fail, where, and the verdict — nothing else.
- Output ONLY valid JSON.`

function buildPrompt(input: { missionTitle: string; bar: string; artifactText: string; methodBlock?: string }): string {
  return `MISSION: ${input.missionTitle}

THE BAR (this rep clears when):
"""
${input.bar}
"""
${input.methodBlock ? `\n${input.methodBlock}\n` : ''}
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

// Tiebreak toward the more conservative verdict (protects against false-positives).
const CONSERVATISM: Record<Quality, number> = { miss: 2, partial: 1, hit: 0 }

function aggregate(results: RepPass[]): RepCheck {
  const n = results.length
  const tally: Record<Quality, number> = { hit: 0, partial: 0, miss: 0 }
  for (const r of results) tally[r.quality]++

  // Majority verdict; on a tie, the more conservative quality wins.
  let quality: Quality = 'miss'
  let bestCount = -1
  for (const q of QUALITY) {
    if (tally[q] > bestCount || (tally[q] === bestCount && CONSERVATISM[q] > CONSERVATISM[quality])) {
      bestCount = tally[q]
      quality = q
    }
  }

  // Calibrated confidence (asymmetric — auto-clearing is the dangerous action):
  //  - a HIT is "high" ONLY if every pass agreed (unanimous) → near-zero false-positives,
  //  - a not-yet verdict ("miss"/"partial") is "high" on a strong (>=2/3) majority,
  //  - a single pass is never "high" (no agreement to measure).
  let confidence: 'high' | 'low' = 'low'
  if (n >= 2) {
    confidence = quality === 'hit' ? (tally.hit === n ? 'high' : 'low') : bestCount * 3 >= n * 2 ? 'high' : 'low'
  }

  // Show the user a real, internally-consistent bar_check from a pass that voted the verdict.
  const representative = results.find((r) => r.quality === quality) ?? results[0]
  return {
    quality,
    confidence,
    bar_check: representative.bar_check,
    passes: n,
    agreement: n ? bestCount / n : 0,
    grader_version: GRADER_VERSION,
  }
}

// Run `passes` independent passes IN PARALLEL (so reliability costs no extra latency) and
// aggregate by self-consistency. Preview uses 1 fast pass; the gate uses the default (3).
export async function runRepCheck(
  input: { missionTitle: string; bar: string; artifactText: string; methodBlock?: string },
  opts?: { passes?: number },
): Promise<RepCheck> {
  const passes = Math.max(1, opts?.passes ?? DEFAULT_PASSES)
  const settled = await Promise.allSettled(
    Array.from({ length: passes }, () =>
      generateJSON({
        system: SYSTEM,
        prompt: buildPrompt(input),
        schema: RepPassSchema,
        maxTokens: 1200,
        temperature: PASS_TEMPERATURE,
      }),
    ),
  )
  const results = settled.flatMap((s) => (s.status === 'fulfilled' ? [s.value] : []))
  if (results.length === 0) throw new Error('rep-check: all grader passes failed')
  return aggregate(results)
}
