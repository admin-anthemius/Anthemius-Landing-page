"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Dict } from "@/lib/content";
import { htmlLang, type Locale } from "@/lib/i18n";
import {
  CABINS,
  CABIN_X,
  D,
  GLASS_MAX,
  GLASS_MIN,
  GLASS_START,
  GLASS_STEP,
  LAYOUTS,
  LOUNGE,
  PANTRY,
  RECEPTION,
  ROOM_D,
  W,
  furniture,
  openings,
  quantities,
  snapGlass,
  walls,
  type Layout,
  type RoomId,
} from "@/lib/office-model";
import { Piece, u } from "./OfficeFurniture";
import PlanShell from "./PlanShell";
import styles from "./OfficePlan.module.css";

/** three.js is fetched when 3D is first wanted, never with the page. */
const load3D = () => import("./Office3D");
const Office3D = dynamic(load3D, { ssr: false });
type View = "2d" | "3d";

const U = 100; // SVG units per metre
const APP_URL = "https://design.anthemius.io";
const PAD = 26; // around the plan
const TOP = 76; // room for the dimension chains above…
const LEFT = 84; // …and to the left
const M_FT = 3.28084;
const VIEWS: { id: View; icon: string }[] = [
  { id: "2d", icon: "M2 2h14v14H2zM2 9h6M8 2v4M8 9v7M12 16v-5h4" },
  { id: "3d", icon: "m9 1.5 6.5 3.5v7.5L9 16.5l-6.5-4V5zM2.5 5 9 9l6.5-4M9 9v7.5" },
];
function Icon({ d }: Readonly<{ d: string }>) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
type State = { glass: number; layout: Layout };

