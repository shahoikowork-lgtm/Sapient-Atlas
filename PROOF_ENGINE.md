# PROOF_ENGINE — the Week-4 Proof Engine specification

**What this is.** The engineering blueprint for the Week-4 layer that turns an improved capability into
**external, attributable, before/after-anchored proof.** It expands `ATLAS_OS_V1.md` Ch 10 (marked
`[GAP]`) and conforms to `ATLAS_OS.md` §7 + `CONSTRAINT_DESIGN_MANUAL.md` §7. **No code here** — every
screen, AI decision, state, data object, and failure path.

**The one rule it serves:** *Atlas never claims someone improved. Reality proves it.* Atlas does not
invent proof — it **engineers the moment where proof can happen**, captures what reality returns, and
verifies it honestly.

**Core architecture (one paragraph).** After the capability is built (Weeks 1–3) and verified on fresh
work (the hardened grader), Week 4 (a) makes the user **ship** the cleared claim on a real asset, (b)
runs **the Reality Challenge** — a scripted, low-fear, real-world ask to a named receiver, (c)
**captures** the receiver's reaction / the metric / the live artifact, (d) **classifies + verifies** it
(AI does the structural check instantly; a human confirms authenticity once, at the finale), and (e)
**records** a `proof_event` to the user's Capability Record and the Outcome Graph. The whole 30-day
value is realized in this one moment, so the engine optimizes for one number above all: **the
probability the moment actually happens** (the Day-24 send).

---

## PART 1 — What "proof" actually means (the ladder of evidence)

| Level | Definition | Who validates | Is it proof? |
|---|---|---|---|
| **Internal progress** | the user did the reps (completion) | Atlas (submissions cleared) | **No** — completion ≠ capability |
| **Capability improvement** | clears the bar unaided on *fresh* work (transfer) | Atlas (re-diagnosis) | **No** — it's Atlas's grade, self-referential |
| **External proof** | a real receiver with no stake in Atlas reacts to the user's deployed work | **Reality** (a prospect/boss/peer/metric) | **YES — this is the promise** |
| **Career outcome** | a pricing-power event attributable to the capability (reply, meeting, raise) | Reality + attribution | Yes, stronger but slower/noisier |
| **Long-term impact** | sustained re-pricing (renewal, role change) over months | Reality, longitudinal | Yes, beyond the 30-day window |

Levels 1–2 are **Atlas-internal** (gameable, self-referential). Levels 3–5 are **the market's verdict**.
Week 4 engineers **Level 3**; Levels 4–5 are bonus signals captured longitudinally (`career_events`).
The product promise lives at Level 3 and nowhere else.

---

## PART 2 — The Week-4 experience, day by day

Week 4 = the PROVE phase (the last ladder rungs). Each day: the screen, Atlas's exact words, what the
user submits, how AI evaluates.

**Day 22 — Choose the arena.** *(state `arena_set`)*
- Screen: "Three weeks of reps were for this. This week, one real thing changes in the wild. Pick the
  live asset your new positioning ships on, and the real person who'll see it."
- User submits: asset type (homepage / pitch / cold email / deck / post) + **a named real receiver**
  (a prospect, a boss, a client — role + context, not "someone").
- AI evaluates: confirms it's real-stakes (rejects "an exercise" / "a hypothetical"); if the user has no
  real asset/receiver → routes to *Part 6 (no-arena path)*.

**Day 23 — Ship-ready claim.** *(state `claim_ready`)*
- Screen: "Write the final positioning for that asset. No scaffolding now — this is the one that goes
  live." Shows the tightest PROVE-phase bar.
- User submits: the final claim, unaided.
- AI evaluates: the **hardened multi-pass grader** at the highest bar. It must **clear (unanimous hit)**
  before it ships — you do not deploy un-cleared work. Not clear → tighten loop until it clears.

**Day 24 — The Reality Challenge (deploy + ask).** *(state `deployed`, set `deployed_at`)*
- Screen (distinct, weighty — Part 5): the **scripted, low-fear ask**, copyable, tailored to the chosen
  proof type. Example (playback): *"Send your prospect this and ask one line back: 'Quick gut check —
  in one sentence, what do we do that the others don't?'"* Example (metric): *"Ship the page. We watch
  the one number."*
