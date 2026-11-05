'use strict';
// Bump this version whenever a shipped shell file changes. Keep each release coherent.
const PREFIX=`chemistry-quest:${new URL(self.registration.scope).pathname}:`;
const CACHE=PREFIX+'2026-11-05-app-2';
const SHELL=['./','index.html','styles.css','questions.js','variants.js','app.js','challenge.js','account.js','install.js','manifest.webmanifest','icons/icon.svg','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png','icons/apple-touch-icon.png'];
const urls=SHELL.map(path=>new URL(path,self.registration.scope).href);
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(urls)));
 // An update waits for existing app windows to close. Never reload a live test.
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))));
});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 // Never cache sign-ins, account replies, API calls or cross-origin resources.
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(request.mode==='navigate'&&url.href.startsWith(self.registration.scope)){
  event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(new URL('index.html',self.registration.scope).href))||fetch(request)));
 }else if(urls.includes(url.href)){
  event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(request))||fetch(request)));
 }
});
