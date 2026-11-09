'use strict';

function setupBattles(request) {
 const dialog = $('battle-dialog');
 const list = $('battle-list');
 const play = $('battle-play');
 const status = $('battle-status');
 let busy = false;
 let selected = null;
 let data = null;
 const drafts = new Map();

 function button(label, click) {
  const element = document.createElement('button');
  element.type = 'button';
  element.className = 'secondary';
  element.textContent = label;
  element.addEventListener('click', click);
  return element;
 }

 function addOwnerBadge(element, battle) {
  if (battle.opponentIsOwner !== true) return;
  const badge = document.createElement('span');
  badge.className = 'owner-badge';
  badge.textContent = 'Owner / Admin';
  element.append(badge);
 }

 function showRound(battle) {
  const questions = battle.deck?.map(id => ALL_QUESTIONS.find(question => question.id === id));
  if (questions?.length !== 5 || questions.some(question => !question)) {
   status.textContent = 'This round needs the latest app version. Close and reopen Chemistry Quest online.';
   return;
  }
  selected = battle.id;
  list.hidden = true;
  play.hidden = false;
  play.replaceChildren();
  const answers = drafts.get(selected) || Array(5).fill(null);
  drafts.set(selected, answers);
  const title = document.createElement('h3');
  title.textContent = `Battle with ${battle.opponent}`;
  addOwnerBadge(title, battle);
  play.append(title);
  const submit = button('Submit answers', () => send('submit', {id:battle.id, answers:answers.join('')}, 'Answers submitted.'));
  submit.disabled = answers.includes(null);
  questions.forEach((question, index) => {
   const group = document.createElement('fieldset');
   const prompt = document.createElement('legend');
   prompt.textContent = `${index+1}. ${question.prompt}`;
   group.append(prompt);
   question.options.forEach((option, choice) => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = `battle-question-${index}`;
    input.checked = answers[index] === choice;
    input.addEventListener('change', () => {
     answers[index] = choice;
     submit.disabled = answers.includes(null);
    });
    label.append(input, document.createTextNode(option));
    group.append(label);
   });
   play.append(group);
  });
  play.append(button('Back to battles', () => {selected = null; render();}), submit);
 }

 function render() {
  $('battle-player-code').textContent = data.playerCode;
  $('battle-invite').hidden = false;
  $('battle-copy').hidden = false;
  const active = data.battles.find(battle => battle.id === selected && battle.status === 'accepted' && !battle.submitted);
  if (active) {
   showRound(active);
   return;
  }
  selected = null;
  list.hidden = false;
  play.hidden = true;
  list.replaceChildren();
  if (!data.battles.length) list.textContent = 'No battles yet. Share your ID or enter a friend’s ID to start.';
  for (const battle of data.battles) {
   const item = document.createElement('article');
   const name = document.createElement('strong');
   name.textContent = battle.opponent;
   const summary = document.createElement('p');
   if (battle.status === 'complete') {
    const outcome = battle.yourScore === battle.theirScore ? 'Tie' : battle.yourScore > battle.theirScore ? 'You won' : 'Your friend won';
    summary.textContent = `${outcome} · You ${battle.yourScore}/5 · Friend ${battle.theirScore}/5`;
   } else if (battle.status === 'accepted') {
    summary.textContent = battle.submitted ? 'Waiting for your friend to finish.' : 'Ready to play.';
   } else if (battle.status === 'pending') {
    summary.textContent = battle.incoming ? 'Incoming challenge' : 'Waiting for your friend to accept.';
   } else {
    summary.textContent = battle.status === 'expired' ? 'Expired' : 'Declined';
   }
   addOwnerBadge(name, battle);
   item.append(name, summary);
   if (battle.status === 'pending' && battle.incoming) {
    item.append(button('Accept', () => send('accept',{id:battle.id})), button('Decline', () => send('decline',{id:battle.id})));
   }
   if (battle.status === 'accepted' && !battle.submitted) item.append(button('Play five questions', () => showRound(battle)));
   list.append(item);
  }
 }

 async function send(action, args={}, message='') {
  if (busy) return;
  busy = true;
  const owner = KEY;
  status.textContent = 'Loading…';
  try {
   const response = await request('progress', {progress:{_battle:{action,...args}}});
   if (KEY !== owner) return;
   if (!Array.isArray(response.battles) || !response.playerCode) throw new Error('Friend battles are temporarily unavailable.');
   data = response;
   if (action === 'invite') $('battle-friend-code').value = '';
   if (action === 'submit') drafts.delete(args.id);
   render();
   status.textContent = message;
  } catch (error) {
   if (KEY !== owner) return;
   status.textContent = error.message || 'Could not reach the battle service. Try again online.';
  } finally {
   busy = false;
  }
 }

 $('battles-open').addEventListener('click', () => {
  selected = null;
  data = null;
  $('battle-player-code').textContent = '';
  $('battle-invite').hidden = true;
  $('battle-copy').hidden = true;
  list.replaceChildren();
  play.hidden = true;
  list.hidden = false;
  dialog.showModal();
  send('list');
 });
 $('battle-close').addEventListener('click', () => dialog.close());
 $('battle-refresh').addEventListener('click', () => send('list'));
 $('battle-invite').addEventListener('submit', event => {
  event.preventDefault();
  send('invite', {code:$('battle-friend-code').value.trim().toUpperCase()}, 'Challenge sent.');
 });
 $('battle-copy').addEventListener('click', async () => {
  if (!data) return;
  try {
   await navigator.clipboard.writeText(data.playerCode);
   status.textContent = 'Player ID copied.';
  } catch {
   status.textContent = 'Select and copy the player ID above.';
  }
 });
 $('account-logout').addEventListener('click', () => {drafts.clear();});
}
