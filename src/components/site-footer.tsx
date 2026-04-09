"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter() {
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
        <div className="mt-1 h-3 w-14 overflow-hidden opacity-[0.18] saturate-0">
          <div id="top-ge-counter-container" data-site-id="118645" />
        </div>
      </div>
    </footer>
  );
}
