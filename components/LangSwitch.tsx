"use client";

import { useEffect, useState } from "react";
import { LOCALES, homePath, htmlLang, langCode, rememberLang, type Locale } from "@/lib/i18n";

/** Move to a language, keeping utm_* / region / hash so the ad attribution survives the switch. */
export function goTo(l: Locale) {
  window.location.assign(`${homePath(l)}${window.location.search}${window.location.hash}`);
}

/**
 * Language menu: a pill button that opens a small card of languages. Options are
 * real links (crawlable, open-in-new-tab works); choosing one is remembered in the
 * language cookie. Esc / outside click close it; arrow keys move between options.
 */
export default function LangSwitch({
  lang,
  title,
  names,
  hints,
}: {
  lang: Locale;
  title: string;
  names: Record<Locale, string>;
  hints: Record<Locale, string>;
}) {
  const [open, setOpen] = useState(false);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || !root) return;
    const onDown = (e: PointerEvent) => {
      if (!root.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        root.querySelector<HTMLButtonElement>("button")?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    // move focus into the menu, onto the current language
    root.querySelector<HTMLAnchorElement>("a[aria-current='true']")?.focus();
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, root]);

  const onMenuKey = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const items = [...e.currentTarget.querySelectorAll<HTMLAnchorElement>("a")];
    const i = items.indexOf(document.activeElement as HTMLAnchorElement);
    const next =
      e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : (i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    items[next]?.focus();
  };

  return (
    <div ref={setRoot} className={`lang-switch${open ? " open" : ""}`}>
      <button
        type="button"
        className="lang-btn"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`${title}: ${names[lang]}`}
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.8 2.5 15.2 0 18M12 3c-2.5 2.8-2.5 15.2 0 18" />
        </svg>
        <span className="lang-code">{langCode(lang)}</span>
        <span className="lang-name">{names[lang]}</span>
        <svg className="lang-chev" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="lang-menu">
          <p className="lang-menu-title">{title}</p>
          <ul onKeyDown={onMenuKey}>
            {LOCALES.map((l) => (
              <li key={l}>
                <a
                  href={homePath(l)}
                  hrefLang={htmlLang(l)}
                  lang={htmlLang(l)}
                  aria-current={l === lang ? "true" : undefined}
                  className={`lang-opt${l === lang ? " on" : ""}`}
                  onClick={(e) => {
                    rememberLang(l); // explicit choice: remembered, and the middleware honours it on "/"
                    e.preventDefault();
                    if (l === lang) setOpen(false);
                    else goTo(l);
                  }}
                >
                  <span className="lang-opt-code">{langCode(l)}</span>
                  <span className="lang-opt-text">
                    <b>{names[l]}</b>
                    <small>{hints[l]}</small>
                  </span>
                  {l === lang && (
                    <svg className="lang-opt-check" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m5 12.5 4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
