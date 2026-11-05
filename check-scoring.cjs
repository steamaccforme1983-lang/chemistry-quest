const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const {webcrypto}=require('node:crypto');const {boot}=require('./check.cjs');
const clone=x=>JSON.parse(JSON.stringify(x));
let cloud={version:2,xp:80,results:{},activity:{}},revision=0;
let mode='ok',pendingReply,requests=[],receipts=new Map();
const reply=data=>({ok:true,status:200,json:async()=>clone(data)});
const fetch=async(url,options)=>{
 const input=JSON.parse(options.body);requests.push(input);
 if(input.action==='login')return reply({token:'score-fixture-token',user:{id:'score-fixture',email:'qa@example.invalid'},progress:cloud,revision});
 if(input.action==='logout')return reply({ok:true});
 const event=input.progress?._scoreEvent;
 if(event){
  if(mode==='offline')throw Error('Offline fixture');
  let receipt=receipts.get(event.eventId);
  if(!receipt){
   if(event.kind==='practice'){
    // Deliberately disagree with the client: response is server authority.
    receipt={kind:event.kind,id:event.id,choice:event.choice,correct:false,earnedNow:false,delta:0,bonus:false,penalty:false};
    cloud={...input.progress.view,xp:80,streak:0,wrongStreak:1,best:0,results:{[event.id]:{choice:event.choice,earned:false}},activity:{0:{correct:0,wrong:1}},response:receipt};
   }else if(event.kind==='challenge-start'){
    cloud={...cloud,challenge:{status:'active',deadline:Date.now()+1800000,index:0,answers:{}}};receipt={kind:event.kind};
   }else if(event.kind==='challenge-answer'){
    cloud={...cloud,xp:150,challenge:{...cloud.challenge,answers:{0:{choice:event.choice,xp:70}}}};
    receipt={kind:event.kind,id:event.id,choice:event.choice,correct:true,earnedNow:true,delta:70,bonus:false,penalty:false};
   }else if(event.kind==='challenge-finish'){cloud={...cloud,challenge:{...cloud.challenge,status:'finished',reason:'submitted'}};receipt={kind:event.kind};}
   else if(event.kind==='reset'){cloud={version:2,xp:0};receipt={kind:event.kind};}
   receipts.set(event.eventId,receipt);revision++;
  }
  const data={progress:clone(cloud),revision,receipt,serverScoring:true};
  if(mode==='delay')return await new Promise(resolve=>{pendingReply=()=>resolve(reply(data));});
  if(mode==='lost-reply'){mode='ok';throw Error('Response lost after commit');}
  return reply(data);
 }
 if(input.progress){const protectedCopy=clone(cloud);cloud={...input.progress,...protectedCopy};revision++;}
 return reply({progress:cloud,revision,serverScoring:true});
};
const app=boot(null,false,{fetch,crypto:webcrypto,TextEncoder,AbortSignal,window:{addEventListener(){}},location:{reload(){}}});
vm.runInContext(fs.readFileSync(__dirname+'/account.js','utf8'),app.context);
const click=async id=>app.elements[id].listeners.click[0]();
const settle=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
(async()=>{
 app.elements['account-email'].value='qa@example.invalid';app.elements['account-password'].value='test-only-password';
 await app.elements['account-form'].listeners.submit[0]({preventDefault(){}});
 mode='delay';const answer=app.run('commitAnswer(activeQuestion().answer)');await settle();
 assert.equal(app.run('state.xp'),80,'Do not award locally before a reply');
 assert.equal(app.run("document.querySelector('.app').inert"),true);
 const duplicate=app.run('commitAnswer(activeQuestion().answer)');await duplicate;
 assert.equal(requests.filter(r=>r.progress?._scoreEvent).length,1,'Double click sends one answer');
 pendingReply();await answer;mode='ok';
 assert.equal(app.run('state.xp'),80,'Trust server reward, not local answer key');
 assert.equal(app.elements['popup-title'].textContent,'Not quite. Try again!');
 assert.equal(app.run("document.querySelector('.app').inert"),false);
 app.run('state.xp=999999;save()');await click('sync-now');
 assert.equal(app.run('state.xp'),80,'Restore server score after forged upload');
 await app.run('startChallenge()');assert.equal(app.run('state.challenge.status'),'active');
 mode='lost-reply';await app.run('commitChallengeAnswer(0,1)');
 assert.equal(app.run('state.xp'),80,'Uncertain request must not award optimistic XP');
 const eventId=requests.at(-1).progress._scoreEvent.eventId;
 await click('sync-now');assert.equal(app.run('state.xp'),150);
 assert.equal(requests.at(-1).progress._scoreEvent.eventId,eventId,'Retry uses same idempotency key');
 await app.run('finishChallenge()');assert.equal(app.run('state.challenge.status'),'finished');
 mode='offline';app.run('next()');await app.run('commitAnswer(activeQuestion().answer)');
 assert.equal(app.run('state.xp'),150,'Offline account answers award no unverified XP');
 mode='ok';await click('sync-now');
 await app.run("accountScoreAction('reset',{})");assert.equal(app.run('state.xp'),0);
 assert.equal(app.elements['import-guest'].hidden,true);
 console.log('PASS: server-authoritative client rewards, no optimistic/offline XP, double-click guard, forged-cache correction, server challenge flow, lost-response retry and account reset.');
})().catch(e=>{console.error(e);process.exitCode=1});
