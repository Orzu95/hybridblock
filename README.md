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
