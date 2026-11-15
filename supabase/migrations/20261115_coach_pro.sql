-- Coach-Paket: Coaching-Profil (Logo, Demo-Videos, automatische Nachrichten), Sprachnachrichten im Chat

-- 1. Coaching-Profil am Coach (Athleten lesen es über profiles_select / my_coach)
alter table public.profiles add column if not exists coach_cfg jsonb not null default '{}'::jsonb;
alter table public.profiles drop constraint if exists coach_cfg_size;
alter table public.profiles add constraint coach_cfg_size check (pg_column_size(coach_cfg) < 262144);

-- 2. Sprachnachrichten
alter table public.messages add column if not exists audio text;
alter table public.messages drop constraint if exists msg_has_content;
alter table public.messages add constraint msg_has_content
  check (coalesce(length(body), 0) > 0 or photo is not null or audio is not null);
update storage.buckets
  set allowed_mime_types = array['image/jpeg','image/png','image/webp','audio/webm','audio/ogg','audio/mp4','audio/aac','audio/mpeg']
  where id = 'chat';

-- 3. Demo-Videos des Coaches: Pfad <coach>/demo/…, lesbar für seine Athleten
drop policy if exists media_demo_read on storage.objects;
create policy media_demo_read on storage.objects as permissive for select to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[2] = 'demo'
         and (storage.foldername(name))[1] = (select public.my_coach())::text);

-- 4. Automatische Nachrichten (Text schreibt der Coach, Platzhalter {name})
create or replace function public.auto_txt(t text, n text) returns text
language sql immutable set search_path to '' as $$
  select nullif(btrim(replace(coalesce(t, ''), '{name}', coalesce(split_part(btrim(n), ' ', 1), ''))), '')
$$;

create or replace function public.coach_auto_run() returns integer
language plpgsql security definer set search_path to '' as $$
declare
  r record; n int := 0; d int; last date; txt text; due int;
begin
  for r in
    select p.id as ath, p.coach_id as coach, coalesce(nullif(s.summary->>'name', ''), p.display_name, p.username) as aname,
           c.coach_cfg->'auto' as a, s.summary as sm, pl.plan as plan
    from public.profiles p
    join public.profiles c on c.id = p.coach_id
    left join public.user_state s on s.user_id = p.id
    left join public.plans pl on pl.user_id = p.id
    where p.coach_id is not null and c.coach_cfg ? 'auto'
  loop
    -- a) länger nicht trainiert
    if coalesce((r.a->'idle'->>'on')::boolean, false) then
      d := greatest(2, least(30, coalesce((r.a->'idle'->>'days')::int, 4)));
      last := case when coalesce(r.sm->>'lastTrain', '') ~ '^\d{4}-\d{2}-\d{2}' then left(r.sm->>'lastTrain', 10)::date end;
      txt := public.auto_txt(r.a->'idle'->>'txt', r.aname);
      if last is not null and txt is not null and current_date - last >= d
         and not exists (select 1 from public.messages m where m.athlete_id = r.ath and m.coach_id = r.coach
                         and m.ref->>'auto' = 'idle' and m.created_at > now() - make_interval(days => d)) then
        insert into public.messages (coach_id, athlete_id, sender, body, ref)
        values (r.coach, r.ath, r.coach, txt, jsonb_build_object('auto', 'idle'));
        n := n + 1;
      end if;
    end if;
    -- b) Check-in fällig (Wochentag aus dem Plan, Mo = 0)
    if coalesce((r.a->'form'->>'on')::boolean, false) and jsonb_typeof(r.plan->'cform'->'q') = 'array'
       and jsonb_array_length(r.plan->'cform'->'q') > 0 then
      due := coalesce((r.plan->'cform'->>'day')::int, 6);
      txt := public.auto_txt(r.a->'form'->>'txt', r.aname);
      if extract(isodow from current_date)::int - 1 = due and txt is not null
         and coalesce(r.sm->>'formLast', '') < current_date::text
         and not exists (select 1 from public.messages m where m.athlete_id = r.ath and m.coach_id = r.coach
                         and m.ref->>'auto' = 'form' and m.created_at > now() - interval '20 hours') then
        insert into public.messages (coach_id, athlete_id, sender, body, ref)
        values (r.coach, r.ath, r.coach, txt, jsonb_build_object('auto', 'form'));
        n := n + 1;
      end if;
    end if;
  end loop;
  return n;
end $$;
revoke all on function public.coach_auto_run() from public, anon, authenticated;

-- Willkommensnachricht, sobald ein Athlet dem Coach zugeordnet wird
create or replace function public.coach_welcome() returns trigger
language plpgsql security definer set search_path to '' as $$
declare a jsonb; txt text;
begin
  if new.coach_id is not null and (tg_op = 'INSERT' or old.coach_id is distinct from new.coach_id) then
    select coach_cfg->'auto' into a from public.profiles where id = new.coach_id;
    if coalesce((a->'welcome'->>'on')::boolean, false) then
      txt := public.auto_txt(a->'welcome'->>'txt', coalesce(new.display_name, new.username));
      if txt is not null then
        insert into public.messages (coach_id, athlete_id, sender, body, ref)
        values (new.coach_id, new.id, new.coach_id, txt, jsonb_build_object('auto', 'welcome'));
      end if;
    end if;
  end if;
  return new;
end $$;
revoke all on function public.coach_welcome() from public, anon, authenticated;
drop trigger if exists profiles_welcome on public.profiles;
create trigger profiles_welcome after insert or update of coach_id on public.profiles
  for each row execute function public.coach_welcome();

-- Täglich 7:05 UTC (8:05 bzw. 9:05 Uhr in Deutschland)
create extension if not exists pg_cron;
select cron.unschedule(jobid) from cron.job where jobname = 'coach_auto';
select cron.schedule('coach_auto', '5 7 * * *', 'select public.coach_auto_run()');
