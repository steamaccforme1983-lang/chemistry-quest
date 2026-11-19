const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {boot}=require('./check.cjs');
const options={location:{search:'?subject=chemistry&exam=jee-main-2027'}};
const make=snapshot=>boot(snapshot?JSON.stringify(snapshot):null,false,options);
const data=(app,expression)=>JSON.parse(app.run(`JSON.stringify(${expression})`));
const checks=[];
async function check(name,run){try{await run();checks.push({name,result:'PASS'});}catch(error){checks.push({name,result:'FAIL',detail:error.stack});}}

(async()=>{
 await check('All 20 units have exact-source sections and six question categories',()=>{
  const app=make();const units=data(app,'CHEMISTRY_SYLLABUS_2027'),questions=data(app,'ALL_QUESTIONS');
  assert.equal(units.length,20);assert.equal(questions.length,400);
  assert.deepEqual(units.map(unit=>unit.number),Array.from({length:20},(_,i)=>i+1));
  assert.equal(new Set(units.map(unit=>unit.id)).size,20);
  assert.equal(new Set(questions.map(question=>question.id)).size,400);
  assert.equal(new Set(questions.map(question=>question.prompt)).size,400);
  const topics=new Set(units.flatMap(unit=>unit.subtopics.map(topic=>topic.id)));
  for(const unit of units){
   const rows=questions.filter(question=>question.unitId===unit.id);
   assert.equal(rows.length,20,unit.title);
   assert.deepEqual([...new Set(rows.map(question=>question.category))].sort(),['application','beginner','formula','misconception','mixed','numerical']);
   assert.ok(unit.subtopics.every(topic=>topic.text.length>10));
  }
  for(const question of questions){
   assert.equal(new Set(question.options).size,4,question.id);
   assert.ok(Number.isInteger(question.answer)&&question.answer>=0&&question.answer<4);
   assert.ok(topics.has(question.subtopicId),question.id);
   assert.ok(question.steps.length>=2&&question.steps.every(step=>step.trim().length>0),question.id);
   assert.ok(['easy','medium','hard'].includes(question.difficulty));
   assert.equal(question.source,'Original practice');
  }
  const text=units.flatMap(unit=>unit.subtopics.map(topic=>topic.text)).join(' ');
  for(const required of ['ψ²','no derivation','K₂Cr₂O₇','phosphorus','Markownikoffs','Wolf Kishner','NH₄⁺','NO₂⁻','Insoluble salts excluded','lyophilic','iodide ions with hydrogen peroxide'])assert.ok(text.includes(required),required);
  assert.equal(app.elements.topics.children.filter(node=>node.tagName==='DETAILS').length,4);
 });
 await check('Published question identities and saved rounds survive repeated migration',()=>{
  const app=make();const questions=data(app,'ALL_QUESTIONS');
  const previous=questions.filter(question=>/-(0|1)$/.test(question.id));
  const projection=previous.map(({id,prompt,options,answer})=>({id,prompt,options,answer})).sort((a,b)=>a.id.localeCompare(b.id));
  assert.equal(createHash('sha256').update(JSON.stringify(projection)).digest('hex'),'ae1ad7eb49655eb50aec5b15ca2e54dde02b3fb0c7972b748950b59a7f2018a5');
  const first=previous.find(question=>question.id==='jee2027-chemistry-0-0'),second=previous.find(question=>question.id==='jee2027-chemistry-0-1');
  const receipt={id:first.id,choice:first.answer,delta:20,bonus:false,penalty:false};
  const snapshot={version:2,xp:740,streak:3,wrongStreak:0,best:8,displayName:'Existing learner',stickerLevel:10,avatarLevel:8,quoteCursor:4,
   filter:'0',current:first.id,response:receipt,results:{[first.id]:{choice:first.answer,earned:true}},
   topicTests:{0:[first.id,second.id]},round:{filter:'0',mode:'same',ids:[first.id,second.id],answers:{[first.id]:receipt},finished:false}};
  const once=make(snapshot),twice=make(once.snapshot());
  for(const migrated of [once,twice]){
   assert.equal(migrated.run('state.xp'),740);assert.equal(migrated.run('state.best'),8);
   assert.equal(migrated.run('state.displayName'),'Existing learner');assert.equal(migrated.run('state.avatarLevel'),8);
   assert.equal(migrated.run('state.quoteCursor'),4);assert.equal(migrated.run('state.round.ids.length'),2);
   assert.equal(migrated.run('Object.keys(state.round.answers).length'),1);
   assert.equal(migrated.run('state.response.choice'),first.answer);
  }
 });
 await check('Difficulty rewards and topic bonuses award once',()=>{
  for(const [difficulty,reward] of [['easy',10],['medium',20],['hard',35]]){
   const app=make();app.run(`state.current=ALL_QUESTIONS.find(question=>question.difficulty==='${difficulty}').id;state.response=null;render();submit(activeQuestion().answer)`);
   assert.equal(app.run('state.response.questionXp'),reward);
  }
  let app=make();const topic=app.run('chemistryTopicProgress().find(topic=>topic.total===2).id');
  const ids=data(app,`ALL_QUESTIONS.filter(question=>question.subtopicId===${JSON.stringify(topic)}).map(question=>question.id)`);
  for(const id of ids)app.run(`state.filter='review';reviewQueue=[${JSON.stringify(id)}];state.current=${JSON.stringify(id)};state.response=null;render();submit(activeQuestion().answer)`);
  assert.equal(app.run(`state.chemistryStudy.bonuses[${JSON.stringify(topic)}]`),true);
  assert.equal(app.run('state.response.completionXp'),50);
  const xp=app.run('state.xp');app=make(app.snapshot());
  for(const id of ids)app.run(`state.filter='review';reviewQueue=[${JSON.stringify(id)}];state.current=${JSON.stringify(id)};state.response=null;render();submit(activeQuestion().answer)`);
  assert.equal(app.run('state.xp'),xp);
  assert.equal(app.run('state.response.questionXp'),0);
  assert.equal(app.run('state.response.completionXp'),0);
 });
 await check('Chapter tests delay scoring, apply mastery bonuses once and support revision',async()=>{
  let app=make();app.run("setFilter('0');startChemistryTest()");
  assert.equal(app.run('state.chemistryStudy.activeTest.ids.length'),20);
  assert.ok(Math.abs(app.run('state.chemistryStudy.activeTest.deadline-Date.now()')-1800000)<100);
  app.run(`for(const [index,id] of state.chemistryStudy.activeTest.ids.entries()){
   const question=chemistryQuestion(id);state.chemistryStudy.activeTest.index=index;
   chooseChemistryTestAnswer(index<14?question.answer:(question.answer+1)%4);
  }`);
  assert.equal(app.run('state.xp'),0,'No reward before test submission');
  assert.equal(app.run('Object.keys(state.results).length'),0,'No practice results before test submission');
  await app.run('finishChemistryTest()');
  assert.equal(app.run('state.chemistryStudy.history.length'),1);
  assert.equal(app.run('state.chemistryStudy.history[0].score'),70);
  assert.equal(app.run('state.chemistryStudy.bonuses["test:chem2027-u01"]'),true);
  assert.equal(app.run('state.chemistryStudy.bonuses["score90:chem2027-u01"]'),undefined);
  const xp=app.run('state.xp');await app.run('finishChemistryTest()');assert.equal(app.run('state.xp'),xp);
  app.elements['chapter-test-revise'].click();
  assert.equal(app.run('state.chemistryStudy.revisionIds.length'),6);
  assert.equal(app.run('pool().length'),6);
  app=make(app.snapshot());assert.equal(app.run('pool().length'),6,'Test revision scope persists');
  app.run('startChemistryTest(0);for(const [index,id] of state.chemistryStudy.activeTest.ids.entries()){state.chemistryStudy.activeTest.index=index;chooseChemistryTestAnswer(chemistryQuestion(id).answer)}');
  await app.run('finishChemistryTest()');
  assert.equal(app.run('state.chemistryStudy.history.at(-1).score'),100);
  assert.equal(app.run('state.chemistryStudy.history.at(-1).questionXp'),0,'No repeated question rewards');
  assert.equal(app.run('state.chemistryStudy.bonuses["score90:chem2027-u01"]'),true);
  const completedXp=app.run('state.xp');
  app=make(app.snapshot());app.run('startChemistryTest(0);for(const [index,id] of state.chemistryStudy.activeTest.ids.entries()){state.chemistryStudy.activeTest.index=index;chooseChemistryTestAnswer(chemistryQuestion(id).answer)}');
  await Promise.all([app.run('finishChemistryTest()'),app.run('finishChemistryTest()')]);
  assert.equal(app.run('state.xp'),completedXp);
  assert.equal(app.run('state.chemistryStudy.history.length'),3);
  assert.equal(app.run('state.chemistryStudy.history.at(-1).bonusXp'),0);
  assert.equal(app.elements['chapter-test-revise'].disabled,true);
 });
 await check('Expired saved tests finish safely and corrupted test data preserves EXP',async()=>{
  let app=make();app.run("setFilter('1');startChemistryTest();state.chemistryStudy.activeTest.deadline=Date.now()-1;save()");
  app=make(app.snapshot());await Promise.resolve();
  assert.equal(app.run('state.chemistryStudy.activeTest'),null);
  assert.equal(app.run('state.chemistryStudy.history.at(-1).reason'),'expired');
  assert.equal(app.run('state.xp'),0);
  const corrupted=make({version:2,xp:300,chemistryStudy:{version:1,activeTest:{id:'bad',unitId:'chem2027-u01',ids:['unknown'],deadline:1},history:[null,{},{}]}});
  assert.equal(corrupted.run('state.xp'),300);assert.equal(corrupted.run('state.chemistryStudy.activeTest'),null);
 });
 await check('High-level sticker generation remains valid for the expanded EXP range',()=>{
  const app=make();const stickers=data(app,'Array.from({length:MAX_STICKER_LEVEL},(_,index)=>stickerForLevel(index+1).image)');
  assert.ok(stickers.length>100);assert.equal(new Set(stickers).size,stickers.length);
 });
 await check('Chapter tests remain usable with blocked browser storage',async()=>{
  const app=boot(null,true,options);
  app.run("setFilter('0');startChemistryTest();for(const [index,id] of state.chemistryStudy.activeTest.ids.entries()){state.chemistryStudy.activeTest.index=index;chooseChemistryTestAnswer(chemistryQuestion(id).answer)}");
  await app.run('finishChemistryTest()');
  assert.equal(app.run('state.chemistryStudy.history.at(-1).score'),100);
  assert.ok(app.run('state.xp')>0);
  assert.equal(app.run('storageOK'),false);
 });
 console.log(JSON.stringify(checks,null,2));if(checks.some(item=>item.result==='FAIL'))process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1});
