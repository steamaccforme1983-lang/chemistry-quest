'use strict';
// Original single-correct JEE-style questions, with fixed difficulty-based rewards.
const CHALLENGE_QUESTIONS = [
 {id:'jee-1',topic:6,xp:70,prompt:'PCl₅(g) ⇌ PCl₃(g) + Cl₂(g). Pure PCl₅ is initially taken and is 20% dissociated at equilibrium. If the total equilibrium pressure is 2 bar, the numerical value of Kp (using pressures in bar) is:',options:['1/6','1/12','1/24','1/3'],answer:1,explanation:'Starting with 1 mol, equilibrium amounts are 0.8, 0.2 and 0.2 mol; total = 1.2 mol. Partial pressures are 4/3, 1/3 and 1/3 bar. Kp = (1/3)²/(4/3) = 1/12. Equivalently Kp = α²P/(1 − α²).'},
 {id:'jee-2',topic:6,xp:80,prompt:'100 mL of 0.40 M acetic acid is mixed with 100 mL of 0.30 M NaOH. Given pKa = 4.76 and log₁₀3 = 0.477, the approximate final pH is (assume ideal behaviour):',options:['4.28','4.76','5.24','8.76'],answer:2,explanation:'Initially acid = 0.040 mol and OH⁻ = 0.030 mol. Neutralisation leaves 0.010 mol acid and makes 0.030 mol acetate. Henderson–Hasselbalch gives pH = 4.76 + log(3) = 5.237 ≈ 5.24.'},
 {id:'jee-3',topic:7,xp:70,prompt:'At 298 K, a reaction has ΔG° = −11.416 kJ mol⁻¹. Given 2.303RT = 5.708 kJ mol⁻¹ at this temperature, its equilibrium constant K is approximately:',options:['0.01','10','100','1000'],answer:2,explanation:'ΔG° = −2.303RT log₁₀K. Thus log₁₀K = 11.416/5.708 = 2, so K = 100. The negative standard Gibbs energy favours products.'},
 {id:'jee-4',topic:10,xp:90,prompt:'A decomposes by parallel first-order pathways A → B and A → C. Its observed half-life is 10 min and the final molar ratio B:C is 3:1. What is the rate constant for A → B? (ln 2 = 0.693)',options:['0.0173 min⁻¹','0.0520 min⁻¹','0.0693 min⁻¹','0.2079 min⁻¹'],answer:1,explanation:'For parallel first-order reactions, kB + kC = ln 2/t½ = 0.0693 min⁻¹. Product ratio B/C = kB/kC = 3. Therefore kB = (3/4)(0.0693) = 0.051975 ≈ 0.0520 min⁻¹.'},
 {id:'jee-5',topic:10,xp:70,prompt:'For a second-order reaction obeying −d[A]/dt = k[A]², 75% of A is consumed in 300 s. Starting from the same initial concentration, how long is required to consume 50%?',options:['75 s','100 s','150 s','200 s'],answer:1,explanation:'1/[A] − 1/[A]₀ = kt. At 75% conversion, [A] = [A]₀/4, so kt = 3/[A]₀. At 50%, kt½ = 1/[A]₀. Hence t½ = 300/3 = 100 s.'},
 {id:'jee-6',topic:3,xp:80,prompt:'Using crystal-field theory, the numbers of unpaired electrons in [Fe(CN)₆]⁴⁻ and [FeF₆]⁴⁻, respectively, and the approximate spin-only magnetic moment of the latter are:',options:['0, 4; 4.90 BM','4, 0; 0 BM','1, 5; 5.92 BM','2, 4; 4.90 BM'],answer:0,explanation:'Both contain Fe²⁺ (d⁶). Strong-field CN⁻ gives low-spin t₂g⁶ with 0 unpaired electrons. Weak-field F⁻ gives high-spin t₂g⁴e_g² with 4. The latter has μ = √[n(n+2)] = √24 ≈ 4.90 BM.'},
 {id:'jee-7',topic:9,xp:80,prompt:'A 9.50 g mixture containing only anhydrous Na₂CO₃ and NaHCO₃ requires exactly 0.150 mol HCl for complete neutralisation. How many moles of Na₂CO₃ were present? (Molar masses: 106 and 84 g mol⁻¹)',options:['0.025 mol','0.050 mol','0.075 mol','0.100 mol'],answer:1,explanation:'Let x and y be moles of carbonate and bicarbonate. Complete neutralisation gives 2x + y = 0.150. Mass gives 106x + 84y = 9.50. Substituting y = 0.150 − 2x yields −62x = −3.10, so x = 0.050 mol.'},
 {id:'jee-8',topic:12,xp:60,prompt:'Reductive ozonolysis of an acyclic alkene gives only propanone and ethanal, one mole of each per mole of alkene. The alkene is:',options:['Pent-2-ene','2-Methylbut-1-ene','2-Methylbut-2-ene','2,3-Dimethylbut-2-ene'],answer:2,explanation:'Reconnect the carbonyl carbons of (CH₃)₂C=O and CH₃CH=O with a C=C bond. The original alkene is (CH₃)₂C=CHCH₃, named 2-methylbut-2-ene.'},
 {id:'jee-9',topic:11,xp:50,prompt:'Considering both optically active and meso forms, how many distinct configurational stereoisomers does 2,3-dichlorobutane have, and how many are optically active?',options:['4 total; 4 active','3 total; 2 active','3 total; 1 active','2 total; 2 active'],answer:1,explanation:'The two stereocentres might suggest 2² = 4 arrangements, but (2R,3S) and (2S,3R) are the same meso form because of internal symmetry. The distinct forms are RR, SS and meso: 3 total, with RR and SS optically active.'},
 {id:'jee-10',topic:8,xp:90,prompt:'For a hydrogen-like He⁺ ion, an electron falls from n = 4 to n = 2. Taking the ground-state energy of hydrogen as −13.6 eV, the emitted photon energy and wavelength (hc = 1240 eV·nm) are approximately:',options:['2.55 eV; 486 nm','10.2 eV; 122 nm','40.8 eV; 30.4 nm','13.6 eV; 91.2 nm'],answer:1,explanation:'For a hydrogen-like ion, Eₙ = −13.6Z²/n² eV. He⁺ has Z = 2. Photon energy = 54.4(1/2² − 1/4²) = 54.4(3/16) = 10.2 eV. λ = hc/E = 1240/10.2 ≈ 121.6 nm.'}
];
let challengePending=null;
function validateChallenge() {
 const c=state.challenge;
 if(!c)return;
 if(!['active','finished'].includes(c.status)||!Number.isFinite(c.deadline)||!Number.isInteger(c.index)||c.index<0||c.index>9||!c.answers||typeof c.answers!=='object'){state.challenge=null;return;}
 const clean={};
 CHALLENGE_QUESTIONS.forEach((q,i)=>{const a=c.answers[i];if(a&&Number.isInteger(a.choice)&&a.choice>=0&&a.choice<4)clean[i]={choice:a.choice,xp:Number.isInteger(a.xp)&&a.xp>=0&&a.xp<=90?a.xp:0};});c.answers=clean;
}
function challengeTimeLeft() {return Math.max(0,Math.ceil(((state.challenge?.deadline||0)-Date.now())/1000));}
function challengeTick() {
 const c=state.challenge;
 if(!c || c.status!=='active')return;
 const seconds=challengeTimeLeft();
 $('challenge-timer').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
 $('challenge-timer').classList.toggle('time-low',seconds<=300);
 if(!seconds)finishChallenge('expired');
}
function startChallenge() {
 if(state.challenge?.status==='active')return;
 state.challenge={status:'active',deadline:Date.now()+30*60*1000,index:0,answers:{},reason:null};
 save();renderChallenge();challengeTick();
}
function finishChallenge(reason='submitted') {
 const c=state.challenge;if(!c||c.status!=='active')return;
 c.status='finished';c.reason=reason;challengePending=null;
 if($('challenge-confirm').open)$('challenge-confirm').close('cancel');
 save();renderChallenge();
 if(reason==='expired')toast('Time’s up! Your challenge results are ready.');
}
function selectChallengeAnswer(choice) {
 challengeTick();
 const c=state.challenge;if(!c||c.status!=='active'||c.answers[c.index]||challengePending)return;
 dismissAnswerPopup();challengePending={index:c.index,choice};
 const q=CHALLENGE_QUESTIONS[c.index];
 $('challenge-choice').textContent=`${'ABCD'[choice]}. ${q.options[choice]}`;
 $('challenge-confirm').returnValue='';$('challenge-confirm').showModal();
}
function commitChallengeAnswer(index,choice) {
 challengeTick();
 const c=state.challenge;if(!c||c.status!=='active'||c.index!==index||c.answers[index])return;
 const q=CHALLENGE_QUESTIONS[index],correct=choice===q.answer;
 const reward=correct&&!state.challengeEarned[q.id]?q.xp:0;
 const oldLevel=Math.floor(state.xp/100)+1;
 c.answers[index]={choice,xp:reward};
 if(correct)state.challengeEarned[q.id]=true;
 state.xp+=reward;recordAttempt(q.topic,correct);
 save();stats();renderChallenge();
 showAnswerPopup(q,correct,reward>0,{delta:reward,bonus:false,penalty:false});
 const level=Math.floor(state.xp/100)+1;
 if(level>oldLevel)showLevelUp(level,reward);
 if(Object.keys(c.answers).length===10)finishChallenge('completed');
}
function renderChallenge() {
 const content=$('challenge-content');content.replaceChildren();
 const c=state.challenge;
 $('challenge-start').hidden=c?.status==='active';
 $('challenge-start').textContent=c?'Retry challenge →':'Start challenge →';
 if(!c){$('challenge-timer').textContent='30:00';return;}
 if(c.status==='finished') {
  $('challenge-timer').textContent=c.reason==='expired'?'Time’s up':'Finished';
  const answered=Object.keys(c.answers).length,correct=CHALLENGE_QUESTIONS.filter((q,i)=>c.answers[i]?.choice===q.answer).length;
  const xp=Object.values(c.answers).reduce((sum,a)=>sum+a.xp,0);
  const title=document.createElement('h3');title.textContent=`${correct} / 10 correct · ${xp} XP earned`;
  const p=document.createElement('p');p.textContent=`${answered} answered · ${answered-correct} wrong · ${10-answered} unanswered. Retry for practice; each question awards XP once.`;
  content.append(title,p);
  CHALLENGE_QUESTIONS.forEach((q,i)=>{const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent=`${i+1}. ${c.answers[i]?(c.answers[i].choice===q.answer?'✓ Correct':'× Wrong'):'Unanswered'} · ${TOPICS[q.topic][0]}`;const text=document.createElement('p');text.textContent=`${q.prompt} Correct answer: ${'ABCD'[q.answer]}. ${q.options[q.answer]}. ${q.explanation}`;details.append(summary,text);content.append(details)});
  return;
 }
 const nav=document.createElement('div');nav.className='challenge-nav';nav.setAttribute('aria-label','Challenge questions');
 CHALLENGE_QUESTIONS.forEach((q,i)=>{const b=document.createElement('button');b.textContent=i+1;b.className=`challenge-dot${i===c.index?' current':''}${c.answers[i]?' answered':''}`;b.setAttribute('aria-label',`Question ${i+1}${c.answers[i]?', answered':''}`);b.setAttribute('aria-current',i===c.index?'step':'false');b.addEventListener('click',()=>{challengeTick();if(c.status!=='active')return;c.index=i;save();renderChallenge()});nav.append(b)});
 const q=CHALLENGE_QUESTIONS[c.index],a=c.answers[c.index];
 const meta=document.createElement('p');meta.className='challenge-meta';meta.textContent=`${TOPICS[q.topic][0]} · Question ${c.index+1} / 10 · ${state.challengeEarned[q.id]?'XP already earned':`${q.xp} XP if correct`}`;
 const h=document.createElement('h3');h.textContent=q.prompt;
 const options=document.createElement('div');options.className='options';
 q.options.forEach((text,i)=>{const b=document.createElement('button');b.className='option';b.textContent=`${'ABCD'[i]}. ${text}`;b.disabled=!!a;if(a&&(i===q.answer||i===a.choice))b.classList.add(i===q.answer?'correct':'wrong');b.addEventListener('click',()=>selectChallengeAnswer(i));options.append(b)});
 content.append(nav,meta,h,options);
 if(a){const explanation=document.createElement('p');explanation.className=`feedback${a.choice===q.answer?'':' incorrect'}`;explanation.textContent=`${a.choice===q.answer?'Correct':'Not quite'} · +${a.xp} XP. ${q.explanation}`;content.append(explanation)}
 const actions=document.createElement('div');actions.className='challenge-actions';
 const next=document.createElement('button');next.className='secondary';next.textContent=a?'Next question →':'Skip for now →';next.addEventListener('click',()=>{challengeTick();if(c.status!=='active')return;c.index=(c.index+1)%10;save();renderChallenge()});
 const finish=document.createElement('button');finish.className='text-button';finish.textContent='Finish attempt';finish.addEventListener('click',()=>finishChallenge());actions.append(next,finish);content.append(actions);
}
$('challenge-start').addEventListener('click',startChallenge);
$('challenge-confirm').addEventListener('close',()=>{const pending=challengePending;challengePending=null;if($('challenge-confirm').returnValue==='confirm'&&pending)commitChallengeAnswer(pending.index,pending.choice)});
$('reset-dialog').addEventListener('close',()=>{if($('reset-dialog').returnValue==='reset'){visitCounts={correct:0,wrong:0};challengePending=null;renderCounts();renderChallenge();}});
document.addEventListener('visibilitychange',challengeTick);
validateChallenge();renderChallenge();challengeTick();save();
setInterval(challengeTick,1000);
if(typeof module!=='undefined')module.exports={CHALLENGE_QUESTIONS};
