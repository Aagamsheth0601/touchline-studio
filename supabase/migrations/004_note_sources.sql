-- Brief Touchline paraphrases, not official FIFA text or reviewed game outcomes.
begin;
alter table public.coaching_notes add column if not exists source_title text;
alter table public.coaching_notes add column if not exists source_url text;
alter table public.coaching_notes add column if not exists source_checked_on date;

update public.coaching_notes set content=v.content,source_title=v.source_title,source_url=v.source_url,
 source_checked_on='2026-10-13',embedding=null
from (values
('draw-defender','In a two-on-one, dribbling toward the defender can attract their attention and create room for your teammate. Look to pass beyond the defender as that space opens. Your supporting teammate must keep moving to offer a clear route for the ball and remain onside.','2v1 plus 1: Progressing through the central channel','https://www.fifatrainingcentre.com/media/native/practice/Talent_coach_16-6.pdf'),
('early-pass','Before releasing the ball in a two-on-one, consider whether you have drawn the defender toward you. The linked exercise encourages carrying first to create space for the supporting attacker. This is a practice constraint for learning timing, not a rule that every early pass is wrong.','2v1 plus 1: Progressing through the central channel','https://www.fifatrainingcentre.com/media/native/practice/Talent_coach_16-6.pdf'),
('delay-attack','A defender facing two attackers must choose between closing down the receiver and holding position. Watch the pass and the first touch before committing. A diagonal retreat can protect the goal while obstructing the pass across to the other attacker. Stay ready to adjust as the attack changes.','1v2 Attack v. Defence: Defending outnumbered','https://www.fifatrainingcentre.com/en/practice/talent-coach-programme/block-and-prevent/1v2-attack-v-defence-defending-outnumbered.php'),
('support-outlet','A short pass backward or sideways can help escape pressure when the supporting player has more space and a better view ahead. The first pass needs a next action: another teammate should offer an outlet, or the receiver may carry into space.','Passing the press','https://www.fifatrainingcentre.com/en/game/game-analysis/transition-to-attacking/passing-the-press.php'),
('forward-window','To play forward through a press, a teammate must offer an escape route beyond the immediate pressure. An advanced run can make a longer pass possible. Coordinate the run and the delivery so the receiver can use the space; the first passer can also move to become the next option.','Passing the press','https://www.fifatrainingcentre.com/en/game/game-analysis/transition-to-attacking/passing-the-press.php'),
('passing-lane','Check the route to a teammate, not only where they stand. Avoid sending the ball into a crowded or blocked path. Moving to a different angle can make a pass available; a controlled first touch away from pressure can also create room for the next pass.','John Peacock: Passing and receiving','https://www.fifatrainingcentre.com/en/practice/elite-sessions/in-possession/john-peacock-passing-and-receiving.php'),
('scan-before','Before receiving, look around for opponents, teammates and usable space. Receive with a body position that lets you see and play in several directions. Take the first touch away from approaching pressure when possible, then choose a pass suited to the space you have identified.','John Peacock: Passing and receiving','https://www.fifatrainingcentre.com/en/practice/elite-sessions/in-possession/john-peacock-passing-and-receiving.php'),
('context-choice','Beating a press has several possible solutions: quick combinations, a pass between opponents, a longer outlet or a run with the ball. The useful choice depends on the space and support available. There is no single passing pattern that fits every open-play situation.','Passing the press','https://www.fifatrainingcentre.com/en/game/game-analysis/transition-to-attacking/passing-the-press.php')
) as v(id,content,source_title,source_url) where coaching_notes.id=v.id;

-- PostgreSQL requires recreation when the returned columns change.
drop function public.match_coaching_notes(extensions.vector);
create function public.match_coaching_notes(query_embedding extensions.vector(384))
returns table(id text,title text,content text,scenario text,topic text,similarity double precision,source_title text,source_url text,source_checked_on date)
language sql stable security invoker set search_path=public,extensions as $$
 select n.id,n.title,n.content,n.scenario,n.topic,1-(n.embedding <=> query_embedding),n.source_title,n.source_url,n.source_checked_on
 from public.coaching_notes n where n.embedding is not null and n.model='gte-small-v1'
 order by n.embedding <=> query_embedding limit 3;
$$;
revoke all on function public.match_coaching_notes(extensions.vector) from public,anon,authenticated;
grant execute on function public.match_coaching_notes(extensions.vector) to service_role;
commit;
