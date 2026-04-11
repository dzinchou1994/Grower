"use client";

import { useState, useTransition } from "react";

function IconThumbUp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8.99A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  );
}

function IconThumbDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8.99A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
    </svg>
  );
}

type Props = {
  threadId?: string;
  commentId?: string;
  upvotes: number;
  downvotes: number;
  userVote: number; // 1, -1, or 0
  isAuthenticated: boolean;
  loginHref: string;
  compact?: boolean;
};

export function VoteButtons({
  threadId,
  commentId,
  upvotes: initialUp,
  downvotes: initialDown,
  userVote: initialVote,
  isAuthenticated,
  loginHref,
  compact = false,
}: Props) {
  const [upvotes, setUpvotes] = useState(initialUp);
  const [downvotes, setDownvotes] = useState(initialDown);
  const [userVote, setUserVote] = useState(initialVote);
  const [isPending, startTransition] = useTransition();

  const score = upvotes - downvotes;

  function handleVote(newValue: 1 | -1) {
    if (!isAuthenticated) {
      window.location.href = loginHref;
      return;
    }

    const targetValue = userVote === newValue ? 0 : newValue;

    startTransition(async () => {
      const prev = { up: upvotes, down: downvotes, vote: userVote };

      if (userVote === 1) setUpvotes((v) => v - 1);
      if (userVote === -1) setDownvotes((v) => v - 1);
      if (targetValue === 1) setUpvotes((v) => v + 1);
      if (targetValue === -1) setDownvotes((v) => v + 1);
      setUserVote(targetValue);

      try {
        const res = await fetch("/api/forum/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ threadId, commentId, value: targetValue }),
        });
        if (!res.ok) {
          throw new Error("Vote failed");
        }
      } catch {
        setUpvotes(prev.up);
        setDownvotes(prev.down);
        setUserVote(prev.vote);
      }
    });
  }

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-slate-900/55 px-1 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm">
        <button
          type="button"
          onClick={() => handleVote(-1)}
          disabled={isPending}
          className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] transition ${
            userVote === -1
              ? "bg-red-400/20 text-red-400 ring-1 ring-red-300/35"
              : "text-slate-400 hover:bg-white/10 hover:text-red-400"
          } disabled:opacity-50`}
          aria-label="Dislike"
        >
          <IconThumbDown className="h-3.5 w-3.5" />
        </button>
        <span
          className={`min-w-[30px] text-center text-[11px] font-semibold tabular-nums ${
            score > 0
              ? "text-lime-300"
              : score < 0
                ? "text-red-400"
                : "text-slate-400"
          }`}
        >
          {score}
        </span>
        <button
          type="button"
          onClick={() => handleVote(1)}
          disabled={isPending}
          className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] transition ${
            userVote === 1
              ? "bg-lime-400/20 text-lime-300 ring-1 ring-lime-300/35"
              : "text-slate-400 hover:bg-white/10 hover:text-lime-300"
          } disabled:opacity-50`}
          aria-label="Like"
        >
          <IconThumbUp className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-white/12 bg-slate-900/55 px-1.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm">
      <button
        type="button"
        onClick={() => handleVote(1)}
        disabled={isPending}
        className={`rounded-lg p-1 text-sm transition ${
          userVote === 1
            ? "bg-lime-400/20 text-lime-300 ring-1 ring-lime-300/35"
            : "text-slate-400 hover:bg-white/10 hover:text-lime-300"
        } disabled:opacity-50`}
        aria-label="Like"
      >
        <IconThumbUp className="h-4 w-4" />
      </button>
      <span
        className={`text-xs font-bold tabular-nums ${
          score > 0
            ? "text-lime-300"
            : score < 0
              ? "text-red-400"
              : "text-slate-400"
        }`}
      >
        {score}
      </span>
      <button
        type="button"
        onClick={() => handleVote(-1)}
        disabled={isPending}
        className={`rounded-lg p-1 text-sm transition ${
          userVote === -1
            ? "bg-red-400/20 text-red-400 ring-1 ring-red-300/35"
            : "text-slate-400 hover:bg-white/10 hover:text-red-400"
        } disabled:opacity-50`}
        aria-label="Dislike"
      >
        <IconThumbDown className="h-4 w-4" />
      </button>
    </div>
  );
}
