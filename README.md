# Touchline Studio

A football lineup studio for captains and amateur coaches. Milestone 1 is a local, interactive React and Three.js app: one team, numbered placeholders, no sign-up or player names required.

## Run locally

Requires Node 20.11.1 or later. Tooling is pinned to Vite 5 for compatibility with the original development machine.

```powershell
npm ci
npm run dev
```

Open http://127.0.0.1:5173. Use `npm test` for formation checks and `npm run build` for the production bundle.

## Milestone 1

- 5v5, 6v6, and 11v11, with one goalkeeper included.
- Three formation presets per format.
- Orbit and zoom in 3D; switch to an overhead camera.
- Select players on the pitch or through the keyboard-accessible team list.
- Inspect shirt number, positional group, and formation.
- Reset camera and clear selection.
- Mobile, tablet, and desktop layouts; visible WebGL failure messages.

Players are not draggable yet. Names, instructions, a second team, accounts, saved lineups, sharing, substitutions, and AI are future milestones. Refreshing resets the current lineup. Pitch dimensions are illustrative, not regulation measurements. Positional labels describe formation rows rather than detailed tactical roles.

## How the pieces fit

- `src/formations.js`: pure data transformation from a formation to player coordinates. X is pitch width; Z is length. The goalkeeper is created separately.
- `src/main.jsx`: React owns the selected format, formation, player, and view. Format and formation update together to avoid invalid states.
- `src/Pitch.jsx`: Three.js draws the field and markers. Raycasting converts a pitch click into a player ID, sent back to React. OrbitControls handles the camera. GPU resources and listeners are released on unmount.
- `src/style.css`: responsive layout and the visual theme.
- `src/formations.test.js`: checks squad counts, the goalkeeper, unique positions, boundaries, and rejected invalid input.

## Verification

Milestone 1 was exercised with Playwright MCP at 390, 768, and 1280px. All nine formations produced correct player counts; roster selection, both camera modes, and camera reset were exercised. Screenshots were visually inspected. See AGENTS.md for bugs found during development.

## Hosting later

Netlify can host this frontend with build command `npm run build` and publish directory `dist`. No backend or API keys are needed for milestone 1. Hosting is not part of this milestone.
