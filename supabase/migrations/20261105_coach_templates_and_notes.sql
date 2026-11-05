-- 7.1 Coach-Vorlagen und 7.7 Notizen pro Athlet (auf Projekt eumwznaujhcradwvsblw angewendet am 05.11.2026)
create table if not exists public.coach_templates (id uuid primary key default gen_random_uuid(), coach_id uuid not null default auth.uid() references auth.users(id) on delete cascade, name text not null, descr text, tags jsonb not null default '{}'::jsonb, plan jsonb not null, assigned jsonb not null default '[]'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
alter table public.coach_templates enable row level security;
create policy ct_select on public.coach_templates for select using (coach_id = (select auth.uid()));
create policy ct_insert on public.coach_templates for insert with check (coach_id = (select auth.uid()) and (select public.is_admin()));
create policy ct_update on public.coach_templates for update using (coach_id = (select auth.uid())) with check (coach_id = (select auth.uid()));
create policy ct_delete on public.coach_templates for delete using (coach_id = (select auth.uid()));
create table if not exists public.athlete_notes (id uuid primary key default gen_random_uuid(), coach_id uuid not null default auth.uid() references auth.users(id) on delete cascade, athlete_id uuid not null references auth.users(id) on delete cascade, body text not null, created_at timestamptz not null default now());
alter table public.athlete_notes enable row level security;
create policy an_select on public.athlete_notes for select using (coach_id = (select auth.uid()) and (select public.is_coach_of(athlete_id)));
create policy an_insert on public.athlete_notes for insert with check (coach_id = (select auth.uid()) and (select public.is_coach_of(athlete_id)));
create policy an_delete on public.athlete_notes for delete using (coach_id = (select auth.uid()));
