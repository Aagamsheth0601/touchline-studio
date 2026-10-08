import React, { useEffect, useState } from "react";
import { cloud, listCloudLineups, saveCloudCopy } from "./cloud.js";

export default function CloudPanel({ lineup, onOpen }) {
  const [user, setUser] = useState(null),
    [email, setEmail] = useState(""),
    [records, setRecords] = useState([]);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  useEffect(() => {
    if (!cloud) return;
    let alive = true;
    const {
      data: { subscription },
    } = cloud.auth.onAuthStateChange((_event, session) => {
      if (alive) {
        setUser(session?.user || null);
        setRecords([]);
      }
    });
    cloud.auth.getSession().then(({ data, error }) => {
      if (alive) {
        if (error) setError(error.message);
        else setUser(data.session?.user || null);
      }
    });
    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (!user) return;
    let alive = true;
    listCloudLineups(cloud)
      .then((rows) => {
        if (alive) setRecords(rows);
      })
      .catch((e) => {
        if (alive) setError(e.message);
      });
    return () => {
      alive = false;
    };
  }, [user?.id]);
  async function run(action) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
    } catch (e) {
      setError(
        e.message || "Connection failed. Your local lineup has not changed.",
      );
    } finally {
      setBusy(false);
    }
  }
  // Keep the public app local-only until a real backend has been configured.
  if (!cloud) return null;
  return (
    <section className="save-bar cloud-panel" aria-label="Account lineups">
      <h2>Across your devices</h2>
      {!user ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              const { error } = await cloud.auth.signInWithOtp({
                email: email.trim(),
                options: { emailRedirectTo: window.location.origin },
              });
              if (error) throw error;
              setMessage(
                "Check your email for a sign-in link. Save unsaved work on this device before opening it.",
              );
            });
          }}
        >
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>
          <button disabled={busy}>Email me a sign-in link</button>
        </form>
      ) : (
        <>
          <span className="account-email">{user.email}</span>
          <button
            disabled={busy}
            onClick={() =>
              run(async () => {
                await saveCloudCopy(cloud, lineup);
                setMessage("Cloud copy saved. Your device copy is unchanged.");
                setRecords(await listCloudLineups(cloud));
              })
            }
          >
            Save cloud copy
          </button>
          <div className="saved-picker">
            <label htmlFor="cloud-lineups">Your cloud lineups</label>
            <select
              id="cloud-lineups"
              disabled={busy}
              value=""
              onChange={(e) => {
                const record = records.find((r) => r.id === e.target.value);
                if (record) onOpen(record);
              }}
            >
              <option value="">Open a cloud lineup ({records.length})</option>
              {records.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} / {r.format}v{r.format} /{" "}
                  {new Date(r.created_at).toLocaleString()}
                </option>
              ))}
            </select>
          </div>
          <button
            disabled={busy}
            onClick={() =>
              run(async () => setRecords(await listCloudLineups(cloud)))
            }
          >
            Refresh cloud list
          </button>
          <button
            disabled={busy}
            onClick={() =>
              run(async () => {
                const { error } = await cloud.auth.signOut();
                if (error) throw error;
                setRecords([]);
                setUser(null);
              })
            }
          >
            Sign out
          </button>
        </>
      )}
      <p>
        Cloud copies belong to your account. Device saves stay in this browser
        and are never uploaded automatically.
      </p>
      {busy && <p role="status">Connecting...</p>}
      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
