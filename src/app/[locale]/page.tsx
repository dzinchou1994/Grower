import Image from "next/image";
import Link from "next/link";
import {
  getLocalizedContent,
  getLocalizedPath,
  isValidLocale,
  type Locale,
} from "@/lib/i18n";
import { getTopUsers, listForumTopics } from "@/lib/forum-data";
import { BookOpenIcon } from "@/components/icons";
import { UserAvatar } from "@/components/user-avatar";
import { getUsernameAccentClassByXp } from "@/lib/leveling";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageMetadataWithSeo } from "@/lib/seo-settings";

const homeHeroImageSrc = "/images/hero-cannabis.avif";

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
  const buySellTopic = forumTopicList.find((topic) => topic.slug === "buy-sell");
  const homeForumTopics = [
    ...forumTopicList.filter((topic) => topic.slug !== "buy-sell").slice(0, 4),
    ...(buySellTopic ? [buySellTopic] : []),
  ];

  return (
    <div className="flex flex-col gap-5 pb-3 sm:gap-8 sm:pb-4">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-white/[0.06] sm:rounded-[2rem]">
        <Image
          src={homeHeroImageSrc}
          alt="Cannabis plant"
          fill
          priority
          quality={58}
          className="object-cover"
          sizes="(max-width: 1280px) 100vw, 1280px"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#08111f]/[0.97] via-[#08111f]/90 to-[#08111f]/70" />

        <div className="relative flex flex-col gap-3 p-4 sm:gap-4 sm:p-6 lg:p-7">
          {/* Status pill */}
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-lime-400/20 bg-lime-400/[0.08] px-2.5 py-1 text-[10px] font-medium text-lime-300 backdrop-blur-sm sm:text-[11px]">
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            {dict.home.privacyHeadline}
          </span>

          <div className="w-full max-w-xl lg:max-w-2xl">
            {/* Headline */}
            <h1 className="w-full text-[1.3rem] font-bold leading-[1.14] tracking-tight text-white sm:text-[1.85rem] lg:text-[2.25rem]">
              {dict.home.title}
            </h1>

            {/* Description */}
            <p className="mt-2 w-full text-[13px] leading-relaxed text-slate-300 sm:text-[15px] sm:leading-7 lg:text-[17px]">
              {dict.home.description}
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Link
              href={getLocalizedPath(typedLocale, "/auth/register")}
              className="inline-flex items-center justify-center rounded-lg bg-lime-400 px-3.5 py-1.5 text-[12px] font-semibold text-slate-950 transition hover:bg-lime-300 sm:px-4 sm:py-2 sm:text-sm"
            >
              {dict.home.joinCta}
            </Link>
            <Link
              href={getLocalizedPath(typedLocale, "/forum")}
              className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[12px] font-medium text-slate-200 transition hover:border-lime-400/20 hover:bg-white/[0.08] hover:text-lime-200 sm:px-4 sm:py-2 sm:text-sm"
            >
              {dict.home.primaryCta}
            </Link>
            <Link
              href={getLocalizedPath(typedLocale, "/cannapedia")}
              className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[12px] font-medium text-slate-200 transition hover:border-lime-400/20 hover:bg-white/[0.08] hover:text-lime-200 sm:px-4 sm:py-2 sm:text-sm"
            >
              {dict.home.tertiaryCta}
            </Link>
          </div>
        </div>
      </section>

      {/* Forum categories + Latest threads */}
      <section className="defer-render flex flex-col gap-5 lg:grid lg:grid-cols-[1fr_1fr] lg:items-stretch lg:gap-6">
        {/* Forum categories */}
        <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-slate-950/55 p-5 sm:rounded-[2rem] sm:p-6">
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

          <div className="mt-5 flex-1 space-y-3 sm:mt-6 sm:space-y-4">
            {homeForumTopics.map((topic) => (
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
        <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-slate-950/55 p-5 sm:rounded-[2rem] sm:p-6">
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

          <div className="mt-5 flex-1 space-y-3 sm:mt-6 sm:space-y-4">
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

      {/* Diary promo — grow journals */}
      <section className="defer-render relative overflow-hidden rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:rounded-[2rem]">
        <div className="pointer-events-none absolute inset-0 bg-[#050a0f]" aria-hidden />
        <div
          className="pointer-events-none absolute -left-1/4 top-0 h-[120%] w-[70%] rounded-full bg-lime-500/[0.13] blur-[100px] lg:bg-lime-500/[0.08] lg:blur-[120px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-1/4 bottom-0 h-[90%] w-[55%] rounded-full bg-emerald-600/[0.14] blur-[90px] lg:bg-emerald-600/[0.09] lg:blur-[100px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(132,204,22,0.09)_0%,transparent_42%,rgba(15,23,42,0.55)_100%)] lg:bg-[linear-gradient(125deg,rgba(132,204,22,0.05)_0%,transparent_50%,rgba(15,23,42,0.45)_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4] [background-image:radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:13px_13px] mix-blend-overlay lg:opacity-[0.22]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime-400/50 to-transparent"
          aria-hidden
        />

        <div className="relative z-10 flex w-full flex-col gap-6 p-5 sm:gap-6 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:py-4">
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/[0.09] px-3 py-1.5 text-[11px] font-medium text-lime-100 shadow-[0_0_22px_-6px_rgba(163,230,53,0.45)] backdrop-blur-sm sm:text-xs lg:py-1 lg:pl-2.5 lg:pr-2.5 lg:text-[10px] lg:shadow-[0_0_12px_-4px_rgba(163,230,53,0.25)]">
              <BookOpenIcon className="h-3.5 w-3.5 text-lime-300 sm:h-4 sm:w-4 lg:h-3.5 lg:w-3.5" />
              {dict.home.diaryPromo}
            </div>
            <h2 className="mt-4 text-[1.35rem] font-bold leading-[1.15] tracking-tight text-white sm:mt-5 sm:text-2xl lg:mt-2.5 lg:text-xl lg:font-semibold lg:leading-snug xl:text-2xl">
              {dict.home.diaryPromoTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300/95 sm:mt-4 sm:text-[15px] sm:leading-7 lg:mt-2 lg:text-sm lg:leading-6">
              {dict.home.diaryPromoDescription}
            </p>
          </div>

          <Link
            href={getLocalizedPath(typedLocale, "/diaries/new")}
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-lime-400 px-5 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_6px_28px_-6px_rgba(163,230,53,0.55)] transition duration-200 hover:-translate-y-0.5 hover:bg-lime-300 hover:shadow-[0_10px_36px_-6px_rgba(163,230,53,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-200/90 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050a0f] active:translate-y-0 sm:w-auto sm:rounded-full sm:px-7 sm:py-3.5 lg:py-2.5 lg:pl-6 lg:pr-5 lg:text-sm lg:hover:translate-y-0 lg:hover:shadow-[0_4px_20px_-6px_rgba(163,230,53,0.45)]"
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

      {/* Manifesto / law awareness banner — last block before site footer */}
      <section className="defer-render relative overflow-hidden rounded-2xl border border-white/[0.06] sm:rounded-[2rem]">
        <div className="absolute inset-0 bg-gradient-to-r from-lime-950/50 via-slate-950/80 to-slate-950/90" />
        <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-lime-400/[0.07] blur-3xl" />
        <Link
          href={getLocalizedPath(typedLocale, "/manifesto")}
          className="group relative block w-full"
        >
          <div className="relative flex w-full flex-col gap-3 p-4 sm:gap-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:p-7">
            <div className="min-w-0 flex-1">
              <h2 className="text-[15px] font-semibold leading-snug text-white sm:text-lg lg:text-xl">
                {dict.home.manifesto.headline}
              </h2>
              <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-slate-400 sm:text-[13px] sm:leading-6 lg:mt-2.5 lg:line-clamp-none lg:text-[13px] lg:leading-7">
                {dict.home.manifesto.text}
              </p>
            </div>
            <div className="flex w-full shrink-0 justify-center lg:w-auto lg:justify-end lg:self-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-slate-200 transition group-hover:bg-lime-400/15 group-hover:text-lime-200 sm:px-3 sm:py-1.5 sm:text-xs lg:px-4 lg:py-2">
                {dict.home.manifesto.cta}
                <svg className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </span>
            </div>
          </div>
        </Link>
      </section>
    </div>
  );
}
