# Anthemius — Black Friday landing page

One page for the Instagram, X and LinkedIn campaign, in six languages (English, English India, Dutch, French, Spanish, Finnish). Next.js 15.

```bash
npm install
npm run dev      # http://localhost:3220
npm run build && npm start
```

## Before it goes live

- Prices, plan name and checkout URL live in `lib/offer.ts`. Confirm each line marked `CONFIRM`.
- All copy lives in `lib/content/<locale>.ts`, one dictionary per language (`en.ts` is the source; the others must match its shape). The offer end date is in each dictionary's `ends`.

## Languages and cookies

Same rules as anthemius.io (`middleware.ts`, `lib/i18n.ts`, `lib/consent.ts`):

- English is at `/`; the others at `/en-in`, `/nl`, `/fr`, `/es`, `/fi`.
- An explicit choice (language menu or banner) is stored in the `anth-lang` cookie and `/` then redirects to it. Bots are never redirected.
- Otherwise the visitor's country (host geo header) or browser language only **suggests** a language: the `anth-suggest` cookie drives a banner on the English page. Nobody is moved without asking.
- A cookie-consent card appears on the first visit; if optional cookies are declined, choices last only for the session and no suggestion is made.
- Locally there is no geo header: append `?country=IN` (development only) to simulate a country.

## Price region

The price follows the language (`en-in` → ₹, `nl`/`fr`/`es`/`fi` → €). On the English page it follows the visitor's country (`anth-region` session cookie set by the middleware: India ₹, euro countries €, everyone else $), then the browser time zone. An ad link can force a region: `/?region=us|eu|in&utm_source=...`. `utm_*`, the region and `promo=black-friday-2026` are passed on to the checkout link.

## Type

- Display: Bodoni Moda, chosen to match the Didone of the Anthemius wordmark.
- Text: Geist, the text face already used on anthemius.io.

## Files

- `components/Landing.tsx` — the page; `app/(site)` serves `/`, `app/[lang]` the other languages, `app/RootShell.tsx` is the shared `<html>` shell and metadata
- `app/globals.css` — all styling and motion (scroll-driven animation is an enhancement; reduced-motion users get none)
- `components/` — price, language menu and banner, cookie card, legal dialog, footer, checkout button, mobile offer bar
- `public/legal/` — the signed Terms of Use and Privacy Policy PDFs shown from the footer
- `public/og.png` — link-preview card (1200×630, English). To regenerate, move `tools/og-route` back to `app/og`, open `/og` and screenshot at 1200×630.
