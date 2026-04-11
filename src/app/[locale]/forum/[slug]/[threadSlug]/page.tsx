import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ForumCommentForm } from "@/components/forum-comment-form";
import { ForumItemActions } from "@/components/forum-item-actions";
import { UserQuickProfileTrigger } from "@/components/user-quick-profile-trigger";
import { VoteButtons } from "@/components/vote-buttons";
import { getServerSessionUser } from "@/lib/auth-session";
import { getForumThreadBySlug } from "@/lib/forum-data";
import {
  getAlternates,
  getLocalizedContent,
  getLocalizedPath,
  isValidLocale,
  type Locale,
} from "@/lib/i18n";

type PageProps = {
  params: Promise<{ locale: string; slug: string; threadSlug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug, threadSlug } = await params;
  if (!isValidLocale(locale)) {
    return {};
  }

  const typedLocale = locale as Locale;
  const sessionUser = await getServerSessionUser();
  const threadData = await getForumThreadBySlug(threadSlug, typedLocale, sessionUser?.userId);
  if (!threadData || threadData.topic.slug !== slug) {
    return {};
  }

  const description = (threadData.thread.body ?? threadData.topic.description).slice(0, 160);
  return {
    title: `Grower | ${threadData.thread.title}`,
    description,
    alternates: getAlternates(`/forum/${slug}/${threadSlug}`, locale),
  };
}

export default async function ForumThreadPage({ params }: PageProps) {
  const { locale, slug, threadSlug } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const { dict } = getLocalizedContent(typedLocale);
  const sessionUser = await getServerSessionUser();
  const isStaff = Boolean(
    sessionUser && (sessionUser.role === "ADMIN" || sessionUser.role === "MODERATOR"),
  );
  const threadData = await getForumThreadBySlug(threadSlug, typedLocale, sessionUser?.userId);

  if (!threadData || threadData.topic.slug !== slug) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <section className="relative rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-8">
        <div className="absolute right-5 top-5 z-10 flex flex-col items-end gap-2 sm:right-8 sm:top-8">
          <VoteButtons
            threadId={threadData.thread.id}
            upvotes={threadData.thread.upvotes}
            downvotes={threadData.thread.downvotes}
            userVote={threadData.thread.userVote}
            isAuthenticated={Boolean(sessionUser)}
            loginHref={getLocalizedPath(typedLocale, "/auth/login")}
            compact
          />
          <span className="shrink-0 rounded-full bg-lime-400/10 px-2.5 py-1 text-[10px] text-lime-300 sm:px-3 sm:text-xs">
            {threadData.thread.lastActivity}
          </span>
        </div>

        <div className="min-w-0 pr-32 sm:pr-40">
          <Link
            href={getLocalizedPath(typedLocale, `/forum/${threadData.topic.slug}`)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-lime-300 sm:text-sm"
          >
            ← {threadData.topic.title}
          </Link>

          <h1 className="mt-3 text-lg font-semibold text-white sm:text-3xl">
            {threadData.thread.title}
          </h1>

          <div className="mt-2 flex items-center gap-3">
            <UserQuickProfileTrigger
              locale={typedLocale}
              username={threadData.thread.author}
              image={threadData.thread.authorImage}
              isAuthenticated={Boolean(sessionUser)}
              currentUsername={sessionUser?.username}
              className="inline-flex items-center gap-1.5 text-[10px] text-slate-400 transition hover:text-lime-300 sm:text-sm"
            />
          </div>
        </div>

        {threadData.thread.body ? (
          <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base sm:leading-7">
            {threadData.thread.body}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-8">
        <div className="space-y-2">
          {threadData.thread.comments.map((comment) => {
            const isCommentOwner = Boolean(
              sessionUser &&
                sessionUser.username.toLowerCase() === comment.author.toLowerCase(),
            );
            const canModerateComment = isCommentOwner || isStaff;

            return (
            <article key={comment.id} className="rounded-xl bg-slate-900/60 px-3 py-2 sm:px-4 sm:py-3">
              <div className="flex items-center justify-between gap-2">
                <UserQuickProfileTrigger
                  locale={typedLocale}
                  username={comment.author}
                  image={comment.authorImage}
                  isAuthenticated={Boolean(sessionUser)}
                  currentUsername={sessionUser?.username}
                  showPrefix={false}
                  className="inline-flex min-w-0 flex-1 items-center gap-2 text-[10px] text-slate-500 transition hover:text-lime-300 sm:text-xs"
                />
                <ForumItemActions
                  locale={typedLocale}
                  canDelete={canModerateComment}
                  canReport={Boolean(sessionUser && !isCommentOwner)}
                  deleteEndpoint={
                    canModerateComment ? `/api/forum/comments/${comment.id}` : undefined
                  }
                  reportTargetType="COMMENT"
                  reportTargetId={comment.id}
                  permalinkHref={getLocalizedPath(
                    typedLocale,
                    `/forum/${threadData.topic.slug}/${threadData.thread.slug}/comments/${comment.id}`,
                  )}
                  permalinkLabel={dict.forum.permalink}
                  className="shrink-0"
                />
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-300 sm:text-[15px]">{comment.body}</p>
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
            );
          })}
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
