# CLAUDE.md — Sapient Atlas

You are building Sapient Atlas.

Do not build any old "Atlas Knowledge Engine", relationship-matching system, community
graph, member loop, or previous Sapient concept. This repository is for the new Sapient
Atlas product only.

## Canonical doctrine

The Atlas Operating System (`ATLAS_OS.md`) is the locked product doctrine, and the Atlas
Constraint Design Manual (`CONSTRAINT_DESIGN_MANUAL.md`) is the source of truth for every
constraint added to Atlas. Every prompt, feature, screen, and product decision must conform
to both. When a proposal conflicts with the doctrine, the proposal is wrong, not the doctrine.

@ATLAS_OS.md
@CONSTRAINT_DESIGN_MANUAL.md

## Product

Sapient Atlas is a Professional Market Value Operating System. It helps professionals
continuously increase their market value in an AI-driven economy.

Core loop:

WHERE AM I? → WHAT SHOULD I DO NEXT? → DID I DO IT? → AM I MORE VALUABLE NOW? → (repeat)

## Who it is for

Working digital professionals who already earn money and already know AI is changing their
field — marketers, copywriters, SEO/growth specialists, recruiters, freelancers in digital
work. NOT beginners, NOT students, NOT people who "want to learn AI". We do not sell
education or courses. We help people stay valuable and competitive.

## Locked product direction

Do not redesign the company. Do not pivot. Do not invent new engines. Do not add
community / member-matching features. Do not build a knowledge graph from the old project.

## V1 stack

- Next.js (v16 — has breaking changes vs. older Next; read `node_modules/next/dist/docs/`
  before writing code, do NOT code from memory)
- TypeScript
- Tailwind
- shadcn/ui
- Supabase
- Stripe
- Anthropic API

@AGENTS.md

## Existing Supabase schema (already created — use as-is, do not redesign)

Tables: `users`, `subscriptions`, `diagnoses`, `cycles`, `value_assessments`, `moves`,
`predictions`, `plans`, `submissions`, `proof`, `value_history`.

## V1 product — build ONLY these

1. Landing
2. Diagnosis flow
3. Results page
4. Stripe upgrade flow
5. Dashboard
6. Current Move
7. Weekly Check-in
8. Progress
9. Monthly Re-Rating
10. Admin review queue

## Core rule (Trust System)

Every recommendation must include: **evidence, reasoning, confidence, and a falsifiable
prediction.** Every prediction must later be verified against what actually happened.

## Pricing

Free Diagnosis → $149 Value Sprint (30 days) → $39/mo Continuous.

## Current priority

First build the app scaffold and connect it to Supabase. Then build, in order:

1. Diagnosis API
2. Value Assessment
3. Opportunity Ranking
4. 30-Day Plan
5. Weekly Feedback
6. Monthly Re-Rating

Do not work on anything else.

## Operational guardrails (do not break)

- **Supabase project:** use ONLY the Sapient Atlas project `ddybrijphsummtkndvro`
  (`https://ddybrijphsummtkndvro.supabase.co`). NEVER touch the old project
  `wxbhvhmvvbjcealbzspg` — that is a different, live product.
- **Writes go through the service role only.** Users have SELECT-only RLS on their own
  rows; every insert/update happens server-side with the service-role key. Keep RLS
  ENABLED on every table.
- **The service-role key is server-only.** Never send it to the browser, never prefix it
  with `NEXT_PUBLIC_`.
- **Human-review gate (with a design-time-approval lane).** Value assessments, moves, and any
  free-composed AI prose are saved with a review status and shown to the user only after a
  human approves them in the admin queue. The one exception is the constrained runtime lane:
  the per-rep bar check plus its pre-approved correction pattern, selected from the approved
  capability map (never composed at runtime), may reach the user instantly when confidence is
  high; low-confidence or off-mission reps still route to human review. No free auto-messages.
- **Never commit secrets.** Real keys live in `.env.local` (gitignored) and Vercel env vars.
