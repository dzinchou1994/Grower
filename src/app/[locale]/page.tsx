import Image from "next/image";
import Link from "next/link";
import {
  getAlternates,
  getLocalizedContent,
  getLocalizedPath,
  isValidLocale,
  type Locale,
} from "@/lib/i18n";
import { CannabisLeaf, CannabisLeafOutline } from "@/components/icons";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

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

  return {
    title: `Grower | ${dict.nav.home}`,
    description: dict.metadataDescription,
    alternates: getAlternates(""),
  };
}

export default async function LocalizedHomePage({ params }: LocalizedPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const { forumTopicList, stats, dict } = getLocalizedContent(typedLocale);

  const allThreads = forumTopicList
    .flatMap((topic) =>
      topic.threads.map((thread) => ({ ...thread, topicSlug: topic.slug, topicTitle: topic.title }))
    )
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-5 pb-8 sm:gap-8">
      {/* Hero section with background image */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-lime-950/10 sm:rounded-[2rem]">
        <Image
          src="/images/hero-cannabis.avif"
          alt="Cannabis plant"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1280px) 100vw, 1280px"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08111f]/95 via-[#08111f]/85 to-[#08111f]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08111f]/90 via-transparent to-[#08111f]/40" />

        <div className="relative p-5 sm:p-8 lg:p-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-lime-400/10 px-3 py-1 text-xs font-medium text-lime-300 backdrop-blur-sm sm:mb-6">
            <CannabisLeaf className="h-3.5 w-3.5" />
            {dict.home.badge}
          </div>
          <h1 className="max-w-2xl text-2xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            {dict.home.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-200/80 sm:mt-4 sm:text-base sm:leading-7">
            {dict.home.description}
          </p>
          <div className="mt-5 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:gap-3">
            <Link
              href={getLocalizedPath(typedLocale, "/forum")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-lime-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-lime-400/20 transition hover:bg-lime-300 sm:text-base"
            >
              {dict.home.primaryCta}
            </Link>
            <Link
              href={getLocalizedPath(typedLocale, "/diaries")}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 sm:text-base"
            >
              <CannabisLeafOutline className="h-4 w-4 text-lime-300" />
              {dict.home.secondaryCta}
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-4 sm:gap-4">
            <StatCard label={dict.home.stats.forumTopics} value={stats.forumTopics} />
            <StatCard label={dict.home.stats.forumThreads} value={stats.forumThreads} />
            <StatCard label={dict.home.stats.forumReplies} value={stats.forumReplies} />
            <StatCard label={dict.home.stats.activeUsers} value={stats.activeUsers} />
          </div>
        </div>
      </section>

      {/* Forum categories + Latest threads */}
      <section className="flex flex-col gap-5 lg:grid lg:grid-cols-[1fr_1fr] lg:gap-6">
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
              <div
                key={thread.slug}
                className="rounded-2xl border border-white/8 bg-slate-950/60 p-4 sm:rounded-3xl sm:p-5"
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diary promo (smaller section) */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-lime-950/30 to-slate-950/50 p-5 sm:rounded-[2rem] sm:p-8">
        <CannabisLeaf className="pointer-events-none absolute -right-6 top-1/2 h-32 w-32 -translate-y-1/2 rotate-[20deg] text-lime-400/[0.06] sm:h-44 sm:w-44" />
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
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 backdrop-blur-sm sm:rounded-3xl sm:p-5">
      <p className="text-xl font-semibold text-white sm:text-3xl">{value}</p>
      <p className="mt-1 text-[10px] text-slate-300 sm:mt-2 sm:text-sm">{label}</p>
    </div>
  );
}
