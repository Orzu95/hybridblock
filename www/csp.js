'use strict';
/* Hybridblock – Content-Security-Policy für die Web-Version (zusätzliche Schutzschicht gegen eingeschleusten Code).
   In der Android-App (Capacitor) nicht gesetzt, damit die native Brücke unberührt bleibt. Keine Inline-Skripte und keine onclick-Attribute im Projekt. */
(function () {
  try {
    const C = window.Capacitor;
    if (C && C.isNativePlatform && C.isNativePlatform()) return;
    const m = document.createElement('meta');
    m.httpEquiv = 'Content-Security-Policy';
    m.content =
      "default-src 'self'; script-src 'self'; worker-src 'self' blob:; child-src 'self' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:; " +
      "connect-src 'self' https://eumwznaujhcradwvsblw.supabase.co https://*.openfoodfacts.org https://exercise-dataset.com https://tiles.openfreemap.org https://*.openfreemap.org; media-src 'self' data: blob:; object-src 'none'; base-uri 'self'; form-action 'self'";
    document.head.appendChild(m);
  } catch (e) {}
})();
