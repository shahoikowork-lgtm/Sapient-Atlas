# INTELLIGENCE_LAYER — the data, graph, and job architecture under Atlas

**What this is.** The engineering substrate beneath the prose docs: the concrete schemas (nodes, edges,
tables), the job schedule, and the scaling plan for Atlas's intelligence. It is **additive** — it does
not restate the engines (those live in `ATLAS_OS_V1.md`), the capability authoring standard
(`CAPABILITY_SPEC.md`), the validity tests (`CONSTRAINT_DESIGN_MANUAL.md`), or the doctrine
(`ATLAS_OS.md`). It specifies the *data structures and pipelines* those documents assume.

**Status tags:** `[BUILT]` exists in code · `[GAP]` specified, not built · `[FUTURE]` years out, needs
data first.

**The honest engineering caveat (read first).** The Outcome Graph (§4) is the moat, and its schema
**cannot be finalized before real reps flow** — designing it in detail now would over-fit a guess. So
this doc fixes the *minimum* you must capture from rep #1 (so nothing is lost) and forward-designs the
rest as `[GAP]/[FUTURE]`. The gating dependency for the entire intelligence layer is unchanged: **a
hardened grader + the flywheel turning on real users.** This doc tells you *what to build when you
persist the flywheel*; it does not replace doing it.

**Where each requested part already lives (so this doc only adds the substrate):**

| Requested part | Already specified in | What this doc adds |
|---|---|---|
| Capability Graph (prose) | `ATLAS_OS_V1` Ch 2, `CAPABILITY_SPEC` Ch 4 | the node/edge schema + validation (§2) |
| Knowledge Graph (prose) | `ATLAS_OS_V1` Ch 3 | the node/edge schema + trust/freshness/versioning (§3) |
| Outcome Graph / flywheel | `ATLAS_OS_V1` Ch 13, 16 | **the actual fact tables + materialized aggregates (§4)** |
| Career Intelligence | `ATLAS_OS_V1` Ch 11 | the leverage formula + the longitudinal record schema (§5) |
| Learning Intelligence | `ATLAS_OS_V1` Ch 5, 15 | the per-day decision inputs (§6) |
| Adaptive Intelligence | `ATLAS_OS_V1` Ch 8, 16 | **the job/cron schedule (§7)** |
| Reasoning | the Trust System (`CLAUDE.md`) | the bounded reasoning loop (§8) |
| Moat / 5-year | the CIE architecture (prior) | the store/job map at scale (§9, §10) |

---

## §1 — Intelligence Layer architecture (components + stores)

Five engines (specified in `ATLAS_OS_V1`) over six stores:

```
            ┌─────────────────────────── ENGINES ───────────────────────────┐
 artifact → │ Matcher → Prescriber → Verifier → (Adaptation) → Learner       │
            └───────────────────────────────────────────────────────────────┘
                 │            │           │                        │
   reads/writes  ▼            ▼           ▼                        ▼
 STORES:  Capability Graph  Knowledge   Outcome Graph         Eval gold sets
          (§2, git)         Graph (§3)  (§4, the moat)        (§4.4)
                                         + Capability Record (§5)
```
- **Matcher** (diagnosis) reads Capability + Knowledge graphs → writes a Diagnosis.
- **Prescriber** (mission gen) reads Capability Graph + the user's record → writes a Mission.
- **Verifier** (grader) reads the bar + Knowledge graph → writes a rep_event.
- **Learner** (monthly) reads the Outcome Graph → proposes versioned deltas to the other two graphs.
All runtime engines **select** from the graphs; none generates knowledge (the design-time-approval gate
— the structural defense against hallucination).

---

## §2 — Capability Graph specification

**Do not build a graph database.** For years there are <100 capabilities; a graph DB is over-engineering.
The graph is **small, static, authored-in-git, validated at import.**

- **Nodes:** `capability` (a `Constraint` entry), `micro_skill`, `bar`. *(Today: `lib/atlas/constraints/*`.)* `[BUILT]`
- **Edges (typed):**
  - `belongs_to`: micro_skill → capability `[BUILT]` (the `capability_map`).
  - `prereq`: micro_skill → micro_skill, and capability → capability. `[GAP]` — add `prereqs: id[]` to the schema (the `CAPABILITY_SPEC` schema gap).
  - `unlocks`: capability → capability (what the next Sprint may open). `[GAP]`
