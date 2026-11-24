/**
 * Furniture models for the office in 3D: the models of the anthemius.io hero room, plus the pieces an
 * office needs. Positions and sizes come from office-model.ts.
 *
 *   local frame: origin at the footprint centre on the floor, y up,
 *   the FRONT of the piece faces +z, its width runs along x.
 */

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { D, W, type Item } from "./office-model";

export type FurnMats = Record<
  "wood" | "dark" | "light" | "stone" | "rug" | "brass" | "leg" | "screen" | "bulb" | "cord" | "metal" | "walnut" | "upholstery" | "mesh" | "armchair" | "felt" | "pot" | "leaf",
  THREE.MeshStandardMaterial
> & { books: THREE.MeshStandardMaterial[] };

const wx = (x: number) => x - W / 2;
const wz = (y: number) => y - D / 2;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Small builder: every mesh casts and receives shadows; geometries are collected for disposal. */
class Kit {
  g = new THREE.Group();
  constructor(public geos: THREE.BufferGeometry[]) {}
  private put(geo: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, cast = true) {
    this.geos.push(geo);
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, y, z);
    mesh.castShadow = cast;
    mesh.receiveShadow = true;
    this.g.add(mesh);
    return mesh;
  }
  /** box by size, centred at (x, y, z); `r` rounds the edges */
  box(w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number, r = 0) {
    const rr = Math.min(r, w / 2.2, h / 2.2, d / 2.2);
    const geo = rr > 0.002 ? new RoundedBoxGeometry(w, h, d, 1, rr) : new THREE.BoxGeometry(w, h, d);
    return this.put(geo, m, x, y, z);
  }
  /** box from floor-up extents: bottom y0 to top y1 */
  slab(w: number, y0: number, y1: number, d: number, m: THREE.Material, x: number, z: number, r = 0) {
    return this.box(w, y1 - y0, d, m, x, (y0 + y1) / 2, z, r);
  }
  cyl(rTop: number, rBot: number, y0: number, y1: number, m: THREE.Material, x: number, z: number, seg = 12) {
    return this.put(new THREE.CylinderGeometry(rTop, rBot, y1 - y0, seg), m, x, (y0 + y1) / 2, z);
  }
  sphere(r: number, m: THREE.Material, x: number, y: number, z: number, cast = true) {
    return this.put(new THREE.SphereGeometry(r, 8, 6), m, x, y, z, cast);
  }
}

/* ── seating ────────────────────────────────────────────────────────────── */

/** Sofa or armchair: plinth on short legs, seat + back cushions, rolled arms. */
function upholstered(k: Kit, w: number, d: number, h: number, cover: THREE.Material, legM: THREE.Material, seats: number) {
  const arm = w > 1.2 ? 0.17 : 0.13;
  const legH = seats > 1 ? 0.08 : 0.13;
  const baseTop = legH + 0.17;
  const seatTop = baseTop + 0.15;
  const inner = w - arm * 2;
  // legs
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) k.cyl(0.018, 0.012, 0, legH, legM, sx * (w / 2 - 0.07), sz * (d / 2 - 0.07), 10);
  // plinth
  k.slab(w - 0.02, legH, baseTop, d - 0.02, cover, 0, 0, 0.04);
  // arms
  for (const sx of [-1, 1]) k.slab(arm, legH, h - 0.22, d, cover, sx * (w / 2 - arm / 2), 0, 0.06);
  // seat cushions
  const cw = inner / seats;
  for (let i = 0; i < seats; i++) {
    const x = -inner / 2 + cw * (i + 0.5);
    k.slab(cw - 0.012, baseTop - 0.01, seatTop, d - 0.26, cover, x, 0.11, 0.05);
    // back cushions, leaning back a touch
    const back = k.slab(cw - 0.02, seatTop - 0.02, h, 0.2, cover, x, -d / 2 + 0.14, 0.07);
    back.rotation.x = -0.12;
  }
  // back frame behind the cushions
  k.slab(w - 0.02, baseTop, h - 0.06, 0.1, cover, 0, -d / 2 + 0.05, 0.04);
}

