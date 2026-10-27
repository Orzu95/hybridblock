# Hybridblock im Google Play Store

Vorlage für die Play Console. Was in [eckigen Klammern] steht, musst du selbst eintragen. Keine Rechtsberatung: Lass Datenschutzerklärung und Impressum vor dem Start einmal prüfen (z. B. über einen Generator wie eRecht24 oder eine Anwältin).

## 1. Vorher erledigen

- **Entwicklerkonto:** einmalig 25 $. Für neue private Konten verlangt Google einen geschlossenen Test mit mindestens 12 Testern über 14 Tage, bevor die App öffentlich gehen darf.
- **Datenschutzerklärung:** liegt unter `https://orzu95.github.io/hybridblock/privacypolicy.html`. Die gelben Platzhalter (Name, Anschrift, E-Mail) in `www/privacypolicy.html` ausfüllen.
- **Impressum:** Für eine öffentliche App mit Gewinnabsicht in Deutschland nötig. Kann auf derselben Seite stehen.
- **Konto löschen:** ist in der App unter Einstellungen → Datenschutz → Konto löschen. Google verlangt zusätzlich einen Weg ohne App: Die Datenschutzerklärung nennt dafür die Kontakt-E-Mail.
- **App-Format:** Für den Store wird ein Android App Bundle (.aab) gebraucht. Das kann der GitHub-Build zusätzlich zur APK erzeugen, sobald es so weit ist.

## 2. Store-Eintrag

- **Name:** Hybridblock
- **Kurzbeschreibung (80 Zeichen):** Kraft, Cardio, Ernährung und Gesundheit in einer App, mit Coach-Funktion.
- **Beschreibung (Vorschlag):**
  Hybridblock bringt alles unter ein Dach: Krafttraining mit Autoregulation, Laufen, Rad und jedes andere Cardio mit GPS und Live-Puls, Ernährung mit Barcode-Scanner und adaptivem Kalorienbedarf, dazu Schlaf, Ruhepuls und HRV von deiner Uhr.
  • Fertige Trainingspläne aus freien Quellen, geprüft gegen die Studienlage, oder dein eigener Plan
  • GPS-Aufzeichnung für über 40 Sportarten, Pulsgurt per Bluetooth, Sprachansagen, Pulszonen
  • Verbindet sich über Health Connect mit Zepp, Samsung Health, Garmin, Fitbit, Polar, Withings, Oura und mehr
  • Coach-Modus: Athleten einladen, Pläne schicken, Fortschritt sehen
  • Deutsch, Englisch, Russisch
- **Kategorie:** Gesundheit & Fitness

## 3. Health Connect: Begründung pro Berechtigung

In der Play Console unter „App-Inhalte → Health Connect“. Pro Datenart ein Satz:

| Berechtigung | Begründung |
|---|---|
| Schritte lesen | Zeigt die Tagesschritte und nutzt sie für den Kalorienbedarf und das Schrittziel. |
| Kalorien lesen | Ergänzt die Energiebilanz im Ernährungsteil. |
| Puls lesen | Zeigt Pulskurven und Pulszonen der Trainings und bewertet die Intensität. |
| Ruhepuls lesen | Berechnet die tägliche Trainingsbereitschaft und passt die Trainingsintensität an. |
| HRV lesen | Ergänzt die Trainingsbereitschaft. |
| Schlaf lesen | Ergänzt die Trainingsbereitschaft und zeigt den Schlafverlauf. |
| Gewicht lesen | Gewichtstrend für den adaptiven Kalorienbedarf. |
| VO₂max lesen | Fortschritt der Ausdauer im Verlauf. |
| Trainings lesen | Übernimmt Trainings der Uhr in den Trainingsplan und den Verlauf. |
| Distanz lesen | Zeigt die Strecke übernommener Trainings. |
| Trainings, Strecke, Distanz, Puls, Kalorien schreiben | Speichert in der App aufgezeichnete Trainings mit GPS-Strecke, damit sie auch in anderen Gesundheits-Apps erscheinen. |
| Verlaufsdaten lesen | Übernimmt beim ersten Verbinden die letzten 60 Tage für Trends. |

Alle übrigen Health-Connect-Berechtigungen des Plugins sind im Manifest entfernt.

## 4. Datensicherheit (Data safety)

- **Erhobene Daten:** Gesundheit und Fitness (Gesundheitsdaten, Fitnessdaten), Standort (genauer Standort, nur während einer Aufzeichnung), App-Aktivität (Eingaben in der App), Personenbezogen (Name bzw. Benutzername), Fotos (nur lokal, nicht erhoben).
- **Geteilt mit Dritten:** Nein. (Supabase ist Auftragsverarbeiter, zählt nicht als Weitergabe. Der Coach sieht Daten nur auf Wunsch des Nutzers.)
- **Verschlüsselt bei der Übertragung:** Ja (HTTPS).
- **Löschung möglich:** Ja, in der App und per E-Mail.
- **Zweck:** App-Funktionalität, Personalisierung. Nicht Werbung, nicht Analyse.

## 5. Vordergrund-Dienst „Standort“

Google fragt nach dem Grund für `FOREGROUND_SERVICE_LOCATION`. Vorschlag:
„Der Nutzer startet eine Trainingsaufzeichnung (z. B. Laufen oder Radfahren). Damit Strecke, Distanz und Tempo auch bei ausgeschaltetem Bildschirm erfasst werden, läuft während der Aufzeichnung ein Vordergrund-Dienst mit dauerhafter Benachrichtigung. Er endet, sobald der Nutzer das Training beendet.“ Dazu verlangt Google ein kurzes Video der Funktion.

## 6. Noch offen vor dem Start

- [ ] Platzhalter in der Datenschutzerklärung ausfüllen, Impressum ergänzen
- [ ] Kartenkacheln: Für viele Nutzer einen eigenen Kartendienst (z. B. MapTiler oder Stadia, beide mit Gratis-Kontingent) statt der OpenStreetMap-Server nutzen, deren Richtlinie keine großen Apps erlaubt
- [ ] Build als .aab, Upload-Schlüssel für Play App Signing
- [ ] Geschlossener Test mit 12 Testern über 14 Tage
