import { forumTopics, type ForumTopic, type ForumThread } from "@/lib/mock-data";

export type ForumComment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};

export type ForumThreadRecord = ForumThread & {
  body?: string;
  comments: ForumComment[];
};

export type ForumTopicRecord = Omit<ForumTopic, "threads"> & {
  threads: ForumThreadRecord[];
};

type ForumState = {
  topics: ForumTopicRecord[];
};

declare global {
  var __forumState: ForumState | undefined;
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

export function listForumTopics(query?: string): ForumTopicRecord[] {
  const state = getState();

  if (!query?.trim()) {
    return state.topics;
  }

  const q = query.trim().toLowerCase();

  return state.topics
    .map((topic) => {
      const topicMatches =
        topic.title.toLowerCase().includes(q) ||
        topic.description.toLowerCase().includes(q);

      const filteredThreads = topic.threads.filter((thread) => {
        return (
          thread.title.toLowerCase().includes(q) ||
          (thread.body ?? "").toLowerCase().includes(q) ||
          thread.author.toLowerCase().includes(q)
        );
      });

      if (topicMatches) {
        return topic;
      }

      return { ...topic, threads: filteredThreads };
    })
    .filter((topic) => topic.threads.length > 0);
}

export function getForumTopicBySlug(slug: string) {
  const state = getState();
  return state.topics.find((topic) => topic.slug === slug) ?? null;
}

export function createForumThread(input: {
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
    replies: 0,
    likes: 0,
    lastActivity: "just now",
    body: input.body.trim(),
    comments: [],
  };

  topic.threads.unshift(thread);
  return thread;
}

export function addForumComment(input: {
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
