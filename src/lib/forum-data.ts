import { formatDistanceToNow } from "date-fns";
import { db } from "@/lib/db";
import { getDeterministicAvatarImage } from "@/lib/avatar-options";
import { calculateXp, getLevelForXp } from "@/lib/leveling";
import { autoTranslateText } from "@/lib/auto-translate";
import {
  diaries,
  forumTopics,
  platformStats,
  type ForumTopic,
  type ForumThread,
} from "@/lib/mock-data";
import type { Locale } from "@/lib/i18n";

export type ForumComment = {
  id: string;
  author: string;
  authorImage?: string;
  body: string;
  isTranslated?: boolean;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  userVote: number;
};

export type ForumThreadRecord = ForumThread & {
  id?: string;
  authorImage?: string;
  body?: string;
  isTranslated?: boolean;
  bodyTranslated?: boolean;
  upvotes: number;
  downvotes: number;
  userVote: number;
  comments: ForumComment[];
};

export type ForumTopicRecord = Omit<ForumTopic, "threads"> & {
  isTranslated?: boolean;
  descriptionTranslated?: boolean;
  threads: ForumThreadRecord[];
};

export type ForumStats = {
  forumTopics: number;
  forumThreads: number;
  forumReplies: number;
  activeUsers: number;
};

export type LeaderboardUser = {
  username: string;
  image?: string;
  threadsCreated: number;
  commentsPosted: number;
  likesReceived: number;
  diariesCreated: number;
  diaryWeeksPosted: number;
  xp: number;
  levelTitle: string;
  levelEmoji: string;
};

type ForumState = {
  topics: ForumTopicRecord[];
};

const hasDatabase = Boolean(process.env.DATABASE_URL);
const topicIconBySlug = new Map(forumTopics.map((topic) => [topic.slug, topic.icon]));

declare global {
  var __forumState: ForumState | undefined;
  var __forumSeedPromise: Promise<void> | undefined;
}

function createInitialState(): ForumState {
  return {
    topics: forumTopics.map((topic) => ({
      ...topic,
      threads: topic.threads.map((thread) => ({
        ...thread,
        body: "",
        upvotes: 0,
        downvotes: 0,
        userVote: 0,
        comments: [],
      })),
    })),
  };
}

function getState(): ForumState {
  if (!global.__forumState) {
    global.__forumState = createInitialState();
  }

  return global.__forumState;
}

function slugify(value: string) {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const suffix = Math.random().toString(36).slice(2, 8);
  return `${normalized || "thread"}-${suffix}`;
}

function toRelative(dateLike: Date | string) {
  const date = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
  return formatDistanceToNow(date, { addSuffix: true });
}

function normalizeUsername(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 28);
}

async function ensureForumSeedData() {
  if (!hasDatabase) {
    return;
  }

  if (!global.__forumSeedPromise) {
    global.__forumSeedPromise = (async () => {
      for (let i = 0; i < forumTopics.length; i += 1) {
        const sourceTopic = forumTopics[i];
        const topic = await db.forumTopic.upsert({
          where: { slug: sourceTopic.slug },
          update: {
            title: sourceTopic.title,
            description: sourceTopic.description,
            sortOrder: i,
          },
          create: {
            slug: sourceTopic.slug,
            title: sourceTopic.title,
            description: sourceTopic.description,
            sortOrder: i,
          },
        });

        for (const sourceThread of sourceTopic.threads) {
          const user = await upsertForumUser(sourceThread.author);
          await db.forumThread.upsert({
            where: { slug: sourceThread.slug },
            update: {
              topicId: topic.id,
              authorId: user.id,
              title: sourceThread.title,
              isPinned: sourceThread.isPinned ?? false,
            },
            create: {
              slug: sourceThread.slug,
              topicId: topic.id,
              authorId: user.id,
              title: sourceThread.title,
              body: "",
              isPinned: sourceThread.isPinned ?? false,
            },
          });
        }
      }
    })();
  }

  await global.__forumSeedPromise;
}

