import type { MetadataRoute } from "next";
import { listCannapediaArticleSlugs } from "@/lib/cannapedia-data";
import { locales, siteUrl } from "@/lib/i18n";
import { diaries as mockDiaries, forumTopics as mockForumTopics } from "@/lib/mock-data";

async function getDynamicSlugs() {
  if (!process.env.DATABASE_URL) {
    return {
      diarySlugs: mockDiaries.map((entry) => entry.slug),
      forumSlugs: mockForumTopics.map((entry) => entry.slug),
    };
  }

  try {
    const { db } = await import("@/lib/db");
    const [diaryRows, topicRows] = await Promise.all([
      db.diary.findMany({ select: { slug: true }, orderBy: { createdAt: "desc" } }),
      db.forumTopic.findMany({ select: { slug: true }, orderBy: { sortOrder: "asc" } }),
    ]);

    return {
      diarySlugs: diaryRows.map((entry) => entry.slug),
      forumSlugs: topicRows.map((entry) => entry.slug),
    };
  } catch {
    return {
      diarySlugs: mockDiaries.map((entry) => entry.slug),
      forumSlugs: mockForumTopics.map((entry) => entry.slug),
    };
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { diarySlugs, forumSlugs } = await getDynamicSlugs();
  const cannapediaSlugs = await listCannapediaArticleSlugs();

  const staticRoutes = [
    "",
    "/auth/login",
    "/auth/register",
    "/account",
    "/diaries",
    "/diaries/new",
    "/forum",
    "/cannapedia",
    "/manifesto",
    "/resources",
  ];

  const localizedStatic = locales.flatMap((locale) =>
    staticRoutes.map((path) => ({
      url: `${siteUrl}/${locale}${path}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          locales.map((entry) => [entry, `${siteUrl}/${entry}${path}`]),
        ),
      },
    })),
  );

  const localizedDiaries = locales.flatMap((locale) =>
    diarySlugs.flatMap((slug) => [
      {
        url: `${siteUrl}/${locale}/diaries/${slug}`,
        lastModified: new Date(),
        alternates: {
          languages: Object.fromEntries(
            locales.map((entry) => [entry, `${siteUrl}/${entry}/diaries/${slug}`]),
          ),
        },
      },
      {
        url: `${siteUrl}/${locale}/diaries/${slug}/weeks/new`,
        lastModified: new Date(),
        alternates: {
          languages: Object.fromEntries(
            locales.map((entry) => [
              entry,
              `${siteUrl}/${entry}/diaries/${slug}/weeks/new`,
            ]),
          ),
        },
      },
    ]),
  );

  const localizedForum = locales.flatMap((locale) =>
    forumSlugs.map((slug) => ({
      url: `${siteUrl}/${locale}/forum/${slug}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          locales.map((entry) => [entry, `${siteUrl}/${entry}/forum/${slug}`]),
        ),
      },
    })),
  );

  const localizedCannapedia = locales.flatMap((locale) =>
    cannapediaSlugs.map((slug) => ({
      url: `${siteUrl}/${locale}/cannapedia/${slug}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          locales.map((entry) => [entry, `${siteUrl}/${entry}/cannapedia/${slug}`]),
        ),
      },
    })),
  );

  return [
    ...localizedStatic,
    ...localizedDiaries,
    ...localizedForum,
    ...localizedCannapedia,
  ];
}
