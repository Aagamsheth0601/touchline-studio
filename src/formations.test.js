import test from "node:test";
import assert from "node:assert/strict";
import { presets, makePlayers } from "./formations.js";
test("every preset fills exactly one team with one keeper and in-bounds unique positions", () => {
  for (const [format, formations] of Object.entries(presets))
    for (const formation of formations) {
      const players = makePlayers(format, formation);
      assert.equal(players.length, Number(format));
      assert.equal(players.filter((p) => p.role === "GK").length, 1);
      assert.equal(
        new Set(players.map((p) => `${p.x},${p.z}`)).size,
        players.length,
      );
      assert.ok(players.every((p) => Math.abs(p.x) < 16 && Math.abs(p.z) < 22));
    }
});
test("invalid combinations fail visibly instead of producing a broken squad", () =>
  assert.throws(() => makePlayers(5, "4-3-3")));
