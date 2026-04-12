import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { Locale as DateFnsLocale } from "date-fns";
import { Clock, Heart, MessageCircle } from "lucide-react";
import type { DiaryListItem } from "@/lib/diary-data";
import { formatDistanceDisplayKa } from "@/lib/format-distance-ka";
import { getLocalizedPath, type Locale } from "@/lib/i18n";
import { preferUnoptimizedRemoteImage } from "@/lib/remote-image";
import { wikimediaSrcForSlot } from "@/lib/wikimedia-thumb";

export type DiaryExploreCardCopy = {
  relativeWeeks: string;
  strainsMore: string;
  likes: string;
  comments: string;
};

type Props = {
  diary: DiaryListItem;
  typedLocale: Locale;
  dateFnsLocale: DateFnsLocale;
  explore: DiaryExploreCardCopy;
  /** Passed to listing images; defaults to explore grid breakpoints. */
  imageSizes?: string;
};

export function DiaryExploreCard({
  diary,
  typedLocale,
  dateFnsLocale,
  explore,
  imageSizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
}: Props) {
  const extraStrains = Math.max(0, diary.strains.length - 1);
  const rel = formatDistanceDisplayKa(
    formatDistanceToNow(diary.updatedAt, {
      addSuffix: true,
      locale: dateFnsLocale,
    }),
    typedLocale,
  );
  const diaryHref = getLocalizedPath(typedLocale, `/diaries/${diary.slug}`);
  const preview = diary.previewImageUrls[0];
  const previewUnopt = preview ? preferUnoptimizedRemoteImage(preview) : false;
  const metaRow = (
    <div
      className={`mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-2.5 text-[10px] sm:gap-x-4 sm:pt-3 sm:text-[11px] ${
        preview
          ? "border-white/15 text-white/85 [text-shadow:0_1px_2px_rgba(0,0,0,0.65)]"
          : "border-white/[0.06] text-slate-400"
      }`}
      role="group"
      aria-label={`${rel} · ${diary.totalLikes} ${explore.likes} · ${diary.totalComments} ${explore.comments}`}
    >
      <span className="inline-flex items-center gap-1" title={rel}>
        <Clock
          className={`h-3.5 w-3.5 shrink-0 ${preview ? "text-white/60" : "text-slate-500"}`}
          strokeWidth={2}
          aria-hidden
        />
        <span className={`tabular-nums ${preview ? "text-white/90" : "text-slate-400"}`}>{rel}</span>
      </span>
      <span className="inline-flex items-center gap-1" title={`${diary.totalLikes} ${explore.likes}`}>
        <Heart
          className={`h-3.5 w-3.5 shrink-0 ${preview ? "text-white/55" : "text-slate-400"}`}
          strokeWidth={2}
          aria-hidden
        />
        <span className={`tabular-nums ${preview ? "text-white/90" : "text-slate-300"}`}>
          {diary.totalLikes}
        </span>
      </span>
      <span className="inline-flex items-center gap-1" title={`${diary.totalComments} ${explore.comments}`}>
        <MessageCircle
          className={`h-3.5 w-3.5 shrink-0 ${preview ? "text-white/55" : "text-slate-400"}`}
          strokeWidth={2}
          aria-hidden
        />
        <span className={`tabular-nums ${preview ? "text-white/90" : "text-slate-300"}`}>
          {diary.totalComments}
        </span>
      </span>
    </div>
  );

  return (
    <article className="h-full min-h-0">
      <Link
        href={diaryHref}
        className="group flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-950/65 text-left shadow-[0_12px_40px_-16px_rgba(0,0,0,0.65)] transition hover:border-yellow-400/35 hover:shadow-[0_16px_44px_-12px_rgba(0,0,0,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400/50 sm:rounded-2xl"
      >
        {preview ? (
          <div className="relative aspect-[3/4] w-full min-h-[13rem] overflow-hidden sm:aspect-[4/5] sm:min-h-[15rem]">
            {/* 960px Commons thumb: same as diary cover; 640px is missing for some files */}
            <Image
              src={wikimediaSrcForSlot(preview, previewUnopt, 960)}
              alt=""
              fill
              sizes={imageSizes}
              quality={65}
              loading="lazy"
              decoding="async"
              className="object-cover transition duration-500 ease-out group-hover:scale-[1.035]"
              unoptimized={previewUnopt}
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[62%] min-h-[12rem] w-full bg-gradient-to-t from-black via-black/92 to-transparent sm:min-h-[13.5rem]"
              aria-hidden
            />
            <span className="absolute right-2 top-2 z-[2] rounded-full border border-white/10 bg-black/50 px-2 py-0.5 text-[9px] font-medium tabular-nums text-white shadow-sm backdrop-blur-sm sm:right-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[10px]">
              {explore.relativeWeeks.replace("{n}", String(diary.weekCount))}
            </span>
            <div className="absolute inset-x-0 bottom-0 z-[2] flex min-h-0 flex-col p-3 sm:p-4">
              <p className="line-clamp-2 text-[9px] font-medium uppercase leading-tight tracking-[0.12em] text-yellow-200 [text-shadow:0_1px_2px_rgba(0,0,0,1)] sm:text-[10px] sm:tracking-[0.18em]">
                {diary.strain}
                {extraStrains > 0
                  ? ` · ${explore.strainsMore.replace("{count}", String(extraStrains))}`
                  : ""}
              </p>
              <h2 className="mt-1 line-clamp-2 text-[13px] font-semibold uppercase leading-snug text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.95)] sm:mt-1.5 sm:text-base sm:leading-tight">
                {diary.title}
              </h2>
              <p className="mt-1 truncate text-[10px] text-white sm:text-[11px]">@{diary.author.username}</p>
              {metaRow}
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-5 lg:p-3.5">
            <div className="flex items-start justify-between gap-1.5 sm:gap-3">
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[9px] uppercase leading-tight tracking-[0.12em] text-yellow-300/95 sm:text-[10px] sm:tracking-[0.2em] lg:line-clamp-1 lg:text-[9px]">
                  {diary.strain}
                  {extraStrains > 0
                    ? ` · ${explore.strainsMore.replace("{count}", String(extraStrains))}`
                    : ""}
                </p>
                <h2 className="mt-1 line-clamp-2 text-sm font-semibold uppercase leading-snug text-white sm:mt-1.5 sm:text-xl sm:leading-tight lg:line-clamp-2 lg:text-[13px] lg:leading-snug">
                  {diary.title}
                </h2>
                <p className="mt-1.5 truncate text-[10px] text-slate-500 sm:mt-2 sm:text-[11px]">
                  @{diary.author.username}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-white/6 px-1.5 py-0.5 text-[9px] tabular-nums text-slate-300 sm:px-2.5 sm:py-1 sm:text-[10px] lg:px-1.5 lg:text-[9px]">
                {explore.relativeWeeks.replace("{n}", String(diary.weekCount))}
              </span>
            </div>
            {metaRow}
          </div>
        )}
      </Link>
    </article>
  );
}
