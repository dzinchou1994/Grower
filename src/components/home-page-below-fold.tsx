import Link from "next/link";
import { enUS, ka, ru } from "date-fns/locale";
import { BookOpenIcon } from "@/components/icons";
import { DiaryExploreCard } from "@/components/diaries/diary-explore-card";
import { UserAvatar } from "@/components/user-avatar";
import type { DiaryListItem } from "@/lib/diary-data";
import { listPublicDiaries } from "@/lib/diary-data";
import { getTopUsers, listForumTopics } from "@/lib/forum-data";
import { getLocalizedContent, getLocalizedPath, type Locale } from "@/lib/i18n";
import { getUsernameAccentClassByXp } from "@/lib/leveling";

const dateLocales = { en: enUS, ka, ru } as const;

export function HomePageBelowFoldSkeleton() {
  return (
    <div className="flex flex-col gap-5 sm:gap-8" aria-busy="true" aria-label="Loading content">
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6">
        <div className="animate-pulse rounded-2xl border border-white/10 bg-slate-950/40 p-5 sm:rounded-[2rem] sm:p-6">
          <div className="h-4 w-28 rounded bg-white/10" />
          <div className="mt-3 h-7 w-48 rounded bg-white/10" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-white/5 sm:rounded-3xl" />
            ))}
          </div>
        </div>
        <div className="animate-pulse rounded-2xl border border-white/10 bg-slate-950/40 p-5 sm:rounded-[2rem] sm:p-6">
          <div className="h-4 w-32 rounded bg-white/10" />
          <div className="mt-3 h-7 w-44 rounded bg-white/10" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-white/5 sm:rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
      <div className="animate-pulse rounded-2xl border border-white/10 bg-slate-950/40 p-6 sm:rounded-[2rem] sm:p-8">
        <div className="h-5 w-40 rounded bg-white/10" />
        <div className="mt-4 h-10 max-w-md rounded bg-white/8" />
        <div className="mt-3 h-20 max-w-2xl rounded bg-white/5" />
      </div>
      <div className="animate-pulse rounded-2xl border border-white/10 bg-slate-950/40 p-5 sm:rounded-[2rem] sm:p-6">
        <div className="h-4 w-44 rounded bg-white/10" />
        <div className="mt-3 h-7 w-64 rounded bg-white/10" />
        <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/40 sm:rounded-2xl"
            >
              <div className="aspect-[3/4] min-h-[10rem] bg-white/5 sm:aspect-[4/5] sm:min-h-[12rem]" />
            </div>
          ))}
        </div>
      </div>
      <div className="animate-pulse rounded-2xl border border-white/10 bg-slate-950/40 p-5 sm:rounded-[2rem] sm:p-6">
        <div className="h-4 w-36 rounded bg-white/10" />
        <div className="mt-3 h-7 w-52 rounded bg-white/10" />
        <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white/5 sm:rounded-3xl" />
          ))}
        </div>
      </div>
      <div className="animate-pulse rounded-2xl bg-gradient-to-br from-yellow-400/25 via-slate-800/30 to-slate-950 p-[1px] sm:rounded-[2rem]">
        <div className="rounded-[calc(1rem-1px)] bg-slate-950/95 p-5 sm:rounded-[calc(2rem-1px)] sm:p-7">
          <div className="h-6 w-40 rounded-full bg-white/10" />
          <div className="mt-4 h-7 max-w-lg rounded-lg bg-white/10" />
          <div className="mt-3 h-9 max-w-2xl rounded bg-white/5" />
          <div className="mt-6 flex justify-center sm:justify-end">
            <div className="h-10 w-44 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

