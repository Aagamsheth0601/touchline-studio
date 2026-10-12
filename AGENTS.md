# Touchline project guidance

## Scope and learning workflow

Build one milestone at a time, explain each piece, run it, and checkpoint with Aagam. Keep code readable and commented. Use PowerShell syntax. Keep the GitHub repository private until explicitly requested otherwise. Commit completed milestones with a Codex co-author trailer.

## Todo

- [x] Formation data and tests for 5v5 / 6v6 / 11v11.
- [x] One team with optional numbered placeholders; no name-entry requirement.
- [x] 3D pitch, overhead view, player selection, camera reset.
- [x] Responsive UI checked through Playwright MCP at 390 / 768 / 1280px.
- [x] Commit and push milestone 1 to a private GitHub repository.
- [x] User approved milestone 2 after reviewing milestone 1.

Do not add names/editing, drawing, AI, persistence, a second team, or deployment in milestone 1.

## Testing

Run `npm test` and `npm run build`. Verify UI changes with Playwright MCP at approximately 390, 768, and 1280px. Test pitch selection as well as accessible roster selection. Never treat a successful build as proof that WebGL rendered.

## Bug log / gotchas

### Windows sandbox networking and filesystem access

- Symptom: npm reported ENOTFOUND, GitHub authentication appeared invalid, and Vite reported EPERM on realpath.
- Cause: restricted execution environment blocked network/credential access and Vite's file resolution.
- Fix: run the specific dependency installation, GitHub check, build, and dev server with approved elevated execution. GitHub login was valid; no reauthentication was needed.

### Pitch cropped on tablet with eleven players

- Symptom: the 11-player roster stretched the scene vertically and the field extended beyond the canvas edges.
- Cause: CSS grid stretching plus a fixed vertical camera field of view.
- Fix: bound the scene height, scroll the desktop roster, and adapt field of view for narrow canvas aspect ratios. Recheck 390 / 768 / 1280px.

### Player number contrast

- Symptom: dark numbers floating over green turf were difficult to read.
- Cause: transparent label texture with dark text.
- Fix: draw white numerals on a dark circular label.

## Milestone 2 scope and verification

- User approved jerseys, optional player names, kit numbers, lineup naming, and browser-only saving.
- No hosting, accounts, AI, second team, or tactical drawing in this milestone.
- Storage round-trip, update/copy, corrupted data, and quota failure have unit coverage.
- Verify save/reopen after reload and layouts at 390 / 768 / 1280px.

### Node 20 test-file wildcard on Windows

- Symptom: test runner could not find src/\*.test.js.
- Cause: this shell/runtime combination did not expand the wildcard.
- Fix: list both test files explicitly in package.json.

### Saved-lineup accessible label

- Symptom: exact label lookup failed for the saved-lineup selector.
- Cause: wrapping the select inside a label included option text in its accessible name.
- Fix: explicit label/for and select/id associations for saved lineups and kit number.

### Editor layout and shell encoding

- Symptom: tablet kit selector separated from its label; separator character became unreadable.
- Cause: grid treated label/select as separate children; shell-to-Python text encoding damaged a new non-ASCII separator.
- Fix: group the kit field and use an ASCII separator.

## Deployment and milestone 3
- Live site: https://fut-studio.netlify.app/ (Netlify project ID 01c08cb1-4560-4467-b0e2-ee57fe8fdff2).
- Source stays private at Aagamsheth0601/touchline-studio.
- Larger 14px screen-space names deployed; verified at 390 / 768 / 1280px.
- Milestone 3 started: Supabase email-link sign-in, immutable cloud snapshots, and owner-only RLS migration prepared.
- Not yet connected or verified against a real Supabase project. Do not claim cross-device saving works until two-session and owner-isolation tests pass.
- See SUPABASE_SETUP.md for setup. No secret/service-role key may enter client code.

### Pitch names too small
- Symptom: names in canvas textures became tiny when the pitch was zoomed out.
- Cause: texture text scaled in world units with the pitch.
- Fix: camera-projected HTML buttons with fixed 14px text, retaining click selection.

### Auth session refresh and connection failures
- Symptom: a token refresh could clear the cloud list, and a rejected initial session request had no visible error.
- Cause: all auth events cleared records; getSession had no rejection handler.
- Fix: clear records only when signed out; surface initial session failures.

