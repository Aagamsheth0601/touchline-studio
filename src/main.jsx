import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import Pitch from "./Pitch.jsx";
import { presets, makePlayers } from "./formations.js";
import "./style.css";

function App() {
  const [format, setFormat] = useState(6),
    [formation, setFormation] = useState("2-2-1"),
    [selected, setSelected] = useState(null),
    [view, setView] = useState("3d"),
    [resetKey, setResetKey] = useState(0);
  const players = useMemo(
    () => makePlayers(format, formation),
    [format, formation],
  );
  const player = players.find((p) => p.id === selected);
  // Change format and its formation together so we never render an invalid combination.
  function changeFormat(next) {
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
        <span className="version">
          Lineup lab <b>01</b>
        </span>
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
          <span className="session-label">
            LOCAL SESSION<span>Changes reset on refresh</span>
          </span>
        </div>
        <div className="workspace">
          <aside className="setup panel">
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
              onChange={(e) => setFormation(e.target.value)}
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
                    {p.id.toString().padStart(2, "0")}
                  </span>
                  <span>
                    Player {p.id}
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
            <div className="pitch-area">
              <Pitch
                {...{ players, selected, view, format, resetKey }}
                onSelect={setSelected}
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
                {view === "3d"
                  ? "Drag to orbit · Scroll or pinch to zoom"
                  : "Overhead view · Scroll or pinch to zoom"}
              </span>
              <span>Click a player to inspect</span>
            </div>
          </section>
          <aside className="details panel">
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
                  {player.id}
                </div>
                <p className="eyebrow">MY TEAM / {player.role}</p>
                <h3>Player {player.id}</h3>
                <p className="detail-role">{roleNames[player.role]}</p>
                <dl>
                  <div>
                    <dt>Shirt number</dt>
                    <dd>{player.id.toString().padStart(2, "0")}</dd>
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
createRoot(document.getElementById("root")).render(<App />);
