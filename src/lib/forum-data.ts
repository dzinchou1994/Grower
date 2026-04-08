import { formatDistanceToNow } from "date-fns";
import { db } from "@/lib/db";
import { getDeterministicAvatarImage } from "@/lib/avatar-options";
import {
  forumTopics,
  platformStats,
  type ForumTopic,
  type ForumThread,
} from "@/lib/mock-data";

export type ForumComment = {
  id: string;
  author: string;
  authorImage?: string;
  body: string;
  createdAt: string;
};

export type ForumThreadRecord = ForumThread & {
  authorImage?: string;
  body?: string;
  comments: ForumComment[];
};

export type ForumTopicRecord = Omit<ForumTopic, "threads"> & {
  threads: ForumThreadRecord[];
};

export type ForumStats = {
  forumTopics: number;
  forumThreads: number;
  forumReplies: number;
  activeUsers: number;
};

type ForumState = {
  topics: ForumTopicRecord[];
};

const hasDatabase = Boolean(process.env.DATABASE_URL);

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
      const topicCount = await db.forumTopic.count();
      if (topicCount > 0) {
        return;
      }

      for (let i = 0; i < forumTopics.length; i += 1) {
        const sourceTopic = forumTopics[i];
        const topic = await db.forumTopic.create({
          data: {
            slug: sourceTopic.slug,
            title: sourceTopic.title,
            description: sourceTopic.description,
            sortOrder: i,
          },
        });

        for (const sourceThread of sourceTopic.threads) {
          const user = await upsertForumUser(sourceThread.author);
          await db.forumThread.create({
            data: {
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

function mapThreadRecord(thread: any): ForumThreadRecord {
  const latestCommentDate = thread.comments?.[0]?.createdAt;
  const lastActivity = latestCommentDate ?? thread.updatedAt;

  return {
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
    comments:
      thread.comments?.map((comment: any) => ({
        id: comment.id,
        author: comment.author?.username ?? "user",
        authorImage:
          comment.author?.image ??
          getDeterministicAvatarImage(comment.author?.username ?? "user"),
        body: comment.body,
        createdAt: comment.createdAt.toISOString(),
      })) ?? [],
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

async function listForumTopicsFromDatabase(query?: string) {
  await ensureForumSeedData();

  const topics = await db.forumTopic.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      threads: {
        where: { isHidden: false },
        orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
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
      },
    },
  });

  const mapped: ForumTopicRecord[] = topics.map((topic) => ({
    slug: topic.slug,
    title: topic.title,
    description: topic.description ?? "",
    icon: "💬",
    threads: topic.threads.map(mapThreadRecord),
  }));

  if (!query?.trim()) {
    return mapped;
  }

  const q = query.trim();
  return mapped
    .map((topic) => {
      if (topicMatchesQuery(topic, q)) {
        return topic;
      }

      return { ...topic, threads: topic.threads.filter((thread) => filterThreadByQuery(thread, q)) };
    })
    .filter((topic) => topic.threads.length > 0);
}

async function getForumTopicBySlugFromDatabase(slug: string) {
  await ensureForumSeedData();

  const topic = await db.forumTopic.findUnique({
    where: { slug },
    include: {
      threads: {
        where: { isHidden: false },
        orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
        include: {
          author: { select: { username: true, image: true } },
          comments: {
            where: { isHidden: false },
            orderBy: { createdAt: "desc" },
            take: 10,
            include: { author: { select: { username: true, image: true } } },
          },
          _count: { select: { comments: true, likes: true } },
        },
      },
    },
  });

  if (!topic) {
    return null;
  }

  return {
    slug: topic.slug,
    title: topic.title,
    description: topic.description ?? "",
    icon: "💬",
    threads: topic.threads.map(mapThreadRecord),
  } satisfies ForumTopicRecord;
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
    update: {},
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
    };

    thread.comments.unshift(comment);
    thread.replies += 1;
    thread.lastActivity = "just now";

    return { topicSlug: topic.slug, threadSlug: thread.slug, comment };
  }

  return null;
}

export async function listForumTopics(query?: string): Promise<ForumTopicRecord[]> {
  if (hasDatabase) {
    return listForumTopicsFromDatabase(query);
  }

  return listForumTopicsFromMemory(query);
}

export async function getForumTopicBySlug(slug: string): Promise<ForumTopicRecord | null> {
  if (hasDatabase) {
    return getForumTopicBySlugFromDatabase(slug);
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
