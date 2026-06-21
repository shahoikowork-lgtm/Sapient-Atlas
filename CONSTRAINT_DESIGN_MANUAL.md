# Atlas Constraint Design Manual — Canonical Doctrine

**Status: LOCKED.** This manual is the source of truth for every constraint added to Atlas.
No constraint enters the library unless it passes the rules below. It is subordinate to
`ATLAS_OS.md` (which it must never contradict) and governs the construction of the
Constraint Library and the behavior of the Decline Gate.

Two moments, one set of rules:
- **Design time** — this manual decides whether a candidate constraint may exist as a
  library entry at all.
- **Run time** — the Decline Gate applies the same tests to decide whether *this user's*
  diagnosed problem maps to a valid entry and still qualifies for a Sprint.

---

## 0. The definition, and the one decisive question

> **A valid Atlas constraint is a single, practice-able capability with a falsifiable,
> naive-checkable bar, reppable on the user's own real work, movable in 30 days, that
> generalizes to new work — and whose removal makes the person demonstrably harder to
> replace: valued, scarce, and recognizable.**

If you remember one question, remember this:

> **"If this person practiced the right thing on their own real work for 30 days — and
> nothing in their environment, employer, market, or relationships changed — would they end
> up able to do something valuable that is hard to replace, and could a third party tell?"**

If the honest answer is no, it is not an Atlas constraint.

---

## 1. What a constraint is — and is not

A **constraint** is a capability bottleneck: the single thing that, once removed, most
increases the person's ability to do valuable, hard-to-replace work.

