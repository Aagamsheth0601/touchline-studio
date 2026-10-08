import test from "node:test";
import assert from "node:assert/strict";
import { readLineups, saveLineup } from "./storage.js";
const record = {
  id: "one",
  name: "Friday turf",
  format: 6,
  formation: "2-2-1",
  profiles: { 1: { name: "Aagam", number: 22 } },
};
test("saved edits survive reading, updates replace and copies coexist", () => {
  let data = null;
  const storage = {
    getItem: () => data,
    setItem: (k, v) => {
      data = v;
    },
  };
  saveLineup(storage, record);
  assert.deepEqual(readLineups(storage), [record]);
  saveLineup(storage, { ...record, name: "Updated" });
  assert.equal(readLineups(storage).length, 1);
  saveLineup(storage, { ...record, id: "two" });
  assert.equal(readLineups(storage).length, 2);
});
test("corrupt data is never silently overwritten", () => {
  let wrote = false;
  const storage = {
    getItem: () => "{broken",
    setItem: () => {
      wrote = true;
    },
  };
  assert.throws(() => saveLineup(storage, record));
  assert.equal(wrote, false);
});
test("storage quota errors propagate to the UI", () => {
  assert.throws(
    () =>
      saveLineup(
        {
          getItem: () => null,
          setItem: () => {
            throw Error("Quota");
          },
        },
        record,
      ),
    /Quota/,
  );
});
