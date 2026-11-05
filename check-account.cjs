const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');
const {boot}=require('./check.cjs');
const calls=[];let nextUser='A',cloud={A:{version:2,xp:0},B:{version:2,xp:80}},revisions={A:0,B:2},forceConflict=false;
const fetch=async(url,options)=>{
 const input=JSON.parse(options.body);const token=options.headers.Authorization||'';
 calls.push({input,token});let data,status=200;
 if(['login','signup','recover'].includes(input.action))data={token:'token-'+nextUser,user:{id:nextUser,email:nextUser+'@example.invalid'},progress:cloud[nextUser],revision:revisions[nextUser],...(input.action!=='login'?{recoveryCode:'secret-code-never-store'}:{})};
 else if(input.action==='logout')data={ok:true};
 else if(input.action==='progress'){
  const user=token.slice(-1);
  if(input.progress){if(forceConflict){status=409;data={error:'Newer progress exists.'};}else{cloud[user]=input.progress;revisions[user]++;data={progress:cloud[user],revision:revisions[user]};}}
  else data={user:{id:user,email:user+'@example.invalid'},progress:cloud[user],revision:revisions[user]};
 }
 return {ok:status===200,status,json:async()=>data};
};
const app=boot(null,false,{fetch,TextEncoder,AbortSignal,window:{addEventListener(){}},location:{reload(){}}});
app.run('state.xp=20;save()');
vm.runInContext(fs.readFileSync(__dirname+'/account.js','utf8'),app.context);
const submit=async()=>await app.elements['account-form'].listeners.submit[0]({preventDefault(){}});
const click=async id=>await app.elements[id].listeners.click[0]();
(async()=>{
 await click('tab-signup');app.elements['account-email'].value='A@example.invalid';app.elements['account-password'].value='do-not-store-this-password';await submit();
 assert.equal(app.run('KEY'),'chemistry-quest-account-A');
 assert.equal(app.snapshot().xp,0);
 assert.equal(app.elements['new-recovery-code'].value,'secret-code-never-store');
 assert.ok(![...app.storage.values()].some(s=>s.includes('do-not-store-this-password')||s.includes('secret-code-never-store')));
 await click('recovery-saved');await click('import-guest');
 assert.equal(app.snapshot().xp,0);assert.equal(cloud.A.xp,0);
 await click('account-logout');assert.equal(app.run('KEY'),'chemistry-quest-v1');assert.equal(app.snapshot().xp,20);
 nextUser='B';await click('tab-login');app.elements['account-email'].value='B@example.invalid';app.elements['account-password'].value='temporary-password';await submit();
 assert.equal(app.snapshot().xp,80);assert.equal(app.run('KEY'),'chemistry-quest-account-B');
 await click('account-logout');assert.equal(app.snapshot().xp,20);
 nextUser='A';app.elements['account-email'].value='A@example.invalid';app.elements['account-password'].value='temporary-password';await submit();
 assert.equal(app.snapshot().xp,0);
 app.run('state.xp=40;save()');forceConflict=true;await click('sync-now');
 assert.equal(app.snapshot().xp,40);assert.equal(cloud.A.xp,0);
 assert.equal(app.elements['sync-conflict'].hidden,false);
 forceConflict=false;await click('load-cloud');assert.equal(app.snapshot().xp,0);
 assert.equal(JSON.parse(app.storage.get('chemistry-quest-account-A-before-cloud-load')).xp,40);
 assert.ok(calls.filter(x=>x.input.action==='progress').every(x=>x.token==='Bearer token-A'||x.token==='Bearer token-B'));
 console.log('PASS: account isolation, blocked guest XP import, logout, cloud restore, conflict handling, backup and no stored passwords/recovery codes.');
})().catch(error=>{console.error(error);process.exitCode=1});
