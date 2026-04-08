import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AccountLevelCard } from "@/components/account-level-card";
import { AccountSecuritySettings } from "@/components/account-security-settings";
import { getServerSessionUser } from "@/lib/auth-session";
import { db } from "@/lib/db";
import type { UserActivityStats } from "@/lib/leveling";
import {
  getAlternates,
  getLocalizedPath,
  isValidLocale,
  type Locale,
} from "@/lib/i18n";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    return {};
  }
  return {
    title: "Grower | Account",
    description: "Your Grower account dashboard.",
    alternates: getAlternates("/account"),
  };
}

export default async function AccountPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const sessionUser = await getServerSessionUser();
  if (!sessionUser) {
    redirect(getLocalizedPath(typedLocale, "/auth/login"));
  }

  const matchedById = await db.user.findUnique({
    where: { id: sessionUser.userId },
    select: { id: true, username: true, email: true, image: true },
  });

  const relatedUsers = await db.user.findMany({
    where: {
      OR: [
        { id: sessionUser.userId },
        { username: { equals: sessionUser.username, mode: "insensitive" } },
      ],
    },
    select: { id: true, username: true, email: true },
  });

  const userIds = Array.from(
    new Set([
      sessionUser.userId,
      ...(matchedById ? [matchedById.id] : []),
      ...relatedUsers.map((entry) => entry.id),
    ]),
  );

  const resolvedUsername =
    matchedById?.username ??
    relatedUsers[0]?.username ??
    sessionUser.username;

  const [myThreads, myCommentedThreads, myDiaries, totalComments, totalLikesReceived, totalDiaryWeeks] = await Promise.all([
    db.forumThread.findMany({
      where: { authorId: { in: userIds } },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        topic: { select: { slug: true, title: true } },
        _count: { select: { comments: true, likes: true } },
      },
    }),
    db.forumComment.findMany({
      where: { authorId: { in: userIds } },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        thread: {
          select: {
            slug: true,
            title: true,
            topic: { select: { slug: true, title: true } },
          },
        },
      },
      distinct: ["threadId"],
    }),
    db.diary.findMany({
      where: { authorId: { in: userIds } },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { _count: { select: { weeks: true } } },
    }),
    db.forumComment.count({ where: { authorId: { in: userIds } } }),
    db.like.count({
      where: {
        OR: [
          { thread: { authorId: { in: userIds } } },
          { comment: { authorId: { in: userIds } } },
        ],
      },
    }),
    db.diaryWeek.count({ where: { diary: { authorId: { in: userIds } } } }),
  ]);

  const activityStats: UserActivityStats = {
    threadsCreated: myThreads.length,
    commentsPosted: totalComments,
    likesReceived: totalLikesReceived,
    diariesCreated: myDiaries.length,
    diaryWeeksPosted: totalDiaryWeeks,
  };

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <AccountLevelCard
        username={resolvedUsername}
        userImage={matchedById?.image ?? sessionUser.image}
        stats={activityStats}
      />
      <AccountSecuritySettings currentEmail={matchedById?.email ?? ""} />

      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-8">
        <h2 className="text-lg font-semibold text-white sm:text-2xl">Recent Threads You Posted</h2>
        <div className="mt-4 space-y-3">
          {myThreads.length === 0 ? (
            <p className="text-sm text-slate-400">No threads yet.</p>
          ) : (
            myThreads.map((thread) => (
              <Link
                key={thread.id}
                href={getLocalizedPath(typedLocale, `/forum/${thread.topic.slug}`)}
                className="block rounded-2xl border border-white/8 bg-white/4 p-4 hover:border-lime-400/30"
              >
                <p className="text-xs text-lime-300">{thread.topic.title}</p>
                <p className="mt-1 text-sm font-medium text-white">{thread.title}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {thread._count.comments} comments · {thread._count.likes} likes
                </p>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-8">
        <h2 className="text-lg font-semibold text-white sm:text-2xl">Last Threads You Commented On</h2>
        <div className="mt-4 space-y-3">
          {myCommentedThreads.length === 0 ? (
            <p className="text-sm text-slate-400">No comments yet.</p>
          ) : (
            myCommentedThreads.map((entry) => (
              <Link
                key={entry.id}
                href={getLocalizedPath(typedLocale, `/forum/${entry.thread.topic.slug}`)}
                className="block rounded-2xl border border-white/8 bg-white/4 p-4 hover:border-lime-400/30"
              >
                <p className="text-xs text-lime-300">{entry.thread.topic.title}</p>
                <p className="mt-1 text-sm font-medium text-white">{entry.thread.title}</p>
                <p className="mt-1 text-xs text-slate-400">Last comment saved in your activity.</p>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white sm:text-2xl">Your Diaries</h2>
          <Link
            href={getLocalizedPath(typedLocale, "/diaries/new")}
            className="rounded-full border border-lime-400/30 px-3 py-1.5 text-xs text-lime-300 hover:bg-lime-400/10"
          >
            New Diary
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {myDiaries.length === 0 ? (
            <p className="text-sm text-slate-400">You have no diaries yet.</p>
          ) : (
            myDiaries.map((diary) => (
              <Link
                key={diary.id}
                href={getLocalizedPath(typedLocale, `/diaries/${diary.slug}`)}
                className="block rounded-2xl border border-white/8 bg-white/4 p-4 hover:border-lime-400/30"
              >
                <p className="text-sm font-medium text-white">{diary.title}</p>
                <p className="mt-1 text-xs text-slate-400">{diary._count.weeks} weekly updates</p>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-8">
        <h2 className="text-lg font-semibold text-white sm:text-2xl">Messages / Inbox</h2>
        <p className="mt-2 text-sm text-slate-400">
          Coming next: private messages and mention notifications.
        </p>
      </section>
    </div>
  );
}
