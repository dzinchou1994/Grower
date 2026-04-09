import Link from "next/link";
import { ForumItemActions } from "@/components/forum-item-actions";
import { UserQuickProfileTrigger } from "@/components/user-quick-profile-trigger";
import { getLocalizedPath, type Locale } from "@/lib/i18n";

export type ForumThreadListItemHeaderProps = {
  locale: Locale;
  topicSlug: string;
  thread: {
    id?: string;
    slug: string;
    title: string;
    isPinned?: boolean;
    isTranslated?: boolean;
    author: string;
    authorImage?: string | null;
    lastActivity: string;
  };
  isAuthenticated: boolean;
  currentUsername?: string;
  canModerateThread: boolean;
  canReportThread: boolean;
  deleteEndpoint?: string;
  permalinkLabel: string;
};

export function ForumThreadListItemHeader({
  locale,
  topicSlug,
  thread,
  isAuthenticated,
  currentUsername,
  canModerateThread,
  canReportThread,
  deleteEndpoint,
  permalinkLabel,
}: ForumThreadListItemHeaderProps) {
  const titleHref = getLocalizedPath(locale, `/forum/${topicSlug}/${thread.slug}`);

  return (
    <div className="flex w-full min-w-0 flex-row items-start justify-between gap-x-3 gap-y-2">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {Boolean(thread.isPinned) ? (
            <span className="shrink-0 text-xs text-lime-300">📌</span>
          ) : null}
          <Link
            href={titleHref}
            className="min-w-0 flex-1 basis-0 break-words text-pretty text-sm font-semibold leading-snug text-white transition hover:text-lime-300 sm:text-lg"
          >
            {thread.title}
          </Link>
        </div>
        <div className="mt-1.5 sm:mt-2">
          <UserQuickProfileTrigger
            locale={locale}
            username={thread.author}
            image={thread.authorImage}
            isAuthenticated={isAuthenticated}
            currentUsername={currentUsername}
            className="inline-flex items-center gap-1.5 text-[10px] text-slate-400 transition hover:text-lime-300 sm:text-sm"
          />
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1 self-start">
        <ForumItemActions
          locale={locale}
          canDelete={canModerateThread}
          canReport={canReportThread}
          deleteEndpoint={deleteEndpoint}
          reportTargetType="THREAD"
          reportTargetId={thread.id ?? thread.slug}
          permalinkHref={titleHref}
          permalinkLabel={permalinkLabel}
          className="relative flex shrink-0 justify-end"
        />
        <span className="shrink-0 whitespace-nowrap rounded-full bg-lime-400/10 px-1.5 py-px text-[9px] leading-tight text-lime-300 tabular-nums sm:px-2 sm:py-0.5 sm:text-[10px]">
          {thread.lastActivity}
        </span>
      </div>
    </div>
  );
}
