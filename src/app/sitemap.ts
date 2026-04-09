import type { MetadataRoute } from "next";
import { locales, siteUrl } from "@/lib/i18n";
import { diaries as mockDiaries, forumTopics as mockForumTopics } from "@/lib/mock-data";

async function getDynamicSlugs() {
  if (!process.env.DATABASE_URL) {
    return {
      diarySlugs: mockDiaries.map((entry) => entry.slug),
      diaryWeeks: mockDiaries.flatMap((entry) =>
        entry.weeks.map((week) => ({
          diarySlug: entry.slug,
          weekNumber: week.weekNumber,
        })),
      ),
      forumTopicSlugs: mockForumTopics.map((entry) => entry.slug),
      forumThreads: mockForumTopics.flatMap((entry) =>
        entry.threads.map((thread) => ({
          topicSlug: entry.slug,
          threadSlug: thread.slug,
        })),
      ),
      forumComments: [] as Array<{ topicSlug: string; threadSlug: string; commentId: string }>,
    };
  }

  try {
    const { db } = await import("@/lib/db");
    const [diaryRows, topicRows] = await Promise.all([
      db.diary.findMany({
        select: {
          slug: true,
          weeks: { where: { isHidden: false }, select: { weekNumber: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.forumTopic.findMany({
        select: {
          slug: true,
          threads: {
            where: { isHidden: false },
            select: {
              slug: true,
              comments: { where: { isHidden: false }, select: { id: true } },
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    return {
      diarySlugs: diaryRows.map((entry) => entry.slug),
      diaryWeeks: diaryRows.flatMap((entry) =>
        entry.weeks.map((week) => ({
          diarySlug: entry.slug,
          weekNumber: week.weekNumber,
        })),
      ),
      forumTopicSlugs: topicRows.map((entry) => entry.slug),
      forumThreads: topicRows.flatMap((entry) =>
        entry.threads.map((thread) => ({
          topicSlug: entry.slug,
          threadSlug: thread.slug,
        })),
      ),
      forumComments: topicRows.flatMap((entry) =>
        entry.threads.flatMap((thread) =>
          thread.comments.map((comment) => ({
            topicSlug: entry.slug,
            threadSlug: thread.slug,
            commentId: comment.id,
          })),
        ),
      ),
    };
  } catch {
    return {
      diarySlugs: mockDiaries.map((entry) => entry.slug),
      diaryWeeks: mockDiaries.flatMap((entry) =>
        entry.weeks.map((week) => ({
          diarySlug: entry.slug,
          weekNumber: week.weekNumber,
        })),
      ),
      forumTopicSlugs: mockForumTopics.map((entry) => entry.slug),
      forumThreads: mockForumTopics.flatMap((entry) =>
        entry.threads.map((thread) => ({
          topicSlug: entry.slug,
          threadSlug: thread.slug,
        })),
      ),
      forumComments: [] as Array<{ topicSlug: string; threadSlug: string; commentId: string }>,
    };
  }
}

async function getContentSlugs() {
  const [cannapediaResult, newsResult] = await Promise.allSettled([
    import("@/lib/cannapedia-data").then((mod) => mod.listCannapediaArticleSlugs()),
    import("@/lib/news-data").then((mod) => mod.listNewsSlugs()),
  ]);

  return {
    cannapediaSlugs: cannapediaResult.status === "fulfilled" ? cannapediaResult.value : [],
    newsSlugs: newsResult.status === "fulfilled" ? newsResult.value : [],
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { diarySlugs, diaryWeeks, forumTopicSlugs, forumThreads, forumComments } =
    await getDynamicSlugs();
  const { cannapediaSlugs, newsSlugs } = await getContentSlugs();

  const staticRoutes = [
    "",
    "/diaries",
    "/forum",
    "/cannapedia",
    "/news",
    "/manifesto",
    "/about",
    "/privacy",
    "/terms",
    "/rules",
    "/resources",
    "/contact",
    "/feedback",
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
    diarySlugs.map((slug) => ({
      url: `${siteUrl}/${locale}/diaries/${slug}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          locales.map((entry) => [entry, `${siteUrl}/${entry}/diaries/${slug}`]),
        ),
      },
    })),
  );

  const localizedDiaryWeeks = locales.flatMap((locale) =>
    diaryWeeks.map(({ diarySlug, weekNumber }) => ({
      url: `${siteUrl}/${locale}/diaries/${diarySlug}/weeks/${weekNumber}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          locales.map((entry) => [entry, `${siteUrl}/${entry}/diaries/${diarySlug}/weeks/${weekNumber}`]),
        ),
      },
    })),
  );

  const localizedForumTopics = locales.flatMap((locale) =>
    forumTopicSlugs.map((slug) => ({
      url: `${siteUrl}/${locale}/forum/${slug}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          locales.map((entry) => [entry, `${siteUrl}/${entry}/forum/${slug}`]),
        ),
      },
    })),
  );

  const localizedForumThreads = locales.flatMap((locale) =>
    forumThreads.map(({ topicSlug, threadSlug }) => ({
      url: `${siteUrl}/${locale}/forum/${topicSlug}/${threadSlug}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          locales.map((entry) => [entry, `${siteUrl}/${entry}/forum/${topicSlug}/${threadSlug}`]),
        ),
      },
    })),
  );

  const localizedForumComments = locales.flatMap((locale) =>
    forumComments.map(({ topicSlug, threadSlug, commentId }) => ({
      url: `${siteUrl}/${locale}/forum/${topicSlug}/${threadSlug}/comments/${commentId}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          locales.map((entry) => [
            entry,
            `${siteUrl}/${entry}/forum/${topicSlug}/${threadSlug}/comments/${commentId}`,
          ]),
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

  const localizedNews = locales.flatMap((locale) =>
    newsSlugs.map((slug) => ({
      url: `${siteUrl}/${locale}/news/${slug}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          locales.map((entry) => [entry, `${siteUrl}/${entry}/news/${slug}`]),
        ),
      },
    })),
  );

  return [
    ...localizedStatic,
    ...localizedDiaries,
    ...localizedDiaryWeeks,
    ...localizedForumTopics,
    ...localizedForumThreads,
    ...localizedForumComments,
    ...localizedCannapedia,
    ...localizedNews,
  ];
}
