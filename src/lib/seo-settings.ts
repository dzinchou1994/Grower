import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getAlternates, type Locale } from "@/lib/i18n";

export type SeoPage = "HOME" | "FORUM" | "DIARIES" | "CANNAPEDIA";

type SeoOverride = {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string | null;
  ogDescription: string | null;
  keywords: string | null;
  noIndex: boolean;
};

const hasDatabase = Boolean(process.env.DATABASE_URL);
const seoDb = db as any;

declare global {
  var __seoSettingsUnavailable: boolean | undefined;
}

async function getSeoOverride(page: SeoPage, locale: Locale): Promise<SeoOverride | null> {
  if (!hasDatabase || global.__seoSettingsUnavailable) {
    return null;
  }

  if (global.__seoSettingsUnavailable === undefined) {
    try {
      const rows = (await seoDb.$queryRawUnsafe(
        "select to_regclass('public.\"SeoSetting\"')::text as seo_table",
      )) as Array<{ seo_table: string | null }>;
      global.__seoSettingsUnavailable = !rows?.[0]?.seo_table;
    } catch {
      global.__seoSettingsUnavailable = true;
    }
  }

  if (global.__seoSettingsUnavailable) {
    return null;
  }

  try {
    const row = await seoDb.seoSetting.findUnique({
      where: {
        page_locale: { page, locale },
      },
      select: {
        metaTitle: true,
        metaDescription: true,
        ogTitle: true,
        ogDescription: true,
        keywords: true,
        noIndex: true,
      },
    });
    return row ?? null;
  } catch {
    global.__seoSettingsUnavailable = true;
    return null;
  }
}

export async function getPageMetadataWithSeo(input: {
  page: SeoPage;
  locale: Locale;
  path: string;
  title: string;
  description: string;
}): Promise<Metadata> {
  const override = await getSeoOverride(input.page, input.locale);
  const title = override?.metaTitle?.trim() || input.title;
  const description = override?.metaDescription?.trim() || input.description;
  const keywords = override?.keywords
    ?.split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return {
    title,
    description,
    alternates: getAlternates(input.path),
    robots: override?.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    keywords: keywords && keywords.length > 0 ? keywords : undefined,
    openGraph: {
      title: override?.ogTitle?.trim() || title,
      description: override?.ogDescription?.trim() || description,
    },
  };
}

