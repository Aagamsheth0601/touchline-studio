-- Run once in the SQL Editor of your own Supabase project.
create table public.lineups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 80),
  format integer not null check (format in (5,6,11)),
  formation text not null,
  profiles jsonb not null default '{}' check (jsonb_typeof(profiles) = 'object' and octet_length(profiles::text) <= 10000),
  created_at timestamptz not null default now(),
  constraint supported_formation check (
    (format=5 and formation in ('1-2-1','2-1-1','2-2')) or
    (format=6 and formation in ('2-2-1','1-3-1','2-1-2')) or
    (format=11 and formation in ('4-3-3','4-4-2','3-5-2'))
  )
);
create index lineups_user_created on public.lineups (user_id,created_at desc);
alter table public.lineups enable row level security;
revoke all on public.lineups from anon;
revoke all on public.lineups from authenticated;
grant select,insert on public.lineups to authenticated;
create policy "Read own lineups" on public.lineups for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own lineups" on public.lineups for insert to authenticated with check ((select auth.uid()) = user_id);
-- Snapshots are immutable in this first slice: no update/delete permissions.
