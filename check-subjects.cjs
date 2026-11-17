const assert = require('node:assert/strict');
const {boot} = require('./check.cjs');

for (const subject of ['maths','physics']) {
 const app = boot(null,false,{location:{search:'?subject='+subject}});
 const run = app.run;
 assert.equal(run('SUBJECT'), subject);
 assert.equal(run('TOPICS.length'), 8);
 assert.equal(run('QUESTIONS.length'), 32);
 assert.equal(run('VARIANTS.length'), 32);
 assert.equal(run('CHALLENGE_QUESTIONS.length'), 10);
 const questions = JSON.parse(run('JSON.stringify([...ALL_QUESTIONS,...CHALLENGE_QUESTIONS])'));
 assert.equal(new Set(questions.map(q=>q.id)).size,74);
 for (const q of questions) {
  assert.equal(new Set(q.options).size,4,q.prompt);
  assert.ok(Number.isInteger(q.answer) && q.answer>=0 && q.answer<4,q.prompt);
  assert.ok(q.explanation.length>12,q.prompt);
 }
 assert.equal(run('KEY'),'chemistry-quest-'+subject+'-v1');
 run('submit(activeQuestion().answer)');
 assert.equal(app.snapshot().xp,20);
 run("setFilter('0'); startRetake('random')");
 assert.equal(run('pool().length'),4);
 assert.ok(run("pool().some(question=>question.id.startsWith('v-'))"));
 run('startChallenge(); commitChallengeAnswer(0,CHALLENGE_QUESTIONS[0].answer)');
 assert.equal(app.snapshot().xp,70);
 assert.equal(app.snapshot().challenge.answers[0].xp,50);
 app.run('state=load();validateChallenge();renderChallenge();render()');
 assert.equal(app.run('state.xp'),70);
 assert.equal(app.run('state.challenge.answers[0].xp'),50);
 assert.equal(app.elements['account-open'].hidden,true);
}
const chemistry = boot(JSON.stringify({version:2,xp:120}),false,{location:{search:'?subject=unknown'}});
assert.equal(chemistry.run('SUBJECT'),'chemistry');
assert.equal(chemistry.snapshot().xp,120);
assert.equal(chemistry.elements['account-open'].hidden,false);
console.log('PASS: both subject banks, alternate retakes, challenge rewards, saved progress and Chemistry compatibility.');
