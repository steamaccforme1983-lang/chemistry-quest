const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const path=require('node:path');
const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));
assert.equal(manifest.display,'standalone');assert.equal(manifest.scope,'./');assert.equal(manifest.start_url,'./');assert.equal(manifest.id,'./');
for(const icon of manifest.icons){const b=fs.readFileSync(icon.src);const size=Number(icon.sizes.split('x')[0]);assert.equal(b.readUInt32BE(16),size);assert.equal(b.readUInt32BE(20),size);}
assert.ok(manifest.icons.some(i=>i.purpose==='maskable'));
const handlers={},entries=new Map();const deleted=[];
const cache={addAll:async urls=>{for(const url of urls){const relative=new URL(url).pathname.replace('/chemistry-quest/','')||'index.html';assert.ok(fs.existsSync(path.join('.',relative)),relative);entries.set(url,{url});}},match:async request=>entries.get(typeof request==='string'?request:request.url)};
const cacheName='chemistry-quest:/chemistry-quest/:2026-11-05-app-2';
const worker=vm.createContext({URL,self:{registration:{scope:'https://example.test/chemistry-quest/'},location:{origin:'https://example.test'},addEventListener:(name,fn)=>handlers[name]=fn},caches:{open:async()=>cache,keys:async()=>[cacheName,'chemistry-quest:/chemistry-quest/:old','other-app-cache'],delete:async name=>deleted.push(name)},fetch:async()=>{throw Error('network unavailable')}});
vm.runInContext(fs.readFileSync('sw.js','utf8'),worker);
async function lifetime(name){let work;handlers[name]({waitUntil:p=>work=p});await work;}
async function fetchEvent(request){let work;handlers.fetch({request,respondWith:p=>work=p});return work?await work:null;}
function fixture({supported=true,secure=true}={}){
 const elements={},events={};const get=id=>elements[id]||=( {hidden:false,textContent:'',listeners:{},addEventListener(name,fn){this.listeners[name]=fn},showModal(){this.open=true}});
 const media={matches:false,addEventListener(){}};
 const registration={active:{},waiting:null,addEventListener(){}};
 const navigator={onLine:true,...(supported?{serviceWorker:{register:async(url,options)=>{assert.equal(url,'./sw.js');assert.equal(options.scope,'./');return registration;}}}:{})};
 const window={isSecureContext:secure,matchMedia:()=>media,addEventListener:(name,fn)=>events[name]=fn};
 vm.runInNewContext(fs.readFileSync('install.js','utf8'),{document:{getElementById:get},window,navigator});
 return {get,events,navigator,media};
}
(async()=>{
 await lifetime('install');await lifetime('activate');assert.deepEqual(deleted,['chemistry-quest:/chemistry-quest/:old']);
 assert.ok(await fetchEvent({method:'GET',url:'https://example.test/chemistry-quest/',mode:'navigate'}),'Offline navigation uses cached shell');
 assert.ok(await fetchEvent({method:'GET',url:'https://example.test/chemistry-quest/app.js',mode:'cors'}));
 assert.equal(await fetchEvent({method:'POST',url:'https://example.test/chemistry-quest/account',mode:'cors'}),null);
 assert.equal(await fetchEvent({method:'GET',url:'https://api.example.test/progress',mode:'cors'}),null);
 assert.equal(await fetchEvent({method:'GET',url:'https://example.test/another-app/private',mode:'cors'}),null);
 const f=fixture();await Promise.resolve();await Promise.resolve();assert.match(f.get('install-status').textContent,/offline/);
 f.get('install-open').listeners.click();assert.equal(f.get('install-dialog').open,true);
 let prompted=0,prevented=false;f.events.beforeinstallprompt({preventDefault(){prevented=true},prompt:async()=>prompted++,userChoice:Promise.resolve({outcome:'dismissed'})});
 assert.equal(prevented,true);assert.equal(prompted,0,'Never open OS install prompt automatically');assert.equal(f.get('install-now').hidden,false);
 await f.get('install-now').listeners.click();assert.equal(prompted,1);assert.match(f.get('install-status').textContent,/later/);
 f.navigator.onLine=false;f.events.offline();assert.equal(f.get('app-connection').hidden,false);
 f.media.matches=true;f.events.appinstalled();assert.equal(f.get('install-open').textContent,'App info');
 const unsupported=fixture({supported:false});assert.match(unsupported.get('install-status').textContent,/supported browser/);
 console.log('PASS: install manifest and PNG sizes, offline shell, scoped cache cleanup, API exclusion, click-only install prompt, dismissal, standalone and unsupported-browser fallback.');
})().catch(error=>{console.error(error);process.exitCode=1});
