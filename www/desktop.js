/* Hybridblock – Desktop-Hülle (Bauplan D1):
   ab 768 px Seitenleiste links statt Leiste unten, ab 1200 px breite Seitenleiste mit Beschriftung und mehrspaltige Übersichten.
   Strg/Cmd + K oder „/“ öffnet die Suche (jetzt auch mit Athleten und Vorlagen). Logger, GPS und Scanner bleiben einspaltig. */
'use strict';
const DK_WIDE = ['heute', 'verlauf', 'lernen', 'mehr'];
const DK_SET = ['mehr', 'datenschutz', 'ops', 'wissen'];
function dkWide() {
  if (!DK_WIDE.includes(route.name)) return false;
  if (route.name === 'admin' && route.arg && (route.arg === 'vorlagen' || route.arg === 'profil')) return false;
  return true;
}
function dkSync() {
  const b = document.body;
  if (!b) return;
  b.classList.toggle('dk-wide', dkWide());
  b.dataset.v = route.name || '';
  const inn = document.querySelector('#tabbar .in');
  if (!inn) return;
  const f = inn.querySelector('.fab');
  if (f && !f.querySelector('.fab-l')) f.insertAdjacentHTML('beforeend', '<span class="fab-l">' + esc($t('Neu')) + '</span>');
  if (!inn.querySelector('.dk-foot'))
    inn.insertAdjacentHTML(
      'beforeend',
      '<div class="dk-foot"><button class="dk-l" type="button" data-act="searchOpen">' +
        ICON.search +
        '<span>' +
        esc($t('Suchen')) +
        '</span><kbd>' +
        (/Mac|iPhone|iPad/.test(navigator.platform || '') ? '⌘K' : 'Strg K') +
        '</kbd></button><a class="dk-l" href="#mehr" id="dk-set">' +
        ICON.gear +
        '<span>' +
        esc($t('Einstellungen')) +
        '</span></a></div>'
    );
  const s = document.getElementById('dk-set');
  if (s) s.classList.toggle('on', DK_SET.includes(route.name));
}
hbWrap('render', 'desktop', function (__next) {
  const r = __next.apply(this, Array.prototype.slice.call(arguments, 1));
  queueMicrotask(() => {
    try {
      dkSync();
    } catch (e) {
      logErr('desktop:sync', e, 1);
    }
  });
  return r;
});

/* Suche: Athleten und Vorlagen für Coaches */
hbFilter('srIndex', 'desktop', function (out) {
  if (typeof isAdmin !== 'function' || !isAdmin()) return out;
  (ADMIN.clients || []).forEach(c =>
    out.push({
      g: $t('Athlet'),
      t: cname(c),
      k: (c.username || '') + ' ' + (c.display_name || '') + ' athlet athlete спортсмен',
      go: () => {
        closeSheet();
        location.hash = '#admin/' + c.id;
      }
    })
  );
  (ADMIN.tpls || []).forEach(t =>
    out.push({
      g: $t('Vorlage'),
      t: t.name,
      k: 'vorlage template шаблон ' + ((t.tags || {}).folder || ''),
      go: () => {
        closeSheet();
        location.hash = '#plan/tpl:' + t.id;
      }
    })
  );
  return out;
});

/* Tastatur */
const dkTyping = el => el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === 'k' || e.key === 'K')) {
    e.preventDefault();
    searchOpen();
    return;
  }
  if (e.key === '/' && !e.ctrlKey && !e.metaKey && !dkTyping(e.target) && document.getElementById('sheet').hidden) {
    e.preventDefault();
    searchOpen();
    return;
  }
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    const rows = Array.from(document.querySelectorAll('#sr-list .evrow'));
    if (!rows.length) return;
    const i = rows.indexOf(document.activeElement);
    if (e.target.id === 'sr-q' && e.key === 'ArrowDown') {
      e.preventDefault();
      rows[0].focus();
    } else if (i >= 0) {
      e.preventDefault();
      if (e.key === 'ArrowDown') (rows[i + 1] || rows[i]).focus();
      else if (i === 0) document.getElementById('sr-q').focus();
      else rows[i - 1].focus();
    }
  }
});
