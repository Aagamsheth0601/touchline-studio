import test from 'node:test';
import assert from 'node:assert/strict';
import {selectNotes,searchNotes,noteSource} from './coachingSearch.js';
test('weak and malformed results never become coaching evidence',()=>{
  const note={id:'test',title:'Support',content:'Example',similarity:.85};
  assert.deepEqual(selectNotes({notes:[note,{...note,similarity:.4},null]}),[note]);
  assert.deepEqual(selectNotes({notes:[]}),[]);
  assert.throws(()=>selectNotes({}),/invalid response/);
});
test('invalid questions fail before network access',async()=>{
  await assert.rejects(searchNotes('  '),/8 and 300/);
  await assert.rejects(searchNotes('x'.repeat(301)),/8 and 300/);
});

test('source links only use the reviewed HTTPS publisher',()=>{
 const note={source_title:'Passing',source_url:'https://www.fifatrainingcentre.com/en/practice'};
 assert.equal(noteSource(note),note.source_url);
 for(const source_url of ['javascript:alert(1)','https://www.fifatrainingcentre.com.evil.test/a','http://www.fifatrainingcentre.com/a','https://user@www.fifatrainingcentre.com/a']) assert.equal(noteSource({...note,source_url}),null);
 assert.equal(noteSource({}),null);
});
