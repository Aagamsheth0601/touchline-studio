import assert from 'node:assert/strict';
import {selectNotes,noteSource} from '../src/coachingSearch.js';
// Uses only the public anon key; never requires a privileged database credential.
import fs from 'node:fs';
const env=Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1).trim()];}));
const cases=[
 ['How do I draw a defender out?','draw-defender'],
 ['When is a short pass useful?','support-outlet'],
 ['How can one defender slow two attackers?','delay-attack'],
 ['What should I look at before the ball reaches me?','scan-before'],
 ['Why not release the ball immediately in a two against one?','early-pass'],
 ['How can I find a clear passing lane?','passing-lane'],
 ['How does a runner help us pass forward through the press?','forward-window'],
 ['Are there different ways to beat a press?','context-choice'],
 ['How do I bake sourdough bread?',null],
 ['What is the weather in Mumbai tomorrow?',null]
];
for(const [query,expected] of cases){
 const r=await fetch(`${env.VITE_SUPABASE_URL}/functions/v1/coaching-search`,{method:'POST',headers:{Authorization:`Bearer ${env.VITE_SUPABASE_EDGE_ANON_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({query})});
 const data=await r.json();
 assert.equal(r.status,200);
 const matches=selectNotes(data);
 for(const note of data.notes) { assert.ok(noteSource(note), `Missing safe source for ${note.id}`); assert.equal(note.source_checked_on,'2026-10-13'); }
 if(expected) assert.ok(matches.some(n=>n.id===expected), `Missing ${expected}`);
 else assert.equal(matches.length,0,'Unrelated query returned evidence');
 console.log(JSON.stringify({query,expected,matches:matches.map(n=>({id:n.id,similarity:n.similarity}))}));
}

const headers={Authorization:`Bearer ${env.VITE_SUPABASE_EDGE_ANON_KEY}`,apikey:env.VITE_SUPABASE_EDGE_ANON_KEY,'Content-Type':'application/json'};
for(const extra of [{},{'x-index-key':env.VITE_SUPABASE_EDGE_ANON_KEY}]){
 const response=await fetch(`${env.VITE_SUPABASE_URL}/functions/v1/coaching-search`,{method:'POST',headers:{...headers,...extra},body:JSON.stringify({action:'index'})});
 assert.equal(response.status,403);
}
const direct=await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/coaching_notes?select=id`,{headers});
assert.ok([401,403].includes(direct.status));
console.log('PASS: ten retrieval cases; anonymous indexing and direct table access denied.');
