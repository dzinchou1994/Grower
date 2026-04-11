import type { Metadata } from "next";
import { getLocalizedPath, siteUrl, type Locale } from "@/lib/i18n";

/** Resolves stored image URLs (absolute or site-relative) for OG tags. */
export function diaryAbsoluteImageUrl(url: string | null | undefined): string | undefined {
  if (!url?.trim()) {
    return undefined;
  }
  const u = url.trim();
  if (/^https?:\/\//i.test(u)) {
    return u;
  }
  if (u.startsWith("//")) {
    return `https:${u}`;
  }
  const path = u.startsWith("/") ? u : `/${u}`;
  return `${siteUrl}${path}`;
}

export function diaryOpenGraphMetadata(input: {
  locale: Locale;
  /** Path without locale prefix, e.g. `/diaries/slug` or `/diaries/slug/weeks/3` */
  path: string;
  title: string;
  description: string;
  imageCandidates: Array<string | null | undefined>;
}): Pick<Metadata, "openGraph" | "twitter"> {
  const canonical = `${siteUrl}${getLocalizedPath(input.locale, input.path)}`;
  const description = input.description.trim().slice(0, 160);

  let imageUrl: string | undefined;
  for (const c of input.imageCandidates) {
    const abs = diaryAbsoluteImageUrl(c ?? undefined);
    if (abs) {
      imageUrl = abs;
      break;
    }
  }
  const ogImage = imageUrl ?? `${siteUrl}/logo.svg`;

  return {
    openGraph: {
      title: input.title,
      description,
      url: canonical,
      siteName: "Grower.ge",
      locale: input.locale,
      type: "article",
      images: [{ url: ogImage, alt: input.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description,
      images: [ogImage],
    },
  };
}
