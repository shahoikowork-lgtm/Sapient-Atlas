# Sapient Atlas — Marketing Site Rebuild

*Category-defining direction for the public site (`app/page.tsx` + `components/atlas/*`).
Grounded in the current implementation and the locked doctrine: no numbers to the user, no
mechanism-talk, the honest boundary, no fabricated proof/testimonials, $149 / Stripe / waitlist
frozen. The job: make a visitor think "these people understand a problem I have," not "another
AI startup."*

---

## The one idea (what makes it category-defining)

**Stop describing the product. Stage it.** Atlas's product is *the moment you see the one thing
holding your work back.* An Apple launch leads with the product in motion; Stripe pins a visual and
transforms it as you scroll; Arc makes the interface itself the story. Atlas's entire site should be
**one scroll-driven demonstration** of its core act — a real piece of work being read, the single
constraint surfaced with evidence, then the path to remove it — so the visitor *experiences the
intelligence* before reading a paragraph.

Today the site is a well-written **essay about** the product. The rebuild makes it a **guided
demonstration of** the product. That shift is the whole game.

Positioning line to anchor everything: **"Find the one thing between you and your next level."**

---

## PART 1 — Audit (current site)

Current `app/page.tsx`: Nav → type-led hero → serif "stakes" line → Demonstration (artifact →
evidence → constraint) → dark "honesty" FocalSection → profession selector → $149 Offer → close →
Footer. It's already calm and literate (post the manifesto→instrument pass). But against
"category-defining":

1. **The hero states; it doesn't show.** "Find the one thing holding your work back" + a paragraph +
   a button. The product (the read) doesn't appear until you scroll to the Demonstration. The most
   important screen carries no proof of intelligence.
2. **It's a vertical stack of independent sections**, not one narrative. There's no through-line, no
   forward momentum, no "story being told to me."
3. **The Demonstration is a static reveal, not a performance.** It fades in once; it doesn't let you
   *watch Atlas think* or feel the transformation.
4. **No depth, no stage.** Everything is flat document-flow. Premium/expensive comes from layered
   depth, a persistent product stage, and choreography — none present.
5. **Motion is decorative** (section fades). By the brief's own standard, that's the wrong budget.
6. **Trust is one honest paragraph.** The strongest asset — *we tell you when we can't help* — is
   stated, not dramatized. And there's no structural trust spine (because we can't fake logos —
   that's a feature, see Part 5).
7. **The story (Current → Constraint → Sprint → Capability → Proof → Advancement) is never drawn.**
   It's implied across prose. A visitor can't grasp the company in 10 seconds without reading.
8. **It reads "considered indie," not "inevitable category leader."** Good taste, not yet ambition.

