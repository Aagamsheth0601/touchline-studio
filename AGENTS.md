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

## Two-scenario checkpoint
- [x] User approved two-on-one situation and scenario selector.
- [x] Early pass and carry outcomes; carrying keeps the ball at player 4.
- [x] Scenario-specific copy, separate session progress, switching cancels playback.
- [x] 17 tests/build passed; Playwright exercised all four choices, switching mid-replay, progress retention, touch, pause/resume, and 390/768/1280 screenshots.
- [ ] User checkpoint before further scenarios or persistence.

### PowerShell source quoting
- Symptom: edit command failed to parse before changing files.
- Cause: typographic apostrophes in single-quoted replacement strings are treated as delimiters by PowerShell.
- Fix: use apply_patch or a literal here-string script for source transformations.

## Coaching semantic-search checkpoint
- [x] Eight authored notes seeded in pgvector, 384-dimensional gte-small embeddings generated.
- [x] Search endpoint deployed with legacy JWT verification; indexing requires protected-table permissions via x-index-key.
- [x] Public anon key configured in ignored .env; user explicitly authorized credential use. Service-role key never saved to source or frontend.
- [x] 19 unit tests/build; seven real retrieval cases; anonymous indexing/direct-table denial; real Playwright at 390/768/1280 plus mocked empty/error states.
- [ ] Checkpoint with user before AI-generated answers.
- See COACHING_SEARCH.md for setup, limits and evaluation.

### Supabase editor and credential setup
- Symptom: editor stayed loading; deployment clicks appeared ineffective. Cause: Monaco load failure followed by a dashboard announcement overlay. Fix: reload editor, dismiss overlay, verify actual deployed state.
- Symptom: indexing returned 403 despite a provided service credential. Exact credential-string comparison failed; the specific gateway/runtime transformation was not established. Fix: dedicated x-index-key validated through protected database access, and use that validated client for indexing. Public-key indexing remains denied in the live check.
- Automatic review initially blocked API Keys access; user explicitly authorized existing public and service-role key use. A later review quota interruption delayed setup; continuation completed it.

### Weak semantic matches
- Symptom: bread-making question returned football notes at a 0.72 cutoff.
- Cause: embedding similarities can be relatively high even for unrelated short questions.
- Fix: calibrated cutoff to 0.82 with five relevant and two unrelated evaluation questions. Treat as a small-library heuristic, not a guarantee.


## Sourced knowledge checkpoint
- [x] Eight brief AI-assisted summaries tied to four FIFA Training Centre sources; titles, URLs and checked date stored with notes.
- [x] Migration 004 applied; eight embeddings rebuilt; existing private access preserved.
- [x] 20 tests; ten real retrieval cases with attribution and access checks. Expected note top-three 8/8, top-one 6/8; two unrelated queries filtered. This is a smoke set, not a broad accuracy claim.
- [x] Playwright source links and screenshots at 390/768/1280; no page errors or horizontal overflow.
- [ ] User checkpoint before generated answers. Sources do not validate authored game outcomes; no professional review claimed.

### Source-card replacement bug
- Symptom: new introduction rendered, but search cards still displayed the old source label.
- Root cause: an encoding-sensitive text replacement missed the middle-dot-containing JSX.
- Fix: replace the card fragment explicitly; verify real result links at all three viewport widths.

### Local verification environment
- Build initially failed with EPERM while resolving Pitch.jsx under the sandbox; the same build succeeded with authorized file access.
- Browser verification initially found no localhost server; starting the project dev server restored it.

### Editor return navigation
- Symptom: returning to the decision game was hard to discover; only the brand logo linked home.
- Fix: explicit top-right Back to decision game link, replacing the version label, with a 44px touch target and compact mobile header.
- Verified navigation and screenshots at 390/768/1280; 20 tests and production build passed. Existing unsaved-edit beforeunload protection remains in place.


## Decision questions: in progress
- [x] Post-replay question form tied to selected scenario and choice; switching clears responses.
- [x] Prepared Gemini Edge Function, validated scenario snapshot, citation membership checks, refusal path, output truncation rejection, 5/minute and 100/day shared budget migration.
- [x] 24 unit tests/build; mocked success/refusal/429 and scenario reset in Playwright; 390/768/1280 screenshots reviewed.
- [ ] User must store GEMINI_API_KEY in Supabase secrets and confirm free/paid tier before provider calls. Do not request a key in chat.
- [ ] Apply/test migration 005, deploy decision-answer and enable it, evaluate REAL answers across all four outcomes, adversarial/unsupported questions and budget behavior, then publish frontend.
- Not deployed; no real Gemini answer has been tested. Current live site remains unchanged.


## Decision questions: verified backend checkpoint
- User stored GEMINI_API_KEY and confirmed Google project Free tier by screenshot. No billing enabled and no paid fallback configured.
- Migration 005 applied; minute/day limits and anonymous RPC denial verified in a rolled-back SQL test.
- decision-answer deployed with legacy JWT verification; DECISION_ANSWERS_ENABLED=true.
- 27 tests/build pass; real answers for all four choices, unrelated/credential refusals, and real UI screenshots at 390/768/1280 checked.
- Source: DECISION_ANSWERS.md. Earlier in-progress checklist is superseded by this checkpoint.

### Gemini explanation quality fixes
- Symptoms: ambiguous passer/receiver wording; two-on-one guidance mixed into press advice; internal noteIds in prose; credential request answered with unrelated football prose.
- Causes: ambiguous action labels, broad semantic matches, and relying solely on generation instructions.
- Fixes: explicit number-4 context and enforced opening replay fact, scenario-specific note filtering, rejected citation metadata in prose, and deterministic refusal of obvious credential requests.
- Prompt separates observed outcomes from hypothetical alternatives. These checks reduce known errors; they do not prove all generated statements correct.

- Frontend published to Netlify deployment 6acf0753417095dc56f295ed; live browser-to-Gemini answer verified. Checkpoint before further features.

## Learning guide artifact October 16 2026
- Created a 15-page DOCX architecture and learning guide outside the app repository, grounded in be4905f. No application behavior or deployment changed.
- Document-generation gotchas: Windows rejected an oversized shell command with error 206; split content and builder into workspace files. Packaged rendering failed because LibreOffice was absent; used a dedicated hidden Word instance to export PDF and Poppler to inspect all 15 pages. Removed an inherited Title border, rerendered, and verified unchanged pages by image hashes.

## Public release security review October 16 2026
- Full-history Gitleaks scan of 16 commits and tracked snapshot found no credentials. Build JWT detections were verified as public anon roles, not private keys.
- Live public reads of lineups/notes/retrieval RPC denied with 401; indexing denied with 403.
- Bug: npm audit flagged the old Supabase auth client and Vite/esbuild dev-server dependencies. Fixed frontend pins to Supabase 2.50.0 and Vite 6.4.4, which supports Node 20.11; zero npm audit findings, 27 tests and production build passed.
- Browser outcome/question-form/editor-navigation smoke checks passed. See SECURITY.md for audit scope and remote-function dependency limitations.
