"use client";

import Image from "next/image";
import { openConsentSettings } from "@/lib/consent";
import { siteHome, sitePricing, type Locale } from "@/lib/i18n";
import type { Dict } from "@/lib/content";
import { useLegalDialog } from "./LegalDialog";

/** One-row footer: brand lockup and copyright on the left; site, pricing, contact, legal and cookie links on the right. */
export default function Footer({ lang, t, cookieSettings }: Readonly<{ lang: Locale; t: Dict["footer"]; cookieSettings: string }>) {
  const legal = useLegalDialog();
  const base = siteHome(lang);
  return (
    <footer className="foot">
      <span className="foot-brand">
        <a href={base} className="wordmark" aria-label="Anthemius">
          <Image src="/mark.png" alt="" width={126} height={131} className="wordmark-mark" />
          <Image src="/wordmark-nav.png" alt="Anthemius" width={640} height={88} className="wordmark-word" />
        </a>
        <small>{t.copy}</small>
      </span>
      <span className="foot-links">
        <a href={base}>anthemius.io</a>
        <a href={sitePricing(lang)}>{t.pricing}</a>
        <a href="mailto:info@anthemius.io">info@anthemius.io</a>
        <button type="button" onClick={() => legal.open("terms")}>
          {t.terms}
        </button>
        <button type="button" onClick={() => legal.open("privacy")}>
          {t.privacy}
        </button>
        <button type="button" onClick={openConsentSettings}>
          {cookieSettings}
        </button>
      </span>
      {legal.dialog}
    </footer>
  );
}
