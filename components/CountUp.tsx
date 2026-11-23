"use client";

import { useEffect, useRef } from "react";

/**
 * A price that counts up to its value ("$0.99", "€0,99", "₹4,499"): format, separators and decimals are
 * kept exactly, and the last frame is the real text. The server renders the final value, so without
 * JavaScript, with reduced motion, or before this runs, the page simply shows the price.
 *
 * It counts once, when it first scrolls into view.
 * Layout never shifts: a hidden copy of the final text sets the width and the counting text sits on it.
 */
export default function CountUp({ text }: Readonly<{ text: string }>) {
  const box = useRef<HTMLSpanElement>(null);
  const val = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = box.current;
    const out = val.current;
    // cu-ready is set before first paint, and only when the visitor has not asked for reduced motion
    if (!el || !out || !document.documentElement.classList.contains("cu-ready")) return;
    if (el.offsetParent === null) return; // another region's copy of this price: not on screen

    const m = /^(\D*)([\d.,]+)(\D*)$/.exec(text);
    if (!m) {
      el.classList.add("cu-on");
      return;
    }
    const [, prefix, num, suffix] = m;
    const thousands = /^\d{1,3}(,\d{3})+(\.\d+)?$/.test(num); // 4,499
    const decComma = !thousands && /,\d+$/.test(num); // 0,99
    const decimals = /[.,]\d+$/.test(num) && !(thousands && !/\.\d+$/.test(num)) ? num.split(/[.,]/).pop()!.length : 0;
    const target = parseFloat(thousands ? num.replaceAll(",", "") : decComma ? num.replace(",", ".") : num);
    const show = (v: number) => {
      const [int, frac] = v.toFixed(decimals).split(".");
      const i = thousands ? int.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : int;
      out.textContent = `${prefix}${i}${frac ? (decComma ? "," : ".") + frac : ""}${suffix}`;
    };

    let raf = 0;
    let started = false;
    const run = () => {
      if (started) return;
      started = true;
      const dur = target >= 1000 ? 1500 : 1100;
      const t0 = performance.now();
      show(0);
      el.classList.add("cu-on");
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / dur);
        show(target * (1 - Math.pow(2, -10 * p))); // ease-out: fast start, long soft landing
        if (p < 1) raf = requestAnimationFrame(tick);
        else out.textContent = text; // the real string, byte for byte
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          run();
        }
      },
      { threshold: 0.6 },
    );
    // already on screen (reload mid-page): leave the real price alone
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    show(0);
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      out.textContent = text;
      el.classList.remove("cu-on");
    };
  }, [text]);

  return (
    <span ref={box} className="cu">
      <span className="cu-size" aria-hidden="true">
        {text}
      </span>
      <span ref={val} className="cu-val" aria-hidden="true">
        {text}
      </span>
      <span className="sr">{text}</span>
    </span>
  );
}
