NOCH NICHT ANGEWENDET – Supabase-Bestätigung am 09.11. automatisch abgebrochen.
Inhalt (Migration community_hardening, SQL in der Sitzung vom 09.11.):
- check meta.grade ~ ^[A-D]$, Spalte mod_ground
- shared_plans_guard neu: INSERT setzt hidden/mod_*/published_at zurück; Änderung an name/descr/meta/plan eines kuratierten Plans → submitted;
  Prüfer können fremde Inhalte nicht ändern, reviewed_by/at serverseitig; meta.by/coach aus profiles; published_at serverseitig; Advisory-Lock gegen parallele Limits
- mod_guard: Besitzer kann nie mod_* ändern; sp_delete nur wenn nicht ausgeblendet
- shared_plan_share mit gen_random_bytes
- plan_reports: plan_id/reporter ON DELETE SET NULL, plan_name-Snapshot, Status upheld/reversed, Begründung ≥ 10 Zeichen, Einspruch Besitzer (6 Monate) oder Meldender nach Zurückweisung
- plan_usage nur noch über RPC plan_usage_ping (Datum serverseitig, nur sichtbare fremde Pläne), Aufbewahrung 180 Tage, Bereinigung verwaister Bewertungen, Meldungen 12 Monate
- Bewerten erst nach 3 Tagen Nutzung; plan_stats: Ø ab 3 Bewertungen (auf 0,5 gerundet), aktive Nutzer ab 5, nicht mehr für anon
- revoke truncate/trigger/references; anon ohne Tabellenrechte
