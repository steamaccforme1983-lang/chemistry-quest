const assert=require('node:assert/strict');
const {boot}=require('./check.cjs');

for(const subject of ['chemistry','maths','physics']) {
 const options={location:{search:'?subject='+subject}};
 let app=boot(null,false,options);
 app.run("setFilter('0');startRetake('same');submit(activeQuestion().answer)");
 assert.equal(app.run('state.xp'),20,subject);
 app.run("startRetake('same');submit(activeQuestion().answer)");
 assert.equal(app.run('state.xp'),20);
 assert.equal(app.elements['popup-xp'].textContent,'+0 XP');
 app.run('next();submit((activeQuestion().answer+1)%4)');
 const wrongId=app.run('state.current');
 app=boot(app.saved(),false,options);
 app.run(`state.round=null;state.current=${JSON.stringify(wrongId)};state.response=null;render();submit(activeQuestion().answer)`);
 assert.equal(app.run('state.xp'),20,'A corrected first mistake earns no XP');
 assert.equal(app.run(`state.results[${JSON.stringify(wrongId)}].solved`),true,'Retakes still build mastery');
 assert.equal(app.run(`state.results[${JSON.stringify(wrongId)}].earned`),false);
 app.run('next();answer(activeQuestion().answer);document.getElementById("confirm-answer").close("cancel")');
 const before=app.run('state.xp');
 app.run('submit(activeQuestion().answer)');
 assert.equal(app.run('state.xp')-before,20,'Cancellation preserves first attempt');
 app.run('startChallenge();commitChallengeAnswer(0,(CHALLENGE_QUESTIONS[0].answer+1)%4);finishChallenge();startChallenge();commitChallengeAnswer(0,CHALLENGE_QUESTIONS[0].answer)');
 assert.equal(app.run('state.xp'),40,'A missed challenge cannot earn XP on retry');
 app.run('state.challenge.index=1;commitChallengeAnswer(1,CHALLENGE_QUESTIONS[1].answer)');
 const earned=app.run('state.xp');
 assert.ok(earned>40,'An unseen challenge question can earn XP');
 app=boot(app.saved(),false,options);
 app.run('finishChallenge();startChallenge();state.challenge.index=1;commitChallengeAnswer(1,CHALLENGE_QUESTIONS[1].answer)');
 assert.equal(app.run('state.xp'),earned,'Challenge rewards stay locked after reload');
 // An older save lacks the lifetime attempt map, but retains its latest answers.
 const legacy=JSON.parse(app.saved());
 delete legacy.challengeAttempted;
 legacy.challenge.answers={0:{choice:0,xp:0}};
 const migrated=boot(JSON.stringify(legacy),false,options);
 assert.equal(migrated.run('state.challengeAttempted[CHALLENGE_QUESTIONS[0].id]'),true);
 migrated.run('finishChallenge();startChallenge();commitChallengeAnswer(0,CHALLENGE_QUESTIONS[0].answer)');
 assert.equal(migrated.run('state.xp'),earned,'Existing wrong attempts remain ineligible');
}
console.log('PASS: first-attempt-only rewards in all subjects, wrong-first corrections, retakes, mastery, cancellation, challenge retries, reloads and legacy-save migration.');
