/*
 * Cookie consent. Same model as anthemius.io: no tracking or advertising cookies; the only
 * optional ones are preferences:
 *   anth-suggest  language suggestion worked out by the middleware (30 days)
 *   anth-lang     the language a visitor picked   (1 year with consent, else this session)
 * The answer itself lives in `anth-consent` (strictly necessary: it records the choice).
 * Shared by the middleware (server) and the page (client); no React here.
 */

export const CONSENT_COOKIE = "anth-consent";
export type Consent = "all" | "necessary";
const CONSENT_MAX_AGE = 60 * 60 * 24 * 180; // ask again after six months

export const isConsent = (v: string | undefined | null): v is Consent => v === "all" || v === "necessary";

/** Browser-side: read one cookie. */
export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

/** Browser-side: the visitor's answer, or null if they have not answered yet. */
export function readConsent(): Consent | null {
  const v = readCookie(CONSENT_COOKIE);
  return isConsent(v) ? v : null;
}

const secureFlag = () => (typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "");

/**
 * Browser-side: write a preference cookie. With consent it persists for `maxAge`;
 * without (or before an answer) it lasts only for this browser session.
 */
export function setPrefCookie(name: string, value: string, maxAge: number) {
  const keep = readConsent() === "all" ? `; Max-Age=${maxAge}` : "";
  document.cookie = `${name}=${value}; Path=/${keep}; SameSite=Lax${secureFlag()}`;
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${secureFlag()}`;
}

/** Fired on window when the answer changes or someone asks to see the settings again. */
export const CONSENT_EVENT = "anth-consent";

/** Browser-side: store the answer. "necessary" also clears the optional cookies. */
export function saveConsent(c: Consent) {
  document.cookie = `${CONSENT_COOKIE}=${c}; Path=/; Max-Age=${CONSENT_MAX_AGE}; SameSite=Lax${secureFlag()}`;
  if (c === "necessary") {
    deleteCookie("anth-suggest");
    // keep the visitor's choice for this session only: rewrite it without an expiry
    const v = readCookie("anth-lang");
    if (v) document.cookie = `anth-lang=${v}; Path=/; SameSite=Lax${secureFlag()}`;
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

/** Browser-side: reopen the consent card (footer "Cookie settings"). */
export function openConsentSettings() {
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: "open" }));
}
