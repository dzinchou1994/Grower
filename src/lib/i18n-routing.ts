export const locales = ["ka", "en", "ru"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ka";
export const siteUrl = "https://grower.ge";

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getLocalizedPath(locale: Locale, path = "") {
  return `/${locale}${path}`;
}
