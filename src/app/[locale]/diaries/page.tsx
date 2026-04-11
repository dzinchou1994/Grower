import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { enUS, ka, ru } from "date-fns/locale";
import { Clock, Heart, MessageCircle } from "lucide-react";
import { CannabisLeaf, CannabisLeafOutline } from "@/components/icons";
import { DiaryExploreBar, DiarySortBar } from "@/components/diaries/diary-explore-bar";
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
import { withTimeout } from "@/lib/async-timeout";
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

  let items: Awaited<ReturnType<typeof listPublicDiaries>>["items"];
  let total: number;
  let page: number;
  let pageSize: number;
  let filterCounts: Awaited<ReturnType<typeof getPublicDiaryFilterCounts>>;
  let sessionUser: Awaited<ReturnType<typeof getServerSessionUser>>;
  let loadError = false;

  try {
    const bundle = await withTimeout(
      Promise.all([
        listPublicDiaries({
          page: parsed.page,
          sort: parsed.sort,
          filters: parsed.filters,
        }),
        getPublicDiaryFilterCounts(),
        getServerSessionUser(),
      ]),
      25_000,
    );
    ({ items, total, page, pageSize } = bundle[0]);
    filterCounts = bundle[1];
    sessionUser = bundle[2];
  } catch (err) {
    console.error("[diaries] list / filter counts failed:", err);
    loadError = true;
    items = [];
    total = 0;
    page = parsed.page;
    pageSize = 12;
    filterCounts = {
      total: 0,
      growing: 0,
      harvested: 0,
      autoFlower: 0,
      photoPeriod: 0,
      indoor: 0,
      outdoor: 0,
      greenhouse: 0,
    };
    sessionUser = await getServerSessionUser();
  }

  const dfLocale = dateLocales[typedLocale];

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {loadError ? (
        <div
          role="alert"
          className="rounded-2xl border border-rose-500/35 bg-rose-950/35 px-4 py-3 text-sm text-rose-100 sm:rounded-[2rem] sm:px-6 sm:py-4"
        >
          <p className="font-semibold text-white">{dict.diaries.loadErrorTitle}</p>
          <p className="mt-1.5 leading-relaxed text-rose-100/90">{dict.diaries.loadErrorHint}</p>
        </div>
      ) : null}
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
            className="btn-lime-sheen group mt-5 inline-flex items-center gap-2 rounded-full border border-lime-300/45 bg-gradient-to-b from-lime-400/[0.22] to-lime-500/[0.08] px-4 py-2.5 text-sm font-semibold text-lime-50 ring-1 ring-lime-400/25 transition hover:border-lime-200/55 hover:from-lime-300/30 hover:to-lime-400/15 hover:shadow-[0_0_28px_-6px_rgba(190,242,100,0.55)] hover:ring-lime-300/35 sm:mt-6 sm:px-5 sm:py-3"
          >
            <span className="relative z-[1] inline-flex items-center gap-2">
              <CannabisLeafOutline className="h-4 w-4 text-lime-100/95 drop-shadow-[0_0_8px_rgba(190,242,100,0.35)] transition group-hover:text-white" />
              {dict.diaries.createDiary}
            </span>
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
        locale={typedLocale}
        dict={explore}
        counts={filterCounts}
      />

      <DiarySortBar
        basePath={basePath}
        sort={parsed.sort}
        filters={parsed.filters}
        page={parsed.page}
        dict={explore}
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
            const preview = diary.previewImageUrls[0];
            const metaRow = (
              <div
                className={`mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-2.5 text-[10px] sm:gap-x-4 sm:pt-3 sm:text-[11px] ${
                  preview
                    ? "border-white/15 text-white/85 [text-shadow:0_1px_2px_rgba(0,0,0,0.65)]"
                    : "border-white/[0.06] text-slate-400"
                }`}
                role="group"
                aria-label={`${rel} · ${diary.totalLikes} ${dict.diaries.likes} · ${diary.totalComments} ${dict.diaries.comments}`}
              >
                <span className="inline-flex items-center gap-1" title={rel}>
                  <Clock
                    className={`h-3.5 w-3.5 shrink-0 ${preview ? "text-white/60" : "text-slate-500"}`}
                    strokeWidth={2}
                    aria-hidden
                  />
                  <span className={`tabular-nums ${preview ? "text-white/90" : "text-slate-400"}`}>{rel}</span>
                </span>
                <span
                  className="inline-flex items-center gap-1"
                  title={`${diary.totalLikes} ${dict.diaries.likes}`}
                >
                  <Heart
                    className={`h-3.5 w-3.5 shrink-0 ${preview ? "text-rose-300/95" : "text-rose-400/90"}`}
                    strokeWidth={2}
                    aria-hidden
                  />
                  <span className={`tabular-nums ${preview ? "text-white/90" : "text-slate-300"}`}>
                    {diary.totalLikes}
                  </span>
                </span>
                <span
                  className="inline-flex items-center gap-1"
                  title={`${diary.totalComments} ${dict.diaries.comments}`}
                >
                  <MessageCircle
                    className={`h-3.5 w-3.5 shrink-0 ${preview ? "text-white/55" : "text-slate-400"}`}
                    strokeWidth={2}
                    aria-hidden
                  />
                  <span className={`tabular-nums ${preview ? "text-white/90" : "text-slate-300"}`}>
                    {diary.totalComments}
                  </span>
                </span>
              </div>
            );

            return (
              <article key={diary.id} className="h-full min-h-0">
                <Link
                  href={diaryHref}
                  className="group flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-950/65 text-left shadow-[0_12px_40px_-16px_rgba(0,0,0,0.65)] transition hover:border-lime-400/35 hover:shadow-[0_16px_44px_-12px_rgba(0,0,0,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400/50 sm:rounded-2xl"
                >
                  {preview ? (
                    <div className="relative aspect-[3/4] w-full min-h-[13rem] overflow-hidden sm:aspect-[4/5] sm:min-h-[15rem]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview}
                        alt=""
                        className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.035]"
                        loading="lazy"
                        decoding="async"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      {/* ტექსტის ზონა: ქვედა ~60% ფოტოს ძლიერი ჩაბნელება (წაკითხვადობა) */}
                      <div
                        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[62%] min-h-[12rem] w-full bg-gradient-to-t from-black via-black/92 to-transparent sm:min-h-[13.5rem]"
                        aria-hidden
                      />
                      <span className="absolute right-2 top-2 z-[2] rounded-full border border-white/10 bg-black/50 px-2 py-0.5 text-[9px] font-medium tabular-nums text-white shadow-sm backdrop-blur-sm sm:right-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[10px]">
                        {explore.relativeWeeks.replace("{n}", String(diary.weekCount))}
                      </span>
                      <div className="absolute inset-x-0 bottom-0 z-[2] flex min-h-0 flex-col p-3 sm:p-4">
                        <p className="line-clamp-2 text-[9px] font-medium uppercase leading-tight tracking-[0.12em] text-lime-200 [text-shadow:0_1px_2px_rgba(0,0,0,1)] sm:text-[10px] sm:tracking-[0.18em]">
                          {diary.strain}
                          {extraStrains > 0
                            ? ` · ${explore.strainsMore.replace("{count}", String(extraStrains))}`
                            : ""}
                        </p>
                        <h2 className="mt-1 line-clamp-2 text-[13px] font-semibold leading-snug text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.95)] sm:mt-1.5 sm:text-base sm:leading-tight">
                          {diary.title}
                        </h2>
                        <p className="mt-1 truncate text-[10px] text-white sm:text-[11px]">
                          @{diary.author.username}
                        </p>
                        {metaRow}
                      </div>
                    </div>
                  ) : (
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
                      {metaRow}
                    </div>
                  )}
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