- **Storage:** nodes = constraint files; edges = explicit fields, validated at import (a cycle in
  `prereq` → throws, like `ConstraintSchema.parse`). The adjacency is derived at build time, not stored
  in a DB.
- **What unlocks what:** the `unlocks` edges, *gated by* Career Intelligence leverage ranking (§5) and
  the Decline Gate. A capability is never "unlocked" mechanically — it is *ranked and offered*.
- **Never taught first:** any micro_skill with an unmet `prereq`; any capability whose
  `decline_gate_fit` fails for this user.
- **Branch / merge / insert / retire:** governed by `CAPABILITY_SPEC` Ch 1 (split/merge) + Ch 11
  (retire when `ai_exposure` crosses threshold). Insertion = author a new node + its edges, pass the
  seven tests, ship `active_v1: false`.
- **Scale rule:** migrate to a stored graph only if capabilities exceed ~200 *or* cross-capability
  prereqs become dense. Until then, git + import-validation is the correct architecture.

---

## §3 — Knowledge Graph specification

The sourced knowledge behind every bar/example/correction. **Today it is denormalized inside each
capability's `method` + `capability_map`** `[BUILT]`; normalize only when a source is reused across ≥3
capabilities.

- **Nodes:** `source` (book/paper/expert, with `authority`, `as_of`), `framework`, `worked_example`,
  `failure_pattern` (counterexample), `fix_pattern`, `bar`, `mental_model`; context: `profession`,
  `industry`, plus `[FUTURE]` `market_signal`, `ai_exposure_estimate`.
- **Edges:** `derived_from` (bar/example → source), `addresses` (fix → failure_pattern), `instance_of`
  (example → framework).
- **Trust:** `source.authority` — named authority = trusted; user-generated/AI-suggested = *provisional*
  until flywheel-validated (`P(proof|clearance)` lift). Rejected: anonymous web content, unsourced
  generation.
- **Freshness:** `source.as_of` + a decay applied only to time-sensitive nodes (`market_signal`,
  `ai_exposure_estimate`); evergreen frameworks (Dunford/Moore/Ogilvy) don't decay.
- **Versioning:** every node carries `version` + `provenance`. `[GAP]` — add to the schema.
- **Conflict resolution:** higher `authority` wins; ties → the one with better `P(proof|clearance)`;
  unresolved → human (design-time).
- **Hallucination prevention (structural):** the runtime only *selects* nodes; it never composes
  knowledge. A low-confidence/off-mission attempt routes to a human. **No generated knowledge ever
  reaches a user.** This is why Atlas ≠ a GPT wrapper.

---

## §4 — Outcome Graph specification (the moat)

The proprietary dataset: the link from *what Atlas did* → *whether the user cleared* → *whether reality
reacted*. **Capture the minimum from rep #1; it cannot be reconstructed later.**

### 4.1 Fact tables `[GAP — today captured in submissions.feedback jsonb]`
- **`rep_events`** — `{id, user_id, cycle_id, capability_id, micro_skill_id, bar_version, mission_version,
  correction_shown, attempts, quality(hit|partial|miss), confidence(high|low), auto_cleared(bool),
  cleared(bool), submitted_at}`.
- **`proof_events`** — `{id, user_id, cycle_id, capability_id, proof_kind(self|colleague|external),
  receiver_type, verified(bool), before_ref, after_ref, occurred_at}`.
- **`career_events`** `[FUTURE]` — `{user_id, type(promotion|raise|role_change|offer|retention),
  attributed_capability_id?, occurred_at, source(self_report|integration)}`. The long-horizon signal
  that ultimately validates the whole thesis.

### 4.2 Materialized aggregates (recomputed monthly by the Learner)
- **`correction_efficacy(capability, micro_skill, correction)` → `{clearance_lift, mean_attempts_to_clear, n}`**
- **`bar_validity(capability, bar_version)` → `{clearance_rate, P(proof|clearance), n}`** ← the keystone:
  a bar that clears but doesn't predict proof is gameable.
