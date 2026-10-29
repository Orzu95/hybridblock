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
  else { s = s.replace(/<span class="t-ember">([^<]+)<\/span>(\s*)([^<]+)/g, (m0, a, sp, b) => { const v = D[(a + ' ' + b).replace(/\s+/g, ' ').trim()]; if (v == null) return m0; const q = $tsplit(v); return '<span class="t-ember">' + q[0] + '</span>' + (q[1] ? ' ' + q[1] : ''); });
    out = s.replace(/(^|>)([^<>]+)(?=<|$)/g, (m0, p, x) => (p === '' && /=\s*"|"\s*$|^\s*"/.test(x)) ? m0 : p + $tx(x)); }
  return out.replace(/\b(aria-label|placeholder|title|alt)="([^"]*)"/g, (m0, a, v) => a + '="' + $tx(v) + '"'); }
/* Zweiteilige Überschriften („<Akzent> Rest“) werden als ganze Phrase übersetzt, sonst stimmen Genus und Kasus nicht
   (z. B. „Dein Ziel“ → „Твоя цель“, nicht „Твой“ + „Цель“). Ein „|“ in der Übersetzung legt die Trennstelle fest, sonst nach dem ersten Wort. */
function $tsplit(v) { const i = v.indexOf('|'); if (i >= 0) return [v.slice(0, i).trim(), v.slice(i + 1).trim()]; const j = v.indexOf(' '); return j < 0 ? [v, ''] : [v.slice(0, j), v.slice(j + 1)]; }
function $tp(a, b) { if (LANG === 'de' || !b) return [$t(a), b ? $t(b) : b]; const D = I18N[LANG] || {}; const v = D[(a + ' ' + b).replace(/\s+/g, ' ').trim()]; return v != null ? $tsplit(v) : [$t(a), $t(b)]; }
function setLang(l) { if (!LANGS.includes(l) || l === LANG) return; try { localStorage.setItem('hb_lang', l); } catch (e) {}
  if (typeof S !== 'undefined' && S && S.settings && !(typeof VIEW !== 'undefined' && VIEW)) { S.settings.lang = l; persist(); }
  if (typeof AUTH !== 'undefined' && AUTH && typeof api === 'function') api('/rest/v1/profiles?id=eq.' + AUTH.uid, { method: 'PATCH', body: JSON.stringify({ lang: l }) }).catch(() => {}).finally(() => location.reload()); else location.reload(); }
/* feste Texte in index.html (Tab-Leiste, Scanner, Timer) */
function translateStatic() { if (LANG === 'de') return;
  const walkEl = el => { if (el.id === 'view') return; ['aria-label', 'placeholder', 'title'].forEach(a => { if (el.hasAttribute && el.hasAttribute(a)) el.setAttribute(a, $tx(el.getAttribute(a))); });
    el.childNodes.forEach(n => { if (n.nodeType === 3) { if (n.nodeValue.trim()) n.nodeValue = $tx(n.nodeValue); } else if (n.nodeType === 1 && n.tagName !== 'SCRIPT' && n.tagName !== 'svg') walkEl(n); }); };
  walkEl(document.body); }
/* Russisch: Zahl + Substantiv. Die Wörterbücher enthalten nur eine Form (meist Genitiv Plural, „5 дней“).
   Hier wird nach dem Rendern die richtige Form gesetzt: 1 день, 2 дня, 5 дней, 21 день, 1,5 дня. Nach Präpositionen mit Genitiv bleibt die Form. */
const RU_PL = [['упражнение', 'упражнения', 'упражнений'], ['день', 'дня', 'дней'], ['запись', 'записи', 'записей'], ['минута', 'минуты', 'минут'], ['секунда', 'секунды', 'секунд'], ['час', 'часа', 'часов'], ['ночь', 'ночи', 'ночей'], ['год', 'года', 'лет'], ['неделя', 'недели', 'недель'],
  ['тренировка', 'тренировки', 'тренировок'], ['новая тренировка', 'новых тренировки', 'новых тренировок'], ['взвешивание', 'взвешивания', 'взвешиваний'], ['утверждение', 'утверждения', 'утверждений'], ['продукт', 'продукта', 'продуктов'], ['подход', 'подхода', 'подходов'], ['тяжёлый подход', 'тяжёлых подхода', 'тяжёлых подходов'],
  ['атлет', 'атлета', 'атлетов'], ['атлет ждёт', 'атлета ждут', 'атлетов ждут'], ['повторение', 'повторения', 'повторений'], ['спортсмен', 'спортсмена', 'спортсменов'], ['приглашение', 'приглашения', 'приглашений'], ['источник', 'источника', 'источников']];
const RU_PL_MAP = {}; RU_PL.forEach(f => { RU_PL_MAP[f[1]] = f; RU_PL_MAP[f[2]] = f; });
const RU_PL_RE = new RegExp('(^|[^\\d.,])(\\d+(?:[.,]\\d+)?)([ \\u00a0])(' + Object.keys(RU_PL_MAP).sort((a, b) => b.length - a.length).join('|') + ')(?![а-яё])', 'g');
const RU_GEN = /(?:^|[\s(«„])(из|до|от|с|со|около|больше|меньше|более|менее|после|свыше|кроме|для|без|у|не менее|не более|не меньше|не больше)\s*$/i;
function ruForm(num, f) { if (/[.,]/.test(num)) return f[1]; const n = +num, a = n % 10, b = n % 100; return a === 1 && b !== 11 ? f[0] : a >= 2 && a <= 4 && (b < 10 || b >= 20) ? f[1] : f[2]; }
function ruPlural(s) { return s.replace(RU_PL_RE, (m0, pre, num, sp, w, off, all) => RU_GEN.test(all.slice(0, off) + pre) ? m0 : pre + num + sp + ruForm(num, RU_PL_MAP[w])); }
function ruFixTree(root) { if (!root) return; const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: t => { const e = t.parentNode; return e && (/^(TEXTAREA|SCRIPT|STYLE)$/.test(e.nodeName) || (e.closest && e.closest('[contenteditable]'))) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } }); let n, prev = '';
  while ((n = tw.nextNode())) { const v = n.nodeValue; if (!v.trim()) { continue; }
    /* Zahl im vorigen Textknoten (z. B. <b>3</b> атлетов) */
    const joined = /\d$/.test(prev) && /^[  ]/.test(v) ? ruPlural(prev.slice(-24) + v).slice(prev.slice(-24).length) : ruPlural(v);
    if (joined !== v) n.nodeValue = joined; prev = n.nodeValue; } }
if (LANG === 'ru') { let busy = false; const mo = new MutationObserver(ms => { if (busy) return; busy = true; try { const seen = new Set(); ms.forEach(m => { const t = m.type === 'characterData' ? m.target.parentNode : m.target; if (t && t.nodeType === 1 && !seen.has(t)) { seen.add(t); ruFixTree(t); } }); } finally { mo.takeRecords(); busy = false; } });
  const go = () => { ruFixTree(document.body); mo.observe(document.body, { childList: true, subtree: true, characterData: true }); };
  if (document.body) go(); else document.addEventListener('DOMContentLoaded', go); }
