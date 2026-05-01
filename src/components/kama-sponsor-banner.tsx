import type { Locale } from "@/lib/i18n";
import { notoSansGeorgian } from "@/lib/fonts/noto-sans-georgian";

type Copy = {
  adLabel: string;
  partnerLabel: string;
  headline: string;
  description: string;
  keywordLinksIntro: string;
  cta: string;
  disclosure: string;
};

const COPY: Record<Locale, Copy> = {
  ka: {
    adLabel: "რეკლამა",
    partnerLabel: "პარტნიორი ბრენდი",
    headline: "Kama.bz — თბილისის ესკორტ გიდი ერთ პლატფორმაზე",
    description:
      "Kama.bz საქართველოს №1 ესკორტ კატალოგია — ვერიფიცირებული ანკეტები, რეალური ფოტოები და დისკრეტული კავშირი. იპოვე ესკორტი თბილისში მარტივად და უსაფრთხოდ.",
    keywordLinksIntro: "ძიების ბმულები:",
    cta: "გადასვლა Kama.bz-ზე",
    disclosure: "სპონსირებული ბმული · 18+",
  },
  en: {
    adLabel: "AD",
    partnerLabel: "Partner brand",
    headline: "Kama.bz — Tbilisi escort directory in one place",
    description:
      "Kama.bz is Georgia's leading escort catalogue — verified profiles, real photos and discreet contact. Find an escort in Tbilisi quickly and safely.",
    keywordLinksIntro: "Search shortcuts:",
    cta: "Visit Kama.bz",
    disclosure: "Sponsored link · 18+",
  },
  ru: {
    adLabel: "РЕКЛАМА",
    partnerLabel: "Партнёрский бренд",
    headline: "Kama.bz — каталог эскорта Тбилиси на одной платформе",
    description:
      "Kama.bz — крупнейший эскорт-каталог в Грузии: проверенные анкеты, реальные фото и конфиденциальная связь. Найдите эскорт в Тбилиси быстро и безопасно.",
    keywordLinksIntro: "Быстрые ссылки:",
    cta: "Перейти на Kama.bz",
    disclosure: "Спонсорская ссылка · 18+",
  },
};

const BASE = "https://kama.bz";

/** Each entry: visible keyword label → path on kama.bz (“-” means home `/`). */
const KEYWORD_LINKS: readonly { label: string; path: string }[] = [
  { label: "xgeorgia", path: "/xgeorgia" },
  { label: "escort", path: "/" },
  { label: "ესკორტი", path: "/" },
  { label: "eskorti", path: "/" },
  { label: "eskort", path: "/" },
  { label: "eskortebi", path: "/escorts" },
  { label: "tbilisi escort", path: "/tbilisi" },
  { label: "ესკორტები", path: "/" },
  { label: "escort tbilisi", path: "/tbilisi" },
  { label: "ესკორტ გოგოები", path: "/girls" },
] as const;

