import type { Opening, Wall } from "@/lib/office-model";
import { u } from "./OfficeFurniture";
import styles from "./OfficePlan.module.css";

/*
 * Walls, windows and doors, drawn the way the Anthemius editor draws them (domain/derive-2d.ts and
 * drawing-standards.ts): light poché with a dark outline, a glazed panel across the wall for a window,
 * and jambs, a shaded swing, a leaf and an arc for a door.
 */

const THICK: Record<Wall["kind"], number> = { outer: 30, solid: 13, glass: 9 };
const OUTLINE = 3.2;

const ends = (r: { x0: number; x1: number; y0: number; y1: number }) => ({ x1: u(r.x0), y1: u(r.y0), x2: u(r.x1), y2: u(r.y1) });

export default function PlanShell({ walls, openings }: Readonly<{ walls: Wall[]; openings: Opening[] }>) {
  const host = (o: Opening) =>
    walls.find((w) =>
      o.y0 === o.y1
        ? w.y0 === w.y1 && w.y0 === o.y0 && w.x0 <= o.x0 + 1e-6 && w.x1 >= o.x1 - 1e-6
        : w.x0 === w.x1 && w.x0 === o.x0 && w.y0 <= o.y0 + 1e-6 && w.y1 >= o.y1 - 1e-6,
    );
  const outer = walls.filter((w) => w.kind === "outer");
  const inner = walls.filter((w) => w.kind !== "outer");
  return (
    <g>
      {/* outlines before fills, so walls merge where they meet; the outer walls last, so partitions end at their face */}
      {[inner, outer].map((set, k) => (
        <g key={k}>
          {set.map((w, n) => (
            <line key={`o${n}`} className={styles[`line_${w.kind}`]} {...ends(w)} strokeWidth={THICK[w.kind] + 2 * OUTLINE} strokeLinecap={w.kind === "outer" ? "square" : "butt"} />
          ))}
          {set.map((w, n) => (
            <line key={`f${n}`} className={styles[`poche_${w.kind}`]} {...ends(w)} strokeWidth={THICK[w.kind]} strokeLinecap={w.kind === "outer" ? "square" : "butt"} />
          ))}
        </g>
      ))}
      {openings.map((o, i) => {
        const across = o.y0 === o.y1;
        const wall = host(o);
        const t = THICK[wall?.kind ?? "solid"] / 2 + OUTLINE;
        const x0 = u(o.x0);
        const y0 = u(o.y0);
        const x1 = u(o.x1);
        const y1 = u(o.y1);
        const box = across ? { x: x0, y: y0 - t, width: x1 - x0, height: 2 * t } : { x: x0 - t, y: y0, width: 2 * t, height: y1 - y0 };
        if (o.kind === "window")
          return (
            <g key={i}>
              <rect className={styles.windowBack} {...box} />
              <rect className={styles.windowGlass} {...box} />
              <line className={styles.windowMid} {...ends(o)} />
            </g>
          );
        const jambs = across ? `M${x0} ${y0 - t}v${2 * t}M${x1} ${y1 - t}v${2 * t}` : `M${x0 - t} ${y0}h${2 * t}M${x1 - t} ${y1}h${2 * t}`;
        if (o.kind === "door") {
          const r = x1 - x0;
          return (
            <g key={i}>
              <rect className={styles.opening} {...box} />
              <path className={styles.swingFill} d={`M${x0} ${y0}V${y0 + r}A${r} ${r} 0 0 0 ${x1} ${y1}Z`} />
              <path className={styles.swing} d={`M${x0} ${y0 + r}A${r} ${r} 0 0 0 ${x1} ${y1}`} />
              <path className={styles.leafLine} d={`M${x0} ${y0}v${r}`} />
              <path className={styles.jamb} d={jambs} />
            </g>
          );
        }
        // the entrance: a pair of leaves in the left wall
        const r = (y1 - y0) / 2;
        return (
          <g key={i}>
            <rect className={styles.opening} {...box} />
            <path className={styles.swingFill} d={`M0 ${y0}H${r}A${r} ${r} 0 0 1 0 ${y0 + r}ZM0 ${y1}H${r}A${r} ${r} 0 0 0 0 ${y1 - r}Z`} />
            <path className={styles.swing} d={`M${r} ${y0}A${r} ${r} 0 0 1 0 ${y0 + r}M${r} ${y1}A${r} ${r} 0 0 0 0 ${y1 - r}`} />
            <path className={styles.leafLine} d={`M0 ${y0}h${r}M0 ${y1}h${r}`} />
            <path className={styles.jamb} d={jambs} />
          </g>
        );
      })}
    </g>
  );
}
