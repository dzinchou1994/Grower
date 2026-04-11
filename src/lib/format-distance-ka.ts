import type { Locale } from "@/lib/i18n";

/**
 * date-fns `ka` locale prefixes some `formatDistance*` strings with "დაახლოებით"
 * (~approximately). For UI copy we omit that word.
 */
export function formatDistanceDisplayKa(formatted: string, locale: Locale): string {
  if (locale !== "ka") {
    return formatted;
  }
  return formatted.replace(/^დაახლოებით\s+/u, "");
}
