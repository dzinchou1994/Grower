"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type TopicOption = {
  slug: string;
  title: string;
};

export function ForumThreadComposer({
  topics,
  isAuthenticated,
  loginHref,
}: {
  topics: TopicOption[];
  isAuthenticated: boolean;
  loginHref: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const defaultTopic = useMemo(() => topics[0]?.slug ?? "", [topics]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      topicSlug: String(formData.get("topicSlug") ?? ""),
      title: String(formData.get("title") ?? ""),
      body: String(formData.get("body") ?? ""),
    };

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/forum/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const parsed = await response.json().catch(() => null);
        setError(parsed?.error ?? "Could not create thread.");
        return;
      }

      setSuccess("Thread created successfully.");
      event.currentTarget.reset();
      router.refresh();
    } catch {
      setError("Request failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (topics.length === 0) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-6">
        <h2 className="text-base font-semibold text-white sm:text-lg">Start New Thread</h2>
        <p className="mt-2 text-sm text-slate-300">
          You need an account to post a thread.
        </p>
        <div className="mt-4 flex gap-2">
          <Link
            href={loginHref}
            className="inline-flex rounded-full bg-lime-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-lime-300"
          >
            Login
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-6">
      <h2 className="text-base font-semibold text-white sm:text-lg">Start New Thread</h2>
      <p className="mt-1 text-xs text-slate-400 sm:text-sm">
        Create a discussion and get answers from the community.
      </p>

      <form onSubmit={onSubmit} className="mt-4 grid gap-3">
        <div className="grid gap-3">
          <select
            name="topicSlug"
            defaultValue={defaultTopic}
            className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none ring-lime-400/40 focus:ring-2"
            required
          >
            {topics.map((topic) => (
              <option key={topic.slug} value={topic.slug}>
                {topic.title}
              </option>
            ))}
          </select>
        </div>
        <input
          name="title"
          placeholder="Thread title"
          className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2"
          required
        />
        <textarea
          name="body"
          placeholder="Write details for your question or discussion..."
          rows={4}
          className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2"
          required
        />

        {error ? <p className="text-xs text-red-300">{error}</p> : null}
        {success ? <p className="text-xs text-lime-300">{success}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-fit items-center justify-center rounded-full bg-lime-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Posting..." : "Post Thread"}
        </button>
      </form>
    </section>
  );
}
