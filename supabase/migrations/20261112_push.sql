-- Push-Benachrichtigungen: Token-Tabelle, Trigger über pg_net an die Edge Function push-send.
create extension if not exists pg_net with schema extensions;

create table if not exists public.push_tokens (
  token text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null default 'android',
  lang text,
  updated_at timestamptz not null default now()
);
create index if not exists push_tokens_user on public.push_tokens(user_id);
alter table public.push_tokens enable row level security;
create policy push_own_sel on public.push_tokens for select to authenticated using (user_id = auth.uid());
create policy push_own_ins on public.push_tokens for insert to authenticated with check (user_id = auth.uid());
create policy push_own_upd on public.push_tokens for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy push_own_del on public.push_tokens for delete to authenticated using (user_id = auth.uid());

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table if not exists private.push_cfg (id int primary key default 1 check (id = 1), secret text not null default encode(extensions.gen_random_bytes(24), 'hex'));
insert into private.push_cfg (id) values (1) on conflict do nothing;

create or replace function public.push_hook_ok(p_secret text) returns boolean language sql security definer set search_path = '' as $$
  select exists (select 1 from private.push_cfg where secret = p_secret);
$$;
revoke all on function public.push_hook_ok(text) from public, anon, authenticated;
grant execute on function public.push_hook_ok(text) to service_role;

create or replace function private.push_fire(p_event text, p_to uuid, p_from uuid, p_ref text) returns void language plpgsql security definer set search_path = '' as $$
declare v_secret text;
begin
  if p_to is null or p_to = p_from then return; end if;
  if not exists (select 1 from public.push_tokens where user_id = p_to) then return; end if;
  select secret into v_secret from private.push_cfg where id = 1;
  perform net.http_post(
    url := 'https://eumwznaujhcradwvsblw.supabase.co/functions/v1/push-send',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-hook-secret', v_secret),
    body := jsonb_build_object('event', p_event, 'to', p_to, 'from', p_from, 'ref', p_ref)
  );
exception when others then null;
end $$;

create or replace function private.push_on_message() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform private.push_fire('msg', case when new.sender = new.coach_id then new.athlete_id else new.coach_id end, new.sender, new.id::text);
  return new;
exception when others then return new;
end $$;
drop trigger if exists push_message on public.messages;
create trigger push_message after insert on public.messages for each row execute function private.push_on_message();

create or replace function private.push_on_plan() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.updated_by is not null and new.updated_by <> new.user_id then
    perform private.push_fire('plan', new.user_id, new.updated_by, null);
  end if;
  return new;
exception when others then return new;
end $$;
drop trigger if exists push_plan on public.plans;
create trigger push_plan after insert or update on public.plans for each row execute function private.push_on_plan();

create or replace function private.push_on_media() returns trigger language plpgsql security definer set search_path = '' as $$
declare v_coach uuid;
begin
  if tg_op = 'INSERT' then
    select coach_id into v_coach from public.profiles where id = new.owner_id;
    perform private.push_fire('form', v_coach, new.owner_id, new.id::text);
  elsif jsonb_typeof(new.comments) = 'array' and jsonb_array_length(new.comments) > (case when jsonb_typeof(old.comments) = 'array' then jsonb_array_length(old.comments) else 0 end) then
    select coach_id into v_coach from public.profiles where id = new.owner_id;
    perform private.push_fire('formc', new.owner_id, v_coach, new.id::text);
  end if;
  return new;
exception when others then return new;
end $$;
drop trigger if exists push_media on public.media_items;
create trigger push_media after insert or update of comments on public.media_items for each row execute function private.push_on_media();
