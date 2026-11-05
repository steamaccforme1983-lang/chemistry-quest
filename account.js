'use strict';
(() => {
 const ENDPOINT='https://bmgrefwvjqaqbljieqme.supabase.co/functions/v1/chemistry-accounts';
 const GUEST='chemistry-quest-v1',SESSION='chemistry-quest-session';
 let session=null,meta={revision:0,dirty:false},mode='login',applying=false,inFlight=false;
 let guestMemory=JSON.parse(JSON.stringify(state));
 let saveTimer,change=0,epoch=0,conflict=false,blockedUntil=0,blockedIdentity='',busy=false;
 const read=(key,fallback=null)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
 const store=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}};
 const metaKey=()=>`${KEY}-sync`;
 const status=text=>{$('sync-status').textContent=text;};
 const deviceSafety=()=>storageOK?'Your progress is kept on this device.':'Your progress is kept in this tab only. Keep it open until syncing succeeds.';
 function accountUI(){
  $('account-open').textContent=session?'My account':'Sign in · Save online';
  $('account-tabs').hidden=!!session;$('account-form').hidden=!!session;$('account-manage').hidden=!session;
  $('account-title').textContent=session?'Your study account.':mode==='signup'?'Create your account.':mode==='recover'?'Reset your password.':'Welcome back.';
  if(session)$('account-identity').textContent=session.user.email;
  $('sync-conflict').hidden=!conflict;$('conflict-actions').hidden=!conflict;
 }
 async function request(action,args={},token=session?.token){
  const r=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify({action,...args}),signal:AbortSignal.timeout(18000)});
  const data=await r.json();if(!r.ok){const error=new Error(data.error||'Please try again.');Object.assign(error,data,{status:r.status});throw error;}return data;
 }
 function replaceProgress(progress){
  const input=progress||fresh();let expiredOnLoad=false;
  applying=true;
  try{state=load(input);visitCounts={correct:0,wrong:0};pendingAnswer=null;reviewQueue=state.filter==='review'?missed().map(q=>q.id):[];
   if(state.filter==='review'&&state.response&&!reviewQueue.includes(state.current))reviewQueue.unshift(state.current);
   dismissAnswerPopup();render();validateChallenge();renderChallenge();challengeTick();expiredOnLoad=input.challenge?.status==='active'&&state.challenge?.status==='finished';save();
  }finally{applying=false;}
  if(expiredOnLoad&&session)globalThis.queueCloudSave();
 }
 function cacheMeta(){store(metaKey(),meta);}
 function flagConflict(){conflict=true;status('Sync paused: another device saved newer progress.');accountUI();}
 globalThis.queueCloudSave=()=>{
  if(KEY===GUEST)guestMemory=JSON.parse(JSON.stringify(state));
  if(!session||applying)return;
  change++;meta.dirty=true;cacheMeta();status(conflict?`Sync paused. ${deviceSafety()}`:storageOK?'Changes saved on this device. Syncing…':'Progress kept in this tab. Syncing…');
  clearTimeout(saveTimer);saveTimer=setTimeout(flush,1200);
 };
 async function flush(){
  if(!session||applying||inFlight||conflict)return;
  if(!meta.dirty){status('Up to date.');return;}
  const ticket=epoch,sequence=change,token=session.token;
  inFlight=true;
  try{
   const data=await request('progress',{progress:JSON.parse(JSON.stringify(state)),revision:meta.revision},token);
   if(ticket!==epoch)return;
   meta.revision=data.revision;meta.dirty=sequence!==change;cacheMeta();
   status(meta.dirty?'Syncing newer changes…':'Progress saved online ✓');
  }catch(error){if(ticket!==epoch)return;if(error.status===409)flagConflict();else status(error.status===401?`Session expired. ${deviceSafety()} Sign in again to sync.`:`Couldn’t sync. ${deviceSafety()} Use Sync now when online.`);}
  finally{inFlight=false;if(ticket===epoch&&meta.dirty&&!conflict&&sequence!==change)saveTimer=setTimeout(flush,1200);}
 }
 async function receiveAccount(data){
  if(KEY===GUEST)guestMemory=JSON.parse(JSON.stringify(state));
  epoch++;clearTimeout(saveTimer);session={token:data.token,user:data.user};store(SESSION,session);
  KEY=`chemistry-quest-account-${session.user.id}`;
  const local=read(KEY),savedMeta=read(metaKey(),{revision:0,dirty:false});
  meta={revision:data.revision,dirty:false};conflict=false;
  if(savedMeta.dirty&&local){meta=savedMeta;replaceProgress(local);if(savedMeta.revision!==data.revision)flagConflict();else{status('Syncing saved device progress…');setTimeout(flush,0);}}
  else {replaceProgress(data.progress||fresh());status(data.progress?'Your saved progress is ready.':'Account ready. Start fresh, or import this browser’s guest progress.');}
  cacheMeta();$('import-guest').hidden=!!data.progress||meta.dirty;
  accountUI();
 }
 function changeMode(next){
  mode=next;accountUI();$('account-message').textContent='';$('account-password').value='';$('account-recovery').value='';
  $('recovery-input-wrap').hidden=mode!=='recover';$('account-recovery').required=mode==='recover';
  $('account-password').minLength=mode==='login'?1:12;
  $('account-password').autocomplete=mode==='login'?'current-password':'new-password';
  $('password-label').textContent=mode==='recover'?'New password':'Password';
  $('account-submit').textContent=mode==='signup'?'Create account →':mode==='recover'?'Reset password →':'Sign in →';
  $('account-help').textContent=mode==='signup'?'Use at least 12 characters (at most 72 bytes). Save the private recovery code shown after signup.':mode==='recover'?'Use the recovery code you saved at signup. This resets your password, replaces the recovery code, and signs out other sessions.':'Sign in to your Chemistry Quest account. Other services’ passwords won’t work here.';
  updateCountdown();
 }
 function identity(){return `${mode}:${$('account-email').value.trim().toLowerCase()}`;}
 function updateCountdown(){
  const seconds=Math.max(0,Math.ceil((blockedUntil-Date.now())/1000));
  const locked=seconds>0&&blockedIdentity===identity();
  $('account-submit').disabled=busy||locked;
  if(locked)$('account-message').textContent=`Too many failed attempts. Try again in ${Math.floor(seconds/60)}m ${seconds%60}s. The wait also applies on other devices.`;
  else if(blockedIdentity===identity()&&blockedUntil){blockedUntil=0;$('account-message').textContent='You can try again now. You have 3 attempts.';}
 }
 $('account-form').addEventListener('submit',async event=>{
  event.preventDefault();if(busy||Date.now()<blockedUntil&&blockedIdentity===identity())return;
  busy=true;updateCountdown();$('account-message').textContent='Please wait…';
  try{
   const password=$('account-password').value;
   if(new TextEncoder().encode(password).length>72)throw new Error('Password must be at most 72 bytes.');
   const data=await request(mode,{email:$('account-email').value.trim(),password,...(mode==='recover'?{recovery:$('account-recovery').value.trim()}:{})},null);
   $('account-password').value='';$('account-recovery').value='';blockedUntil=0;
   await receiveAccount(data);$('account-message').textContent='';
   if(data.recoveryCode){$('account-dialog').close();$('new-recovery-code').value=data.recoveryCode;$('recovery-saved-dialog').showModal();}
  }catch(error){
   if(error.retryAfter){blockedUntil=Date.now()+error.retryAfter*1000;blockedIdentity=identity();}
   $('account-message').textContent=error.message+(Number.isInteger(error.attemptsLeft)?` ${error.attemptsLeft} attempts left.`:'');
  }finally{busy=false;updateCountdown();}
 });
 $('account-open').addEventListener('click',()=>{accountUI();$('account-dialog').showModal();});
 $('account-close').addEventListener('click',()=>{if(!busy)$('account-dialog').close();});
 $('account-dialog').addEventListener('cancel',event=>{if(busy)event.preventDefault();});
 for(const name of ['login','signup','recover'])$(`tab-${name}`).addEventListener('click',()=>{if(!busy)changeMode(name);});
 $('account-email').addEventListener('input',updateCountdown);
 $('recovery-saved-dialog').addEventListener('cancel',event=>event.preventDefault());
 $('recovery-saved').addEventListener('click',()=>{$('new-recovery-code').value='';$('recovery-saved-dialog').close();$('account-dialog').showModal();});
 $('sync-now').addEventListener('click',async()=>{
  if(meta.dirty){await flush();return;}
  const ticket=epoch,sequence=change;
  try{const data=await request('progress');if(!session||ticket!==epoch)return;if(sequence!==change||meta.dirty){if(meta.dirty)await flush();return;}meta.revision=data.revision;replaceProgress(data.progress||fresh());cacheMeta();status('Loaded your latest online progress ✓');}catch{if(ticket===epoch)status(`Could not refresh. ${deviceSafety()}`);}
 });
 $('load-cloud').addEventListener('click',async()=>{
  const ticket=epoch,sequence=change;
  try{const data=await request('progress');if(ticket!==epoch)return;if(sequence!==change){status('New answers were entered while loading. They are kept; load the online copy again when ready.');return;}const backedUp=store(`${KEY}-before-cloud-load`,state);meta={revision:data.revision,dirty:false};conflict=false;replaceProgress(data.progress||fresh());cacheMeta();accountUI();status(backedUp?'Online progress loaded. The previous device copy is backed up locally.':'Online progress loaded. Browser storage is unavailable, so the previous device copy could not be backed up.');}catch{if(ticket===epoch)status('Could not load online progress. Try again.');}
 });
 $('download-local').addEventListener('click',()=>{
  const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='chemistry-quest-device-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 $('import-guest').addEventListener('click',async()=>{
  const guest=read(GUEST)||guestMemory;if(!guest){status('No guest progress was found in this browser.');return;}
  if(inFlight)return;
  const ticket=epoch,sequence=change;
  try{const data=await request('progress');if(ticket!==epoch)return;if(sequence!==change){status('New answers were entered while loading. Import cancelled to keep them.');return;}if(data.progress){status('This account already has online progress. Import was cancelled.');return;}meta.revision=data.revision;replaceProgress(guest);meta.dirty=true;cacheMeta();$('import-guest').hidden=true;await flush();}catch{if(ticket===epoch)status('Could not import. Your guest progress has not been replaced.');}
 });
 $('account-logout').addEventListener('click',async()=>{
  if(inFlight){status('Wait for the current sync to finish, then sign out.');return;}
  const token=session?.token;epoch++;clearTimeout(saveTimer);session=null;
  try{localStorage.removeItem(SESSION)}catch{}
  KEY=GUEST;conflict=false;meta={revision:0,dirty:false};replaceProgress(read(GUEST)||guestMemory||fresh());accountUI();changeMode('login');
  if(token)try{await request('logout',{},token)}catch{$('account-message').textContent='Signed out on this browser. The server session expires within 7 days.';}
 });
 window.addEventListener('online',flush);
 window.addEventListener('storage',event=>{if(event.key===SESSION){location.reload();}});
 window.addEventListener('beforeunload',event=>{if(session&&meta.dirty){event.preventDefault();event.returnValue='';}});
 setInterval(updateCountdown,1000);changeMode('login');
 const previous=read(SESSION);
 if(previous?.token&&previous?.user?.id){
  const app=document.querySelector('.app');app.inert=true;$('account-open').disabled=true;
  request('progress',{},previous.token).then(data=>receiveAccount({...data,token:previous.token})).catch(error=>{
   if(error.status===401){try{localStorage.removeItem(SESSION)}catch{}status('Please sign in again.');}
   else {session=previous;KEY=`chemistry-quest-account-${previous.user.id}`;meta=read(metaKey(),{revision:0,dirty:false});replaceProgress(read(KEY)||fresh());status('Offline. Your account progress is saved on this device; sync when online.');accountUI();}
  }).finally(()=>{app.inert=false;$('account-open').disabled=false;});
 }
})();
