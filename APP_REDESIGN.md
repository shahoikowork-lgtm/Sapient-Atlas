# Sapient Atlas — Authenticated App Redesign

*A premium professional academy that guides users step by step to a result — not a document to
read. Grounded in the real code (`app/app/*`, `components/app-shell.tsx`, `lib/app-data.ts`,
`lib/sprint.ts`, `app/admin/review`). Business logic, diagnosis, Stripe, price, waitlist, admin
auth, proof doctrine, no-score doctrine, and the M1 ladder are **frozen** — this changes layout,
navigation, hierarchy, components, mission UI, motion, and copy density only.*

---

## PART 1 — Audit (why users wouldn't pay today)

**The app never got the redesign the marketing site + results page got.** Every `/app` and
`/admin` screen uses raw `black/white` Tailwind (`border-black/10`, `text-black/60`, `bg-black`) —
not the warm-paper / instrument token system. It reads as a generic monochrome SaaS dashboard, the
opposite of "premium academy."

Concrete weaknesses:

1. **It's a stack of text cards, not a path.** The dashboard (`app/app/page.tsx`) is six stacked
   prose sections (Capability read, the move, re-rating, "Next action", proof placeholder, billing).
   Nothing shows a journey, a sequence, or where you are in it.
2. **"What do I do next?" is a vague paragraph.** Literal current copy: *"Start executing your move
   on real work this week. Weekly check-ins and feedback open as your sprint progresses."* No single
   button, no current mission, no time estimate.
3. **The sprint is shown as 4 generic "weeks," not missions.** `app/app/move/page.tsx` renders
   `weekly_milestones` as Week 1–4 rows. No phases, no locked/current/done ladder, no sense of
   climbing.
4. **The check-in is a bare textarea.** `checkin-form.tsx` = one box + "Attach a work sample (file
   upload coming soon)" + "Submitting… (~15s)". No mission context, no success bar, no states.
5. **Doctrine leak.** `app/app/progress/page.tsx` literally says *"Streak and momentum tracking
   coming soon."* That's a streak — the exact thing the no-gamification doctrine forbids. Remove.
6. **Slow section opens (real, not perceived).** Every page is `force-dynamic` with **no
   `loading.tsx`**; `getWorkspace` runs **7 sequential** Supabase queries; and `/app/move` calls
   `ensureSprintPlan` which can run the **AI plan generation synchronously on first open** → a
   multi-second blank screen. Navigation feels broken.
7. **Navigation is a fixed 220px desktop sidebar** (`grid-cols-[220px_1fr]`) — **no mobile layout
   at all** — with six flat CRM-ish labels (Dashboard, Diagnoses, Current Move, Weekly Check-in,
   Progress, Settings).
8. **No visible proof/record.** The "before/after proof" — the thing that justifies $149 — is an
   empty placeholder ("Verified before/after work will collect here").
9. **Value is invisible.** A buyer paying $149 sees a paragraph and a textarea. There's no felt
   structure, no momentum, no "I am being guided to a result."

**Bottom line:** the engine is sound and the data is all there; the *experience* doesn't express
any of it. It looks free, reads like a memo, and opens slowly.

---

## PART 2 — New App IA

Four surfaces. Names are the navigation.

```
NOW      → the one thing to do right now (default screen)          /app
PATH     → the 9-mission ladder across 4 phases                    /app/move  (reframed)
PROOF    → before / after / external validation / what improved    /app/progress (reframed)
YOU      → account, plan, settings, sign out                        /app/settings
```

- **Diagnoses** and **Re-rating** are not top-level noise. Diagnoses → a link inside YOU (history);
  re-rating → surfaces *inside NOW* when Day 30 arrives (a state, not a menu item).
- **Check-in** is not a nav item — it's the *action inside a mission* (you reach it by opening the
  current mission, never from a menu).
- **Navigation chrome:** desktop = slim left rail with the 4 destinations + status; mobile = a
  bottom tab bar (NOW / PATH / PROOF / YOU), 44px targets. One active state, calm.

---

## PART 3 — Core screen designs

All screens render in the **instrument register** (`.instrument` dark surface) so the app feels
like one continuous product with the results page, and use the token system (no raw black/white).

### NOW (`/app`)
The default. Answers "what do I do next" in one glance. **One screen, one primary action.**

