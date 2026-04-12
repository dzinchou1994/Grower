import type { Metadata } from "next";
import { MessagesSquare } from "lucide-react";
import { Noto_Sans_Georgian } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSessionUser } from "@/lib/auth-session";
import { ForumSearchInput } from "@/components/forum-search-input";
import { ForumThreadComposer } from "@/components/forum-thread-composer";
import {
  getLocalizedContent,
  getLocalizedPath,
  isValidLocale,
  type Locale,
} from "@/lib/i18n";
import { toMtavruli } from "@/lib/georgian-mtavruli";
import { listForumTopics } from "@/lib/forum-data";
import { getPageMetadataWithSeo } from "@/lib/seo-settings";

/** Hero badge: Mtavruli + Noto so “caps” render like EN uppercase (system fonts often look wrong). */
const forumHeroBadgeKa = Noto_Sans_Georgian({
  subsets: ["georgian"],
  weight: ["600", "700"],
  display: "swap",
});

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const { dict } = getLocalizedContent(locale);

  return getPageMetadataWithSeo({
    page: "FORUM",
    locale,
    path: "/forum",
    title: dict.routeMeta.forum.title,
    description: dict.routeMeta.forum.description,
  });
}

export default async function ForumPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { q } = await searchParams;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const { dict } = getLocalizedContent(typedLocale);
  const ui =
    typedLocale === "ka"
      ? {
          searchPlaceholder: "თემა, კომენტარი ან ავტორი…",
          search: "ძებნა",
          noMatches: "შენს ძებნაზე შედეგი ვერ მოიძებნა.",
          suggestThreads: "თემები",
          suggestComments: "კომენტარები",
          suggestLoading: "ძებნა…",
          suggestEmpty: "შემოთავაზება ვერ მოიძებნა.",
        }
      : typedLocale === "ru"
        ? {
            searchPlaceholder: "Тема, тред или автор…",
            search: "Поиск",
            noMatches: "По вашему запросу ничего не найдено.",
            suggestThreads: "Темы",
            suggestComments: "Комментарии",
            suggestLoading: "Поиск…",
            suggestEmpty: "Подсказок не найдено.",
          }
        : {
            searchPlaceholder: "Topic, thread or author…",
            search: "Search",
            noMatches: "No matches found for your search.",
            suggestThreads: "Threads",
            suggestComments: "Comments",
            suggestLoading: "Searching…",
            suggestEmpty: "No suggestions yet.",
          };
  const [forumTopicList, sessionUser] = await Promise.all([
    listForumTopics(q, typedLocale),
    getServerSessionUser(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/55 p-5 shadow-lg shadow-black/30 backdrop-blur-md sm:rounded-[2rem] sm:p-8">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent"
          aria-hidden
        />
        <div className="relative z-[1]">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-nowrap items-start justify-between gap-3 sm:gap-4">
              <div
                className={`inline-flex min-w-0 flex-1 items-center gap-3 text-lg text-lime-300 sm:gap-3.5 sm:text-2xl ${
                  typedLocale === "ka"
                    ? "font-semibold tracking-wide"
                    : "font-semibold uppercase tracking-wide"
                }`}
              >
                <span
                  className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-400/[0.22] via-emerald-500/[0.08] to-slate-900/80 shadow-[0_0_0_1px_rgba(132,204,22,0.35),0_10px_28px_-12px_rgba(16,185,129,0.45),inset_0_1px_0_0_rgba(255,255,255,0.12)] sm:h-10 sm:w-10 sm:rounded-[1.1rem]"
                  aria-hidden
                >
                  <MessagesSquare
                    className="h-[18px] w-[18px] text-lime-200/95 sm:h-5 sm:w-5"
                    strokeWidth={1.65}
                    aria-hidden
                  />
                </span>
                <span
                  className={`min-w-0 flex-1 leading-snug text-lime-300/95 sm:leading-tight ${
                    typedLocale === "ka" ? forumHeroBadgeKa.className : ""
                  }`}
                >
                  {typedLocale === "ka" ? toMtavruli(dict.forum.badge) : dict.forum.badge}
                </span>
              </div>
              <div className="shrink-0 pt-0.5">
                <ForumThreadComposer
                  topics={forumTopicList.map((topic) => ({ slug: topic.slug, title: topic.title }))}
                  isAuthenticated={Boolean(sessionUser)}
                  loginHref={getLocalizedPath(typedLocale, "/auth/login")}
                  locale={typedLocale}
                  collapsible
                  heroCompact
                />
              </div>
            </div>
            <h1 className="sr-only">{dict.forum.title}</h1>
            <p className="max-w-3xl text-xs leading-relaxed text-slate-300 sm:text-sm sm:leading-6">
              {dict.forum.description}
            </p>

            <ForumSearchInput
              locale={typedLocale}
              defaultValue={q ?? ""}
              placeholder={ui.searchPlaceholder}
              searchLabel={ui.search}
              sectionThreads={ui.suggestThreads}
              sectionComments={ui.suggestComments}
              loadingLabel={ui.suggestLoading}
              emptyLabel={ui.suggestEmpty}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:gap-5">
        {forumTopicList.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-950/65 p-5 text-sm text-slate-300 sm:rounded-[2rem] sm:p-6">
            {ui.noMatches}
          </div>
        ) : null}

        {forumTopicList.map((topic) => (
          <article
            key={topic.slug}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/65 p-5 transition hover:border-lime-400/30 hover:bg-slate-900 sm:rounded-[2rem] sm:p-6"
          >
            <Link
              href={getLocalizedPath(typedLocale, `/forum/${topic.slug}`)}
              className="absolute inset-0 z-[1] rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/50 focus-visible:ring-inset sm:rounded-[2rem]"
              aria-labelledby={`forum-topic-title-${topic.slug}`}
            >
              <span className="sr-only">
                {topic.title} - {topic.description}
              </span>
            </Link>

            <div className="relative z-[2] flex items-start gap-3 pointer-events-none sm:gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-lime-400/10 text-sm leading-none sm:h-9 sm:w-9 sm:rounded-xl sm:text-base">
                {topic.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2
                      id={`forum-topic-title-${topic.slug}`}
                      className="text-lg font-semibold text-white sm:text-2xl"
                    >
                      {topic.title}
                    </h2>
                    {topic.isTranslated ? (
                      <span className="mt-1 inline-flex rounded-full border border-lime-400/35 bg-lime-400/10 px-2 py-0.5 text-[10px] text-lime-300">
                        Translated
                      </span>
                    ) : null}
                  </div>
                  <span className="shrink-0 rounded-full bg-white/6 px-3 py-1 text-[10px] text-slate-300 sm:text-xs">
                    {topic.threads.length} {dict.forum.threads}
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400 sm:mt-2 sm:text-sm sm:leading-6">
                  {topic.description}
                </p>
              </div>
            </div>

            <div className="relative z-[3] mt-4 grid gap-2.5 sm:mt-5 sm:gap-3">
              {topic.threads.slice(0, 2).map((thread) => (
                <Link
                  key={thread.slug}
                  href={getLocalizedPath(typedLocale, `/forum/${topic.slug}/${thread.slug}`)}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-slate-300 transition hover:border-white/15 hover:bg-white/8 sm:rounded-3xl"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-slate-800 to-slate-950 text-[10px] leading-none">
                      {thread.threadIcon ?? "💬"}
                    </span>
                    <span className="line-clamp-1 font-medium text-white">{thread.title}</span>
                    {thread.isTranslated ? (
                      <span className="rounded-full border border-lime-400/35 bg-lime-400/10 px-1.5 py-0.5 text-[10px] text-lime-300">
                        Translated
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-xs">
                    {thread.replies} {dict.forum.replies}
                  </span>
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
