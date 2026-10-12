// Snapshots contain positions only. Playback never writes interpolated positions
// back into the editable lineup or its saved records.
export function captureFrame(players, ball) {
  return {
    positions: Object.fromEntries(players.map(({ id, x, z }) => [id, { x, z }])),
    ball: ball ? { x: ball.x, z: ball.z } : null,
  };
}

export function interpolatePoint(from, to, progress) {
  const t = Math.max(0, Math.min(1, progress));
  // When a ball exists in only one step, show it only at that endpoint.
  // Do not invent a path from an unknown position.
  if (!from || !to) return t === 0 ? from : t === 1 ? to : null;
  return { x: from.x + (to.x - from.x) * t, z: from.z + (to.z - from.z) * t };
}
