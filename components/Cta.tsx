"use client";

import { useEffect, useState } from "react";
import { OFFER } from "@/lib/offer";

/** Builds the checkout link: promo params + region + whatever UTM tags the ad carried. */
function buildHref() {
  const url = new URL(OFFER.ctaUrl);
  Object.entries(OFFER.ctaParams).forEach(([k, v]) => url.searchParams.set(k, v));
  if (typeof window !== "undefined") {
    const here = new URLSearchParams(window.location.search);
    here.forEach((v, k) => {
      if (k.startsWith("utm_") || k === "ref") url.searchParams.set(k, v);
    });
    url.searchParams.set("region", document.documentElement.dataset.region || "us");
  }
  return url.toString();
}

export default function Cta({
  children,
  variant = "solid",
  location,
}: {
  children: React.ReactNode;
  variant?: "solid" | "ink";
  location: string;
}) {
  const [href, setHref] = useState(OFFER.ctaUrl);
  useEffect(() => {
    const update = () => setHref(buildHref());
    update();
  }, []);
  return (
    <a className={`btn btn-${variant}`} href={href} data-cta={location}>
      {children}
      <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden>
        <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    </a>
  );
}
