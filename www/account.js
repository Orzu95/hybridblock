/* ======================= KONTO: Passwort vergessen, Wiederherstellungscode, E-Mail, Passwort ändern ======================= */
Object.assign(ERR_TXT, { recover_failed: $t('Benutzername oder Wiederherstellungscode falsch.'), locked: $t('Zu viele Fehlversuche. Bitte in einer Stunde erneut versuchen.'), token_invalid: $t('Der Link ist ungültig oder abgelaufen. Fordere einen neuen an.'),
  bad_email: $t('Diese E-Mail-Adresse sieht nicht gültig aus.'), email_off: $t('E-Mail-Versand ist noch nicht eingerichtet.'), unauthorized: $t('Nicht angemeldet.'), reset_failed: $t('Passwort konnte nicht geändert werden.') });
let AUTH_CAPS = null; /* { email: bool } vom Server */
let REC = null; /* eigener Eintrag aus account_recovery: { has, email } */
function loadCaps() { if (AUTH_CAPS) return; AUTH_CAPS = { email: false, loading: true }; fnCall({ action: 'caps' }).then(r => { AUTH_CAPS = { email: !!r.email }; if (route.name === 'start' || route.name === 'mehr') render(); }).catch(() => { AUTH_CAPS = { email: false }; }); }
async function loadRec() { if (!AUTH) return; try { const r = await api('/rest/v1/account_recovery?user_id=eq.' + AUTH.uid + '&select=email,code_hash'); const x = r && r[0]; REC = { has: !!(x && x.code_hash), email: x && x.email || '' }; } catch (e) { REC = { has: null, email: '', err: true }; } if (route.name === 'mehr') render(); }

function recoverySheet(code, fresh) {
  openSheet(sheetHead($t('Dein Wiederherstellungscode')) + '<p class="muted" style="margin-top:8px">' + (fresh ? $t('Damit setzt du dein Passwort selbst zurück, falls du es vergisst. Er wird nur dieses eine Mal angezeigt.') : $t('Dein alter Code gilt nicht mehr. Der neue wird nur dieses eine Mal angezeigt.')) + '</p>' +
    '<div class="codebox num" style="font-size:24px">' + esc(code) + '</div>' +
    '<p class="small muted">' + $t('Mach einen Screenshot oder speichere ihn im Passwort-Manager. Nach jeder Nutzung bekommst du einen neuen.') + '</p>' +
    '<div class="row on-white" style="margin-top:14px"><button class="btn" data-act="accRecCopy" data-code="' + esc(code) + '" type="button">' + $t('Kopieren') + '</button><div class="grow"></div><button class="btn brand" data-act="closeSheet" type="button">' + $t('Notiert') + '</button></div>'); }

