import { useState } from "react";
import type { Item, Side } from "@/lib/office-model";
import styles from "./OfficePlan.module.css";

/* How each piece of furniture is drawn in plan. Drawing only: positions and sizes come from the model. */

const U = 100; // SVG units per metre
/** Metres → SVG units, rounded so server and browser print the same number. */
export const u = (m: number) => Math.round(m * U * 100) / 100;

const TURN: Record<Side, number> = { n: 0, e: 90, s: 180, w: 270 };
const LEAVES = [0, 45, 90, 135, 180, 225, 270, 315];

function Chair({ w }: Readonly<{ w: number }>) {
  const r = w / 2;
  return (
    <>
      <rect className={styles.arm} x={-r} y={-r * 0.45} width={w * 0.16} height={r * 1.1} rx={4} />
      <rect className={styles.arm} x={r - w * 0.16} y={-r * 0.45} width={w * 0.16} height={r * 1.1} rx={4} />
      <rect className={styles.seat} x={-r * 0.74} y={-r * 0.7} width={r * 1.48} height={r * 1.6} rx={11} />
      <path className={styles.back} d={`M${-r * 0.8} ${-r * 0.5}Q0 ${-r * 1.3} ${r * 0.8} ${-r * 0.5}`} />
    </>
  );
}

function Seat({ w, d, kind, seats }: Readonly<{ w: number; d: number; kind: "sofa" | "armchair"; seats: number }>) {
  const arm = 13;
  const back = 20;
  const cw = (w - 2 * arm) / seats;
  return (
    <g className={styles[kind]}>
      <rect x={-w / 2} y={-d / 2} width={w} height={d} rx={12} />
      {Array.from({ length: seats }, (_, i) => (
        <rect key={i} className={styles.cushion} x={-w / 2 + arm + i * cw + 1.5} y={-d / 2 + back} width={cw - 3} height={d - back - 3} rx={8} />
      ))}
    </g>
  );
}

function Desk({ w, d }: Readonly<{ w: number; d: number }>) {
  // the screen is on the far (top) edge, the sitter at the bottom
  return (
    <>
      <rect className={styles.wood} x={-w / 2} y={-d / 2} width={w} height={d} rx={3} />
      <path className={styles.grain} d={`M${-w / 2 + 8} ${-d * 0.12}H${w / 2 - 30}M${-w / 2 + 24} ${d * 0.22}H${w / 2 - 8}`} />
      <rect className={styles.dark} x={-7} y={-d / 2 + 11} width={14} height={9} />
      <rect className={styles.dark} x={-29} y={-d / 2 + 6} width={58} height={7} rx={2} />
      <rect className={styles.paper} x={-21} y={d * 0.06} width={42} height={14} rx={3} />
      <rect className={styles.paper} x={28} y={d * 0.08} width={8} height={11} rx={4} />
    </>
  );
}

function Plant({ r }: Readonly<{ r: number }>) {
  return (
    <>
      <circle className={styles.pot} r={r * 0.55} />
      {LEAVES.map((a, i) => (
        <ellipse key={a} className={i % 2 ? styles.leaf : styles.leafDark} cx={0} cy={-r * 0.6} rx={r * 0.3} ry={r * 0.6} transform={`rotate(${a + 12})`} />
      ))}
      <circle className={styles.leafLight} r={r * 0.26} />
    </>
  );
}

function Counter({ w, d }: Readonly<{ w: number; d: number }>) {
  const reception = w > d;
  return (
    <>
      <rect className={reception ? styles.oak : styles.stone} x={-w / 2} y={-d / 2} width={w} height={d} rx={4} />
      {reception ? (
        <>
          <rect className={styles.paper} x={-w / 2 + 6} y={-d / 2 + 6} width={w - 12} height={17} rx={3} />
          <rect className={styles.dark} x={-24} y={d / 2 - 30} width={48} height={7} rx={2} />
          <rect className={styles.paper} x={-18} y={d / 2 - 18} width={36} height={10} rx={3} />
        </>
      ) : (
        <>
          <rect className={styles.sink} x={-w / 2 + 12} y={-d / 2 + 28} width={w - 24} height={52} rx={8} />
          {[-12, 12].map((x) => [0, 1].map((n) => <circle key={`${x}${n}`} className={styles.hob} cx={x} cy={d / 2 - 70 + n * 28} r={9} />))}
          <rect className={styles.dark} x={-13} y={4} width={26} height={30} rx={4} />
        </>
      )}
    </>
  );
}

/** `enter`: pieces added after the visitor changed something fade in; the ones already there glide to their new place. */
export function Piece({ i, enter = false }: Readonly<{ i: Item; enter?: boolean }>) {
  const [added] = useState(enter);
  const W = u(i.x1 - i.x0);
  const D = u(i.y1 - i.y0);
  const turn = i.back ? TURN[i.back] : 0;
  const side = turn % 180 !== 0;
  const w = side ? D : W;
  const d = side ? W : D;
  return (
    <g
      className={`${styles.piece} ${added ? styles.added : ""}`}
      style={{ transform: `translate(${u((i.x0 + i.x1) / 2)}px, ${u((i.y0 + i.y1) / 2)}px)` }}
    >
      <g transform={turn ? `rotate(${turn})` : undefined}>
        {i.kind === "chair" && <Chair w={w} />}
        {i.kind === "desk" && <Desk w={w} d={d} />}
        {(i.kind === "sofa" || i.kind === "armchair") && <Seat w={w} d={d} kind={i.kind} seats={i.seats ?? 1} />}
        {i.kind === "plant" && <Plant r={W / 2 + 6} />}
        {i.kind === "stool" && <circle className={styles.stool} r={W / 2} />}
        {i.kind === "counter" && <Counter w={w} d={d} />}
        {i.kind === "wc" && (
          <>
            <rect className={styles.stone} x={-w / 2} y={-d / 2} width={w} height={d * 0.3} rx={4} />
            <ellipse className={styles.stone} cy={d * 0.14} rx={w * 0.42} ry={d * 0.34} />
            <ellipse className={styles.sink} cy={d * 0.16} rx={w * 0.26} ry={d * 0.22} />
          </>
        )}
        {i.kind === "basin" && (
          <>
            <rect className={styles.stone} x={-w / 2} y={-d / 2} width={w} height={d} rx={4} />
            <ellipse className={styles.sink} cy={3} rx={w * 0.32} ry={d * 0.28} />
          </>
        )}
        {i.kind === "rug" && (
          <>
            <rect className={styles.rug} x={-w / 2} y={-d / 2} width={w} height={d} />
            <rect className={styles.rugLine} x={-w / 2 + 9} y={-d / 2 + 9} width={w - 18} height={d - 18} />
          </>
        )}
        {i.kind === "cabinet" && (
          <>
            <rect className={styles.oak} x={-w / 2} y={-d / 2} width={w} height={d} rx={2} />
            <path className={styles.grain} d={`M${-w / 2} ${-d / 6}h${w}M${-w / 2} ${d / 6}h${w}`} />
          </>
        )}
        {i.kind === "table" && (
          <>
            <rect className={styles.wood} x={-w / 2} y={-d / 2} width={w} height={d} rx={12} />
            {w > 130 && <path className={styles.grain} d={`M${-w / 2 + 16} ${-d * 0.2}H${w / 2 - 40}M${-w / 2 + 34} 0H${w / 2 - 16}M${-w / 2 + 16} ${d * 0.22}H${w / 2 - 28}`} />}
            <g transform="scale(0.55)">
              <Plant r={22} />
            </g>
          </>
        )}
      </g>
    </g>
  );
}
