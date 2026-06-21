import { z } from 'zod'

// Diagnosis intake. Required: name, email, role, work_sample. The rest are optional context.
export const IntakeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('A valid email is required'),
  role: z.string().min(1, 'Role is required'),
  seniority: z.string().optional().default(''),
  years: z.string().optional().default(''),
  company_type: z.string().optional().default(''),
  region: z.string().optional().default(''),
  income_band: z.string().optional().default(''),
  goal: z.string().optional().default(''),
  target: z.string().optional().default(''),
  unfair_advantages: z.string().optional().default(''),
  responsibilities_daily: z.string().optional().default(''),
  responsibilities_weekly: z.string().optional().default(''),
  work_sample: z.string().min(40, 'Paste a real work sample (at least a few sentences)'),
})

export type Intake = z.infer<typeof IntakeSchema>
