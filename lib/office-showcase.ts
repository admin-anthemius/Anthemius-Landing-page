/**
 * The workflow section's office: a complete 22 × 13 m floor, in metres, drawn as a plan and as a 3D model
 * from this one description. Same types and furniture as the hero's office (office-model.ts).
 */
import type { Item, Kind, Opening, Rect, Side, Wall } from "./office-model";

export type ShowRoom =
  | "boardroom"
  | "meeting"
  | "focus"
  | "manager"
  | "director"
  | "reception"
  | "workspace"
  | "washroom"
  | "phone"
  | "pantry";

/** Everything the 3D view needs to draw an office that is not the hero's. */
export type Plan = {
  w: number;
  d: number;
  walls: Wall[];
  openings: Opening[];
  items: Item[];
  floors: { r: Rect; finish: "carpet" | "tile" | "wood" }[];
  /** painted panels on the inside of walls */
  panels: Rect[];
};

const W = 22;
const D = 13;
const rect = (x0: number, x1: number, y0: number, y1: number): Rect => ({ x0, x1, y0, y1 });

export const ROOMS: { id: ShowRoom; r: Rect; fill: "meeting" | "cabin" | "reception" | "lounge" | "pantry" | null; at?: [number, number] }[] = [
  { id: "boardroom", r: rect(0, 6, 0, 4), fill: "meeting", at: [3, 3.4] },
  { id: "meeting", r: rect(6, 10, 0, 4), fill: "meeting", at: [8, 3.4] },
  { id: "focus", r: rect(10, 12.5, 0, 4), fill: "lounge", at: [11.25, 3.4] },
  { id: "manager", r: rect(12.5, 16, 0, 4), fill: "cabin", at: [14.25, 3.4] },
  { id: "director", r: rect(16, 22, 0, 4), fill: "cabin", at: [19.3, 3.4] },
  { id: "reception", r: rect(0, 6, 5.4, 13), fill: "reception", at: [4.65, 6.1] },
  { id: "workspace", r: rect(6, 16, 5.4, 13), fill: null, at: [11.15, 9.2] },
  { id: "washroom", r: rect(16, 18.8, 5.4, 8.6), fill: "pantry", at: [17.15, 6.75] },
  { id: "phone", r: rect(18.8, 20.4, 5.4, 8.6), fill: "meeting", at: [19.6, 6.75] },
  { id: "phone", r: rect(20.4, 22, 5.4, 8.6), fill: "meeting", at: [21.2, 6.75] },
  { id: "pantry", r: rect(16, 22, 8.6, 13), fill: "pantry", at: [18.6, 9.25] },
];

const items: Item[] = [];
const put = (id: string, kind: Kind, x: number, y: number, w: number, d: number, back?: Side, more: Partial<Item> = {}) =>
  items.push({ id, kind, x0: x, x1: x + w, y0: y, y1: y + d, back, ...more });
const chair = (id: string, x: number, y: number, back: Side) => put(id, "chair", x, y, 0.5, 0.5, back);

/** Back-to-back bench, chairs outside. */
function bench(id: string, x: number, y: number, cols: number) {
  for (let i = 0; i < cols; i++) {
    const cx = x + i * 1.4;
    chair(`${id}n${i}`, cx + 0.45, y, "n");
    put(`${id}a${i}`, "desk", cx, y + 0.55, 1.4, 0.7, "s");
    put(`${id}b${i}`, "desk", cx, y + 1.25, 1.4, 0.7, "n");
    chair(`${id}s${i}`, cx + 0.45, y + 2, "s");
  }
}

// boardroom: ten at the table, storage along the side wall
put("mt1", "table", 1.25, 1.25, 3.6, 1.2);
for (let i = 0; i < 4; i++) {
  chair(`bn${i}`, 1.45 + i * 0.85, 0.7, "n");
  chair(`bs${i}`, 1.45 + i * 0.85, 2.5, "s");
}
chair("bw", 0.7, 1.6, "w");
chair("be", 4.9, 1.6, "e");
put("bk", "cabinet", 5.5, 0.4, 0.38, 2.2, "e");
put("bp", "plant", 0.15, 0.15, 0.45, 0.45);

