import { DICTS } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { OFFER, REGIONS } from "@/lib/offer";

/**
 * Renders the price for all three regions; CSS shows the one matching
 * <html data-region>. No client state, so there is no flash of the wrong currency.
 * `spoken` is the amount in words, in the page's language.
 */
export default function Price({ lang, field = "amount" }: { lang: Locale; field?: "amount" | "spoken" }) {
  const t = DICTS[lang];
  return (
    <>
      {REGIONS.map((r) => (
        <span key={r} className={`r r-${r}`}>
          {field === "spoken" ? t.regions[r].spoken : OFFER.prices[r].amount}
        </span>
      ))}
    </>
  );
}
