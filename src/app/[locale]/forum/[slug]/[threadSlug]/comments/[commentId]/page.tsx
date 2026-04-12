import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UserQuickProfileTrigger } from "@/components/user-quick-profile-trigger";
import { VoteButtons } from "@/components/vote-buttons";
import { getServerSessionUser } from "@/lib/auth-session";
import { getForumCommentById } from "@/lib/forum-data";
import {
  getAlternates,
  getDictionary,
  getLocalizedPath,
  isValidLocale,
  type Locale,
} from "@/lib/i18n";
import { fillSeoTemplate } from "@/lib/seo-template";

type PageProps = {
  params: Promise<{ locale: string; slug: string; threadSlug: string; commentId: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug, threadSlug, commentId } = await params;
  if (!isValidLocale(locale)) {
    return {};
  }

  const typedLocale = locale as Locale;
  const sessionUser = await getServerSessionUser();
  const data = await getForumCommentById(commentId, typedLocale, sessionUser?.userId);
  if (!data || data.topic.slug !== slug || data.thread.slug !== threadSlug) {
    return {};
  }

  const dict = getDictionary(typedLocale);
  return {
    title: fillSeoTemplate(dict.routeMeta.templates.forumThread, { title: data.thread.title }),
    description: data.comment.body.slice(0, 160),
    alternates: getAlternates(`/forum/${slug}/${threadSlug}/comments/${commentId}`, locale),
  };
}

export default async function ForumCommentPage({ params }: PageProps) {
  const { locale, slug, threadSlug, commentId } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const sessionUser = await getServerSessionUser();
  const data = await getForumCommentById(commentId, typedLocale, sessionUser?.userId);

  if (!data || data.topic.slug !== slug || data.thread.slug !== threadSlug) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-8">
        <Link
          href={getLocalizedPath(typedLocale, `/forum/${data.topic.slug}/${data.thread.slug}`)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-lime-300 sm:text-sm"
        >
          ← {data.thread.title}
        </Link>

        <article className="mt-4 rounded-xl bg-slate-900/60 px-3 py-2 sm:px-4 sm:py-3">
          <UserQuickProfileTrigger
            locale={typedLocale}
            username={data.comment.author}
            image={data.comment.authorImage}
            isAuthenticated={Boolean(sessionUser)}
            currentUsername={sessionUser?.username}
            showPrefix={false}
            className="inline-flex items-center gap-2 text-[10px] text-slate-500 transition hover:text-lime-300 sm:text-xs"
          />
          <p className="mt-2 text-sm leading-relaxed text-slate-200">{data.comment.body}</p>
          <div className="mt-2 flex justify-end">
            <VoteButtons
              commentId={data.comment.id}
              upvotes={data.comment.upvotes}
              downvotes={data.comment.downvotes}
              userVote={data.comment.userVote}
              isAuthenticated={Boolean(sessionUser)}
              loginHref={getLocalizedPath(typedLocale, "/auth/login")}
              compact
            />
          </div>
        </article>
      </section>
    </div>
  );
}
