import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { enUS, ka, ru } from "date-fns/locale";
import { Clock, Heart, MessageCircle } from "lucide-react";
import { CannabisLeaf, CannabisLeafOutline } from "@/components/icons";
import { DiaryExploreBar } from "@/components/diaries/diary-explore-bar";
import { getPublicDiaryFilterCounts, listPublicDiaries } from "@/lib/diary-data";
import {
  parseDiaryExploreSearchParams,
  serializeDiaryExploreQuery,
} from "@/lib/diary-explore-params";
import {
  getLocalizedContent,
  getLocalizedPath,
  isValidLocale,
  type Locale,
} from "@/lib/i18n";
import { getPageMetadataWithSeo } from "@/lib/seo-settings";
import { getServerSessionUser } from "@/lib/auth-session";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

const dateLocales = { en: enUS, ka, ru } as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const { dict } = getLocalizedContent(locale);

  return getPageMetadataWithSeo({
    page: "DIARIES",
    locale,
    path: "/diaries",
    title: `Grower | ${dict.nav.diaries}`,
    description: dict.diaries.description,
  });
}

export default async function DiariesPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const sp = await searchParams;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const { dict } = getLocalizedContent(typedLocale);
  const explore = dict.diaries.explore;
  const basePath = getLocalizedPath(typedLocale, "/diaries");
  const parsed = parseDiaryExploreSearchParams(sp);

  const [{ items, total, page, pageSize }, filterCounts, sessionUser] = await Promise.all([
    listPublicDiaries({
      page: parsed.page,
      sort: parsed.sort,
      filters: parsed.filters,
    }),
    getPublicDiaryFilterCounts(),
    getServerSessionUser(),
  ]);
  const dfLocale = dateLocales[typedLocale];

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <section className="rounded-2xl border border-white/10 bg-slate-950/50 p-5 sm:rounded-[2rem] sm:p-8">
        <div className="flex items-center gap-2 text-xs font-medium text-lime-400 sm:text-sm">
          <CannabisLeaf className="h-4 w-4 shrink-0 text-lime-300" />
          {dict.diaries.badge}
        </div>
        <h1 className="mt-2 text-lg font-semibold text-white sm:text-2xl lg:text-3xl">
          {dict.diaries.title}
        </h1>
        <p className="mt-2 max-w-xl text-xs text-slate-400 sm:text-sm">{dict.diaries.description}</p>
        {sessionUser ? (
          <Link
            href={getLocalizedPath(typedLocale, "/diaries/new")}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-lime-400/40 bg-lime-400/15 px-4 py-2.5 text-sm font-semibold text-lime-100 transition hover:bg-lime-400/25 sm:mt-6 sm:px-5 sm:py-3"
          >
            <CannabisLeafOutline className="h-4 w-4 text-lime-200" />
            {dict.diaries.createDiary}
          </Link>
        ) : (
          <Link
            href={getLocalizedPath(typedLocale, "/auth/login")}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:mt-6 sm:px-5 sm:py-3"
          >
            {dict.diaries.createDiary}
          </Link>
        )}
      </section>

      <DiaryExploreBar
        basePath={basePath}
        sort={parsed.sort}
        filters={parsed.filters}
        page={parsed.page}
        dict={explore}
        counts={filterCounts}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {items.length === 0 ? (
          <p className="col-span-full text-center text-sm text-slate-400">{explore.empty}</p>
        ) : (
          items.map((diary) => {
            const extraStrains = Math.max(0, diary.strains.length - 1);
            const rel = formatDistanceToNow(diary.updatedAt, {
              addSuffix: true,
              locale: dfLocale,
            });
            const diaryHref = getLocalizedPath(typedLocale, `/diaries/${diary.slug}`);
            return (
              <article key={diary.id} className="h-full min-h-0">
                <Link
                  href={diaryHref}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-950/65 text-left transition hover:border-lime-400/30 hover:bg-slate-900/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400/50 sm:rounded-2xl"
                >
                {diary.previewImageUrls[0] ? (
                  <div className="relative h-20 border-b border-white/10 bg-black/20 sm:h-36">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={diary.previewImageUrls[0]}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                ) : null}

                <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-5 lg:p-3.5">
                  <div className="flex items-start justify-between gap-1.5 sm:gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[9px] uppercase leading-tight tracking-[0.12em] text-lime-300/95 sm:text-[10px] sm:tracking-[0.2em] lg:line-clamp-1 lg:text-[9px]">
                        {diary.strain}
                        {extraStrains > 0
                          ? ` · ${explore.strainsMore.replace("{count}", String(extraStrains))}`
                          : ""}
                      </p>
                      <h2 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-white sm:mt-1.5 sm:text-xl sm:leading-tight lg:line-clamp-2 lg:text-[13px] lg:leading-snug">
                        {diary.title}
                      </h2>
                      <p className="mt-1.5 truncate text-[10px] text-slate-500 sm:mt-2 sm:text-[11px]">
                        @{diary.author.username}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-white/6 px-1.5 py-0.5 text-[9px] tabular-nums text-slate-300 sm:px-2.5 sm:py-1 sm:text-[10px] lg:px-1.5 lg:text-[9px]">
                      {explore.relativeWeeks.replace("{n}", String(diary.weekCount))}
                    </span>
                  </div>

                  <div
                    className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/[0.06] pt-2.5 text-[10px] text-slate-400 sm:gap-x-4 sm:pt-3 sm:text-[11px]"
                    role="group"
                    aria-label={`${rel} · ${diary.totalLikes} ${dict.diaries.likes} · ${diary.totalComments} ${dict.diaries.comments}`}
                  >
                    <span className="inline-flex items-center gap-1" title={rel}>
                      <Clock className="h-3.5 w-3.5 shrink-0 text-slate-500" strokeWidth={2} aria-hidden />
                      <span className="tabular-nums text-slate-400">{rel}</span>
                    </span>
                    <span
                      className="inline-flex items-center gap-1"
                      title={`${diary.totalLikes} ${dict.diaries.likes}`}
                    >
                      <Heart className="h-3.5 w-3.5 shrink-0 text-rose-400/90" strokeWidth={2} aria-hidden />
                      <span className="tabular-nums text-slate-300">{diary.totalLikes}</span>
                    </span>
                    <span
                      className="inline-flex items-center gap-1"
                      title={`${diary.totalComments} ${dict.diaries.comments}`}
                    >
                      <MessageCircle className="h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={2} aria-hidden />
                      <span className="tabular-nums text-slate-300">{diary.totalComments}</span>
                    </span>
                  </div>
                </div>
                </Link>
              </article>
            );
          })
        )}
      </div>

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-400">
          {page > 1 ? (
            <Link
              className="rounded-full border border-white/10 px-3 py-1.5 hover:bg-white/5"
              href={`${basePath}${serializeDiaryExploreQuery({
                sort: parsed.sort,
                filters: parsed.filters,
                page: page - 1,
              })}`}
            >
              ←
            </Link>
          ) : null}
          <span>
            {explore.page} {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              className="rounded-full border border-white/10 px-3 py-1.5 hover:bg-white/5"
              href={`${basePath}${serializeDiaryExploreQuery({
                sort: parsed.sort,
                filters: parsed.filters,
                page: page + 1,
              })}`}
            >
              →
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