- User submits: one tap — **"Sent it / Shipped it"** + (optional) the live URL.
- AI evaluates: nothing yet — it records the deployment and opens the capture window.

**Days 25–28 — The wait + capture.** *(state `awaiting` → `captured`)*
- Atlas does **not** nag daily. One nudge at Day 27 if nothing captured: *"Heard back yet? Drop it in
  when you do."*
- Screen (return-to-capture): "What came back? Paste the reply, the number, or the link." One-tap.
- User submits: the receiver's reaction (pasted), or before/after metric, or the live artifact link.

**Day 29 — Classify + verify.** *(state `verified` or `proof_review`)*
- AI Proof Reviewer (Part 4) classifies type + strength + runs the structural checklist. Mechanically
  clear (public URL, metric source) → instant verdict; a third-party reaction → **LOW confidence →
  human authenticity confirm** (Part 4).

**Day 30 — Re-rating + recognition.** *(state `complete`)*
- The existing re-diagnosis runs on the fresh deployed work; the verified `proof_event` is attached.
- Screen: the **honest verdict** (moved / partially moved / did not move + reason) + the **before/after**
  of their own work + the **one sentence to say to the person who prices their work** (`deploy-proof.tsx`).
  If proof landed: *"A real buyer reacted. Here's your before/after and the line to take to your review."*

---

## PART 3 — Proof types (the menu Atlas accepts)

| Proof type | Why it matters | How AI validates | Fakeable? | Value | Confidence |
|---|---|---|---|---|---|
| **Prospect playback** (a prospect repeats "why you" unprompted) | the M1 gold proof | checks the reply restates the differentiator + names receiver/context | medium | high | high (it's the bar's literal proof) |
| **Boss / peer / recruiter reaction** | a pricer reacted to the deployed work | quoted reply + who said it + about what | medium | high | medium→high |
| **Conversion / metric movement** | a business outcome moved | live URL + before/after + metric source | medium (numbers self-reported) | high | medium (attribution noise) |
| **Live asset deployed** | the work is public + attributable | the URL is live + matches the cleared claim | **low** (public) | medium | medium |
| **Meeting / interview secured** | the positioning earned access | the artifact + the outcome | medium | high | medium (slow) |
| **Before/after portfolio** | capability + recognition-grade | the after clears the bar vs the Day-1 baseline | low (their own graded work) | medium | medium |
| **Client / stakeholder sign-off** | adopted by someone who decides | quoted approval + role | medium | high | medium |
| **Raise / promotion / offer** | a pricing event | the event + attribution | low but attribution-noisy + rare in 30d | **highest** | medium (longitudinal) |

**Design rule:** offer ≥3 viable types so *every* user has at least one real path (the #1 way to prevent
the Day-24 quit — Part 10). The user picks the most reachable at Day 22.

---

## PART 4 — The AI Proof Reviewer (the decision system)

Bounded, like the grader — it does not invent, it **checks a map-bound checklist** per proof type:
1. **External?** From a real receiver outside Atlas (named, role/context) — not self-authored, not
   Atlas's grade.
2. **Attributable?** About *this user's* deployed work; matches the cleared claim.
3. **Reactive?** The receiver engaged the **differentiator** (for a playback: restates the why-you) —
   not generic praise ("looks great").
4. **Before/after?** The deployed work clears the bar and beats the Day-1 baseline.

**Verdicts:** `strong` (all four + clearly engages the differentiator) · `adequate` (external +
attributable + reactive but partial) · `none` (self-authored / generic praise / unattributable / no
before-after) · `needs_human` (ambiguous).