### Supabase connection verification
- Connected project zfizduvgocwtviacqmnt via ignored .env; production/local redirects configured.
- Real SQL transaction verified owner read/insert, other-owner isolation, forged-owner insert rejection, anonymous denial; all test data rolled back.
- Configured signed-out panel verified at 390/768/1280 via Playwright. Eight unit tests passed. Live email login and cross-session save still pending.

## Visual polish checkpoint
- [x] Compact expandable save/account bar, pitch-first mobile layout, refined green/lime panels.
- [x] Decorative passing drill with pause and reduced-motion support.
- [x] Playwright checks at 390/768/1280: no overflow; local save and pause verified; eight tests/build passed.
- Cloud login and local save/reopen confirmed by user; cross-device check remains pending.

## Player movement checkpoint
- [x] Move players / camera toggle; mouse and touch drag, field bounds, gesture cancellation.
- [x] Positions stored in profiles for local/cloud copies; older saves remain valid. Formation changes/reset remove only positions.
- [x] Playwright mouse/touch gestures and save/reopen/reset verified. Storage coordinate validation covered.
- [ ] Arrows, ball, and sequence playback: next checkpoint.

## Ball and arrows checkpoint
- [x] Place/move ball; two-tap run/pass arrows; undo last arrow; clear tactics.
- [x] Local saving/reopening and emulated touch checked, including 390/768/1280 layouts.
- [x] Ten automated tests pass, including tactics validation and older saves.
- [ ] Verify migration 002 against Supabase, then deploy. Browser-control runtime currently fails with a missing-path error; do not claim deployed.
- [ ] Sequence playback follows this checkpoint.

### Conflicting camera/edit instructions
- Symptom: arrow tools still displayed "Move players" and told users to orbit while editing.
- Cause: movement-only labels were reused for all tactics tools.
- Fix: label editing mode "Edit pitch", show active tools only while editing, and display context-specific guidance.

### SQL editor partial replacement
- Symptom: migration result showed old security-test output or a role error.
- Cause: replacing the Monaco textarea did not reliably replace the whole editor document.
- Fix: select all and clear before entering SQL; verify the schema explicitly. Final migration verification still pending.

## Ball and arrows deployment verified
- Browser connection recovered; existing GitHub sessions restored after expiry.
- Supabase information_schema query confirmed public.lineups.tactics is jsonb.
- Netlify deployment 6acc4fa176932045e0a4404e published; source checkpoint 368ccc7.
- Live Playwright test created a ball/pass arrow, saved locally, reloaded and reopened successfully.
- Earlier deployment blocker resolved. Authenticated cloud tactics round-trip and cross-device verification remain pending.

## Two-step playback checkpoint
- [x] Capture two positions; play/pause/restart; scrub; 0.5x/1x/2x speed.
- [x] Players and ball interpolate without changing editable lineup positions. Editing is disabled during preview.
- [x] 13 automated tests and production build passed. Playwright verified movement, pause, endpoints, restart, edit restoration, local saving, and formation reset.
- [x] Layout screenshots inspected at 390/768/1280px; no horizontal overflow.
- [ ] Multi-step sequences and sequence persistence: next checkpoint, not implemented yet.
- Captures are temporary and cleared when switching formation or opening another lineup. Arrows remain annotations; playback uses simultaneous straight-line movement.

## Decision game pivot: scenario 1
- User approved replacing the default editor experience with a decision game.
- [x] Escape the press: two authored pass outcomes, moving ball, receivers and defenders.
- [x] Explanation, tradeoff, replay, alternative choice, session-only exploration count, reduced-motion option.
- [x] Existing editor remains at ?mode=editor; saves are unchanged.
- [x] 15 tests passed; both outcomes, pause/resume, replay/skip, reduced motion, and 390/768/1280 layouts exercised with Playwright.
- [ ] User checkpoint before more scenarios, AI, or progress persistence.

### Decision game integration fixes
- Symptom: exact endpoint assertion returned 0.5999999999999996 instead of 0.6. Cause: floating-point interpolation. Fix: return exact copied endpoints at progress 0 and 1.
- Symptom: overhead control used the wrong camera mode. Cause: new component used overhead while renderer expects top. Fix: use the existing top mode.
- Symptom: names obscured jerseys in responsive screenshots. Cause: game button styles applied to projected labels. Fix: specific compact label styles and a closer scenario camera.