- **`mission_value(mission_version)` → `{completion_rate, downstream_transfer_rate}`**
- **`diagnosis_accuracy(failure_signature)` → `{moved_rate}`**

### 4.3 Stored / connected / discarded
- **Stored:** the structured signals above + consented before/after artifacts.
- **Connected:** rep_events → proof_events (per cycle) → career_events (per user) = the full chain.
- **Discarded:** raw artifact text past the retention/consent window; PII minimized; only structured
  signals + consented proof persist long-term.
- **How future users benefit:** the aggregates reweight corrections, retire/rewrite bars, retire
  missions, and sharpen diagnosis — for everyone. This is the compounding (`ATLAS_OS_V1` Ch 16).

### 4.4 Eval gold sets (the reliability asset)
Labeled `(rep → verdict)`, `(artifact → constraint)`, `(clearance → did-proof-happen)`. Gates every
grader/map change. Grows with every human review. `[GAP — seeded by scripts/eval-grader.ts]`

---

## §5 — Career Intelligence specification

Mostly `[FUTURE]`; today it is the value assessment + re-rating + next_move `[BUILT]`.

- **Market value / replaceability / salary:** internal signals only, **never shown to the user**
  (doctrine). Derived from `value_assessments` (capability scores, `ai_exposure`, `trajectory`).
- **Capability ROI / leverage (the selection formula):**
  `leverage = (value_lift × movability × P(transfer)) ÷ effort`, weighted **down** by `ai_exposure(capability)`.
  Data: the Outcome Graph (`P(transfer)`, `P(proof|clearance)`) + the labor-market layer (`ai_exposure`
  — today a static estimate, `[FUTURE]` from external data).
- **Plateau detection:** re-diagnosis "did not move" OR a decay flag OR a flat `trajectory` across cycles.
- **Next-bottleneck prediction:** the Matcher on fresh work + the `unlocks` edges + leverage ranking.
- **The 5-year build = the Capability Record:** `{user_id, [cleared capabilities with version, date,
  difficulty, proof_event_ref]}` — the longitudinal, reality-validated record of what the user can do.
  `[GAP — derived today; needs a durable store]`. This record *is* the "career brain"; everything else
  is upstream of it.

---

## §6 — Learning Intelligence specification (the per-day decision)

Every day the Prescriber answers "why this mission?" deterministically, from data — not by free reasoning:
- **Why this capability:** it is the active constraint (Matcher) until re-diagnosis says moved.
- **Why this mission/difficulty:** the next un-cleared rung on the capability's ladder (clear-to-advance);
  difficulty = the rung's phase on the three axes.
- **Why this example/exercise:** the rung's micro_skill → its authored `worked_example` + `bar` +
  `fix` (selected, not generated).
- **Why this feedback/retry:** the bar-check verdict + the one pre-approved correction; confident miss →
  retry, low-confidence → human.
- **Highest-leverage check:** within a capability, the ladder order *is* the leverage order (prereqs +
  the four-phase arc); across capabilities, §5's leverage formula. **The decision is a lookup + a
  ranking, never an open-ended generation** — which is what keeps it reliable and copy-resistant-by-data
  rather than copy-resistant-by-prompt.

---

## §7 — Adaptive Intelligence specification (the job schedule)

| Cadence | Job | Reads | Writes | Human? |
|---|---|---|---|---|
| **Real-time** | grader verdict · instant read · flywheel capture | bar, map | `rep_events` | no (high-conf); human on low-conf |
| **Daily** | ops flags (stuck/at-risk) · time-to-first-win | rep_events | `/admin/ops` | no |
| **On grader change** | eval gold-set regression (CI gate) | gold sets | pass/fail | blocks ship |
| **Weekly** | edge-case queue review · cohort funnel snapshot · grader drift check | rep_events, gold sets | review actions | founder (≤1/10 reps) |
| **Monthly** | **the Learner** — recompute §4.2 aggregates → propose map deltas (promote/prune corrections, retire/rewrite bars by `P(proof|clearance)`, retire missions, draft examples from consented work) | Outcome Graph | versioned map deltas | founder approves deltas |
| **Yearly** | capability retirement (`ai_exposure` crossings) · author new capabilities from clustered unmapped failures | knowledge + outcome | new/retired nodes | founder authors |

