// Dependency-free interaction checks using a small DOM adapter. Browser visual QA is separate.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const {TOPICS,QUESTIONS} = require('./questions.js');
assert.equal(TOPICS.length,16);assert.equal(QUESTIONS.length,64);
assert.equal(new Set(QUESTIONS.map(q=>q.id)).size,64);
for(let t=0;t<16;t++)assert.equal(QUESTIONS.filter(q=>q.topic===t).length,4);
for(const q of QUESTIONS){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.ok(q.answer>=0&&q.answer<4);assert.ok(q.explanation.length>30);}
class Element {
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.attrs={};this.dataset={};this.style={};this.hidden=false;this.disabled=false;this.textContent='';this.className='';this.value='';this.classList={toggle:(s,on)=>{const set=new Set(this.className.split(' '));on?set.add(s):set.delete(s);this.className=[...set].join(' ');},add:s=>{this.className+=' '+s},remove:s=>{this.className=this.className.split(' ').filter(x=>x!==s).join(' ')}};}
 append(...items){this.children.push(...items)}
 replaceChildren(...items){this.children=[...items]}
 setAttribute(k,v){this.attrs[k]=v}
 addEventListener(k,fn){(this.listeners[k]??=[]).push(fn)}
 querySelector(tag){return this.children.find(x=>x.tagName===tag.toUpperCase())}
 focus(){}
 showModal(){this.open=true}
 close(value=''){this.returnValue=value;this.open=false;(this.listeners.close||[]).forEach(fn=>fn())}
 click(){if(!this.disabled)(this.listeners.click||[]).forEach(fn=>fn({target:this}))}
}
function boot(saved=null,blocked=false,extra={}){
 let persisted=saved;const elements={},storage=new Map();if(saved)storage.set('chemistry-quest-v1',saved);
 const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
 for(const [tag,id] of html.matchAll(/<[^>]*\bid="([^"]+)"[^>]*>/g)){elements[id]=new Element();elements[id].hidden=/\bhidden(?:\s|>)/.test(tag);}
 const appElement=new Element('main');
 const document={getElementById:id=>elements[id],createElement:tag=>new Element(tag),createTextNode:text=>({textContent:text}),body:new Element('body'),querySelector:selector=>selector==='.app'?appElement:null,addEventListener(){},querySelectorAll:selector=>selector==='.topic'?elements.topics.children.filter(x=>x.className.split(' ').includes('topic')):[]};
 const context=vm.createContext({document,localStorage:{getItem(k){if(blocked)throw Error('disabled');return storage.get(k)||null},setItem(k,v){if(blocked)throw Error('disabled');storage.set(k,v);persisted=v},removeItem(k){storage.delete(k)}},setTimeout:()=>1,setInterval:()=>1,clearTimeout(){},console,...extra});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'questions.js'),'utf8'),context);
 vm.runInContext(fs.readFileSync(path.join(__dirname,'variants.js'),'utf8'),context);
 vm.runInContext(fs.readFileSync(path.join(__dirname,'app.js'),'utf8'),context);
 vm.runInContext(fs.readFileSync(path.join(__dirname,'challenge.js'),'utf8'),context);
 vm.runInContext("function submit(choice){answer(choice);if(document.getElementById('confirm-answer').open)document.getElementById('confirm-answer').close('confirm')}",context);
 return {run:code=>vm.runInContext(code,context),snapshot:()=>JSON.parse(storage.get(vm.runInContext('KEY',context))),saved:()=>storage.get(vm.runInContext('KEY',context)),elements,storage,context};
}
const app=boot();
assert.equal(app.snapshot().xp,0);
// Real option click: answer correctly, then attempt a second answer while locked.
app.run("document.getElementById('question-body').children[2].children[3].click()");
assert.equal(app.snapshot().xp,0);assert.equal(app.snapshot().streak,0);
assert.equal(app.elements['confirm-answer'].open,true);
app.elements['confirm-answer'].close('cancel');assert.equal(app.snapshot().xp,0);
assert.equal(app.elements['count-answered'].textContent,0);
app.run('submit(3)');
assert.equal(app.snapshot().xp,20);assert.equal(app.snapshot().streak,1);
assert.equal(app.elements['count-answered'].textContent,1);
assert.equal(app.elements['count-correct'].textContent,1);
assert.equal(app.elements['answer-popup'].hidden,false);
assert.equal(app.elements['popup-xp'].textContent,'+20 XP');
assert.match(app.elements['popup-title'].textContent,/Correct!/);
assert.equal(app.elements['popup-total'].textContent,'Total: 20 XP');
assert.equal(app.elements['answer-confetti'].hidden,false);
assert.ok(app.elements['answer-confetti'].children.length>0);
app.run('submit(0)');assert.equal(app.snapshot().xp,20);assert.equal(app.snapshot().streak,1);
// Reload preserves both progress and the locked response.
const reload=boot(app.saved());assert.equal(reload.snapshot().xp,20);
reload.run('submit(3)');assert.equal(reload.snapshot().streak,1);
reload.run('next();submit(0)');assert.equal(reload.snapshot().streak,0);
assert.equal(reload.elements['popup-xp'].textContent,'+0 XP');
assert.match(reload.elements['popup-detail'].textContent,/Correct answer: C. N/);
assert.match(reload.elements['popup-title'].textContent,/Try again!/);
assert.equal(reload.elements['answer-confetti'].hidden,true);
assert.equal(reload.elements['answer-confetti'].children.length,0);
reload.run("setFilter('review')");assert.equal(reload.snapshot().current,'0-1');
reload.run('submit(2)');assert.equal(reload.snapshot().xp,40);
reload.run('next()');assert.equal(reload.snapshot().current,null);
reload.run('next()');assert.equal(reload.snapshot().filter,'all');
// Revisiting a previously mastered question never duplicates XP.
reload.run("state.current='0-0';state.response=null;render();submit(3)");
assert.equal(reload.snapshot().xp,40);
assert.equal(reload.elements['popup-xp'].textContent,'+0 XP');
assert.match(reload.elements['popup-detail'].textContent,/Already mastered/);
reload.elements['dismiss-answer-popup'].click();assert.equal(reload.elements['answer-popup'].hidden,true);
assert.equal(reload.elements['answer-confetti'].children.length,0);
reload.run("setFilter('15')");assert.ok(reload.snapshot().current.startsWith('15-'));
// Full-bank completion proves XP and level boundaries, and every topic is navigable.
const full=boot();
full.run("for(const q of QUESTIONS){state.filter=String(q.topic);state.current=q.id;state.response=null;submit(q.answer)}");
assert.equal(full.snapshot().xp,1320);assert.equal(full.elements.level.textContent,14);assert.equal(full.snapshot().best,64);
full.run("state.filter='all';state.current='0-0';state.response=null;submit(0)");
assert.equal(full.snapshot().streak,0);assert.equal(full.snapshot().xp,1320);
full.elements['reset-dialog'].returnValue='reset';full.elements['reset-dialog'].listeners.close[0]();
assert.equal(full.snapshot().xp,0);assert.deepEqual(full.snapshot().results,{});
// Malformed and unavailable storage must not prevent practising.
// The sixth confirmed correct answer gets exactly 20% extra; a reload keeps it.
const rules=boot();
rules.run("for(const q of QUESTIONS.slice(0,5)){state.current=q.id;state.response=null;submit(q.answer)}");
assert.equal(rules.snapshot().xp,100);
assert.equal(rules.elements['level-up-popup'].hidden,false);
assert.match(rules.elements['level-up-title'].textContent,/Level 2/);
const firstQuote=rules.elements['level-up-quote'].textContent;
assert.ok(firstQuote.length>20);
assert.equal(rules.snapshot().quoteCursor,1);
const levelReload=boot(rules.saved());
assert.equal(levelReload.elements['level-up-popup'].hidden,true);
assert.equal(levelReload.snapshot().quoteCursor,1);
rules.elements['dismiss-level-up'].click();
assert.equal(rules.elements['level-up-popup'].hidden,true);
rules.run("state.current=QUESTIONS[5].id;state.response=null;answer(QUESTIONS[5].answer)");
assert.equal(rules.snapshot().xp,100);
assert.match(rules.elements['confirmation-stakes'].textContent,/24 XP/);
rules.elements['confirm-answer'].close('confirm');
assert.equal(rules.snapshot().xp,124);
assert.equal(rules.elements['popup-xp'].textContent,'+24 XP');
assert.equal(boot(rules.saved()).snapshot().xp,124);
// Five wrong answers halve the current balance once, then the next five halve again.
rules.run("for(const q of QUESTIONS.slice(6,10)){state.current=q.id;state.response=null;submit((q.answer+1)%4)}");
assert.equal(rules.snapshot().xp,124);
const penaltyReload=boot(rules.saved());
penaltyReload.run("state.current=QUESTIONS[10].id;state.response=null;answer((QUESTIONS[10].answer+1)%4)");
assert.match(penaltyReload.elements['confirmation-stakes'].textContent,/halve your 124 XP/);
penaltyReload.elements['confirm-answer'].close('cancel');
assert.equal(penaltyReload.snapshot().xp,124);
assert.equal(penaltyReload.snapshot().wrongStreak,4);
penaltyReload.run("state.current=QUESTIONS[10].id;state.response=null;submit((QUESTIONS[10].answer+1)%4)");
assert.equal(penaltyReload.snapshot().xp,62);
assert.equal(penaltyReload.elements['popup-xp'].textContent,'-62 XP');
assert.equal(penaltyReload.snapshot().streak,0);
const persistedPenalty=boot(penaltyReload.saved());assert.equal(persistedPenalty.snapshot().xp,62);
persistedPenalty.run("for(const q of QUESTIONS.slice(11,16)){state.current=q.id;state.response=null;submit((q.answer+1)%4)}");
assert.equal(persistedPenalty.snapshot().xp,31);
persistedPenalty.run("for(const q of QUESTIONS.slice(16,21)){state.current=q.id;state.response=null;submit((q.answer+1)%4)}");
assert.equal(persistedPenalty.snapshot().xp,15); // odd balances round down
persistedPenalty.run("state.current=QUESTIONS[21].id;state.response=null;submit(QUESTIONS[21].answer)");
assert.equal(persistedPenalty.snapshot().wrongStreak,0);
assert.equal(persistedPenalty.snapshot().streak,1);
const legacy=app.snapshot();legacy.version=1;legacy.xp=999;
assert.equal(boot(JSON.stringify(legacy)).snapshot().xp,20);
const zero=boot();zero.run("for(const q of QUESTIONS.slice(0,5)){state.current=q.id;state.response=null;submit((q.answer+1)%4)}");
assert.equal(zero.snapshot().xp,0);
const brokenBonus=boot();
brokenBonus.run("for(const q of QUESTIONS.slice(0,5)){state.current=q.id;state.response=null;submit(q.answer)}state.current=QUESTIONS[5].id;state.response=null;submit((QUESTIONS[5].answer+1)%4)");
assert.equal(brokenBonus.snapshot().xp,100);
assert.equal(brokenBonus.snapshot().streak,0);
brokenBonus.run("state.current=QUESTIONS[6].id;state.response=null;submit(QUESTIONS[6].answer)");
assert.equal(brokenBonus.snapshot().xp,120);
// Every new level gets another quote, including after a saved session.
levelReload.run("for(const q of QUESTIONS.slice(5,10)){state.current=q.id;state.response=null;submit(q.answer)}");
assert.equal(levelReload.elements['level-up-popup'].hidden,false);
assert.match(levelReload.elements['level-up-title'].textContent,/Level 3/);
assert.notEqual(levelReload.elements['level-up-quote'].textContent,firstQuote);
assert.equal(levelReload.snapshot().quoteCursor,2);
levelReload.run('next()');assert.equal(levelReload.elements['level-up-popup'].hidden,true);
assert.equal(boot('{bad json').snapshot().xp,0);
const temp=boot(null,true);temp.run('submit(3)');assert.equal(temp.run('state.xp'),20);
assert.match(temp.elements['save-state'].textContent,/temporary/);
// Topic counters include all confirmed attempts, survive reloads and change with filters.
const counters=boot();counters.run('submit(0)');
assert.equal(counters.elements['count-wrong'].textContent,1);
counters.run("setFilter('1')");assert.equal(counters.elements['count-answered'].textContent,0);
counters.run("setFilter('0');submit(2)");
assert.equal(counters.elements['count-answered'].textContent,2);
assert.equal(counters.elements['count-correct'].textContent,1);
assert.equal(counters.elements['count-wrong'].textContent,1);
assert.equal(boot(counters.saved()).elements['count-answered'].textContent,2);
// Challenge: confirmation, saved deadline, no duplicate reward, all ten scored and reviewed.
const challenge=boot();challenge.elements['challenge-start'].click();
const deadline=challenge.snapshot().challenge.deadline;
challenge.run('selectChallengeAnswer(1)');assert.equal(challenge.snapshot().xp,0);
challenge.elements['challenge-confirm'].close('cancel');assert.equal(challenge.snapshot().xp,0);
challenge.run('selectChallengeAnswer(1)');challenge.elements['challenge-confirm'].close('confirm');
assert.equal(challenge.snapshot().xp,70);
challenge.run('commitChallengeAnswer(0,1)');assert.equal(challenge.snapshot().xp,70);
const resumed=boot(challenge.saved());assert.equal(resumed.snapshot().challenge.deadline,deadline);
assert.equal(resumed.snapshot().challenge.answers[0].xp,70);
resumed.run("for(let i=1;i<10;i++){state.challenge.index=i;selectChallengeAnswer(CHALLENGE_QUESTIONS[i].answer);document.getElementById('challenge-confirm').close('confirm')}");
assert.equal(resumed.snapshot().challenge.status,'finished');
assert.equal(resumed.snapshot().xp,740);
assert.equal(Object.keys(resumed.snapshot().challenge.answers).length,10);
assert.equal(resumed.snapshot().streak,0); // Practice streak rules are separate.
resumed.run('startChallenge();selectChallengeAnswer(1)');resumed.elements['challenge-confirm'].close('confirm');
assert.equal(resumed.snapshot().xp,740); // Retry is practice, not unlimited XP.
assert.equal(resumed.snapshot().challenge.answers[0].xp,0);
// Expiry while a confirmation is open must finish and reject late submissions.
resumed.run("state.challenge.index=1;selectChallengeAnswer(2);state.challenge.deadline=Date.now()-1;challengeTick()");
assert.equal(resumed.snapshot().challenge.status,'finished');
assert.equal(resumed.snapshot().challenge.reason,'expired');
assert.equal(resumed.snapshot().xp,740);
assert.equal(Object.keys(resumed.snapshot().challenge.answers).length,1);
const expired=resumed.snapshot();expired.challenge.status='active';
assert.equal(boot(JSON.stringify(expired)).snapshot().challenge.status,'finished');
const wrongChallenge=boot();wrongChallenge.run("startChallenge();selectChallengeAnswer(0);document.getElementById('challenge-confirm').close('confirm')");
assert.equal(wrongChallenge.snapshot().xp,0);
assert.equal(wrongChallenge.snapshot().activity[6].wrong,1);
assert.equal(wrongChallenge.snapshot().wrongStreak,0);
assert.equal(wrongChallenge.run('CHALLENGE_QUESTIONS.length'),10);
assert.ok(wrongChallenge.run('CHALLENGE_QUESTIONS.every(q=>q.options.length===4 && q.xp>=50 && q.xp<=90)'));
wrongChallenge.elements['reset-dialog'].returnValue='reset';wrongChallenge.elements['reset-dialog'].listeners.close.forEach(fn=>fn());
assert.equal(wrongChallenge.snapshot().challenge,null);
assert.equal(wrongChallenge.elements['count-answered'].textContent,0);
// Retakes preserve history, use fresh attempt locks, and persist exact question sets.
const retakes=boot();retakes.run("setFilter('9');startRetake('same')");
assert.deepEqual(retakes.snapshot().round.ids,['9-0','9-1','9-2','9-3']);
retakes.run('submit(activeQuestion().answer)');
const firstRetake=retakes.saved();
const restoredRetake=boot(firstRetake);
assert.equal(Object.keys(restoredRetake.snapshot().round.answers).length,1);
restoredRetake.run('submit(activeQuestion().answer)');
assert.equal(restoredRetake.snapshot().xp,20); // A refresh does not unlock a submitted answer.
restoredRetake.run('next();submit(activeQuestion().answer);next();submit(activeQuestion().answer);next();submit(activeQuestion().answer);next()');
assert.equal(restoredRetake.snapshot().round.finished,true);
assert.equal(restoredRetake.snapshot().xp,80);
assert.equal(restoredRetake.elements['count-answered'].textContent,4);
restoredRetake.elements['retake-same'].click();
assert.equal(restoredRetake.snapshot().round.finished,false);
assert.equal(Object.keys(restoredRetake.snapshot().round.answers).length,0);
restoredRetake.run('submit(activeQuestion().answer)');
assert.equal(restoredRetake.snapshot().xp,80);
assert.equal(restoredRetake.elements['count-answered'].textContent,5);
restoredRetake.elements['retake-random'].click();
const randomDeck=restoredRetake.snapshot().round.ids;
assert.equal(randomDeck.length,4);
assert.ok(randomDeck.some(id=>id.startsWith('v-')));
assert.equal(restoredRetake.run("new Set(pool().map(q=>q.id.replace('v-',''))).size"),4);
const randomReload=boot(restoredRetake.saved());
assert.deepEqual(randomReload.snapshot().round.ids,randomDeck);
randomReload.elements['retake-same'].click();
assert.deepEqual(randomReload.snapshot().round.ids,randomDeck);
randomReload.run("setFilter('10');setFilter('9');startRetake('same')");
assert.deepEqual(randomReload.snapshot().round.ids,randomDeck);
randomReload.elements['retake-random'].click();
assert.ok(randomReload.snapshot().round.ids.some(id=>!randomDeck.includes(id)));
// Every topic has one alternate per concept, and every random round stays in its topic.
assert.equal(randomReload.run('VARIANTS.length'),64);
assert.ok(randomReload.run('VARIANTS.every(q=>q.options.length===4 && new Set(q.options).size===4 && q.answer>=0 && q.answer<4 && q.explanation.length>30)'));
for(let t=0;t<16;t++){
 randomReload.run(`setFilter('${t}');startRetake('random')`);
 assert.equal(randomReload.snapshot().round.ids.length,4);
 assert.ok(randomReload.run(`pool().every(q=>q.topic===${t})`));
}
randomReload.run("setFilter('all');startRetake('random')");
assert.equal(randomReload.snapshot().round.ids.length,64);
assert.equal(randomReload.run('new Set(pool().map(q=>q.topic)).size'),16);
console.log('PASS: same/random retakes; 64 reviewed variants; round scores and reload locks; saved decks and lifetime counters; practice/challenge scoring; streaks; level-ups; timer expiry; reset and migration.');
module.exports={boot};
