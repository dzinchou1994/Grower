"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function ForumCommentForm({ threadSlug }: { threadSlug: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      author: String(formData.get("author") ?? ""),
      body: String(formData.get("body") ?? ""),
    };

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/forum/threads/${threadSlug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const parsed = await response.json().catch(() => null);
        setError(parsed?.error ?? "Could not add comment.");
        return;
      }

      event.currentTarget.reset();
      router.refresh();
    } catch {
      setError("Request failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-2.5">
      <div className="grid gap-2 sm:grid-cols-[180px_1fr]">
        <input
          name="author"
          placeholder="Your name"
          className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2 sm:text-sm"
          required
        />
        <input
          name="body"
          placeholder="Add comment..."
          className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2 sm:text-sm"
          required
        />
      </div>

      {error ? <p className="text-xs text-red-300">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-fit rounded-full border border-lime-400/40 px-3 py-1.5 text-xs font-medium text-lime-300 transition hover:bg-lime-400/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Posting..." : "Add comment"}
      </button>
    </form>
  );
}
