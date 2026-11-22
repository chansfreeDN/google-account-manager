// 시험: NODE_PATH=$(npm root -g) node test-e2e.js <사진.jpg>  (Code.gs를 가짜 구글 서비스로 실행하고 앱을 끝까지 눌러봄)
// Runs the real Code.gs in Node with in-memory Google services, and the real app in Chromium.
const http=require('http'),fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const {chromium,devices}=require('playwright');
const ROOT='/home/user/google-account-manager/rec-sync';
const OUT=path.join(require('os').tmpdir(),'rec-sync-test-out'); fs.rmSync(OUT,{recursive:true,force:true}); fs.mkdirSync(OUT);
// ---- mock Google services ----
const props={}; const folders={}; const rows=[['ID','녹음일시','길이(초)','장소/메모','녹음 텍스트','녹음파일 링크','사진 링크','처리상태','위치']];
const mkFile=(fid,blob)=>({getId:()=>blob.name,getName:()=>blob.name,getUrl:()=>`https://drive/${fid}/${blob.name}`});
const iter=a=>{let i=0;return{hasNext:()=>i<a.length,next:()=>a[i++]}};
const folder=id=>{folders[id]=folders[id]||[];return{getName:()=>id,
  getFilesByName:n=>iter(folders[id].filter(b=>b.name===n).map(b=>mkFile(id,b))),
  searchFiles:q=>{const t=q.match(/contains '(.*)'/)[1];return iter(folders[id].filter(b=>b.name.includes(t)).map(b=>mkFile(id,b)));},
  createFile:b=>{folders[id].push(b);fs.writeFileSync(path.join(OUT,b.name),b.bytes);return mkFile(id,b);}}};
const sheet={getName:()=>'수신함',getLastRow:()=>rows.length,
  getRange:(r,c,nr,nc)=>({getValues:()=>rows.slice(r-1,r-1+nr).map(x=>x.slice(c-1,c-1+nc)),setValue:v=>{rows[r-1][c-1]=v;}}),
  appendRow:a=>rows.push(a)};
const ctx={
  PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k]||null,setProperty:(k,v)=>props[k]=v,deleteProperty:k=>delete props[k]})},
  SpreadsheetApp:{openById:()=>({getSheetByName:()=>sheet})},
  DriveApp:{getFolderById:folder},
  Utilities:{getUuid:()=>crypto.randomUUID(),base64Decode:s=>Buffer.from(s,'base64'),newBlob:(bytes,mime,name)=>({bytes,mime,name})},
  LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},
  ContentService:{MimeType:{JSON:'json'},createTextOutput:t=>({setMimeType(){return t;}})},
  Logger:{log:m=>console.log('[gs]',m)}, JSON, String, Number, Math, Date,
};
vm.createContext(ctx); vm.runInContext(fs.readFileSync(ROOT+'/apps-script/Code.gs','utf8'),ctx);
ctx.setup(); const TOKEN=props.TOKEN;
// ---- server: app files + /exec -> doPost ----
const srv=http.createServer((req,res)=>{
  if(req.url==='/exec'&&req.method==='POST'){let b=[];req.on('data',d=>b.push(d));req.on('end',()=>{
    const out=ctx.doPost({postData:{contents:Buffer.concat(b).toString()}});
    res.writeHead(200,{'content-type':'application/json'});res.end(out);});return;}
  let p=path.join(ROOT,decodeURIComponent(req.url.split('?')[0]));if(p.endsWith('/'))p+='index.html';
  fs.readFile(p,(e,d)=>{if(e){res.writeHead(404);return res.end();}res.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.png':'image/png'}[path.extname(p)]||'application/octet-stream'});res.end(d);});
}).listen(8766);
(async()=>{
  const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
  const c=await b.newContext({...devices['iPhone 13'],permissions:['microphone','geolocation'],geolocation:{latitude:35.644,longitude:139.699,accuracy:12}});
  const pg=await c.newPage(); pg.on('pageerror',e=>console.log('PAGEERR',e.message));
  await pg.goto('http://localhost:8766/');
  // enter settings like the user would
  await pg.fill('#urlInput','http://localhost:8766/exec'); await pg.fill('#tokenInput',TOKEN);
  await pg.click('#saveSettings'); await pg.waitForTimeout(800);
  console.log('settings msg:',await pg.textContent('#settingsMsg'));
  await pg.click('#closeSettings');
  await pg.fill('#memo','[테스트] 나카메구로 스타벅스 리저브 로스터리 · 라떼2+빵3 3,597엔');
  await pg.setInputFiles('#photoInput',process.argv[2]);
  await pg.waitForTimeout(500);
  await pg.click('#recBtn'); await pg.waitForTimeout(4000); await pg.click('#recBtn');
  await pg.waitForTimeout(2500);
  await pg.click('.blog-btn'); await pg.waitForTimeout(1500);
  await pg.screenshot({path:path.join(OUT,'e2e.png')});
  console.log('history:',(await pg.textContent('#history')).replace(/\s+/g,' '));
  const orig=fs.readFileSync(process.argv[2]);
  for(const f of fs.readdirSync(OUT)){const buf=fs.readFileSync(path.join(OUT,f));
    console.log('file',f,buf.length,'bytes', f.includes('photo')?('identical to original: '+buf.equals(orig)):'');}
  console.log('ROWS',JSON.stringify(rows.slice(1),null,0));
  await b.close(); srv.close();
})();
