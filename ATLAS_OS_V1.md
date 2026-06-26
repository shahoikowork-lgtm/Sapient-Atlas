# ATLAS_OS_V1 — The Operating Manual

**What this is.** The source of truth for *how Atlas produces a measurable capability result*. It
documents the system as built, names each engine's contract, and marks what is **[BUILT]** vs a
**[GAP]** (not yet built). It is subordinate to `ATLAS_OS.md` (locked doctrine — what Atlas is and
won't do) and `CONSTRAINT_DESIGN_MANUAL.md` (the seven tests every constraint must pass). When this
manual conflicts with either, those win.

**The spine.** `Constraint → Bar → Rep → Proof`. Every object and engine below serves it.

**The loop.** Diagnosis → constraint → capability map → personalized mission → daily rep → AI
verification → retry until clear → progress capture → Day-30 re-diagnosis → proof → next capability.

---

## CHAPTER 1 — Core Objects

Each object is operational: a thing in the data, not a concept.

- **Work / Artifact** — a real piece of the user's own professional work (a landing page, a deck, a
  cold email). The atomic input. *Data:* `diagnoses.work_sample`, `submissions.artifact_text`. Never
  an exercise, hypothetical, or fabricated scenario.
- **Constraint** — the single capability bottleneck limiting the user's growth, expressed as one
  observable failure mode. *Data:* `lib/atlas/constraints/*` (V1 active: **M1 — Generic positioning**).
  Fields: `observable_failure_mode`, `decline_gate_fit`, `bar`, `method`, `capability_map`.
- **Capability** — the broad ability a constraint sits inside. *M1 capability = "Differentiation."*
  *Data:* `capability_map.capability`.
- **Skill** — the one capability operationalized as a doable thing. *M1 skill = "Make a claim a named
  competitor cannot also make."* *Data:* `capability_map.skill`.
- **Micro-skill** — the smallest practiceable unit of the skill, with its own bar. *M1 has 9:*
  `spot_generic, name_buyer, name_alternative, name_pain, unique_attribute, attribute_to_value,
  kill_adjective, falsifiable_exclusion, repeatable_playback`. *Data:* `capability_map.micro_skills[]`,
  each with `{id, name, mistake, bar, example, counterexample, mission_type, proof_kind, fix}`.
- **Bar** — the falsifiable, naive-checkable standard for a micro-skill or the whole constraint.
  *Data:* `BarSchema` / `MicroSkillBarSchema` = `{clears_when, pass_conditions[], fail_conditions[]}`.
  Two independent reviewers must agree hit/miss. Self-securing: the only way to pass is to do the
  real thing.
- **Mission (rep)** — one ~8-minute action on the user's real work that forces one micro-skill.
  *Data:* `plans.weekly_milestones[]`, titles fixed by `M1_LADDER` (24 rungs), task/steps/success
  personalized per user.
- **Feedback** — two layers. (1) Instant **bar-check** (mechanical, ungated): per-condition
  pass/fail + the exact failing phrase + one pre-approved correction. (2) **Weekly note**
  (free prose, human-gated). *Data:* `submissions.feedback` (jsonb).
- **Proof** — externally validated evidence the user can now do it (a real prospect/colleague reacts).
  Not a certificate, not Atlas's grade. *Data:* `proof_kind` per micro-skill; the Day-30 artifact +
  before/after.
- **Capability Record** — the longitudinal truth of what the user has cleared, when, at what
  difficulty/independence, with what proof. *Data (today):* `submissions` (+ `feedback.cleared_micro_skill`),
  `value_history`, and the derived OutcomeGraph (`lib/intelligence.ts`). **[GAP]** a single durable
  per-user record table; today it is derived.

### 1.1 — The learning primitives (how capability actually forms)

The objects above are *what the system stores*. These are *what must change inside the user*. Each is
defined only by how Atlas teaches and measures it — no theory.

