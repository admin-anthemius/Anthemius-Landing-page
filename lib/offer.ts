/**
 * Black Friday offer: the commercial constants. Every sentence on the page lives in
 * lib/content/<locale>.ts (one dictionary per language); only prices, plan and checkout live here.
 * Confirm each value marked CONFIRM before the page goes live.
 */

export type Region = "us" | "eu" | "in";

export const OFFER = {
  /** CONFIRM: the plan name as it appears at checkout and on the pricing page. */
  plan: "Pro",

  /** CONFIRM: where the button goes. Ad UTM parameters and the region are appended automatically. */
  ctaUrl: "https://design.anthemius.io/login",
  ctaParams: { promo: "black-friday-2026" } as Record<string, string>,

  /** Prices are shown the same way in every language: the currency follows the region, not the page language. */
  prices: {
    us: { amount: "$0.99", currency: "USD" },
    eu: { amount: "€0,99", currency: "EUR" },
    in: { amount: "₹99", currency: "INR" },
  } satisfies Record<Region, { amount: string; currency: string }>,
};

export const REGIONS: Region[] = ["us", "eu", "in"];
