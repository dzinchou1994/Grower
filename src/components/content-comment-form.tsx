"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ContentCommentLabels } from "@/lib/content-comment-labels";

export function ContentCommentForm({
  postUrl,
  labels,
  isLoggedIn,
}: {
  postUrl: string;
  labels: ContentCommentLabels;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!isLoggedIn) {
    return (
      <p className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 text-sm text-slate-400">
        {labels.loginToComment}
      </p>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? labels.couldNotPost);
        setPending(false);
        return;
      }
      setBody("");
      router.refresh();
    } catch {
      setError(labels.networkError);
    }
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        className="w-full resize-y rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm leading-relaxed text-slate-100 shadow-inner shadow-black/20 placeholder:text-slate-500 focus:border-lime-400/35 focus:outline-none focus:ring-2 focus:ring-lime-400/25"
        placeholder={labels.commentPlaceholder}
        required
        minLength={1}
        maxLength={10000}
        aria-label={labels.commentPlaceholder}
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full border border-lime-400/45 bg-lime-400/15 px-5 py-2 text-sm font-semibold text-lime-100 shadow-[0_0_0_1px_rgba(132,204,22,0.12)] transition hover:bg-lime-400/25 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? labels.posting : labels.postComment}
        </button>
      </div>
    </form>
  );
}
