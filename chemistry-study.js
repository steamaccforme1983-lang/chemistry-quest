'use strict';

// Change reward values here. Existing balances and claimed bonuses are retained.
const CHEMISTRY_STUDY_CONFIG={
 questionXp:{easy:10,medium:20,hard:35},topicCompletionXp:50,
 chapterTestXp:100,highScoreXp:75,masteryTarget:70,
 testQuestions:20,testMinutes:30,historyLimit:40
};
const freshChemistryStudy=()=>({version:1,bonuses:{},bestTests:{},history:[],activeTest:null,revisionIds:[]});
const chemistryQuestion=id=>ALL_QUESTIONS.find(question=>question.id===id);
const chemistryUnitQuestions=unitId=>ALL_QUESTIONS.filter(question=>question.unitId===unitId);
function chemistryTopicName(id){
 const text=CHEMISTRY_SYLLABUS_2027.flatMap(unit=>unit.subtopics).find(topic=>topic.id===id)?.text||'Mixed revision';
 return text.length>120?text.slice(0,117)+'…':text;
}
function chemistryTopicProgress(results=state.results) {
 return CHEMISTRY_SYLLABUS_2027.flatMap(unit=>unit.subtopics.map(topic=>{
  const questions=ALL_QUESTIONS.filter(question=>question.subtopicId===topic.id);
  const solved=questions.filter(question=>results[question.id]?.earned).length;
  const percent=questions.length?Math.round(100*solved/questions.length):0;
  return {...topic,unitId:unit.id,total:questions.length,solved,percent,
   mastered:questions.length>=2&&100*solved/questions.length>=CHEMISTRY_STUDY_CONFIG.masteryTarget};
 }));
}
function normalizeChemistryStudy(raw,results={}) {
 const clean=freshChemistryStudy();
 if(!isChemistry2027)return clean;
 const units=new Set(CHEMISTRY_SYLLABUS_2027.map(unit=>unit.id));
 const topics=new Set(CHEMISTRY_SYLLABUS_2027.flatMap(unit=>unit.subtopics.map(topic=>topic.id)));
 clean.revisionIds=[...new Set(Array.isArray(raw?.revisionIds)?raw.revisionIds:[])].filter(id=>!!chemistryQuestion(id));
 for(const [id,value] of Object.entries(raw?.bonuses||{})){
  if(value===true&&(topics.has(id)||[...units].some(unit=>id===`test:${unit}`||id===`score90:${unit}`)))clean.bonuses[id]=true;
 }
 for(const [id,score] of Object.entries(raw?.bestTests||{}))if(units.has(id)&&Number.isFinite(score)&&score>=0&&score<=100)clean.bestTests[id]=score;
 const seen=new Set();
 for(const item of Array.isArray(raw?.history)?raw.history:[]){
  if(!item||typeof item.id!=='string'||seen.has(item.id)||!units.has(item.unitId)||!Number.isFinite(item.finishedAt)||!Array.isArray(item.ids)||new Set(item.ids).size!==20||item.ids.length!==20||item.ids.some(id=>chemistryQuestion(id)?.unitId!==item.unitId))continue;
  const answers={};
  for(const id of item.ids){const answer=item.answers?.[id];if(Number.isInteger(answer?.choice)&&answer.choice>=0&&answer.choice<4)answers[id]={choice:answer.choice};}
  const correct=item.ids.filter(id=>answers[id]?.choice===chemistryQuestion(id).answer).length;
  const score=Math.round(100*correct/item.ids.length);
  clean.history.push({id:item.id,unitId:item.unitId,ids:item.ids,answers,correct,score,
   finishedAt:item.finishedAt,reason:item.reason==='expired'?'expired':'submitted',xp:Number.isSafeInteger(item.xp)?item.xp:0,
   questionXp:Number.isSafeInteger(item.questionXp)?item.questionXp:0,bonusXp:Number.isSafeInteger(item.bonusXp)?item.bonusXp:0});
  clean.bestTests[item.unitId]=Math.max(clean.bestTests[item.unitId]||0,score);seen.add(item.id);
 }
 clean.history=clean.history.slice(-CHEMISTRY_STUDY_CONFIG.historyLimit);
 const test=raw?.activeTest;
 if(test&&typeof test.id==='string'&&!seen.has(test.id)&&units.has(test.unitId)&&Number.isFinite(test.deadline)&&Array.isArray(test.ids)&&test.ids.length===20&&new Set(test.ids).size===20&&test.ids.every(id=>chemistryQuestion(id)?.unitId===test.unitId)){
  const answers={};
  for(const id of test.ids){const choice=test.answers?.[id]?.choice;if(Number.isInteger(choice)&&choice>=0&&choice<4)answers[id]={choice};}
  clean.activeTest={id:test.id,unitId:test.unitId,ids:test.ids,answers,deadline:test.deadline,
   index:Number.isInteger(test.index)&&test.index>=0&&test.index<20?test.index:0};
 }
 // Previous saves had no completion bonuses. Record their existing achievements
 // without recalculating or adding to their EXP balance.
 if(raw?.version!==1)for(const topic of chemistryTopicProgress(results))if(topic.mastered)clean.bonuses[topic.id]=true;
 return clean;
}
function awardChemistryTopicBonuses() {
 let reward=0;
 for(const topic of chemistryTopicProgress()){
  if(topic.mastered&&!state.chemistryStudy.bonuses[topic.id]){
   state.chemistryStudy.bonuses[topic.id]=true;
   reward+=CHEMISTRY_STUDY_CONFIG.topicCompletionXp;
  }
 }
 state.xp+=reward;
 return reward;
}
function renderChemistrySteps(parent,question) {
 const list=document.createElement('ol');list.className='explanation-steps';
 for(const step of question.steps||[question.explanation]){const item=document.createElement('li');item.textContent=step;list.append(item);}
 parent.append(list);
}
function renderChemistrySyllabus() {
 const unit=CHEMISTRY_SYLLABUS_2027[Number(state.filter)];
 const progress=unit?chemistryChapterProgress(unit):null;
 $('syllabus-current').textContent=unit?`Unit ${unit.number} · ${unit.title}`:'20 official Chemistry units';
 $('syllabus-scope').textContent=unit?`${unit.subtopics.length} syllabus sections · ${progress.percent}% practice mastery`:'Physical, Inorganic, Organic and Practical Chemistry · official unit wording and original practice questions.';
 $('chemistry-current-topics').hidden=!unit;
 const list=$('chemistry-official-topics');list.replaceChildren();
 for(const topic of unit?.subtopics||[]){const item=document.createElement('li');item.textContent=topic.text;list.append(item);}
 $('chapter-test-open').textContent=state.chemistryStudy.activeTest?'Resume chapter test':'Take chapter test';
 $('chapter-test-open').hidden=!unit&&!state.chemistryStudy.activeTest;
 $('chapter-completion').hidden=!unit;
 if(unit){
  $('chapter-completion-label').textContent=`${progress.solved}/${progress.total} questions mastered · target ${CHEMISTRY_STUDY_CONFIG.masteryTarget}%`;
  $('chapter-completion-bar').style.width=`${progress.percent}%`;
  $('chapter-completion-progress').setAttribute('aria-valuenow',progress.percent);
 }
}
function buildChemistryOutline() {
 const root=$('syllabus-unit-list');root.replaceChildren();
 for(const group of new Set(CHEMISTRY_SYLLABUS_2027.map(unit=>unit.group))){
  const section=document.createElement('details');section.className='curriculum-group';
  const heading=document.createElement('summary');heading.textContent=group;section.append(heading);
  for(const unit of CHEMISTRY_SYLLABUS_2027.filter(item=>item.group===group)){
   const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent=`Unit ${unit.number} · ${unit.title}`;
   const list=document.createElement('ul');for(const topic of unit.subtopics){const row=document.createElement('li');row.textContent=topic.text;list.append(row);}
   const button=document.createElement('button');button.type='button';button.className='secondary';button.textContent='Practise chapter';button.addEventListener('click',()=>setFilter(String(unit.number-1)));
   details.append(summary,list,button);section.append(details);
  }
  root.append(section);
 }
}
function chemistryChapterProgress(unit) {
 const questions=chemistryUnitQuestions(unit.id),solved=questions.filter(question=>state.results[question.id]?.earned).length;
 const activity=state.activity[unit.number-1]||{correct:0,wrong:0};
 return {total:questions.length,solved,percent:Math.round(100*solved/questions.length),
  correct:activity.correct,answered:activity.correct+activity.wrong,best:state.chemistryStudy.bestTests[unit.id]||0};
}
function renderChemistryDashboard() {
 const units=CHEMISTRY_SYLLABUS_2027.map(unit=>({...unit,...chemistryChapterProgress(unit)}));
 const answered=units.reduce((sum,unit)=>sum+unit.answered,0),correct=units.reduce((sum,unit)=>sum+unit.correct,0);
 const completed=units.filter(unit=>unit.percent>=CHEMISTRY_STUDY_CONFIG.masteryTarget||unit.best>=CHEMISTRY_STUDY_CONFIG.masteryTarget).length;
 $('chemistry-dashboard-summary').textContent=`Study dashboard · ${completed}/20 chapters mastered`;
 $('dashboard-chapters').textContent=`${completed}/20`;
 $('dashboard-topics').textContent=chemistryTopicProgress().filter(topic=>topic.mastered).length;
 $('dashboard-xp').textContent=`${state.xp} XP · Level ${Math.floor(state.xp/100)+1}`;
 $('dashboard-accuracy').textContent=answered?`${Math.round(100*correct/answered)}%`:'—';
 const groups=$('chemistry-group-results');groups.replaceChildren();
 for(const name of new Set(units.map(unit=>unit.group))){
  const rows=units.filter(unit=>unit.group===name),count=rows.reduce((sum,row)=>sum+row.answered,0),right=rows.reduce((sum,row)=>sum+row.correct,0);
  const row=document.createElement('div');const label=document.createElement('strong');label.textContent=name;
  const text=document.createElement('p');text.textContent=`${right}/${count} correct · ${count?Math.round(100*right/count)+'% accuracy':'No attempts yet'}`;row.append(label,text);groups.append(row);
 }
 const table=$('chemistry-chapter-results');table.replaceChildren();
 for(const unit of units){
  const row=document.createElement('tr');
  for(const value of [unit.title,`${unit.percent}%`,unit.answered?`${Math.round(100*unit.correct/unit.answered)}%`:'—',state.chemistryStudy.bestTests[unit.id]!==undefined?`${unit.best}%`:'—']){const cell=document.createElement('td');cell.textContent=value;row.append(cell);}
  table.append(row);
 }
 const weak=units.filter(unit=>unit.answered&&100*unit.correct/unit.answered<CHEMISTRY_STUDY_CONFIG.masteryTarget)
  .sort((a,b)=>a.correct/a.answered-b.correct/b.answered).slice(0,3);
 $('chemistry-recommendations').textContent=weak.length?`Revise ${weak.map(unit=>unit.title).join(', ')}. Use Review mistakes, then retry a chapter test.`:answered?'Continue with an unmastered chapter and check the official subtopics before its test.':'Start with Some Basic Concepts in Chemistry, then review mistakes before the first chapter test.';
 const history=$('chemistry-recent-tests');history.replaceChildren();
 const recent=state.chemistryStudy.history.slice(-5).reverse();
 if(!recent.length)history.textContent='No chapter tests submitted yet.';
 for(const test of recent){const row=document.createElement('p');const unit=units.find(item=>item.id===test.unitId);row.textContent=`${unit.title} · ${test.correct}/20 · ${test.score}% · ${test.xp>=0?'+':''}${test.xp} XP`;history.append(row);}
}
let chapterTestFinishing=false;
let chapterTestResult=null;
let chapterLevelUp=null;
function startChemistryTest(unitIndex=Number(state.filter)) {
 if(chapterTestFinishing)return;
 dismissAnswerPopup();
 chapterLevelUp=null;
 if(state.chemistryStudy.activeTest){$('chapter-test-dialog').showModal();renderChemistryTest();return;}
 const unit=CHEMISTRY_SYLLABUS_2027[unitIndex];if(!unit)return;
 const ids=chemistryUnitQuestions(unit.id).map(question=>question.id);
 for(let i=ids.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}
 const count=CHEMISTRY_STUDY_CONFIG.testQuestions;
 if(ids.length<count){toast('This chapter needs more questions before a full test is available.');return;}
 state.chemistryStudy.activeTest={id:globalThis.crypto?.randomUUID?.()||`test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  unitId:unit.id,ids:ids.slice(0,count),answers:{},index:0,deadline:Date.now()+CHEMISTRY_STUDY_CONFIG.testMinutes*60000};
 chapterTestResult=null;save();renderChemistrySyllabus();$('chapter-test-dialog').showModal();renderChemistryTest();
}
function chapterTestTick() {
 const test=state.chemistryStudy.activeTest;if(!test)return;
 const seconds=Math.max(0,Math.ceil((test.deadline-Date.now())/1000));
 $('chapter-test-timer').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
 if(!seconds&&!chapterTestFinishing)finishChemistryTest('expired');
}
function chooseChemistryTestAnswer(choice) {
 const test=state.chemistryStudy.activeTest;
 if(!test||test.deadline<=Date.now()||chapterTestFinishing){chapterTestTick();return;}
 if(!Number.isInteger(choice)||choice<0||choice>3)return;
 test.answers[test.ids[test.index]]={choice};save();renderChemistryTest();
}
async function finishChemistryTest(reason='submitted') {
 if(chapterTestFinishing||!state.chemistryStudy.activeTest)return;
 chapterTestFinishing=true;
 const testId=state.chemistryStudy.activeTest.id;
 const apply=()=>{
  // Re-read the latest save under the browser lock before awarding anything.
  if(storageOK){
   const latest=load();
   if(storageOK){
    if(latest.chemistryStudy.activeTest?.id===testId)state=latest;
    else {const previous=latest.chemistryStudy.history.find(item=>item.id===testId);if(previous){state=latest;chapterTestResult=previous;}return;}
   }
  }
  const test=state.chemistryStudy.activeTest;if(!test||test.id!==testId)return;
  const before=state.xp,oldLevel=Math.floor(before/100)+1;
  let questionXp=0,bonusXp=0,correct=0;
  for(const id of test.ids){
   const answer=test.answers[id];if(!answer)continue;
   const question=chemistryQuestion(id);if(answer.choice===question.answer)correct++;
   const receipt=recordPracticeAnswer(question,answer.choice);
   questionXp+=receipt.questionXp||0;bonusXp+=receipt.completionXp||0;
   if(state.current===id)state.response=receipt;
  }
  const score=Math.round(100*correct/test.ids.length),unitId=test.unitId;
  if(score>=CHEMISTRY_STUDY_CONFIG.masteryTarget&&!state.chemistryStudy.bonuses[`test:${unitId}`]){
   state.chemistryStudy.bonuses[`test:${unitId}`]=true;state.xp+=CHEMISTRY_STUDY_CONFIG.chapterTestXp;bonusXp+=CHEMISTRY_STUDY_CONFIG.chapterTestXp;
  }
  if(score>=90&&!state.chemistryStudy.bonuses[`score90:${unitId}`]){
   state.chemistryStudy.bonuses[`score90:${unitId}`]=true;state.xp+=CHEMISTRY_STUDY_CONFIG.highScoreXp;bonusXp+=CHEMISTRY_STUDY_CONFIG.highScoreXp;
  }
  const result={...test,finishedAt:Date.now(),reason,correct,score,xp:state.xp-before,questionXp,bonusXp};delete result.deadline;delete result.index;
  state.chemistryStudy.bestTests[unitId]=Math.max(state.chemistryStudy.bestTests[unitId]||0,score);
  state.chemistryStudy.history.push(result);state.chemistryStudy.history=state.chemistryStudy.history.slice(-CHEMISTRY_STUDY_CONFIG.historyLimit);
  state.chemistryStudy.activeTest=null;chapterTestResult=result;
  save();render();
  if(Math.floor(state.xp/100)+1>oldLevel){
   const level=Math.floor(state.xp/100)+1;
   if($('chapter-test-dialog').open)chapterLevelUp={level,xp:(chapterLevelUp?.xp||0)+result.xp};
   else showLevelUp(level,result.xp);
  }
  if(reason==='expired')toast('Chapter test time is up. Your submitted choices have been scored.');
 };
 try{
  const locks=globalThis.navigator?.locks;
  if(locks)await locks.request(`${KEY}:chapter-test`,apply);else apply();
 }finally{
  chapterTestFinishing=false;
  if($('chapter-test-finish').open)$('chapter-test-finish').close('cancel');
  renderChemistryTest();renderChemistryDashboard();renderChemistrySyllabus();
 }
}
function renderChemistryTest() {
 const content=$('chapter-test-content');content.replaceChildren();
 const test=state.chemistryStudy.activeTest;
 $('chapter-test-submit').hidden=!test;$('chapter-test-retry').hidden=!!test;$('chapter-test-revise').hidden=!!test;
 if(!test){
  const result=chapterTestResult||state.chemistryStudy.history.at(-1);if(!result)return;
  $('chapter-test-revise').disabled=result.correct===result.ids.length;
  const unit=CHEMISTRY_SYLLABUS_2027.find(item=>item.id===result.unitId);
  $('chapter-test-title').textContent=`${unit.title} · Results`;$('chapter-test-timer').textContent='Finished';
  const title=document.createElement('h3');title.textContent=`${result.correct}/20 correct · ${result.score}% · ${result.score>=CHEMISTRY_STUDY_CONFIG.masteryTarget?'Mastery target reached':'Keep practising'}`;
  const xp=document.createElement('p');xp.textContent=`Question rewards +${result.questionXp||0} XP · completion bonuses +${result.bonusXp||0} XP · net ${result.xp>=0?'+':''}${result.xp} XP after streak rules.`;
  const weakIds=[...new Set(result.ids.filter(id=>result.answers[id]?.choice!==chemistryQuestion(id).answer).map(id=>chemistryQuestion(id).subtopicId))];
  const weak=document.createElement('p');weak.textContent=weakIds.length?`Revise these syllabus sections: ${weakIds.map(chemistryTopicName).join(' ')}`:'Every test question was answered correctly.';
  content.append(title,xp,weak);
  for(const id of result.ids){
   const question=chemistryQuestion(id),choice=result.answers[id]?.choice;
   const details=document.createElement('details'),summary=document.createElement('summary');
   summary.textContent=`${choice===question.answer?'✓ Correct':choice===undefined?'Unanswered':'× Incorrect'} · ${question.prompt}`;
   const answer=document.createElement('p');answer.textContent=`Your answer: ${choice===undefined?'Unanswered':question.options[choice]}. Correct answer: ${question.options[question.answer]}.`;
   details.append(summary,answer);renderChemistrySteps(details,question);content.append(details);
  }
  return;
 }
 const unit=CHEMISTRY_SYLLABUS_2027.find(item=>item.id===test.unitId);
 $('chapter-test-title').textContent=unit.title;
 const meta=document.createElement('p');meta.textContent=`Question ${test.index+1}/20 · ${Object.keys(test.answers).length} answered · results after submission`;
 const nav=document.createElement('div');nav.className='challenge-nav';
 test.ids.forEach((id,index)=>{const button=document.createElement('button');button.type='button';button.className=`challenge-dot${index===test.index?' current':''}${test.answers[id]?' answered':''}`;button.textContent=index+1;button.setAttribute('aria-label',`Test question ${index+1}`);button.addEventListener('click',()=>{if(test.deadline<=Date.now()){chapterTestTick();return;}test.index=index;save();renderChemistryTest();});nav.append(button);});
 const question=chemistryQuestion(test.ids[test.index]);const title=document.createElement('h3');title.textContent=question.prompt;
 const options=document.createElement('div');options.className='options';options.setAttribute('role','group');options.setAttribute('aria-label','Choose your chapter-test answer');
 question.options.forEach((value,choice)=>{const button=document.createElement('button');button.type='button';button.className='option';button.textContent=`${'ABCD'[choice]}. ${value}`;button.setAttribute('aria-pressed',String(test.answers[question.id]?.choice===choice));button.addEventListener('click',()=>chooseChemistryTestAnswer(choice));options.append(button);});
 const next=document.createElement('button');next.type='button';next.className='secondary';next.textContent='Next question →';next.addEventListener('click',()=>{if(test.deadline<=Date.now()){chapterTestTick();return;}test.index=(test.index+1)%test.ids.length;save();renderChemistryTest();});
 content.append(meta,nav,title,options,next);chapterTestTick();
}
function setupChemistryStudy() {
 if(!isChemistry2027)return;
 $('chemistry-dashboard').hidden=false;$('chemistry-test-controls').hidden=false;
 const legacy=$('chemistry-legacy');legacy.replaceChildren();
 for(const mapping of CHEMISTRY_CHAPTER_MAPPINGS){const line=document.createElement('p');line.textContent=`${mapping.from} → ${mapping.units.map(number=>`Unit ${number}`).join(', ')}${mapping.legacy?' · standalone compound practice retained as legacy':''}.`;legacy.append(line);}
 for(const item of CHEMISTRY_LEGACY_CHAPTERS){const line=document.createElement('p');line.textContent=`${item.name}: ${item.reason}`;legacy.append(line);}
 $('chapter-test-open').addEventListener('click',()=>startChemistryTest());
 $('chapter-test-close').addEventListener('click',()=>$('chapter-test-dialog').close());
 $('chapter-test-dialog').addEventListener('close',()=>{if(chapterLevelUp){const reward=chapterLevelUp;chapterLevelUp=null;showLevelUp(reward.level,reward.xp);}});
 $('chapter-test-submit').addEventListener('click',()=>{const test=state.chemistryStudy.activeTest;if(!test)return;chapterTestTick();if(!state.chemistryStudy.activeTest)return;$('chapter-test-finish-description').textContent=`Submit ${Object.keys(test.answers).length}/20 answers? Unanswered questions score zero. Results and XP appear after submission.`;$('chapter-test-finish').returnValue='';$('chapter-test-finish').showModal();});
 $('chapter-test-finish').addEventListener('close',()=>{if($('chapter-test-finish').returnValue==='submit')finishChemistryTest();});
 $('chapter-test-retry').addEventListener('click',()=>{const result=chapterTestResult||state.chemistryStudy.history.at(-1);if(result)startChemistryTest(CHEMISTRY_SYLLABUS_2027.findIndex(unit=>unit.id===result.unitId));});
 $('chapter-test-revise').addEventListener('click',()=>{const result=chapterTestResult||state.chemistryStudy.history.at(-1);if(!result)return;$('chapter-test-dialog').close();state.round=null;state.filter='review';state.chemistryStudy.revisionIds=result.ids.filter(id=>result.answers[id]?.choice!==chemistryQuestion(id).answer);reviewQueue=reviewQuestionIds();state.current=reviewQueue[0]||null;state.response=null;render(true);save();});
 $('reset-dialog').addEventListener('close',()=>{if($('reset-dialog').returnValue==='reset'){chapterTestResult=null;chapterLevelUp=null;if($('chapter-test-dialog').open)$('chapter-test-dialog').close();}});
 document.addEventListener('visibilitychange',chapterTestTick);
 renderChemistryDashboard();chapterTestTick();setInterval(chapterTestTick,1000);
}
