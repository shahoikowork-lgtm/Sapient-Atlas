import { describe, it, expect } from 'vitest'
import { deriveDiagnosisStatus, DIAGNOSIS_STATUS_LABEL, type DiagnosisStatus } from '@/lib/diagnoses'
import { classifyDecline, type DeclineClassification } from '@/lib/atlas/decline-gate'

// Build the atlas blob exactly as the diagnosis route stores it: { decline_result }.
const base: DeclineClassification = {
  matched_code: 'M1',
  matched_name: 'Generic positioning',
  profession: 'marketing',
  capability_shaped: true,
  legible_bar: true,
  reppable_on_real_work: true,
  thirty_day_movable: true,
  artifact_sufficient: true,
  refused_category: 'none',
  rationale: '',
}
const atlasFor = (c: DeclineClassification) => ({ decline_result: classifyDecline(c) })
const acceptedAtlas = atlasFor(base)
const waitlistAtlas = atlasFor({ ...base, matched_code: 'M2' }) // known-but-inactive → waitlist
const declinedAtlas = atlasFor({ ...base, refused_category: 'psychological' })

const PUBLISHED = { vaStatus: 'approved', moveStatus: 'approved' }

describe('deriveDiagnosisStatus', () => {
  it('submitted when there is no AI output yet', () => {
    expect(deriveDiagnosisStatus({ atlas: acceptedAtlas })).toBe('submitted')
  })

  it('reviewing while the AI output is pending human review', () => {
    expect(
      deriveDiagnosisStatus({ atlas: acceptedAtlas, vaStatus: 'pending_review', moveStatus: 'pending_review' }),
    ).toBe('reviewing')
  })

  it('reviewing when the assessment is approved but the move is still pending (not fully published)', () => {
    expect(deriveDiagnosisStatus({ atlas: acceptedAtlas, vaStatus: 'approved', moveStatus: 'pending_review' })).toBe(
      'reviewing',
    )
  })

  it('submitted when rejected/deferred (hidden, nothing pending)', () => {
    expect(deriveDiagnosisStatus({ atlas: acceptedAtlas, vaStatus: 'rejected', moveStatus: 'deferred' })).toBe(
      'submitted',
    )
  })

  it('sprint_available when accepted + published + not paid', () => {
    expect(deriveDiagnosisStatus({ atlas: acceptedAtlas, ...PUBLISHED, paid: false })).toBe('sprint_available')
  })

  it('sprint_active when accepted + published + paid', () => {
    expect(deriveDiagnosisStatus({ atlas: acceptedAtlas, ...PUBLISHED, paid: true })).toBe('sprint_active')
  })

  it('waitlist when published + waitlisted (paid flag is ignored on non-accepted)', () => {
    expect(deriveDiagnosisStatus({ atlas: waitlistAtlas, ...PUBLISHED, paid: true })).toBe('waitlist')
  })

  it('ready when published + declined (no sprint path)', () => {
    expect(deriveDiagnosisStatus({ atlas: declinedAtlas, ...PUBLISHED })).toBe('ready')
  })

  it('falls back to sprint_available when published with no classification (unknown → CTA)', () => {
    expect(deriveDiagnosisStatus({ atlas: null, ...PUBLISHED, paid: false })).toBe('sprint_available')
  })

  it('has a label for every status', () => {
    const all: DiagnosisStatus[] = ['submitted', 'reviewing', 'ready', 'waitlist', 'sprint_available', 'sprint_active']
    for (const s of all) expect(DIAGNOSIS_STATUS_LABEL[s]).toBeTruthy()
  })
})
