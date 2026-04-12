import Link from "next/link";
import {
  getDictionary,
  getLocalizedPath,
  isValidLocale,
  type Locale,
} from "@/lib/i18n";
import { CannabisLeaf } from "@/components/icons";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageMetadataWithSeo } from "@/lib/seo-settings";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const dict = getDictionary(locale);

  return getPageMetadataWithSeo({
    page: "HOME",
    locale,
    path: "/sponsors",
    title: dict.sponsors.metaTitle,
    description: dict.sponsors.metaDescription,
  });
}

export default async function SponsorsPage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const typedLocale = locale as Locale;
  const dict = getDictionary(typedLocale);
  const s = dict.sponsors;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 pb-4 sm:gap-6 sm:pb-6">
      <div className="relative rounded-2xl p-[1px] shadow-[0_28px_70px_-36px_rgba(0,0,0,0.9)] sm:rounded-[2rem] bg-gradient-to-br from-lime-400/45 via-amber-500/25 to-slate-950">
        <div className="relative overflow-hidden rounded-[calc(1rem-1px)] bg-[#030712] sm:rounded-[calc(2rem-1px)]">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_10%_-15%,rgba(52,211,153,0.2),transparent_55%),radial-gradient(ellipse_60%_50%_at_100%_100%,rgba(251,191,36,0.12),transparent_52%),linear-gradient(198deg,rgba(15,23,42,0.55),rgba(3,7,18,0.97))]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:22px_22px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime-400/40 to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-3 top-3 h-9 w-9 border-l-2 border-t-2 border-lime-400/35 sm:left-6 sm:top-6"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-3 right-3 h-9 w-9 border-b-2 border-r-2 border-amber-400/30 sm:bottom-6 sm:right-6"
            aria-hidden
          />

          <header className="relative z-10 px-5 pb-7 pt-7 sm:px-8 sm:pb-9 sm:pt-9">
            <div className="inline-flex max-w-full items-center rounded-full border border-lime-400/35 bg-lime-400/[0.09] px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:px-4 sm:py-2 sm:text-[11px] sm:tracking-[0.18em]">
              <CannabisLeaf className="mr-2 h-3.5 w-3.5 shrink-0 text-lime-300/90" />
              {s.badge}
            </div>
            <h1 className="mt-5 max-w-4xl text-2xl font-bold leading-[1.15] tracking-tight text-white sm:mt-6 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.1]">
              {s.headline}
            </h1>
            <p className="mt-2 text-sm font-medium text-lime-200/90 sm:text-base">{s.subhead}</p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base sm:leading-7">
              {s.lead}
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <a
                href="https://t.me/growergeorgia"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-2xl bg-lime-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_12px_36px_-16px_rgba(132,204,22,0.65)] transition hover:bg-lime-300"
              >
                {s.ctaTelegram}
                <span className="ml-2 text-xs font-medium opacity-90">@growergeorgia</span>
              </a>
              <a
                href="mailto:growergeorgia@proton.me"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-lime-400/35 hover:bg-white/[0.1]"
              >
                {s.ctaEmail}
                <span className="ml-2 text-xs font-medium text-slate-300">growergeorgia@proton.me</span>
              </a>
            </div>
          </header>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-5">
        <section className="rounded-2xl border border-white/[0.07] bg-gradient-to-b from-slate-950/85 to-slate-950/45 p-5 shadow-[0_16px_48px_-28px_rgba(0,0,0,0.75)] sm:rounded-[1.75rem] sm:p-7">
          <h2 className="text-lg font-semibold text-white sm:text-xl">{s.offerTitle}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base sm:leading-7">{s.offerP1}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base sm:leading-7">{s.offerP2}</p>
        </section>
      </div>

      <div className="flex justify-center pb-2">
        <Link
          href={getLocalizedPath(typedLocale, "")}
          className="text-sm text-slate-500 transition hover:text-lime-300"
        >
          ← {s.backHome}
        </Link>
      </div>
    </div>
  );
}
