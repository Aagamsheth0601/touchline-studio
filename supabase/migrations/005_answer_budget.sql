-- Global caps are atomic across server instances; no visitor/question history.
begin;
create table public.decision_answer_budget (bucket text primary key, requests integer not null);
alter table public.decision_answer_budget enable row level security;
revoke all on public.decision_answer_budget from anon, authenticated;
create function public.take_decision_answer_slot() returns boolean
language plpgsql security definer set search_path=public as $$
declare
 day_key text := 'day:' || to_char(now() at time zone 'UTC','YYYY-MM-DD');
 minute_key text := 'minute:' || to_char(now() at time zone 'UTC','YYYY-MM-DD HH24:MI');
 day_total integer;
 minute_total integer;
begin
 -- Every caller locks the day row first, serializing admission and avoiding races.
 insert into decision_answer_budget values(day_key,0) on conflict do nothing;
 select requests into day_total from decision_answer_budget where bucket=day_key for update;
 insert into decision_answer_budget values(minute_key,0) on conflict do nothing;
 select requests into minute_total from decision_answer_budget where bucket=minute_key for update;
 if day_total >= 100 or minute_total >= 5 then return false; end if;
 update decision_answer_budget set requests=requests+1 where bucket in(day_key,minute_key);
 delete from decision_answer_budget where bucket not in(day_key,minute_key);
 return true;
end; $$;
revoke all on function public.take_decision_answer_slot() from public,anon,authenticated;
grant execute on function public.take_decision_answer_slot() to service_role;
commit;
