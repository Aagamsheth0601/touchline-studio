import { createClient } from "@supabase/supabase-js";

// Only the publishable/anon key belongs in a browser. Never use a service-role key.
const url = import.meta.env?.VITE_SUPABASE_URL;
const key = import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY;
export const cloud = url && key ? createClient(url, key) : null;

export async function listCloudLineups(client) {
  const { data, error } = await client
    .from("lineups")
    .select("id,name,format,formation,profiles,tactics,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function saveCloudCopy(client, lineup) {
  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();
  if (authError || !user)
    throw new Error("Please sign in again before saving.");
  if (!lineup.name.trim())
    throw new Error("Give your lineup a name before saving.");
  // A new snapshot never silently overwrites a lineup edited on another device.
  const { error } = await client
    .from("lineups")
    .insert({
      user_id: user.id,
      name: lineup.name.trim(),
      format: lineup.format,
      formation: lineup.formation,
      profiles: lineup.profiles,
      tactics: lineup.tactics || {ball:null,arrows:[]},
    });
  if (error) throw error;
}