| Primitive | Operational definition | How Atlas teaches it | How Atlas measures it | Why it makes them harder to replace |
|---|---|---|---|---|
| **Learning** | A change in what the user produces *unaided on novel real work* — the named failure mode gone under rising difficulty + falling scaffolding | Reps on real work + the instant bar-check; never content | Re-diagnosis on fresh Day-30 work (failure mode absent) | The market pays for what you can *do*, not what you've heard |
| **Mental model** | The reusable rule that generates a correct move on unseen work (M1: "a claim must be false of a named alternative") | The bad→good `worked_example` contrast applied to *their* work — never stated as a lesson | Clearing the bar on a *different* artifact | A model transfers; a memorized answer doesn't — transfer is the scarce thing |
| **Pattern recognition** | Spotting the failure mode / the move's structure across instances | The swap test + repeated bad→good exposure (`spot_generic`) | The user flags the generic line *themselves* on new work | Seeing the flaw unaided is the precondition to fixing it without you |
| **Judgment** | Choosing the right move under ambiguity (which attribute, which buyer) | Varying conditions across the ladder (product / segment / stakes) | Clears on novel conditions with no template | Judgment is the least-automatable layer — highest scarcity |
| **Transfer** | Clearing the bar on work the user hasn't seen, unaided — the *only* proof of learning | Condition variation + spaced retrieval | Day-30 re-diagnosis on fresh work | Employers pay for handling *new* problems, not repeating one solved case |
| **Automaticity** | The move costs little deliberate effort/time | Repetition to fluency (the daily reps) | `attempts`-to-clear trending down + faster clears (flywheel signal) | Frees capacity for higher-order work → more value per hour |
| **Mastery** | Transfer + automaticity: clears reliably, fast, unaided, high stakes, on novel work | The full four-phase arc ending in PROVE | PROVE-phase clear + external proof + low attempts on fresh work | Mastery + external proof *is* "harder to replace," demonstrated |

The KPI ("more valuable in the labor market") = **transfer a pricer recognizes.** Every engine optimizes
transfer, never completion.

---

## CHAPTER 2 — Capability Graph

**How capabilities are mapped, ordered, selected.**
- **Mapped:** each constraint decomposes `constraint → capability → skill → micro_skills[]`
  (`capability_map`). **[BUILT for M1.]**
- **Ordered:** the micro-skills are sequenced into the 24-rung `M1_LADDER` across four phases
  (SEE → CROSS → INDEPENDENCE → PROVE). Order escalates on three axes: bar tightens, scaffolding
  withdraws, stakes rise. **[BUILT]**
- **Connected (prereqs):** within M1, later rungs revisit earlier micro-skills under harder
  conditions. **[GAP]** explicit `prereqs[]` / a true cross-constraint dependency graph (M1→M2→…).
- **Selected:** the Diagnosis Engine picks the *one* binding constraint (Ch. 4); the Re-diagnosis
  Engine picks the *next* one (Ch. 11). Today the cross-constraint graph is a list with one active
  node (M1); the "graph" is the ordered ladder *within* a constraint.

---

## CHAPTER 3 — Knowledge Graph

**Where Atlas knowledge comes from (in priority order):**
1. **Named authorities / books** — distilled by a human into structured form. *M1 = April Dunford
   (Obviously Awesome), Geoffrey Moore (positioning template), David Ogilvy (proof over adjectives).*
   *Data:* `constraint.method.source`. **[BUILT]**
2. **Experts** — the same human-authoring step; the founder owns the standard.
3. **Market examples** — real bad→good pairs become `worked_examples`.
4. **User outcomes + proof events + internal data** — the flywheel (Ch. 13) reweights everything
   above. **[GAP until real users exist.]**

**How knowledge becomes operational artifacts (this is the anti-GPT mechanism):**
- → **bars:** `bar.pass_conditions` / `fail_conditions` (falsifiable, naive-checkable).
- → **examples:** `worked_examples[].after`.
- → **counterexamples:** `worked_examples[].before` + `method.failure_patterns`.
- → **correction patterns:** `method.fix_patterns` + each micro-skill's `fix` (the "one move").
- → **missions:** ladder rungs reference micro-skills; the rep is generated against the user's work.

**Validation:** every constraint is parsed by `ConstraintSchema` at import (malformed → throws), must
pass the **seven tests** in `CONSTRAINT_DESIGN_MANUAL.md`, and its user-facing prose is linted for
scores/money/percent (`FORBIDDEN_PROSE`). **Nothing reaches a user that wasn't authored and approved
at design time.** Atlas never *generates* knowledge at runtime — it *selects* from this map.

---

## CHAPTER 4 — Diagnosis Engine [BUILT]

*Files:* `app/api/diagnosis/route.ts`, `lib/ai/value-assessment.ts`, `lib/ai/opportunity-ranking.ts`,
`lib/ai/constraint-match.ts`, `lib/atlas/decline-gate.ts`, `lib/ai/extract-signals.ts`.

