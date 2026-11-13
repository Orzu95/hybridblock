-- =====================================================================
-- Schema-Snapshot der Live-Datenbank, Stand 13.11.2026.
-- Nur zur Dokumentation und Prüfung, nicht zum Ausführen gedacht.
-- Änderungen laufen über supabase/migrations/.
-- Projekt: eumwznaujhcradwvsblw | Schemas: public, private
-- =====================================================================


-- =====================================================================
-- 1. EXTENSIONS
-- =====================================================================
-- http            (extensions)
-- pg_net          (extensions)
-- pg_stat_statements (extensions)
-- pgcrypto        (extensions)
-- plpgsql         (pg_catalog)
-- supabase_vault  (vault)
-- uuid-ossp       (extensions)


-- =====================================================================
-- 2. TABELLEN (26: 1x private, 25x public)
-- =====================================================================

create table private.push_cfg (
  id integer not null default 1,
  secret text not null default encode(gen_random_bytes(24), 'hex'::text),
  constraint push_cfg_pkey PRIMARY KEY (id),
  constraint push_cfg_id_check CHECK ((id = 1))
);
-- (kein RLS; Schema private ohne USAGE fuer anon/authenticated, keine Tabellen-Grants)

create table public.account_recovery (
  user_id uuid not null,
  code_hash text,
  email text,
  fails integer not null default 0,
  locked_until timestamp with time zone,
  updated_at timestamp with time zone not null default now(),
  constraint account_recovery_pkey PRIMARY KEY (user_id),
  constraint account_recovery_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);
alter table public.account_recovery enable row level security;

