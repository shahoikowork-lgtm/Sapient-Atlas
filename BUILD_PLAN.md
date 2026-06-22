# Sapient Atlas — Phased Build Plan & Specs

*The implementation blueprint derived from `DESIGN_REVIEW.md`. Concrete tokens, component APIs,
and page wireframes. No code here — this is what code is written against. Stack: Next.js 16 +
React 19 + Tailwind v4 (`@theme`) + framer-motion. Conforms to `ATLAS_OS.md` /
`CONSTRAINT_DESIGN_MANUAL.md`.*

---

## 0. Ground rules (apply to every phase)

- **Logic is frozen.** UI/markup/styles/copy-presentation only. Do not touch `lib/atlas/*`,
  `lib/ai/*`, Stripe, Supabase, RLS, the decline gate, prompts, or the human-review gate.
- **Contracts are frozen.** `POST /api/diagnosis` keeps the same fields and response; the success
  redirect stays `/results/[token]`. Re-sequencing the form changes *order of collection*, not the
  payload.
- **Doctrine is frozen.** No numbers/scores/%/salary to the user. No mechanism-talk (AI, models,
  review pipeline). No fabricated proof/metrics/testimonials. Honest boundary stays. One primary
  action per screen.
- **Additive-first migration.** Phase A adds tokens/components without breaking live pages; later
  phases migrate pages onto them one at a time, each shippable on its own.
- **Verify each phase:** `npx tsc --noEmit`, `npm run build`, 375/768/1024/1440 widths,
  `prefers-reduced-motion`, AA contrast on every text/bg pair.

---

## 1. PHASE A — Foundations (tokens + component system)

No visible redesign. Establishes the language everything else is built from. Ships invisibly.

### 1.1 Design tokens — `app/globals.css` `@theme`

#### Typography scale (modular ≈1.25)

| Token | Size (px) | Line-height | Tracking | Family | Weight | Use |
|---|---|---|---|---|---|---|
| `text-display` | clamp(40,6vw,56) | 1.05 | -0.025em | sans | 600 | hero headline |
| `text-h1` | 33 | 1.10 | -0.02em | sans | 600 | page title |
| `text-h2` | 26 | 1.15 | -0.015em | sans | 600 | section title |
| `text-h3` | 21 | 1.25 | -0.01em | sans | 600 | sub-section |
| `text-body-lg` | 18 | 1.6 | 0 | sans | 400 | lead paragraph |
| `text-body` | 16 | 1.6 | 0 | sans | 400 | body |
| `text-label` | 13 | 1.4 | 0 | sans | 500 | UI labels |
| `text-eyebrow` | 11 | 1 | +0.16em UPPER | **mono** | 500 | metadata/eyebrow |
| `text-evidence` | clamp(19,2.2vw,22) | 1.5 | 0 | **serif** | 400 | the user's quoted work ONLY |

