import type { Metadata } from "next";
import { Noto_Sans_Georgian } from "next/font/google";
import { Newspaper } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NewsSubmissionForm } from "@/components/news-submission-form";
import { getServerSessionUser } from "@/lib/auth-session";
import { listPublishedNews, type NewsScope } from "@/lib/news-data";
import { getAlternates, getLocalizedPath, isValidLocale, type Locale } from "@/lib/i18n";

const newsFallbackImageSrc = "/news/community-workshop.svg";

const newsHeroTitleKa = Noto_Sans_Georgian({
  subsets: ["georgian"],
  weight: ["600"],
  display: "swap",
});

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ scope?: string }>;
};

function getCopy(locale: Locale) {
  if (locale === "ka") {
    return {
      title: "ᲡᲘᲐᲮᲚᲔᲔᲑᲘ",
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

  const dateLocale =
    typedLocale === "ka" ? "ka-GE" : typedLocale === "ru" ? "ru-RU" : "en-US";

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/55 p-5 shadow-lg shadow-black/30 backdrop-blur-md sm:rounded-[2rem] sm:p-8">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
          aria-hidden
        />
        <div className="relative z-[1] flex flex-col gap-4 sm:gap-5">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-lime-400/25 bg-lime-400/10 sm:h-9 sm:w-9">
              <Newspaper
                className="h-4 w-4 text-lime-300 sm:h-[18px] sm:w-[18px]"
                strokeWidth={2.25}
                aria-hidden
              />
            </span>
            <h1
              className={`text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl ${
                typedLocale === "ka" ? newsHeroTitleKa.className : "uppercase"
              }`}
            >
              {copy.title}
            </h1>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base sm:leading-6">
            {copy.description}
          </p>
          <nav className="flex flex-wrap gap-2 sm:gap-2.5" aria-label={copy.title}>
            <Link
              href={getLocalizedPath(typedLocale, "/news")}
              className={`rounded-full px-3.5 py-2 text-xs font-medium transition sm:text-sm ${
                !resolvedScope
                  ? "bg-lime-400/95 text-slate-950 shadow-sm shadow-lime-950/20 ring-1 ring-lime-300/40"
                  : "border border-white/12 bg-white/[0.06] text-slate-200 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              {copy.all}
            </Link>
            <Link
              href={getLocalizedPath(typedLocale, "/news?scope=GEORGIA")}
              className={`rounded-full px-3.5 py-2 text-xs font-medium transition sm:text-sm ${
                resolvedScope === "GEORGIA"
                  ? "bg-lime-400/95 text-slate-950 shadow-sm shadow-lime-950/20 ring-1 ring-lime-300/40"
                  : "border border-white/12 bg-white/[0.06] text-slate-200 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              {copy.georgia}
            </Link>
            <Link
              href={getLocalizedPath(typedLocale, "/news?scope=WORLD")}
              className={`rounded-full px-3.5 py-2 text-xs font-medium transition sm:text-sm ${
                resolvedScope === "WORLD"
                  ? "bg-lime-400/95 text-slate-950 shadow-sm shadow-lime-950/20 ring-1 ring-lime-300/40"
                  : "border border-white/12 bg-white/[0.06] text-slate-200 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              {copy.world}
            </Link>
          </nav>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/65 shadow-xl shadow-black/25 sm:rounded-[2rem]">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-lime-950/10"
          aria-hidden
        />
        <div className="relative p-5 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:text-xs sm:tracking-[0.18em]">
            {copy.latest}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-4 md:gap-5 xl:grid-cols-3 xl:gap-6">
            {newsList.map((article) => {
              const imgSrc = article.imageUrl ?? newsFallbackImageSrc;
              const isLocal = imgSrc.startsWith("/");
              return (
                <Link
                  key={article.id}
                  href={getLocalizedPath(typedLocale, `/news/${article.slug}`)}
                  className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-slate-950/90 transition hover:border-lime-400/35 hover:shadow-lg hover:shadow-lime-950/15 sm:rounded-2xl lg:rounded-3xl"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900/80">
                    {isLocal ? (
                      <Image
                        src={imgSrc}
                        alt={article.title[typedLocale]}
                        fill
                        quality={72}
                        sizes="(max-width: 1279px) 50vw, 33vw"
                        className="object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imgSrc}
                        alt={article.title[typedLocale]}
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    )}
                  </div>
                  <div className="flex min-h-0 flex-1 flex-col p-2.5 sm:p-5">
                    <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 sm:gap-y-1">
                      <span className="w-fit rounded-full border border-lime-400/35 bg-lime-400/10 px-1.5 py-0.5 text-[9px] font-medium text-lime-200 sm:px-2 sm:text-[10px]">
                        {article.scope === "GEORGIA" ? copy.georgia : copy.world}
                      </span>
                      <span className="text-[9px] text-slate-500 sm:text-[10px]">
                        {new Date(article.createdAt).toLocaleDateString(dateLocale, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <h2 className="mt-1.5 line-clamp-3 text-[13px] font-semibold leading-snug text-white sm:mt-2 sm:line-clamp-2 sm:text-base md:text-lg">
                      {article.title[typedLocale]}
                    </h2>
                    <p className="mt-1.5 line-clamp-2 flex-1 text-[11px] leading-relaxed text-slate-400 sm:mt-2 sm:line-clamp-3 sm:text-sm sm:leading-6">
                      {article.excerpt[typedLocale]}
                    </p>
                    <p className="mt-2 text-[10px] font-medium text-lime-300 transition group-hover:text-lime-200 sm:mt-3 sm:text-xs">
                      {copy.readMore} →
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <NewsSubmissionForm locale={typedLocale} isAuthenticated={Boolean(sessionUser)} />
    </div>
  );
}

