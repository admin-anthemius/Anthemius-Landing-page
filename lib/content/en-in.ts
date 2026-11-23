import { en, type Dict } from "./en";

/** English for India: same copy, the India price, and its own banner. */
export const enIn: Dict = {
  ...en,
  meta: { ...en.meta, title: "Black Friday: one month of Anthemius Pro for ₹99" },
  langName: "English (India)",
  banner: {
    text: "This page is available for India.",
    switch: "View the India site",
    stay: "Stay on the global site",
  },
};