**Confidence + human role (the honest crux).** A real-world *reaction* cannot be authenticity-verified by
an LLM reading pasted text. So: **mechanically-verifiable types** (live public URL, a metric with a
source) → AI verifies instantly. **Third-party-reaction types** (playback, boss reply, sign-off) → the
AI does the **structural** check (the 4 conditions) and assigns a verdict, then routes to a **human
authenticity confirm**. This human step is **irreducible and a feature** — it's what makes the proof
real and unfakeable — and it is **once per user, at the finale** (not per-rep), so it does not break
automation or scale. Asymmetry: the AI never **auto-rejects** a borderline real proof (false-negatives
frustrate); it marks `needs_human` and a person confirms. The AI **never** auto-passes a `strong`
third-party reaction without the human confirm.

---

## PART 5 — The Reality Challenge (the graduation)

Day 24 is reframed as a distinct, weighty moment — **not** a mission card.
- Copy: *"Three weeks of reps were for this. One real move, to one real person who can react. The only
  way to know if you're harder to replace is to let the market tell you."*
- It must be **real life**: Atlas enforces a real named receiver + a live asset (rejects hypotheticals).
- The nerves are the point — productive stakes. The screen is deliberately spare and serious (the dark
  instrument register), with the scripted ask front and center and a single, heavy action: **Send it.**

---

## PART 6 — If proof fails (no punishment, no restart)

"Fail" = silence, a weak/negative reaction, or it doesn't count. Atlas **diagnoses → generates 1–2 new
micro-missions → retries**, within an extended window. It **never** restarts the 30 days.

- **Silence (no reaction):** *"No reaction yet isn't a no — it's data."* → 1–2 missions (sharpen the
  line / pick a better-fit receiver) → re-send. Up to ~3 sends in the window.
- **Weak/negative reaction:** the most valuable failure — the work cleared *Atlas's* bar but not
  *reality's*. → honest read ("they didn't see why-you; here's the gap") → 1–2 targeted missions →
  retry. **Feeds the flywheel:** a bar that clears but doesn't predict proof is flagged to the Knowledge
  Evolution Engine (`P(proof|clearance)` drops → the bar gets rewritten).
- **No arena (no real asset/receiver):** the Decline-Gate-adjacent case → Atlas helps find a reachable
  receiver, or honestly defers proof (the capability is built; the proof awaits a real opportunity).
- **Doesn't count (wrong/unverifiable type):** *"That's a start, not yet reality's verdict."* → re-ask
  with a stronger, more verifiable type.

