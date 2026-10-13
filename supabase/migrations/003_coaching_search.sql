-- Public practice content only. Existing lineup/account policies are untouched.
create extension if not exists vector with schema extensions;
create table if not exists public.coaching_notes (
 id text primary key, title text not null, content text not null,
 scenario text not null, topic text not null,
 embedding extensions.vector(384), model text not null default 'gte-small-v1'
);
alter table public.coaching_notes enable row level security;
revoke all on public.coaching_notes from anon, authenticated;
grant select, update on public.coaching_notes to service_role;

insert into public.coaching_notes (id,title,content,scenario,topic) values
('draw-defender','Draw the defender before releasing the ball','In a two-on-one, carrying toward a defender can make them commit to the ball carrier. That can open space for a teammate and improve the passing angle. Release the ball before getting close enough to be tackled. If the defender keeps delaying instead of committing, reassess rather than assuming the pass will open.','two-on-one','Carrying and commitment'),
('early-pass','The tradeoff of an early pass','An early pass gives a teammate time on the ball and avoids a tackle on the ball carrier. In a two-on-one, passing before the defender commits also lets that defender move across toward the receiver. Early is not always wrong: judge the passing lane, receiver movement and pressure.','two-on-one','Pass timing'),
('delay-attack','How a defender delays two attackers','When outnumbered, a defender may protect the route to goal and delay instead of charging at the ball. Staying between the attackers can make an immediate pass less useful. This buys time for recovery. Stepping toward the carrier may stop their advance but leave the other attacker free.','two-on-one','Defensive delay'),
('support-outlet','Use a supporting teammate to escape pressure','A nearby supporting player behind or beside the ball can offer an outlet when a defender closes down the carrier. A short pass may preserve possession but move the ball away from goal and allow the defence to recover. The receiver should look for the next available option.','press','Support and possession'),
('forward-window','Recognise a forward passing window','A forward pass can gain territory when a teammate moves into space outside a covering defender. The window may close as that defender shifts across. Pass timing and direction must match the run; a longer pass creates more opportunity for interception.','press','Forward passing'),
('passing-lane','Read the space between passer and receiver','An available teammate does not automatically mean an available pass. Check the path the ball must travel and whether a defender can reach it. An angled supporting position or a moving receiver can open a different lane. Recheck the lane as defenders move.','both','Passing lanes'),
('scan-before','Scan before receiving the ball','Look for nearby pressure, teammate positions and space before the ball arrives. This helps you decide whether to turn, pass quickly or protect possession. Keep checking because the picture changes while the ball travels. In the practice scenarios, notice both the pressing defender and the covering defender.','both','Scanning'),
('context-choice','Compare the risk and reward of a decision','A football choice depends on pressure, available space and the aim of the attack. Keeping the ball can be useful even when it does not gain territory. A forward option can create an opportunity while increasing interception risk. The authored replays illustrate possible outcomes, not a guarantee that one choice always succeeds.','both','Decision context')
on conflict (id) do nothing;

create or replace function public.match_coaching_notes(query_embedding extensions.vector(384))
returns table(id text,title text,content text,scenario text,topic text,similarity double precision)
language sql stable security invoker set search_path=public,extensions as $$
 select n.id,n.title,n.content,n.scenario,n.topic,1-(n.embedding <=> query_embedding)
 from public.coaching_notes n where n.embedding is not null and n.model='gte-small-v1'
 order by n.embedding <=> query_embedding limit 3;
$$;
revoke all on function public.match_coaching_notes(extensions.vector) from public,anon,authenticated;
grant execute on function public.match_coaching_notes(extensions.vector) to service_role;

-- A shared minute budget bounds model work for this public demo. It stores no queries or IPs.
create table if not exists public.coaching_search_budget (minute timestamptz primary key, requests integer not null);
alter table public.coaching_search_budget enable row level security;
revoke all on public.coaching_search_budget from anon,authenticated;
create or replace function public.take_coaching_search_slot() returns boolean
language plpgsql security definer set search_path=public as $$
declare total integer;
begin
 delete from public.coaching_search_budget where minute < date_trunc('minute',now()) - interval '2 minutes';
 insert into public.coaching_search_budget values(date_trunc('minute',now()),1)
 on conflict(minute) do update set requests=coaching_search_budget.requests+1 returning requests into total;
 return total<=30;
end; $$;
revoke all on function public.take_coaching_search_slot() from public,anon,authenticated;
grant execute on function public.take_coaching_search_slot() to service_role;
