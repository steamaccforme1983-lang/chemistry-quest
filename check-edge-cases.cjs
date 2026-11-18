const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {boot} = require('./check.cjs');

const outcomes = [];
async function check(name, run) {
 try {
  await run();
  outcomes.push({name, result:'PASS'});
 } catch (error) {
  outcomes.push({name, result:'FAIL', detail:error.message});
 }
}
const settle = () => new Promise(resolve => setImmediate(resolve));

(async () => {
 await check('Invalid saved topic values recover without losing XP', () => {
  for (const filter of ['map','length','constructor','__proto__','01','-1',[],{},true]) {
   const app = boot(JSON.stringify({version:2, xp:80, filter}));
   assert.equal(app.run('state.filter'), 'all', JSON.stringify(filter));
   assert.equal(app.run('state.xp'), 80);
  }
  const migrated = boot(JSON.stringify({version:2, filter:0}));
  assert.equal(migrated.run('state.filter'), '0');
  assert.equal(migrated.elements['topic-select'].value, '0');
 });

 await check('Correcting a middle review question advances past it', () => {
  const app = boot();
  app.run(`for (const q of QUESTIONS.slice(0,4)) {
   state.current=q.id; state.response=null; submit((q.answer+1)%4);
  }
  setFilter('review'); next(); submit(activeQuestion().answer); next();`);
  assert.equal(app.run('state.current'), '0-2');
  app.run('submit(activeQuestion().answer); next();');
  assert.equal(app.run('state.current'), '0-3');
  app.run('submit(activeQuestion().answer); next();');
  assert.equal(app.run('state.current'), '0-0');
  app.run('submit(activeQuestion().answer); next();');
  assert.equal(app.run('state.current'), null);
  // Account refreshes rebuild the review queue and retain a corrected current item.
  const restored=boot();
  restored.run(`for(const q of QUESTIONS.slice(0,4)) {
   state.current=q.id;state.response=null;submit((q.answer+1)%4);
  }
  setFilter('review');next();submit(activeQuestion().answer);
  reviewQueue=missed().map(q=>q.id);reviewQueue.unshift(state.current);next();`);
  assert.equal(restored.run('state.current'),'0-2');
 });

 await check('A slow login error locks the identity actually submitted', async () => {
  let reply;
  const app = boot(null,false,{
   TextEncoder, AbortSignal, window:{addEventListener(){}}, location:{reload(){}},
   fetch:async () => await new Promise(resolve => {
    reply = () => resolve({ok:false, status:429,
     json:async () => ({error:'Locked', retryAfter:300})});
   })
  });
  vm.runInContext(fs.readFileSync(__dirname+'/account.js','utf8'),app.context);
  app.elements['account-email'].value = 'first@example.invalid';
  app.elements['account-password'].value = 'test-only-password';
  const submitted = app.elements['account-form'].listeners.submit[0]({preventDefault(){}});
  app.elements['account-email'].value = 'second@example.invalid';
  reply(); await submitted;
  assert.equal(app.elements['account-submit'].disabled,false);
  app.elements['account-email'].value = 'first@example.invalid';
  app.elements['account-email'].listeners.input[0]();
  assert.equal(app.elements['account-submit'].disabled,true);
 });

 await check('Reopening battles ignores stale replies and starts a fresh request', async () => {
  const app = boot();
  const replies = [];
  app.context.battleRequest = async () => await new Promise(resolve => replies.push(resolve));
  vm.runInContext(fs.readFileSync(__dirname+'/battles.js','utf8')+
   '\nconst resetBattleSession=setupBattles(battleRequest);', app.context);
  app.elements['battles-open'].click();
  app.elements['battle-close'].click();
  app.elements['battles-open'].click();
  assert.equal(replies.length,2);
  replies[1]({playerCode:'CQ-222222222222',battles:[]}); await settle();
  replies[0]({playerCode:'CQ-111111111111',battles:[]}); await settle();
  assert.equal(app.elements['battle-player-code'].textContent,'CQ-222222222222');
  app.elements['battle-refresh'].click();
  assert.equal(replies.length,3);
  app.run('resetBattleSession()');
  replies[2]({playerCode:'CQ-333333333333',battles:[]}); await settle();
  assert.equal(app.elements['battle-player-code'].textContent,'');
 });

 await check('Three subjects survive 3000 seeded actions and save reloads', () => {
  let seed = 8831;
  const random = max => {
   seed = (Math.imul(seed,1664525)+1013904223) >>> 0;
   return seed % max;
  };
  for (const subject of ['chemistry','maths','physics']) {
   const extra = {location:{search:'?subject='+subject}};
   let app = boot(null,false,extra);
   for (let step=0; step<1000; step++) {
    const action = random(8);
    if (action===0) app.run('next()');
    if (action===1) app.run(`setFilter('${random(subject==='chemistry'?16:8)}')`);
    if (action===2) app.run("setFilter('review')");
    if (action===3) app.run(`startRetake('${random(2)?'random':'same'}')`);
    if (action===4) app.run(`submit(${random(4)})`);
    if (action===5) app.run('startChallenge();commitChallengeAnswer(state.challenge.index,CHALLENGE_QUESTIONS[state.challenge.index].answer)');
    if (action===6) app.run('if(state.challenge) {state.challenge.deadline=Date.now()-1;challengeTick()}');
    if (action===7) app.run("setFilter('all')");
    assert.ok(app.run('Number.isSafeInteger(state.xp) && state.xp>=0'));
    assert.ok(app.run('state.streak>=0 && state.wrongStreak>=0 && !(state.streak && state.wrongStreak)'));
    assert.ok(app.run('state.best>=state.streak'));
    assert.ok(app.run('!activeQuestion() || pool().some(q=>q.id===state.current)'));
    if (step%100===99) {
     const xp=app.run('state.xp');
     app=boot(app.saved(),false,extra);
     assert.equal(app.run('state.xp'),xp);
    }
   }
  }
 });

 await check('A blocked sign-out preserves the current battle session', async () => {
  let finishSync;
  const app=boot(null,false,{
   TextEncoder,AbortSignal,window:{addEventListener(){}},location:{reload(){}},
   fetch:async (url,options) => {
    const input=JSON.parse(options.body);
    let data;
    if(input.action==='login') data={token:'test-token',user:{id:'test',email:'test@example.invalid'},progress:{version:2,xp:0},revision:0};
    else if(input.progress?._battle) data={playerCode:'CQ-123456ABCDEF',battles:[]};
    else if(input.progress) return await new Promise(resolve=>{
     finishSync=()=>resolve({ok:true,status:200,json:async()=>({progress:input.progress,revision:1})});
    });
    else data={ok:true};
    return {ok:true,status:200,json:async()=>data};
   }
  });
  for(const file of ['battles.js','account.js']) vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),app.context);
  app.elements['account-email'].value='test@example.invalid';
  app.elements['account-password'].value='test-only-password';
  await app.elements['account-form'].listeners.submit[0]({preventDefault(){}});
  app.elements['battles-open'].click(); await settle();
  app.run("state.displayName='Updated name';save()");
  const syncing=app.elements['sync-now'].listeners.click[0](); await settle();
  app.elements['account-logout'].click();
  assert.equal(app.run('KEY'),'chemistry-quest-account-test');
  const playerCode=app.elements['battle-player-code'].textContent;
  finishSync(); await syncing;
  assert.equal(playerCode,'CQ-123456ABCDEF');
  app.elements['account-logout'].click(); await settle();
  assert.equal(app.run('KEY'),'chemistry-quest-v1');
  assert.equal(app.elements['battle-player-code'].textContent,'');
 });

 console.log(JSON.stringify(outcomes,null,2));
 if (outcomes.some(test => test.result==='FAIL')) process.exitCode=1;
})().catch(error => {console.error(error);process.exitCode=1});
