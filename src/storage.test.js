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
test("positions round-trip and reject out-of-field or malformed coordinates", () => {
  const moved = {...record, profiles: {1: {...record.profiles[1], position: {x: 12, z: -18}}}};
  assert.deepEqual(readLineups({getItem:()=>JSON.stringify([moved])})[0].profiles[1].position, {x:12,z:-18});
  for(const position of [{x:16,z:0},{x:0,z:22},{x:"1",z:0},null]) {
    const invalid={...moved,profiles:{1:{...moved.profiles[1],position}}};
    assert.throws(()=>readLineups({getItem:()=>JSON.stringify([invalid])}));
  }
});
test("tactics survive a save and malformed arrows are rejected", () => {
  const tactics={ball:{x:0,z:0},arrows:[{kind:"pass",from:{x:0,z:0},to:{x:5,z:-5}}]};
  assert.deepEqual(readLineups({getItem:()=>JSON.stringify([{...record,tactics}])})[0].tactics,tactics);
  assert.throws(()=>readLineups({getItem:()=>JSON.stringify([{...record,tactics:{...tactics,arrows:[{kind:"run",from:{x:99,z:0},to:{x:0,z:0}}]}}])}));
});
