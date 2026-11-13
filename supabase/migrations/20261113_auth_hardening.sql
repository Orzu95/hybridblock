-- Aufräumliste Nr. 4 und 11 (13.11.2026): allgemeiner Rate-Limit-Zähler für die Edge Functions, Hash des Wiederherstellungscodes nicht mehr für Clients lesbar.
create table if not exists public.rate_hits (k text not null, bucket bigint not null, n int not null default 1, at timestamptz not null default now(), primary key (k, bucket));
alter table public.rate_hits enable row level security;  -- keine Policies: nur service_role

-- Zählt einen Treffer für p_key im laufenden Fenster (p_minutes) und meldet, ob das Limit noch eingehalten ist.
create or replace function public.rate_hit(p_key text, p_max int, p_minutes int default 1) returns boolean language plpgsql security definer set search_path = '' as $$
declare v_min int := greatest(coalesce(p_minutes, 1), 1); v_b bigint := floor(extract(epoch from now()) / (v_min * 60)); v_c int;
begin
  insert into public.rate_hits as h (k, bucket) values (left(p_key, 120) || '|' || v_min, v_b)
    on conflict (k, bucket) do update set n = h.n + 1 returning h.n into v_c;
  if random() < 0.02 then delete from public.rate_hits where at < now() - interval '2 days'; end if;
  return v_c <= p_max;
end $$;
revoke all on function public.rate_hit(text, int, int) from public, anon, authenticated;
grant execute on function public.rate_hit(text, int, int) to service_role;

-- account_recovery: Clients dürfen nur noch ihre E-Mail lesen, nicht den Hash (die App fragt den Status über hb-auth „rec_info“ ab).
revoke select on public.account_recovery from anon, authenticated;
grant select (user_id, email) on public.account_recovery to authenticated;

-- Aufräumliste Nr. 2: Rechte verengen. Nicht angemeldete Clients brauchen keine Tabellenrechte (sie nutzen nur Auth, Edge Functions und die RPC shared_plan_by_code);
-- TRUNCATE, REFERENCES und TRIGGER braucht kein Client. RLS bleibt unverändert die eigentliche Schranke.
revoke all on all tables in schema public from anon;
revoke truncate, references, trigger on all tables in schema public from authenticated;
alter default privileges for role postgres in schema public revoke all on tables from anon;
alter default privileges for role postgres in schema public revoke truncate, references, trigger on tables from authenticated;