**Family roles (the semantic split — the core brand rule):**
- `--font-sans` (Geist/Inter-grade grotesque) = **Atlas voice**: all headlines + UI + body.
- `--font-serif` (Newsreader) = **human voice**: used *only* by `Evidence` (the user's own work).
- `--font-mono` (Geist Mono) = **label voice**: eyebrows/metadata only, never prose.

> Migration note: headlines currently use `font-serif`. Phase A defines the tokens; Phases C/D/B
> flip page headlines from serif→sans as each page is migrated. Do not global-replace mid-flight.

#### Color tokens (semantic — replace all ad-hoc `/80 /75 /70`)

| Token | Hex | Use | Notes |
|---|---|---|---|
| `--surface-paper` | #f8f7f2 | page background | brand asset — keep |
| `--surface` | #ffffff | cards | |
| `--surface-sunken` | #f1efe8 | wells/insets | new |
| `--surface-focal` | #161a2c | the "one move" card | emotional peak |
| `--surface-focal-raised` | #1d2236 | nested blocks on focal | new |
| `--text-primary` | #1a1a17 | headings/body | |
| `--text-secondary` | #565049 | supporting text | **verify ≥4.5:1 on paper** |
| `--text-tertiary` | #645f54 | meta/captions | darkened from #6a675e for AA |
| `--text-on-focal` | #ffffff | text on focal | |
| `--text-on-focal-dim` | #b9bdd0 | labels on focal | |
| `--hairline` | #e6e3d9 | borders/dividers | |
| `--hairline-strong` | #d8d4c8 | hover/focus borders | new |
| `--accent` | #2b3a67 | brand accent | confirm AA on paper for text use |
| `--accent-hover` | #1e2950 | hover | |
| `--accent-tint` | #eceef6 | tinted surfaces | |
| `--accent-ink` | #1e2950 | text on accent-tint | |
| `--success` | #2e5e47 | trajectory "improving" | always + word/icon, never a grade |
| `--danger` | #b4322a | form/system errors | always + icon |
| `--danger-tint` | #f7eceb | error backgrounds | |

Rule for review: **no `text-*/NN` opacity utilities on text** — only the three text tokens.

#### Spacing scale (4/8 base)

`--space-1:4 · -2:8 · -3:12 · -4:16 · -5:24 · -6:32 · -7:48 · -8:64 · -9:96 · -10:128` (px)

**Section tiers (vertical rhythm):**
- `section-sm` = 64 mobile / 80 desktop
- `section` = 80 / 112 (default)
- `section-lg` = 112 / 160 (hero, closing)

#### Radii / elevation / motion

- Radii: `--r-sm:6 · -md:10 · -lg:16 · -xl:24 · -pill:999`. Inputs `md`; cards `lg`; focal/hero `xl`.
- Elevation (restrained, mostly borders): `shadow-raised` = `0 1px 2px rgb(26 26 23 / .04), 0 6px 16px rgb(26 26 23 / .05)`; `shadow-focal` slightly deeper. No glow, no glass.
- Motion: `--dur-fast:160ms · --dur:220ms · --dur-slow:320ms`; enter `cubic-bezier(.22,1,.36,1)` (ease-out); exit ~70% duration. Global `prefers-reduced-motion` guard already present — keep.

#### Layout widths

- `measure` (prose) = 64ch (~620px)
- `container-reading` = 672 (max-w-2xl) — diagnosis prose, results text column
- `container-product` = 1040 — demonstration hero, results layout grid
- `container-page` = 1152 — nav + footer
- Gutters: 24 mobile → 32 (≥768) → 48 (≥1280)

### 1.2 Base component upgrades (Phase A)

- **`Button`** — keep variants/sizes; bind to tokens; ensure 44px min height at `lg`; states
  hover/active/disabled/focus-visible already good. Add `loading` prop (spinner + `aria-busy`,
  disables) so each page stops re-implementing it.
- **`Eyebrow`** — map to `text-eyebrow` token. No change in look.
- **`Section`** — add `size?: 'sm'|'md'|'lg'` (maps to section tiers) and
  `width?: 'reading'|'product'|'page'` (maps to containers). Replaces hard-coded `py-16 max-w-2xl`.
- **`Card`** — add `tone?: 'surface'|'sunken'` and `interactive?: boolean` (adds hover border +
  `shadow-raised`).

### 1.3 Phase A acceptance criteria
- All tokens defined in `@theme`; a token reference comment block in `globals.css`.
- New/updated components compile, Storybook-free smoke test on a scratch route.
- No live page visually changes yet (tokens additive; pages not migrated).
- `tsc` + `build` green.

---

## 2. Component specifications (built across A→B, used everywhere)

Prop tables are the contract. "RSC" = can stay a Server Component; "client" = needs `'use client'`.

### `Field` (client) — the a11y contract in one place
```
Field {
  id: string                      // -> input id + label htmlFor
  label: string
  type?: 'text'|'email'|'textarea'|'select'
  value: string
  onChange: (v: string) => void
  required?: boolean              // renders required affordance + aria-required
  error?: string                  // renders FieldError (role=alert) + aria-invalid + describedby
  hint?: string                   // persistent helper, id wired to aria-describedby
  placeholder?: string
  autoComplete?: string
  options?: {value,label}[]       // select only
  rows?: number                   // textarea
  voice?: 'sans'|'mono'           // textarea input voice (work_sample = mono)
}
```
- States: default · hover (`hairline-strong`) · focus (accent ring) · filled · error (`danger`) · disabled.
- a11y: label htmlFor/id, aria-required, aria-invalid, aria-describedby (hint+error), error role="alert", inline-validate on blur, min 44px touch height.

### `Pill` (RSC) — quiet status, never a metric
```
Pill { tone?: 'neutral'|'accent'|'success'; children }  // word-only; no numbers
```
Replaces the clinical "Confidence: high" bordered chip. Rounded `pill`, `text-label`, tinted bg.

### `Evidence` (RSC) — THE brand component (upgrade existing)
```
Evidence { quote: string; source?: string; emphasis?: boolean }
```
- `text-evidence` serif, indigo left rule (`border-l-2 accent`), `source` in mono eyebrow.
- `emphasis` (targeted dimension) → slightly larger + `surface` card padding.
- This is the only place serif appears. It is the visual fingerprint.

### `ConstraintCard` (RSC)
```
ConstraintCard { title: string; detail?: string; tone?: 'default'|'highlight' }
```
- Names one constraint in plain language. `highlight` = the single dominant one (accent left edge).
- Used in: homepage demonstration, results "what's missing", waitlist (their named constraint).

### `MoveCard` (RSC) — the climax (extract from results page)
```
MoveCard { title; thesis?; reasoning?; targetOutcome?; confidenceWord?: string }
```
- `surface-focal` bg, `r-xl`, `shadow-focal`, mono eyebrow "The one move", `text-h2` white title.
- `confidenceWord` is a word ("clear", "strong") via `Pill` on focal — never a number.

### `AnalysisState` (client) — the designed wait
```
AnalysisState { status?: string }   // drives aria-live text
```
- Full-screen calm sequence: the submitted work visually "settles", a field of considerations
  narrows to one (a focusing gesture). Honest ~20s framing. `aria-live="polite"`. No fake
  percentage progress. Shows the *experience* of being read — never the mechanism.
- Reduced-motion: static "Reading your work…" with the artifact shown, no animation.

### `WaitlistState` (RSC + small client for intent action)
```
WaitlistState { constraintName?: string; explanation: string; onNotify intent }
```
- Leads with *their* named constraint (ConstraintCard highlight) + one line why it matters in
  their field's language. Confirms place. Honest "Sprints open one field at a time; yours is on
  the path." One quiet action ("Notify me when this opens") — records intent, NO checkout.
- Saved-result reassurance ("Keep this link / return anytime").

### `ArtifactPreview` (RSC) — the demonstration object
```
ArtifactPreview { kind: 'campaign'|'doc'|'copy'|...; lines: string[]; highlight?: range }
```
- Renders a short, anonymized real artifact as a styled "work" surface (mono/sans), with an
  optional highlighted span that the `Evidence` pulls from. Powers the homepage hero demo and the
  profession selector. Seeded with **real anonymized** examples only (never fabricated).

### `Nav` (RSC) + `Footer` (RSC)
- `Nav`: sticky, `container-page`, wordmark left, single primary CTA right (already exists inline —
  promote to component). Quiet, no nav clutter.
- `Footer`: wordmark + tagline + minimal links, `container-page`, `hairline` top.

---

## 3. Page wireframes (target layouts)

### 3.1 Homepage (collapse 10 sections → 4)
```
┌ Nav: ✦ Sapient Atlas                         [Get your free diagnosis] ┐
├───────────────────────────── HERO (container-product, section-lg) ─────┤
│  HEADLINE (sans, text-display, max 18ch)        ┌───────────────────┐  │
│  one-sentence subhead (text-body-lg)            │ ArtifactPreview   │  │
│  [ Get your free diagnosis ]                    │  (real work)      │  │
│  free · no account · we say if we can't help    │  ▎highlighted span│  │
│                                                 ├───────────────────┤  │
│                                                 │ Evidence (serif)  │  │
│                                                 │ ConstraintCard ▎  │  │
│                                                 └───────────────────┘  │
│   ^ visitor SEES the product think before reading a word about it      │
├──────────────── HOW IT WORKS (reading, section) ───────────────────────┤
│  3 beats on the real spine: See your work → Work the one thing →        │
│  Prove it on fresh work. (real Constraint→Rep→Proof, not generic steps) │
├──────────────── THE BOUNDARY (reading, section) ───────────────────────┤
│  ONE confident statement: "We tell you when we can't help." (said once) │
│  + one line: no lessons, no videos — real work only.                    │
├──────────────── WHO IT'S FOR + OFFER (product, section) ────────────────┤
│  Profession selector (chips) → reframes the example + outcome per field │
│  Fork: Marketing/positioning → Sprint $149 path                         │
│        Everyone else → diagnosis + early access path                    │
├─ Footer ───────────────────────────────────────────────────────────────┤
```
Motion: hero demo resolves ONCE on load (highlight + constraint settle). Nothing else animates.

### 3.2 Diagnosis (work-first, value-gated, 2 steps, same API)
```
STEP 1 — THE WORK (the page is the paste surface)
┌ Nav (minimal: wordmark + "No scores. Just clarity.") ┐
│  Eyebrow: See what you can't see yourself            │
│  H1 (sans): Show Atlas one real piece of your work.  │
│  ┌──────────────────────────────────────────────┐   │
│  │  large work_sample textarea (mono voice)      │   │  <- the hero of the page
│  │  generous min-height, calm                    │   │
│  └──────────────────────────────────────────────┘   │
│  wordcount · "your work stays private"               │
│  [ Get my diagnosis ]  (disabled until non-empty)    │
└──────────────────────────────────────────────────────┘
STEP 2 — UNLOCK (revealed after step 1; same page)
│  "Where should we send it?"                          │
│  Field email (required) · Field role (required, routes constraint)
│  ▸ Add context (optional)  — collapsed; 8 fields; skippable
│  [ Get my diagnosis ]   --->  POST /api/diagnosis (full payload)  --> AnalysisState --> /results/[token]
```
- Same fields collected, same body posted, same redirect. Only the order + the AnalysisState change.
- Mobile: sticky bottom CTA.

### 3.3 Results (document with one climax)
```
┌ Nav (Your results) ┐
│ EVIDENCE  (serif, dominant) — "What your work shows"      <- leads, brand
│   Evidence quote ×N (the user's own words)
│ ──────────────────────────────────────────
│ THE READ (text, Pill: "we're confident in this read" / "trending stronger")
│ ──────────────────────────────────────────
│ WHAT'S MISSING (ConstraintCard list)
│ ── extra air (section tier) ──
│ framing line: "The single thing to work on"
│ ┏━━━━━━━ MoveCard (focal, the climax) ━━━━━━━┓
│ ┃ The one move · title · thesis · why · target ┃
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
│ PREDICTION (we'll check in N days · hit/partial/miss — words, no numbers)
│ ▸ The full picture (progressive disclosure)
│ ┌ NEXT STEP (designed decision surface) ─────────────┐
│ │ eligible  → Sprint invitation + honest boundary CTA │
│ │ waitlist  → WaitlistState                            │
│ │ other     → "where this leaves you" honest note      │
│ └─────────────────────────────────────────────────────┘
└ (Empty state: "Your read is being prepared" → designed reassurance: a person is reviewing) ┘
```
Motion: results "focuses in" once — evidence resolves, then MoveCard settles. Then still.

### 3.4 Waitlist (the majority path — see WaitlistState spec §2)
```
┌ Their named constraint (ConstraintCard highlight) ┐
│ one line: why this matters in YOUR field          │
│ "You have your diagnosis. The Sprint for <field>  │
│  isn't open yet — Sprints open one field at a time,│
│  and yours is on the path."                        │
│ [ Notify me when this opens ]   (intent only)      │
│ keep this link · return anytime                    │
└────────────────────────────────────────────────────┘
```

### 3.5 Mobile (all pages)
- One column; `min-h-dvh`; type rescaled (display caps lower); touch ≥44px.
- Diagnosis + results conversion CTA = **sticky bottom action bar**.
- Hero demo stacks: headline → ArtifactPreview → Evidence → ConstraintCard.

---

## 4. Phases B–E (deliverables + acceptance)

### PHASE B — The three hidden peaks (highest experience ROI)
**Deliverables:** `AnalysisState`, results hierarchy + `MoveCard`/`Pill` migration + `NextStep`
surface, `WaitlistState`.
**Files:** `app/diagnosis/page.tsx` (wire AnalysisState on submit), `app/results/[token]/page.tsx`,
`app/results/[token]/upgrade-cta.tsx`, new components.
**Acceptance:** wait state passes reduced-motion + aria-live; results climax reads clearly; waitlist
has a working intent action (records to existing store only if one exists — else a simple mailto
intent, no new backend); no numbers anywhere; contract intact; build green.

### PHASE C — Homepage: manifesto → demonstration
**Deliverables:** demonstration hero (`ArtifactPreview`+`Evidence`+`ConstraintCard`), profession
selector, 10→4 section collapse, `Nav`/`Footer` components, headline serif→sans.
**Files:** `app/page.tsx`, new components.
**Acceptance:** hero shows the product thinking above the fold; one boundary statement (not 3-4);
selector reframes example per field using **real anonymized** seed data; AA + responsive + build.

### PHASE D — Diagnosis re-sequence
**Deliverables:** 2-step work-first flow, `Field` component adoption, value-gated identity, optional
context after step 1.
**Files:** `app/diagnosis/page.tsx`.
**Acceptance:** **same `POST /api/diagnosis` payload + same redirect** (diff the network request
before/after — must be identical); full a11y via `Field`; sticky mobile CTA; build green.

### PHASE E — Mobile + brand polish
**Deliverables:** mobile-first pass across all pages, sticky CTAs, wordmark/mark, voice spec doc,
motion audit (retire decorative reveals).
**Files:** all pages + `components/atlas/*`, new `BRAND.md`.
**Acceptance:** 375px + landscape + large-text + reduced-motion all clean; one meaningful animation
per view max; build green.

---

## 5. Migration & verification strategy

- **Order:** A (foundations) → B (peaks) → C (home) → D (diagnosis) → E (polish). Each ships alone.
- **Per page migration:** flip headline serif→sans, swap ad-hoc opacities → text tokens, replace
  bespoke markup → components, re-check AA, then build.
- **Contract guard (Phase D):** capture the `POST /api/diagnosis` request body before changes; after
  re-sequencing, confirm byte-for-byte same keys/values are sent and redirect is unchanged.
- **Every phase:** `tsc --noEmit` + `npm run build` + 4 breakpoints + reduced-motion + AA pairs.

---

## 6. Deferred until real users / outcomes exist (doctrine: no fabricated proof)

- Real **before/after proof** + testimonials on home/results (needs completed Sprints).
- **Real per-field example diagnoses** in the profession selector (seed as anonymized diagnoses
  accumulate; until then use the marketer example + honest "more fields opening").
- **Conversion/offer copy + price framing** tuning (optimize against real funnel data).
- **Second persona/constraint** surfaces (design when a second Sprint actually opens).
- Any **outcome/value visualization** (only ever real, never numeric to the user).

---

*Built against the locked doctrine. The plan changes how the product looks, moves, and sequences —
never what it claims, measures, or automates.*
