# Sapient Atlas — Product Design Review & Redesign Proposal

*Design-director audit, pre-redesign. No code. Grounded in the current implementation
(`app/`, `components/atlas/`, `globals.css`) and the locked doctrine (`ATLAS_OS.md`,
`CONSTRAINT_DESIGN_MANUAL.md`). References: Linear, Stripe, Mercury, Arc, Notion, OpenAI.*

---

## 0. The one-paragraph verdict

The product has unusually good *bones*: a warm-paper palette that already differentiates it
from the sea of cold-white SaaS, a genuinely original core idea (quote the user's own work back
to them as evidence), and a doctrine that forbids the exact things that cheapen this category
(scores, mechanism-talk, gamification, fake wins). But the current execution **describes** the
product instead of **demonstrating** it. The homepage reads as a manifesto — a tall single
column of ten text sections — when it should read as an instrument. The typography leans
editorial (serif headlines) in a way that fights the "modern software company" references. And
the highest-stakes moments — the analysis wait, the results reveal, and the waitlist (which is
the majority path) — are under-designed relative to their importance. **The redesign is not a
reskin. It is a shift from telling to showing, and a tightening of three loose systems
(type, space, color) into one disciplined language.**

**The thesis that should drive everything:** *Atlas clarifies. The interface should perform that
act of clarification, not narrate it.* Every screen should feel like something being brought into
focus.

---

## 1. Cross-cutting systems

### 1.1 Typography — the biggest single lever

**What is wrong.** Three type families are in play: Geist Sans (body), Geist Mono (eyebrows),
and Newsreader **serif for all headlines**. The serif gives an editorial, essay-magazine voice.

