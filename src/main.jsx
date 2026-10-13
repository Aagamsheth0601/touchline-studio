import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import Pitch from "./Pitch.jsx";
import DecisionGame from "./DecisionGame.jsx";
import SequencePanel from "./SequencePanel.jsx";
import CloudPanel from "./CloudPanel.jsx";
import { presets, makePlayers } from "./formations.js";
import "./style.css";
import { readLineups, saveLineup } from "./storage.js";

// A decorative passing drill, separate from the editable lineup.
function PassingPreview() {
  const [playing, setPlaying] = useState(true);
  return <div className={"passing-preview " + (playing ? "" : "paused")}>
    <svg viewBox="0 0 280 130" role="img" aria-label="Animated three-player passing drill">
      <rect x="8" y="8" width="264" height="114" rx="12" className="mini-field" />
      <path d="M140 8V122 M8 40H42V90H8 M272 40H238V90H272" className="mini-lines" />
      <circle cx="140" cy="65" r="24" className="mini-lines" />
      <path d="M60 88L140 35L220 88Z" className="pass-route" />
      {[[60,88,6],[140,35,10],[220,88,9]].map(([x,y,n],i)=><g key={n} className={"mini-player player-"+i} style={{transformOrigin:`${x}px ${y}px`}}>
        <path d={`M${x-7} ${y-12}l-9 6 4 7 5-3v16h14v-16l5 3 4-7-9-6-7 3z`} fill={i===1 ? "#ef986f" : "#d9efa1"}/>
        <text x={x} y={y+5} textAnchor="middle">{n}</text>
      </g>)}
      <g className="passing-ball"><circle r="5" fill="#fff"/><path d="M0-3L3-1 2 3H-2L-3-1Z" fill="#20372a"/></g>
    </svg>
    <div className="preview-caption"><span>PASS. MOVE. CONNECT.</span><button onClick={()=>setPlaying(!playing)} aria-label={playing ? "Pause passing animation" : "Play passing animation"}>{playing ? "Pause" : "Play"}</button></div>
  </div>;
}

