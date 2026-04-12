import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import { ArrowLeft, ChevronDown, Layers } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { enUS, ka, ru } from "date-fns/locale";
import { DiarySetupDisplay } from "@/components/diaries/diary-setup-display";
import { CannabisLeaf } from "@/components/icons";
import { UserAvatar } from "@/components/user-avatar";
import { getAvatarOptionByImage } from "@/lib/avatar-options";
import { notoSansGeorgian } from "@/lib/fonts/noto-sans-georgian";
import { hasGeorgianScript, toMtavruli } from "@/lib/georgian-mtavruli";
import { getPublicDiaryBySlug } from "@/lib/diary-data";
import { preferUnoptimizedRemoteImage } from "@/lib/remote-image";
import { wikimediaSizedSrc } from "@/lib/wikimedia-commons-thumb";
import { formatDistanceDisplayKa } from "@/lib/format-distance-ka";
import { getDiaryLabels } from "@/lib/diary-labels";
import { DiarySharePanel } from "@/components/diary-share-panel";
import { diaryOpenGraphMetadata } from "@/lib/diary-open-graph";
import {
  getAlternates,
  getDictionary,
  getLocalizedContent,
  getLocalizedPath,
  isValidLocale,
  siteUrl,
  type Locale,
} from "@/lib/i18n";
import { fillSeoTemplate } from "@/lib/seo-template";
import { getServerSessionUser } from "@/lib/auth-session";

