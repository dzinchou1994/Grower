import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSessionUser } from "@/lib/auth-session";
import { ForumThreadComposer } from "@/components/forum-thread-composer";
import {
  getLocalizedContent,
  getLocalizedPath,
  isValidLocale,
  type Locale,
} from "@/lib/i18n";
import { listForumTopics } from "@/lib/forum-data";
import { getPageMetadataWithSeo } from "@/lib/seo-settings";

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
    title: `Grower | ${dict.nav.forum}`,
    description: dict.forum.description,
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
          searchPlaceholder: "მოძებნე თემები, დისკუსიები ან ავტორები...",
          search: "ძებნა",
          noMatches: "შენს ძებნაზე შედეგი ვერ მოიძებნა.",
        }
      : typedLocale === "ru"
        ? {
            searchPlaceholder: "Ищите темы, обсуждения или авторов...",
            search: "Поиск",
            noMatches: "По вашему запросу ничего не найдено.",
          }
        : {
            searchPlaceholder: "Search topics, threads or authors...",
            search: "Search",
            noMatches: "No matches found for your search.",
          };
  const [forumTopicList, sessionUser] = await Promise.all([
    listForumTopics(q, typedLocale),
    getServerSessionUser(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/6 p-5 sm:rounded-[2rem] sm:p-8">
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-xs text-lime-300 sm:text-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="Grower Georgia flag logo"
              width={16}
              height={16}
              className="h-4 w-4 shrink-0"
            />
            {dict.forum.badge}
          </div>
          <h1 className="mt-2 text-xl font-semibold text-white sm:text-3xl lg:text-4xl">
            {dict.forum.title}
          </h1>
          <p className="mt-2.5 max-w-3xl text-xs leading-relaxed text-slate-300 sm:mt-3 sm:text-sm sm:leading-6">
            {dict.forum.description}
          </p>
          <div className="mt-3 sm:mt-4">
            <ForumThreadComposer
              topics={forumTopicList.map((topic) => ({ slug: topic.slug, title: topic.title }))}
              isAuthenticated={Boolean(sessionUser)}
              loginHref={getLocalizedPath(typedLocale, "/auth/login")}
              locale={typedLocale}
              collapsible
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-6">
        <form className="flex flex-col gap-2 sm:flex-row" method="GET">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder={ui.searchPlaceholder}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2"
          />
          <button
            type="submit"
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            {ui.search}
          </button>
        </form>
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
            className="rounded-2xl border border-white/10 bg-slate-950/65 p-5 transition hover:border-lime-400/30 hover:bg-slate-900 sm:rounded-[2rem] sm:p-6"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime-400/10 text-xl sm:h-14 sm:w-14 sm:rounded-2xl sm:text-2xl">
                {topic.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={getLocalizedPath(typedLocale, `/forum/${topic.slug}`)}
                      className="text-lg font-semibold text-white transition hover:text-lime-300 sm:text-2xl"
                    >
                      {topic.title}
                    </Link>
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

            <div className="mt-4 grid gap-2.5 sm:mt-5 sm:gap-3">
              {topic.threads.slice(0, 2).map((thread) => (
                <Link
                  key={thread.slug}
                  href={getLocalizedPath(typedLocale, `/forum/${topic.slug}/${thread.slug}`)}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-slate-300 sm:rounded-3xl"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-slate-800 to-slate-950 text-base">
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
