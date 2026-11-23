"use client";

import { useEffect, useState } from "react";

/** Mobile offer bar. Appears only once the hero button has scrolled out of view. */
export default function Dock({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const hero = document.querySelector("[data-cta=hero]");
    const close = document.querySelector("[data-cta=close]");
    if (!hero || !close) return;
    const seen = new Map<Element, boolean>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => seen.set(e.target, e.isIntersecting));
      setShow(!seen.get(hero) && !seen.get(close));
    });
    io.observe(hero);
    io.observe(close);
    return () => io.disconnect();
  }, []);
  return (
    <div className={`dock ${show ? "show" : ""}`} inert={!show}>
      {children}
    </div>
  );
}
