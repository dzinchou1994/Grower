import Image from "next/image";
import Link from "next/link";
import {
  getLocalizedContent,
  getLocalizedPath,
  isValidLocale,
  type Locale,
} from "@/lib/i18n";
import { getTopUsers, listForumTopics } from "@/lib/forum-data";
import { CannabisLeaf, CannabisLeafOutline } from "@/components/icons";
import { UserAvatar } from "@/components/user-avatar";
import { getUsernameAccentClassByXp } from "@/lib/leveling";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageMetadataWithSeo } from "@/lib/seo-settings";

type LocalizedPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: LocalizedPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const { dict } = getLocalizedContent(locale);

  return getPageMetadataWithSeo({
    page: "HOME",
    locale,
    path: "",
    title: `Grower | ${dict.nav.home}`,
    description: dict.metadataDescription,
  });
}

export default async function LocalizedHomePage({ params }: LocalizedPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const { dict } = getLocalizedContent(typedLocale);
  const [forumTopicList, topUsers] = await Promise.all([
    listForumTopics(undefined, typedLocale),
    getTopUsers(10),
  ]);

  const allThreads = forumTopicList
    .flatMap((topic) =>
      topic.threads.map((thread) => ({ ...thread, topicSlug: topic.slug, topicTitle: topic.title }))
    )
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-5 pb-3 sm:gap-8 sm:pb-4">
      {/* Hero section with background image */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-lime-950/10 sm:rounded-[2rem]">
        <Image
          src="/images/hero-cannabis.avif"
          alt="Cannabis plant"
          fill
          priority
          quality={72}
          className="object-cover"
          sizes="(max-width: 1280px) 100vw, 1280px"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08111f]/95 via-[#08111f]/85 to-[#08111f]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08111f]/90 via-transparent to-[#08111f]/40" />

        <div className="relative p-5 sm:p-8 lg:p-12">
          <h1 className="max-w-2xl text-2xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            {dict.home.title}{" "}
            <span className="ml-1 inline-flex h-[0.6em] w-[0.85em] translate-y-[-0.05em] overflow-hidden rounded-[2px] border border-white/20 align-middle shadow-sm shadow-black/30">
              <svg viewBox="0 0 20 14" className="h-full w-full">
                <rect width="20" height="14" fill="#fff" />
                <rect x="8.5" y="0" width="3" height="14" fill="#65A30D" />
                <rect x="0" y="5.5" width="20" height="3" fill="#65A30D" />
                <rect x="2.5" y="1.5" width="1.2" height="1.2" fill="#84CC16" />
                <rect x="5" y="1.5" width="1.2" height="1.2" fill="#84CC16" />
                <rect x="2.5" y="3.5" width="1.2" height="1.2" fill="#84CC16" />
                <rect x="5" y="3.5" width="1.2" height="1.2" fill="#84CC16" />
                <rect x="13.5" y="1.5" width="1.2" height="1.2" fill="#84CC16" />
                <rect x="16" y="1.5" width="1.2" height="1.2" fill="#84CC16" />
                <rect x="13.5" y="3.5" width="1.2" height="1.2" fill="#84CC16" />
                <rect x="16" y="3.5" width="1.2" height="1.2" fill="#84CC16" />
                <rect x="2.5" y="9.5" width="1.2" height="1.2" fill="#84CC16" />
                <rect x="5" y="9.5" width="1.2" height="1.2" fill="#84CC16" />
                <rect x="2.5" y="11.5" width="1.2" height="1.2" fill="#84CC16" />
                <rect x="5" y="11.5" width="1.2" height="1.2" fill="#84CC16" />
                <rect x="13.5" y="9.5" width="1.2" height="1.2" fill="#84CC16" />
                <rect x="16" y="9.5" width="1.2" height="1.2" fill="#84CC16" />
                <rect x="13.5" y="11.5" width="1.2" height="1.2" fill="#84CC16" />
                <rect x="16" y="11.5" width="1.2" height="1.2" fill="#84CC16" />
              </svg>
            </span>
          </h1>
          <p className="mt-3 inline-flex max-w-fit items-center rounded-full border border-lime-400/25 bg-lime-400/10 px-3 py-1 text-xs font-medium text-lime-200 sm:text-sm">
            🔒 {dict.home.privacyHeadline}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-200/80 sm:mt-4 sm:text-base sm:leading-7">
            {dict.home.description}
          </p>
          <div className="mt-5 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:gap-3">
            <Link
              href={getLocalizedPath(typedLocale, "/forum")}
              className="relative inline-flex items-center justify-center gap-2 rounded-full bg-lime-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-lime-400/20 transition hover:bg-lime-300 sm:text-base"
            >
              <span className="animate-breathe pointer-events-none absolute inset-0 rounded-full bg-lime-400/40" />
              <span className="relative">{dict.home.primaryCta}</span>
            </Link>
            <Link
              href={getLocalizedPath(typedLocale, "/diaries")}
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 sm:text-base"
            >
              {dict.home.secondaryCta}
            </Link>
            <Link
              href={getLocalizedPath(typedLocale, "/cannapedia")}
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 backdrop-blur-sm transition hover:border-lime-400/30 hover:bg-white/10 hover:text-lime-200 sm:text-base"
            >
              {dict.home.tertiaryCta}
            </Link>
          </div>
        </div>
      </section>

      {/* Manifesto / law awareness banner */}
      <section className="defer-render relative overflow-hidden rounded-2xl border border-lime-400/15 bg-gradient-to-br from-lime-950/40 via-slate-950/60 to-slate-950/80 sm:rounded-[2rem]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(132,204,22,0.06),transparent_60%)]" />
        <Link
          href={getLocalizedPath(typedLocale, "/manifesto")}
          className="group relative block transition hover:bg-white/[0.02]"
        >
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-8">
            <div className="flex min-w-0 items-start gap-3 sm:flex-1 sm:gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lime-400/10 text-2xl sm:h-14 sm:w-14 sm:text-3xl">
                ⚖️
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-lime-400/80 sm:text-xs">
                  {dict.home.manifesto.badge}
                </p>
                <h2 className="mt-1 text-base font-semibold leading-snug text-white sm:text-xl">
                  {dict.home.manifesto.headline}
                </h2>
                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-300/80 sm:text-sm sm:leading-6">
                  {dict.home.manifesto.text}
                </p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-5 py-2.5 text-sm font-medium text-lime-300 transition group-hover:bg-lime-400/20 sm:py-3">
              📜 {dict.home.manifesto.cta}
            </span>
          </div>
        </Link>
      </section>

      {/* Forum categories + Latest threads */}
      <section className="defer-render flex flex-col gap-5 lg:grid lg:grid-cols-[1fr_1fr] lg:gap-6">
        {/* Forum categories */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-5 sm:rounded-[2rem] sm:p-6">
          <div className="flex items-start justify-between gap-3 sm:items-center">
            <div>
              <p className="text-xs text-slate-400 sm:text-sm">{dict.home.forumHighlight}</p>
              <h2 className="mt-1 text-lg font-semibold text-white sm:text-2xl">
                {dict.home.forumHighlightTitle}
              </h2>
            </div>
            <Link
              href={getLocalizedPath(typedLocale, "/forum")}
              className="shrink-0 text-xs font-medium text-lime-300 hover:text-lime-200 sm:text-sm"
            >
              {dict.home.viewAllTopics}
            </Link>
          </div>

          <div className="mt-5 space-y-3 sm:mt-6 sm:space-y-4">
            {forumTopicList.slice(0, 4).map((topic) => (
              <Link
                key={topic.slug}
                href={getLocalizedPath(typedLocale, `/forum/${topic.slug}`)}
                className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/4 p-4 transition hover:border-lime-400/30 hover:bg-white/6 sm:rounded-3xl sm:p-5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-lg sm:h-12 sm:w-12 sm:text-xl">
                  {topic.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-white sm:text-base">
                    {topic.title}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-400 sm:text-sm">
                    {topic.description}
                  </p>
                  <p className="mt-2 text-[10px] text-slate-500 sm:text-xs">
                    {topic.threads.length} {dict.forum.threads}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Latest threads */}
        <div className="rounded-2xl border border-white/10 bg-white/6 p-5 sm:rounded-[2rem] sm:p-6">
          <div className="flex items-start justify-between gap-3 sm:items-center">
            <div>
              <p className="text-xs text-slate-400 sm:text-sm">{dict.home.latestThreads}</p>
              <h2 className="mt-1 text-lg font-semibold text-white sm:text-2xl">
                {dict.forum.latestConversations}
              </h2>
            </div>
            <Link
              href={getLocalizedPath(typedLocale, "/forum")}
              className="shrink-0 text-xs font-medium text-lime-300 hover:text-lime-200 sm:text-sm"
            >
              {dict.home.viewAllThreads}
            </Link>
          </div>

          <div className="mt-5 space-y-3 sm:mt-6 sm:space-y-4">
            {allThreads.map((thread) => (
              <Link
                key={thread.slug}
                href={getLocalizedPath(typedLocale, `/forum/${thread.topicSlug}`)}
                className="block rounded-2xl border border-white/8 bg-slate-950/60 p-4 transition hover:border-lime-400/30 hover:bg-slate-900/70 sm:rounded-3xl sm:p-5"
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
                      <span className="rounded-full bg-lime-400/15 px-2.5 py-1 text-lime-300">
                        📌
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Diary promo (smaller section) */}
      <section className="defer-render relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-lime-950/30 to-slate-950/50 p-5 sm:rounded-[2rem] sm:p-8">
        <CannabisLeaf className="animate-float pointer-events-none absolute -right-6 top-1/2 h-32 w-32 -translate-y-1/2 rotate-[20deg] text-lime-400/[0.06] sm:h-44 sm:w-44" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs text-lime-300 sm:text-sm">
              <CannabisLeaf className="h-4 w-4" />
              {dict.home.diaryPromo}
            </div>
            <h2 className="mt-1.5 text-lg font-semibold text-white sm:mt-2 sm:text-2xl">
              {dict.home.diaryPromoTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:mt-3 sm:text-base">
              {dict.home.diaryPromoDescription}
            </p>
          </div>
          <Link
            href={getLocalizedPath(typedLocale, "/diaries")}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-lime-400/30 px-5 py-2.5 text-sm font-medium text-lime-300 transition hover:bg-lime-400/10 sm:py-3"
          >
            <CannabisLeafOutline className="h-4 w-4" />
            {dict.home.startDiary}
          </Link>
        </div>
      </section>

      {/* Top users leaderboard */}
      <section className="defer-render rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-6">
        <div>
          <p className="text-xs text-slate-400 sm:text-sm">{dict.home.topUsers}</p>
          <h2 className="mt-1 text-lg font-semibold text-white sm:text-2xl">
            {dict.home.topUsersTitle}
          </h2>
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
                      {user.levelEmoji} {user.levelTitle} · 💬 {user.threadsCreated} · 🗨️ {user.commentsPosted}
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
    </div>
  );
}
