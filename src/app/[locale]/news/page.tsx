import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NewsSubmissionForm } from "@/components/news-submission-form";
import { getServerSessionUser } from "@/lib/auth-session";
import { listPublishedNews, type NewsScope } from "@/lib/news-data";
import { getAlternates, getLocalizedPath, isValidLocale, type Locale } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ scope?: string }>;
};

function getCopy(locale: Locale) {
  if (locale === "ka") {
    return {
      title: "სიახლეები",
      description: "კანაფთან დაკავშირებული ახალი ამბები საქართველოდან და მსოფლიოდან.",
      georgia: "საქართველო",
      world: "მსოფლიო",
      all: "ყველა",
      readMore: "სრულად",
      latest: "ბოლო განახლებები",
    };
  }
  if (locale === "ru") {
    return {
      title: "Новости",
      description: "Новости и обновления по теме каннабиса из Грузии и со всего мира.",
      georgia: "Грузия",
      world: "Мир",
      all: "Все",
      readMore: "Читать",
      latest: "Последние обновления",
    };
  }
  return {
    title: "News",
    description: "Cannabis-related updates from Georgia and around the world.",
    georgia: "Georgia",
    world: "World",
    all: "All",
    readMore: "Read more",
    latest: "Latest updates",
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const copy = getCopy(locale);
  return {
    title: `Grower | ${copy.title}`,
    description: copy.description,
    alternates: getAlternates("/news", locale),
  };
}

export default async function NewsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { scope } = await searchParams;
  if (!isValidLocale(locale)) notFound();

  const typedLocale = locale as Locale;
  const copy = getCopy(typedLocale);
  const resolvedScope: NewsScope | undefined = scope === "GEORGIA" || scope === "WORLD" ? scope : undefined;
  const [newsList, sessionUser] = await Promise.all([
    listPublishedNews(resolvedScope),
    getServerSessionUser(),
  ]);

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <section className="rounded-2xl border border-white/10 bg-white/6 p-5 sm:rounded-[2rem] sm:p-8">
        <h1 className="text-xl font-semibold text-white sm:text-4xl">{copy.title}</h1>
        <p className="mt-2 text-sm text-slate-300 sm:text-base">{copy.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={getLocalizedPath(typedLocale, "/news")}
            className={`rounded-full px-3 py-1.5 text-xs transition ${
              !resolvedScope
                ? "bg-lime-400 text-slate-950"
                : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
            }`}
          >
            {copy.all}
          </Link>
          <Link
            href={getLocalizedPath(typedLocale, "/news?scope=GEORGIA")}
            className={`rounded-full px-3 py-1.5 text-xs transition ${
              resolvedScope === "GEORGIA"
                ? "bg-lime-400 text-slate-950"
                : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
            }`}
          >
            {copy.georgia}
          </Link>
          <Link
            href={getLocalizedPath(typedLocale, "/news?scope=WORLD")}
            className={`rounded-full px-3 py-1.5 text-xs transition ${
              resolvedScope === "WORLD"
                ? "bg-lime-400 text-slate-950"
                : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
            }`}
          >
            {copy.world}
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-8">
        <p className="text-xs text-slate-400 sm:text-sm">{copy.latest}</p>
        <div className="mt-4 grid gap-3 sm:gap-4">
          {newsList.map((article) => (
            <Link
              key={article.id}
              href={getLocalizedPath(typedLocale, `/news/${article.slug}`)}
              className="rounded-2xl border border-white/10 bg-white/4 p-4 transition hover:border-lime-400/30 hover:bg-white/8 sm:rounded-3xl sm:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                <img
                  src={article.imageUrl ?? "/images/hero-cannabis.avif"}
                  alt={article.title[typedLocale]}
                  className="h-28 w-full rounded-xl object-cover sm:h-24 sm:w-40 sm:rounded-2xl"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-lime-400/30 bg-lime-400/10 px-2 py-0.5 text-[10px] text-lime-300">
                      {article.scope === "GEORGIA" ? copy.georgia : copy.world}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(article.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="mt-2 text-base font-semibold text-white sm:text-lg">
                    {article.title[typedLocale]}
                  </h2>
                  <p className="mt-1 text-xs text-slate-300 sm:text-sm">{article.excerpt[typedLocale]}</p>
                  <p className="mt-2 text-xs text-lime-300">{copy.readMore} →</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <NewsSubmissionForm locale={typedLocale} isAuthenticated={Boolean(sessionUser)} />
    </div>
  );
}

