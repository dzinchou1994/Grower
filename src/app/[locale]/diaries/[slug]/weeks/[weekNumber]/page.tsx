import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CannabisLeaf } from "@/components/icons";
import { UserAvatar } from "@/components/user-avatar";
import { getDiaryWeekPublic } from "@/lib/diary-data";
import { DiarySharePanel } from "@/components/diary-share-panel";
import { diaryOpenGraphMetadata } from "@/lib/diary-open-graph";
import {
  getAlternates,
  getLocalizedContent,
  getLocalizedPath,
  isValidLocale,
  siteUrl,
  type Locale,
} from "@/lib/i18n";
import { getServerSessionUser } from "@/lib/auth-session";

const DiaryWeekCommentForm = nextDynamic(() =>
  import("@/components/diaries/diary-week-comment-form").then((m) => m.DiaryWeekCommentForm),
);

type PageProps = {
  params: Promise<{ locale: string; slug: string; weekNumber: string }>;
};

export const dynamic = "force-dynamic";

function parseWeekNumber(value: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }
  return parsed;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug, weekNumber } = await params;
  if (!isValidLocale(locale)) {
    return {};
  }

  const week = parseWeekNumber(weekNumber);
  if (!week) {
    return {};
  }

  const data = await getDiaryWeekPublic(slug, week);
  if (!data) {
    return {};
  }

  const { dict } = getLocalizedContent(locale as Locale);
  const weekHeading = dict.diaries.explore.weekHeading.replace("{n}", String(data.week.weekNumber));
  const title = `Grower | ${data.diary.title} — ${weekHeading}`;
  const description = data.week.description.slice(0, 160);

  return {
    title,
    description,
    alternates: getAlternates(`/diaries/${slug}/weeks/${weekNumber}`, locale),
    ...diaryOpenGraphMetadata({
      locale: locale as Locale,
      path: `/diaries/${slug}/weeks/${weekNumber}`,
      title,
      description,
      imageCandidates: [data.week.images[0]?.imageUrl, data.diary.coverImageUrl],
    }),
  };
}

export default async function DiaryWeekPage({ params }: PageProps) {
  const { locale, slug, weekNumber } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  const week = parseWeekNumber(weekNumber);
  if (!week) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const { dict } = getLocalizedContent(typedLocale);
  const explore = dict.diaries.explore;

  const data = await getDiaryWeekPublic(slug, week);
  if (!data) {
    notFound();
  }

  const sessionUser = await getServerSessionUser();

  const { diary, week: diaryWeek } = data;

  return (
    <article className="mx-auto w-full max-w-4xl">
      <div className="rounded-2xl border border-white/10 bg-slate-950/65 p-5 sm:rounded-[2rem] sm:p-8">
        <Link
          href={getLocalizedPath(typedLocale, `/diaries/${diary.slug}`)}
          className="text-xs text-lime-300 transition hover:text-lime-200 sm:text-sm"
        >
          ← {dict.diaries.backToDiaries}
        </Link>

        <div className="mt-4 flex items-center gap-2 text-xs text-lime-300 sm:text-sm">
          <CannabisLeaf className="h-4 w-4 shrink-0" />
          {diary.title}
        </div>

        <h1 className="mt-2 text-2xl font-semibold text-white sm:text-4xl">
          {explore.weekHeading.replace("{n}", String(diaryWeek.weekNumber))}
          {diaryWeek.title ? `: ${diaryWeek.title}` : ""}
        </h1>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-200 sm:text-base">
          {diaryWeek.description}
        </p>

        {diaryWeek.images.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {diaryWeek.images.map((im) => (
              <div
                key={im.id}
                className="relative aspect-square overflow-hidden rounded-xl border border-white/10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={im.imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-300">
          <span className="rounded-full bg-white/6 px-3 py-1">
            {diaryWeek.images.length} {dict.diaries.images}
          </span>
          <span className="rounded-full bg-white/6 px-3 py-1">
            {diaryWeek.likeCount} {dict.diaries.likes}
          </span>
          <span className="rounded-full bg-white/6 px-3 py-1">
            {diaryWeek.commentCount} {dict.diaries.comments}
          </span>
        </div>

        <div className="mt-3">
          <DiarySharePanel
            url={`${siteUrl}${getLocalizedPath(typedLocale, `/diaries/${diary.slug}/weeks/${weekNumber}`)}`}
            title={`${diary.title} — ${explore.weekHeading.replace("{n}", String(diaryWeek.weekNumber))}${diaryWeek.title ? `: ${diaryWeek.title}` : ""}`}
            text={diaryWeek.description}
            labels={dict.diaries.share}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/50 p-5 sm:rounded-[2rem] sm:p-8">
        <h2 className="text-lg font-semibold text-white">{dict.diaries.comments}</h2>
        <div className="mt-4 space-y-4">
          {diaryWeek.comments.map((c) => (
            <div key={c.id} className="rounded-xl border border-white/8 bg-white/4 p-4">
              <div className="flex gap-3">
                <Link
                  href={getLocalizedPath(typedLocale, `/u/${c.author.username}`)}
                  className="shrink-0 self-start pt-0.5 transition hover:opacity-90"
                  aria-label={`@${c.author.username}`}
                >
                  <UserAvatar username={c.author.username} image={c.author.image} size="md" />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs text-slate-500">
                    <Link
                      href={getLocalizedPath(typedLocale, `/u/${c.author.username}`)}
                      className="text-sm font-semibold text-white hover:text-lime-300"
                    >
                      @{c.author.username}
                    </Link>
                    <span>
                      ·{" "}
                      {c.createdAt.toLocaleString(
                        typedLocale === "en" ? "en-US" : typedLocale === "ru" ? "ru-RU" : "ka-GE",
                      )}
                    </span>
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">{c.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-white/10 pt-6">
          <DiaryWeekCommentForm
            diarySlug={diary.slug}
            weekNumber={diaryWeek.weekNumber}
            postComment={explore.postComment}
            commentPlaceholder={explore.commentPlaceholder}
            loginToComment={explore.loginToComment}
            posting={explore.posting}
            couldNotPost={explore.couldNotPost}
            networkError={explore.networkError}
            isLoggedIn={Boolean(sessionUser)}
          />
        </div>
      </div>
    </article>
  );
}
