alter table public.lineups add column tactics jsonb not null default '{"ball":null,"arrows":[]}'::jsonb check (jsonb_typeof(tactics)='object' and octet_length(tactics::text)<=10000);
