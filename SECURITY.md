# Security and public release review

Reviewed 16 October 2026. This is a bounded code and credential review, not a penetration-test certification or a guarantee against every vulnerability.

## Credential handling

- `.env`, `.env.*` (except the placeholder `.env.example`), `dist/`, and `node_modules/` are ignored. No real environment file was found in reachable Git history.
- Only Supabase public project configuration and anon/publishable credentials belong in `VITE_` variables. Browser configuration is inspectable by design.
- Gemini and service-role credentials belong only in trusted Supabase server secrets. Never put them in client variables, issue reports, screenshots, or commits.
- If a private credential is exposed, revoke/rotate it first; deleting a file or commit alone does not invalidate it.

## Review evidence

- Gitleaks 8.30.1 scanned all reachable branches/tags and the tracked snapshot with full redaction: no findings in the 16 pre-review commits.
- The production bundle's JWT findings were classified by decoded role: anon only. No private Gemini/service-role key was identified.
- Anonymous live requests to lineups, coaching_notes, and match_coaching_notes returned 401; anonymous indexing returned 403. No records were written by these checks.
- Frontend dependency audit initially flagged Supabase auth routing and Vite/esbuild development-server advisories. Upgraded the frontend Supabase client to 2.50.0 and Vite to 6.4.4, compatible with Node 20.11. The resulting npm audit reported zero known vulnerabilities.
- All 27 unit tests and the production build passed. Browser checks exercised the decision outcome, question form, and editor navigation with the updated packages.

## Boundaries and remaining risks

- The npm audit covers package-lock.json, not remote Deno imports or the hosted infrastructure. Edge Functions retain their separately deployed Supabase 2.49.8 client; they use database operations rather than the malformed-user-input auth routing covered by the frontend advisory. Updating deployed functions is a separate maintenance task.
- RLS restricts lineup ownership. Coaching tables and retrieval RPCs are inaccessible directly to public roles; server functions perform constrained operations.
- CORS and the public anon gateway token do not establish an individual visitor's identity. Public users can exhaust shared request budgets; those budgets are not per-user abuse protection.
- Generated answer validation does not prove semantic correctness or fully prevent prompt injection.
- No fresh authenticated two-user/cross-device test or load test was performed in this release review. Prior SQL owner-isolation checks are recorded in AGENTS.md.
- GitHub issue/PR bodies, third-party logs, and unrelated local files were not part of the Git-object scan. Do not upload sensitive diagnostics.

Please report suspected vulnerabilities privately through GitHub private vulnerability reporting when enabled. Do not post secret values in public issues.
