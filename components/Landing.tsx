import Image from "next/image";
import Cta from "@/components/Cta";
import Dock from "@/components/Dock";
import Footer from "@/components/Footer";
import LangBanner, { type BannerText } from "@/components/LangBanner";
import LangSwitch from "@/components/LangSwitch";
import Price from "@/components/Price";
import RevealFallback from "@/components/RevealFallback";
import StudioFeatures from "@/components/StudioFeatures";
import WorkflowStudio from "@/components/WorkflowStudio";
import { DICTS, LANG_HINT } from "@/lib/content";
import { ALT_LOCALES, LOCALES, fmt, siteHome, type Locale } from "@/lib/i18n";
import OfficePlan from "@/components/OfficePlan";
import { OFFER, REGIONS } from "@/lib/offer";

const names = Object.fromEntries(LOCALES.map((l) => [l, DICTS[l].langName])) as Record<Locale, string>;
const banners = Object.fromEntries(
  ALT_LOCALES.map((l) => [l, { ...DICTS[l].banner, language: DICTS[l].nav.language }]),
) as Partial<Record<Locale, BannerText>>;

/** Replace a `{price}` placeholder with the live price nodes. */
function withPrice(template: string, price: React.ReactNode) {
  const [a, b] = template.split("{price}");
  return (
    <>
      {a}
      {price}
      {b}
    </>
  );
}

export default function Landing({ lang }: Readonly<{ lang: Locale }>) {
  const t = DICTS[lang];
  const vars = { plan: OFFER.plan, date: t.ends.short, endsOn: t.ends.long };
  const f = (s: string) => fmt(s, vars);
  const price = <Price lang={lang} />;

  return (
    <>
      <RevealFallback />
      <div className="scroll-progress" aria-hidden="true" />
      <LangBanner lang={lang} banners={banners} />
      <a className="skip" href="#main">
        {t.skip}
      </a>
      <header className="top-bar">
        <div className="top">
          <a href={siteHome(lang)} className="wordmark" aria-label={t.nav.home}>
            <Image src="/mark.png" alt="" width={126} height={131} className="wordmark-mark" priority />
            <Image src="/wordmark-nav.png" alt="Anthemius" width={640} height={88} className="wordmark-word" priority />
          </a>
          <nav className="top-nav" aria-label={t.nav.menu}>
            <a href="#features">{t.nav.features}</a>
            <a href="#workflow">{t.nav.workflow}</a>
            <a href="#pricing">{t.nav.pricing}</a>
          </nav>
          <div className="top-end">
            <LangSwitch lang={lang} title={t.nav.language} names={names} hints={LANG_HINT} />
            <div className="top-cta">
              <Cta location="header" variant="ink">
                {t.nav.cta}
              </Cta>
            </div>
          </div>
        </div>
      </header>

      <main id="main">
        {/* ── Offer ─────────────────────────────────────────────────────── */}
        <section className="hero">
          <div className="hero-text">
            <p className="kicker">{f(t.hero.kicker)}</p>
            <h1>
              {t.hero.h1a}
              <em>{t.hero.h1b}</em>
            </h1>
            <p className="lede">{t.hero.lede}</p>
            <p className="hero-offer">
              <span className="price">{price}</span>
              <span className="price-for">
                {t.hero.priceFor}
                <em>Anthemius {OFFER.plan}</em>
                {t.hero.priceForEnd}
              </span>
            </p>
            <p className="renewal">{withPrice(t.hero.renewal, <Price lang={lang} field="then" />)}</p>
            <div className="hero-action">
              <Cta location="hero">{f(t.hero.cta)}</Cta>
              <p className="fine">
                <svg width="20" height="16" viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
                  <path d="M3.5 2h13v9h-13zM1 14h18" />
                </svg>
                {t.hero.fine}
              </p>
            </div>
          </div>

          <OfficePlan lang={lang} t={t.office} />
        </section>

        {/* ── What the plan adds ───────────────────────────────────────── */}
        <StudioFeatures t={t.adds} eyebrow={f(t.adds.eyebrow)} heading={f(t.adds.h2)} description={f(t.adds.p)} />

        {/* ── Workflow ─────────────────────────────────────────────────── */}
        <section className="month" id="workflow">
          <div className="month-inner">
            <div className="month-head">
              <p className="eyebrow">{t.nav.workflow}</p>
              <h2>
                {t.month.h2a}
                <br />
                {t.month.h2b1}
                <em>{t.month.h2b2}</em>
              </h2>
              <p>{t.month.p}</p>
            </div>

            <WorkflowStudio lang={lang} t={t.office} alt={t.month.screenAlt} caption={t.month.screenCaption} />

            <ol className="steps">
              {t.month.steps.map(([title, body], i) => (
                <li key={title} style={{ "--i": i } as React.CSSProperties}>
                  <span className="steps-n" aria-label={String(i + 1)}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Price by region ──────────────────────────────────────────── */}
        <section className="regions" id="pricing">
          <div className="col-head">
            <h2>{t.rates.h2}</h2>
            <p>{f(t.rates.p)}</p>
          </div>
          <table className="rates" role="table">
            <caption className="sr">{t.rates.caption}</caption>
            <thead role="rowgroup">
              <tr role="row">
                <th scope="col" role="columnheader">{t.rates.region}</th>
                <th scope="col" role="columnheader">{f(t.rates.month)}</th>
                <th scope="col" role="columnheader">{t.rates.then}</th>
                <th scope="col" role="columnheader">{t.rates.billed}</th>
              </tr>
            </thead>
            <tbody role="rowgroup">
              {REGIONS.map((r) => (
                <tr key={r} role="row" className={`row-${r}`}>
                  <th scope="row" role="rowheader">
                    {t.regions[r].label}
                    <span className="yours">{t.rates.yours}</span>
                  </th>
                  <td className="rate" role="cell" data-label={f(t.rates.month)}>
                    {OFFER.prices[r].amount}
                  </td>
                  <td className="rate-then" role="cell" data-label={t.rates.then}>
                    {OFFER.prices[r].then}
                  </td>
                  <td role="cell">{OFFER.prices[r].currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── Close ────────────────────────────────────────────────────── */}
        <section className="close">
          <div className="close-main">
            <h2>
              {withPrice(t.close.h2a, price)}
              <br />
              <em>{t.close.h2b}</em>
            </h2>
            <Cta location="close">{f(t.close.cta)}</Cta>
          </div>
          <div className="terms">
            <h3>{t.close.termsTitle}</h3>
            <ul>
              {t.close.terms.map((term) => (
                <li key={term}>{f(term)}</li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <Footer lang={lang} t={t.footer} legalText={t.legal} cookieSettings={t.consent.settings} />

      {/* Mobile: the offer stays within reach while scrolling */}
      <Dock>
        <span>
          <strong>{price}</strong> {f(t.dock.suffix)}
        </span>
        <Cta location="dock">{t.dock.cta}</Cta>
      </Dock>
    </>
  );
}
