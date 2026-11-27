/**
 * Black Friday offer: the commercial constants. Every sentence on the page lives in
 * lib/content/<locale>.ts (one dictionary per language); only prices, plan and checkout live here.
 * Confirm each value marked CONFIRM before the page goes live.
 */

export type Region = "us" | "eu" | "in";

export const OFFER = {
  /** The plan name as on anthemius.io/pricing (Studio: $59 / €59 / ₹4,499 per user per month). */
  plan: "Studio",

  /** CONFIRM: where the button goes. Ad UTM parameters and the region are appended automatically. */
  ctaUrl: "https://design.anthemius.io/login",
  ctaParams: { promo: "black-friday-2026" } as Record<string, string>,

  /**
   * Prices are shown the same way in every language: the currency follows the region, not the page language.
   * `amount` is the promotional first month; `then` is the standard Studio price per user per month on
   * anthemius.io/pricing (features/pricing/plans.ts there), so the two must be kept in step.
   */
  prices: {
    us: { amount: "$1.99", then: "$59", currency: "USD" },
    eu: { amount: "€1,99", then: "€59", currency: "EUR" },
    in: { amount: "₹99", then: "₹4,499", currency: "INR" },
  } satisfies Record<Region, { amount: string; then: string; currency: string }>,
};

export const REGIONS: Region[] = ["us", "eu", "in"];
