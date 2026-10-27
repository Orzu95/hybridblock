# Hybridblock

Eigene Trainings- und Ernährungs-App: 12-Wochen-Hybridplan mit Autoregulation, adaptiver Kalorienbedarf, Barcode-Scanner und Zepp-Gesundheitsdaten.

## Zwei Versionen, ein Code

- **Web-App** (`www/`): läuft im Browser und lässt sich auf dem Startbildschirm installieren. Zepp-Daten kommen per Export-Import.
- **Android-App** (`android/`): dieselbe App in einer Capacitor-Hülle. Liest Schritte, Puls, Ruhepuls, Schlaf, Gewicht, VO₂max und Workouts direkt aus Health Connect, wohin Zepp synchronisiert.

## Installieren

- **Android:** [Neueste APK herunterladen](https://github.com/Orzu95/hybridblock/releases/latest/download/Hybridblock.apk) und installieren (einmalig „Installation aus unbekannten Quellen“ für den Browser erlauben).
- **Web:** [orzu95.github.io/hybridblock](https://orzu95.github.io/hybridblock/) öffnen und „Zum Startbildschirm hinzufügen“.

## Bauen

**Automatisch (GitHub):** Jeder Push auf `main` baut die APK und legt sie unter *Releases → latest* ab. Die Web-App landet auf GitHub Pages (einmalig unter *Settings → Pages → Source: GitHub Actions* einschalten).

**Lokal:** Node 22 und Android Studio (JDK 21) installieren, dann:

```
npm ci
npx cap sync android
npx cap open android   # in Android Studio auf Run tippen
```

## Zepp verbinden (Android-App)

1. Health Connect installieren (bei Android 14+ schon dabei).
2. Zepp-App: Profil → Mit Drittanbietern verbinden → Health Connect einschalten.
3. Hybridblock: Einstellungen → Zepp über Health Connect → Verbinden.

## Signaturschlüssel

`android/app/hybridblock.jks.enc` ist der verschlüsselte Signaturschlüssel. Der Build entschlüsselt ihn mit dem Secret `HB_KEYSTORE_PASSWORD`, damit jede Version gleich signiert ist und Updates über die alte App laufen. Ohne Secret entsteht nur ein Probe-Build ohne Release.

## Konten, Coaching und Sprachen

- Backend: Supabase-Projekt `hybridblock` (Tabellen `profiles`, `invites`, `plans`, `user_state` mit Row Level Security, Edge Function `hb-auth` für Einladungscodes und Passwort-Reset).
- Anmeldung per Einladungscode: Der Coach erstellt im Team-Bereich einen Code, der Athlet löst ihn beim ersten Start ein und wählt Benutzername und Passwort.
- Pläne sind Daten (`S.plan`): Vorlage (Hybridblock, Ganzkörper 3×, leer) plus Anpassungen pro Übung. Der Coach bearbeitet sie im Plan-Editor, die App des Athleten holt sie beim Öffnen.
- Sprachen: Deutsch (Quelle), Englisch, Russisch. Alle Anzeige-Texte laufen durch `$t()`, Wörterbücher in `www/lang-en.js` und `www/lang-ru.js`.

## Pläne, Planung und Geräte

- **Einladung mit drei Wegen:** frei dem Athleten überlassen (er wählt Bibliothek, generierten Plan, eigenen Plan oder freies Training), nach fertigem Plan aus der Bibliothek, oder vom Coach erstellen lassen (Fragebogen mit Körperkarte für Beschwerden → Anfrage in `plan_requests` → Coach bekommt eine Benachrichtigung beim nächsten Abruf).
- **Plan-Bibliothek** (`library.js`): 14 Pläne aus freien Quellen (T Nation, jimwendler.com, GZCL, r/Fitness, r/bodyweightfitness, NHS, Helgerud 2007 …) mit Zielgruppe, Voraussetzungen, Evidenz-Bewertung A/B/C, Vor- und Nachteilen. Prozentangaben der Originale sind als RPE umgesetzt. Beschreibungen sind eigene Zusammenfassungen mit Quellenlink.
- **Empfehlung und Generator:** `recommendPlans()` bewertet Pläne nach Ziel, Erfahrung, Tagen, Zeit und Ort; `generatePlan()` baut aus denselben Angaben einen Plan und meidet Übungen, die markierte Beschwerdestellen belasten.
- **Training planen:** einzelne Trainings zusammenstellen, speichern und jederzeit starten, auch ohne festen Plan.
- **Mein Studio:** fehlende Geräte und ausgeschlossene Übungen; betroffene Übungen werden automatisch durch die nächste passende Alternative ersetzt. Bei jeder Übung unter „Varianten“: Alternativen, leichter, schwerer.
- **Planwechsel:** der alte Plan wird archiviert, Verlauf und Vorschläge bleiben erhalten.

## Verbindungen, GPS-Tracking, Datenschutz

- **Verbindungen** (`connect.js`): alle Uhren und Apps über Health Connect. Dropdown „Deine Uhr oder App“ mit Hinweis zum Einschalten, pro Datenart wählbare Quelle (Automatisch bevorzugt die gewählte Uhr), keine Doppelten bei Schlaf, Ruhepuls, Gewicht usw., doppelte Trainings (z. B. Uhr und Strava) werden über die Zeitüberlappung erkannt.
- **Live-Tracking** (`track.js`): über 40 Sportarten (`ACT_TYPES` in `data.js` mit GPS-Flag, Anzeige Pace/km/h/100 m/500 m, MET-Wert). Android: GPS im Vordergrund-Dienst (`@capacitor-community/background-geolocation`), Pulsgurt über Bluetooth (`@capacitor-community/bluetooth-le`, Standard-Profil Heart Rate), Sprachansagen (`@capacitor-community/text-to-speech`), Karte mit Leaflet und OpenStreetMap, Auto-Pause, Runden, km-Abschnitte, Zielzonen-Warnung, Intervalle aus dem Plan, GPX-Export, Wiederherstellung nach Absturz. Browser: GPS bei eingeschaltetem Bildschirm, Pulsgurt über Web Bluetooth.
- **Health Connect schreiben**: eigenes Kotlin-Plugin `HbHealthPlugin` (Sitzung, Strecke, Distanz, Kalorien, Puls).
- **Datenschutz** (`privacy.js`, `privacypolicy.html`): Einwilligung nach Art. 9 DSGVO vor der ersten Eingabe, Datenschutzerklärung DE/EN, Daten exportieren, lokal löschen, Konto löschen (Edge Function `hb-auth`, Aktion `delete`). Play-Store-Vorlage in `docs/PLAY_STORE.md`.
- **Probe-Builds** laufen auf dem Branch `dev` ohne Release, veröffentlicht wird nur von `main`.

## Frauen: Zyklus und Pläne mit Schwerpunkt Beine und Po

- **Zyklus** (`cycle.js`, nur bei Geschlecht weiblich, eigene Einwilligung): Periode und Beschwerden im Check-in auf „Heute“, starke Beschwerden senken die Bereitschaft und die RPE-Ziele, Hinweis mit Ersatz (lockeres Cardio, Mobility), gelerntes Muster pro Zyklustag ab 2 Zyklen, Prognose der nächsten Periode. Bleibt die Periode über 90 Tage aus (natürlicher Zyklus), Warnhinweis RED-S und kein weiteres Kaloriendefizit. Import aus Health Connect (`HbHealth.readCycle`). Cloud: getrennte Tabelle `private_state`, nur für die Person selbst; der Coach sieht Zyklusdaten nur mit Freigabe.
- **Schwerpunkt Beine und Po**: Generator und Empfehlung lesen `focus` (Standard bei Frauen `lower`). Bleibt Ganzkörper, Gesäß in jeder Einheit zuerst, Arme ohne eigene Sätze. Neue Bibliothekspläne `curves` (nach Strong Curves) und `lowerfb` (eigener Plan, 4× Ganzkörper), neue Übungen für Gesäß und Abduktion.

## Wochen-Check-in

`review.js`: Nach jeder Trainingswoche wertet die App Leistung (e1RM der Hauptübungen, ohne Deload- und Testwochen), Ermüdung (RPE über Ziel, Bereitschaft, Ruhepuls), Belastung (Dauer × RPE gegen die Vorwochen), Umsetzung und Gewichtstrend aus. Daraus entstehen feste Vorschläge mit Begründung und Quelle: +1 Satz für Schwerpunkt-Muskeln, Übung tauschen bei Stillstand, Deload vorziehen oder Volumen senken, Woche auf Erhaltungskalorien, weniger Trainingstage, Hinweise zu Belastung und RPE. Änderungen landen im Plan (`setAdj`, `volAdj`, `phases`, `dietBreak`, Übungstausch) und werden mit Konto hochgeladen. Der Coach sieht den Check-in in der Athletenansicht und kann Vorschläge für den Athleten übernehmen (`plan.revDecisions`). Schwellenwerte sind vorläufig (`REV_EV`) und werden durch die geprüften Wissens-Snippets ersetzt.