// meeting room for six
put("mt2", "table", 6.95, 1.25, 2.1, 1.1);
for (let i = 0; i < 2; i++) {
  chair(`mn${i}`, 7.25 + i * 1, 0.7, "n");
  chair(`ms${i}`, 7.25 + i * 1, 2.4, "s");
}
chair("mw", 6.4, 1.55, "w");
chair("me", 9.1, 1.55, "e");
put("mp", "plant", 9.4, 0.15, 0.42, 0.42);

// focus room
put("fr", "rug", 10.35, 0.5, 1.8, 2.3);
put("fa1", "armchair", 10.4, 0.45, 0.75, 0.75, "n");
put("fa2", "armchair", 11.35, 0.45, 0.75, 0.75, "n");
put("lt3", "table", 10.85, 1.55, 0.8, 0.6);

// manager
put("kd1", "desk", 13.55, 1.2, 1.7, 0.75, "s");
chair("kc1", 14.15, 0.6, "n");
chair("kv1", 13.75, 2.05, "s");
chair("kv2", 14.6, 2.05, "s");
put("kb1", "cabinet", 12.62, 0.3, 0.38, 1.9, "w");
put("kp1", "plant", 15.4, 0.15, 0.42, 0.42);

// director: desk, storage, and a sofa corner
put("kd2", "desk", 18.9, 1.2, 1.9, 0.8, "s");
chair("kc2", 19.6, 0.6, "n");
chair("kv3", 19.15, 2.1, "s");
chair("kv4", 20.05, 2.1, "s");
put("kb2", "cabinet", 21.5, 0.3, 0.38, 2.2, "e");
put("dr", "rug", 16.4, 0.5, 1.9, 2.5);
put("ds", "sofa", 16.2, 0.6, 0.85, 2.1, "w", { seats: 3 });
put("lt2", "table", 17.35, 1.2, 0.6, 1);

// reception and waiting lounge
put("rd1", "counter", 2.7, 6.5, 0.75, 2.4, "w");
chair("rc1", 3.6, 6.8, "e");
chair("rc2", 3.6, 7.9, "e");
put("rp1", "plant", 2.8, 5.85, 0.45, 0.45);
put("rr", "rug", 0.7, 9.8, 3.7, 2.5);
put("rs1", "sofa", 0.2, 9.7, 0.85, 2.2, "w", { seats: 3 });
put("rs2", "sofa", 1.4, 12.0, 2.2, 0.85, "s", { seats: 3 });
put("ra1", "armchair", 3.75, 9.8, 0.78, 0.78, "e");
put("ra2", "armchair", 3.75, 10.9, 0.78, 0.78, "e");
put("lt1", "table", 1.8, 10.35, 1.1, 0.7);
put("rp2", "plant", 5.3, 12.3, 0.5, 0.5);
put("rp3", "plant", 0.2, 12.35, 0.45, 0.45);

// open workspace: 24 desks
bench("w1", 6.5, 5.95, 3);
bench("w2", 11.5, 5.95, 3);
bench("w3", 6.5, 10.0, 3);
bench("w4", 11.5, 10.0, 3);
for (const [i, y] of [6.8, 7.4, 11, 11.6].entries()) put(`wp${i}`, "plant", 10.92, y, 0.42, 0.42);

// washrooms
put("wc1", "wc", 16.45, 7.8, 0.45, 0.7, "s");
put("wc2", "wc", 17.85, 7.8, 0.45, 0.7, "s");
put("ws1", "basin", 18.25, 5.6, 0.45, 0.55, "e");
put("ws2", "basin", 18.25, 6.3, 0.45, 0.55, "e");

// phone rooms
for (const [i, x] of [18.95, 20.55].entries()) {
  put(`kph${i}`, "desk", x + 0.1, 7.95, 1.2, 0.6, "s");
  chair(`kpc${i}`, x + 0.45, 7.4, "n");
}