/** Office chair: five-star base on casters, gas lift, seat, tilted mesh back. */
function taskChair(k: Kit, w: number, d: number, m: FurnMats) {
  const r = Math.min(w, d) / 2 - 0.02;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const spoke = k.box(r, 0.03, 0.04, m.metal, Math.cos(a) * r * 0.5, 0.07, Math.sin(a) * r * 0.5, 0.01);
    spoke.rotation.y = -a;
    k.sphere(0.025, m.metal, Math.cos(a) * r * 0.95, 0.025, Math.sin(a) * r * 0.95);
  }
  k.cyl(0.03, 0.03, 0.07, 0.4, m.metal, 0, 0, 12);
  k.slab(0.48, 0.4, 0.48, 0.46, m.mesh, 0, 0.02, 0.04);
  const back = k.slab(0.44, 0.56, 1.02, 0.05, m.mesh, 0, -0.22, 0.03);
  back.rotation.x = -0.1;
  k.slab(0.06, 0.44, 0.58, 0.04, m.metal, 0, -0.23);
  for (const sx of [-1, 1]) {
    k.slab(0.03, 0.48, 0.64, 0.03, m.metal, sx * 0.24, -0.02);
    k.slab(0.06, 0.64, 0.67, 0.24, m.upholstery, sx * 0.24, 0.02, 0.012);
  }
}

/* ── tables + desks ─────────────────────────────────────────────────────── */

function coffeeTable(k: Kit, w: number, d: number, h: number, top: THREE.Material, m: FurnMats) {
  k.slab(w, h - 0.05, h, d, top, 0, 0, 0.02);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) k.cyl(0.014, 0.014, 0, h - 0.05, m.metal, sx * (w / 2 - 0.08), sz * (d / 2 - 0.08), 10);
  k.slab(w - 0.2, 0.1, 0.12, d - 0.2, m.walnut, 0, 0, 0.01); // lower shelf
}

function trestleTable(k: Kit, w: number, d: number, h: number, top: THREE.Material, base: THREE.Material) {
  k.slab(w, h - 0.04, h, d, top, 0, 0, 0.012);
  for (const sx of [-1, 1]) {
    const x = sx * (w / 2 - 0.22);
    k.slab(0.06, 0, h - 0.04, d - 0.24, base, x, 0, 0.012); // leg panel
    k.slab(0.08, 0, 0.03, d - 0.12, base, x, 0); // foot
  }
  k.slab(w - 0.5, h - 0.14, h - 0.1, 0.04, base, 0, 0); // stretcher
}

/* ── storage ────────────────────────────────────────────────────────────── */

/** Low cabinet with door fronts and brass pulls: TV unit, credenza. */
function cabinet(k: Kit, w: number, d: number, h: number, body: THREE.Material, top: THREE.Material, m: FurnMats, doors: number) {
  const legH = 0.1;
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) k.cyl(0.015, 0.011, 0, legH, m.walnut, sx * (w / 2 - 0.06), sz * (d / 2 - 0.06), 10);
  k.slab(w, legH, h - 0.03, d, body, 0, 0, 0.012);
  k.slab(w + 0.01, h - 0.03, h, d + 0.01, top, 0, 0, 0.006);
  const dw = w / doors;
  for (let i = 1; i < doors; i++) k.slab(0.005, legH + 0.02, h - 0.05, 0.004, m.leg, -w / 2 + dw * i, d / 2 + 0.001);
  for (let i = 0; i < doors; i++) {
    const x = -w / 2 + dw * (i + 0.5) + (i % 2 ? -dw * 0.32 : dw * 0.32);
    k.slab(0.012, (legH + h) / 2 - 0.05, (legH + h) / 2 + 0.05, 0.02, m.brass, x, d / 2 + 0.01);
  }
}

/** Open bookcase: sides, shelves, back, books and a vase. */
function bookcase(k: Kit, w: number, d: number, h: number, frame: THREE.Material, m: FurnMats, seed: number) {
  const t = 0.025;
  for (const sx of [-1, 1]) k.slab(t, 0, h, d, frame, sx * (w / 2 - t / 2), 0);
  k.slab(w, h - t, h, d, frame, 0, 0);
  k.slab(w - 2 * t, 0, 0.06, d, frame, 0, 0);
  k.slab(w - 2 * t, 0.06, h - t, 0.012, frame, 0, -d / 2 + 0.006);
  const shelves = 4;
  const r = rng(seed);
  for (let s = 0; s < shelves; s++) {
    const y = 0.06 + ((h - 0.06 - t) * s) / shelves;
    if (s > 0) k.slab(w - 2 * t, y - 0.012, y + 0.012, d - 0.02, frame, 0, 0.01);
    // a run of books along the shelf (the long side), sometimes a vase
    let x = -w / 2 + t + 0.02;
    const end = w / 2 - t - 0.02;
    while (x < end - 0.05) {
      if (r() < 0.12) {
        k.cyl(0.035, 0.05, y + 0.012, y + 0.2, m.light, x + 0.05, 0.02, 16);
        x += 0.14;
        continue;
      }
      const bw = 0.025 + r() * 0.03;
      const bh = 0.17 + r() * 0.1;
      k.slab(bw, y + 0.012, y + 0.012 + bh, d * 0.7, m.books[Math.floor(r() * m.books.length)], x + bw / 2, 0.01);
      x += bw + 0.003;
      if (r() < 0.08) x += 0.08;
    }
  }
}

