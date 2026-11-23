"use client";

import { useEffect } from "react";

/** Same elements the CSS reveals with `animation-timeline: view()` (see the motion section of globals.css). */
const TARGETS = ".col-head, .adds-list > div, .month-head, .screen, .rates tbody tr, .close-main, .terms";

/**
 * Scroll reveal for browsers without scroll-driven animations. Renders nothing; where the CSS
 * version works, or the visitor prefers reduced motion, it does nothing at all.
 */
export default function RevealFallback() {
  // Workflow timeline: a time-based sequence (rail, markers, titles, descriptions) played once when
  // it scrolls into view, in every browser. The hidden state is only applied here, so without
  // JavaScript, or with reduced motion, the steps are simply visible.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ol = document.querySelector<HTMLElement>(".steps");
    if (!ol) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        ol.classList.add("in");
        io.disconnect();
      },
      { rootMargin: "0px 0px -15% 0px", threshold: 0.1 },
    );
    ol.classList.add("will-play");
    io.observe(ol);
    return () => {
      io.disconnect();
      ol.classList.remove("will-play", "in");
    };
  }, []);

  useEffect(() => {
    if (CSS.supports("animation-timeline: view()")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const els = [...document.querySelectorAll<HTMLElement>(TARGETS)];
    for (const el of els) {
      // stagger siblings (list rows, step columns) the way the CSS version does
      const i = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
      el.style.setProperty("--d", `${Math.min(i, 4) * 70}ms`);
      el.classList.add("will-reveal");
      io.observe(el);
    }
    return () => {
      io.disconnect();
      for (const el of els) el.classList.remove("will-reveal", "in");
    };
  }, []);
  return null;
}
