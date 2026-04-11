import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { enUS, ka, ru } from "date-fns/locale";
import { DiaryCommentForm } from "@/components/diaries/diary-comment-form";
import { DiarySetupDisplay } from "@/components/diaries/diary-setup-display";
import { CannabisLeaf } from "@/components/icons";
import { UserAvatar } from "@/components/user-avatar";
import { getPublicDiaryBySlug } from "@/lib/diary-data";
import {
  diaryEnvironmentLabels,
  diaryGerminationLabels,
  diaryMediumLabels,
  diaryWateringLabels,
} from "@/lib/diary-labels";
import {
  getAlternates,
  getLocalizedContent,
  getLocalizedPath,
  isValidLocale,
  type Locale,
} from "@/lib/i18n";
import { getServerSessionUser } from "@/lib/auth-session";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export const dynamic = "force-dynamic";

const dateLocales = { en: enUS, ka, ru } as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const diary = await getPublicDiaryBySlug(slug);

  if (!diary) {
    return {};
  }

  return {
    title: `Grower | ${diary.title}`,
    description: diary.description?.slice(0, 160) ?? diary.title,
    alternates: getAlternates(`/diaries/${slug}`, locale),
  };
}

export default async function DiaryDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const { dict } = getLocalizedContent(typedLocale);
  const explore = dict.diaries.explore;
  const diary = await getPublicDiaryBySlug(slug);

  if (!diary) {
    notFound();
  }

  const sessionUser = await getServerSessionUser();
  const isAuthor = Boolean(sessionUser && sessionUser.userId === diary.authorId);
  const dfLocale = dateLocales[typedLocale];
  const rel = formatDistanceToNow(diary.updatedAt, { addSuffix: true, locale: dfLocale });

  const latest = diary.latestWeek;
  const earlierWeeks = diary.weeks
    .filter((w) => !latest || w.weekNumber !== latest.weekNumber)
    .sort((a, b) => b.weekNumber - a.weekNumber);

  const extraStrains = Math.max(0, diary.strains.length - 1);

  const weekHref = (weekNumber: number) =>
    getLocalizedPath(typedLocale, `/diaries/${diary.slug}/weeks/${weekNumber}`);

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/6 p-5 sm:rounded-[2rem] sm:p-8">
        <CannabisLeaf className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rotate-12 text-lime-400/[0.04] sm:h-52 sm:w-52" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
          {diary.coverImageUrl ? (
            <div className="relative aspect-video w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 lg:max-w-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={diary.coverImageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
          <div className="max-w-3xl flex-1">
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-lime-300 sm:text-xs sm:tracking-[0.25em]">
              <CannabisLeaf className="h-3.5 w-3.5" />
              {diaryEnvironmentLabels[diary.environment]} · {dict.diaries.diaryType}
            </div>
            <h1 className="mt-2 text-xl font-semibold text-white sm:mt-3 sm:text-3xl lg:text-5xl">
              {diary.title}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {diary.strain}
              {extraStrains > 0
                ? ` · ${explore.strainsMore.replace("{count}", String(extraStrains))}`
                : ""}{" "}
              · {rel}
            </p>
            {diary.description ? (
              <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:mt-4 sm:text-base sm:leading-7">
                {diary.description}
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-lime-400/15 bg-slate-950/70 p-4 sm:rounded-3xl sm:p-5 lg:w-[300px]">
            <p className="text-xs text-slate-400 sm:text-sm">{dict.diaries.overview}</p>
            <div className="mt-3 space-y-2 text-xs text-slate-300 sm:mt-4 sm:space-y-3 sm:text-sm">
              <p>
                <span className="text-slate-500">{dict.diaries.strain}:</span> {diary.strain}
              </p>
              <p>
                <span className="text-slate-500">{dict.diaries.fields.germinationMethod}:</span>{" "}
                {diaryGerminationLabels[diary.germinationMethod]}
              </p>
              <p>
                <span className="text-slate-500">{dict.diaries.fields.watering}:</span>{" "}
                {diaryWateringLabels[diary.watering]}
              </p>
              <p>
                <span className="text-slate-500">{dict.diaries.fields.medium}:</span>{" "}
                {diaryMediumLabels[diary.medium]}
              </p>
              <div className="pt-1">
                <p className="text-slate-500">{dict.diaries.author}</p>
                <Link
                  href={getLocalizedPath(typedLocale, `/u/${diary.author.username}`)}
                  className="mt-1.5 flex items-center gap-2.5 rounded-xl py-1 transition hover:bg-white/6"
                >
                  <UserAvatar
                    username={diary.author.username}
                    image={diary.author.image}
                    size="lg"
                  />
                  <span className="text-base font-semibold text-white sm:text-lg">
                    @{diary.author.username}
                  </span>
                </Link>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:mt-6 sm:gap-3">
              <Link
                href={getLocalizedPath(typedLocale, "/diaries")}
                className="rounded-full border border-white/10 px-4 py-2 text-center text-xs font-medium text-white transition hover:bg-white/8 sm:text-sm"
              >
                {dict.diaries.backToDiaries}
              </Link>
              {isAuthor ? (
                <Link
                  href={getLocalizedPath(typedLocale, `/diaries/${diary.slug}/weeks/new`)}
                  className="rounded-full bg-lime-400 px-4 py-2 text-center text-xs font-semibold text-slate-950 transition hover:bg-lime-300 sm:text-sm"
                >
                  {dict.diaries.addWeeklyUpdate}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <DiarySetupDisplay setup={diary.setup} labels={dict.diaries.setup} />

      <section className="rounded-2xl border border-white/10 bg-slate-950/50 p-5 sm:rounded-[2rem] sm:p-8">
        <h2 className="text-lg font-semibold text-white">{dict.diaries.diaryDiscussionTitle}</h2>
        <div className="mt-4 space-y-4">
          {diary.diaryComments.map((c) => (
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
          <DiaryCommentForm
            diarySlug={diary.slug}
            postComment={explore.postComment}
            commentPlaceholder={explore.commentPlaceholder}
            loginToComment={explore.loginToComment}
            posting={explore.posting}
            isLoggedIn={Boolean(sessionUser)}
          />
        </div>
      </section>

      {latest ? (
        <section className="rounded-2xl border border-lime-400/20 bg-lime-400/[0.06] p-5 sm:rounded-[2rem] sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-lime-300">
            {explore.latestWeekBadge}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white sm:text-3xl">
            <Link
              href={getLocalizedPath(
                typedLocale,
                `/diaries/${diary.slug}/weeks/${latest.weekNumber}`,
              )}
              className="transition hover:text-lime-300"
            >
              Week {latest.weekNumber}
              {latest.title ? `: ${latest.title}` : ""}
            </Link>
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-200 sm:text-base">
            {latest.description}
          </p>
          {latest.images.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {latest.images.map((im) => (
                <Link
                  key={im.id}
                  href={weekHref(latest.weekNumber)}
                  className="relative aspect-square overflow-hidden rounded-xl border border-white/10 transition hover:border-lime-400/30"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={im.imageUrl} alt="" className="h-full w-full object-cover" />
                </Link>
              ))}
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
            <span>
              {latest.likeCount} {dict.diaries.likes}
            </span>
            <span>
              {latest.commentCount} {dict.diaries.comments}
            </span>
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-8">
        <div className="flex items-start justify-between gap-3 sm:items-end">
          <div>
            <p className="text-xs text-slate-400 sm:text-sm">{dict.diaries.timelineBadge}</p>
            <h2 className="mt-1 text-lg font-semibold text-white sm:text-2xl">
              {dict.diaries.timelineTitle}
            </h2>
          </div>
          <span className="shrink-0 rounded-full bg-lime-400/10 px-3 py-1.5 text-[10px] font-medium text-lime-300 sm:px-4 sm:py-2 sm:text-xs">
            {diary.weeks.length} {dict.diaries.updatesCount}
          </span>
        </div>

        <div className="mt-5 space-y-3 sm:mt-8 sm:space-y-4">
          {diary.weeks.length === 0 ? (
            <p className="text-sm text-slate-500">{explore.empty}</p>
          ) : (
            earlierWeeks.map((week) => {
              const href = weekHref(week.weekNumber);
              const preview = week.images.slice(0, 3);
              const extraImg = week.images.length - preview.length;
              return (
                <article
                  key={week.id}
                  className="rounded-2xl border border-white/8 bg-white/4 p-4 sm:rounded-[1.75rem] sm:p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
                    {preview.length > 0 ? (
                      <div className="flex shrink-0 flex-wrap gap-2">
                        {preview.map((im) => (
                          <Link
                            key={im.id}
                            href={href}
                            className="group relative h-16 w-16 overflow-hidden rounded-xl border border-white/10 sm:h-[4.5rem] sm:w-[4.5rem]"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={im.imageUrl}
                              alt=""
                              className="h-full w-full object-cover transition group-hover:opacity-90"
                            />
                          </Link>
                        ))}
                        {extraImg > 0 ? (
                          <Link
                            href={href}
                            className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-white/8 text-xs font-medium text-lime-200 transition hover:bg-white/12 sm:h-[4.5rem] sm:w-[4.5rem]"
                          >
                            +{extraImg}
                          </Link>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-lime-300 sm:text-xs sm:tracking-[0.25em]">
                            Week {week.weekNumber}
                          </p>
                          <Link
                            href={href}
                            className="mt-1.5 inline-block text-base font-semibold text-white transition hover:text-lime-300 sm:mt-2 sm:text-xl"
                          >
                            {week.title || `Week ${week.weekNumber}`}
                          </Link>
                        </div>
                        <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-300 sm:gap-2 sm:text-xs">
                          <span className="rounded-full bg-white/6 px-2.5 py-1 sm:px-3">
                            {week.images.length} {dict.diaries.images}
                          </span>
                          <span className="rounded-full bg-white/6 px-2.5 py-1 sm:px-3">
                            {week.likeCount} {dict.diaries.likes}
                          </span>
                          <span className="rounded-full bg-white/6 px-2.5 py-1 sm:px-3">
                            {week.commentCount} {dict.diaries.comments}
                          </span>
                        </div>
                      </div>

                      <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-slate-400 sm:mt-4 sm:text-sm sm:leading-7">
                        {week.description}
                      </p>

                      <Link
                        href={href}
                        className="mt-3 inline-flex text-xs font-medium text-lime-300/95 hover:text-lime-200 sm:text-sm"
                      >
                        {dict.diaries.viewWeek}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
