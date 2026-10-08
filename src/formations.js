// Formations describe outfield rows from defence to attack; the keeper is separate.
export const presets = {
  5: ["1-2-1", "2-1-1", "2-2"],
  6: ["2-2-1", "1-3-1", "2-1-2"],
  11: ["4-3-3", "4-4-2", "3-5-2"],
};
export function makePlayers(format, formation) {
  if (!presets[format]?.includes(formation))
    throw new Error("Unsupported formation");
  const rows = formation.split("-").map(Number);
  const players = [{ id: 1, role: "GK", x: 0, z: 17 }];
  rows.forEach((count, row) => {
    for (let i = 0; i < count; i++)
      players.push({
        id: players.length + 1,
        role: row === 0 ? "DEF" : row === rows.length - 1 ? "FWD" : "MID",
        x: (i - (count - 1) / 2) * Math.min(8, 26 / count),
        z: 10 - row * (24 / (rows.length - 1)),
      });
  });
  return players;
}
