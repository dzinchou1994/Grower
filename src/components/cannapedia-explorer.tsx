"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getLocalizedPath, type Locale } from "@/lib/i18n";

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
  content: Record<Locale, string[]>;
};

type Copy = {
  read: string;
  min: string;
  allCategories: string;
  searchPlaceholder: string;
  searchHint: string;
  noCategoryResults: string;
  noSearchResults: string;
  suggestionsTitle: string;
};

const keywordHintsByLocale: Record<Locale, Record<string, string[]>> = {
  ka: {
    seed: ["თესლი", "გაღვივება", "სტარტი", "seedling"],
    veg: ["ვეგეტაცია", "veg", "lst", "training", "canopy"],
    flower: ["ყვავილობა", "flower", "stretch", "buds"],
    harvest: ["ჰარვესტი", "trim", "curing", "ტრიქომა"],
    storage: ["შენახვა", "ქილა", "ტენიანობა", "fresh"],
  },
  en: {
    seed: ["seed", "germination", "seedling", "sprout"],
    veg: ["vegetative", "veg", "training", "lst", "canopy"],
    flower: ["flowering", "flower", "stretch", "buds"],
    harvest: ["harvest", "trichome", "dry", "curing"],
    storage: ["storage", "fresh", "jar", "humidity"],
  },
  ru: {
    seed: ["семя", "проращивание", "старт", "росток"],
    veg: ["вегетация", "вега", "тренировка", "крона"],
    flower: ["цветение", "цвет", "stretch", "шишки"],
    harvest: ["харвест", "трихомы", "сушка", "кюринг"],
    storage: ["хранение", "свежесть", "банка", "влажность"],
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

  const title = normalize(input.article.title[input.locale]);
  const excerpt = normalize(input.article.excerpt[input.locale]);
  const content = normalize(input.article.content[input.locale].join(" "));
  const categoryName = normalize(input.categoryName);
  const text = `${title} ${excerpt} ${content} ${categoryName}`;

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
    if (content.includes(token)) score += 4;
    if (categoryName.includes(token)) score += 6;
  }

  for (const hint of hints) {
    if (query.includes(hint) && text.includes(hint)) {
      score += 5;
    }
  }

  return score;
}

export function CannapediaExplorer({
  locale,
  categories,
  articles,
  activeCategorySlug,
  copy,
}: {
  locale: Locale;
  categories: CategoryItem[];
  articles: ArticleItem[];
  activeCategorySlug: string;
  copy: Copy;
}) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

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
      <section className="relative">
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 sm:rounded-3xl sm:p-4">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2.5">
            <span className="text-slate-400">🔎</span>
            <input
              value={query}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.searchPlaceholder}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500 sm:text-base"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-slate-300 transition hover:bg-white/10"
              >
                Clear
              </button>
            ) : null}
          </div>
          <p className="mt-2 px-1 text-[11px] text-slate-400 sm:text-xs">{copy.searchHint}</p>
        </div>

        {showSuggestions && query.trim() && suggestions.length > 0 ? (
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
                  {article.title[locale]}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
        <Link
          href={getLocalizedPath(locale, "/cannapedia")}
          className={`rounded-2xl border p-4 text-slate-200 transition sm:rounded-3xl sm:p-5 ${
            !activeCategorySlug
              ? "border-lime-400/40 bg-lime-400/10 text-lime-200"
              : "border-white/10 bg-slate-950/60 hover:border-lime-400/30"
          }`}
        >
          <p className="text-xl">📚</p>
          <p className="mt-1 text-sm font-medium sm:text-base">{copy.allCategories}</p>
        </Link>
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={getLocalizedPath(locale, `/cannapedia?category=${category.slug}`)}
            className={`rounded-2xl border p-4 text-slate-200 transition sm:rounded-3xl sm:p-5 ${
              activeCategorySlug === category.slug
                ? "border-lime-400/40 bg-lime-400/10 text-lime-200"
                : "border-white/10 bg-slate-950/60 hover:border-lime-400/30"
            }`}
          >
            <p className="text-xl">{category.icon}</p>
            <p className="mt-1 text-sm font-medium sm:text-base">{category.name}</p>
          </Link>
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
              <h2 className="text-base font-semibold text-white sm:text-xl">
                {article.title[locale]}
              </h2>
              <span className="shrink-0 rounded-full border border-white/10 px-2 py-1 text-[11px] text-slate-300">
                {article.readMinutes} {copy.min}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400 sm:text-sm sm:leading-6">
              {article.excerpt[locale]}
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