What's already right (keep): warm paper + dark instrument registers, the type system, the Evidence
device (the user's own words in serif), the honest-boundary copy, the no-fake-everything discipline.

---

## PART 2 — New information architecture

One narrative, six beats, framed by nav + close. The page is a **story with a spine**, not a stack.

```
NAV (minimal, one CTA)
1. HERO — the live read (the product, demonstrated, in the first screen)
2. THE TENSION — why this matters now (automation → judgment is the edge)
3. THE READ — how Atlas finds your one constraint (scroll-pinned demonstration)
4. THE SPRINT — the 9-mission path that removes it (the instrument moment)
5. THE PROOF — reality validates it; you keep the before/after
6. THE SHIFT — what you become: harder to replace (the emotional peak)
7. WHO / OFFER — choose your field · free diagnosis · the honest boundary · $149
8. CLOSE — one action
FOOTER
```

The journey **Current state → Constraint → Sprint → Capability → Proof → Advancement** maps 1:1 onto
beats 1→6, and a thin **progress spine** (left gutter on desktop) shows where you are in it — so the
company is legible at a glance, by structure, not text.

---

## PART 3 — Homepage wireframe (section by section)

For each: **objective · content · layout · motion · interactions · hierarchy.**

### 1. Navigation
- **Objective:** stay invisible until needed; one obvious action.
- **Content:** wordmark · (one quiet link: "How it works") · primary CTA "Get your free diagnosis".
- **Layout:** slim, sticky, `container-page`; paper register, hairline bottom on scroll.
- **Motion:** the bottom hairline + subtle bg blur fade in only after the hero leaves view (Linear).
- **Interactions:** CTA hover lift; smooth-scroll to anchors.
- **Hierarchy:** wordmark left, CTA right; nothing else competes.

### 2. Hero — *the live read*
- **Objective:** in one screen, make the visitor watch Atlas read real work and name the one
  constraint. Demonstrate intelligence before any claim.
- **Content:** a short headline ("Find the one thing between you and your next level."), one line of
  sub, the CTA — and beside/under it, a **living ArtifactPreview**: a real (illustrative, labeled)
  piece of work where, on load, one line **highlights**, an `Evidence` quote lifts out of it, and a
  single `ConstraintCard` resolves ("The one thing holding it back: generic positioning").
- **Layout:** asymmetric — text left (5 cols), the read stage right (7 cols); stacks on mobile.
  `container-product`. The stage has subtle depth (layered cards, soft shadow on paper).
- **Motion:** a **3-beat choreography on load** (≤1.2s total): (1) artifact settles, (2) the
  tell-tale line highlights, (3) evidence + constraint resolve. Plays once; reduced-motion shows the
  end state. This is the signature moment.
- **Interactions:** the field selector (see beat 7) can re-trigger the read for the visitor's
  profession — turning the hero into a tiny interactive instrument.
- **Hierarchy:** the *read* is co-lead with the headline — the visual is not decoration, it's the
  pitch.

### 3. The Tension — *why now*
- **Objective:** create stakes without fear-mongering or AI buzzwords.
- **Content:** one serif statement: "As more of the work gets automated, your edge is the judgment a
  tool can't copy. Atlas finds where yours is thin — and helps you close it on your real work."
- **Layout:** narrow reading column, generous air, paper.
- **Motion:** the line reveals in **clauses** as it enters view (Stripe-style phrase-by-phrase), so
  the idea lands in beats. One meaningful reveal.
- **Hierarchy:** a single large idea, alone on the screen. White space *is* the design.

### 4. The Read — *scroll-pinned demonstration*
- **Objective:** show *how* Atlas finds the highest-leverage constraint — the intelligence, made
  visible. This is the Stripe-grade centerpiece.
- **Content:** three steps narrated beside a **pinned visual stage**: (a) "It reads your real work"
  (artifact), (b) "It finds what's holding it back, with the evidence" (evidence lifts, weak lines
  dim), (c) "It names the one move" (ConstraintCard + the move). No mechanism talk — show the
  *experience* of being read, never AI/models.
- **Layout:** desktop = **sticky visual stage** (one side) that transforms as the copy on the other
  side scrolls past three steps; mobile = stage card pinned above, steps below.
- **Motion:** **scroll choreography** — the single artifact is the constant; each step drives one
  clear transformation of it (highlight → dim others → resolve constraint). Spatial continuity, never
  a slideshow.
- **Interactions:** scroll *is* the interaction; optional click on a step to jump.
- **Hierarchy:** the stage dominates; copy is captions to the demonstration.

### 5. The Sprint — *the instrument moment*
- **Objective:** show that the result is a structured path, not advice — and make it feel like a
  serious instrument (this is where "expensive" lives).
- **Content:** the 9-mission ladder across **SEE → CROSS → INDEPENDENCE → PROVE**, on the **dark
  instrument register** (continuity with the app + results). "Thirty days. Nine missions on your own
  work. Each one a rep that makes the next outcome more likely." No scores.
- **Layout:** full-bleed dark band (`FocalSection`), the path rendered as a calm vertical/stepped
  ladder with phase labels; the register flip itself signals "you've entered the product."
- **Motion:** as the band enters, the phases light in sequence (SEE→PROVE); the current/first mission
  settles. Restrained.
- **Hierarchy:** the ladder is the hero of this beat; the register change carries the emotional gear-shift.

### 6. The Proof — *reality validates it*
- **Objective:** make the trust mechanism visceral — proof is external and is *your own work*, not a
  certificate.
- **Content:** a **before / after** of a real artifact (the Day-1 rep vs the proven one), the
  one-line capability claim, and "a real prospect, colleague, or client confirms it — you keep the
  evidence." Honest: examples are illustrative until real outcomes exist (doctrine).
- **Layout:** two `Evidence`-style panels side by side (before muted, after sharp), back on paper.
- **Motion:** on view, "before" is present; "after" resolves with a quiet transition — the
  improvement made literal.
- **Hierarchy:** the after-state and the one-line claim dominate.

### 7. The Shift — *what you become*
- **Objective:** the emotional peak — desire. Name the transformation.
- **Content:** "You don't get a certificate. You get harder to replace — and the proof to show it."
  One line, large, serif.
- **Layout:** centered, lots of air, paper or a soft register transition.
- **Motion:** simple confident fade-up; no tricks. Let the sentence breathe.
- **Hierarchy:** one sentence owns the screen.

### 8. Who / Offer + the honest boundary
- **Objective:** convert — with integrity as the closer.
- **Content:** the **profession selector** (makes "your field" literal), the **$149** Sprint framing
  for marketers + "everyone else gets the diagnosis and early access," and the **honest boundary** as
  the trust device: "We tell you when we can't help. We'd rather lose the sale than waste your month."
- **Layout:** selector → Offer card → boundary line; reading column.
- **Motion:** selector re-frames the example (ties back to the hero read); minimal.
- **Hierarchy:** one primary CTA; the boundary sits right beside the price (disarms the ask).

### 9. Close + Footer
- **Close:** "Start with the diagnosis. One real piece of work. A few minutes. The one thing holding
  it back." One CTA. Privacy reassurance.
- **Footer:** wordmark + tagline + minimal links; calm.

---

## PART 4 — Motion design system

**Principle:** motion exists to make the *transformation* legible — a thing being read, a constraint
resolving, a register shifting. Never decoration.

- **Three motion roles:**
  1. *Demonstration* — the hero read + the scroll-pinned Read stage (the product performing).
  2. *Reveal-in-clauses* — big single ideas land in beats (Tension, Shift).
  3. *State/continuity* — register flips (paper↔instrument), before→after, CTA micro-lift.
- **Scroll choreography:** one sticky stage in beat 4 transforms across three steps; a thin left
  **progress spine** tracks the 6-beat story. Use `IntersectionObserver` / `whileInView` and a
  scroll-progress value; transform/opacity only.
- **Timing:** micro 160ms, transitions 220–320ms, the hero choreography ≤1.2s once. Ease-out enter,
  faster exit. Stagger 40–60ms.
- **Depth:** soft layered shadows on the read stage; one elevation step. No glass, no gradients, no
  parallax beyond a few px.
- **Performance budget:** transform/opacity only (never layout props); one pinned stage max;
  `content-visibility` for below-fold; respect the global `prefers-reduced-motion` guard (already
  wired) — every choreography has a static end-state fallback.
- **Forbidden:** autoplay loops, bouncy springs everywhere, scroll-jacking that fights the user,
  motion without a state change behind it.

---

## PART 5 — Copywriting (rewrite, customer-facing)

Voice: plain, exact, confident, calm. No jargon, no "AI-powered," no "unlock/supercharge," no
em-dash tricks, no numbers-as-scores.

| Beat | Copy |
|---|---|
| **Hero** | **Find the one thing between you and your next level.** / Show Atlas a real piece of your work. It finds the single thing limiting your growth and shows you the evidence — in your own words. / **Get your free diagnosis** · Free. No account. We tell you if we can't help. |
| **Tension** | As more of the work gets automated, your edge is the judgment a tool can't copy. Atlas finds where yours is thin, and helps you close it on your real work. |
| **The Read** | It reads your real work. / It finds what's holding it back — with the evidence. / It names the one move that changes the most. |
| **The Sprint** | Thirty days. Nine missions, on your own work. Each one a rep that makes the next outcome more likely. Not a course. Not advice. Reps that build the capability. |
| **The Proof** | You prove it on fresh work. A real prospect, colleague, or client confirms it. You keep the before and the after. |
| **The Shift** | You don't get a certificate. You get harder to replace — and the proof to show it. |
| **Boundary (trust)** | We tell you when we can't help. When a 30-day Sprint can't honestly move it, we say so and point you somewhere better. We'd rather lose the sale than waste your month. |
| **Close** | Start with the diagnosis. One real piece of work. A few minutes. The one thing holding it back. |

**Answering the six questions, by section:** *What is Atlas?* → Hero + The Read. *Why care / why now?*
→ Tension. *How does it work?* → The Read + The Sprint. *Why trust it?* → The Proof + the Boundary
(honesty as the trust mechanism, since we won't fake logos/testimonials). *What result?* → The Shift.

**Trust without fakes (the honest answer to "Trust section"):** the doctrine forbids fabricated
proof, logos, metrics, testimonials. So trust is built structurally: (1) the **demonstration** itself
(intelligence shown, not claimed), (2) **your own work as the evidence**, (3) the **honest boundary**
(a company that declines money reads as confident, not desperate), (4) **craft** (a site this
considered signals seriousness). When real outcomes exist, add a quiet, real proof beat — never before.

---

## PART 6 — Visual design system

- **Registers:** warm **paper** (`#f8f7f2`) for the story; dark **instrument** for the Sprint beat
  (and the app/results) — the flip is a designed gear-change, the brand's signature contrast.
- **Type:** the existing scale; **sans = the voice**, **serif (Newsreader) only for the user's quoted
  work** (Evidence) and the two big single-idea lines (Tension, Shift). Mono for eyebrows.
- **Color:** one accent (deep indigo `#1e2950/#2b3a67`), one functional success; the `✦` mark as the
  quiet identity thread. No gradients, no glass.
- **Space & scale:** large type, generous section tiers, asymmetric hero, a real product *stage* with
  depth. Premium = restraint + scale + one confident accent.
- **Components (signature):** `ArtifactPreview` (the read stage), `Evidence` (the brand fingerprint),
  `ConstraintCard`, `MissionPath`/`PhaseDots` (reused from the app for continuity), before/after panel.
- **Empty/edge:** every illustrative example is labeled as such (honesty). Mobile-first; the pinned
  stage degrades to a stacked card.

---

## PART 7 — Implementation roadmap (smallest high-impact first)

- **Phase 1 — The Hero read (biggest single lever).** Rebuild the hero into the asymmetric
  text + live `ReadStage` with the 3-beat load choreography. Ship alone; it changes the first
  impression entirely. Low risk (one section).
- **Phase 2 — The narrative spine + Tension/Shift beats.** Reorder into the 6-beat story; add the
  clause-reveal for the two big lines and the thin progress spine.
- **Phase 3 — The Read scroll-pinned stage.** The Stripe-grade centerpiece (sticky stage + 3 steps).
- **Phase 4 — The Sprint instrument beat + The Proof before/after.** Reuse `MissionPath`/`Evidence`.
- **Phase 5 — Offer/boundary polish, mobile pass, motion/perf audit.**
- Each phase ships independently; `tsc` + `build` + 375/desktop + reduced-motion after each.
- **Frozen throughout:** diagnosis flow, `/api/*` contracts, Stripe, $149, waitlist, doctrine.

## PART 8 — React / Next.js component recommendations

- **New client components:**
  - `ReadStage` (`'use client'`) — the hero/Read demonstration. Wraps `ArtifactPreview` + `Evidence`
    + `ConstraintCard`; drives the 3-beat choreography with framer-motion variants + `useReducedMotion`.
    Accepts a `field` prop so the profession selector can re-trigger it.
  - `ScrollStage` — the beat-4 sticky stage; uses framer-motion `useScroll`/`useTransform` (scroll
    progress → which step is active) over a `position: sticky` visual; pure transform/opacity.
  - `StoryProgress` — the thin left spine; `useScroll` + section refs → active beat. Desktop only.
  - `ClauseReveal` — splits a sentence into spans, reveals in sequence on `whileInView`.
  - `BeforeAfter` — two `Evidence`-style panels with a resolve transition.
- **Reuse (server components, no logic change):** `Nav`, `Footer`, `Section`, `Eyebrow`,
  `ButtonLink`, `Evidence`, `ConstraintCard`, `ArtifactPreview`, `FocalSection`, `MissionPath`,
  `PhaseDots`, `ProfessionSelector`, `Offer`.
- **Page:** `app/page.tsx` stays a Server Component; it composes the new client stages as islands
  (RSC payload children) so only the interactive stages ship JS. Keep `metadata`.
- **Perf:** framer-motion is already a dep; lazy-load the heaviest stage (`ScrollStage`) with
  `next/dynamic` if needed; `content-visibility:auto` on below-fold sections; images/SVG only (no
  video). Lighthouse-guard so the choreography never regresses mobile performance.
- **Motion lib:** keep framer-motion (`motion`, `useScroll`, `useTransform`, `useReducedMotion`,
  `AnimatePresence`). No new dependencies.

---

*Frozen: diagnosis, Stripe, price ($149), waitlist, admin, the no-numbers / no-mechanism / honest
proof doctrine. Changed: the marketing site's structure, hero, motion, copy density, and storytelling.
The goal is a site that performs the product — so a visitor feels understood, not marketed to.*
