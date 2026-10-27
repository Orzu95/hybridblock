/* Hybridblock – Sprachen. Deutsch ist die Quellsprache: alle Anzeige-Texte laufen durch $t(), die Wörterbücher
   (lang-en.js, lang-ru.js) übersetzen Text-Segmente, auch innerhalb von HTML-Bausteinen. Gespeicherte Daten bleiben sprachneutral. */
'use strict';
const LANGS = ['de', 'en', 'ru'];
let LANG = 'de'; try { const l = localStorage.getItem('hb_lang'); if (LANGS.includes(l)) LANG = l; else if (!localStorage.getItem('hb_state_v1')) { const nav = (navigator.language || 'de').slice(0, 2); if (nav === 'ru' || nav === 'en') LANG = nav; } } catch (e) {}
document.documentElement.lang = LANG;
const LOCALE = { de: 'de-DE', en: 'en-GB', ru: 'ru-RU' }[LANG];
const I18N = { en: {}, ru: {} };
function $tx(x) { const D = I18N[LANG]; const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(x); if (!m[2]) return x; const v = D[m[2]]; return v != null ? m[1] + v + m[3] : x; }
function $t(s) { if (LANG === 'de' || typeof s !== 'string' || !s) return s; const D = I18N[LANG]; if (!D) return s; if (D[s] != null) return D[s];
  let out;
  if (s.indexOf('<') < 0 && s.indexOf('>') < 0) out = /="|"\s/.test(s) ? s : $tx(s);
  else out = s.replace(/(^|>)([^<>]+)(?=<|$)/g, (m0, p, x) => (p === '' && /=\s*"|"\s*$|^\s*"/.test(x)) ? m0 : p + $tx(x));
  return out.replace(/\b(aria-label|placeholder|title|alt)="([^"]*)"/g, (m0, a, v) => a + '="' + $tx(v) + '"'); }
function setLang(l) { if (!LANGS.includes(l) || l === LANG) return; try { localStorage.setItem('hb_lang', l); } catch (e) {}
  if (typeof S !== 'undefined' && S && S.settings && !(typeof VIEW !== 'undefined' && VIEW)) { S.settings.lang = l; persist(); }
  if (typeof AUTH !== 'undefined' && AUTH && typeof api === 'function') api('/rest/v1/profiles?id=eq.' + AUTH.uid, { method: 'PATCH', body: JSON.stringify({ lang: l }) }).catch(() => {}).finally(() => location.reload()); else location.reload(); }
/* feste Texte in index.html (Tab-Leiste, Scanner, Timer) */
function translateStatic() { if (LANG === 'de') return;
  const walkEl = el => { if (el.id === 'view') return; ['aria-label', 'placeholder', 'title'].forEach(a => { if (el.hasAttribute && el.hasAttribute(a)) el.setAttribute(a, $tx(el.getAttribute(a))); });
    el.childNodes.forEach(n => { if (n.nodeType === 3) { if (n.nodeValue.trim()) n.nodeValue = $tx(n.nodeValue); } else if (n.nodeType === 1 && n.tagName !== 'SCRIPT' && n.tagName !== 'svg') walkEl(n); }); };
  walkEl(document.body); }
