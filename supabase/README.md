# Supabase schema (version control)

The Sapient Atlas database lives in the Supabase project
`ddybrijphsummtkndvro` (`https://ddybrijphsummtkndvro.supabase.co`). The schema was
originally created by hand in the dashboard; this folder puts it under version
control.

## Files

- `migrations/001_initial_schema.sql` — the full schema: enums, tables, indexes,
  RLS + policies, and a (commented) storage section.

## Important: this migration is a reconstruction

It was rebuilt from the application code (every column, enum value, and access
pattern in `app/` and `lib/`), because this environment has no DB introspection
access. It is faithful to how the app uses the database but has **not** been diffed
byte-for-byte against the live schema.

Known soft spots to verify against production:
- the `proof` table (not referenced anywhere in code — columns are a best guess),
- exact column defaults and any columns the app never touches,
- the exact text of the live RLS policies.

## Verify against the live database

```bash
# one-time
brew install supabase/tap/supabase   # or see supabase.com/docs/guides/cli

supabase link --project-ref ddybrijphsummtkndvro
supabase db dump --schema public -f supabase/_live_dump.sql   # gitignored scratch
# then diff supabase/_live_dump.sql against migrations/001_initial_schema.sql
```

Reconcile any differences into `001_initial_schema.sql`, then delete the scratch
dump.

## Do NOT

- Do **not** run this against the old project `wxbhvhmvvbjcealbzspg` (a different,
  live product).
- Do **not** apply it to the live Sapient Atlas database to "sync" it — the live DB
  is the source of truth until the diff above confirms parity. This file is for
  version control and for standing up fresh environments.
