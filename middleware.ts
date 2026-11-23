import { NextResponse, type NextRequest } from "next/server";
import { CONSENT_COOKIE } from "@/lib/consent";
import {
  COUNTRY_LOCALE,
  REGION_COOKIE,
  LANG_COOKIE,
  MULTILINGUAL,
  SUGGEST_COOKIE,
  countryFromAcceptLanguage,
  fromAcceptLanguage,
  homePath,
  isLocale,
  regionForCountry,
  type Locale,
} from "@/lib/i18n";

/**
 * Language detection for the offer page. Cookie-based, never surprising (same rules as anthemius.io):
 *
 * 1. An explicit choice wins. The switcher and the banner store it in the
 *    `anth-lang` cookie (1 year); "/" then sends that visitor to /en-in, /nl…
 * 2. Otherwise we only SUGGEST. The visitor's country (from the host's geo
 *    header) or, failing that, their browser languages pick one of ours; the
 *    suggestion goes into the `anth-suggest` cookie and the English page shows
 *    a small banner offering it. Nobody is moved without asking.
 * 3. Crawlers are never redirected, so every language version stays indexable
 *    through its own URL and the hreflang alternates.
 */

/** Country headers set by common hosts / CDNs, in order of trust. */
const COUNTRY_HEADERS = ["x-vercel-ip-country", "cf-ipcountry", "cloudfront-viewer-country", "x-country-code", "x-geo-country"];
const BOT = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|whatsapp|telegram/i;
const SUGGEST_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function countryOf(req: NextRequest): string | null {
  // development only: ?country=IN simulates a visitor from India (there is no geo header on localhost)
  if (process.env.NODE_ENV !== "production") {
    const test = req.nextUrl.searchParams.get("country")?.toUpperCase();
    if (test && /^[A-Z]{2}$/.test(test)) return test;
  }
  for (const h of COUNTRY_HEADERS) {
    const country = req.headers.get(h)?.toUpperCase();
    if (country && country !== "XX" && country !== "T1") return country;
  }
  return null;
}

function detect(req: NextRequest): Locale {
  const browser = fromAcceptLanguage(req.headers.get("accept-language"));
  const country = countryOf(req);
  if (!country) return browser ?? "en";
  const several = MULTILINGUAL[country];
  if (several) return browser && several.includes(browser) ? browser : several[0];
  // a known country decides: ours if it maps, otherwise English
  return COUNTRY_LOCALE[country] ?? "en";
}

/**
 * Price region for the English page, first match wins: the host's geo header, then the region in the
 * browser's languages (en-IN, nl-NL), else nothing (the page falls back to the browser time zone).
 * India → ₹, euro countries → €, everyone else → $. The other languages price by language instead.
 */
function regionOf(req: NextRequest) {
  const country = countryOf(req) ?? countryFromAcceptLanguage(req.headers.get("accept-language"));
  return country ? regionForCountry(country) : null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (BOT.test(req.headers.get("user-agent") ?? "")) return NextResponse.next();

  const chosen = req.cookies.get(LANG_COOKIE)?.value;
  const secure = req.nextUrl.protocol === "https:";

  // Only "/" is ever redirected, and only for someone who chose a language.
  if (pathname === "/" && isLocale(chosen) && chosen !== "en") {
    const url = req.nextUrl.clone();
    url.pathname = homePath(chosen); // search (utm_*, region) is kept
    const res = NextResponse.redirect(url, 307);
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  }

  const res = NextResponse.next();
  if (pathname !== "/") return res;

  // the price region is a plain session cookie: the page needs it to show the right currency at first paint
  const region = regionOf(req);
  if (region) res.cookies.set(REGION_COOKIE, region, { path: "/", sameSite: "lax", secure });
  else if (req.cookies.has(REGION_COOKIE)) res.cookies.delete(REGION_COOKIE);

  // No explicit choice yet: work out a suggestion for the banner, unless the
  // visitor declined optional cookies (the suggestion is one).
  const declined = req.cookies.get(CONSENT_COOKIE)?.value === "necessary";
  const suggestion = isLocale(chosen) || declined ? null : detect(req);
  if (suggestion && suggestion !== "en") {
    res.cookies.set(SUGGEST_COOKIE, suggestion, { path: "/", maxAge: SUGGEST_MAX_AGE, sameSite: "lax", secure });
  } else if (req.cookies.has(SUGGEST_COOKIE)) {
    res.cookies.delete(SUGGEST_COOKIE);
  }
  return res;
}

export const config = {
  // the offer page in every language; nothing else pays for the middleware
  matcher: ["/", "/en-in", "/nl", "/fr", "/es", "/fi"],
};