function mapThreadRecord(thread: any, currentUserId?: string): ForumThreadRecord {
  const latestCommentDate = thread.comments?.[0]?.createdAt;
  const lastActivity = latestCommentDate ?? thread.updatedAt;

  const threadVotes: any[] = thread.votes ?? [];
  const threadUpvotes = threadVotes.filter((v: any) => v.value === 1).length;
  const threadDownvotes = threadVotes.filter((v: any) => v.value === -1).length;
  const threadUserVote = currentUserId
    ? (threadVotes.find((v: any) => v.userId === currentUserId)?.value ?? 0)
    : 0;

  return {
    id: thread.id,
    slug: thread.slug,
    title: thread.title,
    author: thread.author?.username ?? "user",
    authorImage:
      thread.author?.image ??
      getDeterministicAvatarImage(thread.author?.username ?? "user"),
    replies: thread._count?.comments ?? 0,
    likes: thread._count?.likes ?? 0,
    lastActivity: toRelative(lastActivity),
    isPinned: Boolean(thread.isPinned),
    body: thread.body,
    upvotes: threadUpvotes,
    downvotes: threadDownvotes,
    userVote: threadUserVote,
    comments:
      thread.comments?.map((comment: any) => {
        const commentVotes: any[] = comment.votes ?? [];
        const commentUp = commentVotes.filter((v: any) => v.value === 1).length;
        const commentDown = commentVotes.filter((v: any) => v.value === -1).length;
        const commentUserVote = currentUserId
          ? (commentVotes.find((v: any) => v.userId === currentUserId)?.value ?? 0)
          : 0;

        return {
          id: comment.id,
          author: comment.author?.username ?? "user",
          authorImage:
            comment.author?.image ??
            getDeterministicAvatarImage(comment.author?.username ?? "user"),
          body: comment.body,
          createdAt: comment.createdAt.toISOString(),
          upvotes: commentUp,
          downvotes: commentDown,
          userVote: commentUserVote,
        };
      }) ?? [],
  };
}

async function translateForumTopicRecord(
  topic: ForumTopicRecord,
  locale?: Locale,
): Promise<ForumTopicRecord> {
  if (!locale) return topic;

  const [titleRes, descRes, translatedThreads] = await Promise.all([
    autoTranslateText(topic.title, locale),
    autoTranslateText(topic.description ?? "", locale),
    Promise.all(
      topic.threads.map(async (thread) => {
        const [threadTitle, threadBody, translatedComments] = await Promise.all([
          autoTranslateText(thread.title, locale),
          autoTranslateText(thread.body ?? "", locale),
          Promise.all(
            thread.comments.map(async (comment) => {
              const translatedCommentBody = await autoTranslateText(comment.body, locale);
              return {
                ...comment,
                body: translatedCommentBody.text,
                isTranslated: translatedCommentBody.translated,
              };
            }),
          ),
        ]);

        return {
          ...thread,
          title: threadTitle.text,
          isTranslated: threadTitle.translated,
          body: threadBody.text,
          bodyTranslated: threadBody.translated,
          comments: translatedComments,
        } satisfies ForumThreadRecord;
      }),
    ),
  ]);

  return {
    ...topic,
    title: titleRes.text,
    description: descRes.text,
    isTranslated: titleRes.translated,
    descriptionTranslated: descRes.translated,
    threads: translatedThreads,
  };
}

function topicMatchesQuery(topic: ForumTopicRecord, query: string) {
  const q = query.toLowerCase();
  return (
    topic.title.toLowerCase().includes(q) || topic.description.toLowerCase().includes(q)
  );
}

function filterThreadByQuery(thread: ForumThreadRecord, query: string) {
  const q = query.toLowerCase();
  return (
    thread.title.toLowerCase().includes(q) ||
    (thread.body ?? "").toLowerCase().includes(q) ||
    thread.author.toLowerCase().includes(q)
  );
}

async function listForumTopicsFromDatabase(query?: string, locale?: Locale, currentUserId?: string) {
  await ensureForumSeedData();

  const topics = await db.forumTopic.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      threads: {
        where: { isHidden: false },
        orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
        include: {
          author: { select: { username: true, image: true } },
          votes: { select: { userId: true, value: true } },
          comments: {
            where: { isHidden: false },
            orderBy: { createdAt: "desc" },
            take: 3,
            include: {
              author: { select: { username: true, image: true } },
              votes: { select: { userId: true, value: true } },
            },
          },
          _count: { select: { comments: true, likes: true } },
        },
      },
    },
  });

  const mapped: ForumTopicRecord[] = topics.map((topic) => ({
    slug: topic.slug,
    title: topic.title,
    description: topic.description ?? "",
    icon: topicIconBySlug.get(topic.slug) ?? "💬",
    threads: topic.threads.map((t) => mapThreadRecord(t, currentUserId)),
  }));

  const translatedMapped = await Promise.all(
    mapped.map((topic) => translateForumTopicRecord(topic, locale)),
  );

  if (!query?.trim()) {
    return translatedMapped;
  }

  const q = query.trim();
  return translatedMapped
    .map((topic) => {
      if (topicMatchesQuery(topic, q)) {
        return topic;
      }

      return { ...topic, threads: topic.threads.filter((thread) => filterThreadByQuery(thread, q)) };
    })
    .filter((topic) => topic.threads.length > 0);
}

