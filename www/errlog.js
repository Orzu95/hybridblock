/* Hybridblock – Fehlerprotokoll. Sammelt Fehler nur auf diesem Gerät (nichts wird gesendet): unbehandelte Fehler, abgelehnte Promises
   und Stellen, die Fehler bisher still verschluckt haben. Einsehbar unter Datenschutz → Speicher; hilft beim Melden von Problemen.
   logErr(ctx, e, quiet): quiet = erwartbare Fehler (kein console.warn, Netzwerk-Aussetzer werden übersprungen). */
'use strict';
const ERRLOG = { list: [], t: null, max: 40 };
try {
  ERRLOG.list = JSON.parse(localStorage.getItem('hb_errlog') || '[]') || [];
} catch (e) {
  ERRLOG.list = [];
}
function logErr(ctx, e, quiet) {
  try {
    const msg = String((e && (e.message || e.error || e)) || 'unbekannt').slice(0, 300);
    if (quiet && /not_logged_in|AbortError|aborted|Failed to fetch|NetworkError|Load failed|HTTP 40[13]|QuotaExceeded/i.test(msg + ' ' + ((e && e.name) || '')))
      return;
    if (!quiet) console.warn('[' + ctx + ']', e);
    const key = ctx + '|' + msg,
      now = new Date().toISOString();
    const hit = ERRLOG.list.find(x => x.k === key);
    if (hit) {
      hit.n++;
      hit.at = now;
    } else {
      ERRLOG.list.push({
        k: key,
        ctx,
        msg,
        st: String((e && e.stack) || '')
          .split('\n')
          .slice(1, 4)
          .map(s => s.trim().replace(/https?:\/\/[^/]+\//, ''))
          .join(' | ')
          .slice(0, 400),
        at: now,
        n: 1
      });
      if (ERRLOG.list.length > ERRLOG.max) ERRLOG.list.shift();
    }
    clearTimeout(ERRLOG.t);
    ERRLOG.t = setTimeout(() => {
      try {
        localStorage.setItem('hb_errlog', JSON.stringify(ERRLOG.list));
      } catch (x) {
        /* Speicher voll */
      }
    }, 1500);
  } catch (x) {
    /* das Protokoll darf nie selbst Fehler werfen */
  }
}
window.addEventListener('error', ev => logErr('window', ev.error || ev.message));
window.addEventListener('unhandledrejection', ev => logErr('promise', ev.reason));
function errLogText() {
  return ERRLOG.list
    .slice()
    .reverse()
    .map(x => x.at.slice(0, 16).replace('T', ' ') + '  ' + x.ctx + '  ×' + x.n + '\n' + x.msg + (x.st ? '\n' + x.st : ''))
    .join('\n\n');
}
function errLogCard() {
  const n = ERRLOG.list.length;
  if (typeof VIEW !== 'undefined' && VIEW) return '';
  return (
    '<div class="card" id="errcard"><h2>' +
    $t('Fehlerprotokoll') +
    '</h2><p class="small muted" style="margin:4px 0 0">' +
    (n
      ? $tf(
          '{n} Einträge auf diesem Gerät. Es wird nichts gesendet. Wenn etwas nicht funktioniert, kopiere das Protokoll und schick es deinem Coach oder dem Support.',
          { n }
        )
      : $t('Keine Fehler aufgezeichnet. Das Protokoll bleibt auf diesem Gerät, es wird nichts gesendet.')) +
    '</p>' +
    (n
      ? '<details style="margin-top:8px"><summary class="small">' +
        $t('Anzeigen') +
        '</summary><pre class="small" style="white-space:pre-wrap;overflow-wrap:anywhere;margin:8px 0 0;max-height:260px;overflow:auto">' +
        esc(errLogText()) +
        '</pre></details><div class="row" style="margin-top:10px;gap:8px"><div class="grow"></div><button class="btn sm" style="background:var(--fog)" data-act="errClear" type="button">' +
        $t('Leeren') +
        '</button><button class="btn sm" data-act="errCopy" type="button">' +
        $t('Kopieren') +
        '</button></div>'
      : '') +
    '</div>'
  );
}
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-act]');
  if (!b) return;
  if (b.dataset.act === 'errClear') {
    ERRLOG.list = [];
    try {
      localStorage.removeItem('hb_errlog');
    } catch (x) {
      /* egal */
    }
    render();
  } else if (b.dataset.act === 'errCopy') {
    const t = 'Hybridblock ' + (typeof APP_VERSION !== 'undefined' ? APP_VERSION : '') + ' · ' + navigator.userAgent + '\n\n' + errLogText();
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(
      () => toast($t('Kopiert')),
      () => toast($t('Kopieren nicht möglich'))
    );
  }
});
