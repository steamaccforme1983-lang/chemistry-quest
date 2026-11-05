'use strict';
(() => {
 const button=document.getElementById('install-open'),dialog=document.getElementById('install-dialog');
 const action=document.getElementById('install-now'),status=document.getElementById('install-status');
 const offline=document.getElementById('app-connection');
 const standalone=window.matchMedia('(display-mode: standalone)');
 let prompt=null;
 function update(){
  const installed=standalone.matches||navigator.standalone===true;
  button.textContent=installed?'App info':'Install app';
  action.hidden=!prompt||installed;
  document.getElementById('install-title').textContent=installed?'Your study app.':'Take Chemistry Quest with you.';
  offline.hidden=navigator.onLine!==false;
 }
 button.addEventListener('click',()=>{update();dialog.showModal();});
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();prompt=event;update();});
 window.addEventListener('appinstalled',()=>{prompt=null;update();status.textContent='Installed! Open Chemistry Quest from your app list or home screen.';});
 action.addEventListener('click',async()=>{
  const invitation=prompt;if(!invitation)return;
  prompt=null;action.hidden=true;
  try{await invitation.prompt();const result=await invitation.userChoice;status.textContent=result.outcome==='accepted'?'Installation requested. Your browser will finish setting up the app.':'No problem. You can install later from your browser menu.';}
  catch{status.textContent='Use your browser’s install option below, or try again later.';}
 });
 window.addEventListener('online',update);window.addEventListener('offline',update);
 standalone.addEventListener?.('change',update);update();
 if('serviceWorker' in navigator&&window.isSecureContext){
  navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).then(registration=>{
   function describe(){
    if(registration.waiting&&(registration.active||navigator.serviceWorker.controller))status.textContent='An update is ready. Finish your question, close all Chemistry Quest windows, then reopen to update safely.';
    else if(registration.waiting)status.textContent='Finishing offline setup… Reopen this page when setup is complete.';
    else if(registration.active)status.textContent='Guest practice is ready offline after reopening the app. Account answers and XP still need internet.';
   }
   describe();
   registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'||worker.state==='activated')describe();});});
  }).catch(()=>{status.textContent='Offline setup is unavailable right now. You can still study online and try again later.';});
 }else status.textContent='Offline setup needs a supported browser and an HTTPS connection. Use the online website link.';
})();
