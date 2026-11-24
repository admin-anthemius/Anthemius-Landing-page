"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Dict } from "@/lib/content";
import { htmlLang, type Locale } from "@/lib/i18n";
import type { Rect } from "@/lib/office-model";
import { ROOMS, SHOWCASE } from "@/lib/office-showcase";
import { Piece, u } from "./OfficeFurniture";
import PlanShell from "./PlanShell";
import plan from "./OfficePlan.module.css";
import styles from "./WorkflowStudio.module.css";

const load3D = () => import("./Office3D");
const Office3D = dynamic(load3D, { ssr: false });
const { w: W, d: D, walls, openings, items } = SHOWCASE;
const LEFT = 120;
const TOP = 120;
const PAD = 40;
const FILL_MS = 1300; // the plan's furnishing, start to finish
const nothing = () => {};

/** One detailed office, drawn twice from the same data: the 2D plan beside the 3D model. */
export default function WorkflowStudio({ lang, t, caption, alt }: Readonly<{ lang: Locale; t: Dict["office"]; caption: string; alt: string }>) {
  const box = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const [draw, setDraw] = useState<"still" | "empty" | "filling">("still");
  const [state, setState] = useState<"wait" | "loading" | "ready" | "failed">("wait");
  const metric = lang !== "en";
  const num = (v: number, n: number) =>
    new Intl.NumberFormat(htmlLang(lang), { minimumFractionDigits: n, maximumFractionDigits: n }).format(v);
  const len = (m: number) => (metric ? `${num(m, 2)} m` : `${num(m * 3.28084, 1)} ft`);
  const area = (r: Rect) => {
    const m2 = (r.x1 - r.x0) * (r.y1 - r.y0);
    return metric ? `${num(m2, 1)} m²` : `${num(m2 * 10.7639, 0)} ft²`;
  };

  // The plan furnishes itself once: walls and doors are always there, then the furniture arrives, then names and
  // dimensions. Only prepared while the plan is still below the screen. The 3D model is built after that, never
  // during it: building blocks the page for a moment, and an empty plan must not be what people see meanwhile.
  useEffect(() => {
    const el = sheet.current;
    const model = box.current;
    if (!el || !model) return;
    const animate =
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches && el.getBoundingClientRect().top >= window.innerHeight;
    if (animate) setDraw("empty");
    const timers: number[] = [];
    const build = () =>
      void load3D().then(
        () => setState("loading"),
        () => setState("failed"),
      );
    // stacked (phones, tablets): the model is further down, so it waits for its own turn
    let filled = !animate;
    let near = false;
    const ready = () => {
      if (filled && near) build();
    };
    const fill = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        fill.disconnect();
        setDraw("filling");
        timers.push(
          window.setTimeout(() => {
            filled = true;
            setDraw("still");
            ready();
          }, FILL_MS),
        );
      },
      { rootMargin: "100000px 0px -25% 0px" },
    );
    const close = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        close.disconnect();
        near = true;
        ready();
      },
      { rootMargin: "300px 0px" },
    );
    if (animate) fill.observe(el);
    close.observe(model);
    return () => {
      fill.disconnect();
      close.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const across = [0, 6, 10, 12.5, 16, W];
  const down = [0, 4, 5.4, D];

  return (
    <figure className={`screen ${styles.studio}`}>
      <div className={styles.panes}>
        <div className={styles.pane}>
          <div className={styles.head}>
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
              <path d="M2 2h14v14H2zM2 9h6M8 2v4M8 9v7M12 16v-5h4" />
            </svg>
            {t.tabs["2d"]}
            <span className={styles.size}>
              {len(W)} × {len(D)}
            </span>
          </div>
          <div ref={sheet} className={`${styles.sheet} ${draw === "still" ? "" : styles[draw]}`}>
            <svg className={styles.plan} viewBox={`${-LEFT} ${-TOP} ${W * 100 + LEFT + PAD} ${D * 100 + TOP + PAD}`} role="img" aria-label={alt}>
              <rect className={plan.floor} width={W * 100} height={D * 100} />
              {ROOMS.map(
                ({ id, r, fill }) =>
                  fill && <rect key={`${id}${r.x0}`} className={plan[fill]} x={u(r.x0)} y={u(r.y0)} width={u(r.x1 - r.x0)} height={u(r.y1 - r.y0)} />,
              )}
              {items.map((i) => (
                <g key={i.id} className={styles.item} style={{ "--d": `${Math.round((i.x0 + i.y0) * 24)}ms` } as React.CSSProperties}>
                  <Piece i={i} />
                </g>
              ))}
              <PlanShell walls={walls} openings={openings} />
              <g className={styles.notes}>
              {ROOMS.map(({ id, r, at }) => (
                <text key={`${id}${r.x0}`} className={`${styles.label} ${r.x1 - r.x0 < 2 ? styles.narrow : ""}`} x={u(at![0])} y={u(at![1])}>
                  {t.show[id]}
                  <tspan className={styles.area} x={u(at![0])} dy={40}>
                    {area(r)}
                  </tspan>
                </text>
              ))}
              <path className={plan.dim} d={`M0 -62H${W * 100}${across.map((x) => `M${u(x)} -80v36`).join("")}`} />
              <path className={plan.dim} d={`M-62 0V${D * 100}${down.map((y) => `M-80 ${u(y)}h36`).join("")}`} />
              {across.slice(1).map((x, i) => (
                <text key={x} className={styles.dim} x={u((x + across[i]) / 2)} y={-62}>
                  {len(x - across[i])}
                </text>
              ))}
              {down.slice(1).map((y, i) => (
                <text key={y} className={styles.dim} transform={`translate(-62 ${u((y + down[i]) / 2)}) rotate(-90)`}>
                  {len(y - down[i])}
                </text>
              ))}
              </g>
            </svg>
          </div>
        </div>

        <div className={styles.pane}>
          <div className={styles.head}>
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
              <path d="m9 1.5 6.5 3.5v7.5L9 16.5l-6.5-4V5zM2.5 5 9 9l6.5-4M9 9v7.5" />
            </svg>
            {t.tabs["3d"]}
            <span className={styles.size}>{state === "failed" ? "" : state === "ready" ? t.hint3d : t.loading}</span>
          </div>
          <div ref={box} className={styles.model}>
            {(state === "loading" || state === "ready") && (
              <div className={state === "ready" ? styles.shown : styles.waiting}>
                <Office3D
                  active
                  plan={SHOWCASE}
                  glass={0}
                  items={items}
                  t={t}
                  glassText=""
                  onGlass={nothing}
                  onGlassStart={nothing}
                  onGlassEnd={nothing}
                  onKey={nothing}
                  onReady={() => setState("ready")}
                  onFail={() => setState("failed")}
                />
              </div>
            )}
            {state === "failed" && <Image className={styles.still} src="/img/split.jpg" alt="" width={2250} height={1462} sizes="(max-width: 900px) 200vw, 1400px" />}
          </div>
        </div>
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
