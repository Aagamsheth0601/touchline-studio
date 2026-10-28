# Touchline Studio

An interactive football decision game and 3D lineup editor built with React and Three.js. Play two authored scenarios, explore sourced coaching notes, ask replay questions, or open the lineup editor.

[Live site](https://fut-studio.netlify.app/) · [Editor](https://fut-studio.netlify.app/?mode=editor)

The milestone sections below record development history; later sections supersede earlier limitations.

## Run locally

Requires Node 20.11.1 or later. Tooling is pinned to Vite 6.4.4 for compatibility with the original development machine.

```powershell
npm ci
npm run dev
```

Open http://127.0.0.1:5173. Use `npm test` for the 27 automated checks and `npm run build` for the production bundle.

## Milestone 1

- 5v5, 6v6, and 11v11, with one goalkeeper included.
- Three formation presets per format.
- Orbit and zoom in 3D; switch to an overhead camera.
- Select players on the pitch or through the keyboard-accessible team list.
- Inspect shirt number, positional group, and formation.
- Reset camera and clear selection.
- Mobile, tablet, and desktop layouts; visible WebGL failure messages.

Players are not draggable yet. Instructions, a second team, accounts, sharing, substitutions, and AI are future milestones. Saved lineups can be reopened after refresh; unsaved edits are not stored. Pitch dimensions are illustrative, not regulation measurements. Positional labels describe formation rows rather than detailed tactical roles.

## How the pieces fit

- `src/formations.js`: pure data transformation from a formation to player coordinates. X is pitch width; Z is length. The goalkeeper is created separately.
- `src/main.jsx`: React owns the selected format, formation, player, and view. Format and formation update together to avoid invalid states.
- `src/Pitch.jsx`: Three.js draws the field and markers. Raycasting converts a pitch click into a player ID, sent back to React. OrbitControls handles the camera. GPU resources and listeners are released on unmount.
- `src/style.css`: responsive layout and the visual theme.
- `src/formations.test.js`: checks squad counts, the goalkeeper, unique positions, boundaries, and rejected invalid input.

## Verification

Milestone 1 was exercised with Playwright MCP at 390, 768, and 1280px. All nine formations produced correct player counts; roster selection, both camera modes, and camera reset were exercised. Screenshots were visually inspected. See AGENTS.md for bugs found during development.

## Deployment and configuration

Netlify builds the GitHub `main` branch using `netlify.toml`: `npm test && npm run build`, publish directory `dist`, Node 20.11.1.

For the complete app, copy `.env.example` to ignored `.env` locally and configure the same three public values in Netlify: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_SUPABASE_EDGE_ANON_KEY`. Use only a public publishable/anon key. Never put Gemini or service-role secrets in a `VITE_` variable.

Without this configuration the local decision game/editor still work, but cloud saves, coaching search, and AI questions are unavailable. See [SUPABASE_SETUP.md](SUPABASE_SETUP.md), [COACHING_SEARCH.md](COACHING_SEARCH.md), and [DECISION_ANSWERS.md](DECISION_ANSWERS.md) for database migrations and separately deployed Supabase functions. A Netlify deploy does not deploy those functions.

Existing browser saves remain available because the production hostname stays the same.

## Milestone 2

Jersey markers now display editable kit numbers (1-99). Select a player to edit an optional name. Formation changes preserve profiles by slot; smaller formats temporarily hide unused slots without deleting their profiles.

Name a lineup and use Save lineup to store it in this browser. Reopen it from Saved on this device. Saving again updates it; Save as copy creates a separate record. Unsaved changes prompt before opening another lineup or leaving the page. Browser storage is local to this origin and browser: clearing data removes it, and it does not sync across devices or migrate automatically to a hosted URL. No backend or authentication was added.

## Two-step movement preview

Arrange players and the ball, capture Step 1, move them to their next positions, then capture Step 2. Play, pause, restart, change speed, or scrub through the movement. Return to editing restores your editable positions.

All movement is simultaneous and straight-line; arrows remain annotations. These two captures are temporary and are not included in local or cloud saves. Formation changes and opening another lineup clear them. Multi-step playback and saved sequences are the next checkpoint.

The current app also supports dragging players, placing the ball, run/pass arrows, and Supabase email-link accounts with cloud lineup snapshots. Authenticated cloud tactics and cross-device verification remain pending.

## Football decision game

The homepage now opens Escape the press, an authored scenario with two choices. Choose 5 to keep possession or 6 to gain territory. Watch the ball, receivers and defenders move, read the tradeoff, and try the other pass. Pause, replay, skip animation, and a reduced-motion option are available. Exploration progress is session-only; no AI generation or login is required.

The existing lineup editor and saved lineups remain available at ?mode=editor. Scenario data and outcomes live in src/scenario.js; DecisionGame.jsx owns the interaction, while Pitch.jsx renders its animated positions. This is a teaching illustration, not a predictive match simulation.

Two scenarios are now available from the homepage selector. Make the defender choose compares an early pass with carrying the ball in a two-on-one. The carry ends at the next passing decision rather than automatically completing a second action. Each scenario retains its own exploration count during the current session; refreshing resets progress. Switching scenarios cancels an active replay.

## Coaching library: semantic search
Below the game, search eight authored practice notes by meaning. Supabase gte-small generates embeddings; pgvector ranks the stored notes. Results show original text and source IDs, not generated answers. See COACHING_SEARCH.md for architecture, deployment, evaluation and limitations.

## Current security maintenance
The frontend now pins Vite 6.4.4 and Supabase JS 2.50.0 after the October 2026 dependency audit. Vite 6 supports the original Node 20.11 environment. Historical milestone descriptions above are retained; see SECURITY.md and the latest AGENTS.md checkpoints for current security scope.

## Replay questions
After a replay, ask a question grounded in that scenario and retrieved coaching notes. The separately hosted Supabase function calls Gemini with shared request budgets and validates citations. This is an AI-assisted teaching demo, not a match prediction; see [DECISION_ANSWERS.md](DECISION_ANSWERS.md) and [SECURITY.md](SECURITY.md) for limits.