/* ── screens, plant, rug ────────────────────────────────────────────────── */

function screen(k: Kit, w: number, y0: number, y1: number, m: FurnMats, stand: boolean) {
  k.slab(w, y0, y1, 0.035, m.leg, 0, 0, 0.01);
  k.box(w - 0.03, y1 - y0 - 0.03, 0.004, m.screen, 0, (y0 + y1) / 2, 0.019);
  if (stand) {
    k.slab(0.05, y0 - 0.08, y0 + 0.06, 0.03, m.metal, 0, -0.03);
    k.slab(0.22, y0 - 0.085, y0 - 0.075, 0.16, m.metal, 0, -0.01, 0.004);
  }
}

function plant(k: Kit, w: number, d: number, y0: number, y1: number, m: FurnMats, seed: number) {
  const r = rng(seed);
  const reach = Math.min(w, d) * 0.75;
  k.cyl(0.008, 0.012, y0 - 0.04, y0 + (y1 - y0) * 0.45, m.walnut, 0, 0, 6);
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 + r() * 0.4;
    const lift = y0 + (y1 - y0) * (0.3 + r() * 0.6);
    const leaf = k.sphere(1, m.leaf, Math.cos(a) * reach * 0.5, lift, Math.sin(a) * reach * 0.5);
    leaf.scale.set(0.06, 0.016, 0.22 + r() * 0.08);
    leaf.rotation.set(-0.5 - r() * 0.4, -a + Math.PI / 2, 0);
  }
}

function pot(k: Kit, w: number, d: number, h: number, m: FurnMats) {
  const r = Math.min(w, d) / 2;
  k.cyl(r, r * 0.78, 0, h, m.pot, 0, 0, 28);
  k.cyl(r * 0.9, r * 0.9, h - 0.012, h - 0.004, m.walnut, 0, 0, 28); // soil
}

function rug(k: Kit, w: number, d: number, m: FurnMats) {
  const border = k.slab(w, 0, 0.008, d, m.walnut, 0, 0);
  border.castShadow = false;
  const field = k.slab(w - 0.12, 0.002, 0.012, d - 0.12, m.rug, 0, 0);
  field.castShadow = false;
}

function pendant(k: Kit, w: number, y0: number, y1: number, ceiling: number, m: FurnMats) {
  k.cyl(0.004, 0.004, y1, ceiling, m.cord, 0, 0, 6).castShadow = false;
  const shade = k.cyl(0.06, w / 2, y0, y1, m.brass, 0, 0, 32);
  shade.castShadow = false;
  k.cyl(0.03, 0.03, y1 - 0.01, y1 + 0.03, m.brass, 0, 0, 16).castShadow = false;
  k.sphere(0.05, m.bulb, 0, y0 + 0.05, 0, false);
}

/* ── office pieces ──────────────────────────────────────────────────────── */

/** Bench desk: oak top, metal frame, felt screen on the far edge, monitor and keyboard. */
function workstation(k: Kit, w: number, d: number, m: FurnMats, divider: boolean) {
  const h = 0.74;
  k.slab(w - 0.01, h - 0.03, h, d - 0.01, m.wood, 0, 0, 0.008);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) k.slab(0.045, 0, h - 0.03, 0.045, m.metal, sx * (w / 2 - 0.06), sz * (d / 2 - 0.07));
    k.slab(0.04, h - 0.08, h - 0.03, d - 0.14, m.metal, sx * (w / 2 - 0.06), 0);
  }
  if (divider) k.slab(w - 0.06, h, h + 0.32, 0.025, m.felt, 0, -d / 2 + 0.02, 0.01);
  const s = new Kit(k.geos);
  screen(s, 0.58, 0.86, 1.2, m, true);
  s.g.position.set(0, 0, -d / 2 + 0.17);
  k.g.add(s.g);
  k.slab(0.42, h, h + 0.018, 0.13, m.dark, 0, 0.1, 0.006);
  k.slab(0.06, h, h + 0.02, 0.1, m.dark, 0.32, 0.1, 0.01);
  k.slab(0.3, 0.08, 0.6, 0.46, m.stone, w / 2 - 0.26, 0.02, 0.012); // pedestal
}