/** The office demo: drag the glass wall or switch layouts, and the plan and quantities follow. */
export default function OfficePlan({ lang, t }: Readonly<{ lang: Locale; t: Dict["office"] }>) {
  const [{ glass, layout }, setState] = useState<State>({ glass: GLASS_START, layout: "focus" });
  const [past, setPast] = useState<State[]>([]);
  const [future, setFuture] = useState<State[]>([]);
  const [loaded, setLoaded] = useState(false); // the 3D code is here
  const [metric, setMetric] = useState(lang !== "en");
  const [view, setView] = useState<View>("2d");
  const [gl, setGl] = useState<"none" | "loading" | "ready" | "failed">("none");
  const [touched, setTouched] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ x: number; from: State } | null>(null);

  const items = useMemo(() => furniture(layout, glass), [layout, glass]);
  const q = useMemo(() => quantities(items, glass), [items, glass]);

  const num = (v: number, digits: number) =>
    new Intl.NumberFormat(htmlLang(lang), { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v);
  const fmtLen = (m: number, digits = 1) => (metric ? `${num(m, digits)} m` : `${num(m * M_FT, 1)} ft`);

  // once the page has settled, fetch the 3D code quietly so the first click does not wait for it
  // (skipped when the visitor asks to save data)
  useEffect(() => {
    if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return;
    const get = () => void load3D().then(() => setLoaded(true), () => {});
    let idle = 0;
    const timer = window.setTimeout(() => {
      if ("requestIdleCallback" in window) idle = requestIdleCallback(get, { timeout: 4000 });
      else get();
    }, 2500);
    return () => {
      window.clearTimeout(timer);
      if (idle) cancelIdleCallback(idle);
    };
  }, []);

  const glassText = `${fmtLen(glass, 2)}. ${t.qty.desks}: ${q.desks}. ${t.qty.meeting}: ${q.meeting}.`;

  const now: State = { glass, layout };
  const move = (v: number) => {
    setTouched(true);
    setState({ glass: snapGlass(v), layout });
  };
  /** Remember where an edit started, so it can be undone in one step (a whole drag is one edit). */
  const commit = (from: State, to: State) => {
    if (from.glass === to.glass && from.layout === to.layout) return;
    setPast((p) => [...p.slice(-49), from]);
    setFuture([]);
  };
  const undo = () => {
    if (!past.length) return;
    setFuture([now, ...future]);
    setState(past[past.length - 1]);
    setPast(past.slice(0, -1));
  };
  const redo = () => {
    if (!future.length) return;
    setPast([...past, now]);
    setState(future[0]);
    setFuture(future.slice(1));
  };
  const pick = (l: Layout) => {
    commit(now, { glass, layout: l });
    setState({ glass, layout: l });
  };
  const open = (v: View) => {
    if (v !== "2d" && gl === "failed") return;
    setView(v);
    if (v === "2d" || gl !== "none") return;
    setGl("loading");
    // if the 3D code cannot be downloaded, stay on the plan; the next click tries again
    load3D().then(() => setLoaded(true), () => {
      setGl("none");
      setView("2d");
    });
  };
  const solid = view !== "2d" && gl === "ready"; // WebGL is what is on screen
  const onDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, from: now };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current || !svg.current) return;
    const pxPerUnit = svg.current.getScreenCTM()?.a ?? 1;
    move(drag.current.from.glass + (e.clientX - drag.current.x) / pxPerUnit / U);
  };
  const onUp = () => {
    if (drag.current) commit(drag.current.from, now);
    drag.current = null;
  };
  const onKey = (e: React.KeyboardEvent) => {
    const steps: Record<string, number> = {
      ArrowLeft: -2 * GLASS_STEP,
      ArrowDown: -2 * GLASS_STEP,
      ArrowRight: 2 * GLASS_STEP,
      ArrowUp: 2 * GLASS_STEP,
      PageDown: -0.5,
      PageUp: 0.5,
      Home: -W,
      End: W,
    };
    if (!(e.key in steps)) return;
    e.preventDefault();
    commit(now, { glass: snapGlass(glass + steps[e.key]), layout });
    move(glass + steps[e.key]);
  };

  const zones: [RoomId, number, number, number, number][] = [
    ["meeting", 0, glass, 0, ROOM_D],
    ["cabin", CABIN_X, W, 0, ROOM_D],
    ["reception", RECEPTION.x0, RECEPTION.x1, RECEPTION.y0, RECEPTION.y1],
    ["lounge", LOUNGE.x0, LOUNGE.x1, LOUNGE.y0, LOUNGE.y1],
    ["pantry", PANTRY.x0, PANTRY.x1, PANTRY.y0, PANTRY.y1],
  ];
  const size = (r: { x0: number; x1: number; y0: number; y1: number }) =>
    metric
      ? `${num(r.x1 - r.x0, 1)} × ${num(r.y1 - r.y0, 1)} m`
      : `${num((r.x1 - r.x0) * M_FT, 1)} × ${num((r.y1 - r.y0) * M_FT, 1)} ft`;
  /** room, position, size (the workspace is L-shaped, so it has none) */
  const labels: [RoomId, number, number, string][] = [
    ["meeting", glass / 2, 3.07, size({ x0: 0, x1: glass, y0: 0, y1: ROOM_D })],
    ...CABINS.map(([x0, x1]): [RoomId, number, number, string] => ["cabin", (x0 + x1) / 2, 3.07, size({ x0, x1, y0: 0, y1: ROOM_D })]),
    ["reception", 2, 4.62, size(RECEPTION)],
    ["lounge", 1.7, 6.66, ""],
    ["pantry", 12, 6.05, size(PANTRY)],
    ["workspace", 7.1, 4.55, ""],
  ];
  /** dimension chain above the plan: glass wall, cabins, outer wall */
  const chain = [0, glass, CABIN_X, CABINS[1][0], W];


  return (
    <div className={styles.tablet}>
      <figure className={`plate ${styles.office}`}>
        {/* a Mac browser window: the dots are decoration, the address is a real link to the app */}
        <div className={styles.browser}>
          <span className={styles.dots} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <a className={styles.url} href={APP_URL} target="_blank" rel="noopener">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
              <path d="M2.5 5.5h7V11h-7zM4 5.5V3.5a2 2 0 0 1 4 0v2" />
            </svg>
            design.anthemius.io
          </a>
        </div>
        <div className={styles.toolbar}>
          <div className={styles.views} data-view={gl === "failed" ? "one" : view} role="group" aria-label={t.views}>
            {VIEWS.filter((v) => v.id === "2d" || gl !== "failed").map((v) => (
              <button
                key={v.id}
                type="button"
                aria-pressed={view === v.id}
                onClick={() => open(v.id)}
                onPointerEnter={v.id === "2d" ? undefined : () => void load3D().then(() => setLoaded(true), () => {})}
              >
                <Icon d={v.icon} />
                {t.tabs[v.id]}
              </button>
            ))}
          </div>
          <span className={styles.hint} aria-live="polite">
            {view === "2d" ? t.hint : gl === "loading" ? t.loading : t.hint3d}
          </span>
          <div className={styles.history}>
            <button type="button" aria-label={t.undo} title={t.undo} disabled={!past.length} onClick={undo}>
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M5.5 3 2 6.5 5.5 10M2.5 6.5H10a4 4 0 0 1 0 8H7" />
              </svg>
            </button>
            <button type="button" aria-label={t.redo} title={t.redo} disabled={!future.length} onClick={redo}>
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M11.5 3 15 6.5 11.5 10M14.5 6.5H7a4 4 0 0 0 0 8h3" />
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.canvas}>
          {loaded && gl !== "none" && gl !== "failed" && (
            <div className={solid ? styles.stage : styles.stageOff}>
              <Office3D
                active={view !== "2d"}
                glass={glass}
                items={items}
                t={t}
                onReady={() => setGl("ready")}
                onFail={() => {
                  setGl("failed");
                  setView("2d");
                }}
                onGlassStart={() => {
                  drag.current = { x: 0, from: now };
                }}
                onGlass={move}
                onGlassEnd={onUp}
                onKey={onKey}
                glassText={glassText}
              />
            </div>
          )}
          <svg
            ref={svg}
            className={`${styles.plan} ${solid ? styles.off : ""}`}
            viewBox={`${-LEFT} ${-TOP} ${W * U + LEFT + PAD} ${D * U + TOP + PAD}`}
            role="group"
            aria-label={t.alt}
          >
            <rect className={styles.floor} width={W * U} height={D * U} />
            {zones.map(([id, x0, x1, y0, y1]) => (
              <rect key={id} className={styles[id]} x={u(x0)} y={u(y0)} width={u(x1 - x0)} height={u(y1 - y0)} />
            ))}
            {items.map((i) => (
              <Piece key={i.id} i={i} enter={touched || past.length > 0} />
            ))}
            <PlanShell walls={walls(glass)} openings={openings(glass)} />
            {labels.map(([id, x, y, dims]) => (
              <text key={`${id}${x}`} className={styles.label} x={u(x)} y={u(y)}>
                {t.rooms[id]}
                {dims && (
                  <tspan className={styles.roomDims} x={u(x)} dy={31}>
                    {dims}
                  </tspan>
                )}
              </text>
            ))}

            {/* dimension chains; the first is the meeting room, live */}
            <path className={styles.dim} d={`M0 -38H${W * U}${chain.map((x) => `M${u(x)} -50v24`).join("")}`} />
            <path className={styles.dim} d={`M-48 0V${D * U}M-60 0h24M-60 ${u(ROOM_D)}h24M-60 ${D * U}h24`} />
            {chain.slice(1).map((x, i) => (
              <text key={i} className={i === 0 ? styles.dimLive : styles.dimText} x={u((x + chain[i]) / 2)} y={-38} aria-hidden="true">
                {fmtLen(x - chain[i], 2)}
              </text>
            ))}
            {[
              [0, ROOM_D],
              [ROOM_D, D],
            ].map(([a, b]) => (
              <text key={a} className={styles.dimText} transform={`translate(-48 ${u((a + b) / 2)}) rotate(-90)`} aria-hidden="true">
                {fmtLen(b - a, 2)}
              </text>
            ))}

            {/* the glass wall is a slider */}
            <g
              className={styles.handle}
              role="slider"
              tabIndex={0}
              aria-label={t.wall}
              aria-orientation="horizontal"
              aria-valuemin={GLASS_MIN}
              aria-valuemax={GLASS_MAX}
              aria-valuenow={glass}
              aria-valuetext={glassText}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onKeyDown={onKey}
            >
              <rect className={styles.hit} x={u(glass) - 90} y={0} width={180} height={u(ROOM_D) - 20} />
              <line className={styles.grab} x1={u(glass)} y1={8} x2={u(glass)} y2={u(ROOM_D)} />
              <circle className={`${styles.knob} ${touched ? "" : styles.invite}`} cx={u(glass)} cy={160} r={34} />
              <path className={styles.arrows} d={`M${u(glass) - 8} 150l-9 10 9 10M${u(glass) + 8} 150l9 10-9 10`} />
            </g>
          </svg>
        </div>

        <div className={styles.controls}>
          <select className={styles.select} aria-label={t.layout} value={layout} onChange={(e) => pick(e.target.value as Layout)}>
            {LAYOUTS.map((l) => (
              <option key={l} value={l}>
                {t.layouts[l]}
              </option>
            ))}
          </select>
          <figcaption className={styles.caption}>{t.caption}</figcaption>
          <span className={styles.size}>
            {fmtLen(W)} × {fmtLen(D)}
          </span>
          <div className={styles.group} role="group" aria-label={t.units}>
            <button type="button" aria-pressed={metric} onClick={() => setMetric(true)}>
              m
            </button>
            <button type="button" aria-pressed={!metric} onClick={() => setMetric(false)}>
              ft
            </button>
          </div>
        </div>
      </figure>
    </div>
  );
}
