import { deleteCookie, setPrefCookie } from "@/lib/consent";
import type { Region } from "@/lib/offer";

/* Locale config shared by the middleware (server) and the page (client). Same locales, URLs,
   country map and cookie names as anthemius.io, so a visitor is treated identically on both.
   No dictionaries here, so the middleware bundle stays small. */

/** English is the default and lives at "/"; the others at "/en-in", "/nl", "/fr", "/es", "/fi". */
export const LOCALES = ["en", "en-in", "nl", "fr", "es", "fi"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const ALT_LOCALES = LOCALES.filter((l) => l !== DEFAULT_LOCALE) as Exclude<Locale, "en">[];

/** BCP 47 form for <html lang> and hreflang: "en-in" → "en-IN". */
export const htmlLang = (l: Locale) => (l === "en-in" ? "en-IN" : l);

/** Short code for the language badges: "en-in" → "IN" (the name beside it says English). */
export const langCode = (l: Locale) => (l === "en-in" ? "IN" : l.toUpperCase());

export const isLocale = (v: string | undefined | null): v is Locale => !!v && (LOCALES as readonly string[]).includes(v);

/** Path of the offer page in a given language. */
export const homePath = (l: Locale) => (l === DEFAULT_LOCALE ? "/" : `/${l}`);

/** Where anthemius.io itself lives in a language (the footer links there). */
export const SITE = "https://www.anthemius.io";
export const siteHome = (l: Locale) => `${SITE}${homePath(l) === "/" ? "" : homePath(l)}`;
export const sitePricing = (l: Locale) => `${SITE}${l === DEFAULT_LOCALE ? "" : `/${l}`}/pricing`;

/** Fill `{name}` placeholders. */
export function fmt(s: string, vars: Record<string, string | number>) {
  return s.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/** Price region a language implies: English → decided by the visitor (menu choice, then country), India → ₹, the rest → €. */
export const regionForLocale = (l: Locale): Region | null => (l === "en" ? null : l === "en-in" ? "in" : "eu");

/** Cookie the middleware sets on "/" with the price region its country points to (session cookie, read before first paint). */
export const REGION_COOKIE = "anth-region";

/** Euro area plus the countries that use the euro without being members (same list as anthemius.io/pricing). */
const EURO_COUNTRIES = new Set([
  "AT", "BE", "HR", "CY", "EE", "FI", "FR", "DE", "GR", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES",
  "AD", "MC", "SM", "VA", "ME", "XK", "AX",
]);

/** Country (ISO 3166-1 alpha-2) → price region: India ₹, euro countries €, everyone else $. */
export function regionForCountry(country: string): Region {
  if (country === "IN") return "in";
  return EURO_COUNTRIES.has(country) ? "eu" : "us";
}

/** Languages spoken mainly in India, for browsers that send no region ("hi" rather than "hi-IN"). */
const INDIAN_LANGUAGES = new Set(["hi", "mr", "ta", "te", "kn", "ml", "gu", "pa", "or", "as"]);

/**
 * The country a browser's language list points to, for hosts that send no geo header (local development,
 * self-hosting): "en-IN" → IN, "nl-NL" → NL, "hi" → IN. The first tag that names a region wins.
 */
export function countryFromAcceptLanguage(header: string | null): string | null {
  if (!header) return null;
  const tags = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return { tag: tag.trim(), q: q ? Number(q.slice(2)) || 0 : 1 };
    })
    .filter((x) => x.tag && x.q > 0)
    .sort((a, b) => b.q - a.q);
  for (const { tag } of tags) {
    const [lang, ...rest] = tag.split("-");
    const region = rest.find((p) => /^[a-z]{2}$/i.test(p));
    if (region) return region.toUpperCase();
    if (INDIAN_LANGUAGES.has(lang.toLowerCase())) return "IN";
  }
  return null;
}

/**
 * Country (ISO 3166-1 alpha-2) → suggested language. Only countries where one
 * of our languages is the main one; everywhere else stays English.
 */
export const COUNTRY_LOCALE: Record<string, Locale> = {
  IN: "en-in",
  FI: "fi",
  AX: "fi",
  NL: "nl",
  SR: "nl",
  AW: "nl",
  CW: "nl",
  SX: "nl",
  BQ: "nl",
  LU: "fr",
  FR: "fr",
  MC: "fr",
  ES: "es",
  MX: "es",
  AR: "es",
  CO: "es",
  CL: "es",
  PE: "es",
  VE: "es",
  EC: "es",
  GT: "es",
  CU: "es",
  BO: "es",
  DO: "es",
  HN: "es",
  PY: "es",
  SV: "es",
  NI: "es",
  CR: "es",
  PA: "es",
  UY: "es",
};

/**
 * Countries with more than one of our languages: the browser's languages decide
 * between them, otherwise the first one (Belgium: Dutch is the majority language).
 */
export const MULTILINGUAL: Record<string, Locale[]> = {
  BE: ["nl", "fr"],
};

/** Cookie the middleware sets with its suggested language (read by the banner). */
export const SUGGEST_COOKIE = "anth-suggest";
/** Cookie holding the visitor's explicit language choice (set by the switcher / banner). */
export const LANG_COOKIE = "anth-lang";
export const LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // one year

/** Cookie set when English (Global) is picked in the language menu: its prices are then in dollars, wherever the visitor is. */
export const CURRENCY_COOKIE = "anth-currency";

/** Browser-side: a pick in the language menu. English pins dollars; any other language goes back to its own currency. */
export function rememberMenuPick(l: Locale) {
  rememberLang(l);
  if (l === "en") setPrefCookie(CURRENCY_COOKIE, "us", LANG_COOKIE_MAX_AGE);
  else deleteCookie(CURRENCY_COOKIE);
}

/** Browser-side: remember an explicit language choice (for a year with cookie consent, else this session). */
export function rememberLang(l: Locale) {
  setPrefCookie(LANG_COOKIE, l, LANG_COOKIE_MAX_AGE);
  deleteCookie(SUGGEST_COOKIE);
}

/**
 * Pick a language from an Accept-Language header, honouring q-weights.
 * "fi-FI,fi;q=0.9,en;q=0.8" → "fi". Returns null if nothing we support.
 */
export function fromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return { tag: tag.toLowerCase(), q: q ? Number(q.slice(2)) || 0 : 1 };
    })
    .filter((x) => x.tag && x.q > 0)
    .sort((a, b) => b.q - a.q);
  for (const { tag } of ranked) {
    if (isLocale(tag)) return tag; // a regional locale we have, e.g. "en-in"
    const primary = tag.split("-")[0];
    if (isLocale(primary)) return primary;
  }
  return null;
}
