"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DiaryWeekCommentForm({
  diarySlug,
  weekNumber,
  postComment,
  commentPlaceholder,
  loginToComment,
  posting,
  couldNotPost,
  networkError,
  isLoggedIn,
}: {
  diarySlug: string;
  weekNumber: number;
  postComment: string;
  commentPlaceholder: string;
  loginToComment: string;
  posting: string;
  couldNotPost: string;
  networkError: string;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!isLoggedIn) {
    return <p className="text-sm text-slate-500">{loginToComment}</p>;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch(
        `/api/diaries/${encodeURIComponent(diarySlug)}/weeks/${weekNumber}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body }),
        },
      );
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? couldNotPost);
        setPending(false);
        return;
      }
      setBody("");
      router.refresh();
    } catch {
      setError(networkError);
    }
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      {error ? (
        <p className="text-sm text-rose-300">{error}</p>
      ) : null}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500"
        placeholder={commentPlaceholder}
        required
        minLength={1}
        maxLength={10000}
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-yellow-400/40 bg-yellow-400/15 px-4 py-2 text-xs font-semibold text-yellow-100 hover:bg-yellow-400/25 disabled:opacity-50"
      >
        {pending ? posting : postComment}
      </button>
    </form>
  );
}
