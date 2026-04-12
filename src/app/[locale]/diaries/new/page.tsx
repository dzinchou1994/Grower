import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DiaryNotebookTopAccent } from "@/components/diaries/diary-notebook-top-accent";
import { NewDiaryForm } from "@/components/diaries/new-diary-form";
import { getServerSessionUser } from "@/lib/auth-session";
import {
  getAlternates,
  getDictionary,
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

  const dict = getDictionary(locale);

  return {
    title: dict.routeMeta.newDiary.title,
    description: dict.routeMeta.newDiary.description,
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
        className="group mb-6 inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-xs text-slate-400 transition hover:border-yellow-400/25 hover:bg-white/[0.05] hover:text-yellow-200"
      >
        <svg
          className="h-3 w-3 shrink-0 transition group-hover:-translate-x-0.5 sm:h-3.5 sm:w-3.5"
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
          className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-yellow-500/[0.1] blur-[100px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-20 h-56 w-56 rounded-full bg-amber-600/[0.09] blur-[90px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-1/4 right-0 h-64 w-64 rounded-full bg-violet-600/[0.06] blur-[85px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.25] [background-image:radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:12px_12px]"
          aria-hidden
        />
        {/* Soft organic curves — smoke / canopy suggestion */}
        <svg
          className="pointer-events-none absolute -bottom-8 left-1/2 h-48 w-[120%] -translate-x-1/2 opacity-[0.07] sm:h-56"
          viewBox="0 0 800 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M0 100C120 40 200 20 400 60C600 100 680 80 800 40V120H0V100Z"
            fill="url(#growSmoke)"
          />
          <defs>
            <linearGradient id="growSmoke" x1="0" y1="0" x2="800" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#facc15" stopOpacity="0.35" />
              <stop offset="0.5" stopColor="#a855f7" stopOpacity="0.28" />
              <stop offset="1" stopColor="#f59e0b" stopOpacity="0.32" />
            </linearGradient>
          </defs>
        </svg>
        <DiaryNotebookTopAccent />

        <div className="relative z-[1] px-5 py-8 sm:px-8 sm:py-10">
          <header className="mb-8 border-b border-yellow-400/30 pb-8 sm:mb-10 sm:pb-10">
            <p className="inline-flex items-center gap-1.5 rounded-sm border border-dashed border-yellow-400 bg-yellow-400/20 px-2.5 py-1 font-sans text-[11px] font-medium tracking-wide text-yellow-50 shadow-[0_0_28px_-10px_rgba(250,204,21,0.55)]">
              <svg
                className="h-3.5 w-3.5 shrink-0 text-yellow-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 20h10" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 20v-6m0 0c-2-4-3-8 0-12 3 4 2 8 0 12"
                />
              </svg>
              {dict.diaries.newDiary.badge}
            </p>
            <div
              className="relative mt-5 overflow-hidden rounded-r-lg border-l-[3px] border-yellow-400 pl-4 sm:mt-6 sm:pl-5"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  to bottom,
                  transparent,
                  transparent calc(1.375rem - 1px),
                  rgba(255, 255, 255, 0.05) calc(1.375rem - 1px),
                  rgba(255, 255, 255, 0.05) 1.375rem
                )`,
              }}
            >
              <h1
                className="relative text-2xl font-semibold leading-[1.35] tracking-[0.015em] text-yellow-50 sm:text-[1.65rem] sm:leading-snug md:text-3xl"
                style={{ fontFamily: "var(--font-diary-notebook), ui-serif, Georgia, serif" }}
              >
                {dict.diaries.newDiary.title}
              </h1>
              <p
                className="relative mt-3 max-w-xl text-[12px] leading-relaxed text-yellow-300 sm:text-[13px]"
                style={{ fontFamily: "var(--font-diary-notebook), ui-serif, Georgia, serif" }}
              >
                {dict.diaries.newDiary.helpHintBefore}{" "}
                <Link
                  href={getLocalizedPath(typedLocale, "/contact")}
                  className="font-medium text-yellow-200 underline decoration-yellow-400/90 underline-offset-[3px] transition hover:text-yellow-50 hover:decoration-yellow-300"
                >
                  {dict.diaries.newDiary.helpHintLink}
                </Link>
              </p>
            </div>
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