function App() {
  const [format, setFormat] = useState(6),
    [formation, setFormation] = useState("2-2-1"),
    [selected, setSelected] = useState(null),
    [view, setView] = useState("3d"),
    [resetKey, setResetKey] = useState(0);
  const [preview, setPreview] = useState(null);
  const [sequenceKey, setSequenceKey] = useState(0);
  const [moveMode, setMoveMode] = useState(false);
  const [tool, setTool] = useState("players");
  const [tactics, setTactics] = useState({ball:null, arrows:[]});
  const [profiles, setProfiles] = useState({});
  const [name, setName] = useState("My lineup");
  const [saved, setSaved] = useState([]);
  const [recordId, setRecordId] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState("");
  const [failure, setFailure] = useState("");
  useEffect(() => {
    try {
      setSaved(readLineups(localStorage));
    } catch (e) {
      setFailure(e.message);
    }
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function edit() {
    setDirty(true);
    setNotice("");
  }
  function save(asCopy = false) {
    if (!name.trim()) {
      setFailure("Give your lineup a name before saving.");
      return;
    }
    try {
      const id = asCopy || !recordId ? crypto.randomUUID() : recordId;
      setSaved(
        saveLineup(localStorage, {
          id,
          name: name.trim(),
          format,
          formation,
          profiles,
          tactics,
        }),
      );
      setRecordId(id);
      setDirty(false);
      setFailure("");
      setNotice("Saved on this device.");
    } catch (e) {
      setFailure(
        "Could not save this lineup. Storage may be blocked, full, or damaged. Your current edits are still here.",
      );
    }
  }
  function openSaved(id) {
    if (!id) return;
    if (dirty && !window.confirm("Discard unsaved edits and open this lineup?"))
      return;
    const r = saved.find((item) => item.id === id);
    if (!r) return;
    setPreview(null);
    setSequenceKey(k=>k+1);
    setName(r.name);
    setFormat(r.format);
    setFormation(r.formation);
    setProfiles(r.profiles);
    setTactics(r.tactics || {ball:null,arrows:[]});
    setRecordId(r.id);
    setSelected(null);
    setDirty(false);
    setNotice("Opened saved lineup.");
    setFailure("");
  }
  function updatePlayer(id, patch) {
    setProfiles((previous) => ({
      ...previous,
      [id]: {
        ...previous[id],
        name: previous[id]?.name || "",
        number: previous[id]?.number || id,
        ...patch,
      },
    }));
    edit();
  }
  function openCloud(record) {
    if (
      dirty &&
      !window.confirm("Discard unsaved edits and open this cloud lineup?")
    )
      return;
    try {
      // Reuse the device validator before trusting remote JSON in the renderer.
      const [checked] = readLineups({
        getItem: () => JSON.stringify([record]),
      });
      setPreview(null);
      setSequenceKey(k=>k+1);
      setName(checked.name);
      setFormat(checked.format);
      setFormation(checked.formation);
      setProfiles(checked.profiles);
      setTactics(checked.tactics || {ball:null,arrows:[]});
      setRecordId(null);
      setSelected(null);
      setDirty(false);
      setFailure("");
      setNotice("Opened cloud copy. Save on this device to keep a local copy.");
    } catch {
      setFailure(
        "This cloud lineup could not be opened. Your current lineup is unchanged.",
      );
    }
  }
  const players = useMemo(
    () =>
      makePlayers(format, formation).map((p) => ({
        ...p,
        ...(profiles[p.id]?.position || {}),
        name: profiles[p.id]?.name || "",
        number: profiles[p.id]?.number || p.id,
      })),
    [format, formation, profiles],
  );
  const player = players.find((p) => p.id === selected);
  // Change format and its formation together so we never render an invalid combination.
  function resetPositions() {
    setProfiles(previous => Object.fromEntries(Object.entries(previous).map(([id, p]) => { const {position, ...rest}=p; return [id,rest]; })));
    edit();
  }
  function changeFormat(next) {
    setTactics({ball:null,arrows:[]});
    resetPositions();
    edit();
    setFormat(next);
    setFormation(presets[next][0]);
    setSelected(null);
  }
  const roleNames = {
    GK: "Goalkeeper",
    DEF: "Defender",
    MID: "Midfielder",
    FWD: "Forward",
  };
  return (
    <div className="app">
      <header>
        <a className="brand" href="./">
          <span className="brand-symbol">T</span>TOUCHLINE
          <span className="brand-small">STUDIO</span>
        </a>
        <span className="header-note">YOUR TEAM. YOUR SHAPE.</span>
        <a className="back-to-game" href="./">
          <span aria-hidden="true">← </span>Back to decision game
        </a>
      </header>
      <main>
        <div className="page-heading">
          <div>
            <p className="eyebrow">THE MATCH STARTS HERE</p>
            <h1>Make your shape.</h1>
            <p className="intro">
              One team. Any format. Start with a formation.
            </p>
          </div>
          <PassingPreview />
        </div>
        <details className="library-drawer" inert={preview ? "" : undefined}>
          <summary><span className="library-title">{name || "Untitled lineup"}<small>{format}v{format} / {formation}</small></span><span className="library-action">{dirty ? "Unsaved edits · " : ""}Save & open lineups <span aria-hidden="true">↗</span></span></summary>
          <div className="library-content">
        <section className="save-bar" aria-label="Lineup library">
          <label>
            Game / lineup name
            <input
              maxLength={80}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                edit();
              }}
            />
          </label>
          <button onClick={() => save()}>Save lineup</button>
          {recordId && <button onClick={() => save(true)}>Save as copy</button>}
          <div className="saved-picker">
            <label htmlFor="saved-lineups">Saved on this device</label>
            <select
              id="saved-lineups"
              value=""
              onChange={(e) => openSaved(e.target.value)}
            >
              <option value="">Open a saved lineup ({saved.length})</option>
              {saved.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} / {r.format}v{r.format}
                </option>
              ))}
            </select>
          </div>
          <p>
            Saved in this browser only. Clearing browser data removes saved
            lineups. Unsaved edits are not stored.
          </p>
          {notice && <p role="status">{notice}</p>}
          {failure && <p role="alert">{failure}</p>}
        </section>
        <CloudPanel
          lineup={{ name, format, formation, profiles, tactics }}
          onOpen={openCloud}
        />
          </div>
        </details>
        <div className="workspace">
          <aside className="setup panel" inert={preview ? "" : undefined}>
            <div className="section-heading">
              <span className="step">01</span>
              <h2>Set the game</h2>
            </div>
            <label className="field-label">MATCH FORMAT</label>
            <div className="segments format-options">
              {[5, 6, 11].map((n) => (
                <button
                  key={n}
                  aria-pressed={format === n}
                  onClick={() => changeFormat(n)}
                >
                  {n}v{n}
                </button>
              ))}
            </div>
            <p className="hint">One team · goalkeeper included</p>
            <label className="field-label" htmlFor="formation">
              FORMATION
            </label>
            <select
              id="formation"
              value={formation}
              onChange={(e) => {
                setTactics({ball:null,arrows:[]});
                resetPositions();
                setFormation(e.target.value);
                edit();
              }}
            >
              {presets[format].map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
            <p className="hint">Numbers describe outfield players.</p>
            <div className="squad-title">
              <h2>Your lineup</h2>
              <span>{players.length} players</span>
            </div>
            <div className="roster">
              {players.map((p) => (
                <button
                  className="roster-player"
                  key={p.id}
                  aria-pressed={selected === p.id}
                  onClick={() => setSelected(p.id)}
                >
                  <span
                    className={"number " + (p.role === "GK" ? "keeper" : "")}
                  >
                    {p.number.toString().padStart(2, "0")}
                  </span>
                  <span>
                    {p.name || `Player ${p.id}`}
                    <small>{roleNames[p.role]}</small>
                  </span>
                  <span className="role">{p.role}</span>
                </button>
              ))}
            </div>
            <div className="setup-note">
              No names needed.
              <br />
              <span>Your starting lineup is ready to explore.</span>
            </div>
          </aside>
          <section className="pitch-panel" aria-label="Lineup workspace">
            <div className="pitch-toolbar">
              <div>
                <span className="team-dot" />
                MY TEAM <span className="formation-chip">{formation}</span>
              </div>
              <div className="segments view-options">
                <button
                  aria-pressed={view === "3d"}
                  onClick={() => setView("3d")}
                >
                  3D view
                </button>
                <button
                  aria-pressed={view === "top"}
                  onClick={() => setView("top")}
                >
                  Overhead
                </button>
              </div>
            </div>
            <div className="movement-toolbar" inert={preview ? "" : undefined}>
              <button aria-pressed={moveMode} onClick={()=>setMoveMode(!moveMode)}>{moveMode ? "Edit pitch" : "Move camera"}</button>
              <span>{moveMode ? "Choose a tool below" : "Camera mode: drag to orbit"}</span>
              <button onClick={resetPositions}>Reset positions</button>
            </div>
            <div className="tactics-toolbar" aria-label="Tactics tools" inert={preview ? "" : undefined}>
              {[["players","Players"],["ball","Place ball"],["run","Run arrow"],["pass","Pass arrow"]].map(([value,label])=><button key={value} aria-pressed={moveMode && tool===value} onClick={()=>{setTool(value);setMoveMode(true);}}>{label}</button>)}
              <button disabled={!tactics.arrows.length} onClick={()=>{setTactics(t=>({...t,arrows:t.arrows.slice(0,-1)}));edit();}}>Undo arrow</button>
              <button disabled={!tactics.ball && !tactics.arrows.length} onClick={()=>{setTactics({ball:null,arrows:[]});edit();}}>Clear tactics</button>
              <p role="status">{tactics.arrows.length>=20 ? "Maximum 20 arrows reached. Undo an arrow to add another." : !moveMode ? "Choose a tool to start editing." : tool==="ball" ? "Tap the pitch to place or move the ball." : tool==="run" || tool==="pass" ? "Tap a start, then an end point. Solid = run; dashed = pass. Up to 20 arrows." : "Move players mode: drag jerseys. Your lineup saves include ball and arrows."}</p>
            </div>
            <SequencePanel key={`${format}-${formation}-${sequenceKey}`} players={players} ball={tactics.ball} onPreview={setPreview} />
            <div className="pitch-area">
              <Pitch
                {...{ players, selected, view, format, resetKey }}
                onSelect={setSelected}
                preview={preview}
                moveMode={moveMode && !preview}
                tool={tool}
                tactics={tactics}
                onTactic={(item)=>{if(item.kind!=="ball" && tactics.arrows.length>=20){setFailure("Maximum 20 arrows. Undo an arrow before adding another.");return;}setTactics(t=>item.kind==="ball" ? {...t,ball:item.point} : {...t,arrows:[...t.arrows,item]});edit();}}
                onMove={(id, position)=>updatePlayer(id,{position})}
              />
              <span className="pitch-corner">TOUCHLINE / {format}-A-SIDE</span>
              <button
                className="reset-camera"
                onClick={() => setResetKey((v) => v + 1)}
              >
                Reset camera
              </button>
            </div>
            <div className="pitch-footer">
              <span>
                {preview ? "Playback preview · Return to editing to change positions" : moveMode ? "Editing pitch · Choose Move camera to orbit or zoom" : view === "3d"
                  ? "Drag to orbit · Scroll or pinch to zoom"
                  : "Overhead view · Scroll or pinch to zoom"}
              </span>
              <span>Click a player to inspect</span>
            </div>
          </section>
          <aside className="details panel" inert={preview ? "" : undefined}>
            <div className="section-heading">
              <span className="step">02</span>
              <h2>Player focus</h2>
            </div>
            {player ? (
              <div aria-live="polite">
                <div
                  className={
                    "player-shirt " +
                    (player.role === "GK" ? "keeper-shirt" : "")
                  }
                >
                  {player.number}
                </div>
                <p className="eyebrow">MY TEAM / {player.role}</p>
                <h3>{player.name || `Player ${player.id}`}</h3>
                <p className="detail-role">{roleNames[player.role]}</p>
                <div className="player-editor">
                  <label>
                    Player name (optional)
                    <input
                      maxLength={40}
                      value={player.name}
                      placeholder={`Player ${player.id}`}
                      onChange={(e) =>
                        updatePlayer(player.id, { name: e.target.value })
                      }
                    />
                  </label>
                  <div className="kit-field">
                    <label htmlFor="kit-number">Kit number</label>
                    <select
                      id="kit-number"
                      value={player.number}
                      onChange={(e) =>
                        updatePlayer(player.id, {
                          number: Number(e.target.value),
                        })
                      }
                    >
                      {Array.from({ length: 99 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                  {players.some(
                    (p) => p.id !== player.id && p.number === player.number,
                  ) && <p className="hint">Another player has this number.</p>}
                </div>
                <dl>
                  <div>
                    <dt>Shirt number</dt>
                    <dd>{player.number.toString().padStart(2, "0")}</dd>
                  </div>
                  <div>
                    <dt>Formation</dt>
                    <dd>{formation}</dd>
                  </div>
                  <div>
                    <dt>Match format</dt>
                    <dd>
                      {format}v{format}
                    </dd>
                  </div>
                </dl>
                <button
                  className="clear-selection"
                  onClick={() => setSelected(null)}
                >
                  Clear selection
                </button>
              </div>
            ) : (
              <div className="empty-focus">
                <div className="focus-icon">◎</div>
                <h3>
                  Every player
                  <br />
                  has a place.
                </h3>
                <p>
                  Select a marker on the pitch or a player in your lineup to
                  inspect their position.
                </p>
              </div>
            )}
            <div className="formation-summary">
              <span className="field-label">THE SHAPE</span>
              <strong>{formation}</strong>
              <p>{format - 1} outfield players + 1 goalkeeper</p>
            </div>
          </aside>
        </div>
        <footer className="page-footer">
          <span>TOUCHLINE STUDIO</span>
          <span>Build a lineup. See the possibilities.</span>
        </footer>
      </main>
    </div>
  );
}
createRoot(document.getElementById("root")).render(new URLSearchParams(window.location.search).get("mode") === "editor" ? <App /> : <DecisionGame />);

