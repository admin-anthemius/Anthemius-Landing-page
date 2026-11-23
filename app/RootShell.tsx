import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Geist } from "next/font/google";
import CookieConsent from "@/components/CookieConsent";
import { DICTS } from "@/lib/content";
import { LOCALES, homePath, htmlLang, regionForLocale, type Locale } from "@/lib/i18n";
import "./globals.css";

/*
 * The <html>/<body> shell shared by the two root layouts:
 *   app/(site)/layout.tsx  → /                          (lang="en")
 *   app/[lang]/layout.tsx  → /en-in, /nl, /fr, /es, /fi (lang from the URL)
 * Two root layouts are what let each language page declare its own <html lang>.
 */

/**
 * Type system
 * - Display: Bodoni Moda. The Anthemius wordmark is a Didone; the display face is drawn from it.
 * - Text: Geist, the same text face as anthemius.io, so the click from landing page to site is seamless.
 */
const display = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});
const text = Geist({ subsets: ["latin"], variable: "--font-text", display: "swap" });

export const viewport: Viewport = { themeColor: "#111213", viewportFit: "cover" };

/** Title, description, social cards and hreflang alternates for one language version. */
export function pageMetadata(lang: Locale): Metadata {
  const { title, description } = DICTS[lang].meta;
  return {
    metadataBase: new URL("https://www.anthemius.io"),
    title,
    description,
    icons: { icon: "/mark.png" },
    alternates: {
      canonical: homePath(lang),
      languages: {
        ...Object.fromEntries(LOCALES.map((l) => [htmlLang(l), homePath(l)])),
        "x-default": "/",
      },
    },
    openGraph: { title, description, type: "website", locale: htmlLang(lang).replace("-", "_"), images: [{ url: "/og.png", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  };
}

/**
 * Runs before first paint, so the price never flashes. An ad link's ?region= wins; then the page
 * language (en-in → ₹, nl/fr/es/fi → €); then, on the English page, the visitor's country (the
 * anth-region cookie the middleware sets from the geo header); last the browser time zone.
 */
const regionScript = (def: string) =>
  `(function(){var d=document.documentElement,ok=['us','eu','in'],r='',L='${def}';try{r=(new URLSearchParams(location.search).get('region')||'').toLowerCase();if(ok.indexOf(r)<0){var k=(document.cookie.match(/(?:^|; )anth-region=([a-z]+)/)||[])[1]||'';if(L){r=L}else if(ok.indexOf(k)>=0){r=k}else{var z=Intl.DateTimeFormat().resolvedOptions().timeZone||'';r=(z==='Asia/Kolkata'||z==='Asia/Calcutta')?'in':(/^Europe\\/(Vienna|Brussels|Berlin|Paris|Rome|Madrid|Amsterdam|Dublin|Lisbon|Helsinki|Athens|Luxembourg|Malta|Bratislava|Ljubljana|Tallinn|Riga|Vilnius|Zagreb|Sofia|Andorra|Monaco|San_Marino|Vatican|Busingen)$/.test(z)||z==='Atlantic/Azores'||z==='Atlantic/Madeira'?'eu':'us')}}}catch(e){r=L||'us'}d.dataset.region=r;try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('cu-ready')}catch(e){}})();`;

export default function RootShell({ lang, children }: Readonly<{ lang: Locale; children: React.ReactNode }>) {
  return (
    <html lang={htmlLang(lang)} data-region="us" className={`${display.variable} ${text.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: regionScript(regionForLocale(lang) ?? "") }} />
      </head>
      <body>
        {children}
        <CookieConsent text={DICTS[lang].consent} legalText={DICTS[lang].legal} />
      </body>
    </html>
  );
}
