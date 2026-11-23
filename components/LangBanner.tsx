"use client";

import { useEffect, useState } from "react";
import { readCookie } from "@/lib/consent";
import { LANG_COOKIE, SUGGEST_COOKIE, htmlLang, homePath, isLocale, rememberLang, type Locale } from "@/lib/i18n";
import { goTo } from "./LangSwitch";

export type BannerText = { text: string; switch: string; stay: string; language: string };

/**
 * Shown on the English page only, when the visitor's country (or browser language)
 * points to one of our other languages (the middleware leaves it in the anth-suggest
 * cookie). Written in that language, since that is the one the visitor reads.
 * Never redirects on its own.
 */
export default function LangBanner({ lang, banners }: { lang: Locale; banners: Partial<Record<Locale, BannerText>> }) {
  const [suggest, setSuggest] = useState<Locale | null>(null);

  useEffect(() => {
    if (lang !== "en") return;
    const raf = requestAnimationFrame(() => {
      // an explicit choice (cookie) always silences the suggestion
      if (isLocale(readCookie(LANG_COOKIE))) return;
      const s = readCookie(SUGGEST_COOKIE);
      if (isLocale(s) && s !== "en") setSuggest(s);
    });
    return () => cancelAnimationFrame(raf);
  }, [lang]);

  const s = suggest ? banners[suggest] : null;
  if (!suggest || !s) return null;

  return (
    <div className="lang-banner" role="region" aria-label={s.language} lang={htmlLang(suggest)}>
      <span className="lang-banner-globe" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.8 2.5 15.2 0 18M12 3c-2.5 2.8-2.5 15.2 0 18" />
        </svg>
      </span>
      <span>{s.text}</span>
      <a
        className="lang-banner-go"
        href={homePath(suggest)}
        onClick={(e) => {
          e.preventDefault();
          rememberLang(suggest); // both answers are explicit choices
          goTo(suggest);
        }}
      >
        {s.switch}
      </a>
      <button
        type="button"
        className="lang-banner-stay"
        onClick={() => {
          rememberLang("en");
          setSuggest(null);
        }}
      >
        {s.stay}
      </button>
    </div>
  );
}
