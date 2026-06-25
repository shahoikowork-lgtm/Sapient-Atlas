import { z } from 'zod'
import { generateJSON } from '@/lib/anthropic'

// Two raw signals pulled from the user's submitted work, used to start their sprint from
// their OWN material instead of a blank box: the weakest line (their day-1 baseline) and the
// competitor to run the swap test against. No judgment, no rewriting — just extraction.
export const SignalsSchema = z.object({
  weak_line: z.string(), // the single weakest / most generic line, copied verbatim from the work
  competitor: z.string(), // the most likely real named competitor, or '' if none is evident
})
export type Signals = z.infer<typeof SignalsSchema>

const SYSTEM = `You extract two raw signals from a marketer's submitted work so we can pre-fill their sprint. No judgment, no rewriting, no advice.
- weak_line: the single weakest, most generic line in the work, copied VERBATIM (the line most equally true of any competitor). If nothing stands out, use the opening line.
- competitor: the most likely real, named competitor for this product, or "" if none is evident from the work.
Output ONLY valid JSON: { "weak_line": string, "competitor": string }.`

export function runExtractSignals(workSample: string) {
  return generateJSON({
    system: SYSTEM,
    prompt: `WORK SAMPLE\n"""\n${workSample}\n"""\n\nReturn the JSON.`,
    schema: SignalsSchema,
    maxTokens: 300,
  })
}