function toAbsoluteUrl(path: string): string {
  if (path === "" || path === "/") return `${BASE}/`;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${BASE}${normalized}`;
}

export function KamaSponsorBanner({ locale }: { locale: Locale }) {
  const c = COPY[locale];
  const georgianClass = locale === "ka" ? notoSansGeorgian.className : "";

  return (
    <section
      aria-label={c.partnerLabel}
      className="defer-render relative rounded-2xl p-[1px] shadow-[0_28px_70px_-32px_rgba(0,0,0,0.85)] sm:rounded-[2rem] bg-gradient-to-br from-fuchsia-500/45 via-rose-700/35 to-slate-950"
    >
      <div className="relative overflow-hidden rounded-[calc(1rem-1px)] bg-[#0b0413] sm:rounded-[calc(2rem-1px)]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_70%_at_12%_-15%,rgba(232,121,249,0.22),transparent_55%),radial-gradient(ellipse_65%_55%_at_95%_105%,rgba(244,63,94,0.16),transparent_55%),linear-gradient(192deg,rgba(15,23,42,0.55),rgba(11,4,19,0.95))]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4] [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:22px_22px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-300/45 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-3 top-3 z-[1] h-9 w-9 border-l-2 border-t-2 border-fuchsia-400/40 sm:left-5 sm:top-5"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-3 right-3 z-[1] h-9 w-9 border-b-2 border-r-2 border-rose-400/35 sm:bottom-5 sm:right-5"
          aria-hidden
        />

        <div className="relative z-10 flex w-full flex-col gap-5 p-5 sm:gap-6 sm:p-7 lg:flex-row lg:items-start lg:justify-between lg:gap-10 lg:p-8">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border border-fuchsia-400/40 bg-fuchsia-400/[0.1] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-fuchsia-100 ${georgianClass}`}
              >
                {c.adLabel}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium tracking-wide text-slate-300 ${georgianClass}`}
              >
                {c.partnerLabel}
              </span>
            </div>

            <h2
              className={`mt-4 bg-gradient-to-br from-fuchsia-50 via-rose-100 to-fuchsia-200 bg-clip-text text-[1.35rem] font-bold leading-[1.18] tracking-tight text-transparent sm:text-[1.7rem] sm:leading-tight lg:text-[1.85rem] ${georgianClass}`}
            >
              {c.headline}
            </h2>

            <p
              className={`mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-[15px] sm:leading-7 ${georgianClass}`}
            >
              {c.description}
            </p>

            <nav
              className="mt-4"
              aria-label={c.keywordLinksIntro}
            >
              <p
                className={`mb-2 text-[11px] font-medium text-fuchsia-100/80 sm:text-xs ${georgianClass}`}
              >
                {c.keywordLinksIntro}
              </p>
              <div
                className={`flex flex-wrap gap-2 ${notoSansGeorgian.className}`}
              >
                {KEYWORD_LINKS.map(({ label, path }) => (
                  <a
                    key={`${label}-${path}`}
                    href={toAbsoluteUrl(path)}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="inline-flex max-w-full items-center rounded-full border border-fuchsia-400/30 bg-fuchsia-950/40 px-3 py-1.5 text-[11px] font-medium text-fuchsia-100/95 shadow-sm shadow-black/20 transition hover:border-fuchsia-300/55 hover:bg-fuchsia-900/50 hover:text-white sm:text-xs"
                  >
                    <span className="truncate">{label}</span>
                  </a>
                ))}
              </div>
            </nav>

            <p
              className={`mt-4 text-[10px] uppercase tracking-[0.16em] text-slate-500 ${georgianClass}`}
            >
              {c.disclosure}
            </p>
          </div>

          <div className="flex w-full shrink-0 flex-col items-stretch gap-2 lg:w-auto lg:items-end lg:pt-1">
            <a
              href={`${BASE}/`}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className={`group inline-flex items-center justify-center gap-2 rounded-full border border-fuchsia-200/40 bg-gradient-to-b from-fuchsia-400 to-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_20px_-6px_rgba(232,121,249,0.55),inset_0_1px_0_rgba(255,255,255,0.4)] transition duration-200 hover:from-fuchsia-300 hover:to-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-200/90 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0413] active:scale-[0.98] sm:px-7 ${georgianClass}`}
            >
              <span>{c.cta}</span>
              <svg
                className="h-4 w-4 shrink-0 opacity-95 transition-transform duration-200 group-hover:translate-x-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
            <span
              className={`text-center text-[10px] text-slate-500 lg:text-right ${georgianClass}`}
            >
              kama.bz
            </span>
            <a
              href="https://geoeskort.com"
              target="_blank"
              rel="sponsored noopener noreferrer"
              className={`mt-1 text-center text-[11px] font-medium text-fuchsia-300/80 transition hover:text-fuchsia-200 lg:text-right ${notoSansGeorgian.className}`}
            >
              GEOESKORT.COM — საუკეთესო ესკორტი საქართველოში
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
