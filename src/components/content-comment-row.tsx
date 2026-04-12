"use client";

import Link from "next/link";
import { ForumItemActions } from "@/components/forum-item-actions";
import { UserAvatar } from "@/components/user-avatar";
import type { PublicContentComment } from "@/lib/content-comments-data";
import type { Locale } from "@/lib/i18n";
import { getLocalizedPath } from "@/lib/i18n-routing";

export function ContentCommentRow({
  locale,
  comment,
  dateLocale,
  kind,
  sessionUser,
}: {
  locale: Locale;
  comment: PublicContentComment;
  dateLocale: string;
  kind: "news" | "cannapedia";
  sessionUser: { userId: string; role: "USER" | "MODERATOR" | "ADMIN" } | null;
}) {
  const isOwner = sessionUser?.userId === comment.authorId;
  const isStaff = sessionUser?.role === "ADMIN" || sessionUser?.role === "MODERATOR";
  const canDelete = Boolean(isOwner || isStaff);
  const deleteEndpoint = canDelete
    ? `/api/${kind === "news" ? "news" : "cannapedia"}/comments/${encodeURIComponent(comment.id)}`
    : undefined;
  const canReport = Boolean(sessionUser && !isOwner);

  return (
    <div className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5 sm:gap-4 sm:p-4">
      <Link
        href={getLocalizedPath(locale, `/u/${comment.author.username}`)}
        className="shrink-0 self-start pt-0.5 transition hover:opacity-90"
        aria-label={`@${comment.author.username}`}
      >
        <UserAvatar username={comment.author.username} image={comment.author.image} size="md" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs text-slate-500">
            <Link
              href={getLocalizedPath(locale, `/u/${comment.author.username}`)}
              className="text-sm font-semibold text-white transition hover:text-lime-300"
            >
              @{comment.author.username}
            </Link>
            <span>· {comment.createdAt.toLocaleString(dateLocale)}</span>
          </p>
          <ForumItemActions
            locale={locale}
            canDelete={canDelete}
            deleteEndpoint={deleteEndpoint}
            canReport={canReport}
            reportTargetType={kind === "news" ? "NEWS_COMMENT" : "CANNAPEDIA_COMMENT"}
            reportTargetId={comment.id}
            className="mt-0 shrink-0"
          />
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{comment.body}</p>
      </div>
    </div>
  );
}