create table public.ai_usage (
  user_id uuid not null,
  day date not null default CURRENT_DATE,
  n integer not null default 0,
  constraint ai_usage_pkey PRIMARY KEY (user_id, day),
  constraint ai_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
alter table public.ai_usage enable row level security;

create table public.appointments (
  id uuid not null default gen_random_uuid(),
  coach_id uuid not null,
  athlete_id uuid not null,
  w integer,
  k text,
  title text,
  date date not null,
  start_t text not null,
  end_t text,
  place text,
  note text,
  status text not null default 'proposed'::text,
  proposed_by uuid not null default auth.uid(),
  reason text,
  history jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint appointments_pkey PRIMARY KEY (id),
  constraint appointments_status_check CHECK ((status = ANY (ARRAY['proposed'::text, 'confirmed'::text, 'declined'::text, 'cancelled'::text, 'done'::text]))),
  constraint appointments_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  constraint appointments_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
alter table public.appointments enable row level security;

create table public.athlete_notes (
  id uuid not null default gen_random_uuid(),
  coach_id uuid not null default auth.uid(),
  athlete_id uuid not null,
  body text not null,
  created_at timestamp with time zone not null default now(),
  constraint athlete_notes_pkey PRIMARY KEY (id),
  constraint athlete_notes_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  constraint athlete_notes_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
alter table public.athlete_notes enable row level security;

create table public.coach_inbox (
  id uuid not null default gen_random_uuid(),
  coach_id uuid not null default auth.uid(),
  athlete_id uuid not null,
  kind text not null,
  payload jsonb not null,
  created_at timestamp with time zone not null default now(),
  applied_at timestamp with time zone,
  constraint coach_inbox_pkey PRIMARY KEY (id),
  constraint coach_inbox_kind_check CHECK ((kind = ANY (ARRAY['sess'::text, 'act'::text]))),
  constraint coach_inbox_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  constraint coach_inbox_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
alter table public.coach_inbox enable row level security;

create table public.coach_templates (
  id uuid not null default gen_random_uuid(),
  coach_id uuid not null default auth.uid(),
  name text not null,
  descr text,
  tags jsonb not null default '{}'::jsonb,
  plan jsonb not null,
  assigned jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint coach_templates_pkey PRIMARY KEY (id),
  constraint coach_templates_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
alter table public.coach_templates enable row level security;

create table public.code_lookup_hits (
  ip text not null,
  minute timestamp with time zone not null,
  n integer not null default 0,
  constraint code_lookup_hits_pkey PRIMARY KEY (ip, minute)
);
alter table public.code_lookup_hits enable row level security;

create table public.food_search_cache (
  key text not null,
  data jsonb not null,
  at timestamp with time zone not null default now(),
  constraint food_search_cache_pkey PRIMARY KEY (key)
);
alter table public.food_search_cache enable row level security;

create table public.food_search_hits (
  k text not null,
  minute timestamp with time zone not null,
  n integer not null default 1,
  constraint food_search_hits_pkey PRIMARY KEY (k, minute)
);
alter table public.food_search_hits enable row level security;

create table public.invites (
  code text not null,
  coach_id uuid,
  role text not null default 'client'::text,
  name text,
  plan jsonb,
  settings jsonb,
  used_by uuid,
  used_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  expires_at timestamp with time zone not null default (now() + '30 days'::interval),
  mode text not null default 'plan'::text,
  constraint invites_pkey PRIMARY KEY (code),
  constraint invites_mode_chk CHECK ((mode = ANY (ARRAY['plan'::text, 'free'::text, 'library'::text, 'coach'::text]))),
  constraint invites_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'client'::text]))),
  constraint invites_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES profiles(id) ON DELETE CASCADE,
  constraint invites_used_by_fkey FOREIGN KEY (used_by) REFERENCES profiles(id) ON DELETE SET NULL
);
alter table public.invites enable row level security;

create table public.media_items (
  id uuid not null default gen_random_uuid(),
  owner_id uuid not null default auth.uid(),
  kind text not null,
  path text not null,
  meta jsonb not null default '{}'::jsonb,
  comments jsonb not null default '[]'::jsonb,
  seen_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  constraint media_items_pkey PRIMARY KEY (id),
  constraint media_items_kind_check CHECK ((kind = ANY (ARRAY['form'::text, 'checkin'::text]))),
  constraint media_items_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
alter table public.media_items enable row level security;

create table public.messages (
  id uuid not null default gen_random_uuid(),
  coach_id uuid not null,
  athlete_id uuid not null,
  sender uuid not null default auth.uid(),
  body text,
  photo text,
  ref jsonb,
  created_at timestamp with time zone not null default now(),
  read_at timestamp with time zone,
  constraint messages_pkey PRIMARY KEY (id),
  constraint msg_body_len CHECK (((body IS NULL) OR (length(body) <= 4000))),
  constraint msg_has_content CHECK (((COALESCE(length(body), 0) > 0) OR (photo IS NOT NULL))),
  constraint messages_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  constraint messages_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  constraint messages_sender_fkey FOREIGN KEY (sender) REFERENCES auth.users(id) ON DELETE CASCADE
);
alter table public.messages enable row level security;

create table public.operators (
  user_id uuid not null,
  created_at timestamp with time zone not null default now(),
  constraint operators_pkey PRIMARY KEY (user_id),
  constraint operators_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);
alter table public.operators enable row level security;

create table public.plan_ratings (
  plan_key text not null,
  user_id uuid not null default auth.uid(),
  stars smallint not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint plan_ratings_pkey PRIMARY KEY (plan_key, user_id),
  constraint plan_ratings_plan_key_check CHECK ((plan_key ~ '^(sp:[0-9a-f-]{36}|lib:[a-z0-9_]{1,40})$'::text)),
  constraint plan_ratings_stars_check CHECK (((stars >= 1) AND (stars <= 5))),
  constraint plan_ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
alter table public.plan_ratings enable row level security;

create table public.plan_reports (
  id uuid not null default gen_random_uuid(),
  plan_id uuid,
  reporter uuid default auth.uid(),
  reason text not null,
  details text,
  good_faith boolean not null default false,
  status text not null default 'open'::text,
  decision_note text,
  handled_by uuid,
  handled_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  plan_name text,
  constraint plan_reports_pkey PRIMARY KEY (id),
  constraint plan_reports_details_check CHECK ((char_length(details) <= 1000)),
  constraint plan_reports_reason_check CHECK ((reason = ANY (ARRAY['illegal'::text, 'dangerous'::text, 'copyright'::text, 'spam'::text, 'other'::text, 'appeal'::text]))),
  constraint plan_reports_status_check CHECK ((status = ANY (ARRAY['open'::text, 'dismissed'::text, 'actioned'::text, 'upheld'::text, 'reversed'::text]))),
  constraint plan_reports_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES shared_plans(id) ON DELETE SET NULL,
  constraint plan_reports_reporter_fkey FOREIGN KEY (reporter) REFERENCES auth.users(id) ON DELETE SET NULL
);
alter table public.plan_reports enable row level security;

create table public.plan_requests (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  coach_id uuid,
  intake jsonb not null,
  status text not null default 'open'::text,
  created_at timestamp with time zone not null default now(),
  done_at timestamp with time zone,
  constraint plan_requests_pkey PRIMARY KEY (id),
  constraint plan_requests_status_check CHECK ((status = ANY (ARRAY['open'::text, 'done'::text]))),
  constraint plan_requests_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES profiles(id) ON DELETE CASCADE,
  constraint plan_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);
alter table public.plan_requests enable row level security;

create table public.plan_reviewers (
  user_id uuid not null,
  constraint plan_reviewers_pkey PRIMARY KEY (user_id),
  constraint plan_reviewers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
alter table public.plan_reviewers enable row level security;

create table public.plan_usage (
  plan_key text not null,
  user_id uuid not null default auth.uid(),
  started_at timestamp with time zone not null default now(),
  last_seen date not null default CURRENT_DATE,
  constraint plan_usage_pkey PRIMARY KEY (plan_key, user_id),
  constraint plan_usage_plan_key_check CHECK ((plan_key ~ '^(sp:[0-9a-f-]{36}|lib:[a-z0-9_]{1,40})$'::text)),
  constraint plan_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
alter table public.plan_usage enable row level security;

create table public.plans (
  user_id uuid not null,
  plan jsonb not null,
  updated_at timestamp with time zone not null default now(),
  updated_by uuid,
  constraint plans_pkey PRIMARY KEY (user_id),
  constraint plans_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES profiles(id) ON DELETE SET NULL,
  constraint plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);
alter table public.plans enable row level security;

create table public.private_state (
  user_id uuid not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone not null default now(),
  constraint private_state_pkey PRIMARY KEY (user_id),
  constraint private_state_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);
alter table public.private_state enable row level security;

create table public.profiles (
  id uuid not null,
  username text not null,
  display_name text,
  role text not null default 'client'::text,
  coach_id uuid,
  lang text default 'de'::text,
  created_at timestamp with time zone not null default now(),
  constraint profiles_pkey PRIMARY KEY (id),
  constraint profiles_username_key UNIQUE (username),
  constraint profiles_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'client'::text]))),
  constraint profiles_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES profiles(id) ON DELETE SET NULL,
  constraint profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);
alter table public.profiles enable row level security;

create table public.push_tokens (
  token text not null,
  user_id uuid not null,
  platform text not null default 'android'::text,
  lang text,
  updated_at timestamp with time zone not null default now(),
  constraint push_tokens_pkey PRIMARY KEY (token),
  constraint push_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
alter table public.push_tokens enable row level security;

create table public.reset_tokens (
  token_hash text not null,
  user_id uuid not null,
  expires_at timestamp with time zone not null,
  used boolean not null default false,
  constraint reset_tokens_pkey PRIMARY KEY (token_hash),
  constraint reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);
alter table public.reset_tokens enable row level security;

create table public.shared_plans (
  id uuid not null default gen_random_uuid(),
  owner_id uuid not null default auth.uid(),
  name text not null,
  descr text,
  plan jsonb not null,
  meta jsonb not null default '{}'::jsonb,
  status text not null default 'private'::text,
  review_note text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  published_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  share_code text,
  copy_lock boolean not null default false,
  review_state text,
  hidden boolean not null default false,
  mod_note text,
  mod_at timestamp with time zone,
  mod_ground text,
  constraint shared_plans_pkey PRIMARY KEY (id),
  constraint shared_plans_share_code_key UNIQUE (share_code),
  constraint shared_plans_descr_check CHECK ((char_length(descr) <= 600)),
  constraint shared_plans_mod_ground_check CHECK ((mod_ground = ANY (ARRAY['illegal'::text, 'terms'::text]))),
  constraint shared_plans_name_check CHECK (((char_length(name) >= 1) AND (char_length(name) <= 80))),
  constraint shared_plans_plan_check CHECK ((octet_length((plan)::text) < 300000)),
  constraint shared_plans_review_state_check CHECK ((review_state = ANY (ARRAY['approved'::text, 'rejected'::text]))),
  constraint shared_plans_status_check CHECK ((status = ANY (ARRAY['private'::text, 'clients'::text, 'public'::text, 'submitted'::text, 'curated'::text]))),
  constraint sp_meta_grade CHECK ((((meta ->> 'grade'::text) IS NULL) OR ((meta ->> 'grade'::text) ~ '^[A-D]$'::text))),
  constraint shared_plans_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
alter table public.shared_plans enable row level security;

create table public.user_state (
  user_id uuid not null,
  state jsonb not null,
  summary jsonb,
  updated_at timestamp with time zone not null default now(),
  constraint user_state_pkey PRIMARY KEY (user_id),
  constraint user_state_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);
alter table public.user_state enable row level security;


-- =====================================================================
-- 3. INDIZES (ohne die von Constraints erzeugten)
-- =====================================================================
CREATE INDEX appt_ath_idx ON public.appointments USING btree (athlete_id, date);
CREATE INDEX appt_coach_idx ON public.appointments USING btree (coach_id, date);
CREATE INDEX athlete_notes_idx ON public.athlete_notes USING btree (coach_id, athlete_id, created_at DESC);
CREATE INDEX inbox_ath_idx ON public.coach_inbox USING btree (athlete_id) WHERE (applied_at IS NULL);
CREATE INDEX coach_templates_coach_idx ON public.coach_templates USING btree (coach_id);
CREATE INDEX invites_coach_idx ON public.invites USING btree (coach_id);
CREATE INDEX invites_used_by_idx ON public.invites USING btree (used_by);
CREATE INDEX media_items_owner ON public.media_items USING btree (owner_id, created_at DESC);
CREATE INDEX messages_pair_idx ON public.messages USING btree (coach_id, athlete_id, created_at DESC);
CREATE INDEX messages_unread_idx ON public.messages USING btree (read_at) WHERE (read_at IS NULL);
CREATE INDEX plan_reports_open ON public.plan_reports USING btree (status, created_at);
CREATE INDEX plan_requests_coach_idx ON public.plan_requests USING btree (coach_id);
CREATE INDEX plan_requests_user_idx ON public.plan_requests USING btree (user_id);
CREATE INDEX plans_updated_by_idx ON public.plans USING btree (updated_by);
CREATE INDEX profiles_coach_idx ON public.profiles USING btree (coach_id);
CREATE INDEX push_tokens_user ON public.push_tokens USING btree (user_id);
CREATE INDEX shared_plans_owner ON public.shared_plans USING btree (owner_id);
CREATE INDEX shared_plans_status ON public.shared_plans USING btree (status);


-- =====================================================================
-- 4. POLICIES (57, Schema public; Rolle wie in der DB: "public" = alle Rollen)
-- Tabellen mit RLS aber ohne Policy: code_lookup_hits, food_search_cache,
-- food_search_hits, reset_tokens (nur service_role / SECURITY DEFINER)
-- =====================================================================

create policy ar_select on public.account_recovery as PERMISSIVE for SELECT to public
  using ((user_id = auth.uid()));

create policy ai_usage_select on public.ai_usage as PERMISSIVE for SELECT to public
  using ((user_id = ( SELECT auth.uid() AS uid)));

create policy appt_delete on public.appointments as PERMISSIVE for DELETE to public
  using ((coach_id = ( SELECT auth.uid() AS uid)));

create policy appt_insert on public.appointments as PERMISSIVE for INSERT to public
  with check (((coach_id = ( SELECT auth.uid() AS uid)) AND ( SELECT is_coach_of(appointments.athlete_id) AS is_coach_of)));

create policy appt_select on public.appointments as PERMISSIVE for SELECT to public
  using ((((coach_id = ( SELECT auth.uid() AS uid)) AND ( SELECT is_coach_of(appointments.athlete_id) AS is_coach_of)) OR ((athlete_id = ( SELECT auth.uid() AS uid)) AND (coach_id = ( SELECT my_coach() AS my_coach)))));

create policy appt_update on public.appointments as PERMISSIVE for UPDATE to public
  using ((((coach_id = ( SELECT auth.uid() AS uid)) AND ( SELECT is_coach_of(appointments.athlete_id) AS is_coach_of)) OR ((athlete_id = ( SELECT auth.uid() AS uid)) AND (coach_id = ( SELECT my_coach() AS my_coach)))))
  with check ((((coach_id = ( SELECT auth.uid() AS uid)) AND ( SELECT is_coach_of(appointments.athlete_id) AS is_coach_of)) OR ((athlete_id = ( SELECT auth.uid() AS uid)) AND (coach_id = ( SELECT my_coach() AS my_coach)))));

create policy an_delete on public.athlete_notes as PERMISSIVE for DELETE to public
  using ((coach_id = ( SELECT auth.uid() AS uid)));

create policy an_insert on public.athlete_notes as PERMISSIVE for INSERT to public
  with check (((coach_id = ( SELECT auth.uid() AS uid)) AND ( SELECT is_coach_of(athlete_notes.athlete_id) AS is_coach_of)));

create policy an_select on public.athlete_notes as PERMISSIVE for SELECT to public
  using (((coach_id = ( SELECT auth.uid() AS uid)) AND ( SELECT is_coach_of(athlete_notes.athlete_id) AS is_coach_of)));

create policy inbox_insert on public.coach_inbox as PERMISSIVE for INSERT to public
  with check (((coach_id = ( SELECT auth.uid() AS uid)) AND ( SELECT is_coach_of(coach_inbox.athlete_id) AS is_coach_of)));

create policy inbox_select on public.coach_inbox as PERMISSIVE for SELECT to public
  using ((((coach_id = ( SELECT auth.uid() AS uid)) AND ( SELECT is_coach_of(coach_inbox.athlete_id) AS is_coach_of)) OR ((athlete_id = ( SELECT auth.uid() AS uid)) AND (coach_id = ( SELECT my_coach() AS my_coach)))));

create policy inbox_update on public.coach_inbox as PERMISSIVE for UPDATE to public
  using ((athlete_id = ( SELECT auth.uid() AS uid)))
  with check ((athlete_id = ( SELECT auth.uid() AS uid)));

create policy ct_delete on public.coach_templates as PERMISSIVE for DELETE to public
  using ((coach_id = ( SELECT auth.uid() AS uid)));

create policy ct_insert on public.coach_templates as PERMISSIVE for INSERT to public
  with check (((coach_id = ( SELECT auth.uid() AS uid)) AND ( SELECT is_admin() AS is_admin)));

create policy ct_select on public.coach_templates as PERMISSIVE for SELECT to public
  using ((coach_id = ( SELECT auth.uid() AS uid)));

create policy ct_update on public.coach_templates as PERMISSIVE for UPDATE to public
  using ((coach_id = ( SELECT auth.uid() AS uid)))
  with check ((coach_id = ( SELECT auth.uid() AS uid)));

create policy invites_delete on public.invites as PERMISSIVE for DELETE to authenticated
  using (((coach_id = ( SELECT auth.uid() AS uid)) AND (used_by IS NULL)));

create policy invites_insert on public.invites as PERMISSIVE for INSERT to authenticated
  with check (((coach_id = ( SELECT auth.uid() AS uid)) AND (role = 'client'::text) AND ( SELECT is_admin() AS is_admin)));

create policy invites_select on public.invites as PERMISSIVE for SELECT to authenticated
  using ((coach_id = ( SELECT auth.uid() AS uid)));

create policy media_items_coach_read on public.media_items as PERMISSIVE for SELECT to authenticated
  using (is_coach_of(owner_id));

create policy media_items_own_del on public.media_items as PERMISSIVE for DELETE to authenticated
  using ((owner_id = ( SELECT auth.uid() AS uid)));

create policy media_items_own_ins on public.media_items as PERMISSIVE for INSERT to authenticated
  with check (((owner_id = ( SELECT auth.uid() AS uid)) AND (path ~~ ((( SELECT auth.uid() AS uid))::text || '/coach/%'::text)) AND (comments = '[]'::jsonb)));

create policy media_items_own_sel on public.media_items as PERMISSIVE for SELECT to authenticated
  using ((owner_id = ( SELECT auth.uid() AS uid)));

create policy msg_insert on public.messages as PERMISSIVE for INSERT to public
  with check (((sender = ( SELECT auth.uid() AS uid)) AND (((coach_id = ( SELECT auth.uid() AS uid)) AND ( SELECT is_coach_of(messages.athlete_id) AS is_coach_of)) OR ((athlete_id = ( SELECT auth.uid() AS uid)) AND (coach_id = ( SELECT my_coach() AS my_coach))))));

create policy msg_select on public.messages as PERMISSIVE for SELECT to public
  using ((((coach_id = ( SELECT auth.uid() AS uid)) AND ( SELECT is_coach_of(messages.athlete_id) AS is_coach_of)) OR ((athlete_id = ( SELECT auth.uid() AS uid)) AND (coach_id = ( SELECT my_coach() AS my_coach)))));

create policy msg_update on public.messages as PERMISSIVE for UPDATE to public
  using (((sender <> ( SELECT auth.uid() AS uid)) AND (((coach_id = ( SELECT auth.uid() AS uid)) AND ( SELECT is_coach_of(messages.athlete_id) AS is_coach_of)) OR ((athlete_id = ( SELECT auth.uid() AS uid)) AND (coach_id = ( SELECT my_coach() AS my_coach))))))
  with check ((sender <> ( SELECT auth.uid() AS uid)));

create policy op_select on public.operators as PERMISSIVE for SELECT to public
  using ((user_id = auth.uid()));

create policy pr_own on public.plan_ratings as PERMISSIVE for ALL to authenticated
  using ((user_id = ( SELECT auth.uid() AS uid)))
  with check ((user_id = ( SELECT auth.uid() AS uid)));

create policy rep_insert on public.plan_reports as PERMISSIVE for INSERT to authenticated
  with check (((reporter = ( SELECT auth.uid() AS uid)) AND good_faith));

create policy rep_select on public.plan_reports as PERMISSIVE for SELECT to authenticated
  using (((reporter = ( SELECT auth.uid() AS uid)) OR ( SELECT is_reviewer() AS is_reviewer)));

create policy rep_update on public.plan_reports as PERMISSIVE for UPDATE to authenticated
  using (( SELECT is_reviewer() AS is_reviewer))
  with check (( SELECT is_reviewer() AS is_reviewer));

create policy req_insert on public.plan_requests as PERMISSIVE for INSERT to authenticated
  with check (((user_id = ( SELECT auth.uid() AS uid)) AND (NOT (coach_id IS DISTINCT FROM ( SELECT my_coach() AS my_coach)))));

create policy req_select on public.plan_requests as PERMISSIVE for SELECT to authenticated
  using (((user_id = ( SELECT auth.uid() AS uid)) OR (coach_id = ( SELECT auth.uid() AS uid))));

create policy req_update on public.plan_requests as PERMISSIVE for UPDATE to authenticated
  using (((user_id = ( SELECT auth.uid() AS uid)) OR (coach_id = ( SELECT auth.uid() AS uid))))
  with check (((user_id = ( SELECT auth.uid() AS uid)) OR (coach_id = ( SELECT auth.uid() AS uid))));

create policy plan_reviewers_self on public.plan_reviewers as PERMISSIVE for SELECT to authenticated
  using ((user_id = ( SELECT auth.uid() AS uid)));

create policy pu_del on public.plan_usage as PERMISSIVE for DELETE to authenticated
  using ((user_id = ( SELECT auth.uid() AS uid)));

create policy pu_sel on public.plan_usage as PERMISSIVE for SELECT to authenticated
  using ((user_id = ( SELECT auth.uid() AS uid)));

create policy plans_insert on public.plans as PERMISSIVE for INSERT to authenticated
  with check (((user_id = ( SELECT auth.uid() AS uid)) OR ( SELECT is_coach_of(plans.user_id) AS is_coach_of)));

create policy plans_select on public.plans as PERMISSIVE for SELECT to authenticated
  using (((user_id = ( SELECT auth.uid() AS uid)) OR ( SELECT is_coach_of(plans.user_id) AS is_coach_of)));

create policy plans_update on public.plans as PERMISSIVE for UPDATE to authenticated
  using (((user_id = ( SELECT auth.uid() AS uid)) OR ( SELECT is_coach_of(plans.user_id) AS is_coach_of)))
  with check (((user_id = ( SELECT auth.uid() AS uid)) OR ( SELECT is_coach_of(plans.user_id) AS is_coach_of)));

create policy ps_delete on public.private_state as PERMISSIVE for DELETE to public
  using ((user_id = auth.uid()));

create policy ps_insert on public.private_state as PERMISSIVE for INSERT to public
  with check ((user_id = auth.uid()));

create policy ps_select on public.private_state as PERMISSIVE for SELECT to public
  using ((user_id = auth.uid()));

create policy ps_update on public.private_state as PERMISSIVE for UPDATE to public
  using ((user_id = auth.uid()))
  with check ((user_id = auth.uid()));

create policy profiles_select on public.profiles as PERMISSIVE for SELECT to authenticated
  using (((id = ( SELECT auth.uid() AS uid)) OR (coach_id = ( SELECT auth.uid() AS uid)) OR (id = ( SELECT my_coach() AS my_coach))));

create policy profiles_update on public.profiles as PERMISSIVE for UPDATE to authenticated
  using ((id = ( SELECT auth.uid() AS uid)))
  with check ((id = ( SELECT auth.uid() AS uid)));

create policy push_own_del on public.push_tokens as PERMISSIVE for DELETE to authenticated
  using ((user_id = auth.uid()));

create policy push_own_ins on public.push_tokens as PERMISSIVE for INSERT to authenticated
  with check ((user_id = auth.uid()));

create policy push_own_sel on public.push_tokens as PERMISSIVE for SELECT to authenticated
  using ((user_id = auth.uid()));

create policy push_own_upd on public.push_tokens as PERMISSIVE for UPDATE to authenticated
  using ((user_id = auth.uid()))
  with check ((user_id = auth.uid()));

create policy sp_delete on public.shared_plans as PERMISSIVE for DELETE to authenticated
  using (((owner_id = ( SELECT auth.uid() AS uid)) AND (NOT hidden)));

create policy sp_insert on public.shared_plans as PERMISSIVE for INSERT to authenticated
  with check ((owner_id = ( SELECT auth.uid() AS uid)));

create policy sp_select on public.shared_plans as PERMISSIVE for SELECT to authenticated
  using (((owner_id = ( SELECT auth.uid() AS uid)) OR ((NOT hidden) AND ((status = ANY (ARRAY['public'::text, 'submitted'::text, 'curated'::text])) OR ((status = 'clients'::text) AND (owner_id = ( SELECT my_coach() AS my_coach))))) OR (( SELECT is_reviewer() AS is_reviewer) AND (status = ANY (ARRAY['public'::text, 'submitted'::text, 'curated'::text])))));

create policy sp_update on public.shared_plans as PERMISSIVE for UPDATE to authenticated
  using (((owner_id = ( SELECT auth.uid() AS uid)) OR (( SELECT is_reviewer() AS is_reviewer) AND (status = ANY (ARRAY['public'::text, 'submitted'::text, 'curated'::text])))))
  with check (((owner_id = ( SELECT auth.uid() AS uid)) OR (( SELECT is_reviewer() AS is_reviewer) AND (status = ANY (ARRAY['public'::text, 'submitted'::text, 'curated'::text])))));

create policy state_insert on public.user_state as PERMISSIVE for INSERT to authenticated
  with check ((user_id = ( SELECT auth.uid() AS uid)));

create policy state_select on public.user_state as PERMISSIVE for SELECT to authenticated
  using (((user_id = ( SELECT auth.uid() AS uid)) OR ( SELECT is_coach_of(user_state.user_id) AS is_coach_of)));

create policy state_update on public.user_state as PERMISSIVE for UPDATE to authenticated
  using ((user_id = ( SELECT auth.uid() AS uid)))
  with check ((user_id = ( SELECT auth.uid() AS uid)));


-- =====================================================================
-- 5. FUNKTIONEN (25: 4x private, 21x public) inkl. EXECUTE-Grants
-- =====================================================================

CREATE OR REPLACE FUNCTION private.push_fire(p_event text, p_to uuid, p_from uuid, p_ref text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
end $function$;
-- security: DEFINER; search_path ''
-- execute: anon=yes, authenticated=yes, service_role=yes, public=yes  (Schema private ohne USAGE -> faktisch nicht aufrufbar)

CREATE OR REPLACE FUNCTION private.push_on_media()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
end $function$;
-- security: DEFINER; search_path ''
-- execute: anon=yes, authenticated=yes, service_role=yes, public=yes  (Trigger-Funktion)

CREATE OR REPLACE FUNCTION private.push_on_message()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  perform private.push_fire('msg', case when new.sender = new.coach_id then new.athlete_id else new.coach_id end, new.sender, new.id::text);
  return new;
exception when others then return new;
end $function$;
-- security: DEFINER; search_path ''
-- execute: anon=yes, authenticated=yes, service_role=yes, public=yes  (Trigger-Funktion)

CREATE OR REPLACE FUNCTION private.push_on_plan()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if new.updated_by is not null and new.updated_by <> new.user_id then
    perform private.push_fire('plan', new.user_id, new.updated_by, null);
  end if;
  return new;
exception when others then return new;
end $function$;
-- security: DEFINER; search_path ''
-- execute: anon=yes, authenticated=yes, service_role=yes, public=yes  (Trigger-Funktion)

CREATE OR REPLACE FUNCTION public.ai_usage_hit(p_user uuid, p_limit integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v int;
begin
  insert into public.ai_usage(user_id, day, n) values (p_user, current_date, 1)
  on conflict (user_id, day) do update set n = public.ai_usage.n + 1 where public.ai_usage.n < p_limit
  returning n into v;
  return coalesce(v, -1);
end $function$;
-- security: DEFINER; search_path ''
-- execute: anon=no, authenticated=no, service_role=yes, public=no

CREATE OR REPLACE FUNCTION public.delete_user_data(p_uid uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
end $function$;
-- security: DEFINER; search_path ''
-- execute: anon=no, authenticated=no, service_role=yes, public=no

CREATE OR REPLACE FUNCTION public.food_search_hit(p_key text, p_max integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
end $function$;
-- security: DEFINER; search_path ''
-- execute: anon=no, authenticated=no, service_role=yes, public=no

CREATE OR REPLACE FUNCTION public.guard_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  if (select auth.role()) = 'authenticated' then
    new.role := old.role; new.coach_id := old.coach_id; new.username := old.username; new.id := old.id;
  end if;
  return new;
end $function$;
-- security: INVOKER; search_path ''
-- execute: anon=yes, authenticated=yes, service_role=yes, public=yes  (Trigger-Funktion)

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists(select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$function$;
-- security: DEFINER; search_path ''
-- execute: anon=no, authenticated=yes, service_role=yes, public=no

CREATE OR REPLACE FUNCTION public.is_coach_of(uid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists(select 1 from public.profiles p where p.id = uid and p.coach_id = (select auth.uid()));
$function$;
-- security: DEFINER; search_path ''
-- execute: anon=no, authenticated=yes, service_role=yes, public=no

CREATE OR REPLACE FUNCTION public.is_reviewer()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$ select exists (select 1 from public.plan_reviewers where user_id = (select auth.uid())) $function$;
-- security: DEFINER; search_path ''
-- execute: anon=yes, authenticated=yes, service_role=yes, public=yes

CREATE OR REPLACE FUNCTION public.media_comment(p_id uuid, p_t numeric, p_text text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare r public.media_items; me uuid := (select auth.uid()); c jsonb;
begin
  select * into r from public.media_items where id = p_id; if not found then raise exception 'not found'; end if;
  if r.owner_id <> me and not public.is_coach_of(r.owner_id) then raise exception 'forbidden'; end if;
  if length(coalesce(trim(p_text), '')) = 0 or length(p_text) > 1000 then raise exception 'text'; end if;
  c := jsonb_build_object('by', me, 'coach', r.owner_id <> me, 't', greatest(0, least(coalesce(p_t, 0), 600)), 'text', p_text, 'at', now());
  update public.media_items set comments = comments || jsonb_build_array(c), seen_at = case when r.owner_id <> me then now() else seen_at end where id = p_id;
  return c; end $function$;
-- security: DEFINER; search_path ''
-- execute: anon=no, authenticated=yes, service_role=yes, public=no

CREATE OR REPLACE FUNCTION public.media_seen(p_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  update media_items m set seen_at = now()
  where m.id = p_id and m.seen_at is null
    and exists (select 1 from profiles p where p.id = m.owner_id and p.coach_id = auth.uid());
end $function$;
-- security: DEFINER; search_path public (fest, aber nicht leer)
-- execute: anon=no, authenticated=yes, service_role=yes, public=no

CREATE OR REPLACE FUNCTION public.my_coach()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select coach_id from public.profiles where id = (select auth.uid());
$function$;
-- security: DEFINER; search_path ''
-- execute: anon=no, authenticated=yes, service_role=yes, public=no

CREATE OR REPLACE FUNCTION public.plan_ratings_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  new.user_id := (select auth.uid()); new.updated_at := now();
  if not exists (select 1 from public.plan_usage u where u.plan_key = new.plan_key and u.user_id = new.user_id and u.started_at < now() - interval '3 days') then raise exception 'Bewerten erst nach Nutzung'; end if;
  if new.plan_key like 'sp:%' and exists (select 1 from public.shared_plans s where s.id = substr(new.plan_key, 4)::uuid and s.owner_id = new.user_id) then raise exception 'Eigene Pläne kann man nicht bewerten'; end if;
  return new; end $function$;
-- security: DEFINER; search_path ''
-- execute: anon=no, authenticated=no, service_role=yes, public=no

CREATE OR REPLACE FUNCTION public.plan_reports_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare n int; me uuid := (select auth.uid()); ownp boolean; t timestamptz;
begin
  if tg_op = 'INSERT' then
    perform pg_advisory_xact_lock(hashtext(me::text));
    new.reporter := me; new.status := 'open'; new.decision_note := null; new.handled_by := null; new.handled_at := null;
    if char_length(coalesce(new.details, '')) < 10 then raise exception 'Begründung zu kurz'; end if;
    select name, owner_id = me, mod_at into new.plan_name, ownp, t from public.shared_plans where id = new.plan_id;
    if new.plan_name is null then raise exception 'Plan nicht gefunden'; end if;
    if new.reason = 'appeal' then
      if ownp then if t is null or t < now() - interval '6 months' then raise exception 'Einspruchsfrist abgelaufen'; end if;
      elsif not exists (select 1 from public.plan_reports r where r.plan_id = new.plan_id and r.reporter = me and r.status = 'dismissed' and r.handled_at > now() - interval '6 months') then raise exception 'Einspruch nicht möglich'; end if;
    end if;
    select count(*) into n from public.plan_reports where reporter = me and created_at > now() - interval '1 day'; if n >= 10 then raise exception 'Zu viele Meldungen heute'; end if;
    if exists (select 1 from public.plan_reports where reporter = me and plan_id = new.plan_id and status = 'open') then raise exception 'Meldung bereits offen'; end if;
  else
    -- Löschen von Plan oder Konto setzt plan_id/reporter auf null (FK) – das ist erlaubt, alles andere bleibt fest
    if new.plan_id is not null then new.plan_id := old.plan_id; end if;
    if new.reporter is not null then new.reporter := old.reporter; end if;
    new.reason := old.reason; new.details := old.details; new.created_at := old.created_at; new.good_faith := old.good_faith; new.plan_name := old.plan_name;
    if (new.status, new.decision_note) is distinct from (old.status, old.decision_note) then new.handled_by := me; new.handled_at := now();
    else new.handled_by := old.handled_by; new.handled_at := old.handled_at; end if;
  end if;
  return new; end $function$;
-- security: DEFINER; search_path ''
-- execute: anon=no, authenticated=no, service_role=yes, public=no  (Trigger-Funktion)

CREATE OR REPLACE FUNCTION public.plan_stats()
 RETURNS TABLE(plan_key text, n_ratings integer, avg_stars numeric, active integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  with k as (
    select 'sp:' || s.id::text as key from public.shared_plans s where not s.hidden and s.status in ('public','submitted','curated')
    union select distinct r.plan_key from public.plan_ratings r where r.plan_key like 'lib:%'
    union select distinct u.plan_key from public.plan_usage u where u.plan_key like 'lib:%'),
  a as (select k.key, (select count(*)::int from public.plan_ratings r where r.plan_key = k.key) n, (select avg(r.stars) from public.plan_ratings r where r.plan_key = k.key) av,
    (select count(*)::int from public.plan_usage u where u.plan_key = k.key and u.last_seen >= current_date - 30) act from k)
  select key, case when n >= 3 then n else null end, case when n >= 3 then round(av * 2) / 2 else null end, case when act >= 5 then act else null end from a $function$;
-- security: DEFINER; search_path ''
-- execute: anon=no, authenticated=yes, service_role=yes, public=no

CREATE OR REPLACE FUNCTION public.plan_usage_ping(p_key text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare me uuid := (select auth.uid());
begin
  if me is null or p_key !~ '^(sp:[0-9a-f-]{36}|lib:[a-z0-9_]{1,40})$' then return; end if;
  if p_key like 'sp:%' and not exists (select 1 from public.shared_plans s where s.id = substr(p_key, 4)::uuid and s.owner_id <> me and not s.hidden
       and (s.status in ('public','submitted','curated') or (s.status = 'clients' and s.owner_id = public.my_coach()))) then return; end if;
  insert into public.plan_usage(plan_key, user_id) values (p_key, me) on conflict (plan_key, user_id) do update set last_seen = current_date;
  if random() < 0.02 then
    delete from public.plan_usage where last_seen < current_date - 180;
    delete from public.plan_ratings r where r.plan_key like 'sp:%' and not exists (select 1 from public.shared_plans s where 'sp:' || s.id::text = r.plan_key);
    delete from public.plan_usage u where u.plan_key like 'sp:%' and not exists (select 1 from public.shared_plans s where 'sp:' || s.id::text = u.plan_key);
    delete from public.plan_reports where status <> 'open' and handled_at < now() - interval '12 months';
  end if;
end $function$;
-- security: DEFINER; search_path ''
-- execute: anon=no, authenticated=yes, service_role=yes, public=no

CREATE OR REPLACE FUNCTION public.push_hook_ok(p_secret text)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists (select 1 from private.push_cfg where secret = p_secret);
$function$;
-- security: DEFINER; search_path ''
-- execute: anon=no, authenticated=no, service_role=yes, public=no

CREATE OR REPLACE FUNCTION public.shared_plan_by_code(p_code text)
 RETURNS TABLE(id uuid, name text, descr text, plan jsonb, meta jsonb, status text, copy_lock boolean, review_state text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
#variable_conflict use_column
declare v_ip text; v_m timestamptz := date_trunc('minute', now()); v_c int;
begin
  v_ip := coalesce(split_part(coalesce((current_setting('request.headers', true))::json->>'x-forwarded-for', ''), ',', 1), '');
  if v_ip = '' then v_ip := coalesce((select auth.uid())::text, 'anon'); end if;
  insert into public.code_lookup_hits as h (ip, minute, n) values (v_ip, v_m, 1)
    on conflict (ip, minute) do update set n = h.n + 1 returning h.n into v_c;
  if v_c > 20 then raise exception 'Zu viele Versuche. Bitte warte eine Minute.' using errcode = 'P0001'; end if;
  if random() < 0.02 then delete from public.code_lookup_hits where minute < now() - interval '1 hour'; end if;
  return query select s.id, s.name, s.descr, s.plan, s.meta, s.status, s.copy_lock, s.review_state from public.shared_plans s
    where s.share_code = upper(trim(p_code)) and length(trim(p_code)) = 8 and not s.hidden;
end $function$;
-- security: DEFINER; search_path ''
-- execute: anon=yes, authenticated=yes, service_role=yes, public=no  (bewusst anonym, rate-limited 20/min/IP)

CREATE OR REPLACE FUNCTION public.shared_plan_share(p_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare c text; ab text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; b bytea; i int; tries int := 0;
begin
  select share_code into c from public.shared_plans where id = p_id and owner_id = (select auth.uid()) and not hidden;
  if not found then raise exception 'Plan nicht gefunden'; end if;
  if c is not null then return c; end if;
  perform set_config('hb.share', '1', true);
  loop
    b := extensions.gen_random_bytes(8); c := ''; for i in 0..7 loop c := c || substr(ab, 1 + (get_byte(b, i) % 32), 1); end loop;
    begin update public.shared_plans set share_code = c where id = p_id; perform set_config('hb.share', '', true); return c;
    exception when unique_violation then tries := tries + 1; if tries > 5 then raise; end if; end;
  end loop;
end $function$;
-- security: DEFINER; search_path ''
-- execute: anon=no, authenticated=yes, service_role=yes, public=no

CREATE OR REPLACE FUNCTION public.shared_plan_unshare(p_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin perform set_config('hb.share', '1', true); update public.shared_plans set share_code = null where id = p_id and owner_id = (select auth.uid()); perform set_config('hb.share', '', true); end $function$;
-- security: DEFINER; search_path ''
-- execute: anon=no, authenticated=yes, service_role=yes, public=no

CREATE OR REPLACE FUNCTION public.shared_plans_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare rev boolean := public.is_reviewer(); coach boolean; n int; sh boolean := coalesce(current_setting('hb.share', true), '') = '1'; dn text; me uuid := (select auth.uid()); own boolean;
begin
  if tg_op = 'UPDATE' then new.owner_id := old.owner_id; new.created_at := old.created_at; if not sh then new.share_code := old.share_code; end if; end if;
  if tg_op = 'INSERT' then new.share_code := null; new.hidden := false; new.mod_note := null; new.mod_at := null; new.mod_ground := null; new.published_at := null; end if;
  if sh and tg_op = 'UPDATE' then return new; end if;
  own := new.owner_id = me;
  perform pg_advisory_xact_lock(hashtext(new.owner_id::text));
  if not rev or own then
    if tg_op = 'INSERT' then new.review_note := null; new.reviewed_by := null; new.reviewed_at := null; new.review_state := null;
    else new.review_note := old.review_note; new.reviewed_by := old.reviewed_by; new.reviewed_at := old.reviewed_at; new.review_state := old.review_state;
      if new.status = 'submitted' and old.status <> 'submitted' then new.review_state := null; end if; end if;
    if new.status = 'curated' and (tg_op = 'INSERT' or old.status <> 'curated') then raise exception 'Nur Prüfer können Pläne freigeben'; end if;
    if tg_op = 'UPDATE' and old.status = 'curated' and new.status = 'curated'
       and (new.plan, new.name, new.descr, new.meta - 'by' - 'coach') is distinct from (old.plan, old.name, old.descr, old.meta - 'by' - 'coach') then new.status := 'submitted'; new.review_state := null; end if;
  else
    new.plan := old.plan; new.name := old.name; new.descr := old.descr; new.meta := old.meta; new.copy_lock := old.copy_lock;
    if (new.review_state, new.review_note, new.status) is distinct from (old.review_state, old.review_note, old.status) then new.reviewed_by := me; new.reviewed_at := now(); end if;
  end if;
  select role = 'admin', display_name into coach, dn from public.profiles where id = new.owner_id;
  new.meta := coalesce(new.meta, '{}'::jsonb) || jsonb_build_object('by', coalesce(dn, ''), 'coach', coalesce(coach, false));
  if new.status = 'clients' and not coalesce(coach, false) then raise exception 'Nur Coaches können Pläne für ihre Athleten freigeben'; end if;
  if not coalesce(coach, false) then new.copy_lock := false; end if;
  if new.status in ('public','submitted','curated') and not coalesce(coach, false) and not (rev and not own) then
    select count(*) into n from public.shared_plans where owner_id = new.owner_id and status in ('public','submitted','curated') and id <> new.id;
    if n >= 2 then raise exception 'Höchstens 2 veröffentlichte Pläne'; end if;
  end if;
  if tg_op = 'INSERT' then select count(*) into n from public.shared_plans where owner_id = new.owner_id; if n >= 100 then raise exception 'Zu viele gespeicherte Pläne'; end if; end if;
  if tg_op = 'UPDATE' then new.published_at := old.published_at; end if;
  if new.status in ('public','submitted','curated') and new.published_at is null then new.published_at := now(); end if;
  new.updated_at := now(); return new;
end $function$;
-- security: DEFINER; search_path ''
-- execute: anon=no, authenticated=no, service_role=yes, public=no  (Trigger-Funktion)

CREATE OR REPLACE FUNCTION public.shared_plans_mod_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if not public.is_reviewer() or new.owner_id = (select auth.uid()) then new.hidden := old.hidden; new.mod_note := old.mod_note; new.mod_at := old.mod_at; new.mod_ground := old.mod_ground;
  elsif (new.hidden, new.mod_note) is distinct from (old.hidden, old.mod_note) then new.mod_at := now(); end if;
  return new; end $function$;
-- security: DEFINER; search_path ''
-- execute: anon=no, authenticated=no, service_role=yes, public=no  (Trigger-Funktion)

CREATE OR REPLACE FUNCTION public.user_state_touch()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$ begin new.updated_at := now(); return new; end $function$;
-- security: INVOKER; search_path ''
-- execute: anon=yes, authenticated=yes, service_role=yes, public=yes  (Trigger-Funktion)


-- =====================================================================
-- 6. TRIGGER (9; auf auth.users hängen keine eigenen Trigger)
-- =====================================================================
CREATE TRIGGER push_media AFTER INSERT OR UPDATE OF comments ON public.media_items FOR EACH ROW EXECUTE FUNCTION private.push_on_media();
CREATE TRIGGER push_message AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION private.push_on_message();
CREATE TRIGGER plan_ratings_guard BEFORE INSERT OR UPDATE ON public.plan_ratings FOR EACH ROW EXECUTE FUNCTION plan_ratings_guard();
CREATE TRIGGER plan_reports_guard BEFORE INSERT OR UPDATE ON public.plan_reports FOR EACH ROW EXECUTE FUNCTION plan_reports_guard();
CREATE TRIGGER push_plan AFTER INSERT OR UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION private.push_on_plan();
CREATE TRIGGER profiles_guard BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION guard_profile();
CREATE TRIGGER shared_plans_guard BEFORE INSERT OR UPDATE ON public.shared_plans FOR EACH ROW EXECUTE FUNCTION shared_plans_guard();
CREATE TRIGGER shared_plans_mod_guard BEFORE UPDATE ON public.shared_plans FOR EACH ROW EXECUTE FUNCTION shared_plans_mod_guard();
CREATE TRIGGER user_state_touch BEFORE INSERT OR UPDATE ON public.user_state FOR EACH ROW EXECUTE FUNCTION user_state_touch();


-- =====================================================================
-- 7. GRANTS
-- =====================================================================
-- schema public: anon usage=true, authenticated usage=true
-- schema private: anon usage=false, authenticated usage=false
--
-- Tabellen-Grants (anon / authenticated):
-- ALL7 = DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE
-- ALL6 = wie ALL7, aber ohne UPDATE
-- private.push_cfg:          anon=[-]  authenticated=[-]
-- public.account_recovery:   anon=[ALL7] authenticated=[ALL7]
-- public.ai_usage:           anon=[ALL7] authenticated=[ALL7]
-- public.appointments:       anon=[ALL7] authenticated=[ALL7]
-- public.athlete_notes:      anon=[ALL7] authenticated=[ALL7]
-- public.coach_inbox:        anon=[ALL6] authenticated=[ALL6]
-- public.coach_templates:    anon=[ALL7] authenticated=[ALL7]
-- public.code_lookup_hits:   anon=[ALL7] authenticated=[ALL7]
-- public.food_search_cache:  anon=[ALL7] authenticated=[ALL7]
-- public.food_search_hits:   anon=[ALL7] authenticated=[ALL7]
-- public.invites:            anon=[ALL7] authenticated=[ALL7]
-- public.media_items:        anon=[ALL7] authenticated=[ALL7]
-- public.messages:           anon=[ALL6] authenticated=[ALL6]
-- public.operators:          anon=[ALL7] authenticated=[ALL7]
-- public.plan_ratings:       anon=[-]  authenticated=[DELETE,INSERT,SELECT,UPDATE]
-- public.plan_reports:       anon=[-]  authenticated=[DELETE,INSERT,SELECT,UPDATE]
-- public.plan_requests:      anon=[ALL7] authenticated=[ALL7]
-- public.plan_reviewers:     anon=[-]  authenticated=[DELETE,INSERT,SELECT,UPDATE]
-- public.plan_usage:         anon=[-]  authenticated=[DELETE,SELECT]
-- public.plans:              anon=[ALL7] authenticated=[ALL7]
-- public.private_state:      anon=[ALL7] authenticated=[ALL7]
-- public.profiles:           anon=[ALL7] authenticated=[ALL7]
-- public.push_tokens:        anon=[ALL7] authenticated=[ALL7]
-- public.reset_tokens:       anon=[ALL7] authenticated=[ALL7]
-- public.shared_plans:       anon=[-]  authenticated=[DELETE,INSERT,SELECT,UPDATE]
-- public.user_state:         anon=[ALL7] authenticated=[ALL7]
--
-- Spalten-Grants, die von den Tabellen-Grants abweichen (da coach_inbox/messages kein Tabellen-UPDATE haben):
-- public.coach_inbox.applied_at  authenticated: UPDATE
-- public.messages.read_at        authenticated: UPDATE


-- =====================================================================
-- 8. STORAGE
-- =====================================================================
-- bucket chat:  public=false, file_size_limit=3145728 (3 MB),  allowed_mime_types={image/jpeg,image/png,image/webp}
-- bucket media: public=false, file_size_limit=26214400 (25 MB), allowed_mime_types={video/webm,video/mp4,video/quicktime,image/jpeg}

create policy chat_obj_insert on storage.objects as PERMISSIVE for INSERT to authenticated
  with check (((bucket_id = 'chat'::text) AND ((((( SELECT auth.uid() AS uid))::text = (storage.foldername(name))[1]) AND ( SELECT is_coach_of(((storage.foldername(objects.name))[2])::uuid) AS is_coach_of)) OR (((( SELECT auth.uid() AS uid))::text = (storage.foldername(name))[2]) AND ((( SELECT my_coach() AS my_coach))::text = (storage.foldername(name))[1])))));

create policy chat_obj_select on storage.objects as PERMISSIVE for SELECT to authenticated
  using (((bucket_id = 'chat'::text) AND ((((( SELECT auth.uid() AS uid))::text = (storage.foldername(name))[1]) AND ( SELECT is_coach_of(((storage.foldername(objects.name))[2])::uuid) AS is_coach_of)) OR (((( SELECT auth.uid() AS uid))::text = (storage.foldername(name))[2]) AND ((( SELECT my_coach() AS my_coach))::text = (storage.foldername(name))[1])))));

create policy media_coach_read on storage.objects as PERMISSIVE for SELECT to authenticated
  using (((bucket_id = 'media'::text) AND ((storage.foldername(name))[2] = 'coach'::text) AND is_coach_of(((storage.foldername(name))[1])::uuid)));

create policy media_own_all on storage.objects as PERMISSIVE for ALL to authenticated
  using (((bucket_id = 'media'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)))
  with check (((bucket_id = 'media'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));


-- =====================================================================
-- AUFFÄLLIGKEITEN
-- =====================================================================
-- 1. Tabellen ohne RLS: private.push_cfg (enthält Hook-Secret). Abgesichert
--    über Schema-Rechte (kein USAGE für anon/authenticated, keine Tabellen-
--    Grants); Zugriff nur über SECURITY-DEFINER-Funktionen. Kein Befund
--    im public-Schema: alle 25 public-Tabellen haben RLS.
-- 2. RLS ohne Policies (ok, nur service_role / DEFINER-Funktionen):
--    code_lookup_hits, food_search_cache, food_search_hits, reset_tokens.
-- 3. Policies mit using (true): keine.
-- 4. SECURITY DEFINER ohne festen search_path: keine. Hinweis: media_seen
--    nutzt search_path=public statt leer (fest, aber weniger streng).
-- 5. SECURITY DEFINER, die anon ausführen darf (EXECUTE):
--    - public.shared_plan_by_code (bewusst, rate-limited, nur Plan per Code)
--    - public.is_reviewer (EXECUTE für PUBLIC; liefert für anon immer false)
--    - private.push_fire, push_on_media, push_on_message, push_on_plan
--      (EXECUTE für PUBLIC, aber Schema private ohne USAGE -> nicht
--      aufrufbar; sauberer wäre revoke execute ... from public)
-- 6. Policies für Rolle "public" statt "authenticated" (24 Policies):
--    account_recovery (ar_select), ai_usage (ai_usage_select),
--    appointments (appt_*), athlete_notes (an_*), coach_inbox (inbox_*),
--    coach_templates (ct_*), messages (msg_*), operators (op_select),
--    private_state (ps_*). Wirkung gering, da alle auf auth.uid() prüfen
--    (anon sieht nichts), aber inkonsistent zum Rest.
-- 7. Zu breite Tabellen-Grants: anon (und authenticated) haben auf 20
--    Tabellen vollen Zugriff inkl. TRUNCATE, TRIGGER, REFERENCES.
--    Nur RLS schützt; TRUNCATE ist per PostgREST nicht erreichbar, aber
--    ein revoke wäre Defense in Depth. Besonders sensibel: reset_tokens,
--    account_recovery, food_search_*, code_lookup_hits.
-- 8. account_recovery.code_hash ist für den eigenen Nutzer per SELECT-Policy
--    (ar_select) lesbar; reset_tokens hat keine Policy (gut).
-- 9. Storage: Buckets chat/media privat mit Größen- und MIME-Limit. Keine
--    UPDATE/DELETE-Policy auf bucket chat (Nutzer können Chatbilder nicht
--    selbst löschen). Policies casten Ordnernamen auf ::uuid (Fehler bei
--    ungültigem Pfad statt sauberem Deny).