async function getForumTopicBySlugFromDatabase(slug: string, locale?: Locale, currentUserId?: string) {
  await ensureForumSeedData();

  const topic = await db.forumTopic.findUnique({
    where: { slug },
    include: {
      threads: {
        where: { isHidden: false },
        orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
        include: {
          author: { select: { username: true, image: true } },
          votes: { select: { userId: true, value: true } },
          comments: {
            where: { isHidden: false },
            orderBy: { createdAt: "desc" },
            take: 10,
            include: {
              author: { select: { username: true, image: true } },
              votes: { select: { userId: true, value: true } },
            },
          },
          _count: { select: { comments: true, likes: true } },
        },
      },
    },
  });

  if (!topic) {
    return null;
  }

  const mappedTopic = {
    slug: topic.slug,
    title: topic.title,
    description: topic.description ?? "",
    icon: topicIconBySlug.get(topic.slug) ?? "💬",
    threads: topic.threads.map((t) => mapThreadRecord(t, currentUserId)),
  } satisfies ForumTopicRecord;

  return translateForumTopicRecord(mappedTopic, locale);
}

async function upsertForumUser(author: string) {
  const existing = await db.user.findFirst({
    where: { username: { equals: author.trim(), mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) {
    return db.user.findUniqueOrThrow({ where: { id: existing.id } });
  }

  const normalized = normalizeUsername(author);
  const username = normalized || `user_${Math.random().toString(36).slice(2, 8)}`;
  const email = `${username}@grower.ge`;

  return db.user.upsert({
    where: { username },
    update: { image: getDeterministicAvatarImage(username) },
    create: {
      username,
      email,
      role: "USER",
      image: getDeterministicAvatarImage(username),
    },
  });
}

async function createThreadInDatabase(input: {
  topicSlug: string;
  title: string;
  body: string;
  author: string;
}) {
  await ensureForumSeedData();

  const topic = await db.forumTopic.findUnique({ where: { slug: input.topicSlug } });
  if (!topic) {
    return null;
  }

  const user = await upsertForumUser(input.author);

  let slug = slugify(input.title);
  let existing = await db.forumThread.findUnique({ where: { slug } });
  while (existing) {
    slug = slugify(input.title);
    existing = await db.forumThread.findUnique({ where: { slug } });
  }

  const thread = await db.forumThread.create({
    data: {
      slug,
      topicId: topic.id,
      authorId: user.id,
      title: input.title.trim(),
      body: input.body.trim(),
    },
    include: {
      author: { select: { username: true, image: true } },
      comments: {
        where: { isHidden: false },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { author: { select: { username: true, image: true } } },
      },
      _count: { select: { comments: true, likes: true } },
    },
  });

  return mapThreadRecord(thread);
}

async function addCommentInDatabase(input: {
  threadSlug: string;
  author: string;
  body: string;
}) {
  await ensureForumSeedData();

  const thread = await db.forumThread.findUnique({
    where: { slug: input.threadSlug },
    select: { id: true, slug: true, topic: { select: { slug: true } } },
  });

  if (!thread) {
    return null;
  }

  const user = await upsertForumUser(input.author);

  const comment = await db.forumComment.create({
    data: {
      threadId: thread.id,
      authorId: user.id,
      body: input.body.trim(),
    },
    include: { author: { select: { username: true, image: true } } },
  });

  return {
    topicSlug: thread.topic.slug,
    threadSlug: thread.slug,
    comment: {
      id: comment.id,
      author: comment.author.username,
      authorImage: comment.author.image ?? getDeterministicAvatarImage(comment.author.username),
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
      upvotes: 0,
      downvotes: 0,
      userVote: 0,
    } satisfies ForumComment,
  };
}

function listForumTopicsFromMemory(query?: string): ForumTopicRecord[] {
  const state = getState();

  if (!query?.trim()) {
    return state.topics;
  }

  const q = query.trim().toLowerCase();

  return state.topics
    .map((topic) => {
      const topicMatch =
        topic.title.toLowerCase().includes(q) ||
        topic.description.toLowerCase().includes(q);

      if (topicMatch) {
        return topic;
      }

      return { ...topic, threads: topic.threads.filter((thread) => filterThreadByQuery(thread, q)) };
    })
    .filter((topic) => topic.threads.length > 0);
}

function getForumTopicBySlugFromMemory(slug: string) {
  return getState().topics.find((topic) => topic.slug === slug) ?? null;
}

function createThreadInMemory(input: {
  topicSlug: string;
  title: string;
  body: string;
  author: string;
}) {
  const state = getState();
  const topic = state.topics.find((entry) => entry.slug === input.topicSlug);
  if (!topic) {
    return null;
  }

  const thread: ForumThreadRecord = {
    slug: slugify(input.title),
    title: input.title.trim(),
    author: input.author.trim(),
    authorImage: getDeterministicAvatarImage(input.author.trim()),
    replies: 0,
    likes: 0,
    lastActivity: "just now",
    isPinned: false,
    body: input.body.trim(),
    upvotes: 0,
    downvotes: 0,
    userVote: 0,
    comments: [],
  };

  topic.threads.unshift(thread);
  return thread;
}

function addCommentInMemory(input: {
  threadSlug: string;
  author: string;
  body: string;
}) {
  const state = getState();

  for (const topic of state.topics) {
    const thread = topic.threads.find((entry) => entry.slug === input.threadSlug);
    if (!thread) {
      continue;
    }

    const comment: ForumComment = {
      id: crypto.randomUUID(),
      author: input.author.trim(),
      authorImage: getDeterministicAvatarImage(input.author.trim()),
      body: input.body.trim(),
      createdAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      userVote: 0,
    };

    thread.comments.unshift(comment);
    thread.replies += 1;
    thread.lastActivity = "just now";

    return { topicSlug: topic.slug, threadSlug: thread.slug, comment };
  }

  return null;
}

export async function listForumTopics(
  query?: string,
  locale?: Locale,
  currentUserId?: string,
): Promise<ForumTopicRecord[]> {
  if (hasDatabase) {
    return listForumTopicsFromDatabase(query, locale, currentUserId);
  }

  return listForumTopicsFromMemory(query);
}

export async function getForumTopicBySlug(
  slug: string,
  locale?: Locale,
  currentUserId?: string,
): Promise<ForumTopicRecord | null> {
  if (hasDatabase) {
    return getForumTopicBySlugFromDatabase(slug, locale, currentUserId);
  }

  return getForumTopicBySlugFromMemory(slug);
}

export async function createForumThread(input: {
  topicSlug: string;
  title: string;
  body: string;
  author: string;
}) {
  if (hasDatabase) {
    return createThreadInDatabase(input);
  }

  return createThreadInMemory(input);
}

export async function addForumComment(input: {
  threadSlug: string;
  author: string;
  body: string;
}) {
  if (hasDatabase) {
    return addCommentInDatabase(input);
  }

  return addCommentInMemory(input);
}

async function getForumStatsFromDatabase(): Promise<ForumStats> {
  await ensureForumSeedData();

  const [topicCount, threadCount, commentCount, threadAuthors, commentAuthors] =
    await Promise.all([
      db.forumTopic.count(),
      db.forumThread.count(),
      db.forumComment.count(),
      db.forumThread.findMany({
        select: { authorId: true },
        distinct: ["authorId"],
      }),
      db.forumComment.findMany({
        select: { authorId: true },
        distinct: ["authorId"],
      }),
    ]);

  const activeUsers = new Set([
    ...threadAuthors.map((entry) => entry.authorId),
    ...commentAuthors.map((entry) => entry.authorId),
  ]).size;

  return {
    forumTopics: topicCount,
    forumThreads: threadCount,
    forumReplies: commentCount,
    activeUsers,
  };
}

function getForumStatsFromMemory(): ForumStats {
  const topics = getState().topics;
  const forumThreads = topics.reduce((sum, topic) => sum + topic.threads.length, 0);
  const forumReplies = topics.reduce(
    (sum, topic) => sum + topic.threads.reduce((inner, thread) => inner + thread.replies, 0),
    0,
  );

  const userSet = new Set<string>();
  for (const topic of topics) {
    for (const thread of topic.threads) {
      userSet.add(thread.author);
      for (const comment of thread.comments) {
        userSet.add(comment.author);
      }
    }
  }

  return {
    forumTopics: topics.length || platformStats.forumTopics,
    forumThreads: forumThreads || platformStats.forumThreads,
    forumReplies: forumReplies || platformStats.forumReplies,
    activeUsers: userSet.size || platformStats.activeUsers,
  };
}

export async function getForumStats(): Promise<ForumStats> {
  if (hasDatabase) {
    return getForumStatsFromDatabase();
  }

  return getForumStatsFromMemory();
}

async function getTopUsersFromDatabase(limit: number): Promise<LeaderboardUser[]> {
  await ensureForumSeedData();

  const users = await db.user.findMany({
    where: {
      OR: [
        { forumThreads: { some: { isHidden: false } } },
        { forumComments: { some: { isHidden: false } } },
        { diaries: { some: { isHidden: false } } },
      ],
    },
    select: {
      id: true,
      username: true,
      image: true,
      _count: {
        select: {
          forumThreads: { where: { isHidden: false } },
          forumComments: { where: { isHidden: false } },
          diaries: { where: { isHidden: false } },
        },
      },
    },
    take: 120,
  });

  const ranked = await Promise.all(
    users.map(async (user) => {
      const [threadLikes, commentLikes, diaryWeeks] = await Promise.all([
        db.forumThread.findMany({
          where: { authorId: user.id, isHidden: false },
          select: { _count: { select: { likes: true } } },
        }),
        db.forumComment.findMany({
          where: { authorId: user.id, isHidden: false },
          select: { _count: { select: { likes: true } } },
        }),
        db.diaryWeek.findMany({
          where: { isHidden: false, diary: { authorId: user.id, isHidden: false } },
          select: { _count: { select: { likes: true } } },
        }),
      ]);

      const likesReceived =
        threadLikes.reduce((sum, row) => sum + row._count.likes, 0) +
        commentLikes.reduce((sum, row) => sum + row._count.likes, 0) +
        diaryWeeks.reduce((sum, row) => sum + row._count.likes, 0);

      const activity = {
        threadsCreated: user._count.forumThreads,
        commentsPosted: user._count.forumComments,
        likesReceived,
        diariesCreated: user._count.diaries,
        diaryWeeksPosted: diaryWeeks.length,
      };
      const xp = calculateXp(activity);
      const level = getLevelForXp(xp);

      return {
        username: user.username,
        image:
          user.image ??
          getDeterministicAvatarImage(`${user.username}:${user.id}`),
        ...activity,
        xp,
        levelTitle: level.title,
        levelEmoji: level.emoji,
      } satisfies LeaderboardUser;
    }),
  );

  return ranked
    .sort((a, b) => {
      if (b.xp !== a.xp) return b.xp - a.xp;
      if (b.threadsCreated !== a.threadsCreated) return b.threadsCreated - a.threadsCreated;
      if (b.commentsPosted !== a.commentsPosted) return b.commentsPosted - a.commentsPosted;
      return b.likesReceived - a.likesReceived;
    })
    .slice(0, limit);
}

function getTopUsersFromMemory(limit: number): LeaderboardUser[] {
  const byUsername = new Map<string, Omit<LeaderboardUser, "xp" | "levelTitle" | "levelEmoji">>();

  for (const topic of forumTopics) {
    for (const thread of topic.threads) {
      const existing = byUsername.get(thread.author) ?? {
        username: thread.author,
        image: getDeterministicAvatarImage(thread.author),
        threadsCreated: 0,
        commentsPosted: 0,
        likesReceived: 0,
        diariesCreated: 0,
        diaryWeeksPosted: 0,
      };
      existing.threadsCreated += 1;
      existing.likesReceived += thread.likes;
      byUsername.set(thread.author, existing);
    }
  }

  for (const diary of diaries) {
    const author = diary.author.username;
    const existing = byUsername.get(author) ?? {
      username: author,
      image: getDeterministicAvatarImage(author),
      threadsCreated: 0,
      commentsPosted: 0,
      likesReceived: 0,
      diariesCreated: 0,
      diaryWeeksPosted: 0,
    };
    existing.diariesCreated += 1;
    existing.diaryWeeksPosted += diary.weeks.length;
    existing.likesReceived += diary.weeks.reduce((sum, week) => sum + week.likes, 0);
    byUsername.set(author, existing);
  }

  return Array.from(byUsername.values())
    .map((entry) => {
      const xp = calculateXp(entry);
      const level = getLevelForXp(xp);
      return {
        ...entry,
        xp,
        levelTitle: level.title,
        levelEmoji: level.emoji,
      } satisfies LeaderboardUser;
    })
    .sort((a, b) => {
      if (b.xp !== a.xp) return b.xp - a.xp;
      if (b.threadsCreated !== a.threadsCreated) return b.threadsCreated - a.threadsCreated;
      return b.likesReceived - a.likesReceived;
    })
    .slice(0, limit);
}

export async function getTopUsers(limit = 10): Promise<LeaderboardUser[]> {
  if (hasDatabase) {
    return getTopUsersFromDatabase(limit);
  }

  return getTopUsersFromMemory(limit);
}
