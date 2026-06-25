# Atlas Operating System — Canonical Doctrine

**Status: LOCKED.** This is the company doctrine for Sapient Atlas. Every future prompt,
feature, screen, and product decision must conform to it. When a proposal conflicts with
this document, the proposal is wrong, not the document. Changes require an explicit,
deliberate revision of this file — not drift.

This sits above feature specs and below the operational guardrails in `CLAUDE.md`
(Supabase project, service-role writes, RLS, human-review gate, no secrets), which remain
non-negotiable and are inherited here by reference.

**The one filter that settles every scope question:**

> If a feature does not help a digital professional remove the single constraint limiting
> their growth by executing one move on their own real work within 30 days, it is not part
> of Atlas V1.

Compressed: **One professional. One constraint. One move. One sprint. Real work.**

---

## 1. Core principles

1. **Atlas is a capability development system.** It is not a course, a coaching program, a
   productivity app, a habit tracker, a task manager, or a learning platform.
2. **The promise:** help a digital professional become *harder to replace* by removing one
   growth constraint at a time, proven on their own real work. Tagline: *The Art of
   Becoming Harder to Replace.*
3. **The spine is Constraint → Bar → Rep → Proof.** Everything maps to it.
   - **Constraint** — the capability bottleneck limiting growth.
   - **Bar** — the falsifiable definition of what "good" looks like.
   - **Rep** — the smallest version of the hard thing the user avoids, done on real work.
   - **Proof** — externally validated evidence the user can now do it.
4. **Capability is built by reps, not content.** The only teaching is feedback on the
   user's own reps. Knowledge is incidental; the changed ability is the product.
5. **The output is capability acquisition, not learning.** Success is "I can now do X,"
   never "I learned about X."
6. **Everything is falsifiable, and proof is external.** Bars are checkable. Final proof is
   validated by reality (a prospect, an engineer, a peer), never by Atlas's say-so.
7. **Honesty over flattery.** Atlas declines what it cannot move and delivers honest
   re-rating verdicts, including "it didn't move, and here's why."
8. **One thing at a time.** One constraint, one move, one rep focus, one feedback note.
9. **No numbers to the user.** No scores, no /100, no bands, no bars-as-grades, no market
   value or salary in any user-facing surface.
10. **No mechanism talk.** The user experiences results, not process. Do not explain AI,
    models, or review pipelines to them. They should feel understood, not analyzed.
11. **Human-review gate, with a design-time-approval lane.** *Revised 2026-06-25.* Free-form
    AI prose to the user stays gated: anything the AI composes itself is drafted, human-
    approved, then delivered. A single constrained runtime lane is the exception — Atlas may
    give instant feedback only when bound to a pre-approved capability map: it may check the
    attempt against a published bar, point to the failing phrase, explain why it fails, and
    offer one pre-approved correction pattern. It may never freely coach, invent strategy or
    doctrine, or write the user's final work. High confidence delivers instantly; low
    confidence, an off-mission attempt, or anything needing a new strategy routes to a human.
12. **The user's own real work is both the medium and the proof.** No exercises, no
    hypotheticals, no fabricated scenarios.

---

## 2. The Decline Gate

Atlas's credibility depends on refusing constraints it cannot honestly move. At diagnosis,
every candidate constraint is classified against four tests:

1. **Capability-shaped?** Is the limiter a capability the user can change — not a
   circumstance, a relationship, or luck?
2. **Legible bar?** Can "good" be defined concretely enough that progress is checkable?
3. **Reppable on real work?** Does the user have live, real work to rep against for 30 days?
4. **30-day movable?** Can a meaningful shift happen in 30 days (not a multi-year capability)?

If **any** test fails, Atlas does not sell a Sprint. It names the category honestly and
routes the user away.

**Categories Atlas refuses (always):**
- **Psychological / identity** — confidence, imposter syndrome, motivation, discipline.
  Not capabilities, not artifact-gradeable, therapy-adjacent. Out of scope and unsafe.
- **Relational / political** — "my manager doesn't see me," influence over specific people.
  The medium is other humans; not reppable in isolation.
- **Circumstantial** — wrong company, dying market, underpaid. The honest answer is "change
  the situation," not "sprint."
- **Long-horizon judgment** — strategic bets whose feedback exceeds 30 days. The loop can't
  close without fabricating proof.
- **One-shot, high-stakes events** — a single negotiation or pitch. Cannot rep; cannot fail
  safely.
- **Health / life** — burnout, overwork. Out of scope, ethically fraught.

Expect to decline roughly a third of would-be users. **The refusal is the product's
integrity, not a leak in the funnel.**

---

