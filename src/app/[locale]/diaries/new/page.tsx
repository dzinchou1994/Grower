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
    <div className="relative mx-auto w-full max-w-3xl">
      <Link
        href={getLocalizedPath(typedLocale, "/diaries")}
        className="group mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-slate-400 transition hover:border-yellow-400/25 hover:bg-white/[0.05] hover:text-yellow-200"
      >
        <svg
          className="h-4 w-4 transition group-hover:-translate-x-0.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
        </svg>
        {dict.diaries.backToDiariesShort}
      </Link>

      <article className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.07] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] sm:rounded-[2rem]">
        <div className="pointer-events-none absolute inset-0 bg-[#050a0f]" aria-hidden />
        <div
          className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-yellow-500/[0.11] blur-[100px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-20 h-56 w-56 rounded-full bg-amber-600/[0.09] blur-[90px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.25] [background-image:radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:12px_12px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/35 to-transparent"
          aria-hidden
        />

        <div className="relative px-5 py-8 sm:px-8 sm:py-10">
          <header className="mb-8 border-b border-white/[0.06] pb-8 sm:mb-10 sm:pb-10">
            <p className="inline-flex items-center rounded-full border border-yellow-400/25 bg-yellow-400/[0.07] px-3 py-1 text-[11px] font-medium tracking-wide text-yellow-100/95">
              {dict.diaries.newDiary.badge}
            </p>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl sm:leading-tight">
              {dict.diaries.newDiary.title}
            </h1>
            <p className="mt-3 max-w-xl text-[12px] leading-relaxed text-slate-500 sm:text-[13px]">
              {dict.diaries.newDiary.helpHintBefore}{" "}
              <Link
                href={getLocalizedPath(typedLocale, "/contact")}
                className="text-slate-400 underline decoration-white/15 underline-offset-[3px] transition hover:text-yellow-300/95 hover:decoration-yellow-400/35"
              >
                {dict.diaries.newDiary.helpHintLink}
              </Link>
            </p>
          </header>

          <NewDiaryForm
            locale={typedLocale}
            fieldDict={dict.diaries.fields}
            placeholderDict={dict.diaries.placeholders}
            exploreDict={dict.diaries.explore}
            setupDict={dict.diaries.setup}
          />
        </div>
      </article>
    </div>
  );
}
