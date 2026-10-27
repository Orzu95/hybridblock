/* ======================= DATENSCHUTZ: Einwilligung, Datenschutzerklärung, Löschen ======================= */
const CONSENT_V = 1;
const hasConsent = () => !!(S.meta.consent && S.meta.consent.v >= CONSENT_V);
function consentSheet(then) { ui.consentThen = then || null;
  openSheet(sheetHead($t('Deine Daten')) + $t('<p>Hybridblock verarbeitet Gesundheitsdaten: Puls, Schlaf, Gewicht, Trainings, Beschwerden und, wenn du aufzeichnest, deine GPS-Strecke. Dafür brauchen wir deine ausdrückliche Einwilligung.</p>') +
    $t('<ul class="rules small" style="margin-top:10px"><li>Nur für die Funktionen der App. Keine Werbung, kein Tracking, kein Verkauf.</li><li>Gespeichert auf deinem Gerät und, mit Konto, auf einem Server in Frankfurt.</li><li>Mit Coach sieht dein Coach deinen Fortschritt.</li><li>Widerruf jederzeit: Einstellungen → Datenschutz → Daten löschen.</li></ul>') +
    $t('<p class="small" style="margin-top:10px"><a href="#datenschutz" data-act="closeSheet">Datenschutzerklärung lesen</a></p>') +
    $t('<button class="btn brand block" data-act="consentYes" type="button" style="margin-top:14px">Ich willige ein</button><button class="btn block" data-act="consentNo" type="button" style="margin-top:8px">Nicht einverstanden</button>')); }
function privacyCard() { if (VIEW) return '';
  return $t('<div class="card"><h2>Datenschutz</h2><p class="small">') + (hasConsent() ? $t('Einwilligung erteilt am ') + new Date(S.meta.consent.at).toLocaleDateString(LOCALE) + '.' : $t('Noch keine Einwilligung erteilt.')) + '</p>' +
    $t('<div class="row" style="margin-top:12px"><a class="btn" href="#datenschutz">Datenschutzerklärung</a><button class="btn" data-act="export" type="button">Daten exportieren</button></div>') +
    $t('<div class="row" style="margin-top:8px"><button class="btn danger" data-act="wipeLocal" type="button">Daten auf diesem Gerät löschen</button>') + (AUTH ? $t('<button class="btn danger" data-act="deleteAccount" type="button">Konto löschen</button>') : '') + '</div></div>'; }
const _accountCardBase = accountCard;
accountCard = function () { return _accountCardBase() + privacyCard(); };
let PRIV_HTML = null;
function viewPrivacy() { if (PRIV_HTML == null) { fetch('privacypolicy.html').then(r => r.text()).then(t => { const m = t.match(/<main[^>]*>([\s\S]*)<\/main>/); PRIV_HTML = m ? m[1] : t; if (route.name === 'datenschutz') render(); }).catch(() => { PRIV_HTML = '<p>' + $t('Nicht erreichbar.') + '</p>'; }); }
  const html = PRIV_HTML || ''; const en = LANG !== 'de'; const part = html ? (en ? (html.split(/<section lang="en"[^>]*>/)[1] || html) : html.split(/<section lang="en"/)[0]) : '<p class="muted">…</p>';
  return '<a href="#mehr" class="back">' + ICON.back + $t('Einstellungen</a>') + '<div class="card privacy">' + part.replace(/<\/?section[^>]*>/g, '') + '</div>'; }
function wipeAll() { try { Object.keys(localStorage).filter(k => /^hb_/.test(k)).forEach(k => localStorage.removeItem(k)); } catch (e) {} try { indexedDB.deleteDatabase('hb_photos'); } catch (e) {} location.hash = '#start'; location.reload(); }
document.addEventListener('click', async e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act;
  /* Einwilligung vor dem ersten Speichern von Angaben im Onboarding */
  if (a === 'onbProfile' && !hasConsent() && !b.dataset.ok) { e.stopImmediatePropagation(); e.preventDefault(); consentSheet(() => { b.dataset.ok = '1'; b.click(); }); return; }
  if (a === 'hcConnect' && !hasConsent()) { e.stopImmediatePropagation(); e.preventDefault(); consentSheet(() => b.click()); return; }
  switch (a) {
    case 'consentYes': { S.meta.consent = { v: CONSENT_V, at: Date.now() }; save(); closeSheet(); const f = ui.consentThen; ui.consentThen = null; if (f) setTimeout(f, 50); else render(); break; }
    case 'consentNo': openSheet(sheetHead($t('Ohne Einwilligung')) + $t('<p>Ohne Einwilligung kann die App deine Trainings- und Gesundheitsdaten nicht speichern und ist darum nicht nutzbar. Du kannst sie jederzeit später erteilen.</p><button class="btn brand block" data-act="consentAgain" type="button" style="margin-top:14px">Zurück</button>')); break;
    case 'consentAgain': consentSheet(ui.consentThen); break;
    case 'wipeLocal': openSheet(sheetHead($t('Daten löschen')) + $t('<p>Alle Trainings, Mahlzeiten, Gesundheitswerte, Fotos und Einstellungen auf diesem Gerät werden gelöscht. Das lässt sich nicht rückgängig machen.</p>') + (AUTH ? $t('<p class="small muted">Dein Konto in der Cloud bleibt bestehen. Zum endgültigen Löschen „Konto löschen“ nutzen.</p>') : '') +
      $t('<button class="btn danger block" data-act="wipeLocalYes" type="button" style="margin-top:14px">Endgültig löschen</button>')); break;
    case 'wipeLocalYes': try { if (AUTH) await logout(); } catch (err) {} wipeAll(); break;
    case 'deleteAccount': openSheet(sheetHead($t('Konto löschen')) + $t('<p>Dein Konto und alle Daten in der Cloud (Plan, Trainings, Ernährung, Gesundheitswerte, Anfragen) werden endgültig gelöscht, danach auch alles auf diesem Gerät.</p><p class="small" style="margin-top:10px">Zur Bestätigung deinen Benutzernamen eintippen:</p>') +
      '<div class="on-white" style="margin-top:8px"><input id="del-user" type="text" autocapitalize="off" placeholder="' + esc((AUTH && AUTH.profile && AUTH.profile.username) || '') + '" style="width:100%"></div>' + $t('<button class="btn danger block" data-act="deleteAccountYes" type="button" style="margin-top:14px">Konto endgültig löschen</button>')); break;
    case 'deleteAccountYes': { const v = (document.getElementById('del-user') || {}).value || ''; b.disabled = true;
      try { await fnCall({ action: 'delete', confirm: normUser(v) }, true); AUTH = null; saveAuth(); toast($t('Konto gelöscht')); setTimeout(wipeAll, 600); }
      catch (err) { b.disabled = false; toast(/confirm/.test(String(err && err.message)) ? $t('Benutzername stimmt nicht.') : $t('Löschen fehlgeschlagen: ') + ((err && err.message) || err)); } break; }
  } }, true);
/* Bestehende Nutzer: einmal nachfragen */
setTimeout(() => { if (S.meta.onboarded && !hasConsent() && !VIEW && route.name !== 'start' && route.name !== 'datenschutz') consentSheet(); }, 1200);
