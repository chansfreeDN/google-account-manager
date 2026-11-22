/**
 * rec-sync 저장 담당 (Google Apps Script)
 *
 * 녹음싱크 앱이 보낸 녹음·사진·텍스트를 내 구글 드라이브와 시트에 저장합니다.
 *
 * 처음 한 번만:
 *   1. script.google.com → 새 프로젝트 → 이 파일 내용을 붙여넣기
 *   2. 위쪽 함수 목록에서 setup 선택 → 실행 → 권한 허용
 *      실행 로그에 나온 "토큰"을 복사해 둡니다.
 *   3. 배포 → 새 배포 → 유형: 웹 앱
 *      - 실행 사용자: 나
 *      - 액세스 권한: 모든 사용자
 *      배포 후 나오는 웹 앱 URL을 복사합니다.
 *   4. 녹음싱크 앱 설정에 URL과 토큰을 넣으면 끝.
 *
 * "모든 사용자"로 열어도 토큰이 맞지 않으면 아무것도 저장하거나 읽을 수 없습니다.
 */

const CONFIG = {
  SHEET_ID: '1zbhQUbSrJMOqTy2WgfI1yYrPkeTotiRSSO3foPH6RF0', // rec-sync 기록
  INBOX_SHEET: '수신함',
  AUDIO_FOLDER_ID: '1arb6epjjMmYuvI3kjZzieETP3KiyzLbs', // rec-sync/녹음파일
  PHOTO_FOLDER_ID: '1GX42AfJVHkVpdfrdLX-drJvrH2tJNDs_', // rec-sync/사진
};

/** 처음 한 번 실행: 토큰을 만들고 권한을 허용받습니다. */
function setup() {
  const props = PropertiesService.getScriptProperties();
  let token = props.getProperty('TOKEN');
  if (!token) {
    token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
    props.setProperty('TOKEN', token);
  }
  // 권한 확인용으로 한 번씩 접근
  SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.INBOX_SHEET).getName();
  DriveApp.getFolderById(CONFIG.AUDIO_FOLDER_ID).getName();
  DriveApp.getFolderById(CONFIG.PHOTO_FOLDER_ID).getName();
  Logger.log('토큰: ' + token);
  Logger.log('이 토큰을 녹음싱크 앱 설정에 넣으세요. 다른 사람에게 알려주지 마세요.');
}

/** 토큰을 바꾸고 싶을 때 실행 (기존 토큰은 더 이상 동작하지 않음) */
function resetToken() {
  PropertiesService.getScriptProperties().deleteProperty('TOKEN');
  setup();
}

function doGet() {
  return json_({ ok: true, app: 'rec-sync' });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const token = PropertiesService.getScriptProperties().getProperty('TOKEN');
    if (!token || body.token !== token) return json_({ ok: false, error: 'unauthorized' });

    switch (body.action) {
      case 'ping':
        return json_({ ok: true });
      case 'upload':
        return json_(upload_(body));
      case 'finish':
        return json_(finish_(body));
      case 'setStatus':
        return json_(setStatus_(body));
      default:
        return json_({ ok: false, error: 'unknown_action' });
    }
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

/** 녹음 조각 또는 사진 1개 저장. 같은 이름이 이미 있으면 다시 만들지 않음(재전송 대비). */
function upload_(b) {
  const folderId = b.kind === 'photo' ? CONFIG.PHOTO_FOLDER_ID : CONFIG.AUDIO_FOLDER_ID;
  const folder = DriveApp.getFolderById(folderId);
  const name = safeName_(b.name);
  const existing = folder.getFilesByName(name);
  if (existing.hasNext()) {
    const f = existing.next();
    return { ok: true, fileId: f.getId(), url: f.getUrl(), duplicate: true };
  }
  const bytes = Utilities.base64Decode(b.data);
  const blob = Utilities.newBlob(bytes, b.mime || 'application/octet-stream', name);
  const file = folder.createFile(blob);
  return { ok: true, fileId: file.getId(), url: file.getUrl() };
}

/** 기록 1건을 수신함 시트에 추가. 같은 ID가 이미 있으면 추가하지 않음. */
function finish_(b) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.INBOX_SHEET);
    const id = String(b.sessionId);
    const last = sheet.getLastRow();
    if (last > 1) {
      const ids = sheet.getRange(2, 1, last - 1, 1).getValues().map(function (r) { return String(r[0]); });
      if (ids.indexOf(id) !== -1) return { ok: true, duplicate: true };
    }

    const audio = linksFor_(CONFIG.AUDIO_FOLDER_ID, id);
    const photos = linksFor_(CONFIG.PHOTO_FOLDER_ID, id);
    const text = String(b.transcript || '').trim();
    const status = text ? '대기' : (audio.length ? '변환필요' : '대기');

    sheet.appendRow([
      id,
      new Date(b.startedAt || Date.now()),
      Math.round(Number(b.durationSec) || 0),
      String(b.memo || ''),
      text,
      audio.join('\n'),
      photos.join('\n'),
      status,
      String(b.location || ''),
    ]);
    return { ok: true, audioCount: audio.length, photoCount: photos.length };
  } finally {
    lock.releaseLock();
  }
}

/** 앱의 "블로그 글로 쓰기" 버튼: 해당 기록의 처리상태(H열)를 바꿈 */
function setStatus_(b) {
  const allowed = ['글쓰기요청'];
  if (allowed.indexOf(b.status) === -1) return { ok: false, error: 'bad_status' };
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.INBOX_SHEET);
  const last = sheet.getLastRow();
  if (last < 2) return { ok: false, error: 'not_found' };
  const ids = sheet.getRange(2, 1, last - 1, 1).getValues().map(function (r) { return String(r[0]); });
  const i = ids.indexOf(String(b.sessionId));
  if (i === -1) return { ok: false, error: 'not_found' };
  sheet.getRange(i + 2, 8).setValue(b.status);
  return { ok: true };
}

function linksFor_(folderId, id) {
  const out = [];
  const files = DriveApp.getFolderById(folderId).searchFiles("title contains '" + id.replace(/'/g, '') + "'");
  const list = [];
  while (files.hasNext()) list.push(files.next());
  list.sort(function (a, b) { return a.getName() < b.getName() ? -1 : 1; });
  list.forEach(function (f) { out.push(f.getUrl()); });
  return out;
}

function safeName_(name) {
  return String(name || 'file').replace(/[\\\/:*?"<>|]/g, '_').slice(0, 120);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
