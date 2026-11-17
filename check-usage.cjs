const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require('node:path').join(__dirname,'usage.js'),'utf8');
const browserId = '12345678-1234-4234-8234-123456789012';
const values = new Map([['chemistry-quest-session', JSON.stringify({token:'test-session'})]]);
const calls = [];
const events = {};
const document = {
 visibilityState:'visible',
 addEventListener(name, handler) { events[name] = handler; }
};
let now = 0;
let tick;
vm.runInNewContext(source, {
 document, navigator:{onLine:true}, AbortSignal, Date:{now:()=>now},
 crypto:{randomUUID:()=>browserId},
 localStorage:{getItem:key=>values.get(key) ?? null,setItem:(key,value)=>values.set(key,value)},
 window:{addEventListener(name,handler) { events[name] = handler; }},
 setInterval(handler, interval) { assert.equal(interval,45000);tick = handler; },
 async fetch(endpoint,init) { calls.push(init);return {status:200}; }
});
(async () => {
 assert.equal(calls.length,1);
 assert.equal(calls[0].headers.Authorization,'Bearer test-session');
 assert.equal(JSON.parse(calls[0].body).progress._presence,browserId);
 await Promise.resolve();
 now = 45000;
 document.visibilityState = 'hidden';
 await tick();
 assert.equal(calls.length,1);
 document.visibilityState = 'visible';
 events.visibilitychange();
 await Promise.resolve();
 assert.equal(calls.length,2);
 now = 165000;
 await tick();
 assert.equal(calls.length,2);
 values.delete('chemistry-quest-session');
 events.keydown();
 await Promise.resolve();
 assert.equal(calls.length,3);
 assert.equal(calls[2].headers.Authorization,undefined);
 assert.equal(JSON.parse(calls[2].body).progress._presence,browserId);
 console.log('PASS: signed-in and guest presence, stable browser ID, visibility and idle behavior.');
})().catch(error=>{console.error(error);process.exitCode=1;});
