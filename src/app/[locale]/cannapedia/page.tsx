import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CannapediaExplorer } from "@/components/cannapedia-explorer";
import { CannabisLeaf } from "@/components/icons";
import {
  getCannapediaCategories,
  listCannapediaArticleSummaries,
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
      title: "ყველაფერი მარიხუანას გაზრდის შესახებ",
      description:
        "პრაქტიკული გზამკვლევები დამწყებებისთვის: თესლი, ვეგეტაცია, ყვავილობა და ჰარვესტი - სახლშიც და გარე პირობებშიც გასაზრდელად.",
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
    listCannapediaArticleSummaries(false),
  ]);
  const activeCategorySlug = category?.trim().toLowerCase() || "";

  return (
    <div className="flex flex-col gap-5 pb-8 sm:gap-8">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-4 shadow-xl shadow-lime-950/10 sm:rounded-[2rem] sm:p-6 lg:p-8">
        <CannabisLeaf className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rotate-12 text-lime-400/[0.06] sm:-right-10 sm:-top-10 sm:h-44 sm:w-44" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-lime-400/25 bg-lime-400/10 px-2.5 py-1 text-[11px] text-lime-300 sm:text-xs">
            <CannabisLeaf className="h-4 w-4" />
            {copy.badge}
          </div>
          <h1 className="mt-2 text-xl font-semibold leading-tight text-white sm:text-3xl lg:text-4xl">
            {copy.title}
          </h1>
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-300 sm:mt-3 sm:text-sm sm:leading-6">
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

