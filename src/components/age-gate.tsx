"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "grower_age_ok_v1";

export function AgeGate() {
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] ?? "ka";
  const [open, setOpen] = useState(false);

  const t = useMemo(() => {
    if (locale === "ka") {
      return {
        title: "18+ ქომუნითი ზონა",
        subtitle:
          "ამ პლატფორმაზე შესვლით ადასტურებ, რომ ხარ 18+ და ეთანხმები პასუხისმგებლიან გამოყენებას.",
        legal:
          "Grower არის საგანმანათლებლო/ქომუნითი სივრცე. პლატფორმა არ ახალისებს კანონდარღვევას.",
        enter: "დიახ, ვარ 18+",
        leave: "გასვლა",
      };
    }
    if (locale === "ru") {
      return {
        title: "Зона сообщества 18+",
        subtitle:
          "Входя на платформу, вы подтверждаете, что вам 18+ и вы согласны с ответственным использованием.",
        legal:
          "Grower - образовательное и комьюнити-пространство. Платформа не поощряет нарушение закона.",
        enter: "Да, мне 18+",
        leave: "Выйти",
      };
    }
    return {
      title: "18+ Community Zone",
      subtitle:
        "By entering, you confirm you are 18+ and agree to responsible use.",
      legal:
        "Grower is an educational/community platform. We do not promote illegal activity.",
      enter: "Yes, I am 18+",
      leave: "Leave",
    };
  }, [locale]);

  useEffect(() => {
    try {
      const ok = localStorage.getItem(STORAGE_KEY);
      if (!ok) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-xl">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-lime-400/20 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl shadow-lime-900/20">
        <div className="pointer-events-none absolute -right-8 -top-8 text-7xl opacity-10">🌿</div>
        <div className="pointer-events-none absolute -left-6 bottom-0 text-6xl opacity-10">💨</div>

        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1 text-xs font-medium text-lime-300">
          <span className="animate-pulse">🪴</span>
          18+
        </div>
        <h2 className="text-xl font-semibold text-white sm:text-2xl">{t.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">{t.subtitle}</p>
        <p className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400">
          {t.legal}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              localStorage.setItem(STORAGE_KEY, "1");
              setOpen(false);
            }}
            className="rounded-full bg-lime-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-lime-300"
          >
            {t.enter}
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.href = "https://www.google.com";
            }}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            {t.leave}
          </button>
        </div>
      </div>
    </div>
  );
}