/* Anmeldeseite: Passwort vergessen, Reset per Link */
const _viewStartAcc = viewStart;
viewStart = function (arg) {
  if (arg === 'reset' && RESET_TOKEN && ONB.step !== 'reset') { ONB.step = 'reset'; ONB.err = ''; }
  if (ONB.step !== 'forgot' && ONB.step !== 'reset') { const h = _viewStartAcc(arg); return ONB.step === 'login' ? h.replace('<!--forgot-->', '<button class="btn block" data-act="onbForgot" type="button" style="background:none;margin-top:8px">' + $t('Passwort vergessen?') + '</button>') : h; }
  loadCaps(); const d = ONB.data; const busy = ONB.busy ? ' disabled' : '';
  const err = ONB.err ? '<p class="small t-red" style="font-weight:700;margin-top:10px">' + esc(ONB.err) + '</p>' : '';
  const ok = ONB.ok ? '<p class="small t-green" style="font-weight:700;margin-top:10px">' + esc(ONB.ok) + '</p>' : '';
  const f = (k, lab, type, extra) => '<div class="field" style="flex:1 1 100%"><label for="ob-' + k + '">' + lab + '</label><input id="ob-' + k + '" data-ob="' + k + '" type="' + type + '" value="' + esc(d[k] || '') + '"' + (extra || '') + ' style="width:100%"></div>';
  const back = '<button class="back" data-act="onbGo" data-v="login" type="button" style="background:none;border:0;padding:0;cursor:pointer">' + ICON.back + $t('Zurück') + '</button>';
  const head = (a, sub) => '<div class="onb-top"><h1><span class="t-ember">' + a + '</span></h1><p class="muted">' + sub + '</p></div>';
  let body;
  if (ONB.step === 'reset') body = head($t('Neues Passwort'), $t('Wähle ein neues Passwort für dein Konto.')) + '<div class="card"><div class="fields">' + f('npw', $t('Neues Passwort'), 'password', ' autocomplete="new-password" placeholder="' + $t('mind. 8 Zeichen') + '"') + f('npw2', $t('Passwort wiederholen'), 'password', ' autocomplete="new-password"') + '</div>' + err +
    '<button class="btn brand block" style="margin-top:16px" data-act="onbResetTok" type="button"' + busy + '>' + (ONB.busy ? $t('Einen Moment …') : $t('Passwort speichern')) + '</button></div>';
  else body = back + head($t('Passwort vergessen'), $t('Mit dem Wiederherstellungscode, den du bei der Registrierung bekommen hast.')) +
    '<div class="card"><div class="fields">' + f('user', $t('Benutzername'), 'text', ' autocomplete="username" autocapitalize="off"') + f('rcode', $t('Wiederherstellungscode'), 'text', ' autocomplete="off" autocapitalize="characters" placeholder="XXXX-XXXX-XXXX" style="text-transform:uppercase;letter-spacing:.06em"') +
    f('npw', $t('Neues Passwort'), 'password', ' autocomplete="new-password" placeholder="' + $t('mind. 8 Zeichen') + '"') + f('npw2', $t('Passwort wiederholen'), 'password', ' autocomplete="new-password"') + '</div>' + err +
    '<button class="btn brand block" style="margin-top:16px" data-act="onbRecover" type="button"' + busy + '>' + (ONB.busy ? $t('Einen Moment …') : $t('Passwort zurücksetzen')) + '</button></div>' +
    '<div class="card" style="margin-top:12px"><h2>' + $t('Keinen Code?') + '</h2>' +
    (AUTH_CAPS && AUTH_CAPS.email ? '<p class="small">' + $t('Wenn du in deinem Konto eine E-Mail-Adresse hinterlegt hast, schicken wir dir einen Link. Gib oben deinen Benutzernamen ein.') + '</p><button class="btn block" style="margin-top:10px" data-act="onbForgotMail" type="button"' + busy + '>' + $t('Link per E-Mail senden') + '</button>' + ok : '') +
    '<p class="small muted" style="margin-top:8px">' + $t('Hast du einen Coach, kann er dein Passwort zurücksetzen. Sonst wende dich an den Support.') + '</p></div>';
  return '<div class="onb">' + body + '</div>'; };

/* Konto-Karte: Wiederherstellung, E-Mail, Passwort ändern */
const _accountCardAcc = accountCard;
accountCard = function () { const h = _accountCardAcc(); if (!AUTH || VIEW) return h; loadCaps(); if (!REC) { REC = { has: null, email: '' }; loadRec(); }
  const mail = AUTH_CAPS && AUTH_CAPS.email;
  return h + '<div class="card"><h2>' + $t('Passwort und Wiederherstellung') + '</h2>' +
    '<p class="small">' + (REC.has === false ? '<b class="t-amber">' + $t('Du hast noch keinen Wiederherstellungscode.') + '</b> ' + $t('Erzeuge einen, damit du dein Passwort selbst zurücksetzen kannst.') : $t('Mit dem Wiederherstellungscode setzt du dein Passwort selbst zurück. Hast du ihn verloren, erzeuge einen neuen; der alte gilt dann nicht mehr.')) + '</p>' +
    '<div class="row" style="margin-top:10px"><button class="btn' + (REC.has === false ? ' brand' : '') + '" data-act="accRecNew" type="button">' + (REC.has === false ? $t('Code erzeugen') : $t('Neuen Code erzeugen')) + '</button><button class="btn" data-act="pwChange" type="button">' + $t('Passwort ändern') + '</button></div>' +
    (mail ? '<div class="field" style="margin-top:14px"><label for="acc-mail">' + $t('E-Mail für Passwort-Links (freiwillig)') + '</label><div class="row" style="flex-wrap:nowrap"><input id="acc-mail" type="email" autocomplete="email" value="' + esc(REC.email || '') + '" placeholder="name@beispiel.de" style="flex:1;min-width:0"><button class="btn sm" data-act="accRecMail" type="button">' + $t('Speichern') + '</button></div></div><p class="small muted">' + $t('Wird nur für Links zum Zurücksetzen genutzt. Leer lassen und speichern entfernt sie.') + '</p>' : '') + '</div>'; };

