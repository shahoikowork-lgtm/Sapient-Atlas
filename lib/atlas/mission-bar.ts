import { getConstraintByCode } from '@/lib/atlas/constraints'
import { getMicroSkill } from '@/lib/atlas/constraints/types'

// The single pre-approved correction for an integrative ('full') mission, where no one
// micro-skill owns the miss. Authored here at design time — the runtime only selects it,
// never writes its own (the design-time-approval gate, ATLAS_OS §11).
const FULL_MISSION_FIX =
  'Take the one line that still fails and make it a fact only you can say: true of you, false of your three named competitors, in a value your buyer prices.'

export type MissionBar = {
  barText: string // the published conditions the rep-check verifies against
  fix: string // the single pre-approved correction (the "one move") shown on a miss
}

// Resolve a mission's bar + its approved correction from the focus micro-skill, using the
// design-time-approved M1 capability map. The runtime never invents either — it checks
// against these published conditions and offers this pre-approved fix. A 'full' or unknown
// focus falls back to the whole M1 bar and the integrative fix.
export function resolveMissionBar(microSkill: string | undefined): MissionBar {
  const m1 = getConstraintByCode('M1')
  const ms = microSkill && m1 ? getMicroSkill(m1, microSkill) : undefined
  if (ms) {
    const barText = [
      ms.bar.clears_when,
      'It clears when:',
      ...ms.bar.pass_conditions.map((c) => `- ${c}`),
      'It fails when:',
      ...ms.bar.fail_conditions.map((c) => `- ${c}`),
    ].join('\n')
    return { barText, fix: ms.fix }
  }
  const bar = m1?.bar
  const barText = bar
    ? [bar.definition, 'It clears when:', ...bar.pass_conditions.map((c) => `- ${c}`)].join('\n')
    : 'A naive reader can say why you, not a named competitor, after one read.'
  return { barText, fix: FULL_MISSION_FIX }
}
