import { presets } from "./formations.js";
export const STORAGE_KEY = "touchline.lineups.v1";
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
        !r.profiles ||
        Object.values(r.profiles).some(
          (p) =>
            typeof p.name !== "string" ||
            !Number.isInteger(p.number) ||
            p.number < 1 ||
            p.number > 99,
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
