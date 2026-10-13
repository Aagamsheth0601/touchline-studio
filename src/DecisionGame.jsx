import React, {useEffect, useState} from 'react';
import Pitch from './Pitch.jsx';
import CoachingSearch from './CoachingSearch.jsx';
import {scenarios,scenarioFrame} from './scenario.js';
import './game.css';

export default function DecisionGame(){
  const [scenarioId,setScenarioId]=useState('press');
  const [explored,setExplored]=useState({});
  return <ScenarioGame key={scenarioId} scenario={scenarios.find(s=>s.id===scenarioId)} onScenario={setScenarioId} seen={explored[scenarioId] || []} onExplored={choice=>setExplored(previous=>({...previous,[scenarioId]:[...new Set([...(previous[scenarioId] || []),choice])]}))}/>;
}

// A fresh instance cancels playback when the user switches situations.
function ScenarioGame({scenario,onScenario,seen,onExplored}){
  const {players,start,options}=scenario;
  const [choice,setChoice]=useState(null);
  const [progress,setProgress]=useState(0);
  const [playing,setPlaying]=useState(false);

  const [view,setView]=useState('top');
  const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(()=>{
    if(!playing) return;
    let frame,previous;
    const tick=time=>{
      if(previous!==undefined) setProgress(p=>Math.min(1,p+Math.min(time-previous,100)/(choice === 'carry' ? 2400 : 1300)));
      previous=time; frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(frame);
  },[playing,choice]);
  useEffect(()=>{
    if(progress===1 && choice){setPlaying(false);onExplored(choice);}
  },[progress,choice]);
  function choose(id){document.querySelector(".game-field")?.scrollIntoView({block:"start"});setChoice(id);setProgress(reduced?1:0);setPlaying(!reduced);}
  const current=scenarioFrame(scenario,choice,progress);
  const alternative=Object.keys(options).find(id=>id!==choice);
  const finished=choice && progress===1;
  const preview={start:current,end:current,progress:0};
  return <div className="decision-game">
    <header><a className="brand" href="./"><span className="brand-symbol">T</span>TOUCHLINE <span className="brand-small">STUDIO</span></a><a className="editor-link" href="?mode=editor">Lineup editor ↗</a></header>
    <main className="game-main">
      <nav className="scenario-selector" aria-label="Choose a scenario">{scenarios.map((s,i)=><button key={s.id} aria-pressed={s.id===scenario.id} onClick={()=>onScenario(s.id)}><small>SCENARIO 0{i+1}</small><strong>{s.title}</strong></button>)}</nav>
      <div className="game-heading"><div><p className="eyebrow">READ THE GAME / SCENARIO 0{scenarios.indexOf(scenario)+1}</p><h1>{scenario.title}</h1><p>{scenario.prompt}</p></div><span className="scenario-tag">ONE MOMENT. TWO CHOICES.</span></div>
      <div className="game-layout">
        <section className="game-field" aria-label="Scenario pitch">
          <div className="field-top"><span>ATTACKING ↑</span><div>{['top','3d'].map(v=><button key={v} aria-pressed={view===v} onClick={()=>setView(v)}>{v==='3d'?'3D':'Overhead'}</button>)}</div></div>
          <div className="game-pitch"><Pitch players={players} selected={choice?options[choice].selected:4} onSelect={()=>{}} view={view} format={6} resetKey={0} zoom={1.3} moveMode={false} tactics={{ball:start.ball,arrows:[]}} preview={preview}/></div>
          <div className="pitch-status" aria-live="polite">{finished ? "Move complete. Explore the explanation below or alongside the pitch." : choice ? (playing ? "Watch the ball and the blue defenders." : "Paused") : "You are 4. Choose your move below or alongside the pitch."}</div><div className="field-legend"><span><i/>Your team · orange</span><span><i className="opponent"/>Defenders · blue</span><span>Ball · white</span></div>
        </section>
        <section className="decision-card" aria-label="Your decision">
          <p className="eyebrow">{finished?'THE REPLAY ROOM':choice?'WATCH THE MOVEMENT':'YOUR BALL. YOUR CALL.'}</p>
          <h2>{finished?options[choice].title:choice?options[choice].action:scenario.question}</h2>
          {!choice && <><p>{scenario.description}</p><p className="game-instruction">Choose a card below. Watch the play, then see why.</p></>}
          {!choice && <div className="pass-choices">{Object.entries(options).map(([id,o])=><button key={id} onClick={()=>choose(id)}><span className="choice-number">{o.badge}</span><span><strong>{o.label}</strong><small>{o.intent}</small>{seen.includes(id) && <small className="seen">Explored ✓</small>}</span><span aria-hidden="true">→</span></button>)}</div>}
          {choice && <><p role="status">{finished?options[choice].complete:playing?'Watch how your choice changes the defender’s position.':'Replay paused.'}</p><progress aria-label="Move playback" value={progress} max="1"/>
            {!finished && <div className="game-controls"><button onClick={()=>setPlaying(!playing)}>{playing?'Pause':'Resume'}</button><button onClick={()=>{setProgress(1);setPlaying(false);}}>Skip to explanation</button></div>}
            {finished && <div className="explanation"><h3>Why this option?</h3><p>{options[choice].why}</p><h3>The tradeoff</h3><p>{options[choice].tradeoff}</p></div>}
            <div className="game-controls">{finished && <button onClick={()=>choose(choice)}>Replay this move</button>}<button onClick={()=>{setPlaying(false);setChoice(null);setProgress(0);}}>Choose again</button>{finished && <button className="alternative" onClick={()=>choose(alternative)}>{options[alternative].tryLabel} →</button>}</div>
          </>}
          <label className="motion-option"><input type="checkbox" checked={reduced} onChange={e=>{setReduced(e.target.checked);if(e.target.checked && choice){setPlaying(false);setProgress(1);}}}/> Show outcomes without animation</label>
          <div className="scenario-progress">{seen.length}/2 options explored{seen.length===2?' · Situation complete':''}</div>
          {seen.length===2 && <p className="comparison">{scenario.comparison}</p>}
        </section>
      </div>
      <CoachingSearch />
      <p className="authored-note">An authored practice situation. These are possible outcomes, not predictions. Off-ball players are omitted to focus on this decision; offside is assumed clear. No sign-in needed.</p>
    </main>
  </div>;
}



