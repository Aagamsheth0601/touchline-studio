import test from 'node:test';
import assert from 'node:assert/strict';
import {start,options,frameAt} from './scenario.js';
test('both passes start with the ball at 4 and finish with the selected receiver',()=>{
  for(const id of [5,6]){
    assert.deepEqual(frameAt(id,0),start);
    assert.deepEqual(frameAt(id,1).ball,options[id].ball);
    const end=frameAt(id,1),receiver=end.positions[id];
    assert.ok(Math.hypot(end.ball.x-receiver.x,end.ball.z-receiver.z)<2);
    assert.notDeepEqual(frameAt(id,.5).ball,start.ball);
    assert.notDeepEqual(end.positions[8],start.positions[8]);
  }
});
test('unknown choice stays at start and progress is bounded',()=>{
  assert.deepEqual(frameAt(null,.5),start);
  assert.deepEqual(frameAt(5,-1),start);
  assert.deepEqual(frameAt(6,2),frameAt(6,1));
});
