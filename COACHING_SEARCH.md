# Coaching search

Current source provenance and evaluation: [COACHING_SOURCES.md](COACHING_SOURCES.md). Apply migration 004 after 003, then reindex all eight revised notes. The current UI shows source links alongside our AI-assisted summaries.

The sections below record the initial semantic-search implementation.

## What is built
Eight Touchline-authored practice notes are stored in Supabase Postgres. Each note has a 384-dimensional gte-small embedding. The coaching-search Edge Function embeds a question with the same model and calls match_coaching_notes to rank notes by cosine similarity. The UI shows up to three original notes above 0.82 similarity, with their source IDs. It generates no answers.

With eight rows, an exact scan is intentional; an approximate HNSW index is unnecessary. The model runs within Supabase, so no separate embedding-provider key is needed. Hosting/runtime quotas still apply.

## Files and deployment
- supabase/migrations/003_coaching_search.sql: extension, seeded notes, locked-down tables, similarity RPC and shared 30-searches-per-minute demo budget.
- supabase/functions/coaching-search/index.ts: validation, embeddings, retrieval and privileged indexing.
- supabase/config.toml: legacy JWT gateway verification remains enabled.
- src/coachingSearch.js: browser request and minimum-score filtering.
- src/CoachingSearch.jsx: loading, results, timeout and error states.
- scripts/evaluate-search.mjs: real retrieval and anonymous access checks.

The browser uses VITE_SUPABASE_EDGE_ANON_KEY, an existing public legacy anon key, for gateway compatibility. Store it in ignored .env alongside VITE_SUPABASE_URL. It is public by design, not a service-role credential. The existing publishable key still handles lineup auth.

Run migration 003, then deploy coaching-search. From the trusted Supabase test panel, POST {"action":"index"} using the existing service-role key in x-index-key. The endpoint validates that key by reading the protected note table and uses the supplied credential for indexing. Anonymous/authenticated roles have no direct note-table access, so public credentials cannot index. Clear the header after testing. Never store a service-role key in frontend code, .env used by Vite, Git, or documentation.

The normal browser request is {"query":"How do I draw a defender out?"}. Search questions are not written by this feature. The rate budget stores minute counters only. Standard platform request metadata may still be logged.

To change a note, update its text and set its embedding to null before reindexing. Keep model, dimensionality, and normalization consistent. The current readiness check expects eight notes; update it when deliberately expanding the corpus.

## Evidence and limits
19 unit tests and production build pass. Playwright checked loading/error/no-match states with mocked responses, then real backend results at 390/768/1280. The live evaluation includes five football questions and two unrelated questions: all intended notes were in the top three, and unrelated queries were filtered out after raising the cutoff from 0.72 to 0.82. Public indexing attempts (including an anon key supplied as x-index-key) and direct anonymous table reads are denied.

Run npm test and node scripts/evaluate-search.mjs from the repo. The latter reads only the public key from .env and makes nine search/index requests plus one table-access check.

The cutoff was calibrated on a small evaluation set, not proven for every question. Related notes can rank ahead of the intended note. Source IDs identify our authored material; they are not independent football authorities. Notes have not been professionally reviewed. No chatbot, personalised recommendations, or persistent question history is included.

## Next checkpoint
Review retrieval quality with the user before adding an AI coach that answers using these notes plus current scenario state.
