import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CannabisLeaf } from "@/components/icons";
import {
  getAlternates,
  getLocalizedContent,
  getLocalizedPath,
  isValidLocale,
  type Locale,
} from "@/lib/i18n";

type PageProps = {
  params: Promise<{ locale: string; slug: string; weekNumber: string }>;
};

export const dynamic = "force-dynamic";

function parseWeekNumber(value: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }
  return parsed;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug, weekNumber } = await params;
  if (!isValidLocale(locale)) {
    return {};
  }

  const week = parseWeekNumber(weekNumber);
  if (!week) {
    return {};
  }

  const { diaryList } = getLocalizedContent(locale);
  const diary = diaryList.find((entry) => entry.slug === slug);
  const diaryWeek = diary?.weeks.find((entry) => entry.weekNumber === week);
  if (!diary || !diaryWeek) {
    return {};
  }

  return {
    title: `Grower | ${diary.title} - Week ${diaryWeek.weekNumber}`,
    description: diaryWeek.description.slice(0, 160),
    alternates: getAlternates(`/diaries/${slug}/weeks/${weekNumber}`),
  };
}

export default async function DiaryWeekPage({ params }: PageProps) {
  const { locale, slug, weekNumber } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  const week = parseWeekNumber(weekNumber);
  if (!week) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const { diaryList, dict } = getLocalizedContent(typedLocale);
  const diary = diaryList.find((entry) => entry.slug === slug);
  const diaryWeek = diary?.weeks.find((entry) => entry.weekNumber === week);
  if (!diary || !diaryWeek) {
    notFound();
  }

  return (
    <article className="mx-auto w-full max-w-4xl">
      <div className="rounded-2xl border border-white/10 bg-slate-950/65 p-5 sm:rounded-[2rem] sm:p-8">
        <Link
          href={getLocalizedPath(typedLocale, `/diaries/${diary.slug}`)}
          className="text-xs text-lime-300 transition hover:text-lime-200 sm:text-sm"
        >
          ← {dict.diaries.backToDiaries}
        </Link>

        <div className="mt-4 inline-flex items-center gap-2 text-xs text-lime-300 sm:text-sm">
          <CannabisLeaf className="h-4 w-4" />
          {diary.title}
        </div>

        <h1 className="mt-2 text-2xl font-semibold text-white sm:text-4xl">
          Week {diaryWeek.weekNumber}: {diaryWeek.title}
        </h1>

        <p className="mt-4 text-sm leading-7 text-slate-200 sm:text-base">
          {diaryWeek.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-300">
          <span className="rounded-full bg-white/6 px-3 py-1">
            {diaryWeek.imageCount} {dict.diaries.images}
          </span>
          <span className="rounded-full bg-white/6 px-3 py-1">
            {diaryWeek.likes} {dict.diaries.likes}
          </span>
          <span className="rounded-full bg-white/6 px-3 py-1">
            {diaryWeek.comments} {dict.diaries.comments}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {diaryWeek.highlights.map((item) => (
            <span
              key={item}
              className="rounded-full border border-lime-400/15 bg-lime-400/8 px-2.5 py-0.5 text-[10px] text-lime-200 sm:px-3 sm:py-1 sm:text-xs"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
