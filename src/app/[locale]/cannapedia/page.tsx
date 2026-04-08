import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CannabisLeaf } from "@/components/icons";
import {
  getCannapediaCategories,
  listCannapediaArticles,
} from "@/lib/cannapedia-data";
import {
  getLocalizedPath,
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
    };
  }

  return {
    title: "Cannapedia - Grower Knowledge Base",
    description:
      "Practical beginner guides for seedling, vegetative growth, flowering, and harvest.",
    badge: "Cannapedia",
    read: "Read article",
    min: "min",
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
  const visibleArticles = activeCategorySlug
    ? articles.filter((article) => article.category.slug === activeCategorySlug)
    : articles;

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

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
        <Link
          href={getLocalizedPath(typedLocale, "/cannapedia")}
          className={`rounded-2xl border p-4 text-slate-200 transition sm:rounded-3xl sm:p-5 ${
            !activeCategorySlug
              ? "border-lime-400/40 bg-lime-400/10 text-lime-200"
              : "border-white/10 bg-slate-950/60 hover:border-lime-400/30"
          }`}
        >
          <p className="text-xl">📚</p>
          <p className="mt-1 text-sm font-medium sm:text-base">ყველა</p>
        </Link>
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={getLocalizedPath(typedLocale, `/cannapedia?category=${category.slug}`)}
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
            href={getLocalizedPath(typedLocale, `/cannapedia/${article.slug}`)}
            className="rounded-2xl border border-white/10 bg-slate-950/65 p-4 transition hover:border-lime-400/30 hover:bg-slate-900 sm:rounded-3xl sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-semibold text-white sm:text-xl">
                {article.title[typedLocale]}
              </h2>
              <span className="shrink-0 rounded-full border border-white/10 px-2 py-1 text-[11px] text-slate-300">
                {article.readMinutes} {copy.min}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400 sm:text-sm sm:leading-6">
              {article.excerpt[typedLocale]}
            </p>
            <p className="mt-3 text-xs font-medium text-lime-300 sm:text-sm">{copy.read} →</p>
          </Link>
        ))}
        {visibleArticles.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-950/65 p-5 text-sm text-slate-300 sm:rounded-3xl sm:p-6">
            ამ კატეგორიაში სტატია ჯერ არ არის.
          </div>
        ) : null}
      </section>
    </div>
  );
}

