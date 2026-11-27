/* Hybridblock – Sprachnachrichten im Coach-Chat: antippen = Aufnahme starten, nochmal antippen = senden (höchstens 2 Minuten).
   Speicherort wie Chat-Fotos (privater Bucket „chat“, Pfad <coach>/<athlet>/…); Abspielen über Blob-URL (CSP media-src blob:). */
'use strict';
const VOICE = { rec: null, chunks: [], t0: 0, iv: null, p: null, urls: {}, pend: null };
/* Am Desktop (ab 1200 px) erst anhören, dann senden */
const voicePrev = () => !!(window.matchMedia && window.matchMedia('(min-width:1200px)').matches);
const VOICE_MAX = 120;
const voiceOk = () => typeof MediaRecorder !== 'undefined' && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
function voiceBtn(arg) {
  if (!voiceOk()) return '';
  const on = !!VOICE.rec;
  const s = on ? Math.floor((Date.now() - VOICE.t0) / 1000) : 0;
  const pd = VOICE.pend;
  return (
    '<span id="voicebtn" class="vwrap">' +
    (pd
      ? '<span class="vprev"><audio controls preload="metadata" src="' +
        pd.url +
        '"></audio><button class="btn sm brand" data-act="voiceSend" type="button">' +
        esc($t('Senden')) +
        '</button><button class="btn sm fog" data-act="voiceDrop" type="button" aria-label="' +
        esc($t('Aufnahme verwerfen')) +
        '">✕</button></span>'
      : '') +
    '<button class="iconbtn' +
    (on ? ' rec-on' : '') +
    '" data-act="voiceRec" data-p="' +
    esc(arg || '') +
    '" type="button" aria-label="' +
    esc(on ? (voicePrev() ? $t('Aufnahme beenden') : $t('Aufnahme senden')) : $t('Sprachnachricht aufnehmen')) +
    '">' +
    (on
      ? '<span style="font-size:13px;font-weight:800">■ ' + Math.floor(s / 60) + ':' + pad(s % 60) + '</span>'
      : '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>') +
    '</button></span>'
  );
}
function voiceTick() {
  const b = document.getElementById('voicebtn');
  if (b) b.outerHTML = voiceBtn(VOICE.p);
  if (VOICE.rec && Date.now() - VOICE.t0 >= VOICE_MAX * 1000) voiceStop(true);
}
async function voiceStart(p) {
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  } catch (e) {
    toast($t('Kein Zugriff aufs Mikrofon. Erlaube es in den Einstellungen deines Handys.'));
    return;
  }
  const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'].find(m => MediaRecorder.isTypeSupported(m)) || '';
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 32000 } : {});
  VOICE.chunks = [];
  rec.ondataavailable = e => e.data && e.data.size && VOICE.chunks.push(e.data);
  VOICE.rec = rec;
  VOICE.p = p;
  VOICE.t0 = Date.now();
  rec.start(1000);
  VOICE.iv = setInterval(voiceTick, 500);
  voiceTick();
}
function voiceStop(send) {
  const rec = VOICE.rec;
  if (!rec) return;
  clearInterval(VOICE.iv);
  const dur = Math.round((Date.now() - VOICE.t0) / 1000);
  const p = VOICE.p;
  VOICE.rec = null;
  rec.onstop = async () => {
    rec.stream.getTracks().forEach(t => t.stop());
    voiceTick();
    if (!send || dur < 1) return;
    const type = (rec.mimeType || 'audio/webm').split(';')[0];
    const blob = new Blob(VOICE.chunks, { type });
    if (voicePrev()) {
      voiceDrop();
      VOICE.pend = { blob, type, dur, p, url: URL.createObjectURL(blob) };
      voiceTick();
      return;
    }
    await voiceUpload(blob, type, dur, p);
  };
  rec.stop();
}
function voiceDrop() {
  if (VOICE.pend) URL.revokeObjectURL(VOICE.pend.url);
  VOICE.pend = null;
}
async function voiceUpload(blob, type, dur, p) {
  const pair = chatPair(p || null);
  if (!pair) return;
  toast($t('Sprachnachricht wird gesendet …'));
  try {
    const ext = type.includes('mp4') ? '.m4a' : type.includes('ogg') ? '.ogg' : '.webm';
    const path = pair.coach_id + '/' + pair.athlete_id + '/' + uid() + ext;
    await api('/storage/v1/object/chat/' + path, { method: 'POST', headers: { 'Content-Type': type }, body: blob });
    ui.chatRef = Object.assign({}, ui.chatRef || {}, { dur });
    await chatSend(pair, null, null, path);
  } catch (e) {
    toast($t('Senden fehlgeschlagen: ') + errTxt(e));
  }
  render();
}
async function voiceUrl(path) {
  if (VOICE.urls[path]) return VOICE.urls[path];
  const tk = await token();
  const r = await fetch(SB.url + '/storage/v1/object/authenticated/chat/' + path, { headers: { Authorization: 'Bearer ' + tk, apikey: SB.key } });
  if (!r.ok) throw new Error('get ' + r.status);
  return (VOICE.urls[path] = URL.createObjectURL(await r.blob()));
}
function chatFillAudio() {
  document.querySelectorAll('audio[data-chataudio]:not([src])').forEach(el => {
    voiceUrl(el.dataset.chataudio)
      .then(u => {
        el.src = u;
      })
      .catch(e => {
        el.outerHTML = '<span class="small muted">' + esc($t('Sprachnachricht nicht verfügbar')) + '</span>';
        logErr('voice:get', e, 1);
      });
  });
}
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-act="voiceRec"],[data-act="voiceSend"],[data-act="voiceDrop"]');
  if (!b) return;
  if (b.dataset.act === 'voiceSend') {
    const pd = VOICE.pend;
    if (!pd) return;
    VOICE.pend = null;
    voiceUpload(pd.blob, pd.type, pd.dur, pd.p).finally(() => URL.revokeObjectURL(pd.url));
    voiceTick();
    return;
  }
  if (b.dataset.act === 'voiceDrop') {
    voiceDrop();
    voiceTick();
    return;
  }
  if (VOICE.rec) voiceStop(true);
  else voiceStart(b.dataset.p || null);
});
window.addEventListener('hashchange', () => {
  if (VOICE.rec && !location.hash.startsWith('#chat')) voiceStop(false);
  if (VOICE.pend && !location.hash.startsWith('#chat') && !location.hash.startsWith('#admin')) voiceDrop();
});