**Why it is wrong.** None of the stated references (Linear, Stripe, Mercury, Arc, Notion,
OpenAI's product surfaces) use a serif for display in-product. Serif headlines read as
"thoughtful blog / course / publication" — which is precisely the *course/coaching* perception
the doctrine works hardest to escape. The serif is doing brand work, but it's pointing at the
wrong brand.

**What should replace it.** Do not just swap the serif out. Give each typeface a *meaning* so the
system is semantic, not decorative:

- **Sans (the Atlas voice).** One high-quality grotesque carries product UI and headlines —
  Inter (already validated for this product type), or a tighter display grotesque for large
  sizes. This is the voice of the system: precise, calm, neutral.
- **Serif (the human voice) — reserved, not retired.** Keep Newsreader for *one* job: the user's
  own work quoted back to them (the `Evidence` component). That single move turns the serif into
  a signal — *"this is you, in your own words"* — and makes the evidence the most distinctive
  visual object in the product. Serif = the human; sans = the instrument.
- **Mono (the label voice).** Keep the mono eyebrow (`Eyebrow.tsx`) — uppercase, tracked, 11px.
  It already does Linear/Vercel-grade label work. Use it for metadata only, never prose.

**Exact implementation recommendations.**
- Establish one modular scale (≈1.25 ratio) and stop hand-picking px per heading:
  `12 · 14 · 16 · 18 · 21 · 26 · 33 · 42 · 53`. Map to tokens: `text-label` 13, `text-body` 16,
  `text-body-lg` 18, `text-h3` 21, `text-h2` 26, `text-h1` 33, `text-display` 42–53.
- The current jump from 52px hero straight to 24px h2 skips two levels — fill the mid-tiers so
  scannable hierarchy exists on dense pages (results, diagnosis).
- Body line-height 1.5–1.65; measure capped at **62–68ch** (currently `max-w-2xl` ≈ 75ch on the
  reading column — slightly wide for 16px).
- Tabular numerals anywhere numbers align (word counts, dates) — the `.tabular` token already
  exists; apply it.
- Weights: 400 body, 500 labels/UI, 600 headings. Avoid 700 — it reads consumer, not software.

### 1.2 Color & tokens

**What is wrong.** The palette is good but the *system* is loose: pages are full of ad-hoc
opacity (`text-ink/80`, `/75`, `/70`, `text-white/85`) instead of named steps, and the indigo
accent (`#2b3a67`) is slightly muddy.

**Why it is wrong.** Ad-hoc opacities make consistency impossible and dark-mode/accessibility
work later painful. "Premium" reads as *disciplined*, not as more color.

**What should replace it.** Keep the warm paper — it is the single strongest brand asset; it is
what Mercury/Notion warmth feels like and what no cold-white competitor has. Formalize a small,
semantic token set on top of it:

- **Surfaces:** `paper` (#f8f7f2 base) · `surface` (#ffffff cards) · `sunken` (a hair darker than
  paper for wells/insets) · `focal` (the near-black move card — keep, it's the emotional peak).
- **Text:** `text-primary` (#1a1a17) · `text-secondary` (~#4a473f) · `text-tertiary` (#6a675e
  current muted). Three steps, tokenized — replace every `/80 /75 /70`.
- **Lines:** `hairline` (subtle) · `hairline-strong` (focus/hover). One step up only.
- **Accent:** keep indigo as the single brand accent but consider deepening to a more confident
  ink-indigo for AA on paper; `accent` + `accent-hover` only.
- **Functional:** exactly one success and one danger, each always paired with an icon/word (the
  doctrine forbids meaning-by-color and forbids grading — so the "grow" green must read as
  *trajectory language*, never as a green/red grade).

**Exact recommendations.** Define the tokens in `@theme` and *forbid raw opacity utilities on
text in review*. Verify every text/background pair at AA (4.5:1); the warm paper slightly lowers
contrast vs. pure white, so re-check muted text especially.

### 1.3 Spacing & layout

**What is wrong.** Every section uses the same `py-16/20` rhythm inside the same `max-w-2xl`
column. Uniform rhythm = monotony; one narrow column = "document," not "product."

**Why it is wrong.** Spatial hierarchy is how premium products signal what matters. When every
section has identical air and width, nothing is emphasized and the page feels like an essay
(again, the course perception).

**What should replace it.** A 4/8 base scale with **section-size tiers** (e.g. hero/closing get
the most air, dense reference sections the least), and **varied measures**: keep a narrow column
for prose, but allow a wider container (≈max-w-5xl) for the product demonstration and the
results layout so they read as *interface*, not *paragraph*.

**Exact recommendations.** Spacing tokens `4 8 12 16 24 32 48 64 96`. Section tiers: `space-section`
(default), `space-section-lg` (hero/closing). Reading column 62–68ch; demonstration/results up to
1040px with internal grid.

### 1.4 Motion

**What is wrong.** The current motion (scroll-reveal fades on every section) is, by the brief's own
new standard, **decorative** — fades don't help understanding.

**Why it is wrong.** "Motion only when it improves understanding." A section fading in as you
scroll communicates nothing about the content; it's polish for its own sake and adds latency to
perception.

**What should replace it.** Spend the motion budget where it carries meaning:
- **The analysis state** — a designed, honest "reading your work" sequence (see Diagnosis). This
  is motion that explains *cause → effect*.
- **State transitions** — field focus, error in/out, disclosure open/close, the results reveal as
  a *focusing* gesture (evidence resolves, then the one move settles in). Continuity, not confetti.
- **Press feedback** — the subtle button lift is fine; keep it.
- Retire blanket section reveals (or reduce to at most the first view). Respect
  `prefers-reduced-motion` (already wired globally — good).

**Exact recommendations.** 150–240ms micro, ≤320ms transitions; ease-out enter / faster exit;
transform+opacity only. One meaningful animation per view, max.

### 1.5 Component system

**What is wrong.** The primitive set is small (`Button, Card, Section, Eyebrow, Evidence,
TrustStrip, Reveal`) and pages compensate with long inline class strings and bespoke markup
(the diagnosis form, the move card, the chips).

**Why it is wrong.** Bespoke markup per page is where consistency and quality silently erode. A
Stripe/Linear feel comes from a *system* applied everywhere.

**What should replace it.** Promote the recurring objects into named components:
`Field` (label+input+error+hint, the a11y contract in one place), `Pill`/`Badge` (confidence,
trajectory, status), `ConstraintCard`, `MoveCard` (the focal dark surface), `AnalysisState`
(the loading experience), `ArtifactPreview` (the demonstration object), `Nav`/`Footer`. Make
`Evidence` the crown component — it is the brand.

---

## 2. Homepage

**What is wrong.**
1. It is a ~10-section vertical text stack in one narrow column. It never *shows* the product.
2. The hero is the centered headline + subhead + two CTAs + reassurance line — the canonical
   startup-landing template the brief says to avoid.
3. Multiple sections say the same thing in different words ("No lessons. No videos.", "We tell
   you when we can't help.", "Everyone else starts with the diagnosis.", "After your diagnosis
   you'll know"). Redundancy dilutes.
4. The professions list is a plain bulleted two-column text list.
5. The $149 offer is buried mid-page in a card; there is no persistent path to action.
6. Zero demonstration, zero example output, zero proof, no identity/credibility anchor.

**Why it is wrong.** This is a product that *analyzes work and reveals one truth* — and the
homepage never performs that act. Linear shows the app; Stripe shows the dashboard/code; Mercury
shows the account. A page that only describes an analytical product reads as a course about the
topic. The narrow single column reinforces "essay." Redundant honest-sounding sections, stacked,
start to feel like protesting too much.

**What should replace it.**
- **A demonstration hero.** Left: the promise in one tight sans headline + one sentence + one
  primary CTA. Right (or directly below on mobile): a real, anonymized *artifact → diagnosis*
  object — a short piece of real work with the single constraint surfaced and one line of
  evidence pulled from it (in the serif). The hero should let a visitor *see the product think*
  before reading a word about it. This is the entire pitch in one view.
- **Collapse ten sections into four:** (1) demonstration hero, (2) how it works as a 3-beat
  visual using the real Constraint→Bar→Rep→Proof spine (not generic step circles), (3) the honest
  boundary as *one* confident statement ("We tell you when we can't help" — the strongest trust
  device in the category; say it once, powerfully, not three times), (4) who it's for + the
  offer, with the marketer/$149 path and the everyone-else/early-access path clearly forked.
- **Professions as an interactive selector,** not a list: choosing your field reframes the
  example artifact and the one-line outcome to that field. This makes "we analyze *your* work"
  literal, and turns a static list into the page's most engaging moment.
- **A persistent, quiet CTA** in the header (already sticky — good) so the action is always one
  move away without a hard sales bar.

**Exact implementation recommendations.**
- Hero grid: `max-w-5xl`, asymmetric 7/5 or stacked on mobile; headline `text-display`, body
  `text-body-lg`, one primary CTA, drop the secondary "see how it works" link (anchor scroll is
  implied).
- The demonstration object is a real `ArtifactPreview` + `Evidence` quote + a single
  `ConstraintCard` ("The one thing holding this back: …"). No numbers. No mechanism.
- Replace the four overlapping trust / "not a course" sections with one boundary statement and one
  "no lessons, real work only" line, integrated into "how it works."
- Motion: the only homepage motion is the demonstration resolving once on load (evidence
  highlights, constraint settles) — meaningful, not decorative.

---

## 3. Diagnosis flow

**What is wrong.**
1. It asks for **name + email + role before any value is delivered**, then a large work textarea,
   then eight collapsed optional fields.
2. The whole thing is one long form on one screen.
3. The ~20-second analysis is a disabled button with a spinner and "Reading your work… (~20s)".
4. The optional-context block (8 fields) is intimidating even collapsed and competes with the one
   action that matters.

**Why it is wrong.** PII-before-value is the single biggest conversion leak in a free-diagnosis
funnel; the most engaging, lowest-friction action (paste your work) should come first and pull
the user in. The 20-second wait is one of the most important trust moments in the entire product
— it is where the user decides whether this is serious — and it is currently the least designed
moment. Eight optional fields next to the one required action split focus.

**What should replace it.**
- **Lead with the work.** The page *is* the paste surface: a large, inviting, beautifully-typeset
  field that says "paste a real piece of your work." No identity fields visible yet. The artifact
  is the hero of its own page.
- **Value-gate identity.** Only after there's work to analyze do you ask for the minimum (email,
  and role to route the constraint library) to "send your diagnosis." Two calm steps, with a
  clear step indicator, not one wall.
- **Move optional context to *after* submission** (or a single optional "tell us more" the user
  can skip), so it never competes with the one action.
- **Design the analysis state as a first-class screen.** Not a spinner. A calm sequence that shows
  Atlas *reading* — the work settling, the field of capabilities narrowing to one — honest about
  the ~20s, building anticipation and trust. This is the moment to *show clarification happening*.
  (Stay inside doctrine: it shows the *experience* of being read, never the mechanism/AI/pipeline.)

**Exact implementation recommendations.**
- Keep the exact API contract: same `POST /api/diagnosis`, same fields, same redirect to
  `/results/[token]`. This is a UX/sequence redesign over the same payload — collect the same
  data, ask for it in a better order, submit identically.
- Step 1: `work_sample` only, full-width, serif-or-mono input voice, generous min-height, quiet
  word-count + privacy line. Primary CTA "Get my diagnosis" disabled until non-empty.
- Step 2 (same page, revealed): `email` (typed, autocomplete), `role` (select or typeahead mapped
  to the persona/constraint library), optional context behind one "add context" affordance.
- Full a11y contract lives in a `Field` component: `label htmlFor/id`, `aria-required`,
  `aria-invalid`, `aria-describedby`, error `role="alert"`, focus first invalid, `aria-busy` on
  submit. (Most of this already exists — promote it into the component.)
- `AnalysisState`: skeleton / sequenced reveal, `aria-live="polite"` status, honest copy, no fake
  progress bar tied to a real unknown duration.

---

## 4. Results page

**What is wrong.**
1. The structure is right (evidence → read → what's missing → the one move → prediction →
   details → CTA) but it reads as a long uniform scroll; the *hierarchy between* these is thin.
2. "Confidence: high" rendered as a bordered chip feels clinical / analytical — adjacent to the
   doctrine's "feel understood, not analyzed."
3. The conversion moment (Sprint $149 / waitlist) sits at the very bottom — the most important
   decision is the least designed and most buried.
4. The "your read is being prepared" state (human-review gate may delay output) is a thin
   centered paragraph — a key, expected state treated as an afterthought.

**Why it is wrong.** This is the emotional core of the product — the moment the user sees
themselves clearly. It should feel like a verdict delivered by something serious. A flat scroll
with a clinical chip and a buried CTA undersells the single best thing Atlas does. The "being
prepared" state is common (human gate) and shapes trust; leaving it unstyled signals
unfinished.

**What should replace it.**
- **Treat it as a document with one climax.** Evidence (serif, the user's own words) leads and
  dominates — it is the proof and the brand. The read is the considered judgment. *The one move*
  is the climax: the dark focal card is right; give it more architectural weight (space before it,
  a clear "this is the single thing" framing) so arriving at it feels like resolution.
- **Replace clinical chips with quiet language.** "We're confident in this read" / "Your work is
  trending stronger" as plain, human lines or understated pills — never a chip that reads like a
  metric. (Doctrine: no numbers, feel understood.)
- **Promote the decision.** After the move, a calm, confident commitment surface: for the eligible
  marketer, the $149 Sprint framed as *what happens next*, with the honest guarantee (we decline
  what we can't move) as the trust anchor — not a hard sell, a serious invitation. Make it the
  designed peak of the page, not a footer card.
- **Design the "being prepared" state** as an intentional, reassuring screen with a clear sense of
  *when* and *why* (a real person is reviewing — which, framed right, is a *premium* signal:
  this isn't auto-generated).

**Exact implementation recommendations.**
- Keep all data/logic and the no-numbers rule untouched (the `capability_scores` numbers stay
  server-side; UI keeps qualitative language — as it does today).
- Hierarchy: increase the step between sections (`space-section` tiers), let `Evidence` run at
  `text-body-lg` in serif, and add a short framing line above the move card ("The single thing to
  work on").
- Convert the confidence/trajectory chips to a quiet `Pill` with word-only content, or fold into
  the prose of "the read."
- Conversion: a dedicated `NextStep` surface (eligible → Sprint invitation + honest boundary;
  waitlist → see §5). One primary action.
- Motion: results "focuses in" once — evidence resolves, then the move card settles. Meaningful.

---

## 5. Waitlist experience

**What is wrong.** For everyone who is *not* Marketing/M1 — i.e. the **majority** of users today —
the experience ends in a tinted card: "Your constraint: X. We'll let you know. Keep this link."
Passive, anticlimactic, no next step, no sense of status.

**Why it is wrong.** This is the largest segment and it receives the weakest, most dead-end
moment in the product. These users just received real, specific value (their diagnosis) and are
at peak trust and motivation — and the experience deflates instead of capitalizing. It also wastes
the best growth surface in the funnel.

**What should replace it.**
- **Reframe waitlist as earned early access, not a dead end.** They have their diagnosis and their
  named constraint; the Sprint for *their* field simply isn't open yet. Make that feel like
  membership-in-waiting: confirm their place, set honest expectations ("Sprints open one field at a
  time; yours is on the path"), and give them something to hold — their diagnosis saved, their
  constraint named, a clear "you're first in line when it opens."
- **Capture intent with dignity.** A single, confident "tell us you want it" that records demand
  (which also tells the company which constraint library to build next — real signal, honestly
  used). Optionally let them keep/return to their result.
- **Make it a brand moment.** Calm, premium, specific to *their* constraint — not a generic
  "thanks for your interest" gray box.

**Exact implementation recommendations.**
- A `WaitlistState` surface that leads with *their* named constraint and one line of why it
  matters (in their field's language), confirms their place, sets the honest "one field at a time"
  expectation, and offers one quiet action (notify me / I want this) — no checkout, per doctrine.
- Persist access to their diagnosis via the existing token link; make returning feel intentional.
- This is *immediate* priority despite "after users," because it is live for the majority right now
  (see roadmap).

---

## 6. Mobile experience

**What is wrong.** Not broken, but not designed mobile-first: hero type sizes, the move card's
padding, the optional-context grid, and touch targets are desktop-tuned and merely reflow.

**Why it is wrong.** The references are impeccable on mobile; "premium" collapses fast on a phone
if targets are tight or type doesn't rescale. Most diagnosis traffic will be mobile.

**What should replace it / exact recommendations.**
- Mobile-first type scale (display caps lower on small screens), `min-h-dvh` over `100vh`.
- Touch targets ≥44px; the diagnosis CTA becomes a **sticky bottom action** on mobile so the
  primary move is always reachable while pasting/reading.
- Single-column everything below `sm`; the demonstration hero stacks artifact under headline.
- Test at 375px and large-text/reduced-motion explicitly.

---

## 7. Brand identity

**What is wrong.** Identity is thin: the wordmark is plain serif text; there is no mark, no defined
visual signature beyond paper+indigo, no consistent voice spec.

**Why it is wrong.** Linear/Stripe/Mercury are *systems with a point of view*. Atlas has the raw
materials (a great tagline — "The Art of Becoming Harder to Replace" — the warm paper, the
evidence device) but hasn't crystallized them into an identity.

**What should replace it / recommendations.**
- **Make the signature the act, not a logo gimmick:** the *evidence quote in serif* is the brand's
  visual fingerprint. Build identity around "your own words, brought into focus."
- A restrained wordmark + a simple mark (a single deliberate form — a point being located, a line
  resolving); avoid the literal globe/atlas cliché.
- Codify voice: plain, exact, honest, never hyped; short sentences; no em-dash tricks; no
  mechanism-talk; no numbers to the user. (This is already the doctrine — write it down as a brand
  voice spec so every surface inherits it.)
- Lean *into* warm paper as the ownable color story; it is the anti-cold-SaaS position.

---

## 8. Conversion flow (end-to-end)

**What is wrong.** Funnel: Landing → form (PII first) → results → buried CTA / dead-end waitlist.
Value arrives after friction; the ask appears once, late; the majority path converts to nothing.

**Why it is wrong.** Premium conversion is built on *trust earned before the ask*. Here the order
is inverted (ask for PII, then deliver value) and the trust devices (the honest boundary, the
evidence, the human review) are under-used at the decision moment.

**What should replace it / recommendations.**
- Reorder: **show → let them act (paste) → deliver value → then ask.** Value before PII.
- Use the strongest trust device — *we decline what we can't move* — at the point of decision, not
  only as a mid-page section.
- Give the majority (waitlist) a real next step (capture intent + saved result + honest timeline).
- One primary action per screen, always; secondary actions visually subordinate.

---

## 9. Redesign strategy (the through-line)

1. **From manifesto to instrument.** Show the product thinking; cut descriptive text by half.
2. **Two voices with meaning.** Sans = Atlas (system). Serif = the user's own work (evidence).
   Mono = labels. This single rule fixes typography *and* sharpens brand.
3. **One disciplined system.** Tokenize type scale, color steps, spacing tiers; ban ad-hoc
   opacities and per-page bespoke markup; promote recurring objects to components.
4. **Design the three hidden peaks.** The analysis wait, the results verdict, and the waitlist —
   currently the weakest, actually the most important.
5. **Motion that means.** Clarification-as-motion (focusing, resolving, state transitions); retire
   decorative reveals.
6. **Keep the doctrine sacred.** No numbers, no mechanism, honest boundary, one thing at a time —
   these are not constraints on the design, they *are* the design's differentiation.

## 10. Prioritized implementation roadmap

**Phase A — Foundations (no visible redesign yet, unblocks everything).**
- Tokenize typography scale, color steps, spacing tiers in `@theme`; introduce the sans/serif/mono
  semantic split; build `Field`, `Pill`, `MoveCard`, `AnalysisState`, `WaitlistState`, `Nav`,
  `Footer` as components. Replace ad-hoc opacities.

**Phase B — The three peaks (highest experience ROI).**
- Redesign the analysis/loading state, the results hierarchy + conversion surface, and the
  waitlist experience.

**Phase C — Homepage from manifesto to demonstration.**
- Demonstration hero + interactive profession selector; collapse 10 sections to 4.

**Phase D — Diagnosis re-sequence.**
- Work-first, value-gated identity, two calm steps (same API contract).

**Phase E — Mobile + brand polish.**
- Mobile-first pass, sticky mobile CTA, wordmark/mark, voice spec.

## 11. Top 10 highest-impact changes

1. **Re-assign the serif to evidence only; move headlines to a precise sans.** (Biggest single
   shift in perceived category — from "course" to "software.")
2. **Demonstration hero that shows artifact → constraint → evidence.** Show, don't describe.
3. **Design the analysis wait as a first-class "being read" state.** Turns dead time into trust.
4. **Redesign the waitlist into earned early access with a real next step.** Fixes the majority
   path.
5. **Promote the results conversion moment** out of the footer into a designed decision surface,
   anchored by the honest-boundary guarantee.
6. **Re-sequence diagnosis to work-first, value-gated PII** (same API).
7. **Tokenize the systems** (type scale, 3-step text color, spacing tiers) and kill ad-hoc
   opacities + per-page bespoke markup.
8. **Collapse the 10 homepage sections to 4;** say the honest boundary once, powerfully.
9. **Retire decorative scroll reveals; spend motion on clarification + state transitions.**
10. **Mobile-first pass with a sticky primary CTA** and rescaled type.

## 12. What to do now vs. after real users arrive

**Do immediately (truth-independent; pure craft + live-majority fixes):**
- Typography re-assignment (serif→evidence, sans headlines) and the token systems (1, 7).
- Waitlist redesign (4) — it is live for most users *today*.
- Analysis-state design (3) and results hierarchy/conversion polish (5).
- Diagnosis re-sequencing (6) and homepage consolidation/demonstration (2, 8) — using anonymized
  but *real* example artifacts (never fabricated metrics or fake proof — doctrine).
- Mobile + motion discipline (9, 10).

**Wait until real users / real outcomes exist:**
- **Real proof and before/after artifacts** on the homepage and results — the doctrine forbids
  fabricated proof, so social proof, outcome examples, and testimonials wait for genuine Sprint
  completions.
- **The interactive profession selector's depth** (real per-field example diagnoses) — seed with
  real anonymized diagnoses as they accumulate.
- **Conversion copy/offer tuning** (price framing, CTA wording) — optimize against real funnel
  data, not guesses.
- **Any second constraint/persona surfaces** — design once a second Sprint actually opens.

---

*Reviewed against the locked doctrine. Nothing here proposes numbers to the user, mechanism-talk,
fabricated proof, gamification, or breaking the human-review gate. The redesign's job is to make
the honest product feel as serious as it actually is.*
