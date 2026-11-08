'use strict';
let KEY = GUEST_PROGRESS_KEY;
const $ = id => document.getElementById(id);
const fresh = () => ({version:2,xp:0,streak:0,wrongStreak:0,best:0,quoteCursor:0,stickerLevel:1,avatarLevel:1,activity:{},topicTests:{},round:null,challenge:null,challengeEarned:{},results:{},filter:'all',current:null,response:null});
function validDeck(ids,filter) {
 const base=filter==='all'?QUESTIONS:QUESTIONS.filter(q=>q.topic===Number(filter));
 return Array.isArray(ids)&&ids.length===base.length&&new Set(ids).size===ids.length&&base.every(q=>ids.includes(q.id)||ids.includes(`v-${q.id}`));
}
let storageOK = true;
function load(snapshot) {
 try {
  const raw = snapshot===undefined ? JSON.parse(localStorage.getItem(KEY)) : JSON.parse(JSON.stringify(snapshot));
  if(!raw || ![1,2].includes(raw.version)) return fresh();
  const state = fresh();
  for(const q of ALL_QUESTIONS) {
   const r = raw.results?.[q.id];
   if(r && Number.isInteger(r.choice) && r.choice >= 0 && r.choice < 4 && typeof r.earned === 'boolean') state.results[q.id] = {choice:r.choice,earned:r.earned};
  }
  for(let t=0;t<TOPICS.length;t++) {
   const a=raw.activity?.[t];
   if(a && Number.isSafeInteger(a.correct) && a.correct>=0 && Number.isSafeInteger(a.wrong) && a.wrong>=0)state.activity[t]={correct:a.correct,wrong:a.wrong};
   else {const rows=QUESTIONS.filter(q=>q.topic===t&&state.results[q.id]);state.activity[t]={correct:rows.filter(q=>state.results[q.id].choice===q.answer).length,wrong:rows.filter(q=>state.results[q.id].choice!==q.answer).length};}
  }
  state.challenge=raw.challenge || null;
  state.challengeEarned=raw.challengeEarned && typeof raw.challengeEarned==='object'?raw.challengeEarned:{};
  for(const filter of ['all',...TOPICS.map((_,i)=>String(i))])if(validDeck(raw.topicTests?.[filter],filter))state.topicTests[filter]=raw.topicTests[filter];
  // Old saves migrate without losing mastery. New balances include bonuses and penalties.
  state.xp = raw.version === 2 && Number.isSafeInteger(raw.xp) && raw.xp >= 0
   ? raw.xp : Object.values(state.results).filter(r => r.earned).length * 20;
  if (KEY === GUEST_PROGRESS_KEY) {
   const savedLevel = Number.isSafeInteger(raw.stickerLevel) ? raw.stickerLevel : 1;
   state.stickerLevel = Math.min(MAX_STICKER_LEVEL, Math.max(savedLevel, Math.floor(state.xp / 100) + 1));
   if (Number.isInteger(raw.avatarLevel) && raw.avatarLevel >= 1 && raw.avatarLevel <= state.stickerLevel) state.avatarLevel = raw.avatarLevel;
  }
  state.streak = Number.isSafeInteger(raw.streak) && raw.streak >= 0 ? raw.streak : 0;
  state.best = Math.max(state.streak,Number.isSafeInteger(raw.best) && raw.best >= 0 ? raw.best : 0);
  state.wrongStreak = !state.streak && Number.isSafeInteger(raw.wrongStreak) && raw.wrongStreak >= 0 ? raw.wrongStreak : 0;
  state.quoteCursor = Number.isSafeInteger(raw.quoteCursor) && raw.quoteCursor >= 0 ? raw.quoteCursor : 0;
  state.filter = raw.filter === 'review' || raw.filter === 'all' || TOPICS[raw.filter] ? raw.filter : 'all';
  state.current = ALL_QUESTIONS.some(q => q.id === raw.current) ? raw.current : null;
  const round=raw.round;
  if(round&&round.filter===state.filter&&validDeck(round.ids,state.filter)) {
   const answers={};
   round.ids.forEach(id=>{const a=round.answers?.[id];if(a&&Number.isInteger(a.choice)&&a.choice>=0&&a.choice<4)answers[id]={id,choice:a.choice,delta:Number.isSafeInteger(a.delta)?a.delta:0,bonus:a.bonus===true,penalty:a.penalty===true};});
   state.round={filter:state.filter,mode:round.mode==='random'?'random':'same',ids:round.ids,answers,finished:round.finished===true&&Object.keys(answers).length===round.ids.length};
  }
  if(raw.response?.id === state.current && Number.isInteger(raw.response.choice) && raw.response.choice >= 0 && raw.response.choice < 4 && state.results[state.current]?.choice === raw.response.choice) state.response = {id:state.current,choice:raw.response.choice,delta:Number.isSafeInteger(raw.response.delta)?raw.response.delta:0,bonus:raw.response.bonus===true,penalty:raw.response.penalty===true};
  return state;
 } catch { storageOK = false; return fresh(); }
}
let state = load();
let visitCounts={correct:0,wrong:0};
function recordAttempt(topic,correct) {
 const a=state.activity[topic] || (state.activity[topic]={correct:0,wrong:0});
 a[correct?'correct':'wrong']++;
 visitCounts[correct?'correct':'wrong']++;
}
function renderCounts() {
 const selected=state.filter==='all'||state.filter==='review'?TOPICS.map((_,i)=>i):[Number(state.filter)];
 const sum=selected.reduce((a,t)=>({correct:a.correct+(state.activity[t]?.correct||0),wrong:a.wrong+(state.activity[t]?.wrong||0)}),{correct:0,wrong:0});
 $('count-answered').textContent=sum.correct+sum.wrong;
 $('count-correct').textContent=sum.correct;
 $('count-wrong').textContent=sum.wrong;
 $('count-accuracy').textContent=sum.correct+sum.wrong?`${Math.round(sum.correct/(sum.correct+sum.wrong)*100)}%`:'—';
 $('visit-counts').textContent=`This visit: ${visitCounts.correct+visitCounts.wrong} answered · ${visitCounts.correct} correct · ${visitCounts.wrong} wrong. Totals include repeat attempts and challenges.`;
 $('topic-count-rows').replaceChildren();
 TOPICS.forEach(([name],t)=>{const a=state.activity[t]||{correct:0,wrong:0};const tr=document.createElement('tr');[name,a.correct+a.wrong,a.correct,a.wrong].forEach(value=>{const td=document.createElement('td');td.textContent=value;tr.append(td)});$('topic-count-rows').append(tr)});
}
let pendingAnswer=null;
let reviewQueue = [];
let toastTimer;
let answerPopupTimer;
let levelUpTimer;
const MOTIVATION = [
 'Small steps today become strong foundations tomorrow.',
 'You don’t need to know everything. Just keep learning the next thing.',
 'Every question you work through is a little more confidence earned.',
 'Keep showing up. Your effort is turning into understanding.',
 'Progress is built one brave attempt at a time.',
 'A difficult topic is a future strength in disguise.',
 'Stay curious. The next breakthrough could be one question away.',
 'Your pace is yours. Keep moving forward.',
 'Mistakes give you directions. Practice takes you further.',
 'You’re building something stronger than a score: understanding.',
 'Take a breath, trust your practice, and try the next question.',
 'Little by little, the unfamiliar becomes familiar.',
 'Celebrate this step. You worked for it.',
 'Consistency makes room for extraordinary progress.',
 'Today’s practice is a gift to your future self.',
 'Keep going. You have more to discover.'
];
function dismissLevelUp() {
 clearTimeout(levelUpTimer);
 $('level-up-popup').hidden=true;
}
function showLevelUp(level,delta=state.response?.delta||0) {
 dismissAnswerPopup();
 $('level-up-number').textContent=level;
 $('level-up-title').textContent=`Congratulations! You reached Level ${level}.`;
 $('level-up-quote').textContent=`“${MOTIVATION[state.quoteCursor % MOTIVATION.length]}”`;
 $('level-up-reward').textContent=`+${delta} XP earned · ${state.xp} XP total`;
 const guestSticker = KEY === GUEST_PROGRESS_KEY && level <= MAX_STICKER_LEVEL;
 $('level-sticker').hidden = !guestSticker;
 if (guestSticker) {
  const sticker = stickerForLevel(level);
  $('level-sticker-image').src = sticker.image;
  $('level-sticker-name').textContent = sticker.name;
  const equip = $('equip-level-sticker');
  equip.dataset.level = level;
  equip.disabled = state.avatarLevel === level;
  equip.textContent = equip.disabled ? 'Profile picture equipped' : 'Use as profile picture';
 }
 state.quoteCursor=(state.quoteCursor+1)%MOTIVATION.length;
 save();
 $('level-up-popup').hidden=false;
 celebrateAnswer();
 levelUpTimer=setTimeout(dismissLevelUp,7500);
}
let confettiTimer;
function clearConfetti() {
 clearTimeout(confettiTimer);
 $('answer-confetti').hidden=true;
 $('answer-confetti').replaceChildren();
}
function celebrateAnswer() {
 clearConfetti();
 const layer=$('answer-confetti');
 const colors=['#147563','#e4b54b','#ed8b7e','#8f9de3','#7fc6b5','#d2df83'];
 for(let i=0;i<36;i++) {
  const piece=document.createElement('i');
  const right=i%2===1;
  const distance=14+Math.random()*51;
  const direction=right?-1:1;
  piece.setAttribute('style',`left:${right?96:4}%;background:${colors[i%colors.length]};--mid-x:${direction*distance*.7}vw;--end-x:${direction*distance}vw;--rise:${-25-Math.random()*38}vh;--fall:${15+Math.random()*20}vh;--spin:${direction*(180+Math.random()*360)}deg;--end-spin:${direction*(540+Math.random()*360)}deg;animation-delay:${Math.random()*.12}s;animation-duration:${1.25+Math.random()*.35}s`);
  layer.append(piece);
 }
 layer.hidden=false;
 confettiTimer=setTimeout(clearConfetti,1800);
}
function dismissAnswerPopup() {
 clearTimeout(answerPopupTimer);
 dismissLevelUp();
 clearConfetti();
 $('answer-popup').hidden=true;
}
function showAnswerPopup(q,correct,earnedNow,response=state.response) {
 dismissAnswerPopup();
 const popup=$('answer-popup');
 popup.className=`answer-popup ${correct?'is-correct':'is-wrong'}`;
 $('popup-symbol').textContent=correct?'🎉':'↻';
 $('popup-title').textContent=correct?'Correct! Let’s celebrate.':'Not quite. Try again!';
 $('popup-detail').textContent=correct
  ? (earnedNow?'A new question mastered.':'Already mastered — no extra XP this time.')
  : `Correct answer: ${'ABCD'[q.answer]}. ${q.options[q.answer]}`;
 if(response.bonus) $('popup-detail').textContent='Six correct in a row! Your 20% bonus added 4 XP.';
 if(response.penalty) $('popup-detail').textContent=`Five wrong in a row: your XP was halved. Correct answer: ${'ABCD'[q.answer]}. ${q.options[q.answer]}`;
 $('popup-xp').textContent=`${response.delta<0?'':'+'}${response.delta} XP`;
 $('popup-total').textContent=`Total: ${state.xp} XP`;
 popup.hidden=false;
 if(correct) celebrateAnswer();
 answerPopupTimer=setTimeout(dismissAnswerPopup,4000);
}
function save() {
 if (KEY === GUEST_PROGRESS_KEY) state.stickerLevel = Math.min(MAX_STICKER_LEVEL, Math.max(state.stickerLevel, Math.floor(state.xp / 100) + 1));
 try {localStorage.setItem(KEY,JSON.stringify(state)); storageOK = true;}
 catch {storageOK = false;}
 $('save-state').textContent = storageOK ? '● Progress saved on this device' : 'Progress is temporary · storage unavailable';
 globalThis.queueCloudSave?.();
}
function missed() { return ALL_QUESTIONS.filter(q => state.results[q.id] && state.results[q.id].choice !== q.answer); }
function pool() {
 if(state.round?.filter===state.filter)return state.round.ids.map(id=>ALL_QUESTIONS.find(q=>q.id===id));
 if(state.filter === 'review') return reviewQueue.map(id => ALL_QUESTIONS.find(q=>q.id===id)).filter(Boolean);
 return state.filter === 'all' ? QUESTIONS : QUESTIONS.filter(q => q.topic === Number(state.filter));
}
function activeQuestion() {return ALL_QUESTIONS.find(q=>q.id===state.current);}
function chooseInitial() {
 const list = pool();
 if(!list.some(q=>q.id===state.current)) {
  state.current = (list.find(q=>!state.results[q.id]) || list.find(q=>!state.results[q.id]?.earned) || list[0])?.id || null;
  state.response = null;
 }
 if(state.round)state.response=state.round.answers[state.current]||null;
}
function startRetake(mode) {
 if(state.filter==='review')return;
 dismissAnswerPopup();
 const base=state.filter==='all'?QUESTIONS:QUESTIONS.filter(q=>q.topic===Number(state.filter));
 const previous=state.topicTests[state.filter]||base.map(q=>q.id);
 let ids=[...previous];
 if(mode==='random') {
  ids=base.map(q=>Math.random()<.5?q.id:`v-${q.id}`);
  // Always change actual question content, even if a random draw repeats the last set.
  if(ids.every(id=>previous.includes(id))){const i=Math.floor(Math.random()*ids.length);ids[i]=ids[i].startsWith('v-')?ids[i].slice(2):`v-${ids[i]}`;}
  for(let i=ids.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}
 }
 state.topicTests[state.filter]=[...ids];
 state.round={filter:state.filter,mode,ids,answers:{},finished:false};
 state.current=ids[0];state.response=null;visitCounts={correct:0,wrong:0};
 render(true);save();
}
function stats() {
 updateGuestProfile();
 renderCounts();
 const level = Math.floor(state.xp/100)+1, progress=state.xp%100;
 $('level').textContent = level;
 $('rank').textContent = level < 4 ? 'Curious mind' : level < 8 ? 'Bond builder' : level < 12 ? 'Reaction pro' : 'Chemistry ace';
 $('xp-label').textContent = `${progress} / 100 XP to level ${level+1}`;
 $('xp-bar').style.width = `${progress}%`;
 $('xp-progress').setAttribute('aria-valuenow',progress);
 $('total-xp').textContent = state.xp;
 $('streak').replaceChildren(document.createTextNode(`${state.streak} `));
 const small = document.createElement('small');small.textContent='in a row';$('streak').append(small);
 $('best-streak').textContent = `Personal best: ${state.best}`;
 $('streak-rule').textContent=state.wrongStreak
  ? `${state.wrongStreak % 5} / 5 wrong toward the next XP halving · every 6th consecutive correct answer earns +24 XP.`
  : state.streak % 6 === 5 ? 'Bonus ready! Your next new correct answer earns +24 XP.'
  : 'Every 6th consecutive correct answer: +24 XP · every 5 consecutive wrong answers: halve current XP.';
 $('missed-count').textContent = missed().length;
 $('mix').classList.toggle('active',state.filter === 'all');
 $('review').classList.toggle('active',state.filter === 'review');
 $('mix').setAttribute('aria-pressed',state.filter === 'all');
 $('review').setAttribute('aria-pressed',state.filter === 'review');
 document.querySelectorAll('.topic').forEach((button,t) => {
  button.classList.toggle('active',state.filter === String(t));
  button.setAttribute('aria-pressed',state.filter === String(t));
  button.querySelector('small').textContent = `${QUESTIONS.filter(q=>q.topic===t && state.results[q.id]?.earned).length}/4`;
 });
 $('topic-select').value = state.filter;
 $('practice-title').textContent = state.filter==='all' ? 'Mixed practice' : state.filter==='review' ? 'Review mistakes' : TOPICS[Number(state.filter)][0];
 const list = pool();
 $('retake-toolbar').hidden=state.filter==='review';
 const round=state.round;
 if(round) {
  const answered=Object.keys(round.answers).length;
  const correct=round.ids.filter(id=>round.answers[id]?.choice===ALL_QUESTIONS.find(q=>q.id===id).answer).length;
  $('retake-status').textContent=`${round.mode==='random'?'Random variations':'Same questions'} · ${answered}/${round.ids.length} answered · ${correct} correct · ${answered-correct} wrong${round.finished?' · Finished':''}`;
 } else $('retake-status').textContent='Retake this topic or mixed set. Same repeats your last set; Random changes the questions.';
 $('mastery').textContent = state.filter==='review' ? `${missed().length} to revisit` : `${list.filter(q=>state.results[q.id]?.earned).length} of ${list.length} mastered`;
}
function feedback(q,choice,earnedNow=false) {
 const correct=choice===q.answer;
 const box=$('feedback');box.hidden=false;box.className=`feedback${correct?'':' incorrect'}`;box.replaceChildren();
 const title=document.createElement('strong');
 const reward=state.response?.id===q.id?state.response:null;
 title.textContent=correct ? (reward?.delta>0 ? `Nicely done! +${reward.delta} XP${reward.bonus?' · 20% streak bonus':''}` : 'That’s right. Keep it fresh!') : `Good try. The answer is ${'ABCD'[q.answer]}.${reward?.penalty?` XP halved: ${reward.delta} XP.`:''}`;
 const p=document.createElement('p');p.textContent=q.explanation;box.append(title,p);
}
function render(animate=false) {
 chooseInitial();stats();
 const q=activeQuestion(), list=pool(), body=$('question-body');
 body.className=`question-body${animate?' animate':''}`;
 $('feedback').hidden=true;
 if(state.round?.finished) {
  const round=state.round,answered=Object.keys(round.answers).length;
  const correct=round.ids.filter(id=>round.answers[id]?.choice===ALL_QUESTIONS.find(q=>q.id===id).answer).length;
  body.className='question-body empty';body.replaceChildren();
  const h=document.createElement('h2');h.id='question-text';h.textContent=`Round complete! ${correct} / ${answered} correct.`;
  const p=document.createElement('p');p.textContent='Retake the same questions to strengthen recall, or choose Random variations to practise the same concepts with new details.';
  body.append(h,p);$('topic-pill').textContent='Practice pays off';$('question-position').textContent=`${answered} / ${round.ids.length}`;
  const delta=Object.values(round.answers).reduce((sum,a)=>sum+a.delta,0);
  $('reward-note').textContent=`${delta>=0?'+':''}${delta} XP this round`;
  $('next').textContent='Back to topic practice →';return;
 }
 if(!q || !list.length) {
  $('topic-pill').textContent='A clean slate';$('question-position').textContent='';
  body.className='question-body empty';body.replaceChildren();
  const icon=document.createElement('div');icon.className='empty-icon';icon.textContent='✧';
  const h=document.createElement('h2');h.id='question-text';h.textContent='No mistakes to revisit.';
  const p=document.createElement('p');p.textContent='Answer a few questions in mixed practice. Any mistakes will be ready for a second look here.';
  body.append(icon,h,p);$('next').textContent='Back to practice →';$('reward-note').textContent='A little practice goes a long way.';return;
 }
 // Rebuild the question content, including after the empty review state.
 body.replaceChildren();
 const kicker=document.createElement('div');kicker.className='question-kicker';kicker.textContent='PICK THE CORRECT ANSWER';
 const h=document.createElement('h2');h.id='question-text';h.textContent=q.prompt;h.tabIndex=-1;
 const options=document.createElement('div');options.id='options';options.className='options';options.setAttribute('role','group');options.setAttribute('aria-label','Answer choices');
 const answered=state.response?.id===q.id;
 q.options.forEach((text,i)=>{
  const button=document.createElement('button');button.className='option';button.disabled=answered;
  const letter=document.createElement('span');letter.className='letter';letter.textContent='ABCD'[i];
  const label=document.createElement('span');label.textContent=text;button.append(letter,label);
  if(answered && (i===q.answer || i===state.response.choice)) {
   button.classList.add(i===q.answer?'correct':'wrong');
   const mark=document.createElement('span');mark.className='choice-mark';mark.setAttribute('aria-hidden','true');mark.textContent=i===q.answer?'✓':'×';button.append(mark);
   button.setAttribute('aria-label',`${'ABCD'[i]}. ${text}. ${i===q.answer?'Correct answer':'Your answer, incorrect'}`);
  }
  button.addEventListener('click',()=>answer(i));options.append(button);
 });
 body.append(kicker,h,options);
 $('topic-pill').textContent=`${TOPICS[q.topic][0]}`;
 $('question-position').textContent=`${String(list.findIndex(x=>x.id===q.id)+1).padStart(2,'0')} / ${String(list.length).padStart(2,'0')}`;
 $('next').innerHTML=answered?'Next question <span>→</span>':'Skip question <span>→</span>';
 $('reward-note').textContent=state.results[q.id]?.earned?'✓ XP earned · practise for confidence': state.streak%6===5?'✦ +24 XP if correct · streak bonus':'✦ +20 XP for a new correct answer';
 if(answered) feedback(q,state.response.choice);
 if(animate) h.focus({preventScroll:true});
}
function toast(message) {clearTimeout(toastTimer);$('toast').textContent=message;$('toast').classList.add('show');toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3400);}
function answer(choice) {
 const q=activeQuestion();
 if(!q || state.response?.id===q.id || pendingAnswer || !Number.isInteger(choice) || choice<0 || choice>3)return;
 dismissAnswerPopup();
 pendingAnswer={id:q.id,choice};
 $('confirmation-choice').textContent=`${'ABCD'[choice]}. ${q.options[choice]}`;
 $('confirmation-stakes').textContent=state.wrongStreak%5===4
  ? `You have 4 wrong in a row. Another wrong answer will halve your ${state.xp} XP.`
  : state.streak%6===5 && !state.results[q.id]?.earned
   ? 'If correct, this answer earns 24 XP — including your 20% streak bonus.'
   : 'Your answer will be checked only after you confirm.';
 $('confirm-answer').returnValue='';
 $('confirm-answer').showModal();
}
function commitAnswer(choice) {
 const q=activeQuestion();if(!q || state.response?.id===q.id) return;
 const remote=globalThis.accountScoreAction?.('practice',{id:q.id,choice},receipt=>{
  render();feedback(q,receipt.choice,receipt.earnedNow);
  showAnswerPopup(q,receipt.correct,receipt.earnedNow,receipt);
  const level=Math.floor(state.xp/100)+1,oldLevel=Math.floor((state.xp-receipt.delta)/100)+1;
  if(level>oldLevel)showLevelUp(level,receipt.delta);
  $('next').focus({preventScroll:true});
 });
 if(remote)return remote;
 const correct=choice===q.answer, earnedNow=correct && !state.results[q.id]?.earned;
 recordAttempt(q.topic,correct);
 const oldLevel=Math.floor(state.xp/100)+1;
 state.results[q.id]={choice,earned:earnedNow || !!state.results[q.id]?.earned};
 const before=state.xp;
 state.streak=correct ? state.streak+1 : 0;state.best=Math.max(state.best,state.streak);
 state.wrongStreak=correct ? 0 : state.wrongStreak+1;
 const bonus=earnedNow && state.streak%6===0;
 const penalty=!correct && state.wrongStreak%5===0;
 if(earnedNow) state.xp+=bonus?24:20;
 if(penalty) state.xp=Math.floor(state.xp/2);
 state.response={id:q.id,choice,delta:state.xp-before,bonus,penalty};
 if(state.round)state.round.answers[q.id]={...state.response};
 save();render();feedback(q,choice,earnedNow);
 showAnswerPopup(q,correct,earnedNow);
 const level=Math.floor(state.xp/100)+1;
 if(level>oldLevel) showLevelUp(level);
 else if(earnedNow && ALL_QUESTIONS.every(item=>state.results[item.id]?.earned)) toast('All 128 topic questions mastered. Brilliant work!');
 $('next').focus({preventScroll:true});
}
function setFilter(value) {
 dismissAnswerPopup();
 visitCounts={correct:0,wrong:0};
 state.round=null;
 state.filter=value;state.current=null;state.response=null;
 if(value==='review') reviewQueue=missed().map(q=>q.id);
 render(true);save();
}
function next() {
 dismissAnswerPopup();
 if(state.round) {
  const round=state.round;
  if(round.finished){state.round=null;state.current=null;state.response=null;render(true);save();return;}
  if(round.ids.every(id=>round.answers[id]))round.finished=true;
  else {const i=round.ids.indexOf(state.current);state.current=[...round.ids.slice(i+1),...round.ids.slice(0,i+1)].find(id=>!round.answers[id]);}
  state.response=null;render(true);save();return;
 }
 if(!pool().length && !activeQuestion()){setFilter('all');return;}
 if(state.filter==='review') {
  reviewQueue=missed().map(q=>q.id);
  if(!reviewQueue.length){state.current=null;state.response=null;render(true);save();return;}
 }
 const list=pool();
 if(!list.length){setFilter('all');return;}
 const currentIndex=list.findIndex(q=>q.id===state.current);
 state.current=list[(currentIndex+1)%list.length].id;state.response=null;
 render(true);save();
}
// Navigation remains lightweight, with native select controls on small screens.
for(const branch of ['Inorganic','Physical','Organic']) {
 const heading=document.createElement('div');heading.className='branch';heading.textContent=`${branch} chemistry`;$('topics').append(heading);
 TOPICS.forEach(([name,group],t)=>{
  if(group!==branch)return;
  const button=document.createElement('button');button.className='topic';
  const label=document.createElement('span');label.textContent=name;const count=document.createElement('small');count.textContent='0/4';
  button.append(label,count);button.dataset.topic=t;button.addEventListener('click',()=>setFilter(String(t)));$('topics').append(button);
 });
}
// DOM order follows topic order, used by progress counters above.
TOPICS.forEach(([name],t)=>{const option=document.createElement('option');option.value=String(t);option.textContent=name;$('topic-select').append(option);});
$('mix').addEventListener('click',()=>setFilter('all'));
$('review').addEventListener('click',()=>setFilter('review'));
$('topic-select').addEventListener('change',event=>setFilter(event.target.value));
$('next').addEventListener('click',next);
$('retake-same').addEventListener('click',()=>startRetake('same'));
$('retake-random').addEventListener('click',()=>startRetake('random'));
$('dismiss-answer-popup').addEventListener('click',dismissAnswerPopup);
$('guest-profile-open').addEventListener('click', () => {
 if (KEY !== GUEST_PROGRESS_KEY) return;
 renderGuestStickers();
 $('guest-profile-status').textContent = `Current picture: ${stickerForLevel(state.avatarLevel).name}`;
 $('guest-profile').showModal();
});
$('equip-level-sticker').addEventListener('click', event => {
 equipGuestSticker(Number(event.target.dataset.level));
 event.target.textContent = 'Profile picture equipped';
 event.target.disabled = true;
});
$('dismiss-level-up').addEventListener('click',()=>{dismissLevelUp();clearConfetti();});
$('confirm-answer').addEventListener('close',()=>{
 const selection=pendingAnswer;pendingAnswer=null;
 if($('confirm-answer').returnValue==='confirm' && selection?.id===state.current) commitAnswer(selection.choice);
});
$('about-button').addEventListener('click',()=>$('about').showModal());
$('reset-button').addEventListener('click',()=>{
 $('reset-description').textContent=KEY==='chemistry-quest-v1'
  ? 'This clears your guest XP, answers, streaks, and stickers on this device. You can’t undo it.'
  : 'This resets your account’s XP, answers, streaks, and challenge progress. The reset will sync online and appear on your other devices. You can’t undo it.';
 $('reset-dialog').showModal();
});
$('reset-dialog').addEventListener('close',()=>{if($('reset-dialog').returnValue==='reset'){
 if(globalThis.accountScoreAction?.('reset',{},()=>{reviewQueue=[];render(true);renderChallenge();toast('Fresh start. Your account was reset online.');}))return;
 dismissAnswerPopup();state=fresh();reviewQueue=[];render(true);save();toast('Fresh start. Let’s build from here.');
}});
document.addEventListener('keydown',event=>{
 if(document.querySelector('dialog[open]') || event.target.closest?.('.challenge-card') || /SELECT|INPUT|TEXTAREA/.test(event.target.tagName) || event.altKey || event.ctrlKey || event.metaKey)return;
 if(/^[1-4]$/.test(event.key)){event.preventDefault();answer(Number(event.key)-1);}
 else if(event.key==='Enter' && event.target===document.body && state.response){event.preventDefault();next();}
});
if(state.filter==='review') {
 reviewQueue=missed().map(q=>q.id);
 if(state.response && !reviewQueue.includes(state.current))reviewQueue.unshift(state.current);
}
render();save();
