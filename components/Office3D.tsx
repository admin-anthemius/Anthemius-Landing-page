"use client";

/**
 * The office in 3D. Same data as the plan (office-model.ts), rendered the way the
 * anthemius.io hero room is: ACES tone mapping, soft shadows that only furniture casts, a uniform
 * environment, the editor's "Day" lights and a plan-to-3D unfold.
 *
 * Loaded with next/dynamic when 3D is first opened; the SVG plan stays up until the first frame.
 */

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { Dict } from "@/lib/content";
import { buildFurniture, type FurnMats } from "@/lib/office-furniture3d";
import {
  CABIN_X,
  D as OFFICE_D,
  DOOR_H,
  GLASS_MAX,
  GLASS_MIN,
  H,
  PANTRY,
  ROOM_D,
  W as OFFICE_W,
  openings as officeOpenings,
  snapGlass,
  walls as officeWalls,
  type Item,
  type Opening,
  type Rect,
  type Wall,
} from "@/lib/office-model";
import type { Plan } from "@/lib/office-showcase";
import { carpetTexture, clamp, concreteTexture, ease, plankTexture, skyTexture, terrazzoTexture } from "@/lib/office-scene-kit";
import styles from "./OfficePlan.module.css";

const T = 0.14; // outer wall thickness
const SILL = 0.25;
const HEAD = 2.35;
const ORBIT_FOV = 42;
const TOP_FOV = 30;
const INTRO_MS = 1000;
const ZOOM_MAX = 2.5;
const TURN_MS = 1400;
const SHOW = 0.1; // wall height already standing when the unfold starts (reads as the plan's walls)

type Props = {
  active: boolean;
  /** A fixed office to show instead of the hero's adjustable one. Read once, when the scene is built. */
  plan?: Plan;
  glass: number;
  items: Item[];
  t: Dict["office"];
  onGlass: (v: number) => void;
  onGlassStart: () => void;
  onGlassEnd: () => void;
  onKey: (e: React.KeyboardEvent) => void;
  glassText: string;
  onReady: () => void;
  onFail: () => void;
};

type Ctx = {
  setOffice: (items: Item[], glass: number) => void;
  setActive: (on: boolean) => void;
  zoomBy: (f: number) => void;
  pick: (x: number, y: number) => number | null;
};

/** The openings that sit in a wall, in order along it. */
function inWall(w: Wall, os: Opening[]) {
  const across = w.y0 === w.y1;
  const span = (r: Rect): [number, number] => (across ? [r.x0, r.x1] : [r.y0, r.y1]);
  const line = across ? w.y0 : w.x0;
  const [a, b] = span(w);
  const list = os
    .filter((o) => (o.y0 === o.y1) === across && (across ? o.y0 : o.x0) === line && span(o)[0] >= a - 1e-6 && span(o)[1] <= b + 1e-6)
    .map((o) => ({ kind: o.kind, p: span(o)[0], q: span(o)[1] }))
    .sort((m, n) => m.p - n.p);
  return { across, line, a, b, list };
}