## 3. The Diagnosis System

- **Input:** one real work artifact (campaign, strategy doc, landing page, PRD, pitch deck,
  copy, UX case, analysis, content plan, investor email) plus optional context.
- **Process:**
  1. Read the artifact for what is already strong and what is limiting growth.
  2. Identify the **single dominant constraint** and name its **observable failure mode**.
  3. Run the **Decline Gate**. If it fails, decline honestly and stop.
  4. Set the **Bar** for the constrained capability.
  5. Capture the **baseline** (the Day-1 state, retained for re-rating).
  6. Produce **one move** — explainable by the user in a single sentence.
  7. Log a **falsifiable prediction** to be graded at re-rating.
- **Output to the user:** one constraint, evidence from their own work, the bar (what
  becomes possible), and the one move. Nothing else.
- **Standing risk:** diagnosis accuracy is the single point of failure. Everything
  downstream is only as good as the constraint named here. Treat misdiagnosis as the
  highest-severity product failure.

---

## 4. The Constraint Library

The library contains only survivors of the Decline Gate: capability-shaped, legible-bar,
reppable, 30-day-movable. V1 launches on **Marketer / M1** and expands one constraint at a
time. Rep progression for every constraint follows the universal Sprint arc (§5).

### Marketers
**M1 — Generic positioning (no differentiation)** *(V1 flagship)*
- *Failure mode:* every claim is equally true of three competitors; no prospect can say
  "why you."
- *Bar:* a prospect repeats "why you, not them" in one sentence, false of three named
  competitors.
- *Proof:* a live asset a real prospect/colleague distinguishes from competitors, unaided.
- *30-day success:* independently produces a differentiation claim that passes the bar on
  fresh work.

