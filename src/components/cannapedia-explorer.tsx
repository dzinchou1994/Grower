"use client";

import { Noto_Sans_Georgian } from "next/font/google";
import { BookOpen, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { georgianMtavruliToMkhedruli } from "@/lib/georgian-script";
import { getLocalizedPath, type Locale } from "@/lib/i18n-routing";

/** Display + search: Google/DB sometimes store Mtavruli; normalize for ka. */
function kaText(locale: Locale, text: string) {
  return locale === "ka" ? georgianMtavruliToMkhedruli(text) : text;
}

/** Mtavruli title line; Mkhedruli fonts often render caps wrong without Noto. */
const cannapediaHeroTitleKa = Noto_Sans_Georgian({
  subsets: ["georgian"],
  weight: ["600"],
  display: "swap",
});

type CategoryItem = {
  slug: string;
  icon: string;
  name: string;
};

type ArticleItem = {
  slug: string;
  readMinutes: number;
  category: { slug: string };
  title: Record<Locale, string>;
  excerpt: Record<Locale, string>;
};

type Copy = {
  read: string;
  min: string;
  allCategories: string;
  searchPlaceholder: string;
  searchActionLabel: string;
  clearLabel: string;
  searchHint: string;
  noCategoryResults: string;
  noSearchResults: string;
  suggestionsTitle: string;
};

type HeroCopy = {
  badge: string;
  /** Between badge and title, e.g. Georgian " ანუ " or " — " for EN/RU */
  titleConnector: string;
  title: string;
  description: string;
};

const keywordHintsByLocale: Record<Locale, Record<string, string[]>> = {
  ka: {
    seed: ["თესლი", "გაღვივება", "სტარტი", "seedling"],
    veg: ["ვეგეტაცია", "veg", "lst", "training", "canopy"],
    flower: ["ყვავილობა", "flower", "stretch", "buds"],
    harvest: ["ჰარვესტი", "trim", "curing", "ტრიქომა"],
    storage: ["შენახვა", "ქილა", "ტენიანობა", "fresh"],
    cbd: ["cbd", "კბდ", "კანაბიდიოლი", "სამედიცინო", "medical"],
  },
  en: {
    seed: ["seed", "germination", "seedling", "sprout"],
    veg: ["vegetative", "veg", "training", "lst", "canopy"],
    flower: ["flowering", "flower", "stretch", "buds"],
    harvest: ["harvest", "trichome", "dry", "curing"],
    storage: ["storage", "fresh", "jar", "humidity"],
    cbd: ["cbd", "cannabidiol", "medical", "clinical", "benefits"],
  },
  ru: {
    seed: ["семя", "проращивание", "старт", "росток"],
    veg: ["вегетация", "вега", "тренировка", "крона"],
    flower: ["цветение", "цвет", "stretch", "шишки"],
    harvest: ["харвест", "трихомы", "сушка", "кюринг"],
    storage: ["хранение", "свежесть", "банка", "влажность"],
    cbd: ["cbd", "каннабидиол", "медицинский", "клинический", "польза"],
  },
};

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function scoreArticle(input: {
  locale: Locale;
  query: string;
  article: ArticleItem;
  categoryName: string;
}) {
  const query = normalize(input.query);
  if (!query) return 0;

  const title = normalize(kaText(input.locale, input.article.title[input.locale]));
  const excerpt = normalize(kaText(input.locale, input.article.excerpt[input.locale]));
  const categoryName = normalize(input.categoryName);
  const text = `${title} ${excerpt} ${categoryName}`;

  let score = 0;
  const tokens = query.split(/\s+/).filter(Boolean);
  const hints = Object.values(keywordHintsByLocale[input.locale]).flat();

  if (title.includes(query)) score += 40;
  if (title.startsWith(query)) score += 15;
  if (excerpt.includes(query)) score += 22;
  if (categoryName.includes(query)) score += 18;

  for (const token of tokens) {
    if (title.includes(token)) score += 12;
    if (excerpt.includes(token)) score += 7;
    if (categoryName.includes(token)) score += 6;
  }

  for (const hint of hints) {
    if (query.includes(hint) && text.includes(hint)) {
      score += 5;
    }
  }

  return score;
}

function CategoryChipLink({
  href,
  active,
  icon,
  label,
}: {
  href: string;
  active: boolean;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`group flex min-h-[3.625rem] flex-col items-center justify-center gap-1 rounded-xl border px-1 py-1.5 text-center transition duration-200 [transition-property:color,background-color,border-color,transform,box-shadow] active:scale-[0.98] sm:min-h-[4.75rem] sm:gap-2 sm:rounded-2xl sm:px-2.5 sm:py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617] ${
        active
          ? "border-lime-400/45 bg-gradient-to-b from-lime-400/[0.14] to-lime-500/[0.06] text-lime-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
          : "border-white/[0.09] bg-slate-950/55 text-slate-200 hover:border-white/18 hover:bg-white/[0.05]"
      } `}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-base leading-none transition sm:h-10 sm:w-10 sm:rounded-xl sm:text-xl ${
          active
            ? "bg-lime-400/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
            : "bg-white/[0.06] group-hover:bg-white/10"
        }`}
        aria-hidden
      >
        {icon}
      </span>
      <span className="line-clamp-2 w-full text-[10px] font-medium leading-tight tracking-tight sm:text-[11px] sm:leading-snug">
        {label}
      </span>
    </Link>
  );
}

export function CannapediaExplorer({
  locale,
  categories,
  articles,
  activeCategorySlug,
  hero,
  copy,
}: {
  locale: Locale;
  categories: CategoryItem[];
  articles: ArticleItem[];
  activeCategorySlug: string;
  hero: HeroCopy;
  copy: Copy;
}) {
  const [query, setQuery] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelOpen && panelRef.current && !panelRef.current.contains(t)) {
        setPanelOpen(false);
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [panelOpen]);

  useEffect(() => {
    if (!panelOpen) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [panelOpen]);

  const categoryMap = useMemo(
    () => new Map(categories.map((entry) => [entry.slug, entry.name])),
    [categories],
  );

  const categoryFiltered = useMemo(
    () =>
      activeCategorySlug
        ? articles.filter((article) => article.category.slug === activeCategorySlug)
        : articles,
    [activeCategorySlug, articles],
  );

  const ranked = useMemo(() => {
    if (!query.trim()) return categoryFiltered.map((article) => ({ article, score: 0 }));
    return categoryFiltered
      .map((article) => ({
        article,
        score: scoreArticle({
          locale,
          query,
          article,
          categoryName: categoryMap.get(article.category.slug) ?? "",
        }),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [categoryFiltered, categoryMap, locale, query]);

  const visibleArticles = ranked.map((entry) => entry.article);
  const suggestions = ranked.slice(0, 5).map((entry) => entry.article);

  return (
    <>
      <section className="relative overflow-visible rounded-2xl border border-white/10 bg-slate-950/55 p-5 shadow-lg shadow-black/30 backdrop-blur-md sm:rounded-[2rem] sm:p-8">
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent sm:rounded-[2rem]"
          aria-hidden
        />
        <div className="relative z-[1] flex flex-col gap-3 sm:gap-4">
          <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-lime-400/25 bg-lime-400/10 sm:mt-1 sm:h-9 sm:w-9">
              <BookOpen
                className="h-4 w-4 text-lime-300 sm:h-[18px] sm:w-[18px]"
                strokeWidth={2.25}
                aria-hidden
              />
            </span>
            <h1 className="min-w-0 text-xl font-semibold leading-snug tracking-wide sm:text-3xl sm:leading-tight lg:text-4xl">
              <span className="text-lime-300 uppercase">{hero.badge}</span>
              <span
                className={`text-slate-500 ${locale === "ka" ? cannapediaHeroTitleKa.className : ""}`}
              >
                {hero.titleConnector}
              </span>
              <span
                className={`text-white ${locale === "ka" ? cannapediaHeroTitleKa.className : ""}`}
              >
                {hero.title}
              </span>
            </h1>
          </div>
          <p className="max-w-3xl text-[11px] leading-relaxed text-slate-400 sm:text-xs sm:leading-5">
            {hero.description}
          </p>

          <div ref={panelRef} className="relative z-[2] mt-1 sm:mt-0">
            {!panelOpen ? (
              <button
                type="button"
                className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-white/15 bg-slate-900/60 px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:border-white/25 hover:bg-white/[0.07] sm:px-4 sm:text-sm"
                aria-expanded={false}
                onClick={() => setPanelOpen(true)}
              >
                <Search className="h-3.5 w-3.5 shrink-0 opacity-90 sm:h-4 sm:w-4" strokeWidth={2.25} aria-hidden />
                {copy.searchActionLabel}
              </button>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 sm:rounded-3xl sm:p-4">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2.5">
                  <span className="text-slate-400">🔎</span>
                  <input
                    ref={inputRef}
                    value={query}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== "Escape") return;
                      e.preventDefault();
                      const dropdownVisible =
                        showSuggestions && query.trim().length > 0 && suggestions.length > 0;
                      if (dropdownVisible) {
                        setShowSuggestions(false);
                      } else {
                        setPanelOpen(false);
                      }
                    }}
                    placeholder={copy.searchPlaceholder}
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500 sm:text-base"
                  />
                  {query ? (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-slate-300 transition hover:bg-white/10"
                    >
                      {copy.clearLabel}
                    </button>
                  ) : null}
                </div>
                <p className="mt-2 px-1 text-[11px] text-slate-400 sm:text-xs">{copy.searchHint}</p>
              </div>
            )}

            {panelOpen && showSuggestions && query.trim() && suggestions.length > 0 ? (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl shadow-black/40 backdrop-blur-sm">
                <p className="px-2 pb-1 text-[11px] uppercase tracking-[0.12em] text-slate-400">
                  {copy.suggestionsTitle}
                </p>
                <div className="space-y-1">
                  {suggestions.map((article) => (
                    <Link
                      key={`suggestion-${article.slug}`}
                      href={getLocalizedPath(locale, `/cannapedia/${article.slug}`)}
                      className="block rounded-xl px-2 py-2 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
                    >
                      {kaText(locale, article.title[locale])}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-1.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
        <CategoryChipLink
          href={getLocalizedPath(locale, "/cannapedia")}
          active={!activeCategorySlug}
          icon="📚"
          label={copy.allCategories}
        />
        {categories.map((category) => (
          <CategoryChipLink
            key={category.slug}
            href={getLocalizedPath(locale, `/cannapedia?category=${category.slug}`)}
            active={activeCategorySlug === category.slug}
            icon={category.icon}
            label={category.name}
          />
        ))}
      </section>

      <section className="grid gap-3 sm:gap-4">
        {visibleArticles.map((article) => (
          <Link
            key={article.slug}
            href={getLocalizedPath(locale, `/cannapedia/${article.slug}`)}
            className="rounded-2xl border border-white/10 bg-slate-950/65 p-4 transition hover:border-lime-400/30 hover:bg-slate-900 sm:rounded-3xl sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <h2
                className={
                  locale === "ka"
                    ? "text-base font-medium tracking-normal text-white sm:text-xl"
                    : "text-base font-semibold text-white sm:text-xl"
                }
              >
                {kaText(locale, article.title[locale])}
              </h2>
              <span className="shrink-0 rounded-full border border-white/10 px-2 py-1 text-[11px] text-slate-300">
                {article.readMinutes} {copy.min}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400 sm:text-sm sm:leading-6">
              {kaText(locale, article.excerpt[locale])}
            </p>
            <p className="mt-3 text-xs font-medium text-lime-300 sm:text-sm">{copy.read} →</p>
          </Link>
        ))}
        {visibleArticles.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-950/65 p-5 text-sm text-slate-300 sm:rounded-3xl sm:p-6">
            {query.trim() ? copy.noSearchResults : copy.noCategoryResults}
          </div>
        ) : null}
      </section>
    </>
  );
}