document.addEventListener('click', async e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act; const d = ONB.data;
  const rd = id => ((document.getElementById(id) || {}).value || '');
  switch (a) {
    case 'onbForgot': ONB.err = ''; ONB.ok = ''; ONB.step = 'forgot'; render(true); break;
    case 'onbRecover': { const user = normUser(rd('ob-user') || d.user), pw = rd('ob-npw'), code = rd('ob-rcode');
      if (!user || !code) { ONB.err = $t('Bitte Benutzername und Code eingeben.'); render(); break; } if (pw !== rd('ob-npw2')) { ONB.err = $t('Die Passwörter stimmen nicht überein.'); render(); break; }
      ONB.busy = true; ONB.err = ''; render();
      try { const r = await fnCall({ action: 'recover', username: user, code, password: pw }); d.npw = d.npw2 = d.rcode = ''; await login(user, pw); await afterAuth(); if (r.recovery) recoverySheet(r.recovery, false); toast($t('Passwort geändert')); }
      catch (err) { ONB.err = errTxt(err); ONB.busy = false; render(); } break; }
    case 'onbForgotMail': { const user = normUser(rd('ob-user') || d.user); if (!user) { ONB.err = $t('Bitte zuerst deinen Benutzernamen eingeben.'); render(); break; } ONB.busy = true; ONB.err = ''; render();
      try { await fnCall({ action: 'forgot_email', username: user }); ONB.ok = $t('Wenn eine E-Mail-Adresse hinterlegt ist, ist der Link unterwegs. Schau auch im Spam-Ordner nach.'); } catch (err) { ONB.err = errTxt(err); } ONB.busy = false; render(); break; }
    case 'onbResetTok': { const pw = rd('ob-npw'); if (pw !== rd('ob-npw2')) { ONB.err = $t('Die Passwörter stimmen nicht überein.'); render(); break; } ONB.busy = true; ONB.err = ''; render();
      try { const r = await fnCall({ action: 'reset_token', token: RESET_TOKEN, password: pw }); RESET_TOKEN = null; ONB.busy = false; d.npw = d.npw2 = '';
        if (r.username) { try { await login(r.username, pw); await afterAuth(); toast($t('Passwort geändert')); break; } catch (e2) { d.user = r.username; } }
        ONB.step = 'login'; location.hash = '#start'; render(true); toast($t('Passwort geändert. Bitte anmelden.')); }
      catch (err) { ONB.err = errTxt(err); ONB.busy = false; render(); } break; }
    case 'accRecNew': if (REC && REC.has && !b.dataset.sure) { b.dataset.sure = '1'; b.textContent = $t('Alten Code ersetzen?'); b.classList.add('danger'); break; }
      try { const r = await fnCall({ action: 'recovery_new' }, true); REC = Object.assign(REC || {}, { has: true }); render(); recoverySheet(r.recovery, !b.dataset.sure); } catch (err) { toast(errTxt(err)); } break;
    case 'accRecCopy': try { await navigator.clipboard.writeText(b.dataset.code); toast($t('Kopiert')); } catch (e2) { toast($t('Bitte abschreiben oder Screenshot machen')); } break;
    case 'accRecMail': { const v = rd('acc-mail').trim(); try { await fnCall({ action: 'set_email', email: v }, true); REC = Object.assign(REC || {}, { email: v }); toast(v ? $t('E-Mail gespeichert') : $t('E-Mail entfernt')); } catch (err) { toast(errTxt(err)); } break; }
    case 'pwChange': openSheet(sheetHead($t('Passwort ändern')) + '<div class="fields on-white" style="margin-top:12px"><div class="field" style="flex:1 1 100%"><label for="pc-1">' + $t('Neues Passwort') + '</label><input id="pc-1" type="password" autocomplete="new-password" placeholder="' + $t('mind. 8 Zeichen') + '" style="width:100%"></div><div class="field" style="flex:1 1 100%"><label for="pc-2">' + $t('Passwort wiederholen') + '</label><input id="pc-2" type="password" autocomplete="new-password" style="width:100%"></div></div><div class="row" style="margin-top:14px"><div class="grow"></div><button class="btn brand" data-act="pwChangeGo" type="button">' + $t('Speichern') + '</button></div>'); break;
    case 'pwChangeGo': { const p1 = rd('pc-1'); if (p1.length < 8) { toast(ERR_TXT.short_password); break; } if (p1 !== rd('pc-2')) { toast($t('Die Passwörter stimmen nicht überein.')); break; }
      try { await api('/auth/v1/user', { method: 'PUT', body: JSON.stringify({ password: p1 }) }); closeSheet(); toast($t('Passwort geändert')); } catch (err) { toast(errTxt(err)); } break; }
  } });
const _logoutAcc = logout; logout = async function () { REC = null; if (typeof OPS !== 'undefined') { OPS.is = null; OPS.users = null; OPS.stats = null; } return _logoutAcc(); };
