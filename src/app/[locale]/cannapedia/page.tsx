import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CannapediaExplorer } from "@/components/cannapedia-explorer";
import { CannabisLeaf } from "@/components/icons";
import {
  getCannapediaCategories,
  listCannapediaArticles,
} from "@/lib/cannapedia-data";
import {
  isValidLocale,
  type Locale,
} from "@/lib/i18n";
import { getPageMetadataWithSeo } from "@/lib/seo-settings";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
};

function cannapediaCopy(locale: Locale) {
  if (locale === "ka") {
    return {
      title: "Cannapedia - გროვერის ცოდნის ბაზა",
      description:
        "პრაქტიკული გზამკვლევები დამწყებებისთვის: თესლი, ვეგეტაცია, ყვავილობა და ჰარვესტი.",
      badge: "Cannapedia",
      read: "წაკითხვა",
      min: "წთ",
      allCategories: "ყველა",
      searchPlaceholder: "ძებნა თემის, საკვანძო სიტყვის ან პრობლემის მიხედვით...",
      searchHint: "მაგ: თესლი, ვეგეტაცია, ყვავილობა, შენახვა, trim, curing",
      noCategoryResults: "ამ კატეგორიაში სტატია ჯერ არ არის.",
      noSearchResults: "ამ ძიებაზე ვერაფერი მოიძებნა. სცადე სხვა საკვანძო სიტყვა.",
      suggestionsTitle: "რეკომენდებული",
    };
  }

  if (locale === "ru") {
    return {
      title: "Cannapedia - база знаний Grower",
      description:
        "Практические статьи для новичков: семена, вегетация, цветение и харвест.",
      badge: "Cannapedia",
      read: "Читать",
      min: "мин",
      allCategories: "Все",
      searchPlaceholder: "Поиск по теме, ключевому слову или проблеме...",
      searchHint: "Например: семена, вега, цветение, хранение, trim, curing",
      noCategoryResults: "В этой категории пока нет статей.",
      noSearchResults: "По этому запросу ничего не найдено. Попробуйте другое слово.",
      suggestionsTitle: "Подсказки",
    };
  }

  return {
    title: "Cannapedia - Grower Knowledge Base",
    description:
      "Practical beginner guides for seedling, vegetative growth, flowering, and harvest.",
    badge: "Cannapedia",
    read: "Read article",
    min: "min",
    allCategories: "All",
    searchPlaceholder: "Search by topic, keyword, or problem...",
    searchHint: "Example: seed, vegetative, flowering, storage, trim, curing",
    noCategoryResults: "No articles in this category yet.",
    noSearchResults: "No matches for this search. Try another keyword.",
    suggestionsTitle: "Suggestions",
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const copy = cannapediaCopy(locale);
  return getPageMetadataWithSeo({
    page: "CANNAPEDIA",
    locale,
    path: "/cannapedia",
    title: `Grower | Cannapedia`,
    description: copy.description,
  });
}

export default async function CannapediaPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { category } = await searchParams;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const copy = cannapediaCopy(typedLocale);
  const [categories, articles] = await Promise.all([
    getCannapediaCategories(typedLocale),
    listCannapediaArticles(false),
  ]);
  const activeCategorySlug = category?.trim().toLowerCase() || "";

  return (
    <div className="flex flex-col gap-5 pb-8 sm:gap-8">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/6 p-5 shadow-2xl shadow-lime-950/10 sm:rounded-[2rem] sm:p-8 lg:p-12">
        <CannabisLeaf className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rotate-12 text-lime-400/[0.05] sm:h-60 sm:w-60" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-xs text-lime-300 sm:text-sm">
            <CannabisLeaf className="h-4 w-4" />
            {copy.badge}
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-white sm:text-4xl lg:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 sm:mt-4 sm:text-base sm:leading-7">
            {copy.description}
          </p>
        </div>
      </section>

      <CannapediaExplorer
        locale={typedLocale}
        categories={categories}
        articles={articles}
        activeCategorySlug={activeCategorySlug}
        copy={{
          read: copy.read,
          min: copy.min,
          allCategories: copy.allCategories,
          searchPlaceholder: copy.searchPlaceholder,
          searchHint: copy.searchHint,
          noCategoryResults: copy.noCategoryResults,
          noSearchResults: copy.noSearchResults,
          suggestionsTitle: copy.suggestionsTitle,
        }}
      />
    </div>
  );
}

