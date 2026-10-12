import React, {useEffect, useState} from 'react';
import Pitch from './Pitch.jsx';
import {players,start,options,frameAt} from './scenario.js';
import './game.css';

export default function DecisionGame(){
  const [choice,setChoice]=useState(null);
  const [progress,setProgress]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [seen,setSeen]=useState([]);
  const [view,setView]=useState('top');
  const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(()=>{
    if(!playing) return;
    let frame,previous;
    const tick=time=>{
      if(previous!==undefined) setProgress(p=>Math.min(1,p+Math.min(time-previous,100)/3200));
      previous=time; frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(frame);
  },[playing]);
  useEffect(()=>{
    if(progress===1 && choice){setPlaying(false);setSeen(s=>s.includes(choice)?s:[...s,choice]);}
  },[progress,choice]);
  function choose(id){document.querySelector(".game-field")?.scrollIntoView({block:"start"});setChoice(id);setProgress(reduced?1:0);setPlaying(!reduced);}
  const current=frameAt(choice,progress);
  const finished=choice && progress===1;
  const preview={start:current,end:current,progress:0};
  return <div className="decision-game">
    <header><a className="brand" href="./"><span className="brand-symbol">T</span>TOUCHLINE <span className="brand-small">STUDIO</span></a><a className="editor-link" href="?mode=editor">Lineup editor ↗</a></header>
    <main className="game-main">
      <div className="game-heading"><div><p className="eyebrow">READ THE GAME / SCENARIO 01</p><h1>Escape the press.</h1><p>You’re number 4. A defender is closing in.<br/>Who gets your next pass?</p></div><span className="scenario-tag">ONE MOMENT. TWO CHOICES.</span></div>
      <div className="game-layout">
        <section className="game-field" aria-label="Scenario pitch">
          <div className="field-top"><span>ATTACKING ↑</span><div>{['top','3d'].map(v=><button key={v} aria-pressed={view===v} onClick={()=>setView(v)}>{v==='3d'?'3D':'Overhead'}</button>)}</div></div>
          <div className="game-pitch"><Pitch players={players} selected={choice||4} onSelect={()=>{}} view={view} format={6} resetKey={0} zoom={1.3} moveMode={false} tactics={{ball:start.ball,arrows:[]}} preview={preview}/></div>
          <div className="pitch-status" aria-live="polite">{finished ? "Pass complete. Explore the explanation below or alongside the pitch." : choice ? (playing ? "Watch the ball and the blue defenders." : "Paused") : "You are 4. Choose your pass below or alongside the pitch."}</div><div className="field-legend"><span><i/>Your team · orange</span><span><i className="opponent"/>Defenders · blue</span><span>Ball · white</span></div>
        </section>
        <section className="decision-card" aria-label="Your decision">
          <p className="eyebrow">{finished?'THE REPLAY ROOM':choice?'WATCH THE MOVEMENT':'YOUR BALL. YOUR CALL.'}</p>
          <h2>{finished?options[choice].title:choice?`Passing to number ${choice}`:'Pick your pass.'}</h2>
          {!choice && <><p>5 offers a short pass inside. 6 is making a forward run, with a covering defender nearby.</p><p className="game-instruction">Choose a card below. Watch the play, then see why.</p></>}
          {!choice && <div className="pass-choices">{Object.entries(options).map(([id,o])=><button key={id} onClick={()=>choose(Number(id))}><span className="choice-number">{id}</span><span><strong>{o.label}</strong><small>{o.intent}</small>{seen.includes(Number(id)) && <small className="seen">Explored ✓</small>}</span><span aria-hidden="true">→</span></button>)}</div>}
          {choice && <><p role="status">{finished?`Pass to ${choice} complete.`:playing?'The ball is travelling. Watch the defender’s response.':'Replay paused.'}</p><progress aria-label="Pass playback" value={progress} max="1"/>
            {!finished && <div className="game-controls"><button onClick={()=>setPlaying(!playing)}>{playing?'Pause':'Resume'}</button><button onClick={()=>{setProgress(1);setPlaying(false);}}>Skip to explanation</button></div>}
            {finished && <div className="explanation"><h3>Why this option?</h3><p>{options[choice].why}</p><h3>The tradeoff</h3><p>{options[choice].tradeoff}</p></div>}
            <div className="game-controls">{finished && <button onClick={()=>choose(choice)}>Replay this pass</button>}<button onClick={()=>{setPlaying(false);setChoice(null);setProgress(0);}}>Choose again</button>{finished && <button className="alternative" onClick={()=>choose(choice===5?6:5)}>Try the pass to {choice===5?6:5} →</button>}</div>
          </>}
          <label className="motion-option"><input type="checkbox" checked={reduced} onChange={e=>{setReduced(e.target.checked);if(e.target.checked && choice){setPlaying(false);setProgress(1);}}}/> Show outcomes without animation</label>
          <div className="scenario-progress">{seen.length}/2 options explored{seen.length===2?' · Situation complete':''}</div>
          {seen.length===2 && <p className="comparison">Both can work: 5 prioritises possession; 6 prioritises territory. Read the pressure before choosing.</p>}
        </section>
      </div>
      <p className="authored-note">An authored practice situation. These are possible outcomes, not predictions. Off-ball players are omitted to focus on this decision; offside is assumed clear. No sign-in needed.</p>
    </main>
  </div>;
}