export default function Office3D(props: Readonly<Props>) {
  const { active, glass, items, t } = props;
  const mountRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const ctx = useRef<Ctx | null>(null);
  const cb = useRef(props);
  const dragging = useRef(false);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    cb.current = props;
  });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const fixed = cb.current.plan;
    const W = fixed?.w ?? OFFICE_W;
    const D = fixed?.d ?? OFFICE_D;
    const wx = (x: number) => x - W / 2;
    const wz = (y: number) => y - D / 2;
    const openings = (gl: number) => fixed?.openings ?? officeOpenings(gl);
    const wallList = (gl: number) => fixed?.walls ?? officeWalls(gl);
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      cb.current.onFail();
      return;
    }
    // small touch screens: fewer pixels to draw, no visible difference at that size
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.5 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.style.cssText = "display:block;width:100%;height:100%;touch-action:pan-y";
    mount.appendChild(canvas);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(ORBIT_FOV, 1, 0.05, 120);
    const target = new THREE.Vector3(0.1, 0.2, 0.15);
    const trash: { dispose: () => void }[] = [];

    /* light: uniform fill, high sun, soft counter-fill */
    // an even fill the same from every side, as the editor's uniform environment, without building a reflection map
    scene.add(new THREE.AmbientLight(0xffffff, 0.95));
    scene.add(new THREE.HemisphereLight(0xffffff, 0x70777f, 0.75));
    const sun = new THREE.DirectionalLight(0xfff3e0, 2.5);
    const el = THREE.MathUtils.degToRad(74);
    const az = THREE.MathUtils.degToRad(125);
    sun.position.set(Math.cos(el) * Math.cos(az) * 26, Math.sin(el) * 26, -Math.cos(el) * Math.sin(az) * 26);
    sun.castShadow = true;
    sun.shadow.mapSize.setScalar(window.innerWidth < 700 ? 1024 : 2048);
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.02;
    sun.shadow.radius = 4;
    Object.assign(sun.shadow.camera, { left: -W * 0.64, right: W * 0.64, top: W * 0.64, bottom: -W * 0.64, near: 1, far: 60 });
    scene.add(sun, sun.target);
    const fill = new THREE.DirectionalLight(0xffffff, 0.25);
    fill.position.set(-sun.position.x, 6, -sun.position.z);
    scene.add(fill, new THREE.AmbientLight(0xfff2dd, 0.12));

    /* materials */
    const std = (color: string, roughness: number, metalness = 0) => {
      const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
      trash.push(m);
      return m;
    };
    const mats: FurnMats = {
      wood: std("#c99d66", 0.55),
      dark: std("#2b2a2a", 0.6),
      light: std("#efeae1", 0.7),
      stone: std("#e8e4de", 0.4),
      rug: std("#ede6da", 1),
      brass: std("#e2b56a", 0.32, 0.55),
      leg: std("#2b2622", 0.5, 0.2),
      screen: std("#16181c", 0.22, 0.1),
      bulb: std("#fff4dc", 0.6),
      cord: std("#1d1d1d", 0.6),
      metal: std("#202124", 0.38, 0.65),
      walnut: std("#6b4a33", 0.55),
      upholstery: std("#66704f", 0.96),
      mesh: std("#4a4f55", 0.9),
      armchair: std("#b5573a", 0.95),
      felt: std("#8e9a86", 1),
      pot: std("#d9d2c7", 0.8),
      leaf: std("#5f8a55", 0.75),
      books: ["#8a3822", "#1f4a47", "#c79a4b", "#e8e1d4", "#3d4552", "#9caf94"].map((h) => std(h, 0.85)),
    };
    mats.bulb.emissive.set("#ffd79a");
    mats.bulb.emissiveIntensity = 2.2;
    mats.leaf.flatShading = true;
    mats.brass.side = THREE.DoubleSide;
    const tex = { concrete: concreteTexture(), plank: plankTexture(), carpet: carpetTexture(), tile: terrazzoTexture(), sky: skyTexture() };
    for (const x of Object.values(tex)) x.anisotropy = renderer.capabilities.getMaxAnisotropy();
    trash.push(...Object.values(tex));
    const concrete = std("#cdc8bf", 0.45);
    concrete.map = tex.concrete;
    const carpet = std("#d0cdc8", 1);
    carpet.map = tex.carpet;
    const timber = std("#ddb57c", 0.62);
    timber.map = tex.plank;
    const tile = std("#e6e1d8", 0.35);
    tile.map = tex.tile;
    const feature = std("#1f4a47", 0.92); // the website room's teal
    const plaster = std("#dfe2e5", 0.92); // the editor's wall grey, a touch lighter for this smaller view
    const side = plaster;
    const skirt = std("#e6e8ea", 0.7);
    const joinery = std("#c2a980", 0.84); // window and door frames: pale oak
    const door = std("#cdb794", 0.8);
    const handle = std("#26262a", 0.42, 0.3);
    const frame = std("#2a2b2d", 0.45, 0.3);
    const accent = std("#8a3822", 0.5);
    const plinthMat = std("#edeff1", 1);
    const glassMat = new THREE.MeshStandardMaterial({ color: "#cfe0ee", roughness: 0.05, transparent: true, opacity: 0.22, depthWrite: false });
    const skyMat = new THREE.MeshBasicMaterial({ map: tex.sky, toneMapped: false });
    trash.push(glassMat, skyMat);

    const unit = new THREE.BoxGeometry(1, 1, 1);
    trash.push(unit);
    const box = (to: THREE.Group, m: THREE.Material, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => {
      const mesh = new THREE.Mesh(unit, m);
      mesh.position.set(wx((x0 + x1) / 2), (z0 + z1) / 2, wz((y0 + y1) / 2));
      mesh.scale.set(Math.max(1e-3, x1 - x0), Math.max(1e-3, z1 - z0), Math.max(1e-3, y1 - y0));
      mesh.receiveShadow = m !== glassMat && m !== skyMat;
      to.add(mesh);
      return mesh;
    };

    /* floors */
    const ground = new THREE.Group();
    scene.add(ground);
    const floorGeos: THREE.BufferGeometry[] = [];
    const floorPlane = (to: THREE.Group, m: THREE.Material, r: Rect, z: number, size: number, keep: THREE.BufferGeometry[]) => {
      const g = new THREE.PlaneGeometry(r.x1 - r.x0, r.y1 - r.y0);
      const uv = g.attributes.uv as THREE.BufferAttribute;
      for (let i = 0; i < uv.count; i++)
        uv.setXY(i, (uv.getX(i) * (r.x1 - r.x0) + r.x0) / size, (uv.getY(i) * (r.y1 - r.y0) + r.y0) / size);
      keep.push(g);
      const mesh = new THREE.Mesh(g, m);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(wx((r.x0 + r.x1) / 2), z, wz((r.y0 + r.y1) / 2));
      mesh.receiveShadow = true;
      to.add(mesh);
    };
    floorPlane(ground, concrete, { x0: 0, x1: W, y0: 0, y1: D }, 0, 1.6, floorGeos);
    if (fixed) {
      const finish = { carpet: [carpet, 1], tile: [tile, 1.6], wood: [timber, 1.2] } as const;
      for (const f of fixed.floors) floorPlane(ground, finish[f.finish][0], f.r, 0.004, finish[f.finish][1], floorGeos);
    } else {
      floorPlane(ground, carpet, { x0: CABIN_X, x1: W, y0: 0, y1: ROOM_D }, 0.004, 1, floorGeos);
      floorPlane(ground, tile, PANTRY, 0.004, 1.6, floorGeos);
    }
    box(ground, plinthMat, -T - 0.3, W + T + 0.3, -T - 0.3, D + T + 0.3, -0.35, -0.004);

    /* walls that stand; everything in here rises during the unfold */
    const standing = new THREE.Group();
    scene.add(standing);
    const low = new THREE.Group(); // the two nearest walls, cut down so the office can be seen
    const moving = new THREE.Group(); // the meeting room's glass, rebuilt when it moves
    standing.add(low, moving);

    /** A box given along a wall: p..q along it, n0..n1 across it. */
    const along = (to: THREE.Group, across: boolean, m: THREE.Material, p: number, q: number, n0: number, n1: number, z0: number, z1: number) =>
      across ? box(to, m, p, q, n0, n1, z0, z1) : box(to, m, n0, n1, p, q, z0, z1);

    const outer = (to: THREE.Group, w: Wall, m: THREE.Material) => {
      const { across, line, a, b, list } = inWall(w, openings(4));
      const out = line === 0 ? -1 : 1;
      const n0 = out < 0 ? line - T : line;
      const n1 = n0 + T;
      const mid = line + (out * T) / 2;
      let at = a - T;
      for (const o of list) {
        along(to, across, m, at, o.p, n0, n1, 0, H);
        at = o.q;
        const entrance = o.kind === "entrance";
        const z0 = entrance ? 0 : SILL;
        const z1 = entrance ? DOOR_H : HEAD;
        if (!entrance) along(to, across, m, o.p, o.q, n0, n1, 0, SILL);
        along(to, across, m, o.p, o.q, n0, n1, z1, H);
        const f = 0.05;
        const bars: [number, number, number, number][] = [
          [o.p, o.p + f, z0, z1],
          [o.q - f, o.q, z0, z1],
          [(o.p + o.q) / 2 - f / 2, (o.p + o.q) / 2 + f / 2, z0, z1],
          [o.p, o.q, z0, z0 + f],
          [o.p, o.q, z1 - f, z1],
        ];
        for (const [p, q, r0, r1] of bars) along(to, across, joinery, p, q, mid - 0.045, mid + 0.045, r0, r1);
        along(to, across, glassMat, o.p, o.q, mid - 0.005, mid + 0.005, z0, z1);
        if (out < 0) {
          const sky = line + out * (T + 0.05);
          along(to, across, skyMat, o.p - 0.1, o.q + 0.1, sky - 0.005, sky + 0.005, Math.max(0, z0 - 0.1), z1 + 0.1);
        }
      }
      along(to, across, m, at, b + T, n0, n1, 0, H);
      const s0 = out < 0 ? line : line - 0.015;
      let sk = a;
      for (const o of list.filter((x) => x.kind === "entrance")) {
        along(to, across, skirt, sk, o.p, s0, s0 + 0.015, 0, 0.09);
        sk = o.q;
      }
      along(to, across, skirt, sk, b, s0, s0 + 0.015, 0, 0.09);
    };

    const glazed = (to: THREE.Group, w: Wall, gl: number) => {
      const { across, line, a, b, list } = inWall(w, openings(gl));
      const f = 0.05;
      const pane = (p: number, q: number) => {
        if (q - p < 0.03) return;
        along(to, across, frame, p, q, line - f / 2, line + f / 2, 0, 0.1);
        along(to, across, frame, p, q, line - f / 2, line + f / 2, H - 0.06, H);
        const n = Math.max(1, Math.round((q - p) / 1.1));
        for (let i = 0; i <= n; i++) {
          const c = p + ((q - p) * i) / n;
          along(to, across, frame, clamp(c - f / 2, p, q - f), clamp(c + f / 2, p + f, q), line - f / 2, line + f / 2, 0, H);
        }
        along(to, across, glassMat, p, q, line - 0.008, line + 0.008, 0.1, H - 0.06);
      };
      let at = a;
      for (const o of list) {
        pane(at, o.p);
        along(to, across, joinery, o.p - 0.06, o.p, line - 0.06, line + 0.06, 0, DOOR_H + 0.06);
        along(to, across, joinery, o.q, o.q + 0.06, line - 0.06, line + 0.06, 0, DOOR_H + 0.06);
        along(to, across, joinery, o.p, o.q, line - 0.06, line + 0.06, DOOR_H, DOOR_H + 0.06);
        along(to, across, frame, o.p, o.q, line - f / 2, line + f / 2, H - 0.06, H);
        along(to, across, glassMat, o.p, o.q, line - 0.008, line + 0.008, DOOR_H + 0.06, H - 0.06);
        // the leaf, standing open into the corridor
        if (across) {
            box(to, door, o.p, o.p + 0.045, line, line + 0.86, 0.02, DOOR_H - 0.02);
          box(to, handle, o.p + 0.045, o.p + 0.075, line + 0.72, line + 0.745, 0.85, 1.25);
        }
        at = o.q;
      }
      pane(at, b);
    };

    const ws = wallList(4);
    for (const w of ws) {
      if (w.kind === "outer") {
        if (w.y1 === 0) outer(standing, w, plaster);
        else if (w.x1 === 0) outer(standing, w, side);
        else {
          const { across, line, a, b } = inWall(w, []);
          if (fixed) outer(standing, w, plaster); // a whole building, as in the editor
          else along(low, across, plaster, a - T, b + T, line, line + T, 0, 0.12);
        }
      } else if (w.kind === "solid") {
        const { across, line, a, b } = inWall(w, []);
        const pantry = !fixed && w.y0 === PANTRY.y0;
        const top = pantry ? 1.35 : H;
        const doors = inWall(w, openings(4)).list.filter((o) => o.kind === "door");
        const cuts = [a, ...doors.flatMap((o) => [o.p, o.q]), b];
        for (const o of doors) {
          along(standing, across, plaster, o.p, o.q, line - 0.05, line + 0.05, DOOR_H, top);
          along(standing, across, joinery, o.p - 0.06, o.p, line - 0.07, line + 0.07, 0, DOOR_H + 0.06);
          along(standing, across, joinery, o.q, o.q + 0.06, line - 0.07, line + 0.07, 0, DOOR_H + 0.06);
          along(standing, across, joinery, o.p, o.q, line - 0.07, line + 0.07, DOOR_H, DOOR_H + 0.06);
          if (across) {
            box(standing, door, o.p, o.p + 0.045, line, line + 0.86, 0.02, DOOR_H - 0.02);
            box(standing, handle, o.p + 0.045, o.p + 0.075, line + 0.72, line + 0.745, 0.85, 1.25);
          }
        }
        for (let i = 0; i < cuts.length; i += 2) {
          along(standing, across, pantry ? feature : plaster, cuts[i], cuts[i + 1], line - 0.05, line + 0.05, 0, top);
        }
      } else if (fixed || w.x0 >= CABIN_X) glazed(standing, w, 4);
    }
    // the feature wall behind the meeting room
    const featurePanel = new THREE.Group();
    standing.add(featurePanel);


    /* the walls that never move: hundreds of boxes become one mesh per material, so they draw in a few calls */
    const fuse = (group: THREE.Group) => {
      const byMat = new Map<THREE.Material, THREE.Mesh[]>();
      for (const c of group.children)
        if (c instanceof THREE.Mesh && c.geometry === unit) {
          const mat = c.material as THREE.Material;
          byMat.set(mat, [...(byMat.get(mat) ?? []), c]);
        }
      for (const [mat, list] of byMat) {
        const parts = list.map((m) => {
          m.updateMatrix();
          return unit.clone().applyMatrix4(m.matrix);
        });
        const geo = mergeGeometries(parts);
        parts.forEach((g) => g.dispose());
        if (!geo) continue;
        trash.push(geo);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.receiveShadow = list[0].receiveShadow;
        group.remove(...list);
        group.add(mesh);
      }
    };
    fuse(standing);
    fuse(low);

    /* what depends on the model: the meeting room, its floor, the furniture */
    let office = new THREE.Group();
    let officeGeos: THREE.BufferGeometry[] = [];
    let movingGeos: THREE.BufferGeometry[] = [];
    const meetingFloor = new THREE.Group();
    scene.add(office, meetingFloor);
    let cur = 0;
    const setOffice = (list: Item[], gl: number) => {
      cur = gl;
      scene.remove(office);
      officeGeos.forEach((g) => g.dispose());
      const built = buildFurniture(list, mats, H);
      office = built.group;
      officeGeos = built.geos;
      // the furniture is built around the hero office's centre
      office.position.set((OFFICE_W - W) / 2, 0, (OFFICE_D - D) / 2);
      scene.add(office);
      moving.clear();
      featurePanel.clear();
      meetingFloor.clear();
      movingGeos.forEach((g) => g.dispose());
      movingGeos = [];
      if (fixed) for (const r of fixed.panels) box(featurePanel, feature, r.x0, r.x1, r.y0, r.y1, 0.09, H);
      else {
        for (const w of wallList(gl)) if (w.kind === "glass" && w.x0 < CABIN_X) glazed(moving, w, gl);
        box(moving, accent, gl - 0.03, gl + 0.03, ROOM_D - 0.06, ROOM_D, 0, H);
        box(featurePanel, feature, 0, 0.012, 0, ROOM_D, 0.09, H);
        floorPlane(meetingFloor, carpet, { x0: 0, x1: gl, y0: 0, y1: ROOM_D }, 0.004, 1, movingGeos);
      }
      renderer.shadowMap.needsUpdate = true;
      invalidate();
    };

    /* camera */
    const home = new THREE.Vector3();
    const frameHome = () => {
      // fit the office to the view: 84% of the tighter side, then centre it
      const corners = [
        [-T, -T, H],
        [W + T, -T, H],
        [-T, D + T, H],
        [W + T, D + T, 0.12],
        // the base reaches past the walls (see the plinth)
        [-T - 0.3, D + T + 0.3, -0.35],
        [W + T + 0.3, D + T + 0.3, -0.35],
        [W + T + 0.3, -T - 0.3, -0.35],
      ].map(([x, y, z]) => new THREE.Vector3(wx(x), z, wz(y)));
      camera.clearViewOffset();
      const probe = new THREE.PerspectiveCamera(ORBIT_FOV, camera.aspect, 0.05, 120);
      const p = new THREE.Vector3();
      let lo = 6;
      let hi = 60;
      let box2 = new THREE.Box2();
      for (let i = 0; i < 24; i++) {
        const dist = (lo + hi) / 2;
        probe.position.setFromSpherical(new THREE.Spherical(dist, THREE.MathUtils.degToRad(47), THREE.MathUtils.degToRad(22))).add(target);
        probe.lookAt(target);
        probe.updateMatrixWorld();
        box2 = new THREE.Box2();
        for (const c of corners) {
          p.copy(c).project(probe);
          box2.expandByPoint(new THREE.Vector2(p.x, p.y));
        }
        if (Math.max(box2.max.x - box2.min.x, box2.max.y - box2.min.y) / 2 > 0.84) lo = dist;
        else hi = dist;
      }
      home.copy(probe.position);
      const mid = box2.getCenter(new THREE.Vector2());
      const vw = mount.clientWidth;
      const vh = mount.clientHeight;
      camera.setViewOffset(vw, vh, (mid.x * vw) / 2, (-mid.y * vh) / 2, vw, vh);
    };
    const controls = new OrbitControls(camera, canvas);
    controls.target.copy(target);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = false; // a plain scroll wheel always scrolls the page; zoom is below
    controls.enablePan = false;
    controls.rotateSpeed = 0.55;
    controls.minPolarAngle = 0.35;
    controls.maxPolarAngle = 1.22;
    controls.minAzimuthAngle = -0.5;
    controls.maxAzimuthAngle = 1.35;
    canvas.style.touchAction = "pan-y";

    /* zoom: buttons, Ctrl + scroll (also a trackpad pinch) and a two-finger pinch */
    const zoomBy = (f: number) => {
      const z = clamp(camera.zoom * f, 1, ZOOM_MAX);
      camera.zoom = z < 1.01 ? 1 : z;
      camera.updateProjectionMatrix();
      setZoom(camera.zoom);
      invalidate();
    };
    const wheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      zoomBy(Math.exp(-clamp(e.deltaY, -100, 100) * 0.004));
    };
    const fingers = new Map<number, { x: number; y: number }>();
    const spread = () => {
      const [a, b] = [...fingers.values()];
      return Math.hypot(a.x - b.x, a.y - b.y);
    };
    const fingerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") fingers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    };
    const fingerMove = (e: PointerEvent) => {
      if (!fingers.has(e.pointerId)) return;
      const before = fingers.size === 2 ? spread() : 0;
      fingers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (before > 0) zoomBy(spread() / before);
    };
    const fingerUp = (e: PointerEvent) => void fingers.delete(e.pointerId);
    canvas.addEventListener("wheel", wheel, { passive: false });
    canvas.addEventListener("pointerdown", fingerDown);
    canvas.addEventListener("pointermove", fingerMove);
    canvas.addEventListener("pointerup", fingerUp);
    canvas.addEventListener("pointercancel", fingerUp);

    let intro: { t0: number; p: THREE.Vector3; q: THREE.Quaternion } | null = null;
    let first = true;
    let ready = false;
    /* the fixed office turns a little, once, as it appears; skipped where drawing is slow or motion is unwanted */
    let turn: number | null = null;
    let turnDone = false;
    const turned = (k: number) => {
      const s = new THREE.Spherical().setFromVector3(home.clone().sub(target));
      s.theta += 0.26 * (1 - k);
      camera.position.setFromSpherical(s).add(target);
      controls.update();
    };
    const stopTurn = () => {
      turn = null;
      turnDone = true;
    };
    controls.addEventListener("start", stopTurn);
    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      frameHome();
      if (first || !intro) {
        camera.position.copy(home);
        controls.update();
        first = false;
      }
      // resizing clears the canvas: redraw now rather than leave it blank until the next frame
      if (ready) {
        renderer.render(scene, camera);
        overlays();
      }
      invalidate();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    const aim = new THREE.PerspectiveCamera();
    const below = [new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.35)];
    const setRise = (wallK: number, furnK: number) => {
      renderer.clippingPlanes = wallK < 1 || furnK < 1 ? below : [];
      standing.position.y = -(1 - wallK) * (H - SHOW);
      office.position.y = -(1 - furnK) * (H + 0.1);
      // redrawing the shadows on every frame of the unfold is what makes it stutter; once, at the end, is enough
      if (wallK >= 1 && furnK >= 1) renderer.shadowMap.needsUpdate = true;
    };
    /** Start straight overhead, framed like the plan, then unfold. */
    const startIntro = () => {
      const p = new THREE.Vector3(0, (D * 1.13) / 2 / Math.tan(THREE.MathUtils.degToRad(TOP_FOV / 2)), 0);
      aim.position.copy(p);
      aim.up.set(0, 0, -1);
      aim.lookAt(0, 0, 0);
      intro = { t0: performance.now(), p, q: aim.quaternion.clone() };
      camera.position.copy(p);
      camera.quaternion.copy(aim.quaternion);
      camera.fov = TOP_FOV;
      camera.updateProjectionMatrix();
      setRise(0, 0);
      controls.enabled = false;
    };
    const endIntro = () => {
      intro = null;
      setRise(1, 1);
    };

    /* the glass wall's handle */
    const ray = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.3);
    const hit = new THREE.Vector3();
    const pick = (x: number, y: number) => {
      const r = canvas.getBoundingClientRect();
      ray.setFromCamera(new THREE.Vector2(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1), camera);
      return ray.ray.intersectPlane(plane, hit) ? snapGlass(hit.x + W / 2) : null;
    };
    const v = new THREE.Vector3();
    const overlays = () => {
      const h = handleRef.current;
      if (h) {
        v.set(wx(cur), 1.3, wz(ROOM_D)).project(camera);
        h.style.transform = `translate(${((v.x + 1) / 2) * mount.clientWidth}px, ${((1 - v.y) / 2) * mount.clientHeight}px) translate(-50%, -50%)`;
        h.style.visibility = intro ? "hidden" : "inherit";
      }
    };

    /* render on demand */
    let needs = true;
    let seen = true;
    let isActive = false;
    function invalidate() {
      needs = true;
    }
    const io = new IntersectionObserver((e) => {
      seen = e.some((x) => x.isIntersecting);
    });
    io.observe(mount);
    controls.addEventListener("change", invalidate);
    let raf = 0;
    const q1 = new THREE.Quaternion();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!seen || !isActive) return;
      if (intro) {
        const k = clamp((now - intro.t0) / INTRO_MS, 0, 1);
        const e = ease(k);
        aim.position.copy(home);
        aim.up.set(0, 1, 0);
        aim.lookAt(target);
        q1.copy(aim.quaternion);
        camera.position.lerpVectors(intro.p, home, e);
        camera.quaternion.slerpQuaternions(intro.q, q1, e);
        camera.fov = TOP_FOV + (ORBIT_FOV - TOP_FOV) * e;
        camera.updateProjectionMatrix();
        setRise(ease(clamp((k - 0.08) / 0.62, 0, 1)), ease(clamp((k - 0.3) / 0.7, 0, 1)));
        needs = true;
        if (k >= 1) {
          endIntro();
          controls.enabled = true;
          controls.update();
        }
      } else if (turn !== null) {
        const k = clamp((now - turn) / TURN_MS, 0, 1);
        turned(ease(k));
        needs = true;
        if (k >= 1) turn = null;
      } else if (controls.enabled && controls.update()) needs = true;
      if (!needs) return;
      needs = false;
      const t0 = performance.now();
      renderer.render(scene, camera);
      if (ready && fixed && !reduce && !turnDone) {
        turnDone = true;
        // the second frame tells how fast this device really draws (the first one compiles)
        if (performance.now() - t0 < 24) turn = now;
      }
      overlays();
      if (!ready) {
        ready = true;
        needs = true;
        cb.current.onReady();
      }
    };
    raf = requestAnimationFrame(tick);

    ctx.current = {
      setOffice,
      zoomBy,
      pick,
      setActive: (on) => {
        if (on && !isActive && !reduce && !fixed) {
          zoomBy(1 / ZOOM_MAX); // the unfold starts from the whole office
          frameHome();
          startIntro();
        }
        isActive = on;
        if (on) {
          invalidate();
        }
      },
    };

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      controls.dispose();
      canvas.removeEventListener("wheel", wheel);
      canvas.removeEventListener("pointerdown", fingerDown);
      canvas.removeEventListener("pointermove", fingerMove);
      canvas.removeEventListener("pointerup", fingerUp);
      canvas.removeEventListener("pointercancel", fingerUp);
      [...officeGeos, ...movingGeos, ...floorGeos].forEach((g) => g.dispose());
      trash.forEach((d) => d.dispose());
      renderer.dispose();
      canvas.remove();
      ctx.current = null;
    };
  }, []);

  useEffect(() => {
    ctx.current?.setOffice(items, glass);
  }, [items, glass]);
  useEffect(() => {
    ctx.current?.setActive(active);
  }, [active]);

  return (
    <div className={styles.scene} role="group" aria-label={t.alt}>
      <div ref={mountRef} className={styles.view3d} />
      {!props.plan && <div
        ref={handleRef}
        className={styles.grip}
        role="slider"
        tabIndex={active ? 0 : -1}
        aria-label={t.wall}
        aria-valuemin={GLASS_MIN}
        aria-valuemax={GLASS_MAX}
        aria-valuenow={glass}
        aria-valuetext={props.glassText}
        onKeyDown={props.onKey}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          dragging.current = true;
          cb.current.onGlassStart();
        }}
        onPointerMove={(e) => {
          const g = dragging.current ? ctx.current?.pick(e.clientX, e.clientY) : null;
          if (g != null && g !== glass) cb.current.onGlass(g);
        }}
        onPointerUp={() => {
          if (dragging.current) cb.current.onGlassEnd();
          dragging.current = false;
        }}
        onPointerCancel={() => {
          if (dragging.current) cb.current.onGlassEnd();
          dragging.current = false;
        }}
      >
        <svg width="16" height="16" viewBox="-9 -9 18 18" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M-3-4-7 0l4 4M3-4l4 4-4 4" />
        </svg>
      </div>}
      <div className={styles.zoom}>
        <button type="button" aria-label={t.zoomIn} title={t.zoomIn} disabled={zoom >= ZOOM_MAX} onClick={() => ctx.current?.zoomBy(1.25)}>
          +
        </button>
        <button type="button" aria-label={t.zoomOut} title={t.zoomOut} disabled={zoom <= 1} onClick={() => ctx.current?.zoomBy(0.8)}>
          −
        </button>
      </div>
    </div>
  );
}
