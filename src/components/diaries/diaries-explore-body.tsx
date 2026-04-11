import Link from "next/link";
import { enUS, ka, ru } from "date-fns/locale";
import { DiaryExploreCard } from "@/components/diaries/diary-explore-card";
import { listPublicDiaries } from "@/lib/diary-data";
import { parseDiaryExploreSearchParams } from "@/lib/diary-explore-params";
import { withTimeout } from "@/lib/async-timeout";
import { type Locale } from "@/lib/i18n";

const dateLocales = { en: enUS, ka, ru } as const;

type ParsedExplore = ReturnType<typeof parseDiaryExploreSearchParams>;

type ExploreDict = {
  empty: string;
  relativeWeeks: string;
  strainsMore: string;
  page: string;
  likes: string;
  comments: string;
};

type DiariesDict = {
  loadErrorTitle: string;
  loadErrorHint: string;
};

export function DiariesExploreSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse overflow-hidden rounded-xl border border-white/10 bg-slate-950/40 sm:rounded-2xl"
          >
            <div className="aspect-[3/4] min-h-[13rem] bg-white/5 sm:aspect-[4/5] sm:min-h-[15rem]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export async function DiariesExploreBody({
  typedLocale,
  parsed,
  basePath,
  explore,
  diaries,
  serializeQuery,
}: {
  typedLocale: Locale;
  parsed: ParsedExplore;
  basePath: string;
  explore: ExploreDict;
  diaries: DiariesDict;
  serializeQuery: (input: {
    sort: ParsedExplore["sort"];
    filters: ParsedExplore["filters"];
    page: number;
  }) => string;
}) {
  const dfLocale = dateLocales[typedLocale];

  let items: Awaited<ReturnType<typeof listPublicDiaries>>["items"];
  let total: number;
  let page: number;
  let pageSize: number;
  let loadError = false;

  try {
    const result = await withTimeout(
      listPublicDiaries({
        page: parsed.page,
        sort: parsed.sort,
        filters: parsed.filters,
      }),
      25_000,
    );
    ({ items, total, page, pageSize } = result);
  } catch (err) {
    console.error("[diaries] list failed:", err);
    loadError = true;
    items = [];
    total = 0;
    page = parsed.page;
    pageSize = 12;
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      {loadError ? (
        <div
          role="alert"
          className="rounded-2xl border border-rose-500/35 bg-rose-950/35 px-4 py-3 text-sm text-rose-100 sm:rounded-[2rem] sm:px-6 sm:py-4"
        >
          <p className="font-semibold text-white">{diaries.loadErrorTitle}</p>
          <p className="mt-1.5 leading-relaxed text-rose-100/90">{diaries.loadErrorHint}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {items.length === 0 && !loadError ? (
          <p className="col-span-full text-center text-sm text-slate-400">{explore.empty}</p>
        ) : null}
        {!loadError
          ? items.map((diary) => (
              <DiaryExploreCard
                key={diary.id}
                diary={diary}
                typedLocale={typedLocale}
                dateFnsLocale={dfLocale}
                explore={{
                  relativeWeeks: explore.relativeWeeks,
                  strainsMore: explore.strainsMore,
                  likes: explore.likes,
                  comments: explore.comments,
                }}
              />
            ))
          : null}
      </div>

      {totalPages > 1 && !loadError ? (
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-400">
          {page > 1 ? (
            <Link
              className="rounded-full border border-white/10 px-3 py-1.5 hover:bg-white/5"
              href={`${basePath}${serializeQuery({
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
              href={`${basePath}${serializeQuery({
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
    </>
  );
}
