import { ConstraintSchema, type Constraint } from './types'
import { m1GenericPositioning } from './m1-generic-positioning'
import { m2ActivityReporting } from './m2-activity-reporting'
import { f1WinningNarrative } from './f1-winning-narrative'
import { p1ProblemFraming } from './p1-problem-framing'
import { g1ExperimentThinking } from './g1-experiment-thinking'
import { a1SpecClarity } from './a1-spec-clarity'

/**
 * The Atlas Constraint Library registry.
 *
 * Every entry is parsed against ConstraintSchema at import — a malformed constraint
 * throws here rather than reaching the product. Per ATLAS_OS §9, only M1 is sellable in
 * V1 (active_v1: true); the rest are admitted, production-ready entries ready to promote.
 */
export const CONSTRAINTS: Constraint[] = [
  m1GenericPositioning,
  m2ActivityReporting,
  f1WinningNarrative,
  p1ProblemFraming,
  g1ExperimentThinking,
  a1SpecClarity,
].map((c) => ConstraintSchema.parse(c))

const byId = new Map(CONSTRAINTS.map((c) => [c.id, c]))
const byCode = new Map(CONSTRAINTS.map((c) => [c.code, c]))

export function getConstraint(id: string): Constraint | undefined {
  return byId.get(id)
}

export function getConstraintByCode(code: string): Constraint | undefined {
  return byCode.get(code)
}

/** Constraints sellable in V1. Per ATLAS_OS §9 this is the marketer flagship only. */
export function activeConstraints(): Constraint[] {
  return CONSTRAINTS.filter((c) => c.active_v1)
}

export type { Constraint } from './types'