**M2 — Activity reporting (can't connect work to outcomes)**
- *Failure mode:* reports outputs, never the business metric moved.
- *Bar:* every claim of work ties to a business outcome or an explicit, falsifiable
  hypothesis about one, in a founder's/CFO's language.
- *Proof:* a real report/brief that leads with outcome and survives "so what moved?"
- *30-day success:* independently frames work in outcome/revenue terms without prompting.

### Founders
**F1 — Unclear winning narrative**
- *Failure mode:* the pitch is a feature list; listeners can't repeat why-now or why-team.
- *Bar:* a naive listener repeats problem + why-now + why-team-wins in three sentences.
- *Proof:* a real pitch where a cold listener plays the thesis back accurately.
- *30-day success:* delivers, unaided, a narrative a cold listener repeats and that
  survives the top objection.

**F2 — Can't say no (no strategic focus)**
- *Failure mode:* nine priorities; nothing explicitly killed.
- *Bar:* names the single most important thing and what was explicitly killed to protect
  it, with reasoning.
- *Proof:* a real plan naming the one bet and the killed alternatives, defended to the team.
- *30-day success:* independently produces focused plans with explicit, defended non-goals.

### Product Managers
**P1 — Weak problem framing**
- *Failure mode:* PRDs open with solutions; no explicit non-goals; no falsifiable success.
- *Bar:* the problem is so sharp the solution feels obvious, non-goals are explicit, success
  is falsifiable.
- *Proof:* a real PRD an eng-lead confirms is unusually clear on problem + non-goals +
  success.
- *30-day success:* independently writes problem statements that pass the bar.

**P2 — Roadmap is a wish list (no prioritization logic)**
- *Failure mode:* everything ranked "high"; no trade-off reasoning.
- *Bar:* every priority states the trade-off (what we're not doing and why) in
  impact-vs-cost terms.
- *Proof:* a real roadmap an exec or eng-lead accepts as well-reasoned.
- *30-day success:* independently produces defensible prioritization with explicit
  trade-offs.

### Growth Operators
**G1 — Runs activity, not experiments**
- *Failure mode:* tactics launched with no hypothesis, no pre-set threshold.
- *Bar:* every action is a falsifiable experiment — hypothesis, metric, threshold,
  pre-committed read.
- *Proof:* a real experiment doc, pre-registered, with an honest post-read.
- *30-day success:* independently runs growth work as pre-registered experiments and
  extracts the learning.

**G2 — Optimizes vanity metrics**
- *Failure mode:* celebrates clicks/signups while the value metric is flat or unmeasured.
- *Bar:* every initiative names the one metric that maps to value, resists the proxy, and
  states the causal chain.
- *Proof:* a real growth plan anchored on the value metric with the causal chain defended.
- *30-day success:* independently anchors growth work on value metrics, not proxies.

### AI Operators
**A1 — Specification ambiguity (unreliable outputs)**
- *Failure mode:* under-constrained prompts; output varies; failures handled by re-rolling.
- *Bar:* a task is specified so output is reliable across cases and failures are diagnosable
  to a spec gap.
- *Proof:* a real workflow + test cases showing reliable output, failures traced to spec.
- *30-day success:* independently specs AI tasks to measurable reliability.

**A2 — No evaluation discipline (ships on vibes)**
- *Failure mode:* quality judged by eyeballing one example; no test cases; no regression
  check.
- *Bar:* output quality is defined by a falsifiable eval (cases + pass criteria); changes
  are checked against it.
- *Proof:* a real eval suite that gates a workflow, accepted by a technical peer.
- *30-day success:* independently defines and applies falsifiable evals.

---

## 5. Sprint Architecture

**The universal arc (every Sprint, every constraint):**

| Week | Name | Objective | Posture |
|---|---|---|---|
| 1 | **See** | Make the failure mode visible on the user's own work | Heavy scaffolding |
| 2 | **Cross** | Reach the first bar-clear (the valley) | Scaffolding coming off |
| 3 | **Independence** | Reliable clears, unaided, harder conditions | No scaffolding |
| 4 | **Prove** | One high-stakes independent rep → externally validated proof | Real stakes |

**Day 1** establishes: the 30-day target, the bar (with a worked example), the baseline rep,
the queue of real work to rep on, and an explicit naming of the Week-2 valley. It also
delivers the **first felt win in the first session**: the user rewrites the single weakest,
most generic line from their own submitted work and watches it clear the first bar — proof on
day one, not only at day 30.

**The rep is a daily move** — the smallest unit of real work that forces the constrained
capability, ~10 minutes, on one piece of the user's actual work, done most days — never an
exercise. A Sprint is a cadence of these small moves over 30 days, done at a near-daily
rhythm and grouped into the four phases. The smallest possible move keeps activation energy low, especially in
the Week-2 valley; the bar, not the clock, defines when a move clears.

> *Revised 2026-06-25: V1 moved from ~8–12 reps of 20–40 min to a daily ~10-minute cadence,
> to cut time-to-first-win and daily effort (Hormozi value equation). The four-phase arc, the
> weekly-tightening bar, the three progress axes, and externally validated proof are unchanged.*

**The bar tightens weekly** on the same capability: distinct → distinct + excludes/falsifiable
→ provable, unaided → high-stakes + externally validated.

**Progress is measured on three axes**, read from the artifacts, never self-reported:
- **Quality** — hit / partial / miss against the bar.
- **Independence** — heavy → light → no scaffolding.
- **Difficulty** — low-stakes/familiar → high-stakes/novel.

Progress = clearing a higher bar, more reliably, with less help, on harder work.

---

## 6. The Feedback System

**Feedback is the product.** It is always pointed at the user's own work, specific to the
bar, prescriptive of the next rep, and never generic praise.

**Two layers:**
- **Per rep (instant, design-time-approved):** the bar rendered as a checklist; each condition
  returns pass/fail with the exact spot in the user's work, plus — on a miss — the one
  pre-approved correction pattern for that micro-skill. Every word is selected from the
  approved capability map, never composed at runtime, so it crosses no gate and delivers live.
  A low-confidence or off-mission verdict routes to human review instead of delivering.
- **Per week (human-reviewed):** one surgical note naming the single remaining failure mode
  and the next rep's focus. This is free-composed AI prose, so it stays AI-drafted,
  human-approved, then delivered.

**Detection:**
- *Generic* → fails the bar's exclusion/specificity test. Fully detectable.
- *Shallow* → passes surface, fails second-order checks (distinct but not provable; trivial
  non-goals). Where human review earns its keep.
- *Copied* → reps are anchored to the user's named real work; off-context or
  trajectory-inconsistent reps flag. (Perfect detection is impossible; structural defenses
  below carry the load.)
- *Real progress* → the named failure mode disappears across reps under rising difficulty
  and falling scaffolding. Longitudinal, never a single rep.

**Escalating demand:** three dials turn together each week — the bar tightens, scaffolding
withdraws, conditions harden. The user always works at the edge of current ability.

**Anti-gaming:**
- **A well-designed bar is self-securing** — the only way to pass it is to do the real thing.
- **Proof is externally validated** — a real prospect/engineer/peer, not Atlas, confirms it.
- **Trajectory, not reps** — gaming one rep doesn't make the failure mode disappear across
  twelve under rising difficulty. A gamed Sprint yields no real-world recognition, so the
  incentive collapses.

---

## 7. The Recognition Layer *(V1: single-sided, user-deployed)*

The goal is not capability for its own sake — it is becoming harder to replace, which
requires that capability be *noticed* by someone with pricing power. In V1 this is built
**single-sided**: Atlas equips the user; the user deploys.

1. **Make capability visible** — real work that visibly cleared a bar it couldn't 30 days
   ago, with the before/after attached. Not a certificate.
2. **Create recognition-grade proof** — the deployed real artifact + a one-line capability
   claim in business language + the before/after as evidence. The proof is the user's own
   work, which their manager already trusts as ground truth.
3. **Help the user communicate it** — Atlas drafts a capability statement in the user's
   voice for the user to deploy into a 1:1, review, client update, or portfolio. Atlas
   drafts; the user sends. Atlas never contacts third parties.
4. **Close "I got better" → "the market noticed"** — by making the proof real, legible
   (their language), attributable (clearly theirs), and timed (surfaced at a review, pitch,
   or renewal). The user leaves holding both the evidence and the words.

**Boundary (locked):** V1 builds no Atlas-issued credential, no proof-of-improvement
network, no reputation marketplace, no social graph, no community. Those are future
possibilities, explicitly out of V1.

---

## 8. The Re-rating System

- **Trigger:** Day 30. The user submits **new real work**.
- **Method:** grade the new work against the **same bar** and the retained **baseline**,
  across the three axes (quality, independence, difficulty).
- **The question:** *Can this person now do something they could not reliably do before?*
- **Signal of a moved constraint:** the named failure mode that defined the constraint has
  disappeared under rising difficulty and falling scaffolding, confirmed on fresh work.
- **Verdict is honest:** moved / partially moved / did not move — with the reason. A "did
  not move" verdict is delivered plainly; that honesty is the brand.
- **System effects:** writes `value_history`, grades the logged prediction, and surfaces the
  **next constraint** — which begins the next Sprint. The loop continues one constraint at a
  time.

---

## 9. V1 Scope

**The irreducible transformation** requires all seven: a correct constraint, a legible bar,
reps on real work, feedback that improves the next rep, the valley survived, proof on fresh
work (before/after), and the user able to show it. Remove any one and it is a course or a
productivity app.

**Minimum Lovable Product:** *one persona, one flagship constraint, a human-run rep-and-bar
loop over 30 days, ending in before/after proof on real work plus one sentence the user can
say to their boss.* Concierge-grade, narrow, real.

**Keep (load-bearing):** real-work reps · the legible, tightening bar · surgical feedback on
the user's own work · the Decline Gate · the Week-2 valley mechanics · externally validated
proof · the before/after · the single capability statement · human-delivered weekly feedback.

**Cut for V1:** four of five personas (launch Marketer/M1 only) · automated feedback (run it
concierge) · any recognition network/credential · a rich Sprint dashboard (lightweight is
fine) · multi-constraint sequencing · subscriptions · analytics · ML gaming-detection.

**Business model (locked):** free Diagnosis → $149 30-day Sprint → re-rating → next
constraint → next Sprint. Do not force a subscription after the first Sprint. The atomic
paid unit is one 30-day constraint-removal cycle. The user is buying help removing the next
constraint, not access to software.

**Build on the existing schema:** `plans` (Sprint spec + tightening bar), `submissions`
(reps), `proof` (per-rep bar-check + final artifact), `predictions` (graded at re-rating),
`cycles`, `value_history` — all behind the human-review gate. Do not redesign the schema.

---

## 10. What Atlas will never do

- Never become a course, coaching program, productivity app, habit tracker, task manager, or
  learning platform.
- Never sell skill content, lessons, videos, or curriculum.
- Never show the user a numeric score, a /100, a band, or a market value / salary figure.
- Never explain its mechanism (AI, models, review pipeline) to the user.
- Never use gamification, streaks, or fake wins.
- Never send the user free-composed AI prose unreviewed — only pre-approved, map-bound runtime
  feedback (a published bar check plus its pre-approved correction) may reach them instantly;
  everything the AI composes itself passes the human-review gate first.
- Never sell a Sprint for a constraint the Decline Gate refused.
- Never fabricate or soften a re-rating verdict.
- Never build a recognition network, issued credential, reputation marketplace, social
  graph, or community in V1.
- Never serve beginners, students, or "I want to learn AI" users — only working digital
  professionals whose work exists as digital artifacts.
- Never widen to all professions; stay where the loop closes through digital artifacts.
- Never break the inherited operational guardrails in `CLAUDE.md`: only the Sapient Atlas
  Supabase project, service-role writes only, RLS always enabled, service-role key
  server-only, never commit secrets.

---

*End of canonical doctrine. Conform to it or revise it deliberately — never drift from it.*
