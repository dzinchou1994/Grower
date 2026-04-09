import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AccountLevelCard } from "@/components/account-level-card";
import { AccountMessageInbox } from "@/components/account-message-inbox";
import { getServerSessionUser } from "@/lib/auth-session";
import { db } from "@/lib/db";
import type { UserActivityStats } from "@/lib/leveling";
import { extractSocialsFromBio } from "@/lib/user-socials";
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
  const meta =
    locale === "ka"
      ? { title: "Grower.ge | ანგარიში", description: "შენი Grower.ge ანგარიშის პანელი." }
      : locale === "ru"
        ? { title: "Grower.ge | Аккаунт", description: "Панель вашего аккаунта Grower.ge." }
        : { title: "Grower.ge | Account", description: "Your Grower.ge account dashboard." };
  return {
    title: meta.title,
    description: meta.description,
    alternates: getAlternates("/account"),
  };
}

export default async function AccountPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const t =
    typedLocale === "ka"
      ? {
          recentThreads: "შენი ბოლო თემები",
          noThreads: "თემები ჯერ არ არის.",
          comments: "კომენტარი",
          likes: "მოწონება",
          commentedThreads: "თემები სადაც დააკომენტარე",
          noComments: "კომენტარები ჯერ არ არის.",
          lastCommentSaved: "ბოლო კომენტარი შენს აქტივობაში.",
          yourDiaries: "შენი დღიურები",
          newDiary: "ახალი დღიური",
          noDiaries: "დღიურები ჯერ არ გაქვს.",
          weeklyUpdates: "კვირეული განახლება",
        }
      : typedLocale === "ru"
        ? {
            recentThreads: "Ваши последние темы",
            noThreads: "Тем пока нет.",
            comments: "комментариев",
            likes: "лайков",
            commentedThreads: "Темы, где вы комментировали",
            noComments: "Комментариев пока нет.",
            lastCommentSaved: "Последний комментарий сохранен в вашей активности.",
            yourDiaries: "Ваши дневники",
            newDiary: "Новый дневник",
            noDiaries: "У вас пока нет дневников.",
            weeklyUpdates: "недельных обновлений",
          }
        : {
            recentThreads: "Recent Threads You Posted",
            noThreads: "No threads yet.",
            comments: "comments",
            likes: "likes",
            commentedThreads: "Last Threads You Commented On",
            noComments: "No comments yet.",
            lastCommentSaved: "Last comment saved in your activity.",
            yourDiaries: "Your Diaries",
            newDiary: "New Diary",
            noDiaries: "You have no diaries yet.",
            weeklyUpdates: "weekly updates",
          };
  const sessionUser = await getServerSessionUser();
  if (!sessionUser) {
    redirect(getLocalizedPath(typedLocale, "/auth/login"));
  }

  const matchedById = await db.user.findUnique({
    where: { id: sessionUser.userId },
    select: { id: true, username: true, email: true, image: true, bio: true },
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
  const socials = extractSocialsFromBio(matchedById?.bio ?? null);

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
        locale={typedLocale}
        currentEmail={matchedById?.email ?? ""}
        initialTelegram={socials.telegram}
        initialInstagram={socials.instagram}
        initialGrowDiariesUrl={socials.growDiariesUrl}
      />

      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-8">
        <h2 className="text-lg font-semibold text-white sm:text-2xl">{t.recentThreads}</h2>
        <div className="mt-4 space-y-3">
          {myThreads.length === 0 ? (
            <p className="text-sm text-slate-400">{t.noThreads}</p>
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
                  {thread._count.comments} {t.comments} · {thread._count.likes} {t.likes}
                </p>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-8">
        <h2 className="text-lg font-semibold text-white sm:text-2xl">{t.commentedThreads}</h2>
        <div className="mt-4 space-y-3">
          {myCommentedThreads.length === 0 ? (
            <p className="text-sm text-slate-400">{t.noComments}</p>
          ) : (
            myCommentedThreads.map((entry) => (
              <Link
                key={entry.id}
                href={getLocalizedPath(typedLocale, `/forum/${entry.thread.topic.slug}`)}
                className="block rounded-2xl border border-white/8 bg-white/4 p-4 hover:border-lime-400/30"
              >
                <p className="text-xs text-lime-300">{entry.thread.topic.title}</p>
                <p className="mt-1 text-sm font-medium text-white">{entry.thread.title}</p>
                <p className="mt-1 text-xs text-slate-400">{t.lastCommentSaved}</p>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white sm:text-2xl">{t.yourDiaries}</h2>
          <Link
            href={getLocalizedPath(typedLocale, "/diaries/new")}
            className="rounded-full border border-lime-400/30 px-3 py-1.5 text-xs text-lime-300 hover:bg-lime-400/10"
          >
            {t.newDiary}
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {myDiaries.length === 0 ? (
            <p className="text-sm text-slate-400">{t.noDiaries}</p>
          ) : (
            myDiaries.map((diary) => (
              <Link
                key={diary.id}
                href={getLocalizedPath(typedLocale, `/diaries/${diary.slug}`)}
                className="block rounded-2xl border border-white/8 bg-white/4 p-4 hover:border-lime-400/30"
              >
                <p className="text-sm font-medium text-white">{diary.title}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {diary._count.weeks} {t.weeklyUpdates}
                </p>
              </Link>
            ))
          )}
        </div>
      </section>

      <AccountMessageInbox locale={typedLocale} currentUserId={sessionUser.userId} />
    </div>
  );
}
