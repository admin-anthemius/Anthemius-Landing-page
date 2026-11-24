/**
 * The interactive office as data, in metres. Everything on screen (the plan and the quantities) is
 * computed from here. x runs along the back wall (0 → W), y from the back wall to the front (0 → D).
 *
 * One thing moves: the glass wall between the meeting room and the workspace. Furniture is generated
 * to fit on either side of it, so the seat counts are always what is actually drawn.
 */

export const W = 14;
export const D = 9;
export const H = 2.7; // ceiling height
export const ROOM_D = 3.6; // depth of the meeting room and the cabins
export const CABINS: [number, number][] = [
  [9, 11.5],
  [11.5, W],
];
export const CABIN_X = CABINS[0][0];
export type Rect = { x0: number; x1: number; y0: number; y1: number };
export const RECEPTION: Rect = { x0: 0, x1: 3.4, y0: ROOM_D, y1: 6.3 };
export const LOUNGE: Rect = { x0: 0, x1: 3.4, y0: 6.3, y1: D };
export const PANTRY: Rect = { x0: 10.8, x1: W, y0: 5.6, y1: D };
export const DOOR_W = 0.9;
export const DOOR_H = 2.1;
export const WINDOW_H = 2.1;

/** Where the glass wall may stand. */
export const GLASS_MIN = 3;
export const GLASS_MAX = 5.6;
export const GLASS_START = 4.2;
export const GLASS_STEP = 0.05;

export const LAYOUTS = ["focus", "collab", "exec"] as const;
export type Layout = (typeof LAYOUTS)[number];
export type RoomId = "meeting" | "cabin" | "reception" | "workspace" | "lounge" | "pantry";
export type Kind = "desk" | "chair" | "table" | "sofa" | "armchair" | "rug" | "counter" | "cabinet" | "stool" | "plant" | "wc" | "basin";
export type Side = "n" | "s" | "e" | "w";
/** `back`: the edge a seat's backrest is on (for a desk, the edge its screen is on). */
export type Item = Rect & { id: string; kind: Kind; back?: Side; seat?: "desk" | "meeting" | "lounge"; seats?: number };
export type Wall = Rect & { kind: "outer" | "solid" | "glass" };
export type Opening = Rect & { kind: "window" | "door" | "entrance" };

export const snapGlass = (v: number) =>
  Math.min(GLASS_MAX, Math.max(GLASS_MIN, Math.round(Math.round(v / GLASS_STEP) * GLASS_STEP * 100) / 100));

const item = (id: string, kind: Kind, x: number, y: number, w: number, d: number, more: Partial<Item> = {}): Item => ({
  id,
  kind,
  x0: x,
  x1: x + w,
  y0: y,
  y1: y + d,
  ...more,
});

/** Desks in a bench, `cols` wide; back to back when `double`. Chairs sit outside. */
function bench(id: string, x: number, y: number, cols: number, dw: number, double: boolean): Item[] {
  const out: Item[] = [];
  const dd = 0.7;
  const c = 0.5;
  for (let i = 0; i < cols; i++) {
    const cx = x + i * dw + (dw - c) / 2;
    out.push(item(`${id}a${i}`, "desk", x + i * dw, y + c, dw, dd, { back: "s", seat: "desk" }));
    out.push(item(`${id}ac${i}`, "chair", cx, y - 0.05, c, c, { back: "n" }));
    if (!double) continue;
    out.push(item(`${id}b${i}`, "desk", x + i * dw, y + c + dd, dw, dd, { back: "n", seat: "desk" }));
    out.push(item(`${id}bc${i}`, "chair", cx, y + c + 2 * dd + 0.05, c, c, { back: "s" }));
  }
  return out;
}

