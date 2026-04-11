"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CannabisLeaf } from "@/components/icons";

type SponsorTeaser = {
  title: string;
  hint: string;
  href: string;
};

export function SiteFooter({ sponsorTeaser }: { sponsorTeaser: SponsorTeaser }) {
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] ?? "ka";

  const resourcesLabel =
    locale === "ka" ? "რესურსები" : locale === "ru" ? "Ресурсы" : "Resources";
  const feedbackLabel =
    locale === "ka" ? "დატოვე ფიდბექი" : locale === "ru" ? "Фидбек" : "Feedback";
  const resourcesHint =
    locale === "ka"
      ? "გარე წყაროები"
      : locale === "ru"
        ? "Внешние источники"
        : "External sources";
  const links =
    locale === "ka"
      ? {
          about: "ჩვენს შესახებ",
          privacy: "კონფიდენციალურობა",
          terms: "წესები და პირობები",
          rules: "ქომუნითი წესები",
          contact: "კონტაქტი",
        }
      : locale === "ru"
        ? {
            about: "О нас",
            privacy: "Конфиденциальность",
            terms: "Условия",
            rules: "Правила сообщества",
            contact: "Контакты",
          }
        : {
            about: "About",
            privacy: "Privacy",
            terms: "Terms",
            rules: "Community Rules",
            contact: "Contact",
          };

  return (
    <footer className="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-1.5 py-2">
        <Link
          href={`/${locale}/feedback`}
          className="mt-1 inline-flex rounded-full border border-lime-400/35 bg-lime-400/10 px-3.5 py-1 text-[11px] font-semibold text-lime-300 transition hover:border-lime-300/45 hover:bg-lime-400/15 hover:text-lime-200"
        >
          {feedbackLabel}
        </Link>
        <p className="select-none text-[8px] tracking-[0.35em] text-lime-900/40" aria-hidden="true">
          4 : 2 0
        </p>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[10px] text-slate-500/90">
          <Link href={`/${locale}/about`} className="transition hover:text-slate-300">
            {links.about}
          </Link>
          <span className="text-slate-700/80">•</span>
          <Link href={`/${locale}/privacy`} className="transition hover:text-slate-300">
            {links.privacy}
          </Link>
          <span className="text-slate-700/80">•</span>
          <Link href={`/${locale}/terms`} className="transition hover:text-slate-300">
            {links.terms}
          </Link>
          <span className="text-slate-700/80">•</span>
          <Link href={`/${locale}/rules`} className="transition hover:text-slate-300">
            {links.rules}
          </Link>
          <span className="text-slate-700/80">•</span>
          <Link href={`/${locale}/contact`} className="transition hover:text-slate-300">
            {links.contact}
          </Link>
        </div>
        <p className="text-[10px] text-slate-600/80">
          <Link
            href={`/${locale}/resources`}
            className="text-slate-500 transition hover:text-slate-300"
          >
            {resourcesLabel}
          </Link>
          {" · "}
          <span className="text-slate-700/80">{resourcesHint}</span>
        </p>

        <Link
          href={sponsorTeaser.href}
          className="group mt-3 w-full max-w-md rounded-2xl p-[1px] shadow-[0_14px_40px_-22px_rgba(132,204,22,0.45)] transition hover:shadow-[0_18px_48px_-20px_rgba(251,191,36,0.35)] sm:rounded-[1.35rem] bg-gradient-to-br from-lime-400/50 via-amber-500/25 to-slate-900/80"
        >
          <div className="flex items-center gap-3 rounded-[calc(1rem-1px)] bg-[#050b14]/95 px-3.5 py-3 backdrop-blur-sm sm:gap-4 sm:rounded-[calc(1.35rem-1px)] sm:px-4 sm:py-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-lime-400/25 bg-lime-400/[0.08] text-lime-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
              <CannabisLeaf className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-[11px] font-semibold leading-tight text-white sm:text-xs">
                {sponsorTeaser.title}
              </span>
              <span className="mt-0.5 block text-[10px] text-amber-200/85 sm:text-[11px]">
                {sponsorTeaser.hint}
                <span className="ml-1 inline-block transition group-hover:translate-x-0.5">→</span>
              </span>
            </span>
          </div>
        </Link>

        <div className="sr-only" aria-hidden="true" suppressHydrationWarning>
          <div id="top-ge-counter-container" data-site-id="118645" />
        </div>
      </div>
    </footer>
  );
}