If proof never lands by the hard stop (Part 7), the re-rating ships the **honest** verdict ("capability
built, market proof not yet captured, here's why") — never a fake "you improved."

---

## PART 7 — The Proof Timeline

- **Requested:** Day 24, only after the claim clears + ships (never before the work is ready).
- **Attempts:** the deploy/ask may be retried up to ~3 times in the window, each with a sharpened claim
  (Part 6).
- **Wait window:** Days 25–29 (~5 days), **extendable +7** when waiting on a genuine real-world reply
  (replies take days). **Hard stop ≈ Day 37** (a week's grace past Day 30).
- **Reminders:** intrinsic + minimal — one Day-27 nudge, one Day-30 "ready to see if it moved?" **No
  streaks, no daily nagging.**
- **Scheduling:** Atlas *suggests* the best send moment ("Tuesday morning") — light, optional; the user
  owns real-world timing (Atlas cannot).

---

## PART 8 — The data model

- **`proof_events`** (the Outcome Graph fact table, `INTELLIGENCE_LAYER §4`):
  `{id, user_id, cycle_id, capability_id, proof_type, receiver_type, receiver_named:bool, artifact_ref,
  before_ref (Day-1 baseline), after_ref (deployed claim), verdict (strong|adequate|none),
  verified_by (ai|human), confidence, deployed_at, captured_at, occurred_at, consented_to_share:bool}`.
  *Implementation note:* to avoid a migration it MAY start inside `cycles.profile_snapshot.atlas.proof`
  (jsonb) and normalize into a table later — same pattern as `signals`/`atlas`.
- **Capability Record (permanent):** the verified `proof_event` linked to the cleared capability +
  `version` → *"proved M1 with a prospect playback on <date>."* This record **is** the harder-to-replace
  evidence.
- **Outcome Graph feed:** `bar_validity(capability, bar_version) → P(proof | clearance)`; `proof_type
  efficacy` (which types users actually land).
- **`career_events` (longitudinal):** raises/offers attributed later (Part 1 Levels 4–5).
- **Never stored:** the third party's PII beyond role+context (the receiver is "a prospect at <company>",
  not their contact); raw private replies past consent; **anything the user did not consent to share**
  (the reaction text is also the marketing asset — gated behind explicit `consented_to_share`).

---

## PART 9 — Motivation (intrinsic only)

The user wants proof because it answers the question that made them buy: *"Am I actually harder to
replace, or did I just do exercises?"* Design the pull as:
- **Curiosity** — did it work? (the real answer, not Atlas's metric).
- **Agency / utility** — they leave holding real career capital: the before/after + the boss-sentence,
  usable immediately at a review/pitch.
- **Identity** — becoming undeniable.
- **The nerves** (Part 5) — real stakes make it matter.
- **Trust** — the honest verdict (even "didn't move") is valued precisely because it isn't flattery.
**No** XP, points, coins, badges, or fake rewards — they would cheapen the one real thing.

---

## PART 10 — Destroy the design, then redesign

- **Faking proof** (user self-writes a "reaction"). *Reality:* perfect fake-detection is impossible
  (doctrine admits this). *Redesign:* don't over-invest in detection (unwinnable) — invest in making the
  **real path easy** (low-fear asks, ≥3 proof types) so users don't need to fake; lean on the structural
  defenses (named receiver, raw messy reactions, the human confirm) and the fact that **gaming
  self-defeats** — a fake proof yields no real raise; the user only fools themselves.
- **AI misjudging proof** (rejects a real one). *Redesign:* never auto-reject — borderline → `needs_human`;
  the human catches AI false-negatives; bias toward `adequate`.
- **Where users quit:** **Day 24** (the scary send) is the #1 drop point, and **the single number that
  decides whether the engine works.** *Redesign:* the lowest-fear viable ask (one gut-check line to one
  person), multiple types, the graduation framing, and "silence is data, not failure." Secondary drop:
  the wait — mitigated by the one nudge + one-tap capture.
- **Trust lost** (overclaiming weak proof). *Redesign:* `strong` vs `adequate` verdicts; never inflate;
  "did not move" shipped plainly. This is the entire brand.
- **Founder bottleneck** (human proof-verification). *Redesign:* it's **once per user, at the finale**
  (not per-rep); AI pre-classifies so the human check is seconds ("real reaction? yes/no"); mechanically-
  verifiable types auto-pass; only third-party reactions need the human. Surface it as a dedicated
  **`/admin/proof` queue** (like the edge-case queue): the captured reaction + the AI structural verdict
  + one-click confirm/reject. Human load ≈ 1 fast review per completing user — the highest-leverage human
  touch in the product, not a bottleneck.

**The deepest unknown (and the build's #1 success metric):** until a real cohort runs this, we do not
know the **Day-24 send rate**. That number — *did the user actually do the real-world ask* — determines
whether the Proof Engine works at all. **Instrument it from user #1** and treat it as the engine's North
Star, above accuracy or latency.

---

## State machine (the proof lifecycle)

`none → arena_set → claim_ready → deployed → awaiting → (captured) → proof_review → verified → complete`
with failure edges: `awaiting → (silence/timeout) → re_ask`; `captured → none(verdict) → re_ask`;
`re_ask → deployed` (loops, ≤3); hard-stop `awaiting/re_ask → complete(no_proof, honest verdict)`.

## Screens (summary)
Arena selector · Ship-ready claim (grader) · **Reality Challenge** (scripted ask, "Send it") · Capture
(paste reaction/metric/link) · Verifying / "your coach is confirming" · Re-rating + recognition
(verdict + before/after + boss-sentence) · Re-ask (on failure). Admin: `/admin/proof` confirm queue.

---

*End PROOF_ENGINE. Subordinate to `ATLAS_OS.md`, `ATLAS_OS_V1.md` (expands Ch 10), `CAPABILITY_SPEC.md`,
`INTELLIGENCE_LAYER.md`, and `CONSTRAINT_DESIGN_MANUAL.md §7`. Build gated on the Day-24 send rate.*
