/** Textures, shared with the anthemius.io hero room. */
import * as THREE from "three";

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* ── procedural textures (no downloads, like the editor's texture-gen) ──── */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function canvasTexture(draw: (g: CanvasRenderingContext2D, n: number) => void, n = 512) {
  const c = document.createElement("canvas");
  c.width = c.height = n;
  const g = c.getContext("2d")!;
  draw(g, n);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** One tile = 1.2 m: six plank rows, staggered joints, grain. White-ish, tinted by the material colour. */
export const plankTexture = () =>
  canvasTexture((g, n) => {
    const r = rng(7);
    const rows = 6;
    const h = n / rows;
    for (let i = 0; i < rows; i++) {
      let x = -r() * n * 0.6;
      while (x < n) {
        const len = n * (0.45 + r() * 0.5);
        const v = 214 + Math.floor(r() * 41);
        g.fillStyle = `rgb(${v},${v},${v})`;
        g.fillRect(x, i * h, len, h);
        g.strokeStyle = "rgba(0,0,0,0.06)";
        g.lineWidth = 1;
        for (let k = 0; k < 5; k++) {
          const yy = i * h + 4 + r() * (h - 8);
          g.beginPath();
          g.moveTo(x, yy);
          g.bezierCurveTo(x + len * 0.3, yy + (r() - 0.5) * 6, x + len * 0.7, yy + (r() - 0.5) * 6, x + len, yy);
          g.stroke();
        }
        g.fillStyle = "rgba(0,0,0,0.28)";
        g.fillRect(x, i * h, 1.5, h);
        x += len;
      }
      g.fillStyle = "rgba(0,0,0,0.3)";
      g.fillRect(0, i * h, n, 1.5);
    }
  });

export const terrazzoTexture = () =>
  canvasTexture((g, n) => {
    const r = rng(11);
    g.fillStyle = "#f4f2ee";
    g.fillRect(0, 0, n, n);
    const chips = ["#9c958a", "#c9b9a3", "#7d8a86", "#b88f78", "#e0dbd2", "#6f6a64"];
    for (let i = 0; i < 700; i++) {
      g.fillStyle = chips[Math.floor(r() * chips.length)];
      const x = r() * n;
      const y = r() * n;
      const s = 1.5 + r() * 5;
      g.beginPath();
      g.moveTo(x, y);
      for (let k = 1; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2 + r();
        g.lineTo(x + Math.cos(a) * s, y + Math.sin(a) * s);
      }
      g.fill();
    }
  });


export const concreteTexture = () =>
  canvasTexture((g, n) => {
    const r = rng(23);
    g.fillStyle = "#eeeeec";
    g.fillRect(0, 0, n, n);
    for (let i = 0; i < 160; i++) {
      const x = r() * n;
      const y = r() * n;
      const rad = 10 + r() * 60;
      const a = r() * 0.05;
      const grd = g.createRadialGradient(x, y, 0, x, y, rad);
      grd.addColorStop(0, `rgba(${r() < 0.5 ? "0,0,0" : "255,255,255"},${a})`);
      grd.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grd;
      g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    g.strokeStyle = "rgba(0,0,0,0.12)";
    g.lineWidth = 1.5;
    g.strokeRect(0, 0, n, n); // saw-cut joint every tile
  });

/** Carpet tiles, quarter-turned, 0.5 m each (tile = 1 m). */
export const carpetTexture = () =>
  canvasTexture((g, n) => {
    const r = rng(5);
    const h = n / 2;
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 2; j++) {
        const base = (i + j) % 2 ? 196 : 186;
        g.fillStyle = `rgb(${base},${base - 3},${base - 8})`;
        g.fillRect(i * h, j * h, h, h);
        g.strokeStyle = "rgba(0,0,0,0.05)";
        for (let k = 0; k < 60; k++) {
          const o = r() * h;
          g.beginPath();
          if ((i + j) % 2) {
            g.moveTo(i * h + o, j * h);
            g.lineTo(i * h + o, j * h + h);
          } else {
            g.moveTo(i * h, j * h + o);
            g.lineTo(i * h + h, j * h + o);
          }
          g.stroke();
        }
        g.strokeStyle = "rgba(0,0,0,0.14)";
        g.strokeRect(i * h, j * h, h, h);
      }
  }, 256);

/** What the windows look out on: a soft sky over a hazy far treeline. Unlit, not tone mapped. */
export const skyTexture = () => {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  const grd = g.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, "#cfe1ef");
  grd.addColorStop(0.62, "#eef3f2");
  grd.addColorStop(1, "#f6efe2");
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const r = rng(3);
  g.fillStyle = "rgba(122,150,128,0.35)";
  g.beginPath();
  g.moveTo(0, 256);
  for (let x = 0; x <= 256; x += 8) g.lineTo(x, 196 - r() * 26);
  g.lineTo(256, 256);
  g.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};
