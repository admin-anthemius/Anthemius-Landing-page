"use client";

import { useEffect } from "react";

/** Everything that reveals on scroll. SOLID ones move but never fade (prices, button, terms). */
const FADE = ".col-head, .adds-card, .adds-photo, .month-head, .screen";
const SOLID = ".rates, .close-main, .terms li";

/**
 * Scroll reveals, played once each. Renders nothing; if the visitor prefers reduced motion it does
 * nothing at all, and anything already on screen is left alone so nothing blinks on load.
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
      { rootMargin: "100000px 0px -15% 0px", threshold: 0.1 },
    );
    ol.classList.add("will-play");
    io.observe(ol);
    return () => {
      io.disconnect();
      ol.classList.remove("will-play", "in");
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      },
      // the large top margin: jumping past something (nav link, End key) still reveals it
      { rootMargin: "100000px 0px -8% 0px", threshold: 0.08 },
    );
    const els = [...document.querySelectorAll<HTMLElement>(`${FADE}, ${SOLID}`)].filter(
      (el) => el.getBoundingClientRect().top >= window.innerHeight,
    );
    for (const el of els) {
      // stagger siblings (list rows, step columns) the way the CSS version does
      const i = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
      el.style.setProperty("--d", `${Math.min(i, 4) * 60}ms`);
      el.classList.add("will-reveal");
      if (el.matches(SOLID)) el.classList.add("solid");
      io.observe(el);
    }
    return () => {
      io.disconnect();
      for (const el of els) el.classList.remove("will-reveal", "solid", "in");
    };
  }, []);

  // the header link of the section being read is marked (not motion: runs for everyone)
  useEffect(() => {
    const links = [...document.querySelectorAll<HTMLAnchorElement>(".top-nav a")];
    const targets = links.map((a) => document.querySelector(a.hash)).filter((el): el is Element => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const a = links.find((l) => l.hash === `#${e.target.id}`);
          if (e.isIntersecting) a?.setAttribute("aria-current", "true");
          else a?.removeAttribute("aria-current");
        }
      },
      { rootMargin: "-45% 0px -54% 0px" }, // a thin line across the middle of the screen
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
