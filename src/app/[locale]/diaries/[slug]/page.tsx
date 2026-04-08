import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAlternates,
  getLocalizedContent,
  getLocalizedPath,
  isValidLocale,
  locales,
  type Locale,
} from "@/lib/i18n";
import { CannabisLeaf } from "@/components/icons";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  const diarySlugs = ["gorilla-glue-indoor"];

  return locales.flatMap((locale) =>
    diarySlugs.map((slug) => ({
      locale,
      slug,
    })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const { diaryList } = getLocalizedContent(locale);
  const diary = diaryList.find((entry) => entry.slug === slug);

  if (!diary) {
    return {};
  }

  return {
    title: `Grower | ${diary.title}`,
    description: diary.summary,
    alternates: getAlternates(`/diaries/${slug}`),
  };
}

export default async function DiaryDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const { diaryList, dict } = getLocalizedContent(typedLocale);
  const diary = diaryList.find((entry) => entry.slug === slug);

  if (!diary) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/6 p-5 sm:rounded-[2rem] sm:p-8">
        <CannabisLeaf className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rotate-12 text-lime-400/[0.04] sm:h-52 sm:w-52" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-lime-300 sm:text-xs sm:tracking-[0.25em]">
              <CannabisLeaf className="h-3.5 w-3.5" />
              {diary.environment} {dict.diaries.diaryType}
            </div>
            <h1 className="mt-2 text-xl font-semibold text-white sm:mt-3 sm:text-3xl lg:text-5xl">
              {diary.title}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:mt-4 sm:text-base sm:leading-7">
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
          </div>

          <div className="rounded-2xl border border-lime-400/15 bg-slate-950/70 p-4 sm:rounded-3xl sm:p-5 lg:w-[300px]">
            <p className="text-xs text-slate-400 sm:text-sm">{dict.diaries.overview}</p>
            <div className="mt-3 space-y-2 text-xs text-slate-300 sm:mt-4 sm:space-y-3 sm:text-sm">
              <p>
                <span className="text-slate-500">{dict.diaries.strain}:</span>{" "}
                {diary.strain}
              </p>
              <p>
                <span className="text-slate-500">{dict.diaries.stage}:</span>{" "}
                {diary.stage}
              </p>
              <p>
                <span className="text-slate-500">{dict.diaries.author}:</span> @
                {diary.author.username}
              </p>
              <p>
                <span className="text-slate-500">{dict.diaries.cover}:</span>{" "}
                {diary.coverLabel}
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:mt-6 sm:gap-3">
              <Link
                href={getLocalizedPath(typedLocale, "/diaries")}
                className="rounded-full border border-white/10 px-4 py-2 text-center text-xs font-medium text-white transition hover:bg-white/8 sm:text-sm"
              >
                {dict.diaries.backToDiaries}
              </Link>
              <Link
                href={getLocalizedPath(typedLocale, `/diaries/${diary.slug}/weeks/new`)}
                className="rounded-full bg-lime-400 px-4 py-2 text-center text-xs font-semibold text-slate-950 transition hover:bg-lime-300 sm:text-sm"
              >
                {dict.diaries.addWeeklyUpdate}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-8">
        <div className="flex items-start justify-between gap-3 sm:items-end">
          <div>
            <p className="text-xs text-slate-400 sm:text-sm">{dict.diaries.timelineBadge}</p>
            <h2 className="mt-1 text-lg font-semibold text-white sm:text-2xl">
              {dict.diaries.timelineTitle}
            </h2>
          </div>
          <span className="shrink-0 rounded-full bg-lime-400/10 px-3 py-1.5 text-[10px] font-medium text-lime-300 sm:px-4 sm:py-2 sm:text-xs">
            {diary.weeks.length} {dict.diaries.updatesCount}
          </span>
        </div>

        <div className="mt-5 space-y-3 sm:mt-8 sm:space-y-4">
          {diary.weeks.map((week) => (
            <article
              key={week.weekNumber}
              className="rounded-2xl border border-white/8 bg-white/4 p-4 sm:rounded-[1.75rem] sm:p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-lime-300 sm:text-xs sm:tracking-[0.25em]">
                    კვირა {week.weekNumber}
                  </p>
                  <h3 className="mt-1.5 text-base font-semibold text-white sm:mt-2 sm:text-xl">
                    {week.title}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-300 sm:gap-2 sm:text-xs">
                  <span className="rounded-full bg-white/6 px-2.5 py-1 sm:px-3">
                    {week.imageCount} {dict.diaries.images}
                  </span>
                  <span className="rounded-full bg-white/6 px-2.5 py-1 sm:px-3">
                    {week.likes} {dict.diaries.likes}
                  </span>
                  <span className="rounded-full bg-white/6 px-2.5 py-1 sm:px-3">
                    {week.comments} {dict.diaries.comments}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-slate-400 sm:mt-4 sm:text-sm sm:leading-7">
                {week.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2">
                {week.highlights.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-lime-400/15 bg-lime-400/8 px-2.5 py-0.5 text-[10px] text-lime-200 sm:px-3 sm:py-1 sm:text-xs"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
