-- Aufräumliste A5: Policies, die für die Rolle public galten, gelten nur noch für angemeldete Nutzer. Bedingungen bleiben unverändert.
do $$ declare r record; begin
  for r in select tablename, policyname from pg_policies where schemaname = 'public' and roles::text = '{public}' loop
    execute format('alter policy %I on public.%I to authenticated', r.policyname, r.tablename);
  end loop;
end $$;
