import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CannapediaExplorer } from "@/components/cannapedia-explorer";
import { getCannapediaExplorerBundleCached } from "@/lib/cannapedia-data";
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
      titleConnector: " ᲐᲜᲣ ",
      title:
        "ᲛᲐᲠᲘᲮᲣᲐᲜᲘᲡ ᲛᲝᲧᲕᲐᲜᲘᲡ ᲡᲐᲮᲔᲚᲛᲫᲦᲕᲐᲜᲔᲚᲝ",
      description:
        "პრაქტიკული გზამკვლევები დამწყებებისთვის: თესლი, ვეგეტაცია, ყვავილობა და ჰარვესტი - სახლშიც და გარე პირობებშიც გასაზრდელად.",
      badge: "Cannapedia",
      read: "წაკითხვა",
      min: "წთ",
      allCategories: "ყველა",
      searchPlaceholder: "ძებნა თემის, საკვანძო სიტყვის ან პრობლემის მიხედვით...",
      searchActionLabel: "ძებნა",
      clearLabel: "გასუფთავება",
      searchHint: "მაგ: თესლი, ვეგეტაცია, ყვავილობა, შენახვა, trim, curing",
      noCategoryResults: "ამ კატეგორიაში სტატია ჯერ არ არის.",
      noSearchResults: "ამ ძიებაზე ვერაფერი მოიძებნა. სცადე სხვა საკვანძო სიტყვა.",
      suggestionsTitle: "რეკომენდებული",
    };
  }

  if (locale === "ru") {
    return {
      titleConnector: " — ",
      title: "база знаний Grower",
      description:
        "Практические статьи для новичков: семена, вегетация, цветение и харвест.",
      badge: "Cannapedia",
      read: "Читать",
      min: "мин",
      allCategories: "Все",
      searchPlaceholder: "Поиск по теме, ключевому слову или проблеме...",
      searchActionLabel: "Поиск",
      clearLabel: "Очистить",
      searchHint: "Например: семена, вега, цветение, хранение, trim, curing",
      noCategoryResults: "В этой категории пока нет статей.",
      noSearchResults: "По этому запросу ничего не найдено. Попробуйте другое слово.",
      suggestionsTitle: "Подсказки",
    };
  }

  return {
    titleConnector: " — ",
    title: "Grower Knowledge Base",
    description:
      "Practical beginner guides for seedling, vegetative growth, flowering, and harvest.",
    badge: "Cannapedia",
    read: "Read article",
    min: "min",
    allCategories: "All",
    searchPlaceholder: "Search by topic, keyword, or problem...",
    searchActionLabel: "Search",
    clearLabel: "Clear",
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
  const { categories: categoryRows, articles } = await getCannapediaExplorerBundleCached();
  const categories = categoryRows.map((entry) => ({
    id: entry.id,
    slug: entry.slug,
    icon: entry.icon,
    name: entry.names[typedLocale],
  }));
  const activeCategorySlug = category?.trim().toLowerCase() || "";

  return (
    <div className="flex flex-col gap-5 pb-8 sm:gap-8">
      <CannapediaExplorer
        locale={typedLocale}
        categories={categories}
        articles={articles}
        activeCategorySlug={activeCategorySlug}
        hero={{
          badge: copy.badge,
          titleConnector: copy.titleConnector,
          title: copy.title,
          description: copy.description,
        }}
        copy={{
          read: copy.read,
          min: copy.min,
          allCategories: copy.allCategories,
          searchPlaceholder: copy.searchPlaceholder,
          searchActionLabel: copy.searchActionLabel,
          clearLabel: copy.clearLabel,
          searchHint: copy.searchHint,
          noCategoryResults: copy.noCategoryResults,
          noSearchResults: copy.noSearchResults,
          suggestionsTitle: copy.suggestionsTitle,
        }}
      />
    </div>
  );
}

