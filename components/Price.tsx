import CountUp from "@/components/CountUp";
import { DICTS } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { OFFER, REGIONS } from "@/lib/offer";

/**
 * Renders the price for all three regions; CSS shows the one matching
 * <html data-region>. No client state, so there is no flash of the wrong currency.
 * `spoken` is the amount in words, in the page's language. `count` makes the amount count up (see CountUp).
 */
export default function Price({
  lang,
  field = "amount",
  count,
}: Readonly<{ lang: Locale; field?: "amount" | "spoken"; count?: boolean }>) {
  const t = DICTS[lang];
  return (
    <>
      {REGIONS.map((r) => (
        <span key={r} className={`r r-${r}`}>
          {field === "spoken" ? (
            t.regions[r].spoken
          ) : count ? (
            <CountUp text={OFFER.prices[r].amount} />
          ) : (
            OFFER.prices[r].amount
          )}
        </span>
      ))}
    </>
  );
}
