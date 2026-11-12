-- Prüfbericht 12.11.: Rate-Limit für die Lebensmittelsuche, vollständige Kontolöschung.
create table if not exists public.food_search_hits (k text not null, minute timestamptz not null, n int not null default 1, primary key (k, minute));
alter table public.food_search_hits enable row level security;  -- keine Policies: nur service_role

create or replace function public.food_search_hit(p_key text, p_max int) returns boolean language plpgsql security definer set search_path = '' as $$
declare v_m timestamptz := date_trunc('minute', now()); v_c int; v_all int;
begin
  insert into public.food_search_hits as h (k, minute, n) values (left(p_key, 80), v_m, 1)
    on conflict (k, minute) do update set n = h.n + 1 returning h.n into v_c;
  insert into public.food_search_hits as h (k, minute, n) values ('*', v_m, 1)
    on conflict (k, minute) do update set n = h.n + 1 returning h.n into v_all;
  if random() < 0.02 then
    delete from public.food_search_hits where minute < now() - interval '1 hour';
    delete from public.food_search_cache where at < now() - interval '30 days';
  end if;
  return v_c <= p_max and v_all <= 600;
end $$;
revoke all on function public.food_search_hit(text, int) from public, anon, authenticated;
grant execute on function public.food_search_hit(text, int) to service_role;

-- Alle Daten eines Kontos löschen (Tabellen ohne Fremdschlüssel-Kaskade). Dateien im Bucket löscht die Edge Function.
create or replace function public.delete_user_data(p_uid uuid) returns void language plpgsql security definer set search_path = '' as $$
begin
  delete from public.ai_usage where user_id = p_uid;
  delete from public.appointments where athlete_id = p_uid or coach_id = p_uid;
  delete from public.athlete_notes where athlete_id = p_uid or coach_id = p_uid;
  delete from public.coach_inbox where athlete_id = p_uid or coach_id = p_uid;
  delete from public.coach_templates where coach_id = p_uid;
  delete from public.media_items where owner_id = p_uid;
  delete from public.messages where athlete_id = p_uid or coach_id = p_uid;
  delete from public.plan_ratings where user_id = p_uid;
  delete from public.plan_usage where user_id = p_uid;
  delete from public.plan_reviewers where user_id = p_uid;
  update public.plan_reports set reporter = null where reporter = p_uid;
  delete from public.shared_plans where owner_id = p_uid;
  delete from public.private_state where user_id = p_uid;
  delete from public.account_recovery where user_id = p_uid;
  delete from public.reset_tokens where user_id = p_uid;
  if to_regclass('public.push_tokens') is not null then execute 'delete from public.push_tokens where user_id = $1' using p_uid; end if;
end $$;
revoke all on function public.delete_user_data(uuid) from public, anon, authenticated;
grant execute on function public.delete_user_data(uuid) to service_role;
