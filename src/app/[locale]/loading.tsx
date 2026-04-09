"use client";

import { usePathname } from "next/navigation";

const loadingText: Record<string, string> = {
  ka: "იტვირთება...",
  en: "Loading...",
  ru: "Загрузка...",
};

export default function LocaleLoading() {
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] ?? "ka";
  const text = loadingText[locale] ?? loadingText.ka;

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-200">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-lime-300 border-t-transparent" />
        {text}
      </div>
    </div>
  );
}
