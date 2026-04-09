"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] ?? "ka";

  const resourcesLabel =
    locale === "ka" ? "რესურსები" : locale === "ru" ? "Ресурсы" : "Resources";
  const feedbackLabel =
    locale === "ka" ? "ფიდბექი" : locale === "ru" ? "Фидбек" : "Feedback";
  const resourcesHint =
    locale === "ka"
      ? "გარე წყაროები"
      : locale === "ru"
        ? "Внешние источники"
        : "External sources";

  return (
    <footer className="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-1.5 py-2">
        <div className="h-2 w-10 overflow-hidden opacity-[0.08] saturate-0">
          <div id="top-ge-counter-container" data-site-id="118645" />
        </div>
        <p className="text-[10px] text-slate-600/80">
          <Link
            href={`/${locale}/feedback`}
            className="rounded-full border border-white/10 px-2 py-0.5 text-slate-500 transition hover:border-lime-400/25 hover:text-lime-300"
          >
            {feedbackLabel}
          </Link>
          {" · "}
          <Link
            href={`/${locale}/resources`}
            className="text-slate-500 transition hover:text-slate-300"
          >
            {resourcesLabel}
          </Link>
          {" · "}
          <span className="text-slate-700/80">{resourcesHint}</span>
        </p>
      </div>
    </footer>
  );
}
