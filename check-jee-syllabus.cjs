const assert=require('node:assert/strict');
const {boot}=require('./check.cjs');
let total=0;
for(const [subject,count] of [['maths',14],['physics',20],['chemistry',20]]) {
 const options={location:{search:`?subject=${subject}&exam=jee-main-2027`}};
 let app=boot(null,false,options);
 assert.equal(app.run('isJee'),true);
 assert.equal(app.run('TOPICS.length'),count);
 assert.equal(app.run('QUESTIONS.length'),(subject==='chemistry'?10:2)*count);
 assert.equal(app.run('ALL_QUESTIONS.length'),(subject==='chemistry'?20:4)*count);
 assert.equal(app.run('CHALLENGE_QUESTIONS.length'),10);
 assert.equal(app.run('KEY'),`chemistry-quest-jee-main-2027-${subject}-v1`);
 assert.equal(app.elements['account-open'].hidden,true);
 assert.equal(app.elements['syllabus-card'].hidden,false);
 assert.ok(app.elements['subject-physics'].href.includes('exam=jee-main-2027'));
 const rows=JSON.parse(app.run('JSON.stringify([...ALL_QUESTIONS,...CHALLENGE_QUESTIONS])'));
 assert.equal(new Set(rows.map(q=>q.id)).size,rows.length);
 assert.equal(new Set(rows.map(q=>q.prompt)).size,rows.length,'Every bank prompt is distinct');
 for(const q of rows){
  assert.equal(q.options.length,4);
  assert.equal(new Set(q.options).size,4,q.id);
  assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4,q.id);
  assert.ok(q.explanation.length>25,q.id);
  assert.ok(Number.isInteger(q.topic)&&q.topic>=0&&q.topic<count,q.id);
 }
 for(let unit=0;unit<count;unit++){
  app.run(`setFilter('${unit}')`);
  assert.equal(app.run('pool().length'),subject==='chemistry'?10:2);
  assert.match(app.elements['syllabus-current'].textContent,new RegExp(`Unit ${unit+1} ·`));
  assert.ok(app.elements['syllabus-scope'].textContent.length>40);
 }
 app.run("setFilter('0');startRetake('same');submit((activeQuestion().answer+1)%4)");
 assert.equal(app.run('state.xp'),0);
 app=boot(app.saved(),false,options);
 app.run("startRetake('same');submit(activeQuestion().answer)");
 assert.equal(app.run('state.xp'),0,'First wrong answer consumes the JEE reward');
 app.run('next();submit(activeQuestion().answer)');
 assert.equal(app.run('state.xp'),20);
 app.run("startRetake('same');submit(activeQuestion().answer);next();submit(activeQuestion().answer)");
 assert.equal(app.run('state.xp'),20,'Repeats award zero XP');
 app.run("startRetake('random')");
 assert.ok(app.run("pool().some(q=>q.id.startsWith('v-'))"));
 app.run('startChallenge();commitChallengeAnswer(0,(CHALLENGE_QUESTIONS[0].answer+1)%4);finishChallenge();startChallenge();commitChallengeAnswer(0,CHALLENGE_QUESTIONS[0].answer)');
 assert.equal(app.run('state.xp'),20,'Challenge retries award zero XP');
 const reloaded=boot(app.saved(),false,options);
 assert.equal(reloaded.run('state.xp'),20);
 assert.equal(reloaded.run('state.challenge.answers[0].xp'),0);
 assert.equal(boot(JSON.stringify({version:2,xp:120})).run('state.xp'),120);
 total+=(subject==='chemistry'?20:4)*count;
}
assert.equal(total,536);
console.log('PASS: 54 JEE Main 2027 units, 536 distinct practice questions, 30 mapped challenge questions, source scopes, all unit filters, exam links, isolated saves, retakes, first-attempt XP and reloads.');
