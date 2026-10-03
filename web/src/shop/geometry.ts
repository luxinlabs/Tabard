// Geometry of the shop room: an isometric diorama. Two walls meet at the back corner; the floor is a diamond.
// World coordinates (u, v) run 0..1 across the floor: u along the right wall's base, v along the left wall's base.
// Everything that is drawn or walks in the room is placed with iso(); toWorld() goes back for clicks and collisions.

export const W = 1200, H = 760;
export const TOP = { x: 600, y: 200 };       // back corner, where the two walls meet the floor
export const U = { x: 520, y: 260 };         // along the right wall
export const V = { x: -520, y: 260 };        // along the left wall
export const WALL_H = 200;                   // wall height in pixels
export const SLAB = 22;                      // thickness of the floor slab under the room

export const iso = (u: number, v: number, h = 0) => ({ x: TOP.x + u * U.x + v * V.x, y: TOP.y + u * U.y + v * V.y - h });
export const toWorld = (x: number, y: number) => {
  const a = (x - TOP.x) / U.x, b = (y - TOP.y) / U.y;
  return { u: (a + b) / 2, v: (b - a) / 2 };
};

// Furniture footprints in world coordinates [u0, u1, v0, v1] (also used to block walking)
export const COUNTER = { u0: 0.56, u1: 0.86, v0: 0.42, v1: 0.5, h: 54 };
export const TABLE = { u0: 0.2, u1: 0.34, v0: 0.5, v1: 0.62, h: 34 };
export const SHELF_DEPTH = 0.07;            // wall shelves stick out this far from the right wall
export const RUG = { u: 0.47, v: 0.42, ru: 0.13, rv: 0.13 };
const BLOCKS = [
  [COUNTER.u0 - 0.01, COUNTER.u1 + 0.01, COUNTER.v0 - 0.01, COUNTER.v1 + 0.01],
  [TABLE.u0 - 0.01, TABLE.u1 + 0.01, TABLE.v0 - 0.01, TABLE.v1 + 0.01],
  [0.42, 0.97, 0, SHELF_DEPTH + 0.02],
];
export function walkable(x: number, y: number) {
  const { u, v } = toWorld(x, y);
  if (u < 0.04 || v < 0.04 || u > 0.97 || v > 0.97) return false;
  return !BLOCKS.some(([u0, u1, v0, v1]) => u > u0 && u < u1 && v > v0 && v < v1);
}

// Where the owner stands to use each station
export const STAND = {
  billboard: iso(0.24, 0.12),
  shelves: iso(0.66, 0.16),
  service: iso(0.5, 0.52),
  monitor: iso(0.1, 0.3),
  rooms: iso(RUG.u - 0.11, RUG.v + 0.06),
};

// The shop's agents and where they stand
export const AGENT_POSTS: Record<string, [{ x: number; y: number }, string, string]> = {
  gatekeeper: [iso(0.17, 0.74), "#B03A3C", "#F2C98B"],
  concierge: [iso(RUG.u, RUG.v), "#2F4A3C", "#E0A1AB"],
  promo: [iso(0.36, 0.1), "#A45F6A", "#F2C98B"],
  stylist: [iso(0.5, 0.14), "#2F4A3C", "#F2C98B"],
  returns: [iso(0.93, 0.13), "#9A6512", "#F6EAD3"],
  service: [iso(0.72, 0.36), "#2F4A3C", "#9CC7AE"],
};
export const AGENT_SPOTS: Record<string, { x: number; y: number }> = { shelves: iso(0.68, 0.14) };

// Visitors: the door is in the left wall near the front; the gatekeeper's arch is just inside it.
export const DOOR = { v0: 0.74, v1: 0.9 };
export const spots = {
  door: () => iso(0.0, 0.82 + (Math.random() - 0.5) * 0.04),
  gate: () => iso(0.1, 0.82 + (Math.random() - 0.5) * 0.03),
  shelf: (i: number) => iso(0.47 + (i % 6) * 0.08 + (Math.random() - 0.5) * 0.02, 0.16 + Math.random() * 0.05),
  queue: (i: number) => (i < 5 ? iso(0.84 - i * 0.06, 0.6) : iso(0.84 - (i - 5) * 0.06, 0.69)),
};

// polygon helper for SVG
export const pts = (...ps: { x: number; y: number }[]) => ps.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
