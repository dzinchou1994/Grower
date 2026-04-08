import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ForumThreadComposer } from "@/components/forum-thread-composer";
import {
  getAlternates,
  getLocalizedContent,
  getLocalizedPath,
  isValidLocale,
  type Locale,
} from "@/lib/i18n";
import { listForumTopics } from "@/lib/forum-data";
import { CannabisLeaf } from "@/components/icons";

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

  return {
    title: `Grower | ${dict.nav.forum}`,
    description: dict.forum.description,
    alternates: getAlternates("/forum"),
  };
}

export default async function ForumPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { q } = await searchParams;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const { dict } = getLocalizedContent(typedLocale);
  const forumTopicList = listForumTopics(q);

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/6 p-5 sm:rounded-[2rem] sm:p-8">
        <CannabisLeaf className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rotate-12 text-lime-400/[0.04] sm:h-56 sm:w-56" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-xs text-lime-300 sm:text-sm">
            <CannabisLeaf className="h-4 w-4" />
            {dict.forum.badge}
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-white sm:text-4xl lg:text-5xl">
            {dict.forum.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 sm:mt-4 sm:text-base sm:leading-7">
            {dict.forum.description}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-6">
        <form className="flex flex-col gap-2 sm:flex-row" method="GET">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search topics, threads or authors..."
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2"
          />
          <button
            type="submit"
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Search
          </button>
        </form>
      </section>

      <ForumThreadComposer
        topics={forumTopicList.map((topic) => ({ slug: topic.slug, title: topic.title }))}
      />

      <div className="grid gap-4 sm:gap-5">
        {forumTopicList.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-950/65 p-5 text-sm text-slate-300 sm:rounded-[2rem] sm:p-6">
            No matches found for your search.
          </div>
        ) : null}

        {forumTopicList.map((topic) => (
          <Link
            key={topic.slug}
            href={getLocalizedPath(typedLocale, `/forum/${topic.slug}`)}
            className="rounded-2xl border border-white/10 bg-slate-950/65 p-5 transition hover:border-lime-400/30 hover:bg-slate-900 sm:rounded-[2rem] sm:p-6"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime-400/10 text-xl sm:h-14 sm:w-14 sm:rounded-2xl sm:text-2xl">
                {topic.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-white sm:text-2xl">
                    {topic.title}
                  </h2>
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
                <div
                  key={thread.slug}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-slate-300 sm:rounded-3xl"
                >
                  <span className="line-clamp-1 font-medium text-white">{thread.title}</span>
                  <span className="shrink-0 text-xs">
                    {thread.replies} {dict.forum.replies}
                  </span>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