const DiaryCommentForm = nextDynamic(() =>
  import("@/components/diaries/diary-comment-form").then((m) => m.DiaryCommentForm),
);

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

  const dict = getDictionary(locale as Locale);
  const title = fillSeoTemplate(dict.routeMeta.templates.growDiary, {
    title: diary.title,
  });
  const description =
    diary.description?.trim().slice(0, 160) ||
    dict.routeMeta.diaries.description.slice(0, 160);

  return {
    title,
    description,
    alternates: getAlternates(`/diaries/${slug}`, locale),
    ...diaryOpenGraphMetadata({
      locale: locale as Locale,
      path: `/diaries/${slug}`,
      title,
      description,
      imageCandidates: [diary.coverImageUrl, diary.latestWeek?.images[0]?.imageUrl],
    }),
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
  const enumLabels = getDiaryLabels(typedLocale);
  const dfLocale = dateLocales[typedLocale];
  const rel = formatDistanceDisplayKa(
    formatDistanceToNow(diary.updatedAt, { addSuffix: true, locale: dfLocale }),
    typedLocale,
  );

  const latest = diary.latestWeek;
  const earlierWeeks = diary.weeks
    .filter((w) => !latest || w.weekNumber !== latest.weekNumber)
    .sort((a, b) => b.weekNumber - a.weekNumber);

  const extraStrains = Math.max(0, diary.strains.length - 1);
  const authorAvatarOption = getAvatarOptionByImage(diary.author.image);
  const diaryTitleUseMtavruli = typedLocale === "ka" && hasGeorgianScript(diary.title);
  const overviewUseMtavruli =
    typedLocale === "ka" && hasGeorgianScript(dict.diaries.overview);
  const overviewLabelText = overviewUseMtavruli
    ? toMtavruli(dict.diaries.overview)
    : dict.diaries.overview;

  const weekHref = (weekNumber: number) =>
    getLocalizedPath(typedLocale, `/diaries/${diary.slug}/weeks/${weekNumber}`);

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <section className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-slate-950/40 to-transparent p-5 sm:rounded-3xl sm:p-8">
        <CannabisLeaf className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rotate-12 text-yellow-400/[0.035] sm:h-40 sm:w-40" />
        <Link
          href={getLocalizedPath(typedLocale, "/diaries")}
          className="absolute left-5 top-5 z-20 inline-flex max-w-[calc(100%-1rem)] items-center justify-center gap-1.5 rounded-full border border-white/[0.12] bg-slate-950/95 px-3 py-1.5 text-[11px] font-medium text-yellow-200/95 shadow-sm transition hover:border-yellow-400/30 hover:bg-yellow-400/10 hover:text-white sm:left-8 sm:top-8 sm:text-xs lg:hidden"
        >
          <ArrowLeft className="h-3.5 w-3.5 shrink-0 opacity-90" strokeWidth={2.25} aria-hidden />
          {dict.diaries.backToDiariesShort}
        </Link>
        <div className="relative flex flex-col gap-6 pt-9 sm:pt-10 lg:flex-row lg:items-start lg:justify-between lg:gap-8 lg:pt-0">
          {diary.coverImageUrl ? (
            <div className="relative aspect-video w-full max-w-xl overflow-hidden rounded-2xl ring-1 ring-white/[0.06] lg:max-w-md">
              <Image
                src={wikimediaSizedSrc(
                  diary.coverImageUrl,
                  448,
                  preferUnoptimizedRemoteImage(diary.coverImageUrl),
                )}
                alt=""
                fill
                sizes="(max-width: 1024px) 92vw, 448px"
                className="object-cover"
                quality={75}
                priority
                unoptimized={preferUnoptimizedRemoteImage(diary.coverImageUrl)}
              />
            </div>
          ) : null}
          <div className="max-w-3xl flex-1">
            <div className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-yellow-400/80 sm:text-[11px]">
              <CannabisLeaf className="h-3 w-3 opacity-80" />
              {enumLabels.environment[diary.environment]} · {dict.diaries.diaryType}
            </div>
            <h1
              className={`mt-3 text-2xl font-semibold tracking-tight text-white sm:mt-4 sm:text-4xl lg:text-5xl ${
                diaryTitleUseMtavruli ? notoSansGeorgian.className : "uppercase"
              }`}
            >
              {diaryTitleUseMtavruli ? toMtavruli(diary.title) : diary.title}
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-slate-500">
              <span>
                {diary.strain}
                {extraStrains > 0
                  ? ` · ${explore.strainsMore.replace("{count}", String(extraStrains))}`
                  : ""}
              </span>
              <span className="text-slate-600" aria-hidden>
                ·
              </span>
              <Link
                href={getLocalizedPath(typedLocale, `/u/${diary.author.username}`)}
                className="font-medium text-slate-400 underline-offset-2 transition hover:text-yellow-300 hover:underline"
              >
                @{diary.author.username}
              </Link>
              <span className="text-slate-600" aria-hidden>
                ·
              </span>
              <span>{rel}</span>
            </p>
            {diary.description ? (
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base sm:leading-7">
                {diary.description}
              </p>
            ) : null}
            <div className="mt-3">
              <DiarySharePanel
                url={`${siteUrl}${getLocalizedPath(typedLocale, `/diaries/${diary.slug}`)}`}
                title={diary.title}
                text={diary.description ?? diary.title}
                labels={dict.diaries.share}
              />
            </div>
          </div>

          <>
            {/* Mobile: compact collapsible overview - saves vertical space */}
            <details className="group rounded-2xl border border-white/[0.07] bg-gradient-to-br from-slate-950/90 via-white/[0.05] to-transparent shadow-[0_8px_32px_-20px_rgba(0,0,0,0.5)] lg:hidden open:border-yellow-400/20 open:shadow-[0_12px_40px_-16px_rgba(250,204,21,0.08)]">
              <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-white/[0.03] [&::-webkit-details-marker]:hidden">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400/25 via-amber-500/10 to-slate-900/50 shadow-[inset_0_1px_0_0_rgba(250,204,21,0.15)] ring-1 ring-yellow-400/25">
                  <Layers className="h-5 w-5 text-yellow-200/90" strokeWidth={1.75} aria-hidden />
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <p
                    className={`text-[9px] font-semibold tracking-[0.2em] text-yellow-400/70 ${
                      overviewUseMtavruli ? notoSansGeorgian.className : "uppercase"
                    }`}
                  >
                    {overviewLabelText}
                  </p>
                  <p className="mt-0.5 truncate text-[15px] font-semibold tracking-tight text-white">
                    {diary.strain}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] font-medium text-slate-400">
                    @{diary.author.username}
                  </p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-black/30 text-slate-400 transition group-open:border-yellow-400/25 group-open:bg-yellow-400/10 group-open:text-yellow-200">
                  <ChevronDown
                    className="h-4 w-4 transition duration-300 group-open:rotate-180"
                    strokeWidth={2.25}
                    aria-hidden
                  />
                </span>
              </summary>
              <div className="border-t border-white/[0.05] px-3.5 pb-3.5 pt-2">
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] leading-snug text-slate-300">
                  <p>
                    <span className="block text-[9px] uppercase tracking-wide text-slate-500">
                      {dict.diaries.fields.germinationMethod}
                    </span>
                    {enumLabels.germination[diary.germinationMethod]}
                  </p>
                  <p>
                    <span className="block text-[9px] uppercase tracking-wide text-slate-500">
                      {dict.diaries.fields.watering}
                    </span>
                    {enumLabels.watering[diary.watering]}
                  </p>
                  <p className="col-span-2">
                    <span className="block text-[9px] uppercase tracking-wide text-slate-500">
                      {dict.diaries.fields.medium}
                    </span>
                    {enumLabels.medium[diary.medium]}
                  </p>
                </div>
                <div className="mt-3 border-t border-white/[0.05] pt-3">
                  <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-slate-500">
                    {dict.diaries.author}
                  </p>
                  <Link
                    href={getLocalizedPath(typedLocale, `/u/${diary.author.username}`)}
                    className={`mt-1.5 flex rounded-lg py-1 transition hover:bg-white/[0.04] ${
                      authorAvatarOption.imagePath
                        ? "items-center gap-2.5"
                        : "items-center px-0.5"
                    }`}
                  >
                    {authorAvatarOption.imagePath ? (
                      <UserAvatar
                        username={diary.author.username}
                        image={diary.author.image}
                        size="sm"
                      />
                    ) : null}
                    <span className="text-[13px] font-medium leading-snug text-slate-200 underline-offset-2 hover:text-yellow-200/95 hover:underline">
                      @{diary.author.username}
                    </span>
                  </Link>
                </div>
                {isAuthor ? (
                  <div className="mt-3">
                    <Link
                      href={getLocalizedPath(typedLocale, `/diaries/${diary.slug}/weeks/new`)}
                      className="block w-full rounded-full bg-yellow-400/90 px-3 py-2 text-center text-[11px] font-semibold text-slate-950 transition hover:bg-yellow-300"
                    >
                      {dict.diaries.addWeeklyUpdate}
                    </Link>
                  </div>
                ) : null}
              </div>
            </details>

            {/* Desktop: always-visible sidebar */}
            <div className="hidden rounded-2xl border border-white/[0.06] bg-slate-950/30 p-4 sm:p-5 lg:block lg:w-[280px] lg:shrink-0">
              <p
                className={`text-[10px] font-medium tracking-[0.14em] text-slate-500 sm:text-xs ${
                  overviewUseMtavruli ? notoSansGeorgian.className : "uppercase"
                }`}
              >
                {overviewLabelText}
              </p>
              <div className="mt-3 space-y-2 text-xs text-slate-300 sm:mt-4 sm:space-y-3 sm:text-sm">
                <p>
                  <span className="text-slate-500">{dict.diaries.strain}:</span> {diary.strain}
                </p>
                <p>
                  <span className="text-slate-500">{dict.diaries.fields.germinationMethod}:</span>{" "}
                  {enumLabels.germination[diary.germinationMethod]}
                </p>
                <p>
                  <span className="text-slate-500">{dict.diaries.fields.watering}:</span>{" "}
                  {enumLabels.watering[diary.watering]}
                </p>
                <p>
                  <span className="text-slate-500">{dict.diaries.fields.medium}:</span>{" "}
                  {enumLabels.medium[diary.medium]}
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
              <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:gap-2.5">
                <Link
                  href={getLocalizedPath(typedLocale, "/diaries")}
                  className="rounded-full border border-white/[0.08] px-4 py-2 text-center text-xs font-medium text-slate-300 transition hover:border-white/15 hover:bg-white/[0.04] hover:text-white sm:text-sm"
                >
                  {dict.diaries.backToDiaries}
                </Link>
                {isAuthor ? (
                  <Link
                    href={getLocalizedPath(typedLocale, `/diaries/${diary.slug}/weeks/new`)}
                    className="rounded-full bg-yellow-400/90 px-4 py-2 text-center text-xs font-semibold text-slate-950 transition hover:bg-yellow-300 sm:text-sm"
                  >
                    {dict.diaries.addWeeklyUpdate}
                  </Link>
                ) : null}
              </div>
            </div>
          </>
        </div>
      </section>

      <DiarySetupDisplay setup={diary.setup} labels={dict.diaries.setup} locale={typedLocale} />

      {latest ? (
        <section className="rounded-xl border border-white/[0.07] bg-slate-950/35 p-4 sm:rounded-2xl sm:p-5">
          <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-slate-500 sm:text-[10px] sm:tracking-[0.2em]">
            {explore.latestWeekBadge}
          </p>
          <h2 className="mt-1.5 text-base font-semibold leading-snug tracking-tight text-white sm:mt-2 sm:text-lg">
            <Link
              href={getLocalizedPath(
                typedLocale,
                `/diaries/${diary.slug}/weeks/${latest.weekNumber}`,
              )}
              className="transition hover:text-yellow-300/90"
            >
              {explore.weekHeading.replace("{n}", String(latest.weekNumber))}
              {latest.title ? `: ${latest.title}` : ""}
            </Link>
          </h2>
          <p className="mt-2 max-sm:line-clamp-4 whitespace-pre-wrap text-xs leading-relaxed text-slate-400 sm:line-clamp-none sm:mt-2.5 sm:text-sm sm:leading-relaxed sm:text-slate-300">
            {latest.description}
          </p>
          {latest.images.length > 0 ? (
            <div
              className={
                latest.images.length <= 1
                  ? "mt-3 grid w-full max-w-[200px] grid-cols-1 gap-1.5 sm:mt-4"
                  : latest.images.length === 2
                    ? "mt-3 grid w-full grid-cols-2 gap-1.5 sm:mt-4 sm:gap-2"
                    : "mt-3 grid w-full grid-cols-3 gap-1.5 sm:mt-4 sm:gap-2"
              }
            >
              {latest.images.map((im) => {
                const uo = preferUnoptimizedRemoteImage(im.imageUrl);
                return (
                <Link
                  key={im.id}
                  href={weekHref(latest.weekNumber)}
                  className="relative aspect-square overflow-hidden rounded-lg border border-white/[0.06] transition hover:border-yellow-400/25"
                >
                  <Image
                    src={wikimediaSizedSrc(im.imageUrl, 180, uo)}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 28vw, 180px"
                    className="object-cover"
                    quality={65}
                    loading="lazy"
                    decoding="async"
                    unoptimized={uo}
                  />
                </Link>
              );
              })}
            </div>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] tabular-nums text-slate-500 sm:mt-3.5 sm:text-xs">
            <span>
              {latest.likeCount} {dict.diaries.likes}
            </span>
            <span>
              {latest.commentCount} {dict.diaries.comments}
            </span>
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-white/[0.06] bg-transparent p-5 sm:rounded-3xl sm:p-6">
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] pb-4 sm:items-end sm:pb-5">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 sm:text-xs">
              {dict.diaries.timelineBadge}
            </p>
            <h2 className="mt-1 text-base font-semibold uppercase tracking-[0.14em] text-white sm:text-lg sm:tracking-[0.16em]">
              {dict.diaries.timelineTitle}
            </h2>
          </div>
          <span className="shrink-0 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-[10px] font-medium tabular-nums text-slate-400 sm:text-xs">
            {diary.weeks.length} {dict.diaries.updatesCount}
          </span>
        </div>

        <div className="mt-5 space-y-2 sm:mt-6 sm:space-y-2.5">
          {diary.weeks.length === 0 ? (
            <p className="text-sm text-slate-500">{explore.empty}</p>
          ) : (
            earlierWeeks.map((week) => {
              const href = weekHref(week.weekNumber);
              const preview = week.images.slice(0, 3);
              const extraImg = week.images.length - preview.length;
              return (
                <Link
                  key={week.id}
                  href={href}
                  className="group block rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-yellow-400/20 hover:bg-white/[0.04] sm:rounded-2xl sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
                    {preview.length > 0 ? (
                      <div className="flex shrink-0 flex-wrap gap-2">
                        {preview.map((im) => {
                          const uo = preferUnoptimizedRemoteImage(im.imageUrl);
                          return (
                          <div
                            key={im.id}
                            className="relative h-16 w-16 overflow-hidden rounded-xl ring-1 ring-white/[0.06] sm:h-[4.5rem] sm:w-[4.5rem]"
                          >
                            <Image
                              src={wikimediaSizedSrc(im.imageUrl, 80, uo)}
                              alt=""
                              fill
                              sizes="80px"
                              className="object-cover transition duration-300 group-hover:scale-[1.03]"
                              quality={60}
                              loading="lazy"
                              decoding="async"
                              unoptimized={uo}
                            />
                          </div>
                        );
                        })}
                        {extraImg > 0 ? (
                          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/[0.04] text-xs font-medium text-slate-400 ring-1 ring-white/[0.06] sm:h-[4.5rem] sm:w-[4.5rem]">
                            +{extraImg}
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-yellow-400/70 sm:text-[11px]">
                            {explore.weekHeading.replace("{n}", String(week.weekNumber))}
                          </p>
                          <p className="mt-1.5 text-base font-semibold text-white transition group-hover:text-yellow-200/95 sm:mt-1.5 sm:text-lg">
                            {week.title ||
                              explore.weekHeading.replace("{n}", String(week.weekNumber))}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-500 sm:gap-2 sm:text-[11px]">
                          <span className="rounded-full border border-white/[0.05] bg-white/[0.03] px-2 py-0.5 sm:px-2.5 sm:py-1">
                            {week.images.length} {dict.diaries.images}
                          </span>
                          <span className="rounded-full border border-white/[0.05] bg-white/[0.03] px-2 py-0.5 sm:px-2.5 sm:py-1">
                            {week.likeCount} {dict.diaries.likes}
                          </span>
                          <span className="rounded-full border border-white/[0.05] bg-white/[0.03] px-2 py-0.5 sm:px-2.5 sm:py-1">
                            {week.commentCount} {dict.diaries.comments}
                          </span>
                        </div>
                      </div>

                      <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-slate-500 sm:text-sm sm:leading-relaxed">
                        {week.description}
                      </p>

                      <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-yellow-400/80 transition group-hover:text-yellow-300 sm:text-xs">
                        {dict.diaries.viewWeek}
                        <span aria-hidden className="translate-x-0 transition group-hover:translate-x-0.5">
                          →
                        </span>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.06] bg-slate-950/25 p-5 sm:rounded-3xl sm:p-7">
        <h2 className="text-base font-semibold tracking-tight text-white sm:text-lg">
          {dict.diaries.diaryDiscussionTitle}
        </h2>
        <div className="mt-4 space-y-3 sm:space-y-4">
          {diary.diaryComments.map((c) => (
            <div key={c.id} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3.5 sm:p-4">
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
                      className="text-sm font-semibold text-white hover:text-yellow-300"
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

        <div className="mt-6 border-t border-white/[0.06] pt-5">
          <DiaryCommentForm
            diarySlug={diary.slug}
            postComment={explore.postComment}
            commentPlaceholder={explore.commentPlaceholder}
            loginToComment={explore.loginToComment}
            posting={explore.posting}
            couldNotPost={explore.couldNotPost}
            networkError={explore.networkError}
            isLoggedIn={Boolean(sessionUser)}
          />
        </div>
      </section>
    </div>
  );
}
