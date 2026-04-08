import type { MetadataRoute } from "next";
import { locales, siteUrl } from "@/lib/i18n";

const diarySlugs = ["gorilla-glue-indoor"];
const forumSlugs = [
  "beginner-questions",
  "grow-help",
  "strains-genetics",
  "equipment-setup",
  "outdoor-growing",
  "legal-discussion",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/auth/login",
    "/auth/register",
    "/diaries",
    "/diaries/new",
    "/forum",
    "/admin",
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

  return [...localizedStatic, ...localizedDiaries, ...localizedForum];
}
