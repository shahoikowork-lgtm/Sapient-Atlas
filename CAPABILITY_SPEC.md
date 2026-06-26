# CAPABILITY_SPEC — the engineering standard for one Atlas capability

**What this is.** The normative template every capability MUST follow before it ships. It defines the
`Constraint` + `CapabilityMap` objects (`lib/atlas/constraints/types.ts`) to a shippable standard and
maps each to the engines in `ATLAS_OS_V1.md`. It is subordinate to `ATLAS_OS.md` (doctrine) and
`CONSTRAINT_DESIGN_MANUAL.md` (the seven validity tests); where it conflicts with either, those win.

**How to read it.** MUST = ship-blocking. SHOULD = strong default, deviate only with a logged reason.
**[SCHEMA GAP]** marks a field this spec requires that the code does not yet have — add it before
authoring capability #2.

---

## CHAPTER 1 — Capability Definition

**A capability is** a single, practiceable work ability with one observable failure mode and one
falsifiable bar, reppable on the user's own real work, movable in 30 days, that transfers to new work,
and whose removal makes the person harder to replace. It MUST pass all **seven tests**
(`CONSTRAINT_DESIGN_MANUAL §2`). One failure → not a capability.

**A capability is NOT:** a weakness list · a goal/outcome ("get promoted") · a skill topic ("learn
SQL") · a task ("finish the deck") · a circumstance ("underpaid") · a trait/feeling ("confidence") ·
another person's behavior ("my manager ignores me").

**Size (MUST):** exactly **one** `observable_failure_mode` and **one** top-level `bar`. Decomposes into
**6–10 micro-skills** (Ch 4) and **~20–25 daily reps** (the ladder, Ch 7).

**Duration (MUST):** 30-day-movable — a meaningful, observable shift in ≤30 days with in-sprint
feedback (Test 5). Years-scale formation → reject.

**Split when** (any): two independent failure modes; needs >1 bar; decomposes into independently
valuable capabilities; two reviewers name two different "the one thing wrong." (Test 2 — bundle.)
*Rule:* `if reviewers disagree on the single failure mode → split`.

**Merge when** (rare): two candidates share one failure mode + one bar + the same proof — they are the
same capability described twice. Default: do not merge.

---

## CHAPTER 2 — Business ROI (the worth-building gate)

A capability MUST pass **Test 7 (Replaceability)** — all three:
- **Valued** — a pricing-power audience (manager / client / market) pays, promotes, retains, or chooses
  the person more for it. Peer/self-admiration does not count.
- **Scarce** — not already done well by competent AI, cheap labor, or commodity tooling. If
  `ai_exposure` of the capability is high, building it does not reduce replaceability → reject.
- **Recognizable** — the improvement can be made visible, legible, and attributable to that audience
  (the Recognition / Proof layer).

`why_it_matters` (schema-required) MUST state the Valued + Scarce case in one or two sentences. Salary /
hiring / business impact are expressed as **the pricer's behavior change**, never as a number to the
user.

**Worth-building decision rule:**
`build if (passes all 7 tests) AND (the persona has recurring real work to rep on) AND
(leverage = value × movability ÷ effort ranks top for the persona) AND (promotion to active is a
deliberate decision)`. A valid-but-not-top-leverage capability MAY be authored `active_v1: false`.

---

## CHAPTER 3 — Capability Structure (the schema, field by field)

Every capability is the `Constraint` object. Each field's standard:

| Field | Standard |
|---|---|
| `id` / `code` | stable slug `persona.failure_mode` + ATLAS_OS code (e.g. `marketer.generic_positioning` / `M1`). |
| `persona` | one of the five V1 personas; the failure mode must be common for it. |
| `name` / `short_description` | names the **one** bottleneck in plain language (no jargon to the user). |
| `why_it_matters` | the Replaceability case (Ch 2). If you can't write it, the capability fails Test 7. |
| `observable_failure_mode` | what a reviewer **literally sees in an artifact** — never an internal state ("lacks confidence"). |
| `decline_gate_fit` | four booleans (Tests 1,3,4,5); **all true** for `active_v1`. |
| `bar` | the keystone (Ch 6): `{definition, pass_conditions[], fail_conditions[]}`. |
| `method` | sourced from a **named authority**: `{source, framework[], worked_examples[], failure_patterns[], diagnostic_questions[], fix_patterns[]}`. No source → reject (prevents GPT-water). |
| `capability_map` | `{capability, skill, micro_skills[]}` (Ch 4). |
| `baseline_capture` | the Day-1 rep that captures the retained baseline. |
| `reps` | the four-week arc (`week_1..4`). |
| `proof` | externally validated (Ch 9). |
| `recognition` | exactly how the user shows the result to a pricer (the one sentence + the artifact). |
| `thirty_day_success_criteria` | **unaided application on fresh, real work** (Tests 5+6). |
| `examples_of_real_work` | ≥3 concrete artifacts the persona already produces (Test 4 supply). |
| `should_decline_if` | the run-time signals that decline a *specific user* even though the entry is valid. |
| `not_v1_if` / `active_v1` | scope gating. |

**Mapping the brief's named sections to the schema:** Objective = `thirty_day_success_criteria`;
Career + Business Outcome = `why_it_matters` + `recognition`; Mental Models = `method.framework`;
Common Mistakes / Failure Modes = `method.failure_patterns` + `observable_failure_mode`; Evaluation
Bars = `bar` + per-micro-skill bars; Proof Requirements = `proof` + `proof_kind`; Graduation Rules =
Ch 10; Re-diagnosis Rules = the re-rating against the same bar. **[SCHEMA GAP]** `prerequisites` /
`dependencies` and `version` / `provenance` are required by this spec (Ch 4, Ch 11) but not yet on the
schema — add them before authoring a second capability that depends on M1.

---

## CHAPTER 4 — Micro-skill Graph

- **Count (MUST):** 6–10 micro-skills. <5 → probably not decomposed; >12 → probably a bundle (split).
  M1 = 9.
- **Each (MUST)** has its own naive-checkable bar (`MicroSkillBarSchema` = `{clears_when,
  pass_conditions[], fail_conditions[]}`), one `mistake`, one `example`, one `counterexample`, a
  `mission_type`, a `proof_kind`, and one pre-approved `fix` (the only correction the runtime may emit).
- **Ordering (MUST):** the micro-skills that make the failure mode *visible* come first (SEE phase);
  the integrative ones (combine several) come last (PROVE). *Rule:* every micro-skill's prerequisites
  precede it. **[SCHEMA GAP]** make prerequisites explicit (`prereqs: micro_skill_id[]`); today order is
  implicit in `M1_LADDER`.
- **First micro-skill** = the one whose miss the user can see in their own work with the least
  scaffolding (M1: `spot_generic` → the day-1 rewrite).
- **Remove** a micro-skill when flywheel data shows clearing it does **not** predict transfer/proof
  (Knowledge Evolution Engine).
- **Add** one when a recurring failure mode in user work is covered by no existing micro-skill's bar.

---

## CHAPTER 5 — Mission Design (the per-mission contract)

Every mission (one `M1_LADDER` rung, personalized by `thirty-day-plan.ts`, bar from `resolveMissionBar`)
MUST satisfy:

| Field | Standard |
|---|---|
| Objective | force **exactly one** micro-skill on the user's **own real work**. |
| Time | ≤10 min (target ~8); doable in one sitting. |
| Difficulty | the rung's bar for its phase — at the edge of current ability. |
| Artifact | the user's real work — never fabricated, never a hypothetical. |
| Feedback | instant bar-check: per-condition pass/fail + the exact failing phrase + the one move. |
| Retry | unlimited preview/tighten, no penalty; **clear-to-advance** (not submit-to-advance). |
| Success | clears the rung's bar (a `hit`). |
| Failure | confident miss → instant retry (no human); low-confidence/off-mission → human review. |
| Reflection | one-line "what changed" capture. **[GAP — optional]** |
| Transfer | later missions vary product/segment/stakes + spaced retrieval of earlier micro-skills. |

*Why:* small + real + instant feedback + edge difficulty is deliberate practice (the only thing that
builds capability); clear-to-advance prevents fake progress; condition variation produces transfer.

---

## CHAPTER 6 — Evaluation Rules (bar-writing standard)

A bar is valid only if it is **all six** (`CONSTRAINT_DESIGN_MANUAL §5`): **falsifiable** (an artifact
can fail it) · **naive-checkable** (a non-expert reviewer can apply it) · **externally anchored**
(passing is ultimately validated by a real receiver) · **self-securing** (the only way to pass is to do
the real thing) · **tightenable** (escalates across four weeks) · **qualitative** (no score/%, money,
band).

- Write `pass_conditions` + `fail_conditions` so **two independent reviewers agree** hit/miss (Test 3).
  If they wouldn't, the bar is illegible — rewrite or reject.
- **False positives** (a clear that isn't real) are the catastrophic error → tune **strict**; the eval
  gold set (`scripts/eval-grader.ts`) enforces a near-0% false-pass budget.
- **False negatives** (real work scored not-a-hit) are minimized by best-of-N + the retry loop + human
  review — costly but not catastrophic.
- **Confidence:** the grader returns `high|low`. High → instant auto-verdict. Low → human.
- **Humans intervene** on: low confidence, off-mission, "would need new strategy," or explicit ask.

---

## CHAPTER 7 — Difficulty Curve (the four-phase standard)

| Week | Phase | Scaffolding | Stakes | Bar level |
|---|---|---|---|---|
| 1 | SEE | heavy | low | distinct |
| 2 | CROSS | withdrawing (the valley) | low→real | distinct + excludes / falsifiable |
| 3 | INDEPENDENCE | none | real, novel work | provable, unaided |
| 4 | PROVE | none | high, live | high-stakes + externally validated |

Three axes rise together every week — bar tightens, scaffolding withdraws, conditions harden — and the
work varies (product/segment/stakes) to force transfer. **The standard only goes up; it never drops to
manufacture a win.** The bar's evolution path is fixed: `distinct → distinct+exclusive →
provable-unaided → high-stakes+validated`.

---

## CHAPTER 8 — Examples (required types + why)

Each capability MUST ship (in `method` / `capability_map`):
- **Positive** (`worked_examples[].after`) — what good looks like; the target to pattern-match.
- **Negative** (`worked_examples[].before`) — the generic version; the contrast that teaches.
- **Counterexample** (`failure_patterns`) — names the trap explicitly so the grader and user can spot it.
- **Edge cases** — where the rule bends (e.g. a category with no named competitor); prevents brittle bars.
- **Borderline / near-miss** — passes the surface, fails a second-order check (distinct but not provable;
  trivial non-goals). **Required:** these are the hardest cases for the grader and become the **eval gold
  set** that calibrates confidence and catches false-pass.

Minimum: ≥3 `worked_examples` (schema floor) + the `failure_patterns` + ≥3 labeled near-misses for the
gold set.

---

## CHAPTER 9 — Proof

- **Counts:** the user's **own deployed real work** + a real pricer's reaction (prospect repeats the
  positioning, engineer signs off, peer trusts the eval) + a before/after, attributable to the person.
- **Does NOT count:** an Atlas grade, a certificate, a quiz, a self-report with no artifact.
- **How much is enough:** **one** externally-validated proof event on fresh, high-stakes work (Week 4).
- **AI verifies:** that the artifact meets the bar. AI **cannot** verify the external reaction — that is
  the user's deployment + capture.
- **Humans verify:** the authenticity of the external reaction (the proof-pending queue).
- **Stored:** as a `ProofEvent` linked to the cleared micro-skills + the before/after (the
  CapabilityRecord). **[SCHEMA GAP]** dedicated proof store.
- **Influences future missions:** `P(proof | clearance)` per bar → the Knowledge Evolution Engine
  promotes load-bearing bars and retires gameable ones.

---

## CHAPTER 10 — Graduation

- **Declare success** only when the **3-part mastery test** passes: **transfer** (clears the tightened
  bar on *fresh* work, unaided) + **automaticity** (low attempts, fast) + **external proof** (a real
  pricer reacted). All three. Anything less = "partial," stated plainly.
- **Avoid early graduation:** re-diagnose on **fresh** work, never the practiced artifact; the named
  failure mode must be absent under rising difficulty + falling scaffolding.
- **Re-diagnosis:** grade the new work against the **same bar** + the retained baseline; verdict
  moved / partially moved / did not move, with the reason. A flat/down verdict is valid and shipped.
- **Opens next:** Career Intelligence ranks the next capability (`leverage`, Decline-Gate-filtered).

---

## CHAPTER 11 — Capability Evolution (versioning + retirement)

- **Versioning (MUST):** every map, bar, and eval-prompt carries a `version` + `provenance` (authority +
  flywheel evidence); each rep is tagged with the version it trained against. **[SCHEMA GAP]** add these.
- **Missions / examples / bars / prompts evolve** via the Knowledge Evolution Engine (`ATLAS_OS_V1 Ch
  16`): monthly, human-gated deltas computed from flywheel data (correction efficacy, `P(proof|clearance)`,
  grader-vs-human agreement). The founder approves deltas; never composes them.
- **Proof changes:** as proof data accrues, bars that clear but don't predict a real reaction are
  rewritten or retired.
- **Retirement:** a capability whose `ai_exposure` crosses a threshold (a tool now does it) → set
  `active_v1: false` — it no longer makes anyone harder to replace. A bar reality invalidates is
  deprecated, not silently edited.

---

## CHAPTER 12 — Quality Checklist (ship gate — fail any item, cannot ship)

**Learning quality** — ☐ one failure mode, one bar (Test 2) · ☐ 6–10 micro-skills, each with its own
bar · ☐ method sourced from a named authority.
**Business / career impact** — ☐ `why_it_matters` states Valued + Scarce · ☐ `ai_exposure` is low ·
☐ `recognition` names the pricer + the one sentence.
**Evaluation reliability** — ☐ two reviewers agree on the bar (Test 3) · ☐ ≥3 labeled near-misses in the
gold set · ☐ grader false-pass ≈ 0% on the gold set.
**Mission quality** — ☐ every rung ≤10 min on real work · ☐ each rung forces exactly one micro-skill ·
☐ clear-to-advance, retry, one-move correction wired.
**Transfer** — ☐ reps vary product/segment/stakes · ☐ `thirty_day_success_criteria` requires unaided
fresh-work application (Test 6) · ☐ spaced retrieval scheduled.
**Proof** — ☐ `proof` is externally validated · ☐ a Week-4 engineered ask exists · ☐ before/after captured.
**Automation** — ☐ runtime only *selects* from the map (no composing) · ☐ low-confidence routes to human.
**Scalability** — ☐ persona has recurring real-work supply (Test 4) · ☐ runtime cost is constant
(no per-user authoring).
**Retention** — ☐ a day-one felt win exists · ☐ the Week-2 valley is named and de-risked (smallest reps).

---

## CHAPTER 13 — Failure Analysis (destroy the spec)

| Risk | Why it happens | Detect | Fix | Prevent in future versions |
|---|---|---|---|---|
| **Bundle as one capability** | author packs 2+ failure modes | reviewers name 2 "one things" | split | Test 2 at authoring |
| **Illegible bar** | needs expert taste | grader-vs-human disagree | rewrite naive-checkable | Test 3 + the gold set |
| **Gameable bar** | passes without the real thing | high clearance, low `P(proof|clearance)` | re-anchor externally | self-securing rule (§5) |
| **Non-transferring** | drills one artifact | fresh-work re-diagnosis fails | vary conditions + spaced retrieval | Test 6 + Ch 7 |
| **Not actually valued** | peer-only value | no proof event ever occurs | retire | Test 7 at authoring |
| **High AI-exposure** | a tool already does it | `ai_exposure` high | target the judgment/ownership layer | Test 7-scarce |
| **GPT-water method** | no named source | `method.source` missing/generic | require a named authority | schema-required `method.source` |
| **Curriculum collapse** | adding faster than validating | new entries fail the 7 tests | deactivate + rework | one-at-a-time + the validity gate |

**Top three by lethality:** gameable bar → non-transferring → not-actually-valued. All three are invisible
without the gold set, the fresh-work re-diagnosis, and the proof linkage.

---

## CHAPTER 14 — Worked Example: M1 mapped to the spec (proves it's practical)

Not a redesign — a mapping of the existing `lib/atlas/constraints/m1-generic-positioning.ts` to each
section, showing the spec is already satisfied:

| Spec section | M1's actual content |
|---|---|
| Ch 1 — one failure mode | "Every claim is equally true of three competitors; no prospect can say *why you*." |
| Ch 2 — Valued/Scarce/Recognizable | `why_it_matters`: undifferentiated messaging is invisible + easy to replace; the ability to make a claim only you can make is scarce + the prospect's playback is recognizable. |
| Ch 3 — schema | every field filled; `method.source` = Dunford + Moore + Ogilvy. |
| Ch 4 — micro-skill graph | 9 micro-skills, `spot_generic` first → `repeatable_playback` last. |
| Ch 5 — mission contract | `M1_LADDER` (24 rungs), each ~8 min, personalized to the user's work, bar from `resolveMissionBar`. |
| Ch 6 — bar | `bar.pass_conditions` ("a naive reader restates the differentiator… false of three named competitors"); grader = `rep-check.ts`. |
| Ch 7 — difficulty curve | the four phases SEE→CROSS→INDEPENDENCE→PROVE across the 24 rungs. |
| Ch 8 — examples | `worked_examples` (Support SaaS, analytics, Ogilvy) + `failure_patterns` (category truism, shared attribute, unproven superlative…). |
| Ch 9 — proof | a real prospect repeats the positioning, unprompted, on a live asset (`proof_kind: external`). |
| Ch 10 — graduation | re-rating on fresh work vs the same bar; `thirty_day_success_criteria` = unaided differentiation claim. |
| Ch 11 — evolution | [GAP] versioning not yet wired; method is sourced + ready to evolve from flywheel data. |
| Ch 12 — checklist | M1 passes all but the two [GAP] items (engineered proof ask, versioning). |

**Verdict:** M1 satisfies the spec today except the two known [GAP] items — which proves the spec is
practical, and pins exactly what to finish before authoring capability #2.

---

## FINAL OUTPUT

### 1. The 30 rules every Atlas capability must follow
1. Pass all seven validity tests or it does not ship. 2. One failure mode, one top-level bar. 3. 6–10
micro-skills, each with its own bar. 4. Every bar is falsifiable + naive-checkable. 5. Every bar is
self-securing (gaming ≈ doing the real thing). 6. Every bar is tightenable across four weeks. 7. No
score/%/money/band anywhere user-facing. 8. `why_it_matters` states Valued + Scarce. 9. Low `ai_exposure`
or reject. 10. `recognition` names the pricer + the one sentence. 11. `method.source` cites a named
authority. 12. Runtime only selects from the map; never composes. 13. Reps are on the user's real work
only. 14. Smallest meaningful rep (≤10 min). 15. Clear-to-advance, never submit-to-advance. 16. One
pre-approved correction per micro-skill (not five). 17. Difficulty only rises across phases. 18. Reps
vary product/segment/stakes. 19. Spaced retrieval of earlier micro-skills. 20. Day-one felt win exists.
21. The Week-2 valley is named + de-risked. 22. ≥3 worked examples + failure patterns + ≥3 near-misses.
23. Near-misses seed the eval gold set. 24. Grader false-pass ≈ 0% before ship. 25. Low-confidence →
human. 26. Proof is external + attributable + before/after. 27. One proof event suffices; self-report
does not. 28. Graduation = transfer + automaticity + external proof. 29. Re-diagnosis on fresh work, same
bar, honest verdict. 30. Versioned with provenance; retire when `ai_exposure` crosses the line.

### 2. The 20 mistakes capability designers make
1. Shipping a bundle as one capability. 2. A bar only an expert can apply. 3. A bar that passes without
the real thing. 4. Drilling one artifact (no transfer). 5. A capability a tool already does. 6. A
capability only peers value. 7. Unsourced "GPT-water" method. 8. Letting the AI compose coaching at
runtime. 9. Fabricated/hypothetical exercises instead of real work. 10. Reps too big (>10 min). 11.
Submit-to-advance (fake progress). 12. Five suggestions instead of one move. 13. Lowering the bar to
manufacture wins. 14. No condition variation. 15. No day-one win (the valley kills them). 16. No
near-miss set → uncalibrated grader. 17. Grading on vibes, no gold set. 18. Self-reported "proof." 19.
Graduating on the practiced artifact, not fresh work. 20. Editing a bar silently instead of versioning it.

### 3. Capability creation workflow
Draft failure mode → run the 7 tests → write `why_it_matters` (Valued/Scarce/Recognizable) → author the
bar (pass/fail conditions, two-reviewer check) → decompose into 6–10 micro-skills (+ bars) → source the
`method` (named authority) → write worked examples + counterexamples + ≥3 near-misses → build the 4-phase
ladder → run the Ch 12 checklist → `active_v1: false` until promoted.

### 4. Capability review workflow
Two independent reviewers apply the bar to sample artifacts (must agree) → run near-misses through the
grader (false-pass ≈ 0%) → verify every Ch 12 gate → confirm a Week-4 proof path exists → sign-off → set
`active_v1: true`.

### 5. Capability versioning workflow
Every map/bar/eval-prompt has a `version` + `provenance`; reps tag the version trained against → monthly,
the Knowledge Evolution Engine proposes deltas from flywheel data → a human approves promote/prune/retire
→ bump version, keep provenance → never silently edit a live bar.

### 6. Capability retirement workflow
Trigger: `ai_exposure` crosses threshold OR real data shows no transfer (Test 6) or no proof (Test 7) →
set `active_v1: false` (stop selling) → keep the entry + history for provenance → if a judgment/ownership
layer remains valuable, author that as the successor capability.

### 7. Capability quality scorecard
Score each dimension PASS/FAIL (any FAIL = cannot ship): Validity (7 tests) · Singularity · Bar legibility
(two-reviewer) · Grader false-pass ≈ 0% · Mission contract (≤10 min, one micro-skill, clear-to-advance) ·
Transfer (variation + fresh-work success) · Proof (external + path) · Automation (selects, not composes) ·
Scalability (real-work supply, constant runtime) · Retention (day-one win + valley de-risked) · Versioning
(version + provenance). 11 PASS = shippable.

---

*End CAPABILITY_SPEC. Subordinate to `ATLAS_OS.md`, `CONSTRAINT_DESIGN_MANUAL.md`, and `ATLAS_OS_V1.md`.
Resolve the two [SCHEMA GAP]s (prerequisites/dependencies, version/provenance) before authoring the second
capability.*
