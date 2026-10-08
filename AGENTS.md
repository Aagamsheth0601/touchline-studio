# Touchline project guidance

## Scope and learning workflow

Build one milestone at a time, explain each piece, run it, and checkpoint with Aagam. Keep code readable and commented. Use PowerShell syntax. Keep the GitHub repository private until explicitly requested otherwise. Commit completed milestones with a Codex co-author trailer.

## Todo

- [x] Formation data and tests for 5v5 / 6v6 / 11v11.
- [x] One team with optional numbered placeholders; no name-entry requirement.
- [x] 3D pitch, overhead view, player selection, camera reset.
- [x] Responsive UI checked through Playwright MCP at 390 / 768 / 1280px.
- [x] Commit and push milestone 1 to a private GitHub repository.
- [ ] User checkpoint before milestone 2.

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

