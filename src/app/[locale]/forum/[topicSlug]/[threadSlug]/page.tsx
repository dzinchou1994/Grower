import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ForumCommentForm } from "@/components/forum-comment-form";
import { UserQuickProfileTrigger } from "@/components/user-quick-profile-trigger";
import { VoteButtons } from "@/components/vote-buttons";
import { getServerSessionUser } from "@/lib/auth-session";
import { getForumThreadBySlug } from "@/lib/forum-data";
import {
  getAlternates,
  getLocalizedPath,
  isValidLocale,
  type Locale,
} from "@/lib/i18n";

type PageProps = {
  params: Promise<{ locale: string; topicSlug: string; threadSlug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, topicSlug, threadSlug } = await params;
  if (!isValidLocale(locale)) {
    return {};
  }

  const threadData = await getForumThreadBySlug(threadSlug, locale);
  if (!threadData || threadData.topic.slug !== topicSlug) {
    return {};
  }

  const description = (threadData.thread.body ?? threadData.topic.description).slice(0, 160);
  return {
    title: `Grower | ${threadData.thread.title}`,
    description,
    alternates: getAlternates(`/forum/${topicSlug}/${threadSlug}`),
  };
}

export default async function ForumThreadPage({ params }: PageProps) {
  const { locale, topicSlug, threadSlug } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const sessionUser = await getServerSessionUser();
  const threadData = await getForumThreadBySlug(threadSlug, typedLocale, sessionUser?.userId);

  if (!threadData || threadData.topic.slug !== topicSlug) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-8">
        <Link
          href={getLocalizedPath(typedLocale, `/forum/${threadData.topic.slug}`)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-lime-300 sm:text-sm"
        >
          ← {threadData.topic.title}
        </Link>

        <h1 className="mt-3 text-lg font-semibold text-white sm:text-3xl">
          {threadData.thread.title}
        </h1>

        <div className="mt-2 flex items-center justify-between gap-3">
          <UserQuickProfileTrigger
            locale={typedLocale}
            username={threadData.thread.author}
            image={threadData.thread.authorImage}
            isAuthenticated={Boolean(sessionUser)}
            currentUsername={sessionUser?.username}
            className="inline-flex items-center gap-1.5 text-[10px] text-slate-400 transition hover:text-lime-300 sm:text-sm"
          />
          <span className="rounded-full bg-lime-400/10 px-2.5 py-1 text-[10px] text-lime-300 sm:px-3 sm:text-xs">
            {threadData.thread.lastActivity}
          </span>
        </div>

        {threadData.thread.body ? (
          <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base sm:leading-7">
            {threadData.thread.body}
          </p>
        ) : null}

        <div className="mt-4">
          <VoteButtons
            threadId={threadData.thread.id}
            upvotes={threadData.thread.upvotes}
            downvotes={threadData.thread.downvotes}
            userVote={threadData.thread.userVote}
            isAuthenticated={Boolean(sessionUser)}
            loginHref={getLocalizedPath(typedLocale, "/auth/login")}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-8">
        <div className="space-y-2">
          {threadData.thread.comments.map((comment) => (
            <article key={comment.id} className="rounded-xl bg-slate-900/60 px-3 py-2 sm:px-4 sm:py-3">
              <div className="flex items-center justify-between gap-2">
                <UserQuickProfileTrigger
                  locale={typedLocale}
                  username={comment.author}
                  image={comment.authorImage}
                  isAuthenticated={Boolean(sessionUser)}
                  currentUsername={sessionUser?.username}
                  showPrefix={false}
                  className="inline-flex items-center gap-2 text-[10px] text-slate-500 transition hover:text-lime-300 sm:text-xs"
                />
                <Link
                  href={getLocalizedPath(
                    typedLocale,
                    `/forum/${threadData.topic.slug}/${threadData.thread.slug}/comments/${comment.id}`,
                  )}
                  className="text-[10px] text-slate-400 transition hover:text-lime-300 sm:text-xs"
                >
                  permalink
                </Link>
              </div>
              <p className="mt-1 text-xs text-slate-300 sm:text-sm">{comment.body}</p>
              <div className="mt-1.5 flex justify-end">
                <VoteButtons
                  commentId={comment.id}
                  upvotes={comment.upvotes}
                  downvotes={comment.downvotes}
                  userVote={comment.userVote}
                  isAuthenticated={Boolean(sessionUser)}
                  loginHref={getLocalizedPath(typedLocale, "/auth/login")}
                  compact
                />
              </div>
            </article>
          ))}
        </div>

        <ForumCommentForm
          threadSlug={threadData.thread.slug}
          isAuthenticated={Boolean(sessionUser)}
          loginHref={getLocalizedPath(typedLocale, "/auth/login")}
          locale={typedLocale}
        />
      </section>
    </div>
  );
}