function receptionDesk(k: Kit, w: number, d: number, m: FurnMats) {
  k.slab(w, 0, 1.06, 0.08, m.wood, 0, -d / 2 + 0.04, 0.01);
  for (const sx of [-1, 1]) k.slab(0.06, 0, 1.06, d, m.wood, sx * (w / 2 - 0.03), 0, 0.01);
  k.slab(w + 0.06, 1.06, 1.1, 0.3, m.stone, 0, -d / 2 + 0.12, 0.01);
  k.slab(w - 0.1, 0.72, 0.75, d - 0.06, m.light, 0, 0.02);
  const s = new Kit(k.geos);
  screen(s, 0.5, 0.86, 1.16, m, true);
  s.g.position.set(0.3, 0, -0.06);
  k.g.add(s.g);
}

function pantryCounter(k: Kit, w: number, d: number, m: FurnMats) {
  cabinet(k, w, d, 0.9, m.light, m.stone, m, 5);
  k.slab(0.5, 0.895, 0.906, 0.36, m.metal, -w / 2 + 0.55, 0.02, 0.02); // sink
  k.cyl(0.012, 0.012, 0.9, 1.18, m.metal, -w / 2 + 0.55, -0.2, 10);
  k.slab(0.5, 0.9, 0.908, 0.4, m.dark, w / 2 - 0.6, 0, 0.01); // hob
  k.slab(0.26, 0.9, 1.26, 0.3, m.dark, 0.1, -0.06, 0.03); // coffee machine
  for (let i = 0; i < 3; i++) k.cyl(0.04, 0.03, 0.9, 0.99, m.stone, 0.42 + i * 0.12, 0, 14);
}

function stool(k: Kit, w: number, m: FurnMats) {
  const r = w / 2;
  k.cyl(r, r * 0.94, 0.56, 0.62, m.wood, 0, 0, 24);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.78;
    k.cyl(0.014, 0.014, 0, 0.56, m.metal, Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7, 8);
  }
}

const FACE: Record<string, [number, number]> = { n: [0, 1], s: [0, -1], w: [1, 0], e: [-1, 0] };

function build(it: Item, idx: number, m: FurnMats, geos: THREE.BufferGeometry[]): THREE.Group {
  // seats face away from their backrest, desks away from their screen
  const [fx, fy] = it.back ? FACE[it.back] : it.kind === "cabinet" ? [1, 0] : it.kind === "counter" && it.y1 - it.y0 > it.x1 - it.x0 ? [-1, 0] : [0, 1];
  const turned = fx !== 0;
  const w = turned ? it.y1 - it.y0 : it.x1 - it.x0;
  const d = turned ? it.x1 - it.x0 : it.y1 - it.y0;
  const k = new Kit(geos);
  switch (it.kind) {
    case "desk":
      workstation(k, w, d, m, !it.id.startsWith("k"));
      break;
    case "chair":
      taskChair(k, w, d, m);
      break;
    case "sofa":
      upholstered(k, w, d, 0.82, m.upholstery, m.walnut, it.seats ?? 3);
      break;
    case "armchair":
      upholstered(k, w, d, 0.78, m.armchair, m.walnut, 1);
      break;
    case "table":
      if (it.id.startsWith("lt")) coffeeTable(k, w, d, 0.36, m.wood, m);
      else if (it.id.startsWith("pt")) trestleTable(k, d, w, 0.92, m.wood, m.metal);
      else trestleTable(k, w, d, 0.74, m.wood, m.metal);
      if (it.id.startsWith("pt")) k.g.rotation.y = Math.PI / 2;
      break;
    case "counter":
      if (it.id.startsWith("rd")) receptionDesk(k, w, d, m);
      else pantryCounter(k, w, d, m);
      break;
    case "cabinet":
      bookcase(k, w, d, 1.75, m.wood, m, idx + 3);
      break;
    case "stool":
      stool(k, w, m);
      break;
    case "plant":
      pot(k, w * 0.9, d * 0.9, 0.42, m);
      plant(k, w, d, 0.42, 1.35, m, idx + 7);
      break;
    case "wc":
      k.slab(w * 0.9, 0.42, 0.95, 0.2, m.stone, 0, -d / 2 + 0.1, 0.03); // cistern
      k.cyl(w * 0.42, w * 0.3, 0, 0.4, m.stone, 0, 0.08, 24);
      k.cyl(w * 0.44, w * 0.44, 0.4, 0.44, m.light, 0, 0.08, 24);
      break;
    case "basin":
      k.slab(w, 0.2, 0.8, d, m.wood, 0, 0, 0.01);
      k.slab(w, 0.8, 0.86, d, m.stone, 0, 0, 0.02);
      k.cyl(0.01, 0.01, 0.86, 1.05, m.metal, 0, -d / 2 + 0.06, 8);
      break;
    case "rug":
      rug(k, w, d, m);
      break;
  }
  k.g.position.set(wx((it.x0 + it.x1) / 2), 0, wz((it.y0 + it.y1) / 2));
  k.g.rotation.y += Math.atan2(fx, fy);
  return k.g;
}

