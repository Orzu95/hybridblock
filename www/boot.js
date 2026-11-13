/* Hybridblock – letzter Baustein: nach dem Laden aller Module einmal neu zeichnen.
   Vorher zeichnet render() nicht (HB_READY in app.js), damit nie eine halb erweiterte Ansicht erscheint (z. B. zwei verschiedene „Essen“-Ansichten). */
'use strict';
HB_READY = true;
try { render(); } catch (e) { console.warn('boot render', e); }
