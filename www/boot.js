/* Hybridblock – letzter Baustein: nach dem Laden aller Module einmal neu zeichnen.
   Frühere Module zeichnen beim Laden schon einmal; ohne diesen Schritt konnte eine ältere Ansicht stehen bleiben (z. B. zwei verschiedene „Essen“-Ansichten). */
'use strict';
try { render(); } catch (e) { console.warn('boot render', e); }