- **Input:** one real artifact + lean signals (role, target, competitor, why_you, stuck).
- **Output:** matched constraint + Decline-Gate decision + extracted signals (`weak_line`,
  `competitor`) + a gated value assessment + a gated move + a logged prediction. Stored in
  `cycles.profile_snapshot.atlas`.
- **Decision rules:** read the artifact for the dominant observable failure mode → match to a
  constraint; run the **Decline Gate** (capability-shaped? legible bar? reppable? 30-day movable?)
  → `accepted | waitlist | declined | needs_more_artifact`. Only an active accepted constraint (M1)
  may sell a Sprint.
- **Data needed:** the artifact; the constraint library's failure-mode signatures.
- **AI role:** read the artifact, name the constraint, extract the weakest line + competitor.
- **Human role:** approve the *free-prose* read before it's shown in full (the instant map-bound
  read shows without waiting — see Ch. 12).
- **Failure cases:** misdiagnosis (the highest-severity failure — everything downstream aims wrong);
  over-eager acceptance of a circumstantial block. Mitigation: the Decline Gate + confidence logging.
- **Success criteria:** the named constraint is one the user recognizes in their own work, passes the
  seven tests, and predicts a movable result.

---

## CHAPTER 5 — Mission Generator [BUILT]

*Files:* `lib/ai/thirty-day-plan.ts`, `lib/ladder.ts` (`M1_LADDER`), `lib/sprint.ts` (`deriveMissions`),
`lib/atlas/mission-bar.ts` (`resolveMissionBar`).

- **Input:** user artifact, the fixed ladder, the rung's micro-skill, the user's signals (day-1 line,
  competitor), the target outcome.
- **Output:** 24 missions; titles + phases + micro-skill **fixed** from the ladder; `task` (one ~8-min
  action), `steps` (2–4), `success_criteria` **personalized** to the user's real work. Mission 1 = the
  day-one win (rewrite their weakest line).
- **Decision rules:** the bar and the one correction are **selected** from the map
  (`resolveMissionBar`), never invented. The model only personalizes the directive to the user's work.
- **Data needed:** `work_sample`, `signals`, the `capability_map`.
- **AI role:** phrase each rung's directive against the user's artifact.
- **Human role:** none at runtime (the ladder + bars were approved at design time).
- **Failure cases:** the model drifts off the fixed titles (guarded: titles pinned in code); a
  personalized task references work the user doesn't have.
- **Success criteria:** every mission is a ~8-min rep on real work, teaches a reusable pattern (not a
  one-off answer), and escalates across the four phases.

---

## CHAPTER 6 — Learning Loop [BUILT]

*File:* `app/app/checkin/checkin-flow.tsx`. One screen, one rep:

`Understand` (the pattern, one line) → `Practice` sees the contrast (one bad→good `worked_example`) →
`Apply` on the user's own work (one box) → `Attempt` (submit) → `Review` (instant bar-check) →
`Correct` (the one move) → `Retry` (tighten → re-check; free, unlimited, no penalty) → `Clear`
(lock in) → `Capture` (`cleared_micro_skill` recorded; next mission unlocks).

- **Psychology:** smallest unit (low activation energy), productive struggle (the user does the rep),
  one cue (not five), visible win on their own work (the only dopamine used).

---

## CHAPTER 7 — Verification Engine [BUILT — the brain]

*Files:* `lib/ai/rep-check.ts` (`runRepCheck`), `app/api/submissions/route.ts` (the gate),
`scripts/eval-grader.ts` (the regression rig).

- **Input:** the submitted rep + the published bar + the method block.
- **Output:** `{quality: hit|partial|miss, confidence: high|low, bar_check[{condition,status,where}]}`
  + the one-move correction.
- **Definitions:**
  - **hit** = every bar condition passes. **partial** = some pass, some fail. **miss** = core
    condition fails.
  - **confidence** = whether the grader is sure it can judge this against the bar (off-mission /
    ambiguous → low).
  - **auto feedback** = high-confidence verdict, shown instantly, no human.
  - **human review** = low-confidence / off-mission / "would need new strategy" / explicit ask.
  - **false positive** = a clear that isn't real (the catastrophic error — a fake win).
  - **false negative** = real work scored not-a-hit (friction; caught by retry + human).
- **Decision rules (the confidence gate):** confident **hit** → auto-clear, advance. Confident
  **miss/partial** → instant feedback + one move + retry (no human, no block, nothing persisted).
  **Low-confidence / off-mission / failed check / "coach"** → human review.
