-- ============================================================================
-- Sapient Atlas, initial schema (V1)
-- Migration: 001_initial_schema.sql
-- Project: ddybrijphsummtkndvro  (https://ddybrijphsummtkndvro.supabase.co)
-- ============================================================================
--
-- PURPOSE
--   Put the existing production schema under version control. The live database
--   was created by hand in the Supabase dashboard; this file reconstructs it so
--   the schema lives in git and a fresh environment can be stood up from scratch.
--
-- HOW THIS WAS PRODUCED
--   This environment has no DB introspection access (no supabase CLI link, no
--   psql, no connection string), so the DDL below was reconstructed from the
--   application code: every table/column/enum value is taken from the actual
--   reads and writes in app/ and lib/ (service-role inserts/updates, RLS-scoped
--   selects). It is faithful to how the app uses the database, but it has NOT
--   been diffed byte-for-byte against the live schema.
--
-- !! BEFORE TREATING THIS AS CANONICAL !!
--   Diff it against a real dump of the live database, e.g.:
--     supabase link --project-ref ddybrijphsummtkndvro
--     supabase db dump --schema public -f supabase/_live_dump.sql
--   then reconcile any differences (extra columns, exact defaults, the `proof`
--   table, and the exact RLS policy text in Dashboard > Authentication > Policies).
--
-- SAFETY
--   * This is for VERSION CONTROL. It is NOT run against the live database here.
--   * NEVER run this against the old project `wxbhvhmvvbjcealbzspg` (different,
--     live product).
--   * It is written idempotently (IF NOT EXISTS / guarded enum creation) so it is
--     safe to apply to a FRESH project to reproduce the schema.
--
-- TRUST / SECURITY MODEL (enforced below)
--   * RLS is ENABLED on every table.
--   * End users get SELECT-only access to their OWN rows, and only to APPROVED
--     output (approved value_assessments, visible moves). All other access is
--     denied to the `authenticated` role.
--   * Every write happens server-side with the service-role key, which BYPASSES
--     RLS. There are deliberately no INSERT/UPDATE/DELETE policies.
-- ============================================================================

begin;

create extension if not exists pgcrypto;  -- gen_random_uuid()

-- ----------------------------------------------------------------------------
-- ENUMS  (values taken verbatim from the application code)
-- ----------------------------------------------------------------------------
-- NOTE on spelling: the code uses Stripe's American "canceled" for subscription
-- status, but British "cancelled" for user status. Both are reproduced exactly.

do $$ begin
  create type confidence_level as enum ('low', 'medium', 'high');
exception when duplicate_object then null; end $$;

do $$ begin
  create type trajectory as enum ('rising', 'holding', 'slipping');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_status as enum ('lead', 'sprint', 'continuous', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type review_status as enum ('pending_review', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type move_status as enum ('pending_review', 'approved', 'active', 'completed', 'deferred');
exception when duplicate_object then null; end $$;

do $$ begin
  create type submission_status as enum ('submitted', 'pending_review', 'reviewed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_type as enum ('sprint', 'continuous');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum ('active', 'past_due', 'canceled', 'incomplete', 'trialing');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- TABLES
-- ----------------------------------------------------------------------------

-- users: one row per professional. Created pre-auth as a `lead` during diagnosis
-- (auth_user_id stays NULL), then linked to an auth user by email on first login.
create table if not exists public.users (
  id                uuid primary key default gen_random_uuid(),
  auth_user_id      uuid unique references auth.users(id) on delete set null,
  email             text not null unique,
  name              text,
  role              text,
  seniority         text,
  years             text,
  company_type      text,
  region            text,
  income_band       text,
  goal              text,
  target            text,
  unfair_advantages text,
  status            user_status not null default 'lead',
  created_at        timestamptz not null default now()
);

-- diagnoses: the intake + the high-entropy bearer token for the pre-auth
-- /results/[token] page. answers is the raw validated intake payload.
create table if not exists public.diagnoses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users(id) on delete cascade,
  work_sample  text not null,
  answers      jsonb not null default '{}'::jsonb,
  result_token text not null unique,
  created_at   timestamptz not null default now()
);

-- cycles: one "WHERE AM I -> ... -> AM I MORE VALUABLE" loop. profile_snapshot
-- freezes the intake at decision time (the Outcome Graph log).
create table if not exists public.cycles (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users(id) on delete cascade,
  profile_snapshot jsonb,
  status           text not null default 'active',
  started_at       timestamptz not null default now(),
  created_at       timestamptz not null default now()
);

-- value_assessments: AI market-value read. Written pending_review; the user only
-- ever sees status='approved'. A 2nd approved row on a cycle is a re-rating.
create table if not exists public.value_assessments (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.users(id) on delete cascade,
  cycle_id          uuid references public.cycles(id) on delete cascade,
  value_low         numeric,
  value_mid         numeric,
  value_high        numeric,
  currency          text not null default 'USD',
  confidence        confidence_level,
  confidence_reason text,
  ai_exposure       numeric,
  trajectory        trajectory,
  capability_scores jsonb not null default '{}'::jsonb,
  gaps              jsonb not null default '[]'::jsonb,
  observation       text,
  inputs            jsonb not null default '[]'::jsonb,
  status            review_status not null default 'pending_review',
  created_at        timestamptz not null default now()
);

-- moves: the single highest-leverage move for a cycle. Written pending_review;
-- visible to the user only at status in ('approved','active','completed').
create table if not exists public.moves (
  id                    uuid primary key default gen_random_uuid(),
  cycle_id              uuid references public.cycles(id) on delete cascade,
  user_id               uuid not null references public.users(id) on delete cascade,
  title                 text not null,
  thesis                text,
  target_outcome        text,
  leverage_score        numeric,
  confidence            confidence_level,
  reasoning             text,
  deferred_alternatives jsonb not null default '[]'::jsonb,
  status                move_status not null default 'pending_review',
  assigned_at           timestamptz not null default now(),
  created_at            timestamptz not null default now()
);

-- predictions: the Trust System. A falsifiable prediction is logged with the move
-- and later graded honestly at re-rating (verdict + actual_* + learning).
create table if not exists public.predictions (
  id                     uuid primary key default gen_random_uuid(),
  cycle_id               uuid references public.cycles(id) on delete cascade,
  move_id                uuid references public.moves(id) on delete cascade,
  pred_capability_delta  jsonb,
  pred_value_delta       numeric,
  confidence             confidence_level,
  horizon_days           integer not null default 30,
  evaluated_at           timestamptz,
  actual_capability_delta jsonb,
  actual_value_delta     numeric,
  verdict                text,                  -- 'hit' | 'partial' | 'miss' (set at re-rating)
  learning               text,
  created_at             timestamptz not null default now()
);

-- plans: the 30-day plan, generated lazily once per cycle for a paid user.
create table if not exists public.plans (
  id                uuid primary key default gen_random_uuid(),
  cycle_id          uuid not null references public.cycles(id) on delete cascade,
  weekly_milestones jsonb not null default '[]'::jsonb,
  current_week      integer not null default 1,
  status            text not null default 'active',
  created_at        timestamptz not null default now(),
  unique (cycle_id)                              -- one plan per cycle (code reads maybeSingle by cycle_id)
);

-- submissions: weekly check-ins. AI feedback saved pending_review; user sees it
-- only after admin approval flips status to 'reviewed'. One per (cycle, week).
create table if not exists public.submissions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  cycle_id      uuid not null references public.cycles(id) on delete cascade,
  week          integer not null,
  artifact_text text,
  graded_score  integer,
  feedback      jsonb,
  status        submission_status not null default 'submitted',
  submitted_at  timestamptz not null default now(),
  reviewed_at   timestamptz,
  unique (cycle_id, week)
);

-- subscriptions: Stripe state mirror. Idempotent per (user, type).
create table if not exists public.subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.users(id) on delete cascade,
  type               subscription_type not null,
  status             subscription_status not null default 'active',
  stripe_customer_id text,
  stripe_sub_id      text,
  renews_at          timestamptz,
  canceled_at        timestamptz,
  created_at         timestamptz not null default now(),
  unique (user_id, type)
);

-- value_history: market-value over time. Appended at re-rating approval, with the
-- change attributed vs the prior approved value.
create table if not exists public.value_history (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users(id) on delete cascade,
  value_mid        numeric,
  confidence       confidence_level,
  attributed_delta numeric,
  date             date not null default current_date,
  created_at       timestamptz not null default now()
);

-- proof: verified before/after work portfolio.
-- !! INFERRED: this table is listed in the product schema but is not referenced
-- anywhere in the V1 application code, so its real columns are unknown. The shape
-- below is a best-effort placeholder. VERIFY/REPLACE against the live database
-- before relying on it. (The Progress page currently shows "Proof portfolio,
-- coming soon", so production may have only a bare table or none populated.)
create table if not exists public.proof (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  cycle_id      uuid references public.cycles(id) on delete cascade,
  submission_id uuid references public.submissions(id) on delete set null,
  title         text,
  before_text   text,
  after_text    text,
  artifact_url  text,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- INDEXES  (supporting the .eq/.in/.order access patterns in the app)
-- ----------------------------------------------------------------------------
create index if not exists idx_users_auth_user_id        on public.users(auth_user_id);
create index if not exists idx_diagnoses_user_id          on public.diagnoses(user_id);
create index if not exists idx_cycles_user_id             on public.cycles(user_id);
create index if not exists idx_value_assessments_cycle_id on public.value_assessments(cycle_id);
create index if not exists idx_value_assessments_user_id  on public.value_assessments(user_id);
create index if not exists idx_value_assessments_status   on public.value_assessments(status);
create index if not exists idx_moves_cycle_id             on public.moves(cycle_id);
create index if not exists idx_moves_user_id              on public.moves(user_id);
create index if not exists idx_moves_status               on public.moves(status);
create index if not exists idx_predictions_cycle_id       on public.predictions(cycle_id);
create index if not exists idx_predictions_move_id        on public.predictions(move_id);
create index if not exists idx_submissions_cycle_id       on public.submissions(cycle_id);
create index if not exists idx_submissions_user_id        on public.submissions(user_id);
create index if not exists idx_subscriptions_user_id      on public.subscriptions(user_id);
create index if not exists idx_subscriptions_stripe_sub   on public.subscriptions(stripe_sub_id);
create index if not exists idx_value_history_user_id      on public.value_history(user_id);
create index if not exists idx_value_history_date         on public.value_history(date);
create index if not exists idx_proof_user_id              on public.proof(user_id);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
-- Helpers (SECURITY DEFINER so the membership lookup is not itself blocked by RLS,
-- avoiding recursive-policy issues). They resolve the current auth user to the app
-- `users.id` set and the `cycles.id` set they own.

create or replace function public.current_app_user_ids()
  returns setof uuid
  language sql
  stable
  security definer
  set search_path = public
as $$
  select id from public.users where auth_user_id = auth.uid()
$$;

create or replace function public.current_app_cycle_ids()
  returns setof uuid
  language sql
  stable
  security definer
  set search_path = public
as $$
  select c.id
  from public.cycles c
  join public.users u on u.id = c.user_id
  where u.auth_user_id = auth.uid()
$$;

revoke all on function public.current_app_user_ids() from public;
revoke all on function public.current_app_cycle_ids() from public;
grant execute on function public.current_app_user_ids() to authenticated;
grant execute on function public.current_app_cycle_ids() to authenticated;

-- Enable RLS everywhere.
alter table public.users             enable row level security;
alter table public.diagnoses         enable row level security;
alter table public.cycles            enable row level security;
alter table public.value_assessments enable row level security;
alter table public.moves             enable row level security;
alter table public.predictions       enable row level security;
alter table public.plans             enable row level security;
alter table public.submissions       enable row level security;
alter table public.subscriptions     enable row level security;
alter table public.value_history     enable row level security;
alter table public.proof             enable row level security;

-- SELECT-only policies for end users. Service-role writes bypass RLS, so there are
-- intentionally NO write policies. diagnoses and cycles get NO user policy at all
-- (they are read pre-auth via the service role only).

drop policy if exists users_select_own on public.users;
create policy users_select_own on public.users
  for select to authenticated
  using (auth_user_id = auth.uid());

drop policy if exists value_assessments_select_own on public.value_assessments;
create policy value_assessments_select_own on public.value_assessments
  for select to authenticated
  using (
    status = 'approved'
    and user_id in (select public.current_app_user_ids())
  );

drop policy if exists moves_select_own on public.moves;
create policy moves_select_own on public.moves
  for select to authenticated
  using (
    status in ('approved', 'active', 'completed')
    and user_id in (select public.current_app_user_ids())
  );

drop policy if exists predictions_select_own on public.predictions;
create policy predictions_select_own on public.predictions
  for select to authenticated
  using (cycle_id in (select public.current_app_cycle_ids()));

drop policy if exists plans_select_own on public.plans;
create policy plans_select_own on public.plans
  for select to authenticated
  using (cycle_id in (select public.current_app_cycle_ids()));

drop policy if exists submissions_select_own on public.submissions;
create policy submissions_select_own on public.submissions
  for select to authenticated
  using (user_id in (select public.current_app_user_ids()));

drop policy if exists subscriptions_select_own on public.subscriptions;
create policy subscriptions_select_own on public.subscriptions
  for select to authenticated
  using (user_id in (select public.current_app_user_ids()));

drop policy if exists value_history_select_own on public.value_history;
create policy value_history_select_own on public.value_history
  for select to authenticated
  using (user_id in (select public.current_app_user_ids()));

drop policy if exists proof_select_own on public.proof;
create policy proof_select_own on public.proof
  for select to authenticated
  using (user_id in (select public.current_app_user_ids()));

commit;

-- ----------------------------------------------------------------------------
-- STORAGE BUCKETS
-- ----------------------------------------------------------------------------
-- Current state: the V1 app does NOT use Supabase Storage. Diagnosis and weekly
-- check-ins accept pasted text only ("file upload coming soon" in the UI), so
-- production has no buckets to reproduce here. This section is intentionally left
-- as commented-out scaffolding so applying this migration matches production
-- exactly (no buckets).
--
-- When artifact upload ships, enable a PRIVATE bucket and owner-scoped policies:
--
-- insert into storage.buckets (id, name, public)
-- values ('artifacts', 'artifacts', false)
-- on conflict (id) do nothing;
--
-- create policy "artifacts_read_own" on storage.objects
--   for select to authenticated
--   using (bucket_id = 'artifacts' and owner = auth.uid());
--
-- create policy "artifacts_insert_own" on storage.objects
--   for insert to authenticated
--   with check (bucket_id = 'artifacts' and owner = auth.uid());
-- ============================================================================