export function furniture(layout: Layout, glass: number): Item[] {
  const out: Item[] = [];
  const dw = layout === "exec" ? 1.8 : 1.4;

  // meeting room: a table as long as the room allows, seats per side follow
  const n = Math.floor((glass - 1.8) / 0.7 + 1e-6);
  const len = n * 0.7 + 0.2;
  const tx = 0.4 + (glass - 0.4 - len) / 2;
  out.push(item("mt", "table", tx, 0.95, len, 1.1));
  for (let i = 0; i < n; i++) {
    const x = tx + 0.2 + i * 0.7;
    out.push(item(`mn${i}`, "chair", x, 0.4, 0.5, 0.5, { back: "n", seat: "meeting" }));
    out.push(item(`ms${i}`, "chair", x, 2.1, 0.5, 0.5, { back: "s", seat: "meeting" }));
  }
  out.push(item("mh", "chair", tx - 0.55, 1.25, 0.5, 0.5, { back: "w", seat: "meeting" }));

  // workspace by the windows: as many desks as fit between the glass wall and the cabin
  const from = glass + 0.8;
  const room = CABIN_X - 0.6 - from;
  const cols = Math.max(0, Math.floor(room / dw + 1e-6));
  out.push(...bench("w", from + (room - cols * dw) / 2, layout === "exec" ? 0.9 : 0.4, cols, dw, layout !== "exec"));

  // workspace centre
  if (layout === "focus") out.push(...bench("c", 4.3, 5.6, 4, dw, true));
  if (layout === "exec") out.push(...bench("c", 4.4, 5.6, 3, dw, true));
  if (layout === "collab") {
    out.push(item("ct", "table", 4.1, 6.2, 3, 1.2));
    for (let i = 0; i < 4; i++) {
      const x = 4.22 + i * 0.75;
      out.push(item(`cn${i}`, "chair", x, 5.65, 0.5, 0.5, { back: "n", seat: "meeting" }));
      out.push(item(`cs${i}`, "chair", x, 7.45, 0.5, 0.5, { back: "s", seat: "meeting" }));
    }
    out.push(item("ca1", "armchair", 7.65, 5.7, 0.75, 0.75, { back: "n", seat: "lounge" }));
    out.push(item("ca2", "armchair", 7.65, 7.1, 0.75, 0.75, { back: "s", seat: "lounge" }));
    out.push(item("cat", "stool", 7.8, 6.55, 0.45, 0.45));
    out.push(...bench("d", 8.9, 5.6, 1, dw, true));
  }

  // cabins: a desk, its chair and two for visitors
  CABINS.forEach(([x], i) => {
    out.push(item(`k${i}d`, "desk", x + 0.75, 1.2, 1.5, 0.75, { back: "s", seat: "desk" }));
    out.push(item(`k${i}c`, "chair", x + 1.25, 0.6, 0.5, 0.5, { back: "n" }));
    out.push(item(`k${i}v1`, "chair", x + 0.85, 2.05, 0.5, 0.5, { back: "s" }));
    out.push(item(`k${i}v2`, "chair", x + 1.65, 2.05, 0.5, 0.5, { back: "s" }));
    out.push(item(`k${i}b`, "cabinet", x + 0.12, 0.15, 0.35, 1.8));
  });

  // reception
  out.push(item("rd", "counter", 1, 5.05, 1.8, 0.6));
  out.push(item("rc", "chair", 1.65, 5.7, 0.5, 0.5, { back: "s" }));

  // lounge
  out.push(item("lr", "rug", 0.5, 6.85, 2.5, 1.95));
  out.push(item("ls", "sofa", 0.2, 6.85, 0.85, 1.95, { back: "w", seat: "lounge", seats: 3 }));
  out.push(item("lt", "table", 1.35, 7.4, 0.6, 0.9));
  out.push(item("la1", "armchair", 2.25, 6.85, 0.75, 0.75, { back: "e", seat: "lounge" }));
  out.push(item("la2", "armchair", 2.25, 8.05, 0.75, 0.75, { back: "e", seat: "lounge" }));

  // pantry
  out.push(item("pc", "counter", 13.25, 5.8, 0.6, 2.9));
  out.push(item("pt", "table", 11.3, 6.7, 0.65, 1.5));
  out.push(item("ps1", "stool", 12.1, 6.85, 0.4, 0.4));
  out.push(item("ps2", "stool", 12.1, 7.65, 0.4, 0.4));

  const plants: [number, number][] = [
    [0.12, 0.12],
    [3.6, 8.42],
    [10.2, 8.42],
    [13.45, 0.15],
  ];
  plants.forEach(([x, y], i) => out.push(item(`pl${i}`, "plant", x, y, 0.4, 0.4)));
  return out;
}

export function walls(glass: number): Wall[] {
  return [
    { kind: "outer", x0: 0, x1: W, y0: 0, y1: 0 },
    { kind: "outer", x0: W, x1: W, y0: 0, y1: D },
    { kind: "outer", x0: 0, x1: W, y0: D, y1: D },
    { kind: "outer", x0: 0, x1: 0, y0: 0, y1: D },
    { kind: "glass", x0: glass, x1: glass, y0: 0, y1: ROOM_D },
    { kind: "glass", x0: 0, x1: glass, y0: ROOM_D, y1: ROOM_D },
    { kind: "solid", x0: CABIN_X, x1: CABIN_X, y0: 0, y1: ROOM_D },
    { kind: "solid", x0: CABINS[1][0], x1: CABINS[1][0], y0: 0, y1: ROOM_D },
    { kind: "glass", x0: CABIN_X, x1: W, y0: ROOM_D, y1: ROOM_D },
    { kind: "solid", x0: PANTRY.x0 + 1, x1: W, y0: PANTRY.y0, y1: PANTRY.y0 },
  ];
}

export function openings(glass: number): Opening[] {
  const win = (x0: number, x1: number, y: number): Opening => ({ kind: "window", x0, x1, y0: y, y1: y });
  return [
    win(0.7, 2.5, 0),
    win(5.8, 8.6, 0),
    win(9.5, 11, 0),
    win(12, 13.3, 0),
    win(0.8, 2.8, D),
    win(4.2, 6.8, D),
    win(7.4, 10, D),
    win(11.4, 13, D),
    { kind: "entrance", x0: 0, x1: 0, y0: 3.85, y1: 4.85 },
    { kind: "door", x0: glass - 0.2 - DOOR_W, x1: glass - 0.2, y0: ROOM_D, y1: ROOM_D },
    ...CABINS.map(([x]): Opening => ({ kind: "door", x0: x + 0.2, x1: x + 0.2 + DOOR_W, y0: ROOM_D, y1: ROOM_D })),
  ];
}

const length = (r: Rect) => r.x1 - r.x0 + (r.y1 - r.y0);

/** Counted from what is drawn. Walls: inner face of the outer walls plus both faces of solid partitions, less openings. */
export function quantities(items: Item[], glass: number) {
  const seats = (s: Item["seat"]) => items.reduce((a, i) => a + (i.seat === s ? (i.seats ?? 1) : 0), 0);
  const ws = walls(glass);
  const os = openings(glass);
  const total = (k: Wall["kind"]) => ws.reduce((a, w) => a + (w.kind === k ? length(w) : 0), 0);
  const open = (k: Opening["kind"], h: number) => os.reduce((a, o) => a + (o.kind === k ? length(o) * h : 0), 0);
  return {
    desks: seats("desk"),
    meeting: seats("meeting"),
    lounge: seats("lounge"),
    floor: W * D,
    glass: total("glass") - open("door", 1), // every door is in a glass front
    wall: total("outer") * H - open("window", WINDOW_H) - open("entrance", DOOR_H) + 2 * total("solid") * H,
  };
}
