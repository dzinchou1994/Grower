import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getLocalizedContent,
  getLocalizedPath,
  isValidLocale,
  type Locale,
} from "@/lib/i18n";
import { CannabisLeaf, CannabisLeafOutline } from "@/components/icons";
import { getPageMetadataWithSeo } from "@/lib/seo-settings";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const { dict } = getLocalizedContent(locale);

  return getPageMetadataWithSeo({
    page: "DIARIES",
    locale,
    path: "/diaries",
    title: `Grower | ${dict.nav.diaries}`,
    description: dict.diaries.description,
  });
}

export default async function DiariesPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const { diaryList, dict } = getLocalizedContent(typedLocale);

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/6 p-5 sm:rounded-[2rem] sm:p-8">
        <CannabisLeaf className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rotate-12 text-lime-400/[0.04] sm:h-56 sm:w-56" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-xs text-lime-300 sm:text-sm">
            <CannabisLeaf className="h-4 w-4" />
            {dict.diaries.badge}
          </div>
          <h1 className="mt-1.5 text-xl font-semibold text-white sm:mt-2 sm:text-3xl lg:text-5xl">
            {dict.diaries.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:mt-4 sm:text-base sm:leading-7">
            {dict.diaries.description}
          </p>
          <Link
            href={getLocalizedPath(typedLocale, "/diaries/new")}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-lime-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-lime-300 sm:mt-6 sm:px-5 sm:py-3"
          >
            <CannabisLeafOutline className="h-4 w-4" />
            {dict.diaries.createDiary}
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
        {diaryList.map((diary) => (
          <Link
            key={diary.slug}
            href={getLocalizedPath(typedLocale, `/diaries/${diary.slug}`)}
            className="rounded-2xl border border-white/10 bg-slate-950/65 p-5 transition hover:border-lime-400/30 hover:bg-slate-900 sm:rounded-[2rem] sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.2em] text-lime-300 sm:text-xs sm:tracking-[0.25em]">
                  {diary.environment}
                </p>
                <h2 className="mt-1.5 text-lg font-semibold text-white sm:mt-2 sm:text-2xl">
                  {diary.title}
                </h2>
              </div>
              <span className="shrink-0 rounded-full bg-white/6 px-2.5 py-1 text-[10px] text-slate-300 sm:px-3 sm:text-xs">
                {diary.weeks.length} {dict.diaries.weeksLabel}
              </span>
            </div>

            <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-400 sm:mt-4 sm:text-sm sm:leading-6">
              {diary.summary}
            </p>

            <div className="mt-4 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2">
              {diary.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] text-slate-300 sm:px-3 sm:py-1 sm:text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400 sm:mt-6 sm:text-sm">
              <span>@{diary.author.username}</span>
              <span>{diary.stage}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
