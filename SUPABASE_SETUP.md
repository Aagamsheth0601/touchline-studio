# Connect account-based saving (milestone 3, pending live verification)

1. Create a Free Supabase project named touchline-studio. Keep its database password private.
2. In SQL Editor, run supabase/migrations/001_lineups.sql once. It creates lineups with row-level security: signed-in users can only read and insert their own snapshots.
3. In Authentication > URL Configuration, set Site URL to https://fut-studio.netlify.app and allow that URL plus http://127.0.0.1:5173 for local development.
4. Copy .env.example to .env. Set VITE_SUPABASE_URL to the project URL and VITE_SUPABASE_PUBLISHABLE_KEY to the publishable (or legacy anon) key. Never use a secret/service_role key. Restart Vite after changing these values.
5. Configure email delivery before inviting public users. Supabase default mail delivery is restricted; use the current Supabase SMTP documentation to configure a mail provider and sender. For the first test use an authorized project-team email.
6. Build and deploy again with these variables present. Until configured, account controls are hidden and device saving works normally.

## Before claiming milestone 3 complete

- Sign in through the emailed magic link on two separate browser/device sessions.
- Save a cloud copy in session one; refresh the list and reopen it in session two.
- Use a second account to prove it cannot see or insert records owned by the first account. Check anonymous requests are denied.
- Verify expired links, offline requests, failed email delivery, sign-out, and unsaved-edit prompts.
- Check the configured account panel at 390, 768, and 1280px.

Cloud copies are immutable snapshots in this first slice. Local saves are never auto-uploaded. Opening a cloud copy does not overwrite a device record. Auth and database tests against a real project are still required; compilation alone does not verify them.
