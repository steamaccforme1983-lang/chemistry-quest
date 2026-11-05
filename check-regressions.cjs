const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const {boot}=require('./check.cjs');
const outcomes=[];
function fixture({blocked=false,progress={version:2,xp:80},deferReads=false}={}){
 let cloud=progress,revision=0,reads=[],writes=[];
 const fetch=async(url,options)=>{
  const input=JSON.parse(options.body);let data;
  if(input.action==='login')data={token:'fixture-token',user:{id:'fixture',email:'fixture@example.invalid'},progress:cloud,revision};
  else if(input.action==='logout')data={ok:true};
  else if(input.progress){cloud=JSON.parse(JSON.stringify(input.progress));revision++;writes.push(cloud);data={progress:cloud,revision};}
  else if(deferReads){return await new Promise(resolve=>reads.push(()=>resolve({ok:true,status:200,json:async()=>({progress:JSON.parse(JSON.stringify(cloud)),revision})})));}
  else data={progress:cloud,revision};
  return {ok:true,status:200,json:async()=>JSON.parse(JSON.stringify(data))};
 };
 const app=boot(null,blocked,{fetch,TextEncoder,AbortSignal,window:{addEventListener(){}},location:{reload(){}}});
 vm.runInContext(fs.readFileSync(__dirname+'/account.js','utf8'),app.context);
 return {app,writes,reads,login:async()=>{app.elements['account-email'].value='fixture@example.invalid';app.elements['account-password'].value='temporary-fixture-password';await app.elements['account-form'].listeners.submit[0]({preventDefault(){}});}};
}
async function check(name,fn){try{await fn();outcomes.push({name,result:'PASS'})}catch(error){outcomes.push({name,result:'FAIL',detail:error.message});}}
(async()=>{
 await check('Cloud restore and saving work with blocked browser storage',async()=>{const f=fixture({blocked:true});await f.login();assert.equal(f.app.run('state.xp'),80);f.app.run('state.xp=100;save()');await f.app.elements['sync-now'].listeners.click[0]();assert.equal(f.writes.at(-1).xp,100);});
 await check('Guest progress survives signing out when storage is blocked',async()=>{const f=fixture({blocked:true,progress:null});f.app.run('state.xp=20;save()');await f.login();assert.equal(f.app.run('state.xp'),0);await f.app.elements['account-logout'].listeners.click[0]();assert.equal(f.app.run('state.xp'),20);});
 await check('Slow refresh preserves answers entered during loading',async()=>{
  const f=fixture({deferReads:true});await f.login();const refresh=f.app.elements['sync-now'].listeners.click[0]();
  f.app.run('state.xp=100;save()');f.reads.shift()();await refresh;
  assert.equal(f.app.run('state.xp'),100);
 });
 await check('Expired online challenges finish and sync',async()=>{
  const f=fixture({progress:{version:2,xp:20,challenge:{status:'active',deadline:Date.now()-1000,index:0,answers:{}}}});
  await f.login();assert.equal(f.app.run('state.challenge.status'),'finished');
  await f.app.elements['sync-now'].listeners.click[0]();assert.ok(f.writes.some(p=>p.challenge?.status==='finished'));
 });
 await check('New challenge timer clears stale low-time style',async()=>{
  const a=boot();a.run('startChallenge();state.challenge.deadline=Date.now()+1000;challengeTick()');
  a.elements['reset-dialog'].returnValue='reset';a.elements['reset-dialog'].listeners.close.forEach(fn=>fn());
  assert.ok(!a.elements['challenge-timer'].className.split(' ').includes('time-low'));
 });
 await check('Early challenge submission asks for confirmation',async()=>{
  const a=boot();a.run('startChallenge();document.getElementById("challenge-content").children.at(-1).children[1].click()');
  assert.equal(a.run('state.challenge.status'),'active');assert.equal(a.elements['challenge-finish-dialog'].open,true);
  a.elements['challenge-finish-dialog'].close('cancel');assert.equal(a.run('state.challenge.status'),'active');
  a.run('document.getElementById("challenge-content").children.at(-1).children[1].click()');
  a.elements['challenge-finish-dialog'].close('finish');assert.equal(a.run('state.challenge.status'),'finished');
 });
 await check('Timer expiry closes the early-finish dialog',async()=>{
  const a=boot();a.run('startChallenge();document.getElementById("challenge-content").children.at(-1).children[1].click();state.challenge.deadline=Date.now()-1;challengeTick()');
  assert.equal(a.elements['challenge-finish-dialog'].open,false);assert.equal(a.run('state.challenge.reason'),'expired');
 });
 await check('Challenge review includes the learner’s selected answer',async()=>{
  const a=boot();a.run('startChallenge();selectChallengeAnswer(0);document.getElementById("challenge-confirm").close("confirm");finishChallenge()');
  const details=a.elements['challenge-content'].children.find(x=>x.tagName==='DETAILS');
  assert.match(details.children[1].textContent,/Your answer: A\. 1\/6/);
 });
 await check('Reset warning describes account-wide reset when signed in',async()=>{
  const f=fixture();await f.login();f.app.elements['reset-button'].click();
  assert.match(f.app.elements['reset-description'].textContent,/account|online/i);
 });
 console.log(JSON.stringify(outcomes,null,2));if(outcomes.some(x=>x.result==='FAIL'))process.exitCode=1;
})();
