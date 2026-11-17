'use strict';

const ACCOUNT_ENDPOINT = 'https://bmgrefwvjqaqbljieqme.supabase.co/functions/v1/chemistry-accounts';
const ACCOUNT_SESSION_KEY = 'chemistry-quest-session';

(() => {
 if (!globalThis.crypto?.randomUUID) return;

 const storageKey = 'chemistry-quest-presence';
 const format = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/;
 let browserId = crypto.randomUUID();
 try {
  const saved = localStorage.getItem(storageKey);
  if (format.test(saved || '')) browserId = saved;
  else localStorage.setItem(storageKey, browserId);
 } catch {
  // The page can still report presence while storage is unavailable.
 }

 const idleMs = 120000;
 const heartbeatMs = 45000;
 let lastActivity = Date.now();
 let lastSent = -Infinity;
 let pending = false;
 let supported = true;

 async function heartbeat() {
  const now = Date.now();
  if (!supported || pending || document.visibilityState !== 'visible' ||
      navigator.onLine === false || now - lastActivity >= idleMs || now - lastSent < heartbeatMs) return;

  let token;
  try { token = JSON.parse(localStorage.getItem(ACCOUNT_SESSION_KEY))?.token; } catch {}
  lastSent = now;
  pending = true;
  try {
   const response = await fetch(ACCOUNT_ENDPOINT,{
    method:'POST',
    headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},
    body:JSON.stringify({action:'progress',progress:{_presence:browserId}}),
    signal:AbortSignal.timeout(10000)
   });
   if ([400,401,409].includes(response.status)) supported = false;
  } catch {
   // Usage reporting never interrupts practice.
  } finally {
   pending = false;
  }
 }

 function activity() {
  lastActivity = Date.now();
  heartbeat();
 }
 for (const event of ['pointerdown','keydown','scroll']) {
  window.addEventListener(event,activity,{passive:true});
 }
 document.addEventListener('visibilitychange',() => {
  if (document.visibilityState === 'visible') activity();
 });
 window.addEventListener('online',activity);
 setInterval(heartbeat,heartbeatMs);
 heartbeat();
})();
