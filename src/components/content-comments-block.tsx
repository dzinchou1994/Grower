import { ContentCommentRow } from "@/components/content-comment-row";
import { ContentCommentForm } from "@/components/content-comment-form";
import type { PublicContentComment } from "@/lib/content-comments-data";
import type { ContentCommentLabels } from "@/lib/content-comment-labels";
import type { Locale } from "@/lib/i18n";

export function ContentCommentsBlock({
  locale,
  comments,
  labels,
  postUrl,
  isLoggedIn,
  dateLocale,
  kind,
  sessionUser,
}: {
  locale: Locale;
  comments: PublicContentComment[];
  labels: ContentCommentLabels;
  postUrl: string;
  isLoggedIn: boolean;
  dateLocale: string;
  kind: "news" | "cannapedia";
  sessionUser: { userId: string; role: "USER" | "MODERATOR" | "ADMIN" } | null;
}) {
  return (
    <section className="mt-8 rounded-2xl border border-white/10 bg-slate-950/50 p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] sm:mt-10 sm:rounded-[1.75rem] sm:p-7">
      <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">{labels.sectionTitle}</h2>

      <div className="mt-5 space-y-3 sm:space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-slate-500">{labels.empty}</p>
        ) : (
          comments.map((c) => (
            <ContentCommentRow
              key={c.id}
              locale={locale}
              comment={c}
              dateLocale={dateLocale}
              kind={kind}
              sessionUser={sessionUser}
            />
          ))
        )}
      </div>

      <div className="mt-6 border-t border-white/[0.07] pt-6">
        <ContentCommentForm postUrl={postUrl} labels={labels} isLoggedIn={isLoggedIn} />
      </div>
    </section>
  );
}
