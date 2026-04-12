import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CannabisLeaf, CannabisLeafOutline } from "@/components/icons";
import {
  DiariesExploreBody,
  DiariesExploreSkeleton,
} from "@/components/diaries/diaries-explore-body";
import { DiaryExploreBar, DiarySortBar } from "@/components/diaries/diary-explore-bar";
import { getPublicDiaryFilterCounts } from "@/lib/diary-data";
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

  let filterCounts: Awaited<ReturnType<typeof getPublicDiaryFilterCounts>>;
  let sessionUser: Awaited<ReturnType<typeof getServerSessionUser>>;

  try {
    const bundle = await withTimeout(
      Promise.all([getPublicDiaryFilterCounts(), getServerSessionUser()]),
      25_000,
    );
    filterCounts = bundle[0];
    sessionUser = bundle[1];
  } catch (err) {
    console.error("[diaries] counts / session failed:", err);
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

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <section className="rounded-2xl border border-white/10 bg-slate-950/50 p-5 sm:rounded-[2rem] sm:p-8">
        <div className="flex items-center gap-2 text-xs font-medium text-yellow-400 sm:text-sm">
          <CannabisLeaf className="h-4 w-4 shrink-0 text-yellow-300" />
          {dict.diaries.badge}
        </div>
        <h1 className="mt-2 text-lg font-semibold text-white sm:text-2xl lg:text-3xl">
          {dict.diaries.title}
        </h1>
        <p className="mt-2 max-w-xl text-xs text-slate-400 sm:text-sm">{dict.diaries.description}</p>
        {sessionUser ? (
          <Link
            href={getLocalizedPath(typedLocale, "/diaries/new")}
            className="group mt-5 inline-flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm shadow-yellow-500/25 transition hover:bg-yellow-300 sm:mt-6 sm:px-5 sm:py-3"
          >
            <span className="inline-flex items-center gap-2">
              <CannabisLeafOutline className="h-4 w-4 text-slate-900/90 transition group-hover:text-slate-950" />
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

      <Suspense fallback={<DiariesExploreSkeleton />}>
        <DiariesExploreBody
          typedLocale={typedLocale}
          parsed={parsed}
          basePath={basePath}
          explore={{
            empty: explore.empty,
            relativeWeeks: explore.relativeWeeks,
            strainsMore: explore.strainsMore,
            page: explore.page,
            likes: dict.diaries.likes,
            comments: dict.diaries.comments,
          }}
          diaries={{
            loadErrorTitle: dict.diaries.loadErrorTitle,
            loadErrorHint: dict.diaries.loadErrorHint,
          }}
          serializeQuery={serializeDiaryExploreQuery}
        />
      </Suspense>
    </div>
  );
}
