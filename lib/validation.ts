import { z } from 'zod'

// Diagnosis intake. Required: email, role, work_sample. The lean form collects the signals
// that sharpen a positioning read — target, competitor, why_you, stuck (all optional). The
// legacy demographic fields remain optional (default '') so the write path and older rows
// stay valid; the form no longer asks them, so they arrive empty and are simply unused.
export const IntakeSchema = z.object({
  name: z.string().optional().default(''),
  email: z.string().email('A valid email is required'),
  role: z.string().min(1, 'Role is required'),
  // The sharp signals (what the lean form actually asks):
  target: z.string().optional().default(''), // what they want next
  competitor: z.string().optional().default(''), // their closest named competitor
  why_you: z.string().optional().default(''), // why a buyer should pick them, in their words
  stuck: z.string().optional().default(''), // where they feel stuck
  // Legacy context — retained optional for backward compatibility, no longer collected:
  seniority: z.string().optional().default(''),
  years: z.string().optional().default(''),
  company_type: z.string().optional().default(''),
  region: z.string().optional().default(''),
  income_band: z.string().optional().default(''),
  goal: z.string().optional().default(''),
  unfair_advantages: z.string().optional().default(''),
  responsibilities_daily: z.string().optional().default(''),
  responsibilities_weekly: z.string().optional().default(''),
  work_sample: z.string().min(40, 'Paste a real work sample (at least a few sentences)'),
})

export type Intake = z.infer<typeof IntakeSchema>
