import test from "node:test";
import assert from "node:assert/strict";
import { captureFrame, interpolatePoint } from "./playback.js";

test("captures independent positions without mutating the editable lineup", () => {
  const players = [{id:1,x:2,z:4}], ball = {x:0,z:1};
  const frame = captureFrame(players, ball);
  players[0].x = 12; ball.x = 9;
  assert.deepEqual(frame, {positions:{1:{x:2,z:4}},ball:{x:0,z:1}});
});
test("interpolation hits endpoints, midpoint and clamps scrubbing", () => {
  const a={x:-10,z:20}, b={x:10,z:-20};
  assert.deepEqual(interpolatePoint(a,b,.5), {x:0,z:0});
  assert.deepEqual(interpolatePoint(a,b,-1), a);
  assert.deepEqual(interpolatePoint(a,b,2), b);
  assert.deepEqual(a,{x:-10,z:20});
});
test("a missing ball does not create an invented movement path", () => {
  const p={x:3,z:4};
  assert.equal(interpolatePoint(null,p,.5), null);
  assert.deepEqual(interpolatePoint(null,p,1),p);
  assert.equal(interpolatePoint(null,null,0),null);
});
