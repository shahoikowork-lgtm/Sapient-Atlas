import { z } from 'zod'
import { generateJSON } from '@/lib/anthropic'
import type { Intake } from '@/lib/validation'

// Maps to the value_assessments table columns.
export const ValueAssessmentSchema = z.object({
  value_low: z.number(),
  value_mid: z.number(),
  value_high: z.number(),
  currency: z.string().default('USD'),
  confidence: z.enum(['low', 'medium', 'high']),
  confidence_reason: z.string(),
  ai_exposure: z.number().min(0).max(1),
  trajectory: z.enum(['rising', 'holding', 'slipping']),
  capability_scores: z.record(z.string(), z.object({ score: z.number(), evidence: z.string() })),
  gaps: z.array(z.object({ title: z.string(), detail: z.string() })),
  observation: z.string(),
  inputs: z.array(z.string()),
})

export type ValueAssessment = z.infer<typeof ValueAssessmentSchema>

const SYSTEM = `You are the Value Engine of Sapient Atlas, a Professional Market Value Operating System for working digital professionals in the AI economy.

You estimate a professional's CURRENT market value and capability profile from their stated profile and a real work sample.

Hard rules:
- Market value is a RANGE (low / mid / high, annual, in USD). Never a single number.
- State confidence explicitly: low | medium | high, with a concrete reason.
- Every capability score (0-100) MUST cite specific evidence from the work sample. No evidence => no score.
- ai_exposure is 0..1: the share of this role's current work that competent AI use can already do.
- trajectory is rising | holding | slipping in the AI economy.
- gaps: concrete things missing that cap their value.
- Weigh SCOPE OF OWNERSHIP: accountability for a business outcome or P&L is worth more than executing discrete tasks. Use the stated daily/weekly responsibilities to judge real scope, not just the title.
- Be honest and specific. If the work sample is thin, lower confidence and say why. Never flatter.
- Output ONLY valid JSON. No markdown, no commentary.`

function buildPrompt(intake: Intake): string {
  return `PROFILE
Name: ${intake.name}
Role: ${intake.role}
Seniority: ${intake.seniority || '—'}
Years: ${intake.years || '—'}
Company type: ${intake.company_type || '—'}
Region: ${intake.region || '—'}
Income band (self-reported): ${intake.income_band || '—'}
Stated goal: ${intake.goal || '—'}
Target: ${intake.target || '—'}
Unfair advantages: ${intake.unfair_advantages || '—'}
Daily responsibilities: ${intake.responsibilities_daily || '—'}
Weekly responsibilities: ${intake.responsibilities_weekly || '—'}

REAL WORK SAMPLE
"""
${intake.work_sample}
"""

Return a JSON object with EXACTLY these keys:
{
  "value_low": number, "value_mid": number, "value_high": number, "currency": "USD",
  "confidence": "low|medium|high", "confidence_reason": string,
  "ai_exposure": number (0..1), "trajectory": "rising|holding|slipping",
  "capability_scores": { "<dimension>": { "score": number, "evidence": string } },
  "gaps": [ { "title": string, "detail": string } ],
  "observation": string,
  "inputs": [ string ]
}`
}

export function runValueAssessment(intake: Intake) {
  return generateJSON({
    system: SYSTEM,
    prompt: buildPrompt(intake),
    schema: ValueAssessmentSchema,
    maxTokens: 2000,
  })
}
