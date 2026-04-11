import type { Locale } from "@/lib/i18n";

type TranslateResult = {
  text: string;
  translated: boolean;
  sourceLang?: string;
};

const translateCache = new Map<string, TranslateResult>();
const supportedLocale = new Set<Locale>(["ka", "en", "ru"]);

function inferLanguageByScript(text: string): Locale | null {
  if (/[\u10A0-\u10FF]/.test(text)) return "ka";
  if (/[\u0400-\u04FF]/.test(text)) return "ru";
  if (/[A-Za-z]/.test(text)) return "en";
  return null;
}

function normalize(input: string) {
  return input.trim();
}

export async function autoTranslateText(
  text: string,
  targetLocale: Locale,
): Promise<TranslateResult> {
  const source = normalize(text);
  if (!source || !supportedLocale.has(targetLocale)) {
    return { text: source, translated: false };
  }

  const inferred = inferLanguageByScript(source);
  if (inferred && inferred === targetLocale) {
    return { text: source, translated: false, sourceLang: inferred };
  }

  const cacheKey = `${targetLocale}::${source}`;
  const cached = translateCache.get(cacheKey);
  if (cached) return cached;

  try {
    const url =
      "https://translate.googleapis.com/translate_a/single" +
      `?client=gtx&sl=auto&tl=${encodeURIComponent(targetLocale)}` +
      `&dt=t&q=${encodeURIComponent(source)}`;
    const response = await fetch(url, {
      next: { revalidate: 86_400 },
    });
    if (!response.ok) {
      const fallback = { text: source, translated: false };
      translateCache.set(cacheKey, fallback);
      return fallback;
    }

    const payload = (await response.json()) as any[];
    const translatedText = Array.isArray(payload?.[0])
      ? payload[0].map((entry: any[]) => entry?.[0] ?? "").join("")
      : source;
    const detected = typeof payload?.[2] === "string" ? payload[2] : undefined;
    const translated = Boolean(translatedText) && translatedText !== source;

    const result: TranslateResult = {
      text: translated ? translatedText : source,
      translated,
      sourceLang: detected,
    };
    translateCache.set(cacheKey, result);
    return result;
  } catch {
    const fallback = { text: source, translated: false };
    translateCache.set(cacheKey, fallback);
    return fallback;
  }
}

