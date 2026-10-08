import test from 'node:test';
import assert from 'node:assert/strict';
import {saveCloudCopy,listCloudLineups} from './cloud.js';
test('cloud insert uses authenticated owner, not a supplied owner',async()=>{
  let payload;
  const client={auth:{getUser:async()=>({data:{user:{id:'real-owner'}}})},from:()=>({insert:async value=>{payload=value;return {error:null};}})};
  await saveCloudCopy(client,{name:' Match ',format:6,formation:'2-2-1',profiles:{},user_id:'other-user',id:'overwrite'});
  assert.equal(payload.user_id,'real-owner');assert.equal(payload.name,'Match');assert.equal(payload.id,undefined);
});
test('no session prevents writing',async()=>{
  await assert.rejects(()=>saveCloudCopy({auth:{getUser:async()=>({data:{user:null}})}},{name:'Match'}),/sign in/);
});
test('database failures are surfaced instead of shown as empty lists',async()=>{
  const client={from:()=>({select:()=>({order:async()=>({error:new Error('Offline')})})})};
  await assert.rejects(()=>listCloudLineups(client),/Offline/);
});
