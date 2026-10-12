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

import {scenarios,scenarioFrame} from './scenario.js';
test('all scenario outcomes retain their own players and exact endpoints',()=>{
  for(const scenario of scenarios) for(const choice of Object.keys(scenario.options)){
    assert.deepEqual(scenarioFrame(scenario,choice,0),scenario.start);
    const end=scenarioFrame(scenario,choice,1);
    assert.deepEqual(end.positions,scenario.options[choice].positions);
    assert.deepEqual(end.ball,scenario.options[choice].ball);
    assert.deepEqual(scenarioFrame(scenario,null,.5),scenario.start);
  }
});
test('carrying keeps ball at player 4 while the early pass transfers it to 6',()=>{
  const scenario=scenarios[1];
  for(const progress of [0,.25,.5,.75,1]){
    const frame=scenarioFrame(scenario,'carry',progress);
    assert.ok(Math.hypot(frame.ball.x-frame.positions[4].x,frame.ball.z-frame.positions[4].z)<1.8);
  }
  const early=scenarioFrame(scenario,'early',1);
  assert.ok(Math.hypot(early.ball.x-early.positions[6].x,early.ball.z-early.positions[6].z)<2);
});