/** Where pendant lights hang: over the meeting table, the lounge and the pantry table. */
export function pendantSpots(items: Item[]): [number, number][] {
  return ["mt", "lt", "pt", "ct"]
    .flatMap((p) => items.filter((i) => i.kind === "table" && i.id.startsWith(p)))
    .map((i) => [(i.x0 + i.x1) / 2, (i.y0 + i.y1) / 2]);
}

type Part = { mat: THREE.Material; cast: boolean; geo: THREE.BufferGeometry };
/** Each model is built once per scene and size; sixty identical chairs are one chair, placed sixty times. */
const models = new WeakMap<FurnMats, Map<string, Part[]>>();

/** One merged geometry per material, in the object's own space. */
function flatten(root: THREE.Object3D): Part[] {
  root.updateMatrixWorld(true);
  const groups = new Map<string, { mat: THREE.Material; cast: boolean; list: THREE.BufferGeometry[] }>();
  root.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    const mat = o.material as THREE.Material;
    const key = `${mat.uuid}${o.castShadow}`;
    let e = groups.get(key);
    if (!e) groups.set(key, (e = { mat, cast: o.castShadow, list: [] }));
    const g = (o.geometry as THREE.BufferGeometry).index ? o.geometry.toNonIndexed() : o.geometry.clone();
    g.deleteAttribute("uv"); // furniture has no textures
    e.list.push(g.applyMatrix4(o.matrixWorld));
  });
  const out: Part[] = [];
  for (const { mat, cast, list } of groups.values()) {
    const geo = list.length > 1 ? mergeGeometries(list) : list[0];
    if (geo) out.push({ mat, cast, geo });
  }
  return out;
}

const SPECIAL = ["lt", "pt", "rd", "k"];

/** All the furniture, merged into one mesh per material so the whole office is a handful of draw calls. */
export function buildFurniture(items: Item[], m: FurnMats, ceiling: number): { group: THREE.Group; geos: THREE.BufferGeometry[] } {
  let cache = models.get(m);
  if (!cache) models.set(m, (cache = new Map()));
  const place: { parts: Part[]; at: THREE.Matrix4 }[] = [];
  const scratch: THREE.BufferGeometry[] = [];
  const model = (key: string, make: () => THREE.Object3D) => {
    let parts = cache.get(key);
    if (!parts) {
      parts = flatten(make());
      scratch.splice(0).forEach((g) => g.dispose());
      cache.set(key, parts);
    }
    return parts;
  };
  items.forEach((it, i) => {
    const w = (it.x1 - it.x0).toFixed(2);
    const d = (it.y1 - it.y0).toFixed(2);
    const kind = SPECIAL.find((p) => it.id.startsWith(p)) ?? "";
    const at = new THREE.Vector3(wx((it.x0 + it.x1) / 2), 0, wz((it.y0 + it.y1) / 2));
    const parts = model([it.kind, kind, it.back ?? "", w, d, it.seats ?? ""].join(":"), () => {
      const g = build(it, i, m, scratch);
      g.position.set(0, 0, 0);
      return g;
    });
    place.push({ parts, at: new THREE.Matrix4().setPosition(at) });
  });
  for (const [x, y] of pendantSpots(items)) {
    const parts = model("pendant", () => {
      const k = new Kit(scratch);
      pendant(k, 0.44, 1.9, 2.14, ceiling, m);
      return k.g;
    });
    place.push({ parts, at: new THREE.Matrix4().makeTranslation(wx(x), 0, wz(y)) });
  }
  const byMat = new Map<string, { mat: THREE.Material; cast: boolean; list: THREE.BufferGeometry[] }>();
  for (const { parts, at } of place)
    for (const p of parts) {
      const key = `${p.mat.uuid}${p.cast}`;
      let e = byMat.get(key);
      if (!e) byMat.set(key, (e = { mat: p.mat, cast: p.cast, list: [] }));
      e.list.push(p.geo.clone().applyMatrix4(at));
    }
  const group = new THREE.Group();
  const geos: THREE.BufferGeometry[] = [];
  for (const { mat, cast, list } of byMat.values()) {
    const geo = mergeGeometries(list);
    if (!geo) continue;
    geos.push(geo);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = cast;
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  return { group, geos };
}
