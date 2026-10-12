import { presets } from "./formations.js";
export const STORAGE_KEY = "touchline.lineups.v1";
const validPoint = p => p && Number.isFinite(p.x) && Number.isFinite(p.z) && Math.abs(p.x)<=15 && Math.abs(p.z)<=21;
export const validTactics = t => t === undefined || (t && (t.ball===null || validPoint(t.ball)) && Array.isArray(t.arrows) && t.arrows.length<=20 && t.arrows.every(a=>a && ["run","pass"].includes(a.kind) && validPoint(a.from) && validPoint(a.to)));
// Validate browser data before putting it back into application state.
export function readLineups(storage) {
  const records = JSON.parse(storage.getItem(STORAGE_KEY) || "[]");
  if (
    !Array.isArray(records) ||
    records.some(
      (r) =>
        typeof r.id !== "string" ||
        typeof r.name !== "string" ||
        !presets[r.format]?.includes(r.formation) ||
        !validTactics(r.tactics) ||
        !r.profiles ||
        Object.values(r.profiles).some(
          (p) =>
            typeof p.name !== "string" ||
            !Number.isInteger(p.number) ||
            p.number < 1 ||
            p.number > 99 ||
            (p.position !== undefined && (!p.position || !Number.isFinite(p.position.x) || !Number.isFinite(p.position.z) || Math.abs(p.position.x)>15 || Math.abs(p.position.z)>21)),
        ),
    )
  )
    throw new Error(
      "Saved lineups could not be read. Existing data has been left untouched.",
    );
  return records;
}
export function saveLineup(storage, record) {
  const records = readLineups(storage);
  const next = [record, ...records.filter((r) => r.id !== record.id)];
  storage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
