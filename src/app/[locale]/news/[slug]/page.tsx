import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAlternates, getLocalizedPath, isValidLocale, type Locale } from "@/lib/i18n";
import { getNewsBySlug, listNewsSlugs } from "@/lib/news-data";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await listNewsSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) return {};
  const article = await getNewsBySlug(slug);
  if (!article) return {};

  return {
    title: `Grower | ${article.title[locale]}`,
    description: article.excerpt[locale],
    alternates: getAlternates(`/news/${slug}`, locale),
  };
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();
  const typedLocale = locale as Locale;
  const article = await getNewsBySlug(slug);
  if (!article) notFound();

  const backLabel =
    typedLocale === "ka" ? "უკან სიახლეებზე" : typedLocale === "ru" ? "Назад к новостям" : "Back to news";
  const regionLabel =
    article.scope === "GEORGIA"
      ? typedLocale === "ka"
        ? "საქართველო"
        : typedLocale === "ru"
          ? "Грузия"
          : "Georgia"
      : typedLocale === "ka"
        ? "მსოფლიო"
        : typedLocale === "ru"
          ? "Мир"
          : "World";

  return (
    <article className="mx-auto w-full max-w-4xl">
      <section className="rounded-2xl border border-white/10 bg-slate-950/65 p-5 sm:rounded-[2rem] sm:p-8">
        <Link
          href={getLocalizedPath(typedLocale, "/news")}
          className="text-xs text-lime-300 transition hover:text-lime-200 sm:text-sm"
        >
          ← {backLabel}
        </Link>

        <img
          src={article.imageUrl ?? "/images/hero-cannabis.avif"}
          alt={article.title[typedLocale]}
          className="mt-4 h-56 w-full rounded-2xl object-cover sm:h-72"
        />

        <div className="mt-4 flex items-center gap-2">
          <span className="rounded-full border border-lime-400/30 bg-lime-400/10 px-2 py-0.5 text-[10px] text-lime-300">
            {regionLabel}
          </span>
          <span className="text-[10px] text-slate-500">
            {new Date(article.createdAt).toLocaleDateString()}
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-semibold text-white sm:text-4xl">{article.title[typedLocale]}</h1>
        <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-200 sm:text-base">
          {article.body[typedLocale]}
        </p>
        {article.sourceUrl ? (
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
          >
            {article.sourceName || article.sourceUrl}
          </a>
        ) : null}
      </section>
    </article>
  );
}

