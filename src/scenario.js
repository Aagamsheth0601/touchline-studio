import { captureFrame, interpolatePoint } from './playback.js';

// An authored teaching situation, not a prediction or a football physics engine.
export const players = [
  {id:4,number:4,name:'You',role:'MID',x:-11,z:-5},
  {id:5,number:5,name:'Support',role:'MID',x:-2,z:2},
  {id:6,number:6,name:'Runner',role:'FWD',x:7,z:-12},
  {id:8,number:8,name:'Pressure',role:'DEF',team:'opponent',x:-6,z:-9},
  {id:2,number:2,name:'Cover',role:'DEF',team:'opponent',x:4,z:-17},
];
export const start = captureFrame(players,{x:-9.3,z:-5});
export const options = {
  5:{label:'Keep it with 5',intent:'Play inside to your supporting teammate.',title:'Keep possession. Invite the press.',why:'5 is behind the approaching defender and offers a short outlet. The ball arrives safely in this scenario, but 5 receives farther from goal, giving the defence time to recover.',tradeoff:'Useful when keeping the ball matters more than attacking immediately. Next, 5 should look to switch play before pressure arrives.',positions:{4:{x:-10,z:-7},5:{x:-1,z:1},6:{x:8,z:-14},8:{x:-7,z:-4},2:{x:5,z:-15}},ball:{x:.6,z:1}},
  6:{label:'Find the run of 6',intent:'Play forward before the covering defender closes.',title:'Gain ground. Accept a tighter window.',why:'6 runs toward the space outside the covering defender. In this scenario, your early pass reaches 6 before that defender gets across. Waiting longer would make the same pass easier to intercept.',tradeoff:'Useful when you can pass early and your teammate is already moving. The reward is territory near goal; the risk is a longer pass with less margin for error.',positions:{4:{x:-10,z:-7},5:{x:0,z:0},6:{x:10,z:-16},8:{x:-9,z:-6},2:{x:7,z:-17}},ball:{x:8.5,z:-16}}
};
export function frameAt(choice,progress) {
  const end=options[choice];
  if(!end) return start;
  const p=Math.max(0,Math.min(1,progress));
  return {positions:Object.fromEntries(players.map(player=>[player.id,interpolatePoint(start.positions[player.id],end.positions[player.id],p)])),ball:interpolatePoint(start.ball,end.ball,p)};
}
