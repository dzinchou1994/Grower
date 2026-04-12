import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NewWeekForm } from "@/components/diaries/new-week-form";
import {
  getAlternates,
  getDictionary,
  getLocalizedContent,
  getLocalizedPath,
  isValidLocale,
  type Locale,
} from "@/lib/i18n";
import { getAuthorDiaryForEdit } from "@/lib/diary-data";
import { getServerSessionUser } from "@/lib/auth-session";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const dict = getDictionary(locale);

  return {
    title: dict.routeMeta.newWeek.title,
    description: dict.routeMeta.newWeek.description,
    alternates: getAlternates(`/diaries/${slug}/weeks/new`, locale),
  };
}

export default async function NewWeekPage({ params }: PageProps) {
  const { locale, slug } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const { dict } = getLocalizedContent(typedLocale);
  const sessionUser = await getServerSessionUser();

  if (!sessionUser) {
    notFound();
  }

  const diary = await getAuthorDiaryForEdit(slug, sessionUser.userId);
  if (!diary) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6 sm:p-8">
        <p className="text-sm text-yellow-300">{dict.diaries.newWeek.badge}</p>
        <h1 className="mt-2 text-3xl font-semibold text-white sm:text-5xl">
          {dict.diaries.newWeek.titlePrefix} {diary.title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
          {dict.diaries.newWeek.description}
        </p>
        <Link
          href={getLocalizedPath(typedLocale, `/diaries/${slug}`)}
          className="mt-4 inline-block text-sm text-yellow-300 hover:text-yellow-200"
        >
          ← {dict.diaries.backToDiaries}
        </Link>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 sm:p-8">
        <NewWeekForm
          locale={typedLocale}
          diarySlug={slug}
          fieldDict={dict.diaries.fields}
          placeholderDict={dict.diaries.placeholders}
          exploreDict={dict.diaries.explore}
        />
      </section>
    </div>
  );
}
