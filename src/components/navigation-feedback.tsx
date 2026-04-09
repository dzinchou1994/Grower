"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const loadingText: Record<string, string> = {
  ka: "იტვირთება...",
  en: "Loading...",
  ru: "Загрузка...",
};

export function NavigationFeedback() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  const locale = pathname?.split("/")[1] ?? "ka";
  const text = loadingText[locale] ?? loadingText.ka;

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest("a");
      if (!anchor) return;
      if (anchor.target === "_blank") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href) return;
      if (href.startsWith("#")) return;
      if (!href.startsWith("/")) return;

      const url = new URL(href, window.location.origin);
      const next = `${url.pathname}${url.search}`;
      const current = `${window.location.pathname}${window.location.search}`;
      if (next === current) return;

      setIsNavigating(true);
    }

    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  if (!isNavigating) {
    return null;
  }

  return (
    <>
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-[60] h-0.5 overflow-hidden bg-transparent">
        <div className="nav-slide-bar h-full w-1/3 rounded-r-full bg-lime-400 shadow-[0_0_18px_rgba(163,230,53,0.7)]" />
      </div>
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-100 backdrop-blur-sm">
        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-lime-300 border-t-transparent" />
        {text}
      </div>
    </>
  );
}

