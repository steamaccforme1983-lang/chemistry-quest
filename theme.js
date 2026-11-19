'use strict';
(() => {
 const button=document.getElementById('theme-toggle');
 const media=globalThis.matchMedia?.('(prefers-color-scheme: dark)');
 let preference=null;
 try{const saved=localStorage.getItem('chemistry-quest-theme');if(['light','dark'].includes(saved))preference=saved;}catch{}
 function apply(dark){
  document.documentElement.dataset.theme=dark?'dark':'light';
  button.setAttribute('aria-pressed',String(dark));
  button.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');
  button.title=dark?'Switch to light mode':'Switch to dark mode';
 }
 apply(preference==='dark'||(preference!=='light'&&!!media?.matches));
 button.addEventListener('click',()=>{
  preference=document.documentElement.dataset.theme==='dark'?'light':'dark';
  try{localStorage.setItem('chemistry-quest-theme',preference);}catch{}
  apply(preference==='dark');
 });
 media?.addEventListener('change',event=>{if(!preference)apply(event.matches);});
})();