```
┌ NOW ───────────────────────────────────────────────┐
│ eyebrow: YOUR CONSTRAINT                            │
│ Generic positioning            · Sprint · Phase 2/4 │  ← context line, tiny
│                                                     │
│ ┌ CURRENT MISSION ───────────────────────────────┐ │
│ │ Mission 3 of 9 · ~25 min                        │ │
│ │ Cold Prospect Opening                           │ │   ← MissionCard (the hero)
│ │ Why it matters: one line.                       │ │
│ │ Clears when: <success bar, one line>            │ │
│ │ [ Start this mission → ]                         │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Phase progress  ●●◐○  SEE · CROSS · INDEP · PROVE   │  ← 4 dots, current = half
│ Mission 3 of 9 · 2 cleared                          │
└─────────────────────────────────────────────────────┘
```
- If awaiting review → mission card flips to a calm **"In review"** state ("A person is checking
  your work. We'll open the next mission when it's confirmed.") — no dead end.
- If Day 30 → a single **"Re-rating ready"** card replaces the mission card.
- Nothing else competes. Billing/account live in YOU.

### MISSION screen (open one mission)
Reached by "Start this mission". This is the focused workspace.

```
← Path                                   Mission 3 of 9
PHASE: CROSS
Cold Prospect Opening
~25 min · on your own real work

Why this mission         one tight sentence (not a paragraph)
Do this                  the rep, as 1–3 short steps / bullets
Clears when              the bar, as a checklist (pass/partial/miss, words only)

┌ Your work ────────────────────────────┐
│ [ textarea — paste the real work ]     │
│ wordcount · private                    │
│ [ Submit mission ]                     │
└────────────────────────────────────────┘
```
- The bar is shown **as a checklist before submit**, so the user knows the target.
- Submit → optimistic "Sent for review" state, returns to NOW.

### MISSION PATH (`/app/move`, reframed)
The journey, visible. The 9 missions grouped into the 4 phases, with locked / current / done.

```
YOUR SPRINT · Generic positioning                Mission 3 of 9

SEE
 ✓ 1  Swap Test Headline            done
 ✓ 2  One Sentence Positioning      done
CROSS
 ◉ 3  Cold Prospect Opening         this mission  [Open →]
 ○ 4  New Asset Transfer            locked
INDEPENDENCE
 ○ 5  New Segment Positioning       locked
 ○ 6  Survive "So What?"            locked
 ○ 7  High-Stakes Final Claim       locked
PROVE
 ○ 8  Ship It                       locked
 ○ 9  Capture Reality's Reaction    locked
```
- States: `done` (✓), `current` (◉, the only one openable), `in review` (◐), `locked` (○).
- Phase labels are the structure; no numbers-as-scores. "Mission 3 of 9" is position, not a grade.

### RESULTS (`/results/[token]`, already redesigned — light touch)
Keep the evidence-first, MoveCard-climax structure. Add **one bridge line** at the end for buyers:
"Your Sprint turns this into 9 missions on your own work." Links to NOW after purchase. No logic
change.

### PROOF / RECORD (`/app/progress`, reframed)
The $149 justifier. Shows the transformation, not a placeholder.

```
PROOF
Before → After          the Day-1 baseline rep vs the latest, side by side
What improved           the named failure mode, now gone (plain words)
External validation     status: awaiting / confirmed by a real prospect/peer
Your capability         the read, in plain language (no scores)
```
- Remove the "Streak and momentum coming soon" line entirely (doctrine).
- Empty state is honest and directional: "Your proof builds as you clear missions. Mission 1 sets
  your baseline."

### ADMIN REVIEW (`/admin/review`, polish only)
Operators *may* see numbers (doctrine forbids numbers to the **user**, not the operator). Keep the
data; improve scan-ability and speed:
- Two clear queues with counts (Assessments / Missions) — already there.
- Each card: identity + the work + AI draft + Approve/Edit/Decline in one row.
- Apply tokens for legibility; collapse raw JSON behind a "raw" toggle (less wall-of-text).
- This is internal; keep it fast and dense, just not ugly.

---

## PART 4 — Copy system (heavy → tight UI copy)

Rule: labels are 1–3 words; helper lines are one sentence; the rep is bullets, not prose.

| Today (heavy) | New (tight) |
|---|---|
| "Start executing your move on real work this week. Weekly check-ins and feedback open as your sprint progresses." | **Start this mission →** |
| "Your capability read is being prepared. Check back shortly." | **Your read is being prepared.** |
| "Your before/after proof collects here as you complete work." | **Proof builds as you clear missions.** |
| "Submitting… (~15s)" | **Sending for review…** |
| "Attach a work sample (file upload coming soon)" | *(remove until it exists)* |
| "Streak and momentum tracking coming soon." | *(remove — doctrine)* |
| section title "Current move" | **NOW** / mission title |
| "Prediction we will check in 30 days…" (paragraph) | **We'll check in 30 days:** one line |

Mission card copy template (per mission):
- **Title:** the ladder name (e.g. "Cold Prospect Opening")
- **Meta:** `Mission N of 9 · ~XX min`
- **Why it matters:** one sentence
- **Clears when:** the bar as one checkable line (or 2–3 checks)
- **Action:** `Start this mission →` / `Submit mission`

Voice: plain, exact, calm, adult. No hype, no exclamation, no em-dash, no numbers-as-scores, no
mechanism talk.

---

## PART 5 — Interaction & performance system

**Performance first (this is half the felt problem):**
1. **Add `loading.tsx` skeletons** for `/app`, `/app/move`, `/app/progress` — instant shell on
   navigation instead of a blank wait. Biggest perceived-speed win, lowest risk.
2. **Parallelize `getWorkspace`** — the independent reads (assessment, move, subscription,
   valueHistory, plan, submissions) run with `Promise.all` instead of 7 sequential awaits. Pure
   data-fetching change, no logic touched. (prediction depends on move → second tick.)
3. **Make `ensureSprintPlan` non-blocking.** Don't run AI generation inside the render path of
   `/app/move`. Either kick it off at diagnosis-approval, or render a calm "Building your path…"
   state and let it fill in. The *what* it generates is unchanged.
4. **Keep `force-dynamic`** (data is per-user) but lean on skeletons + parallel reads + Next Link
   prefetch so transitions feel instant.

**Motion (clarify state, never decorate):**
- Mission status change (locked→current, current→done, →in review): a 180–220ms crossfade + the
  check settling. This is the one motion that earns its place.
- NOW ↔ Mission: a quick directional slide (forward = in, back = out) for spatial continuity.
- Submit: button → "Sending for review…" → returns to NOW with the mission marked in-review.
- Everything respects the global `prefers-reduced-motion` guard already in `globals.css`.
- Budget: one meaningful animation per view; transform/opacity only; ≤240ms; no layout-shifting
  animation; no scroll-reveal decoration in the app.

**Section opening:** every nav destination has a skeleton; content swaps in on data ready. No
spinners-on-blank.

---

## PART 6 — Visual system

- **Register:** the app runs in the **instrument** (dark) register end to end, matching the results
  page — one product, not two. Tokens only (`s-bg`, `s-panel`, `s-text`, `s-line`, `s-accent`…),
  zero raw `black/white`.
- **Typography:** the token scale (`text-display/h1/h2/h3/body/label/eyebrow`); sans for UI,
  serif **only** in `Evidence` (the user's quoted work), mono for `eyebrow` labels.
- **Layout:** centered single column (`max-w-2xl`) for NOW/Mission; the Path is a single timeline
  column. Generous vertical rhythm via the section tiers. No multi-card grids competing.
- **Cards:** reuse `Card`, `MoveCard` (focal), `Pill`, `Evidence`. Add **`MissionCard`**,
  **`MissionRow`**, **`PhaseHeader`**, **`PhaseDots`**, **`StatLine`** (position, never score).
- **Hierarchy:** one primary action per screen, visually dominant; everything else recedes.
- **Empty states:** always directional ("Mission 1 sets your baseline."), never a dead placeholder.
- **No:** XP, badges, streaks, points, /100, money or salary to the user, progress bars that imply
  a grade. Position ("3 of 9") and phase dots are allowed — they're location, not score.

---

## PART 7 — Implementation plan

**Files likely to touch (UI/markup/copy/data-fetch only — no business logic):**
- `components/app-shell.tsx` — nav → NOW/PATH/PROOF/YOU, instrument tokens, **mobile bottom bar**.
- `app/app/layout.tsx` — pass through what the shell needs (status).
- `app/app/page.tsx` — the **NOW** screen.
- `app/app/move/page.tsx` — the **Mission Path** + entry to a mission.
- `app/app/checkin/page.tsx` + `app/app/checkin/checkin-form.tsx` — the **Mission** submission
  (context + success bar + states). Same `POST /api/submissions {week, artifact_text}` — `week` is
  the mission index; **contract unchanged**.
- `app/app/progress/page.tsx` — **PROOF/RECORD**; delete the streak line.
- `app/admin/review/page.tsx` — polish only.
- `lib/app-data.ts` — parallelize reads (`Promise.all`). No shape change.
- `lib/sprint.ts` — add a **pure** `deriveMissions(plan, submissions)` helper that maps the existing
  `weekly_milestones` → ordered missions + phase grouping (presentation only; `deriveWeeks` stays).
- New: `components/atlas/MissionCard.tsx`, `MissionPath.tsx`, `PhaseDots.tsx` (+ exports).
- New: `app/app/loading.tsx`, `app/app/move/loading.tsx`, `app/app/progress/loading.tsx`.
- `globals.css` — tokens already exist; nothing new required.

**Mission ↔ data mapping (no logic change):** the path renders each `weekly_milestones[]` item as a
mission in order; `submissions.week` = mission index drives done/in-review/current/locked. The M1
ladder's 9 names are the canonical content the plan generator should emit. The UI renders **N**
missions regardless, so it's correct today. *Optional, your call (content not logic):* align
`lib/ai/thirty-day-plan.ts`'s prompt to emit the 9 M1 milestones with these exact titles + a
`phase` field. Flagged separately; not required for this redesign to ship.

**Build phases (smallest high-impact first, no unnecessary rebuild):**
- **Phase 1 — Foundation (invisible, biggest felt win).** Apply instrument tokens across app-shell +
  all `/app` pages (kill raw black/white); add the 3 `loading.tsx` skeletons; parallelize
  `getWorkspace`; make `ensureSprintPlan` non-blocking. Result: app instantly feels premium + fast,
  near-zero risk.
- **Phase 2 — NOW screen.** Single MissionCard + one CTA + phase dots. The "what do I do next"
  fix.
- **Phase 3 — Mission Path.** Reframe weeks → 9 missions + 4 phases + locked/current/done
  (`deriveMissions`).
- **Phase 4 — Mission submission.** Context + success-bar checklist + states; reachable from the
  mission, not the menu.
- **Phase 5 — Navigation + PROOF.** NOW/PATH/PROOF/YOU + mobile bottom bar; PROOF/RECORD screen;
  remove streak line.
- **Phase 6 — Admin polish** (optional).

Each phase ships independently; verify after each.

---

## PART 8 — Verification

- **Faster:** compare TTFB/`loading.tsx` appearance before/after; navigation shows a skeleton in
  <100ms; `/app/move` no longer blocks on AI (first open shows path or "building", never a blank
  multi-second wait). Lighthouse (mobile) performance not lower than baseline; ideally higher.
- **Text reduced:** word-count each screen before/after; target ≥50% reduction on NOW and Mission.
  No paragraph >2 sentences in primary flow.
- **Next action always visible:** on every authenticated screen there is exactly one primary action
  above the fold (manual pass on 375px + desktop). NOW always shows the current mission or its
  state.
- **No accidental gamification:** `grep -rinE "streak|badge|\bxp\b|points|/100|leaderboard" app components`
  returns nothing user-facing; confirm the progress "streak … coming soon" line is gone; confirm no
  numeric score shown to the user (admin-only numbers are fine).
- **Mobile works:** 375px and landscape — bottom tab bar reachable, 44px targets, single column, no
  horizontal scroll, mission card + submit usable.
- **Performance not worse:** transform/opacity-only motion; reduced-motion verified; no new
  blocking calls in render; bundle not materially larger (no heavy deps).
- **Logic untouched:** `POST /api/diagnosis`, `POST /api/submissions`, Stripe, price ($149),
  waitlist, admin auth, the plan/submission/review tables — all unchanged. Diff the network calls
  before/after; identical.

---

*Frozen: diagnosis logic · Stripe · price · waitlist · admin auth · proof doctrine · no-score
doctrine · M1 ladder progression. Changed: layout · navigation · hierarchy · components · mission
UI · motion · copy density. Goal: a calm, fast, premium academy that always shows the one next move.*
