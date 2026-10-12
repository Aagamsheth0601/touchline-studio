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

export const scenarios = [
  {id:'press',title:'Escape the press.',prompt:'You are number 4. A defender is closing in. Who gets your next pass?',description:'5 offers a short pass inside. 6 is making a forward run, with a covering defender nearby.',question:'Pick your pass.',comparison:'5 prioritises possession; 6 prioritises territory. Read the pressure before choosing.',players,start,options:Object.fromEntries(Object.entries(options).map(([id,o])=>[id,{...o,badge:id,selected:Number(id),action:`Passing to number ${id}`,complete:`Pass to ${id} complete.`,tryLabel:`Try the pass to ${id}`}]))},
  {id:'two-on-one',title:'Make the defender choose.',prompt:'You are number 4. It is two against one. Pass early or carry the ball?',description:'6 is running on your right. The defender is between you both, protecting the route to goal.',question:'What is your next move?',comparison:'Passing early gives 6 time but lets the defender recover. Carrying draws the defender toward you, opening a later pass. Holding on too long risks losing the ball.',players:[
    {id:4,number:4,name:'You',role:'MID',x:-7,z:0},
    {id:6,number:6,name:'Runner',role:'FWD',x:7,z:-3},
    {id:2,number:2,name:'Defender',role:'DEF',team:'opponent',x:0,z:-10}
  ],options:{
    early:{badge:'A',selected:6,label:'Pass early to 6',intent:'Release your teammate before the defender commits.',action:'Playing the early pass',complete:'Early pass complete.',tryLabel:'Try the early pass',title:'Release early. Let the defender recover.',why:'6 receives with room to move. Because you passed before drawing the defender toward you, the defender can shift across and delay the route to goal.',tradeoff:'An early pass reduces your time on the ball, but may waste the two-on-one advantage. Now 6 must decide whether to take on the defender or return the ball.',positions:{4:{x:-6,z:-5},6:{x:8,z:-10},2:{x:5,z:-13}},ball:{x:6.5,z:-10}},
    carry:{badge:'B',selected:4,label:'Carry toward the defender',intent:'Draw them toward you before releasing the ball.',action:'Carrying the ball forward',complete:'Carry complete. The passing lane has opened.',tryLabel:'Try carrying the ball',title:'Draw the defender. Open the pass.',why:'You advance with the ball while 6 continues forward. In this outcome, the defender steps toward you, leaving space on the right. The next action would be a pass to 6 before the defender can recover.',tradeoff:'Carrying creates a better passing angle if the defender commits. If they hold their position, reassess; carrying too close can lose the ball. This replay stops at that decision.',positions:{4:{x:-4,z:-9},6:{x:9,z:-13},2:{x:-2,z:-12}},ball:{x:-2.3,z:-9}}
  }}
];
scenarios[1].start=captureFrame(scenarios[1].players,{x:-5.3,z:0});

// Scenario data determines the cast and outcome; animation never mutates it.
export function scenarioFrame(scenario,choice,progress){
  const end=scenario.options[choice];
  if(!end) return scenario.start;
  const p=Math.max(0,Math.min(1,progress));
  return {positions:Object.fromEntries(scenario.players.map(player=>[player.id,interpolatePoint(scenario.start.positions[player.id],end.positions[player.id],p)])),ball:interpolatePoint(scenario.start.ball,end.ball,p)};
}
