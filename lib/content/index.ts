import type { Locale } from "@/lib/i18n";
import { en, type Dict } from "./en";
import { enIn } from "./en-in";
import { es } from "./es";
import { fi } from "./fi";
import { fr } from "./fr";
import { nl } from "./nl";

export type { Dict };

export const DICTS: Record<Locale, Dict> = { en, "en-in": enIn, nl, fr, es, fi };

/** Each language's region hint, shown under its name in the language menu. */
export const LANG_HINT: Record<Locale, string> = {
  en: "Global",
  "en-in": "India",
  nl: "Netherlands",
  fr: "France",
  es: "Spain · Latin America",
  fi: "Finland",
};