`[BUILT]`: real-time + daily (ops/metrics). `[GAP]`: the eval CI gate, the weekly drift check, the
monthly Learner. The founder never composes content — only approves deltas and edge cases.

---

## §8 — Reasoning Engine specification (bounded, not open-ended)

Atlas does **not** run an open-ended reasoning agent — that is exactly where hallucination and
GPT-water live. Reasoning is bounded to the **Trust System loop**:
1. **Hypothesis** — the diagnosed constraint, with evidence (quoted from the artifact) + confidence + a
   **falsifiable 30-day prediction** (logged).
2. **Test** — the reps + the bar (reality-anchored), over 30 days.
3. **Resolve** — at re-rating, the prediction is graded hit/partial/miss; the verdict (moved/partial/not)
   updates the user's record and **changes Atlas's mind** (the next constraint).
- **Uncertainty:** the `confidence` field + the Decline Gate (refuse what it can't honestly move).
- **Conflicting evidence:** routes to a human (design-time or edge-case).
- **Avoiding overconfidence:** the strict false-pass budget + low-confidence → human + the *honest "did
  not move"* verdict shipped plainly.
**Bounded reasoning is the feature, not a limitation** — it is what makes the output verifiable and the
intelligence accumulable.

---

## §9 — Competitive moat analysis

**The asset is the Outcome Graph** (correction → clearance → proof → career-event), plus the
eval-validated bars and the authored maps. Why each giant fails to copy it:
- **OpenAI / Anthropic / Google** — best models, **zero capability-outcome-proof data**. A model is not
  a moat here; the graph is.
- **LinkedIn / Microsoft** — titles, résumés, connections — **not the (capability → clearance → proof)
  linkage**. They know you *have* a job, not whether you got *better*.
- **Coursera / Udemy** — measure completions (vanity); no real-work reps, no reality grade. Copying Atlas
  means abandoning their content-library model.
- **Duolingo** — has the loop, but for a domain with a *cheap automatic grader*. Professional capability
  has none — building the reliable verifier + the proof signal is the part they'd reinvent from scratch.

**The one real vulnerability:** until Atlas has users, the graph is empty — and a player *with* users
(LinkedIn) could start the same flywheel. **The only defense is to start it first.** No document changes
this; the grader + first cohort do.

---

## §10 — Five-year system architecture

- **Stores:** capabilities-in-git (graph) · normalized knowledge nodes · `rep_events` · `proof_events` ·
  `career_events` · the Outcome Graph aggregates · eval gold sets · the fine-tuned verifier's training set
  · the Capability Records.
- **Engines:** Matcher, Prescriber, Verifier, Adaptation, Learner (`ATLAS_OS_V1`), plus a `[FUTURE]`
  Career-world-model.
- **AI evolution:** Yr 1 prompt-judge + authored maps + heuristic matcher → Yr 2–3 **fine-tuned verifier**
  on the gold set (cheaper, lower-variance) + learned matcher → Yr 4–5 a **capability world-model** that
  predicts replaceability trajectory + highest-ROI next capability from the proprietary graph.
- **Jobs at scale:** §7's cadence, with the Learner sharded per capability; the verifier served as a
  fine-tuned model; the eval gate in CI.
- **Founder model:** approve monthly map deltas + the edge-case queue + author new capabilities. Owns the
  *standard*, never the throughput. A software company, not a coaching practice.

---

## What to build first (this doc → the roadmap)

This architecture changes no priorities. It makes one thing concrete: **when you build roadmap #3
(persist the flywheel), create `rep_events` + `proof_events` per §4.1 and capture them from the very
first cohort** — because the Outcome Graph is the moat and it cannot be backfilled. Everything else here
is forward-design to be finalized *with* real data, after the grader (#1) and the proof event (#2) are
trustworthy.

---

*End INTELLIGENCE_LAYER. Subordinate to `ATLAS_OS.md`, `ATLAS_OS_V1.md`, `CAPABILITY_SPEC.md`, and
`CONSTRAINT_DESIGN_MANUAL.md`. The substrate, not a restatement.*
