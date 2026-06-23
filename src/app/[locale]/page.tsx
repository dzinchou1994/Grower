import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
  HomePageBelowFold,
  HomePageBelowFoldSkeleton,
} from "@/components/home-page-below-fold";
import {
  getLocalizedContent,
  getLocalizedPath,
  isValidLocale,
  type Locale,
} from "@/lib/i18n";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageMetadataWithSeo } from "@/lib/seo-settings";
import { getServerSessionUser } from "@/lib/auth-session";

const homeHeroImageSrc = "/images/hero-cannabis.avif";

type LocalizedPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: LocalizedPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const { dict } = getLocalizedContent(locale);

  return getPageMetadataWithSeo({
    page: "HOME",
    locale,
    path: "",
    title: dict.home.seoTitle,
    description: dict.home.seoDescription,
    keywords: [...dict.home.seoKeywords],
  });
}

export default async function LocalizedHomePage({ params }: LocalizedPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const { dict } = getLocalizedContent(typedLocale);
  const sessionUser = await getServerSessionUser();

  return (
    <div className="flex flex-col gap-5 pb-3 sm:gap-8 sm:pb-4">
      <section className="relative overflow-hidden rounded-3xl border border-white/[0.05] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.5)] sm:rounded-[2rem]">
        <Image
          src={homeHeroImageSrc}
          alt="Cannabis plant"
          fill
          priority
          quality={58}
          className="object-cover"
          sizes="(max-width: 1280px) 100vw, 1280px"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#050a10]/82 via-[#08111f]/68 to-[#0a1624]/48" />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-10%,rgba(132,204,22,0.09),transparent_58%)]"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" aria-hidden />

        <div className="relative flex flex-col gap-4 p-5 sm:gap-5 sm:p-7 lg:p-8">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-medium text-lime-200/90 shadow-sm shadow-black/20 backdrop-blur-md sm:text-[11px]">
            <svg
              className="h-3 w-3 opacity-90 sm:h-3.5 sm:w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.85}
              aria-hidden="true"
            >
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            {dict.home.privacyHeadline}
          </span>

          <div className="w-full max-w-xl lg:max-w-2xl">
            <h1 className="text-balance text-[1.35rem] font-semibold leading-[1.12] tracking-tight text-white sm:text-[1.9rem] sm:leading-[1.1] lg:text-[2.125rem]">
              {dict.home.title}
            </h1>
            <p className="mt-3 max-w-lg text-[13px] leading-relaxed text-slate-400/95 sm:mt-3.5 sm:text-[15px] sm:leading-7 lg:text-[16px] lg:leading-8">
              {dict.home.description}
            </p>
          </div>

          <div className="flex max-w-full min-w-0 flex-nowrap items-center gap-2 overflow-x-auto overflow-y-visible py-0.5 pl-0 pr-3 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-2 sm:overflow-visible sm:pr-0 [&::-webkit-scrollbar]:hidden">
            <Link
              href={getLocalizedPath(typedLocale, sessionUser ? "/account" : "/auth/register")}
              className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-lime-400 px-3 py-1.5 text-[11px] font-semibold text-slate-950 shadow-sm shadow-lime-500/15 transition hover:bg-lime-300 sm:px-5 sm:py-2 sm:text-sm"
            >
              {dict.home.joinCta}
            </Link>
            <Link
              href={getLocalizedPath(typedLocale, "/forum")}
              className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-1.5 text-[11px] font-medium text-slate-200/95 backdrop-blur-sm transition hover:border-lime-400/25 hover:bg-white/[0.1] hover:text-white sm:px-5 sm:py-2 sm:text-sm"
            >
              {dict.home.primaryCta}
            </Link>
            <Link
              href={getLocalizedPath(typedLocale, "/diaries")}
              className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-yellow-400 px-3 py-1.5 text-[11px] font-semibold text-slate-950 shadow-sm shadow-yellow-500/20 transition hover:bg-yellow-300 sm:px-5 sm:py-2 sm:text-sm"
            >
              {dict.home.secondaryCta}
            </Link>
          </div>
        </div>
      </section>

      <Suspense fallback={<HomePageBelowFoldSkeleton />}>
        <HomePageBelowFold locale={typedLocale} />
      </Suspense>
      <p className="text-center text-[9px] leading-none text-slate-700">
        <a
          href="https://kama.biz"
          target="_blank"
          rel="noopener noreferrer"
          className="transition hover:text-slate-500"
        >
          Escort in Georgia
        </a>
      </p>
    </div>
  );
}
