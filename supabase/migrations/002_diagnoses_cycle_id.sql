-- 002_diagnoses_cycle_id.sql
-- Attribution fix: link each diagnosis to its exact cycle (the read it produced), so the
-- user dashboard and admin queue derive per-diagnosis status from the right cycle instead
-- of relying on created_at time-pairing. Additive and non-destructive.
--
-- Apply this to the live database BEFORE deploying the code that writes/reads
-- diagnoses.cycle_id. It is safe to run ahead of the deploy: the currently-deployed code
-- never references this column.

-- 1. Nullable FK to cycles. ON DELETE SET NULL — never cascade-delete a diagnosis if its
--    cycle is removed; a null cycle_id falls back to runtime time-pairing.
alter table public.diagnoses
  add column if not exists cycle_id uuid references public.cycles(id) on delete set null;

-- 2. Index for cycle_id lookups / FK hygiene.
create index if not exists idx_diagnoses_cycle_id on public.diagnoses(cycle_id);

-- 3. Conservative backfill: only where it is unambiguous — the user has exactly one cycle.
--    Multi-cycle users are intentionally left null (the app's runtime fallback resolves them
--    by closest created_at; we never guess a pairing in the migration).
update public.diagnoses d
set cycle_id = c.id
from public.cycles c
where d.cycle_id is null
  and c.user_id = d.user_id
  and (select count(*) from public.cycles c2 where c2.user_id = d.user_id) = 1;

-- RLS: unchanged. `diagnoses` has RLS enabled with no user policies (service-role access
-- only); a nullable column + FK changes no policy.
