import React, { useEffect, useRef, useState } from "react";
import { captureFrame } from "./playback.js";

export default function SequencePanel({ players, ball, onPreview }) {
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [speed, setSpeed] = useState(1);
  const position = useRef(0);

  useEffect(() => {
    onPreview(previewing && start && end ? { start, end, progress } : null);
  }, [previewing, start, end, progress, onPreview]);
  useEffect(() => () => onPreview(null), [onPreview]);

  useEffect(() => {
    if (!playing) return;
    let frame, previous;
    const tick = (time) => {
      // Cap the delta so switching back from a background tab does not jump.
      if (previous !== undefined) position.current = Math.min(1, position.current + Math.min(time - previous, 100) * speed / 4000);
      previous = time;
      setProgress(position.current);
      if (position.current < 1) frame = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed]);

  function seek(value) {
    setPlaying(false);
    position.current = value;
    setProgress(value);
    setPreviewing(true);
  }
  function play() {
    if (position.current >= 1) position.current = 0;
    setProgress(position.current);
    setPreviewing(true);
    setPlaying(true);
  }
  return <section className="sequence-panel" aria-label="Two-step playback">
    <h2>Bring the move to life</h2>
    <p>Capture Step 1, move your players and ball, then capture Step 2. Everyone moves together in a straight line; arrows are annotations.</p>
    <div className="sequence-actions">
      <button disabled={previewing} onClick={() => {
        setStart(captureFrame(players, ball)); setEnd(null); position.current = 0; setProgress(0);
      }}>{start ? "Recapture Step 1" : "Capture Step 1"}</button>
      <button disabled={!start || previewing} onClick={() => {
        setEnd(captureFrame(players, ball)); position.current = 0; setProgress(0);
      }}>{end ? "Recapture Step 2" : "Capture Step 2"}</button>
      <span role="status">{!start ? "Set up your starting positions." : !end ? "Step 1 captured. Arrange your next positions." : playing ? "Playing Step 1 to Step 2" : previewing ? (progress === 1 ? "Step 2 reached" : "Preview paused") : "Both steps ready."}</span>
    </div>
    {start && end && <>
      <div className="sequence-actions">
        <button onClick={playing ? () => setPlaying(false) : play}>{playing ? "Pause move" : "Play move"}</button>
        <button onClick={() => { seek(0); setPlaying(true); }}>Restart move</button>
        <label>Speed <select aria-label="Playback speed" value={speed} onChange={e => setSpeed(Number(e.target.value))}>
          <option value={0.5}>0.5x</option><option value={1}>1x</option><option value={2}>2x</option>
        </select></label>
        {previewing && <button onClick={() => { setPlaying(false); setPreviewing(false); }}>Return to editing</button>}
      </div>
      <label className="sequence-scrubber">Step 1 → Step 2 · {Math.round(progress * 100)}%
        <input aria-label="Move progress" type="range" min="0" max="100" step="1" value={progress * 100} onChange={e => seek(Number(e.target.value) / 100)} />
      </label>
      {Boolean(start.ball) !== Boolean(end.ball) && <p>Place the ball in both steps to animate its path.</p>}
    </>}
    <small>Two-step preview only: captured steps are not saved yet. Saving a lineup keeps your editable positions. Changing formation or opening another lineup clears this preview.</small>
  </section>;
}
