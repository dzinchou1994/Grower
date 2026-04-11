import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { NewDiaryForm } from "@/components/diaries/new-diary-form";
import { getServerSessionUser } from "@/lib/auth-session";
import {
  getAlternates,
  getLocalizedContent,
  getLocalizedPath,
  isValidLocale,
  type Locale,
} from "@/lib/i18n";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const { dict } = getLocalizedContent(locale);

  return {
    title: `Grower | ${dict.diaries.newDiary.title}`,
    description: dict.diaries.newDiary.description,
    alternates: getAlternates("/diaries/new", locale),
  };
}

export default async function NewDiaryPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const { dict } = getLocalizedContent(typedLocale);
  const session = await getServerSessionUser();
  if (!session) {
    redirect(getLocalizedPath(typedLocale, "/auth/login"));
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Link
        href={getLocalizedPath(typedLocale, "/diaries")}
        className="inline-flex w-fit text-sm text-lime-300 transition hover:text-lime-200"
      >
        ← {dict.diaries.backToDiariesShort}
      </Link>

      <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6 sm:p-8">
        <p className="text-sm text-lime-300">{dict.diaries.newDiary.badge}</p>
        <h1 className="mt-2 text-3xl font-semibold text-white sm:text-5xl">
          {dict.diaries.newDiary.title}
        </h1>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 sm:p-8">
        <NewDiaryForm
          locale={typedLocale}
          fieldDict={dict.diaries.fields}
          placeholderDict={dict.diaries.placeholders}
          exploreDict={dict.diaries.explore}
          setupDict={dict.diaries.setup}
        />
      </section>
    </div>
  );
}