A constraint is **not**:
- a **weakness** (a list of things you're not great at — a constraint is the *one* that gates growth),
- a **goal** ("get promoted" — that's an outcome, not a capability),
- a **skill topic** ("learn SQL" — Atlas builds capability through reps, not curriculum),
- a **task** ("finish the deck" — a task is done once; a capability is built by repetition),
- a **circumstance** ("underpaid", "dead-end team" — not changeable by the person's practice),
- a **trait or feeling** ("confidence", "discipline" — not an artifact-shaped work capability),
- **another person's behavior** ("my manager ignores me" — the locus is outside the user).

---

## 2. The Seven Tests (the validity gate)

A constraint is **valid only if it passes all seven.** Each test is a binary decision with a
concrete question. One failure invalidates the constraint.

### Test 1 — Validity (capability locus)
**Rule:** the bottleneck must live inside the person's own controllable practice on their work.
**Question:** *If they practiced the right thing for 30 days and nothing external changed, could they move it themselves?*
- **Pass:** locus is the person's action on their artifacts.
- **Fail:** locus is environment, market, luck, another person, or immutable psychology.
- **Discriminator:** "Can't differentiate positioning" (pass) vs. "My manager overlooks me" (fail — needs the manager to change) vs. "I lack confidence" (fail — not a practice-able work capability).

### Test 2 — Singularity
**Rule:** it must be exactly one bottleneck, expressible as one failure mode and one bar.
**Question:** *Does removing it build a single capability, or several independent ones?*
- **Pass:** one failure mode, one bar.
- **Fail:** it decomposes into independent capabilities — split it, or reject the bundle.
- **Discriminator:** "Generic positioning" (one capability: differentiation) vs. "Bad at marketing" (a bundle: positioning + prioritization + measurement + narrative — reject).

### Test 3 — Measurability (legible bar)
**Rule:** "good" must be a falsifiable bar a naive party can check.
**Question:** *Given the bar, would two independent reviewers agree on hit vs. miss for an artifact — without either needing to already possess the capability as rare taste?*
- **Pass:** reviewers converge; the bar is observable in the artifact.
- **Fail:** judgment requires privileged taste; reviewers wouldn't agree → illegible (reject, or it is an expert-only bar and out of V1 scope).
- **Discriminator:** "A prospect can repeat why-you, false of three competitors" (pass) vs. "The copy is elegant / has good taste" (fail).

### Test 4 — Reppability
**Rule:** it must be practiced on real work, in small repeated units, with feedback inside the loop.
**Question (all three must be yes):** *(a) Does the user have a recurring supply of real work that exercises this during the Sprint? (b) Is the smallest meaningful rep small (≈ ≤ 40 min) and producible on a real artifact? (c) Does usable feedback arrive inside the loop (self-check against the bar + reviewed weekly)?*
- **Pass:** all three yes.
- **Fail:** requires fake scenarios, one-shot high-stakes events, material the user doesn't have, or feedback that arrives too late.
- **Discriminator:** "Differentiation claims" (pass) vs. "Close a $1M enterprise deal" (fail — one-shot, no small rep, feedback in months).

### Test 5 — 30-Day Movability
**Rule:** a meaningful, observable shift must be possible in 30 days.
**Question:** *Is the capability's formation time measured in weeks (deliberate corrected practice changes it in ≤ 30 days), and does feedback on each rep arrive inside the Sprint?*
- **Pass:** weeks-scale formation; in-Sprint feedback.
- **Fail:** years-scale capability, or a feedback horizon longer than 30 days.
- **Discriminator:** "Problem framing" (pass) vs. "Strategic judgment / taste / leadership" (fail — forms over years; consequences reveal in months).

### Test 6 — Transferability
**Rule:** once built, the capability must generalize to new work, unaided.
**Question:** *Would clearing the bar on the Sprint reps predict clearing it, on the user's own, on a new piece of real work they haven't seen — because the rep builds a reusable pattern, not a memorized output?*
- **Pass:** sprint success predicts novel success; the rep progression varies conditions.
- **Fail:** success is a template or trick that wouldn't survive new context → redesign so reps vary conditions, or reject.
- **Discriminator:** a progression that varies product/segment/stakes and ends in unaided novel application (pass) vs. "rewrite this one page until it's good" (fail).

### Test 7 — Replaceability (the "harder to replace" test)
**Rule:** removing the constraint must actually make the person harder to replace. Three sub-tests, **all yes**:
- **Valued** — *Does someone with pricing power (manager, client, market) care about this capability — pay, promote, retain, or choose the person more for it?* (Peer/self-admiration does not count.)
- **Scarce** — *Is the capability hard to replace — not already done well by competent AI, not abundant cheap labor, not a commodity?* (If `ai_exposure` of this capability is high, building it does not make you harder to replace.)
- **Recognizable** — *Can the improvement be made visible, legible, and attributable to a pricer* (per the Recognition Layer)?
- **Fail any one** → the constraint may be a valid *practice*, but it is **not an Atlas constraint**, because removing it won't make the person harder to replace. Reject.
- **Discriminator:** "Differentiation" (valued by the market, scarce, recognizable — pass) vs. "Faster slide formatting" (fail scarcity — automatable commodity) vs. "Beautiful internal docs no one reads" (fail valued/recognizable).

---

## 3. Hard disqualifiers (the catalog of invalid)

These always fail, at the test named. The Decline Gate's refused categories live here.

| Disqualifier | Fails test | Why |
|---|---|---|
| Psychological / identity (confidence, motivation, discipline, presence) | 1, 3 | Not a controllable work capability; no legible bar; therapy-adjacent. |
| Relational / political ("get X to notice me", office politics) | 1 | Locus is another person. |
| Circumstantial (wrong company, dying market, underpaid) | 1 | Not movable by the person's practice. |
| Long-horizon judgment / taste / strategy | 5, 3 | Forms over years; feedback exceeds 30 days; illegible bar. |
| One-shot, high-stakes events (a single deal, a single raise) | 4, 5 | Cannot rep; cannot fail safely. |
| Health / life (burnout, overwork) | 1 | Out of scope; ethically fraught. |
| Bundles ("bad at marketing", "weak PM") | 2 | Multiple independent capabilities. |
| Commoditized / automatable capabilities (formatting, basic copy a tool does) | 7 (scarce) | Building it doesn't reduce replaceability. |
| Craft only the user/peers value | 7 (valued) | No pricing-power audience cares. |
| Capabilities that can never be shown | 7 (recognizable) | Improvement can't reach a pricer. |

---

## 4. Authoring rules (how to fill the Constraint schema so it passes)

Every constraint is stored in the structured `Constraint` entry. Each field has a rule:

- **`id` / `code`** — stable slug + a `code` tying back to `ATLAS_OS.md` (e.g. `M1`).
- **`persona`** — one of the five V1 personas; the constraint must be common for that persona.
- **`name` / `short_description`** — names the *one* bottleneck (Test 2), in plain language.
- **`observable_failure_mode`** — must be observable *in an artifact by a third party* (Test 3). Write what a reviewer would literally see, not an internal state.
- **`why_it_matters`** — must articulate the Replaceability case (Test 7): the value and the scarcity. If you can't, the constraint fails Test 7.
- **`decline_gate_fit`** — all four booleans must be `true` for an active constraint; they are the design-time record of Tests 1, 3, 4, 5.
- **`bar`** — see §5. The keystone of Test 3 and anti-gaming.
- **`rep_progression`** — see §6. Must satisfy Tests 4 and 6.
- **`proof_artifact`** — see §7. Must be externally validated (Test 7-recognizable).
- **`thirty_day_success_criteria`** — must require *unaided application on fresh, real work* (Tests 5 + 6).
- **`examples_of_real_work`** — concrete artifacts the user plausibly already produces (Test 4-supply). If you can't list several, reppability is in doubt.
- **`should_decline_if`** — the run-time signals that flip a *specific user's* instance to decline even though the library entry is valid (e.g. "the real block is the product has no differentiator"). These are the per-instance versions of the seven tests.
- **`not_v1_if` / `active_v1`** — scope gating. A valid constraint may still be `active_v1: false`.

---

## 5. The Bar rules (measurability + anti-gaming keystone)

A bar is valid only if it is **all six**:
1. **Falsifiable** — an artifact can fail it.
2. **Naive-checkable** — a reviewer who lacks the capability can still apply it (no privileged taste).
3. **Externally anchored** — passing is ultimately validated by a real-world receiver (a prospect, an engineer, a peer), not by Atlas's say-so.
4. **Self-securing** — the only way to pass is to actually have the capability; gaming the bar ≈ doing the real thing.
5. **Tightenable** — it can escalate across the four weeks (distinct → exclusive/falsifiable → provable, unaided → high-stakes + externally validated).
6. **Qualitative to the user** — expressed as conditions and hit/partial/miss, never as a score, /100, band, or money.

Write **`bar.pass_conditions`** and **`bar.fail_conditions`** so two independent reviewers
would agree. If they wouldn't, the bar fails Test 3.

---

## 6. The Rep rules (reppability + transferability)

A rep progression is valid only if:
- Every rep is on the user's **real work** — never an exercise, hypothetical, or fabricated scenario.
- The **smallest rep is small** (≈ ≤ 40 min) so activation energy stays low, especially in the Week-2 valley.
- It follows the **universal arc**: Week 1 *See* the failure mode → Week 2 *Cross* to the first bar-clear → Week 3 *Independence* → Week 4 *Prove* on fresh work.
- It **withdraws scaffolding** and **raises difficulty** across the weeks (the Independence and Difficulty axes).
- It **varies conditions** (product, segment, stakes) so the capability generalizes — the explicit guard for Test 6. A progression that drills one fixed artifact builds a trick, not a capability.
- The **Day-1 rep captures the baseline** (retained for re-rating).

---

## 7. The Proof rules (external validation)

The proof artifact is valid only if:
- It is the user's **own real work**, deployed where it matters — not a certificate, not an Atlas grade.
- It is **externally validated**: a real prospect repeats the positioning, an engineer signs off, a peer trusts the eval. *Atlas never validates its own proof.* This is the anti-gaming keystone — an externally validated proof cannot be faked, and a gamed Sprint yields no real recognition.
- It is **attributable** to the person and shows a **before/after** against the retained baseline.
- It satisfies the Recognizable sub-test of Test 7: a pricer can see it, read it, and credit it.

---

## 8. The "Harder to Replace" rubric (Test 7, expanded)

A constraint can pass Tests 1–6 and still be wrong for Atlas. Test 7 is the mission filter.
Apply all three; any miss rejects:

- **Valued** — name the pricing-power audience and what they would do differently (pay / promote / retain / choose). If the only audience is the user or their peers, reject.
- **Scarce** — state why the capability resists replacement by AI, cheaper labor, or commoditization. If a competent tool already does it, building it does not reduce replaceability — reject.
- **Recognizable** — describe how the improvement becomes visible, legible, and attributable to that audience. If it can never be shown, it cannot move replaceability — reject.

A constraint that is valid, measurable, reppable, and transferable but **not** valued-scarce-recognizable is a fine personal practice and a bad Atlas product. Reject it.

---

## 9. The validation checklist (and worked examples)

**To admit a constraint, every box must be checked:**

- [ ] **Validity** — locus is the person's practice on their work (Test 1)
- [ ] **Singularity** — one failure mode, one bar (Test 2)
- [ ] **Measurability** — falsifiable, naive-checkable bar; two reviewers agree (Test 3)
- [ ] **Reppability** — recurring real-work supply, small reps, in-loop feedback (Test 4)
- [ ] **Movability** — weeks-scale formation, in-Sprint feedback (Test 5)
- [ ] **Transferability** — predicts unaided success on new work; reps vary conditions (Test 6)
- [ ] **Replaceability** — valued AND scarce AND recognizable (Test 7)
- [ ] **Schema** — every field authored per §4–§7; `examples_of_real_work` is concrete; `should_decline_if` lists the per-instance failure signals

**PASS — M1, Generic positioning (Marketer):**
1 ✔ they can practice differentiating · 2 ✔ one capability · 3 ✔ "a prospect repeats why-you, false of three competitors" (reviewers agree) · 4 ✔ pages/claims are recurring, small, checkable · 5 ✔ moves in weeks · 6 ✔ reps span products/segments, end unaided · 7 ✔ valued by the market, scarce (not a commodity), recognizable (the prospect's playback). **Admit.**

**REJECT — calibrating failures:**
- "Build executive presence / confidence" → fails 1 and 3 (psychological, illegible).
- "Become a better strategic thinker" → fails 5 and 3 (years-scale, taste).
- "Format slides faster" → fails 7-scarce (automatable commodity).
- "Get my manager to recognize my work" → fails 1 (locus is the manager). *This is the recognition problem — Atlas serves it through the user-deployed Recognition Layer, not as a constraint.*
- "Get better at marketing" → fails 2 (bundle).
- "Land the Acme account" → fails 4 and 5 (one-shot, slow feedback).

---

## 10. Edge cases & precedence

- **Mixed capability + circumstance.** If a problem is part capability, part circumstance, the constraint is **only the capability portion**, and `should_decline_if` must flag the circumstance so a user whose real block is the circumstance is declined.
- **Valuable but automatable.** If a capability is valued but a tool already does it, it fails Test 7-scarce. The valid adjacent constraint is usually the *judgment/ownership* layer the tool can't do — define that instead.
- **Expert-only bar.** If the bar is legible only to an expert, it is out of V1 scope (it fails naive-checkability), not necessarily invalid forever.
- **Precedence when tests conflict:** Test 1 (validity) and Test 7 (replaceability) are decisive. A constraint that fails either is rejected regardless of how cleanly it passes the others. A measurable, reppable practice that doesn't make the person harder to replace is still a reject.

---

## 11. Governance

- Every new constraint is authored against this manual and must pass §9 before it is added,
  even as `active_v1: false`.
- Promoting a constraint to `active_v1: true` (sellable) requires a deliberate decision; the
  Decline Gate sells a Sprint only for active, admitted constraints.
- Retire a constraint if real Sprint data shows it fails Test 6 (no transfer) or Test 7 (no
  effect on replaceability) in practice.
- This manual is subordinate to `ATLAS_OS.md` and supersedes ad-hoc judgment. Amend it
  deliberately — never drift from it.

---

*End of canonical doctrine. A constraint that does not pass all seven tests does not enter Atlas.*