export async function HomePageBelowFold({ locale }: { locale: Locale }) {
  const typedLocale = locale;
  const { dict } = getLocalizedContent(typedLocale);
  const [forumTopicList, topUsers, recentDiariesResult] = await Promise.all([
    listForumTopics(undefined, typedLocale),
    getTopUsers(10),
    listPublicDiaries({ page: 1, pageSize: 6, sort: "updated" }).catch(
      (): { items: DiaryListItem[] } => ({ items: [] }),
    ),
  ]);

  const recentDiaries = recentDiariesResult.items;
  const dfLocale = dateLocales[typedLocale];
  const diaryCardExplore = {
    relativeWeeks: dict.diaries.explore.relativeWeeks,
    strainsMore: dict.diaries.explore.strainsMore,
    likes: dict.diaries.likes,
    comments: dict.diaries.comments,
  };

  const allThreads = forumTopicList
    .flatMap((topic) =>
      topic.threads.map((thread) => ({ ...thread, topicSlug: topic.slug, topicTitle: topic.title })),
    )
    .slice(0, 5);
  const buySellTopic = forumTopicList.find((topic) => topic.slug === "buy-sell");
  const homeForumTopics = [
    ...forumTopicList.filter((topic) => topic.slug !== "buy-sell").slice(0, 4),
    ...(buySellTopic ? [buySellTopic] : []),
  ];

  return (
    <div className="flex flex-col gap-5 sm:gap-8">
      <section className="defer-render flex flex-col gap-5 lg:grid lg:grid-cols-[1fr_1fr] lg:items-stretch lg:gap-6">
        <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/55 p-5 sm:rounded-[2rem] sm:p-6">
          <Link
            href={getLocalizedPath(typedLocale, "/forum")}
            className="absolute inset-0 z-0 rounded-2xl sm:rounded-[2rem]"
            aria-label={`${dict.home.forumHighlightTitle} — ${dict.home.viewAllTopics}`}
          />
          <div className="relative z-10 flex items-start justify-between gap-3 sm:items-center">
            <div className="min-w-0 pointer-events-none">
              <p className="text-xs text-slate-400 sm:text-sm">{dict.home.forumHighlight}</p>
              <h2 className="mt-1 text-lg font-semibold text-white sm:text-2xl">
                {dict.home.forumHighlightTitle}
              </h2>
            </div>
            <Link
              href={getLocalizedPath(typedLocale, "/forum")}
              className="shrink-0 text-xs font-medium text-lime-300 hover:text-lime-200 sm:text-sm pointer-events-auto"
            >
              {dict.home.viewAllTopics}
            </Link>
          </div>

          <div className="relative z-10 mt-5 flex-1 space-y-3 sm:mt-6 sm:space-y-4">
            {homeForumTopics.map((topic) => (
              <Link
                key={topic.slug}
                href={getLocalizedPath(typedLocale, `/forum/${topic.slug}`)}
                className="relative z-10 flex items-start gap-3 rounded-2xl border border-white/8 bg-white/4 p-4 transition hover:border-lime-400/30 hover:bg-white/6 sm:rounded-3xl sm:p-5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-lg sm:h-12 sm:w-12 sm:text-xl">
                  {topic.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-white sm:text-base">{topic.title}</h3>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-400 sm:text-sm">{topic.description}</p>
                  <p className="mt-2 text-[10px] text-slate-500 sm:text-xs">
                    {topic.threads.length} {dict.forum.threads}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/55 p-5 sm:rounded-[2rem] sm:p-6">
          <Link
            href={getLocalizedPath(typedLocale, "/forum")}
            className="absolute inset-0 z-0 rounded-2xl sm:rounded-[2rem]"
            aria-label={`${dict.forum.latestConversations} — ${dict.home.viewAllThreads}`}
          />
          <div className="relative z-10 flex items-start justify-between gap-3 sm:items-center">
            <div className="min-w-0 pointer-events-none">
              <p className="text-xs text-slate-400 sm:text-sm">{dict.home.latestThreads}</p>
              <h2 className="mt-1 text-lg font-semibold text-white sm:text-2xl">
                {dict.forum.latestConversations}
              </h2>
            </div>
            <Link
              href={getLocalizedPath(typedLocale, "/forum")}
              className="shrink-0 text-xs font-medium text-lime-300 hover:text-lime-200 sm:text-sm pointer-events-auto"
            >
              {dict.home.viewAllThreads}
            </Link>
          </div>

          <div className="relative z-10 mt-5 flex-1 space-y-3 sm:mt-6 sm:space-y-4">
            {allThreads.map((thread) => (
              <Link
                key={thread.slug}
                href={getLocalizedPath(typedLocale, `/forum/${thread.topicSlug}`)}
                className="relative z-10 block rounded-2xl border border-white/8 bg-slate-950/60 p-4 transition hover:border-lime-400/30 hover:bg-slate-900/70 sm:rounded-3xl sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-lime-300 sm:text-xs">{thread.topicTitle}</p>
                    <h3 className="mt-1 line-clamp-1 text-sm font-semibold text-white sm:text-base">
                      {thread.title}
                    </h3>
                    <p className="mt-1.5 text-[10px] text-slate-400 sm:text-xs">
                      @{thread.author} · {thread.lastActivity}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-[10px] text-slate-300 sm:text-xs">
                    <span className="rounded-full bg-white/6 px-2.5 py-1">
                      {thread.replies} {dict.forum.replies}
                    </span>
                    {thread.isPinned && (
                      <span className="rounded-full bg-lime-400/15 px-2.5 py-1 text-lime-300">📌</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="defer-render relative rounded-2xl p-[1px] shadow-[0_28px_70px_-32px_rgba(0,0,0,0.75)] sm:rounded-[2rem] bg-gradient-to-br from-yellow-400/45 via-amber-900/35 to-slate-950">
        <div className="relative overflow-hidden rounded-[calc(1rem-1px)] bg-[#020617] sm:rounded-[calc(2rem-1px)]">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_80%_at_15%_-20%,rgba(250,204,21,0.2),transparent_52%),radial-gradient(ellipse_70%_55%_at_92%_105%,rgba(245,158,11,0.14),transparent_55%),linear-gradient(185deg,rgba(15,23,42,0.55),rgba(2,6,23,0.92))]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.45] [background-image:linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:22px_22px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.14] [background:repeating-linear-gradient(-38deg,transparent,transparent_11px,rgba(250,204,21,0.05)_11px,rgba(250,204,21,0.05)_12px)]"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[3px] overflow-hidden bg-slate-950/80" aria-hidden>
            <div className="h-full w-full animate-shimmer bg-gradient-to-r from-transparent via-yellow-300/85 to-transparent bg-[length:200%_100%] motion-reduce:animate-none" />
          </div>
          <div
            className="pointer-events-none absolute left-3 top-3 z-[2] h-9 w-9 border-l-2 border-t-2 border-yellow-400/45 sm:left-6 sm:top-6"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-3 right-3 z-[2] h-9 w-9 border-b-2 border-r-2 border-amber-500/35 sm:bottom-6 sm:right-6"
            aria-hidden
          />

          <div className="relative z-10 flex w-full flex-col gap-8 p-5 sm:gap-8 sm:p-7 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:py-3">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/35 bg-yellow-400/[0.08] px-3 py-1.5 text-[11px] font-semibold text-yellow-100 sm:px-3.5 sm:py-2 sm:text-xs">
                <BookOpenIcon className="h-3.5 w-3.5 text-yellow-300 sm:h-4 sm:w-4" />
                {dict.home.diaryPromo}
              </div>
              <h2 className="mt-4 text-[1.5rem] font-bold leading-[1.15] tracking-tight text-white sm:mt-5 sm:text-[1.85rem] sm:leading-tight lg:text-3xl xl:text-[2.125rem]">
                {dict.home.diaryPromoTitle}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:mt-4 sm:text-[15px] sm:leading-7 lg:text-base lg:leading-7">
                {dict.home.diaryPromoDescription}
              </p>
              <Link
                href={getLocalizedPath(typedLocale, "/diaries/new")}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_4px_0_0_rgba(161,98,7,0.48)] shadow-yellow-500/15 transition duration-200 hover:-translate-y-0.5 hover:bg-yellow-300 hover:shadow-[0_6px_0_0_rgba(146,64,14,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200/90 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617] active:translate-y-0 sm:w-auto sm:rounded-full sm:px-8 sm:py-3.5 lg:mt-7"
              >
                {dict.home.startDiary}
                <svg
                  className="h-4 w-4 shrink-0 opacity-90"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>

            <div
              className="relative hidden w-full max-w-[300px] shrink-0 select-none lg:block"
              aria-hidden
            >
              <div className="animate-float motion-reduce:animate-none">
                <div className="relative overflow-hidden rounded-2xl border border-white/[0.14] bg-gradient-to-br from-white/[0.1] via-slate-900/20 to-amber-950/40 p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
                  <div className="mb-4 flex gap-1">
                    {["W1", "W2", "W3", "W4", "W5"].map((w, i) => (
                      <span
                        key={w}
                        className={`rounded-md px-2 py-1 text-[10px] font-semibold tabular-nums ${
                          i === 2
                            ? "bg-yellow-400 text-slate-950 shadow-sm"
                            : "bg-white/[0.07] text-slate-500"
                        }`}
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="h-2.5 w-[78%] rounded-full bg-white/[0.12]" />
                    <div className="h-2.5 w-full rounded-full bg-white/[0.06]" />
                    <div className="h-2.5 w-[88%] rounded-full bg-white/[0.05]" />
                  </div>
                  <div className="mt-4 flex gap-3">
                    <div className="h-16 w-16 shrink-0 rounded-xl border border-yellow-400/30 bg-gradient-to-br from-yellow-400/30 via-amber-900/30 to-slate-900/80" />
                    <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 pt-0.5">
                      <div className="h-2 w-full rounded-full bg-white/[0.1]" />
                      <div className="h-2 w-[72%] rounded-full bg-white/[0.06]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {recentDiaries.length > 0 ? (
        <section className="defer-render rounded-2xl border border-white/10 bg-slate-950/55 p-5 sm:rounded-[2rem] sm:p-6">
          <div className="flex items-start justify-between gap-3 sm:items-center">
            <div>
              <p className="text-xs text-slate-400 sm:text-sm">{dict.home.recentDiariesHighlight}</p>
              <h2 className="mt-1 text-lg font-semibold text-white sm:text-2xl">
                {dict.home.recentDiariesTitle}
              </h2>
            </div>
            <Link
              href={getLocalizedPath(typedLocale, "/diaries")}
              className="shrink-0 text-xs font-medium text-yellow-300 hover:text-yellow-200 sm:text-sm"
            >
              {dict.home.viewAllDiaries}
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-3">
            {recentDiaries.map((diary) => (
              <DiaryExploreCard
                key={diary.id}
                diary={diary}
                typedLocale={typedLocale}
                dateFnsLocale={dfLocale}
                explore={diaryCardExplore}
                imageSizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 16vw"
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="defer-render rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-6">
        <div>
          <p className="text-xs text-slate-400 sm:text-sm">{dict.home.topUsers}</p>
          <h2 className="mt-1 text-lg font-semibold text-white sm:text-2xl">{dict.home.topUsersTitle}</h2>
        </div>

        <div className="mt-4 sm:mt-5">
          <ol className="grid grid-cols-2 gap-2 sm:gap-3">
            {topUsers.map((user, index) => (
              <li key={user.username}>
                <Link
                  href={getLocalizedPath(typedLocale, `/u/${user.username}`)}
                  className="flex flex-col gap-1.5 rounded-xl border border-white/10 bg-slate-900/40 px-2.5 py-2.5 transition hover:border-lime-400/35 hover:bg-slate-900/70 sm:flex-row sm:items-center sm:gap-3 sm:rounded-3xl sm:px-4 sm:py-3.5"
                >
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime-400/15 text-[10px] font-semibold text-lime-200 sm:h-8 sm:w-8 sm:text-sm">
                      #{index + 1}
                    </span>
                    <UserAvatar username={user.username} image={user.image} size="sm" />
                    <p
                      className={`min-w-0 truncate text-xs font-medium sm:text-base ${getUsernameAccentClassByXp(
                        user.xp,
                      )}`}
                    >
                      @{user.username}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-1 pl-8 sm:min-w-0 sm:flex-1 sm:pl-0">
                    <p className="truncate text-[9px] text-slate-400 sm:text-xs">
                      {user.levelEmoji} {user.levelTitle} · 💬 {user.threadsCreated} · 🗨️{" "}
                      {user.commentsPosted}
                    </p>
                    <span className="shrink-0 rounded-full border border-white/15 bg-white/5 px-1.5 py-0.5 text-[9px] font-medium text-slate-200 sm:px-2 sm:py-1 sm:text-xs">
                      {user.xp} XP
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="defer-render relative rounded-2xl p-[1px] shadow-[0_28px_70px_-36px_rgba(0,0,0,0.9)] sm:rounded-[2rem] bg-gradient-to-br from-lime-400/45 via-emerald-900/35 to-slate-950">
        <div className="relative overflow-hidden rounded-[calc(1rem-1px)] bg-[#030712] sm:rounded-[calc(2rem-1px)]">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_75%_at_12%_-18%,rgba(52,211,153,0.22),transparent_52%),radial-gradient(ellipse_65%_55%_at_96%_108%,rgba(163,230,53,0.12),transparent_56%),linear-gradient(188deg,rgba(15,23,42,0.5),rgba(3,7,18,0.96))]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.4] [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:22px_22px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.11] [background:repeating-linear-gradient(-40deg,transparent,transparent_12px,rgba(132,204,22,0.05)_12px,rgba(132,204,22,0.05)_13px)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime-400/45 to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-3 top-3 z-[1] h-9 w-9 border-l-2 border-t-2 border-lime-400/40 sm:left-5 sm:top-5"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-3 right-3 z-[1] h-9 w-9 border-b-2 border-r-2 border-emerald-500/35 sm:bottom-5 sm:right-5"
            aria-hidden
          />

          <Link
            href={getLocalizedPath(typedLocale, "/manifesto")}
            className="group relative z-10 block w-full outline-none transition-[transform,box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-lime-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030712] sm:rounded-[calc(2rem-1px)]"
          >
            <div className="flex w-full flex-col gap-4 p-5 sm:gap-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:p-8">
              <div className="min-w-0 flex-1">
                <div className="inline-flex max-w-full items-center rounded-full border border-lime-400/35 bg-lime-400/[0.09] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:px-3.5 sm:py-2 sm:text-[11px] sm:tracking-[0.18em]">
                  {dict.home.manifesto.badge}
                </div>
                <h2 className="mt-4 text-lg font-bold leading-[1.2] tracking-tight text-white sm:mt-5 sm:text-[1.35rem] sm:leading-tight lg:text-2xl xl:text-[1.65rem]">
                  {dict.home.manifesto.headline}
                </h2>
                <p className="mt-3 line-clamp-2 text-[12px] leading-relaxed text-slate-300/95 sm:text-[13px] sm:leading-6 lg:mt-4 lg:line-clamp-none lg:text-[14px] lg:leading-7">
                  {dict.home.manifesto.text}
                </p>
              </div>
              <div className="flex w-full shrink-0 justify-center lg:w-auto lg:justify-end lg:self-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-gradient-to-b from-white/[0.1] to-white/[0.03] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_8px_24px_-12px_rgba(0,0,0,0.5)] transition group-hover:border-lime-400/55 group-hover:from-lime-400/20 group-hover:to-emerald-950/40 group-hover:text-lime-50 sm:px-5 sm:py-3 sm:text-sm">
                  {dict.home.manifesto.cta}
                  <svg
                    className="h-4 w-4 shrink-0 transition group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