- **AI role:** verify against the published bar only — never coach freely.
- **Human role:** confirm the low-confidence/edge cases.
- **Success criteria / SLO:** **false-positive rate is the sacred metric** — tune strict. *Eval-grader
  baseline: 0% false-pass, 15% false-fail, 85% accuracy* — driving the false-fail down is Ch. 15 #1.

---

## CHAPTER 8 — Adaptive Learning

*Files:* `lib/sprint.ts` (`deriveMissions`, completion-gating), the retry loop, `lib/admin-ops.ts`
(flags).
- **Fast clear** → advance immediately (clear-to-advance; no calendar gate). **[BUILT]**
- **Repeated miss** → stay on the mission, retry with the one move; flagged `stuck` after 3 misses on
  one micro-skill. **[BUILT: flag; GAP: auto-add scaffolding / alternate example]**
- **Low confidence** → route to human review. **[BUILT]**
- **Off-mission attempt** → low confidence → human review. **[BUILT]**
- **User confusion** → surfaces as repeated miss / low confidence → human. **[partial]**
- **Inactivity** → `stuck` flag (no submission in 3 days). **[BUILT: flag; GAP: re-engagement]**
- **Difficulty** changes structurally via the four phases (bar tightens, scaffolding withdraws, stakes
  rise) — **never by lowering the standard.** **[GAP]** dynamic per-user acceleration on fast clears.

---

## CHAPTER 9 — Progress Engine [BUILT]

*Files:* `lib/intelligence.ts`, `lib/sprint.ts` (`deriveProgressAxes`, `deriveClearedMicroSkills`),
`app/app/progress/page.tsx`.
Progress is shown as, never scored:
- **before / after** of the user's own work (day-1 line vs latest).
- **cleared micro-skills** (named capabilities, not points).
- **reduced help needed** (independence axis: heavy → light → none).
- **harder bars cleared** (the bar visibly tightening while they still clear).
- **real-world proof** forming (Ch. 10).
No XP, no streaks, no scores (enforced by `FORBIDDEN_PROSE`).

---

## CHAPTER 10 — Proof Engine [BUILT: capture; GAP: the engineered ask]

*Files:* `lib/ai/monthly-rerating.ts`, `app/app/rerating/[cycle]/deploy-proof.tsx`.
- **Reality grants proof.** Atlas instruments the **before** (day-1 baseline, retained) and the
  **after** (day-30 fresh work); the user deploys the work and a real receiver reacts.
- **Counts as proof:** the user's own deployed artifact + a real pricer's reaction (prospect repeats
  the positioning, engineer signs off, peer trusts it) + before/after, attributable to the user.
