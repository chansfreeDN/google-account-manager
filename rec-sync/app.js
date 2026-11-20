/* 녹음싱크 (rec-sync)
 * 녹음 → 구글 드라이브/시트 자동 저장. 인터넷이 끊겨도 휴대폰에 보관했다가 다시 연결되면 보냄.
 */
(() => {
  'use strict';

  const SEGMENT_MS = 10 * 60 * 1000; // 10분마다 녹음 파일을 나눠서 바로 업로드 (긴 대화도 안전)
  const AUDIO_BITRATE = 32000;
  const PHOTO_MAX = 2000;
  const HISTORY_MAX = 30;

  const $ = (id) => document.getElementById(id);
  const ui = {
    recBtn: $('recBtn'), timer: $('timer'), recHint: $('recHint'),
    memo: $('memo'), photoInput: $('photoInput'), photos: $('photos'), photoCount: $('photoCount'),
    live: $('live'), liveToggle: $('liveToggle'), saveNoRec: $('saveNoRec'),
    history: $('history'), queueInfo: $('queueInfo'),
    syncDot: $('syncDot'), syncText: $('syncText'),
    settingsBtn: $('settingsBtn'), urlInput: $('urlInput'), tokenInput: $('tokenInput'),
    saveSettings: $('saveSettings'), closeSettings: $('closeSettings'), settingsMsg: $('settingsMsg'),
    toast: $('toast'),
  };

  // ---------- 저장소(localStorage는 실패할 수 있으니 감싸서 사용) ----------
  const ls = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };

  // ---------- 설정 ----------
  function readHashSetup() {
    // 설정 링크: .../rec-sync/#u=<웹앱URL>&t=<토큰>  → 한 번 열면 저장되고 주소창에서 지워짐
    if (!location.hash) return;
    const p = new URLSearchParams(location.hash.slice(1));
    const u = p.get('u'), t = p.get('t');
    if (u && t) {
      ls.set('cfg', { url: u, token: t });
      history.replaceState(null, '', location.pathname + location.search);
      toast('설정이 저장됐어요');
    }
  }
  const cfg = () => ls.get('cfg', { url: '', token: '' });
  const configured = () => { const c = cfg(); return !!(c.url && c.token); };

  // ---------- 서버 호출 ----------
  async function api(body) {
    const c = cfg();
    if (!c.url || !c.token) throw Object.assign(new Error('not_configured'), { fatal: true });
    // text/plain 이라 브라우저가 사전요청을 하지 않음 → Apps Script와 바로 통신 가능
    const res = await fetch(c.url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...body, token: c.token }),
      redirect: 'follow',
    });
    if (!res.ok) throw new Error('http_' + res.status);
    const data = await res.json();
    if (!data.ok) {
      const err = new Error(data.error || 'server_error');
      if (data.error === 'unauthorized') err.fatal = true;
      throw err;
    }
    return data;
  }

  // ---------- 전송 대기열 (IndexedDB) ----------
  let dbp;
  function db() {
    if (!dbp) dbp = new Promise((resolve, reject) => {
      const r = indexedDB.open('rec-sync', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('queue', { keyPath: 'qid', autoIncrement: true });
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    return dbp;
  }
  async function qTx(mode, fn) {
    const d = await db();
    return new Promise((resolve, reject) => {
      const tx = d.transaction('queue', mode);
      const store = tx.objectStore('queue');
      let out;
      Promise.resolve(fn(store)).then((v) => { out = v; });
      tx.oncomplete = () => resolve(out);
      tx.onerror = () => reject(tx.error);
    });
  }
  const req = (r) => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const qAdd = (item) => qTx('readwrite', (s) => req(s.add(item)));
  const qAll = () => qTx('readonly', (s) => req(s.getAll()));
  const qDel = (qid) => qTx('readwrite', (s) => req(s.delete(qid)));

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result).split(',')[1] || '');
      fr.onerror = () => reject(fr.error);
      fr.readAsDataURL(blob);
    });
  }

  let pumping = false, backoff = 0, fatalError = '';
  async function pump() {
    if (pumping) return;
    pumping = true;
    try {
      while (true) {
        if (!configured()) { fatalError = 'not_configured'; break; }
        if (!navigator.onLine) break;
        const items = await qAll();
        await renderQueue(items);
        if (!items.length) { backoff = 0; break; }
        const it = items[0];
        try {
          if (it.type === 'upload') {
            await api({ action: 'upload', kind: it.kind, name: it.name, mime: it.mime, data: await blobToBase64(it.blob) });
          } else if (it.type === 'finish') {
            await api({ action: 'finish', ...it.payload });
            markHistory(it.payload.sessionId, 'done');
          }
          await qDel(it.qid);
          fatalError = ''; backoff = 0;
        } catch (e) {
          if (e.fatal) { fatalError = e.message; break; }
          backoff = Math.min(backoff ? backoff * 2 : 3000, 120000);
          setTimeout(pump, backoff);
          break;
        }
      }
    } finally {
      pumping = false;
      renderQueue();
    }
  }

  async function renderQueue(items) {
    if (!items) items = await qAll().catch(() => []);
    const n = items.length;
    ui.queueInfo.textContent = n ? `보낼 항목 ${n}개` : '';
    let dot = 'ok', text = '연결됨';
    if (!configured()) { dot = 'bad'; text = '설정 필요'; }
    else if (fatalError === 'unauthorized') { dot = 'bad'; text = '토큰 확인 필요'; }
    else if (!navigator.onLine) { dot = 'warn'; text = n ? `오프라인 · ${n}개 보관 중` : '오프라인'; }
    else if (n) { dot = 'warn'; text = `전송 중 ${n}`; }
    ui.syncDot.className = 'dot ' + dot;
    ui.syncText.textContent = text;
  }

  // ---------- 기록(세션) ----------
  let session = null; // {id, startedAt, photoN, recN, memo}
  function newId() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}-` +
      Math.random().toString(36).slice(2, 6);
  }
  function ensureSession() {
    if (!session) session = { id: newId(), startedAt: Date.now(), photoN: 0, recN: 0 };
    return session;
  }

  function addHistory(entry) {
    const h = ls.get('history', []);
    h.unshift(entry);
    ls.set('history', h.slice(0, HISTORY_MAX));
    renderHistory();
  }
  function markHistory(id, state) {
    const h = ls.get('history', []);
    const e = h.find((x) => x.id === id);
    if (e) { e.state = state; ls.set('history', h); renderHistory(); }
  }
  function renderHistory() {
    const h = ls.get('history', []);
    ui.history.replaceChildren(...(h.length ? h.map((e) => {
      const row = document.createElement('div'); row.className = 'item';
      const left = document.createElement('div');
      const m = document.createElement('div'); m.className = 'memo';
      m.textContent = e.memo || e.preview || (e.dur ? '녹음' : '메모');
      const t = document.createElement('div'); t.className = 't';
      t.textContent = new Date(e.at).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) +
        (e.dur ? ` · ${fmt(e.dur)}` : '') + (e.photos ? ` · 사진 ${e.photos}` : '');
      left.append(m, t);
      const s = document.createElement('div');
      s.className = 'state ' + (e.state === 'done' ? 'done' : 'wait');
      s.textContent = e.state === 'done' ? '시트 저장됨' : '전송 대기';
      row.append(left, s);
      return row;
    }) : [Object.assign(document.createElement('div'), { className: 'sub', textContent: '아직 기록이 없어요.' })]));
  }

  // ---------- 사진 ----------
  async function resizePhoto(file) {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
      const scale = Math.min(1, PHOTO_MAX / Math.max(bmp.width, bmp.height));
      const c = document.createElement('canvas');
      c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      return await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.85));
    } catch {
      return file; // 변환 실패 시 원본 그대로
    }
  }
  ui.photoInput.addEventListener('change', async () => {
    const files = [...ui.photoInput.files];
    ui.photoInput.value = '';
    if (!files.length) return;
    const s = ensureSession();
    for (const f of files) {
      const blob = await resizePhoto(f);
      s.photoN += 1;
      const name = `${s.id}_photo${String(s.photoN).padStart(2, '0')}.jpg`;
      await qAdd({ type: 'upload', kind: 'photo', name, mime: 'image/jpeg', blob });
      const img = document.createElement('img');
      img.src = URL.createObjectURL(blob);
      ui.photos.append(img);
    }
    ui.photoCount.textContent = `${s.photoN}장`;
    updateButtons();
    pump();
  });

  // ---------- 녹음 ----------
  let stream = null, recorder = null, segTimer = null, tickTimer = null, recStart = 0, wakeLock = null;
  const mimeType = (() => {
    if (!window.MediaRecorder) return '';
    for (const t of ['audio/mp4', 'audio/mp4;codecs=mp4a.40.2', 'audio/webm;codecs=opus', 'audio/webm']) {
      if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) return t;
    }
    return '';
  })();
  const ext = mimeType.includes('mp4') ? 'm4a' : 'webm';

  function startSegment() {
    const s = session;
    const opts = { audioBitsPerSecond: AUDIO_BITRATE };
    if (mimeType) opts.mimeType = mimeType;
    const r = new MediaRecorder(stream, opts);
    const chunks = [];
    r.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    // 조각이 대기열에 들어간 뒤에 끝나는 promise (마지막 조각보다 '저장' 요청이 먼저 가지 않도록)
    r.saved = new Promise((resolve) => {
      r.onstop = async () => {
        try {
          if (!chunks.length) return;
          s.recN += 1;
          const blob = new Blob(chunks, { type: (r.mimeType || mimeType || 'audio/mp4').split(';')[0] });
          const name = `${s.id}_rec${String(s.recN).padStart(2, '0')}.${ext}`;
          await qAdd({ type: 'upload', kind: 'audio', name, mime: blob.type, blob });
          pump();
        } finally { resolve(); }
      };
    });
    r.start(1000);
    recorder = r;
  }

  async function startRecording() {
    if (!configured()) { openSettings('먼저 저장 주소와 토큰을 넣어주세요.'); return; }
    if (!window.MediaRecorder || !navigator.mediaDevices) { toast('이 브라우저는 녹음을 지원하지 않아요'); return; }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch {
      toast('마이크 권한을 허용해 주세요'); return;
    }
    ensureSession();
    recStart = Date.now();
    startSegment();
    segTimer = setInterval(() => { // 10분마다 파일을 끊어서 바로 업로드
      const old = recorder; startSegment(); old.stop();
    }, SEGMENT_MS);
    tickTimer = setInterval(tick, 500); tick();
    ui.recBtn.classList.add('on');
    ui.recBtn.setAttribute('aria-label', '녹음 끝내고 저장');
    ui.recHint.textContent = '녹음 중 · 다시 누르면 끝내고 자동 저장';
    try { wakeLock = await navigator.wakeLock?.request('screen'); } catch {}
    if (ui.liveToggle.checked) startLive();
    updateButtons();
  }

  async function stopRecording() {
    clearInterval(segTimer); clearInterval(tickTimer);
    const dur = Math.round((Date.now() - recStart) / 1000);
    const r = recorder; recorder = null;
    if (r && r.state !== 'inactive') r.stop();
    if (r) await r.saved;
    stream?.getTracks().forEach((t) => t.stop()); stream = null;
    stopLive();
    try { await wakeLock?.release(); } catch {} wakeLock = null;
    ui.recBtn.classList.remove('on');
    ui.recBtn.setAttribute('aria-label', '녹음 시작');
    ui.recHint.textContent = '누르면 녹음 시작 · 다시 누르면 끝내고 자동 저장';
    await finishSession(dur);
  }

  async function finishSession(dur) {
    const s = session; if (!s) return;
    session = null;
    const transcript = liveText.trim();
    const memo = ui.memo.value.trim();
    await qAdd({ type: 'finish', payload: { sessionId: s.id, startedAt: s.startedAt, durationSec: dur || 0, memo, transcript } });
    addHistory({ id: s.id, at: s.startedAt, memo, preview: transcript.slice(0, 40), dur: dur || 0, photos: s.photoN, state: 'wait' });
    ui.memo.value = ''; ui.photos.replaceChildren(); ui.photoCount.textContent = '';
    liveText = ''; ui.timer.textContent = '00:00';
    ui.live.textContent = '저장했어요. 자동으로 시트에 올라가요. (인터넷이 없으면 연결될 때 올라가요)';
    ui.live.className = 'sub';
    updateButtons();
    toast('저장했어요');
    pump();
  }

  const fmt = (sec) => { const m = Math.floor(sec / 60), s = sec % 60; const h = Math.floor(m / 60);
    return (h ? h + ':' + String(m % 60).padStart(2, '0') : String(m).padStart(2, '0')) + ':' + String(s).padStart(2, '0'); };
  function tick() { ui.timer.textContent = fmt(Math.floor((Date.now() - recStart) / 1000)); }

  ui.recBtn.addEventListener('click', () => { recorder ? stopRecording() : startRecording(); });
  ui.saveNoRec.addEventListener('click', () => {
    if (!configured()) { openSettings('먼저 저장 주소와 토큰을 넣어주세요.'); return; }
    if (ui.memo.value.trim()) ensureSession();
    finishSession(0);
  });
  ui.memo.addEventListener('input', updateButtons);
  function updateButtons() {
    const hasDraft = !recorder && (session?.photoN || ui.memo.value.trim());
    ui.saveNoRec.classList.toggle('hidden', !hasDraft);
  }

  // ---------- 실시간 글자 변환 (기기 음성인식, 실패해도 녹음은 계속) ----------
  let liveText = '', recog = null, liveWanted = false, liveFails = 0;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  ui.liveToggle.checked = ls.get('live', true) && !!SR;
  ui.liveToggle.disabled = !SR;
  ui.liveToggle.addEventListener('change', () => {
    ls.set('live', ui.liveToggle.checked);
    if (recorder) ui.liveToggle.checked ? startLive() : stopLive();
  });
  function renderLive(interim) {
    ui.live.className = '';
    ui.live.replaceChildren(document.createTextNode(liveText));
    if (interim) { const sp = document.createElement('span'); sp.className = 'interim'; sp.textContent = (liveText ? ' ' : '') + interim; ui.live.append(sp); }
    ui.live.scrollTop = ui.live.scrollHeight;
  }
  function startLive() {
    if (!SR) return;
    liveWanted = true;
    if (recog) return;
    const r = new SR();
    r.lang = 'ko-KR'; r.continuous = true; r.interimResults = true;
    r.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) liveText += (liveText ? ' ' : '') + res[0].transcript.trim();
        else interim += res[0].transcript;
      }
      liveFails = 0;
      renderLive(interim);
    };
    r.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { liveWanted = false; liveNote('실시간 변환을 쓸 수 없어요. 녹음은 그대로 저장돼요.'); }
      else liveFails++;
    };
    r.onend = () => {
      recog = null;
      if (liveWanted && recorder && liveFails < 5) setTimeout(startLive, 300); // 브라우저가 중간에 끊으면 다시 시작
      else if (liveFails >= 5) liveNote('실시간 변환이 자꾸 끊겨서 멈췄어요. 녹음은 그대로 저장돼요.');
    };
    try { r.start(); recog = r; if (!liveText) renderLive('듣는 중…'); } catch { recog = null; }
  }
  function stopLive() { liveWanted = false; try { recog?.stop(); } catch {} recog = null; }
  function liveNote(t) { const n = document.createElement('div'); n.className = 'sub'; n.textContent = t; ui.live.append(n); }

  // ---------- 설정 화면 ----------
  function openSettings(msg) {
    const c = cfg();
    ui.urlInput.value = c.url; ui.tokenInput.value = c.token;
    ui.settingsMsg.textContent = msg || ''; ui.settingsMsg.className = 'msg';
    document.body.classList.add('show-settings');
  }
  ui.settingsBtn.addEventListener('click', () => document.body.classList.contains('show-settings') ? document.body.classList.remove('show-settings') : openSettings());
  ui.closeSettings.addEventListener('click', () => document.body.classList.remove('show-settings'));
  ui.saveSettings.addEventListener('click', async () => {
    ls.set('cfg', { url: ui.urlInput.value.trim(), token: ui.tokenInput.value.trim() });
    ui.settingsMsg.textContent = '연결 확인 중…'; ui.settingsMsg.className = 'msg';
    try {
      await api({ action: 'ping' });
      fatalError = '';
      ui.settingsMsg.textContent = '연결됐어요. 이제 녹음하면 시트로 저장돼요.'; ui.settingsMsg.className = 'msg ok';
      pump();
    } catch (e) {
      ui.settingsMsg.className = 'msg bad';
      ui.settingsMsg.textContent = e.message === 'unauthorized' ? '토큰이 맞지 않아요.' : '연결하지 못했어요. 주소를 확인해 주세요.';
    }
    renderQueue();
  });

  // ---------- 기타 ----------
  let toastTimer;
  function toast(t) { ui.toast.textContent = t; ui.toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => ui.toast.classList.remove('show'), 2200); }
  window.addEventListener('online', () => { renderQueue(); pump(); });
  window.addEventListener('offline', () => renderQueue());
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { pump(); if (recorder && !wakeLock) navigator.wakeLock?.request('screen').then((w) => { wakeLock = w; }).catch(() => {}); } });
  window.addEventListener('beforeunload', (e) => { if (recorder) { e.preventDefault(); e.returnValue = ''; } });

  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});

  readHashSetup();
  renderHistory();
  renderQueue();
  if (!configured()) openSettings('처음 한 번만 저장 주소와 토큰을 넣어주세요.');
  pump();
})();
