import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSessionUser } from "@/lib/auth-session";
import { ForumCommentForm } from "@/components/forum-comment-form";
import { ForumThreadComposer, ForumTopicComposeTrigger } from "@/components/forum-thread-composer";
import {
  getAlternates,
  getLocalizedContent,
  getLocalizedPath,
  isValidLocale,
  locales,
  type Locale,
} from "@/lib/i18n";
import { getForumTopicBySlug } from "@/lib/forum-data";
import { CannabisLeaf } from "@/components/icons";
import { VoteButtons } from "@/components/vote-buttons";
import { UserQuickProfileTrigger } from "@/components/user-quick-profile-trigger";
import { ForumItemActions } from "@/components/forum-item-actions";
import { ForumThreadListItemHeader } from "@/components/forum-thread-list-item-header";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  const topicSlugs = [
    "beginner-questions",
    "grow-help",
    "strains-genetics",
    "equipment-setup",
    "outdoor-growing",
    "legal-discussion",
    "buy-sell",
    "free-talk",
  ];

  return locales.flatMap((locale) =>
    topicSlugs.map((slug) => ({
      locale,
      slug,
    })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const typedLocale = locale as Locale;
  const sessionUser = await getServerSessionUser();
  const topic = await getForumTopicBySlug(slug, typedLocale, sessionUser?.userId);

  if (!topic) {
    return {};
  }

  return {
    title: `Grower | ${topic.title}`,
    description: topic.description,
    alternates: getAlternates(`/forum/${slug}`, locale),
  };
}

export default async function ForumTopicPage({ params }: PageProps) {
  const { locale, slug } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const { dict } = getLocalizedContent(typedLocale);
  const sessionUser = await getServerSessionUser();
  const isStaff = Boolean(
    sessionUser && (sessionUser.role === "ADMIN" || sessionUser.role === "MODERATOR"),
  );
  const topic = await getForumTopicBySlug(slug, typedLocale, sessionUser?.userId);

  if (!topic) {
    notFound();
  }

  const newThreadCta =
    typedLocale === "ka"
      ? "ახალი საუბრის წამოწყება"
      : typedLocale === "ru"
        ? "Начать новую беседу"
        : "Start a new conversation";

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <Link
          href={getLocalizedPath(typedLocale, "/forum")}
          className="inline-flex min-w-0 items-center gap-1.5 text-xs text-slate-400 transition hover:text-lime-300 sm:text-sm"
        >
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {dict.forum.badge}
        </Link>
        <ForumTopicComposeTrigger
          label={newThreadCta}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-lime-400 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-lime-300 sm:text-sm"
        />
      </div>

      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/6 p-5 sm:rounded-[2rem] sm:p-8">
        <CannabisLeaf className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rotate-12 text-lime-400/[0.04] sm:h-52 sm:w-52" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime-400/10 text-xl sm:h-14 sm:w-14 sm:rounded-2xl sm:text-2xl">
            {topic.icon}
          </span>
          <div>
            <h1 className="text-xl font-semibold text-white sm:text-3xl lg:text-4xl">
              {topic.title}
            </h1>
            <p className="mt-1 text-xs text-slate-400 sm:mt-2 sm:text-sm">
              {topic.description}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-8">
        <div className="flex items-start justify-between gap-3 sm:items-center">
          <div>
            <p className="text-xs text-slate-400 sm:text-sm">{dict.forum.threads}</p>
            <h2 className="mt-1 text-lg font-semibold text-white sm:text-2xl">
              {dict.forum.latestConversations}
            </h2>
          </div>
          <span className="shrink-0 rounded-full bg-white/6 px-3 py-1.5 text-[10px] text-slate-300 sm:px-4 sm:py-2 sm:text-xs">
            {topic.threads.length} {dict.forum.total}
          </span>
        </div>

        <div id="new-thread" className="mt-5 sm:mt-6">
          <ForumThreadComposer
            topics={[{ slug: topic.slug, title: topic.title }]}
            isAuthenticated={Boolean(sessionUser)}
            loginHref={getLocalizedPath(typedLocale, "/auth/login")}
            locale={typedLocale}
            startHidden
          />
        </div>

        <div className="mt-5 space-y-3 sm:mt-6 sm:space-y-4">
          {topic.threads.map((thread) => {
            const isThreadOwner = Boolean(
              sessionUser &&
                sessionUser.username.toLowerCase() === thread.author.toLowerCase(),
            );
            const canModerateThread = isThreadOwner || isStaff;

            return (
            <article
              key={thread.slug}
              className="rounded-2xl border border-white/8 bg-white/4 transition hover:border-lime-400/20 sm:rounded-[1.75rem]"
            >
              <div className="flex">
                {/* Vote column */}
                <div className="hidden shrink-0 items-start justify-center border-r border-white/8 px-2 py-4 sm:flex">
                  <VoteButtons
                    threadId={thread.id}
                    upvotes={thread.upvotes}
                    downvotes={thread.downvotes}
                    userVote={thread.userVote}
                    isAuthenticated={Boolean(sessionUser)}
                    loginHref={getLocalizedPath(typedLocale, "/auth/login")}
                  />
                </div>

                {/* Content — symmetric padding; extra pr only above comments so previews span full width */}
                <div className="relative flex w-full min-w-0 flex-1 flex-col p-4 sm:p-5">
                  <div className="min-w-0 w-full">
                    <ForumThreadListItemHeader
                      locale={typedLocale}
                      topicSlug={topic.slug}
                      thread={{
                        id: thread.id,
                        slug: thread.slug,
                        title: thread.title,
                        isPinned: thread.isPinned,
                        isTranslated: thread.isTranslated,
                        author: thread.author,
                        authorImage: thread.authorImage,
                        lastActivity: thread.lastActivity,
                      }}
                      isAuthenticated={Boolean(sessionUser)}
                      currentUsername={sessionUser?.username}
                      canModerateThread={canModerateThread}
                      canReportThread={Boolean(sessionUser && !isThreadOwner)}
                      deleteEndpoint={
                        canModerateThread ? `/api/forum/threads/${thread.slug}` : undefined
                      }
                      permalinkLabel={dict.forum.permalink}
                    />
                  </div>

                  {/* Mobile vote + stats row */}
                  <div className="mt-3 flex w-full min-w-0 items-center gap-2 sm:mt-4">
                    <div className="sm:hidden">
                      <VoteButtons
                        threadId={thread.id}
                        upvotes={thread.upvotes}
                        downvotes={thread.downvotes}
                        userVote={thread.userVote}
                        isAuthenticated={Boolean(sessionUser)}
                        loginHref={getLocalizedPath(typedLocale, "/auth/login")}
                        compact
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-300 sm:gap-2 sm:text-xs">
                      <span className="rounded-full bg-white/6 px-2.5 py-1 sm:px-3">
                        {thread.replies} {dict.forum.replies}
                      </span>
                    </div>
                  </div>

                  {thread.body ? (
                    <p className="mt-3 w-full min-w-0 text-xs leading-relaxed text-slate-300 sm:text-sm">
                      {thread.body}
                      {thread.bodyTranslated ? (
                        <span className="ml-2 inline-flex rounded-full border border-lime-400/35 bg-lime-400/10 px-1.5 py-0.5 text-[10px] text-lime-300">
                          Translated
                        </span>
                      ) : null}
                    </p>
                  ) : null}

                  {thread.comments.length > 0 ? (
                    <div className="mt-3 flex w-full min-w-0 flex-col gap-2 border-t border-white/10 pt-3">
                      {thread.comments.slice(0, 3).map((comment) => {
                        const isCommentOwner = Boolean(
                          sessionUser &&
                            sessionUser.username.toLowerCase() === comment.author.toLowerCase(),
                        );
                        const canModerateComment = isCommentOwner || isStaff;

                        return (
                        <div
                          key={comment.id}
                          className="w-full min-w-0 rounded-xl bg-slate-900/60 px-3 py-2 sm:px-4"
                        >
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
                                canModerateComment
                                  ? `/api/forum/comments/${comment.id}`
                                  : undefined
                              }
                              reportTargetType="COMMENT"
                              reportTargetId={comment.id}
                              permalinkHref={getLocalizedPath(
                                typedLocale,
                                `/forum/${topic.slug}/${thread.slug}/comments/${comment.id}`,
                              )}
                              permalinkLabel={dict.forum.permalink}
                              className="shrink-0"
                            />
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
                          {comment.isTranslated ? (
                            <span className="mt-1 inline-flex rounded-full border border-lime-400/25 bg-lime-400/5 px-1 py-px text-[8px] text-lime-400/60">
                              translated
                            </span>
                          ) : null}
                        </div>
                        );
                      })}
                    </div>
                  ) : null}

                  <ForumCommentForm
                    threadSlug={thread.slug}
                    isAuthenticated={Boolean(sessionUser)}
                    loginHref={getLocalizedPath(typedLocale, "/auth/login")}
                    locale={typedLocale}
                  />
                </div>
              </div>
            </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