- **Does NOT count:** Atlas's grade, a certificate, a quiz, a self-report with no artifact.
- **[GAP — Ch. 15 #2]** the Week-4 *engineered ask* (scripted, specific person, capture flow). Today
  the external reaction is left to the user.

---

## CHAPTER 11 — Re-diagnosis Engine [BUILT]

*Files:* `lib/rerating.ts` (`ensureRerating`), `lib/ai/monthly-rerating.ts`,
`app/app/rerating/[cycle]/page.tsx`.
- **Input:** new real work at Day 30 + the retained Day-1 baseline + the same bar + completed reps +
  cleared micro-skills.
- **Output:** an honest verdict (**moved / partially moved / did not move** + the reason), a graded
  prediction (hit/partial/miss), the next constraint.
- **Decision rules:** the named failure mode must have disappeared under rising difficulty + falling
  scaffolding, on fresh work. A flat/down read is valid and delivered plainly.
- **AI role:** grade against the same bar; draft the verdict (gated). **Human role:** approve the
  verdict prose. **Never** fabricate or soften.

### Career Intelligence (the next-capability decision rules)

Re-diagnosis ends one Sprint; Career Intelligence chooses the next. Exact rules:

- **Next capability** = the highest `leverage = (career value × movability) ÷ effort`, weighted *down* by
  the AI-exposure of the user's current work, that **passes the Decline Gate**. Movability and
  capability-shape are hard filters, not tie-breakers.
- **Decide NOT to teach** when a candidate fails the Decline Gate (not capability-shaped, illegible bar,
  not reppable, not 30-day-movable) **or** has high AI-exposure (building it won't reduce replaceability).
  Rule: `if !decline_gate.pass(c) OR ai_exposure(c) ≥ high → don't teach; name the reason`.
- **Disagree with the user's goal** when: (a) it's an *outcome*, not a capability ("get promoted") → target
  the capability that earns it; (b) it maps to a refused category (confidence, office politics) → decline
  honestly; (c) they want a low-leverage capability while a higher-leverage one is binding → show the
  diagnosis evidence; the constraint wins; (d) the wanted capability is high-AI-exposure → "this won't make
  you harder to replace, here's why." Always evidence + reason, **never a silent override** (honesty over
  flattery, `ATLAS_OS.md §1.7`).
- **Depth vs breadth:** specialize (depth) while each new proof keeps moving a pricer **and** the user's
  value metric responds; broaden when the AI-exposure of their current stack rises (diversify the moat).
  Default: depth until marginal proof stops moving a pricer, then broaden.
- **Capability decay:** the memory layer flags a previously-cleared micro-skill that *fails* on later work
  (a rep or a re-diagnosis) → decay signal → schedule a spaced re-rep *before* teaching anything new.
- **Spaced-retrieval schedule:** revisit a cleared micro-skill at expanding intervals (e.g. +3 days, +9,
  +21) under *new* conditions; pull it earlier if decay is detected. **[GAP — roadmap]**
- **Mastery (exact):** a capability is mastered only when, on **fresh** work, **unaided**, the user clears
  the **tightened** bar with **low attempts** (automaticity) **and** an **external proof event** occurred.
  Transfer + automaticity + external proof — all three. Anything less is "partial," and the Sprint says so.

---

## CHAPTER 12 — Automation Model [BUILT]

- **AI does instantly (no human):** the matched-constraint *instant read* (map-bound), the per-rep
  bar-check for high-confidence verdicts, mission personalization, the completion-gating.
- **Goes to human review:** low-confidence / off-mission / "needs new strategy" reps; the day-30
  verdict prose; the full free-prose diagnosis read.
- **Founder reviews weekly:** the edge-case queue (`/admin/reviews`, `/admin/review`), the
  `/admin/intelligence` trends, the `/admin/metrics` time-to-first-win, and **improving the maps.**
- **Never depends on founder calls:** every standard rep verdict, the diagnosis, the plan, the instant
  read, "good job." No Zoom. The founder owns the *standard* (the maps + the verdict honesty), not the
  *throughput*.

---

## CHAPTER 13 — Data Flywheel [BUILT: capture + funnel; GAP: the monthly learner]

*Files:* `app/api/submissions/route.ts` (captures `attempts`, `correction_shown`,
`cleared_micro_skill`), `lib/intelligence.ts` (OutcomeGraph + funnel), `scripts/eval-grader.ts`.
Every event makes Atlas smarter:
- **diagnosis** → which artifact features predicted a moved constraint (sharpen the Matcher).
- **mission / correction / retry / clearance** → which correction precedes a clear fastest
  (promote it; prune dead ones) and which bar clears (calibrate difficulty).
- **proof event** → `P(proof | clearance)`: **retire bars that clear but don't predict a real
  reaction; sharpen the ones that do.** This validates the standard against *reality*.
The proprietary asset = the `(role × micro_skill × correction) → clearance → proof` graph. **[GAP]**
the monthly learner job + a dedicated `OutcomeGraph` store; today the signals are captured and the
funnel/stats are read live. It only turns with real users.

---

## CHAPTER 14 — Admin OS [BUILT]

What the operator sees daily:
- **`/admin/ops`** — per active user: mission n/24, phase, last verdict, AI confidence, and flags:
  `stuck`, `needsReview`, `proofToVerify`, `misdiagnosisRisk`, `atRisk`. (`lib/admin-ops.ts`)
- **`/admin/intelligence`** — the transformation funnel (started → first clear → crossed valley →
  independent → reached proof → day-30 moved) with the biggest leak flagged; the micro-skill stall
  table (worst-first). (`lib/intelligence.ts`)
- **`/admin/reviews` + `/admin/review`** — the edge-case + diagnosis approval queue.
- **`/admin/metrics`** — time-to-first-win.
- **`scripts/eval-grader.ts`** — grader false-pass / false-fail (the regression gate).
- **[GAP]** surfaced "bad missions" and "map improvement opportunities" views (the learner's output).

---

## CHAPTER 15 — Learning Science Engine [why Atlas produces transformation]

Not education — the mechanism. Each principle appears only as the exact Atlas behavior that implements it.

- **Deliberate practice** → the daily rep: the *smallest hard thing* the user avoids, on *real* work, with
  *immediate* feedback, at the *edge* of ability (the bar tightens weekly). `checkin-flow` + `mission-bar`
  + `rep-check`.
- **Retrieval practice** → the user *produces* the move (writes the line) — never recognizes it from
  options; re-diagnosis retrieves it cold on fresh work.
- **Spacing** → spaced-retrieval rungs re-surface earlier micro-skills across days, not back-to-back.
  **[GAP — roadmap #4]**
- **Interleaving** → the ladder mixes micro-skills + conditions (spot → name → attribute → exclusion across
  products/segments) instead of drilling one to death.
- **Feedback timing** → the instant bar-check at the moment of the attempt (the highest-value learning
  signal); the deeper weekly note is gated and less time-critical.
- **Desirable difficulty** → the three axes keep every rep at the edge: hard enough to require effort
  (productive struggle), never so hard it's unsolvable (the one move keeps it reachable).
- **Transfer** → condition variation + the fresh-work re-diagnosis. The entire point; everything else serves it.
- **Progressive overload** → difficulty only rises — bar tightens, scaffolding withdraws, stakes rise across
  SEE → CROSS → INDEPENDENCE → PROVE. The standard never drops to manufacture a win.

---

## CHAPTER 16 — Knowledge Evolution Engine [the compounding moat]

How the maps get smarter every month. This is the *governance + versioning* layer that turns Ch 13's
captured signal into approved map changes. (Ch 13 captures; this evolves.) **[GAP — the monthly learner job
is not yet built; the signal it needs is being captured.]**

- **Proof events improve the graph** → each `ProofEvent` updates `P(proof | clearance)` per bar; load-bearing
  bars are promoted, bars that clear but never precede a real reaction are flagged for rework.
- **Missions retired** → a ladder rung whose clearance doesn't correlate with later transfer/proof is retired
  or reworked.
- **Examples evolve** → `worked_examples` whose contrast doesn't lift clearance are replaced by higher-lift
  real examples mined from *consented* cleared user work.
- **Bars evolve** → a bar with low grader-vs-human agreement or low `P(proof|clearance)` is rewritten —
  tightened if too easy, clarified if illegible.
- **Eval prompts evolve** → the grader prompt is versioned; every change is gated by the eval gold set (no
  regression on false-pass).
- **Versioning** → every map, bar, and eval-prompt carries a version + provenance (authority + flywheel
  evidence); each rep is tagged with the version it trained against, so outcomes attribute to versions.
- **Outdated knowledge removed** → a capability whose AI-exposure crosses a threshold (a tool now does it) is
  retired from active selling — it no longer makes anyone harder to replace; a bar that reality invalidates
  is deprecated.
- **Cadence + human role** → monthly, a human approves the learner's proposed deltas (promote / prune /
  retire). The founder approves map changes; never composes them. **This is the moat: versioned,
  reality-validated maps that compound, and that a competitor cannot copy without first running the loop on
  thousands of real professionals.**

---

## CHAPTER 17 — Failure Analysis [destroy Atlas — learning-system risks, ranked]

Each risk: why it happens → how Atlas detects it → how Atlas prevents it → how Atlas recovers.

1. **Diagnosis failure (deepest — invisible + fatal).** *Why:* the artifact's dominant failure mode is
   mis-read; the user reps the wrong constraint. *Detect:* low match-confidence; re-diagnosis "did not move"
   despite high completion; the user's "stuck" answer contradicts the named constraint. *Prevent:* the
   Decline Gate + confidence logging + the user *confirming* the named constraint before paying. *Recover:*
   re-diagnose, re-aim/refund the Sprint, log the miss to the matcher's training set.
2. **Wrong capability selection (next Sprint).** *Why:* leverage mis-ranked; AI-exposure ignored. *Detect:*
   repeat "did not move"; the user's value metric flat. *Prevent:* the Career-Intelligence rules (Ch 11).
   *Recover:* re-rank, switch constraint, record the outcome.
3. **Weak bars (gameable / illegible).** *Why:* a bar that clears without doing the real thing, or that two
   reviewers read differently. *Detect:* high clearance but low `P(proof|clearance)`; grader-vs-human
   disagreement. *Prevent:* the six bar rules + the seven tests at authoring. *Recover:* the Knowledge
   Evolution Engine rewrites/retires it.
4. **False transfer (the learning illusion).** *Why:* the user grinds one artifact → looks learned, isn't.
   *Detect:* re-diagnosis on *fresh* work fails though the Sprint reps passed. *Prevent:* condition variation
   + spaced retrieval + the fresh-work re-diagnosis as the load-bearing gate. *Recover:* extend the Sprint on
   novel conditions; don't grant proof.
5. **Grading drift.** *Why:* the grader (prompt or model) silently shifts; false-pass creeps up. *Detect:*
   the eval gold-set regression; rising auto-clear with flat proof. *Prevent:* versioned grader + the eval
   gate on every change + the false-pass SLO. *Recover:* roll back the grader version; re-run the gold set.
6. **Hallucinated lessons.** *Why:* the AI composes coaching/strategy at runtime. *Detect:* feedback text not
   traceable to an authored fix/bar. *Prevent:* the design-time-approval gate — runtime *selects* from the
   map, never composes; low-confidence → human. *Recover:* route to human; add the missing pattern to the
   map at design time.
7. **Weak proof.** *Why:* "proof" that's a self-report or an Atlas grade, not a pricer's reaction. *Detect:*
   a proof artifact with no external receiver; `proof_kind` unmet. *Prevent:* the Proof Engine's
   external-validation requirement + the engineered Week-4 ask. *Recover:* don't claim the result; request
   the real artifact/reaction.
8. **Curriculum collapse (scaling content).** *Why:* adding constraints faster than they can be authored +
   validated → quality rot. *Detect:* new constraints failing the seven tests or showing low
   `P(proof|clearance)`. *Prevent:* one-constraint-at-a-time + the authoring pipeline + the validity gate.
   *Recover:* deactivate the bad constraint (`active_v1: false`); rework.
9. **Personalization failure.** *Why:* the mission references work the user doesn't have, or ignores prior
   mistakes. *Detect:* high abandon at a specific rung; "stuck" with no real artifact. *Prevent:* diagnosis
   screens for a real-work supply; the generator binds to *their* artifact/signals. *Recover:* swap the
   artifact, lower the rung's stakes, or decline (needs_more_artifact).
10. **Automation failure (founder bottleneck).** *Why:* the low-confidence rate stays high → the review
    queue grows with users. *Detect:* `/admin/ops` queue depth rising; auto-clear rate flat across cohorts.
    *Prevent:* the flywheel must drive confidence up + false-fail down; the eval discipline. *Recover:*
    temporarily widen human review; prioritize grader hardening (roadmap #1).

**Top three by lethality: diagnosis failure → grading false-pass → false transfer.** All three are invisible
*without* the fresh-work re-diagnosis, the grader eval, and the proof linkage — which is why those three
checks are load-bearing and protected above all.

---

## CHAPTER 18 — Implementation Roadmap (internal product logic only)

Ranked by impact on customer results. (No customers/marketing/redesign — out of scope.)
*Updated for Ch 15–17: top priorities unchanged — the grader (#1) and the proof event (#2) stay P0. Ch 15
confirms spaced retrieval (#4) as the key learning-quality lever; Ch 16 makes the knowledge-evolution learner
(#3) the compounding moat. Ch 17's three top-lethality failures — diagnosis, grading false-pass, false
transfer — are each guarded by an early item (the matcher's confidence gate, the grader #1, and the
fresh-work re-diagnosis + spaced retrieval #4), confirming the order.*

1. **Harden the grader** — expand `eval-grader.ts` gold set; cut the 15% false-fail (best-of-N /
   tighter prompt) while holding 0% false-pass. *The brain; everything depends on it.*
2. **Engineer the Week-4 proof event** — scripted ask + specific receiver + capture flow. *The promise
   lives here.*
3. **Persist the OutcomeGraph + write the monthly learner** — correction efficacy + `P(proof|clearance)`
   → map updates. *Turns the flywheel.*
4. **Spaced retrieval in the ladder** — revisit earlier micro-skills under new conditions for durable
   transfer.
5. **Auto-adaptive difficulty** — accelerate on fast clears; add scaffolding on repeated miss.
6. **A durable Capability Record store** (vs. derived).
7. **Map authoring pipeline** — make constraint #2 a repeatable week (the moat scales by adding maps).
8. **Admin: bad-mission + map-improvement views** (the learner's output).
9. **Re-engagement on inactivity** (the `stuck`/inactive flag → action).
10. **The true capability graph** (cross-constraint prereqs/dependencies).

**Files/systems most affected:** `lib/ai/rep-check.ts` + `scripts/eval-grader.ts` (1); the ladder +
a new proof component + `monthly-rerating.ts` (2); `app/api/submissions/route.ts` + `lib/intelligence.ts`
+ a new learner script (3); `lib/ladder.ts` + `lib/sprint.ts` (4,5); a new `capability_records` table (6);
`lib/atlas/constraints/*` + `types.ts` (7,10); `lib/admin-ops.ts` + `app/admin/*` (8).

**What can wait:** 6, 7, 9, 10 — until the grader (1), the proof event (2), and the flywheel (3) are
trustworthy on a first real cohort. Adding maps before the grader is reliable scales a flaw.

---

## THE 20 MOST IMPORTANT PRODUCT RULES

1. The rep is the lesson; reality is the grade.
2. Every recommendation = evidence + reasoning + confidence + a falsifiable prediction.
3. One constraint, one skill, one move, one rep focus at a time.
4. Real work only — never an exercise, hypothetical, or fabricated scenario.
5. Bars are falsifiable and naive-checkable; two reviewers must agree.
6. A bar is self-securing — the only way to pass is to do the real thing.
7. Advance by clearing the bar, not by submitting and not by the calendar.
8. Confident hit → instant clear; confident miss → instant retry; only low-confidence → human.
9. Minimize false-positives (fake clears) even at the cost of more false-negatives.
10. Atlas selects from the authored map; it never generates knowledge at runtime.
11. Feedback = verdict + the exact failing phrase + one pre-approved move. Never five.
12. Never reveal the answer; show the pattern, make them apply it (no dependency).
13. Difficulty rises by tightening the bar / withdrawing help / raising stakes — never by lowering the standard.
14. Proof is external and attributable; Atlas never grants its own proof.
15. Progress is shown (before/after, cleared micro-skills, less help, harder bars) — never scored.
16. No numbers to the user: no scores, /100, bands, money.
17. The honest verdict ships plainly — "did not move, here's why" is the brand.
18. The Decline Gate refusing ~1 in 3 is integrity, not a leak.
19. The founder owns the standard (maps + verdict honesty), never the throughput.
20. Every diagnosis, correction, clearance, and proof event must be logged for the flywheel.

## THE 10 THINGS ATLAS MUST NEVER DO

1. Never become a course, LMS, coaching, or consulting business.
2. Never show a score, /100, band, or money figure to the user.
3. Never use streaks, points, badges, or fake gamification.
4. Never send free-composed AI prose to the user unreviewed.
5. Never grant a clear the grader isn't confident is real (no fake wins).
6. Never reveal the finished answer — only the pattern + one move.
7. Never sell a Sprint for a constraint the Decline Gate refused.
8. Never fabricate or soften a re-rating verdict.
9. Never invent knowledge at runtime outside the approved map.
10. Never make customer results depend on a founder call.

## THE NEXT 10 IMPLEMENTATION TASKS (exact order)

1. Expand the grader eval gold set + measure false-fail per micro-skill.
2. Cut grader false-fail (best-of-N / prompt) holding 0% false-pass.
3. Build the Week-4 engineered proof ask (script + receiver + capture).
4. Persist the OutcomeGraph (dedicated store off `submissions.feedback`).
5. Write the monthly learner job (correction efficacy + `P(proof|clearance)`).
6. Surface learner output in `/admin/intelligence` (bad missions, map fixes).
7. Add spaced-retrieval rungs to `M1_LADDER`.
8. Add auto-adaptive difficulty (accelerate / scaffold).
9. Add a durable `capability_records` store.
10. Build the map-authoring pipeline for constraint #2.

## FILES / SYSTEMS LIKELY AFFECTED

`lib/ai/rep-check.ts`, `scripts/eval-grader.ts`, `lib/ladder.ts`, `lib/sprint.ts`,
`lib/ai/thirty-day-plan.ts`, `lib/atlas/mission-bar.ts`, `lib/atlas/constraints/*`,
`app/api/submissions/route.ts`, `lib/intelligence.ts`, `lib/admin-ops.ts`, `app/admin/*`,
`lib/ai/monthly-rerating.ts`, `lib/rerating.ts`, plus new: a learner script + a
`capability_records` store + a proof-capture component.

## WHAT CAN WAIT

The durable record store, the map-authoring pipeline, re-engagement, and the cross-constraint graph
wait until the grader, the proof event, and the flywheel are proven trustworthy on a first cohort.
Adding capabilities before the grader is reliable scales a flaw.

---

*End ATLAS_OS_V1. Subordinate to `ATLAS_OS.md` and `CONSTRAINT_DESIGN_MANUAL.md`. Update deliberately
as engines move from [GAP] to [BUILT].*