// pantry and café
put("pc", "counter", 21.2, 9.0, 0.65, 3.7);
put("pt1", "table", 19.75, 9.4, 0.65, 1.6);
put("po1", "stool", 20.5, 9.55, 0.4, 0.4);
put("po2", "stool", 20.5, 10.35, 0.4, 0.4);
for (const [i, [x, y]] of ([[16.95, 9.85], [16.95, 11.65], [19.3, 11.65]] as [number, number][]).entries()) {
  put(`ct${i}`, "table", x, y, 0.85, 0.85);
  chair(`cw${i}`, x - 0.55, y + 0.18, "w");
  chair(`ce${i}`, x + 0.9, y + 0.18, "e");
}
put("pp", "plant", 16.2, 12.45, 0.42, 0.42);

const wall = (kind: Wall["kind"], x0: number, x1: number, y0: number, y1: number): Wall => ({ kind, x0, x1, y0, y1 });
const walls: Wall[] = [
  wall("outer", 0, W, 0, 0),
  wall("outer", W, W, 0, D),
  wall("outer", 0, W, D, D),
  wall("outer", 0, 0, 0, D),
  wall("glass", 0, 12.5, 4, 4),
  wall("glass", 12.5, W, 4, 4),
  wall("solid", 6, 6, 0, 4),
  wall("glass", 10, 10, 0, 4),
  wall("solid", 12.5, 12.5, 0, 4),
  wall("solid", 16, 16, 0, 4),
  wall("glass", 6, 6, 8.8, D),
  wall("solid", 16, 18.8, 5.4, 5.4),
  wall("glass", 18.8, W, 5.4, 5.4),
  wall("solid", 16, 16, 5.4, 8.6),
  wall("solid", 18.8, 18.8, 5.4, 8.6),
  wall("solid", 20.4, 20.4, 5.4, 8.6),
  wall("solid", 16, W, 8.6, 8.6),
  wall("solid", 17.35, 17.35, 7.3, 8.6),
];
const open = (kind: Opening["kind"], x0: number, x1: number, y0: number, y1 = y0): Opening => ({ kind, x0, x1, y0, y1 });
const openings: Opening[] = [
  open("window", 0.8, 2.8, 0),
  open("window", 3.4, 5.4, 0),
  open("window", 6.7, 9.3, 0),
  open("window", 10.4, 12.1, 0),
  open("window", 13.1, 15.4, 0),
  open("window", 16.6, 18.6, 0),
  open("window", 19.2, 21.2, 0),
  open("window", 0, 0, 9.6, 12.2),
  open("window", 0.9, 4.9, D),
  open("window", 6.6, 10.6, D),
  open("window", 11.5, 15.5, D),
  open("window", 16.8, 20.8, D),
  open("entrance", 0, 0, 6.4, 8),
  open("door", 4.9, 5.8, 4),
  open("door", 8.9, 9.8, 4),
  open("door", 11.4, 12.3, 4),
  open("door", 12.7, 13.6, 4),
  open("door", 16.2, 17.1, 4),
  open("door", 16.2, 17.1, 5.4),
  open("door", 18.95, 19.85, 5.4),
  open("door", 20.55, 21.45, 5.4),
];

export const SHOWCASE: Plan = {
  w: W,
  d: D,
  walls,
  openings,
  items,
  floors: [
    { r: rect(0, 10, 0, 4), finish: "carpet" },
    { r: rect(10, 12.5, 0, 4), finish: "wood" },
    { r: rect(12.5, 22, 0, 4), finish: "carpet" },
    { r: rect(0, 6, 8.8, 13), finish: "wood" },
    { r: rect(16, 18.8, 5.4, 8.6), finish: "tile" },
    { r: rect(18.8, 22, 5.4, 8.6), finish: "carpet" },
    { r: rect(16, 22, 8.6, 13), finish: "tile" },
  ],
  panels: [rect(0, 0.012, 0, 4)],
};
