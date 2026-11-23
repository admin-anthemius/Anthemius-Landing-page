import Image from "next/image";
import Cta from "@/components/Cta";
import Dock from "@/components/Dock";
import Footer from "@/components/Footer";
import LangBanner, { type BannerText } from "@/components/LangBanner";
import LangSwitch from "@/components/LangSwitch";
import Price from "@/components/Price";
import RevealFallback from "@/components/RevealFallback";
import { DICTS, LANG_HINT } from "@/lib/content";
import { ALT_LOCALES, LOCALES, fmt, siteHome, type Locale } from "@/lib/i18n";
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
  const spoken = <Price lang={lang} field="spoken" />;

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
          <div className="top-end">
            <LangSwitch lang={lang} title={t.nav.language} names={names} hints={LANG_HINT} />
          </div>
        </div>
      </header>

      <main id="main">
        {/* ── Offer ─────────────────────────────────────────────────────── */}
        <section className="hero">
          <div className="hero-text">
            <p className="kicker">{f(t.hero.kicker)}</p>
            <h1>
              <span className="price">{price}</span>
              <span className="price-for">
                {t.hero.priceFor}
                <em>Anthemius {OFFER.plan}</em>
                {t.hero.priceForEnd}
              </span>
            </h1>
            <p className="lede">{withPrice(f(t.hero.lede), spoken)}</p>
            <div className="hero-action">
              <Cta location="hero">{f(t.hero.cta)}</Cta>
              <p className="fine">{t.hero.fine}</p>
            </div>
          </div>

          <figure className="plate">
            <div className="plate-img">
              <Image src="/img/living.jpg" alt={t.hero.plateAlt} fill sizes="(max-width: 900px) 100vw, 44vw" priority />
            </div>
            <figcaption>
              <span>{t.hero.plateCaption[0]}</span>
              <span>{t.hero.plateCaption[1]}</span>
            </figcaption>
          </figure>
        </section>

        {/* ── What the plan adds ───────────────────────────────────────── */}
        <section className="adds">
          <div className="col-head">
            <h2>{f(t.adds.h2)}</h2>
            <p>{f(t.adds.p)}</p>
          </div>
          <dl className="adds-list">
            {t.adds.items.map((it) => (
              <div key={it.title}>
                <dt>{it.title}</dt>
                <dd>{it.body}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── A month is enough ────────────────────────────────────────── */}
        <section className="month">
          <div className="month-inner">
            <div className="month-head">
              <h2>
                {t.month.h2a}
                <br />
                {t.month.h2b1}
                <em>{t.month.h2b2}</em>
              </h2>
              <blockquote>
                <p>{t.month.quote}</p>
                <cite>{t.month.cite}</cite>
              </blockquote>
            </div>

            <figure className="screen">
              <Image src="/img/split.jpg" alt={t.month.screenAlt} width={2250} height={1462} sizes="(max-width: 1240px) 100vw, 1160px" />
              <figcaption>{t.month.screenCaption}</figcaption>
            </figure>

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
        <section className="regions">
          <div className="col-head">
            <h2>{t.rates.h2}</h2>
            <p>{f(t.rates.p)}</p>
          </div>
          <table className="rates">
            <caption className="sr">{t.rates.caption}</caption>
            <thead>
              <tr>
                <th scope="col">{t.rates.region}</th>
                <th scope="col">{f(t.rates.month)}</th>
                <th scope="col">{t.rates.billed}</th>
              </tr>
            </thead>
            <tbody>
              {REGIONS.map((r) => (
                <tr key={r} className={`row-${r}`}>
                  <th scope="row">
                    {t.regions[r].label}
                    <span className="yours">{t.rates.yours}</span>
                  </th>
                  <td className="rate">{OFFER.prices[r].amount}</td>
                  <td>{OFFER.prices[r].currency}</td>
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

      <Footer lang={lang} t={t.footer} cookieSettings={t.consent.settings} />

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
