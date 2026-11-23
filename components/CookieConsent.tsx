"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { CONSENT_EVENT, readConsent, saveConsent, type Consent } from "@/lib/consent";
import type { Dict } from "@/lib/content";
import { useLegalDialog } from "./LegalDialog";
import styles from "./CookieConsent.module.css";

export type ConsentText = {
  title: string;
  text: string;
  accept: string;
  necessary: string;
  privacy: string;
};

/* The answer lives in a cookie; components follow it through this tiny store. */
let reopened = false;
const subscribe = (notify: () => void) => {
  const on = (e: Event) => {
    if ((e as CustomEvent).detail === "open") reopened = true;
    notify();
  };
  window.addEventListener(CONSENT_EVENT, on);
  return () => window.removeEventListener(CONSENT_EVENT, on);
};
/** "ask" = show the card; "done" = answered; "server" = not in a browser yet. */
const snapshot = () => (reopened || !readConsent() ? "ask" : "done");
const serverSnapshot = () => "server";

/**
 * Cookie card, bottom corner, on the first visit (and again from "Cookie settings" in
 * the footer). Non-blocking: the page stays usable. Text comes from the server layout
 * in the page's language.
 */
export default function CookieConsent({ text, legalText }: Readonly<{ text: ConsentText; legalText: Dict["legal"] }>) {
  const state = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const legal = useLegalDialog(legalText);
  const [leaving, setLeaving] = useState(false);

  const answer = useCallback((c: Consent) => {
    setLeaving(true);
    // let the card slide out, then record the answer (which hides it)
    window.setTimeout(() => {
      reopened = false;
      saveConsent(c);
      setLeaving(false);
    }, 180);
  }, []);

  if (state !== "ask") return legal.dialog;
  return (
    <>
      <section
        className={`${styles.card} ${leaving ? styles.leaving : ""}`}
        role="dialog"
        aria-modal="false"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-text"
      >
        <h2 id="cookie-consent-title" className={styles.title}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <path d="M21 12.3A9 9 0 1 1 11.7 3a3.5 3.5 0 0 0 4.3 4.3 3.5 3.5 0 0 0 5 5Z" />
            <circle cx="8.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
            <circle cx="12" cy="15.5" r="1" fill="currentColor" stroke="none" />
            <circle cx="16" cy="13" r="0.9" fill="currentColor" stroke="none" />
          </svg>
          {text.title}
        </h2>
        <p id="cookie-consent-text" className={styles.text}>
          {text.text}{" "}
          <button type="button" className={styles.link} onClick={() => legal.open("privacy")}>
            {text.privacy}
          </button>
        </p>
        <div className={styles.actions}>
          <button type="button" className={`${styles.btn} ${styles.quiet}`} onClick={() => answer("necessary")}>
            {text.necessary}
          </button>
          <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={() => answer("all")}>
            {text.accept}
          </button>
        </div>
      </section>
      {legal.dialog}
    </>
  );
}
