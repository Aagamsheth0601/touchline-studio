import test from 'node:test';
import assert from 'node:assert/strict';
import {selectNotes,searchNotes} from './coachingSearch.js';
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
