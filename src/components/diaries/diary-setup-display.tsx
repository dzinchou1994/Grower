import type { LucideIcon } from "lucide-react";
import { ChevronDown, CookingPot, Droplets, Filter, Lightbulb, Square, Wind, Wrench } from "lucide-react";
import type { DiarySetupDict } from "@/components/diaries/diary-setup-fields";
import { notoSansGeorgian } from "@/lib/fonts/noto-sans-georgian";
import { hasGeorgianScript, toMtavruli } from "@/lib/georgian-mtavruli";
import type { DiarySetup } from "@/lib/diary-setup";
import { diarySetupHasContent } from "@/lib/diary-setup";
import type { Locale } from "@/lib/i18n";

function setupHeadingClass(locale: Locale, extra: string) {
  return locale === "ka" ? `${extra} ${notoSansGeorgian.className}` : `${extra} uppercase`;
}

function setupHeadingText(locale: Locale, text: string) {
  return locale === "ka" ? toMtavruli(text) : text;
}

function ListSection({
  title,
  items,
  icon: Icon,
  accentClass,
  locale,
  plain,
}: {
  title: string;
  items: string[];
  icon: LucideIcon;
  accentClass: string;
  locale: Locale;
  plain?: boolean;
}) {
  if (items.length === 0) {
    return null;
  }
  return (
    <div
      className={
        plain
          ? "relative rounded-xl border border-white/[0.06] bg-slate-950/55 p-3"
          : "relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-4 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.45)] transition hover:border-white/[0.1] hover:shadow-[0_8px_32px_-16px_rgba(250,204,21,0.06)] sm:p-5"
      }
    >
      <div
        className={`pointer-events-none absolute inset-y-2 left-0 w-0.5 rounded-full bg-gradient-to-b ${accentClass} opacity-90`}
        aria-hidden
      />
      <div className="flex items-start gap-2 sm:gap-3">
        <span
          className={
            plain
              ? "flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-yellow-400/10 ring-1 ring-yellow-400/20"
              : "flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-yellow-400/15 via-amber-500/10 to-slate-900/40 shadow-[inset_0_1px_0_0_rgba(250,204,21,0.12)] ring-1 ring-yellow-400/20"
          }
        >
          <Icon className="h-2.5 w-2.5 text-yellow-200/90" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1.5">
            <h3
              className={setupHeadingClass(
                locale,
                plain
                  ? "shrink-0 text-[9px] font-semibold tracking-[0.14em] text-yellow-400/75"
                  : "shrink-0 text-[9px] font-semibold tracking-[0.14em] text-yellow-400/80 sm:text-[10px] sm:tracking-[0.16em]",
              )}
            >
              {setupHeadingText(locale, title)}
            </h3>
            {items.map((s, i) => (
              <span
                key={i}
                className={
                  plain
                    ? "inline-flex max-w-full rounded-md border border-white/[0.08] bg-slate-900/75 px-2 py-1 text-[11px] leading-snug text-slate-100 sm:text-xs"
                    : "inline-flex max-w-full rounded-md border border-white/[0.07] bg-slate-950/50 px-2 py-1 text-[11px] leading-snug text-slate-100 ring-1 ring-white/[0.03] backdrop-blur-sm sm:text-xs"
                }
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SetupGrid({
  setup,
  labels,
  subs,
  gridClassName,
  locale,
  plain,
}: {
  setup: DiarySetup;
  labels: DiarySetupDict;
  subs: { name: string }[];
  gridClassName: string;
  locale: Locale;
  plain?: boolean;
}) {
  return (
    <div className={gridClassName}>
      <ListSection
        title={labels.tents}
        items={setup.tents}
        icon={Square}
        accentClass="from-yellow-400/80 to-amber-600/40"
        locale={locale}
        plain={plain}
      />
      <ListSection
        title={labels.lights}
        items={setup.lights}
        icon={Lightbulb}
        accentClass="from-amber-300/70 to-orange-500/30"
        locale={locale}
        plain={plain}
      />
      <ListSection
        title={labels.fans}
        items={setup.fans}
        icon={Wind}
        accentClass="from-cyan-400/60 to-sky-600/35"
        locale={locale}
        plain={plain}
      />
      <ListSection
        title={labels.airFilters}
        items={setup.airFilters}
        icon={Filter}
        accentClass="from-slate-400/70 to-slate-600/40"
        locale={locale}
        plain={plain}
      />
      {subs.length > 0 ? (
        <div
          className={
            plain
              ? "rounded-xl border border-yellow-400/12 bg-slate-950/55 p-3 sm:col-span-2"
              : "relative overflow-hidden rounded-2xl border border-yellow-400/15 bg-gradient-to-br from-yellow-400/[0.06] via-slate-950/40 to-transparent p-4 sm:col-span-2 sm:p-5"
          }
        >
          {!plain ? (
            <div className="pointer-events-none absolute -right-8 top-0 h-24 w-24 rounded-full bg-yellow-400/10 blur-2xl" aria-hidden />
          ) : null}
          <div className="relative flex items-start gap-3">
            <span
              className={
                plain
                  ? "flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-yellow-400/12 ring-1 ring-yellow-400/22"
                  : "flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-yellow-400/25 to-amber-900/40 ring-1 ring-yellow-400/25"
              }
            >
              <CookingPot className="h-2.5 w-2.5 text-yellow-200/90" strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1.5">
                <h3
                  className={setupHeadingClass(
                    locale,
                    plain
                      ? "shrink-0 text-[9px] font-semibold tracking-[0.14em] text-yellow-300/80"
                      : "shrink-0 text-[9px] font-semibold tracking-[0.14em] text-yellow-300/85 sm:text-[10px] sm:tracking-[0.16em]",
                  )}
                >
                  {setupHeadingText(locale, labels.substrates)}
                </h3>
                {subs.map((r, i) => (
                  <span
                    key={i}
                    className="inline-flex max-w-full rounded-md border border-yellow-400/15 bg-slate-900/75 px-2 py-1 text-[11px] leading-snug text-slate-100 sm:text-xs"
                  >
                    {r.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <ListSection
        title={labels.fertilizers}
        items={setup.fertilizers}
        icon={Droplets}
        accentClass="from-violet-400/55 to-fuchsia-600/35"
        locale={locale}
        plain={plain}
      />
    </div>
  );
}

export function DiarySetupDisplay({
  setup,
  labels,
  locale,
}: {
  setup: DiarySetup;
  labels: DiarySetupDict;
  locale: Locale;
}) {
  if (!diarySetupHasContent(setup)) {
    return null;
  }

  const subs = setup.substrates.filter((r) => r.name.trim().length > 0);
  const setupEyebrowUseMtavruli =
    locale === "ka" && hasGeorgianScript(labels.collapsibleEyebrow);

  return (
    <>
      {/* Mobile: collapsible — same chrome as diary overview `<details>` on the hero card */}
      <details className="group rounded-2xl border border-white/[0.07] bg-gradient-to-br from-slate-950/90 via-white/[0.05] to-transparent shadow-[0_8px_32px_-20px_rgba(0,0,0,0.5)] lg:hidden open:border-yellow-400/20 open:shadow-[0_12px_40px_-16px_rgba(250,204,21,0.08)]">
        <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-white/[0.03] [&::-webkit-details-marker]:hidden">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400/25 via-amber-500/10 to-slate-900/50 shadow-[inset_0_1px_0_0_rgba(250,204,21,0.15)] ring-1 ring-yellow-400/25">
            <Wrench className="h-5 w-5 text-yellow-200/90" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0 flex-1 text-left">
            <p
              className={`text-[9px] font-semibold tracking-[0.2em] text-yellow-400/70 ${
                setupEyebrowUseMtavruli ? notoSansGeorgian.className : "uppercase"
              }`}
            >
              {setupEyebrowUseMtavruli
                ? toMtavruli(labels.collapsibleEyebrow)
                : labels.collapsibleEyebrow}
            </p>
            <p
              className={`mt-0.5 truncate text-[15px] font-semibold tracking-tight text-white ${
                locale === "ka" ? notoSansGeorgian.className : ""
              }`}
            >
              {setupHeadingText(locale, labels.sectionTitle)}
            </p>
            <p className="mt-0.5 truncate text-[11px] font-medium text-slate-400">{labels.hint}</p>
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
          <SetupGrid
            setup={setup}
            labels={labels}
            subs={subs}
            gridClassName="grid gap-2.5 sm:grid-cols-2 sm:gap-3"
            locale={locale}
            plain
          />
        </div>
      </details>

      {/* Desktop: always expanded */}
      <section className="relative hidden overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-slate-950/90 via-slate-900/50 to-amber-950/20 p-5 shadow-[0_12px_48px_-28px_rgba(0,0,0,0.65)] sm:rounded-[2rem] sm:p-8 lg:block">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 -top-24 h-48 w-48 rounded-full bg-yellow-400/[0.07] blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-amber-600/[0.06] blur-3xl"
          aria-hidden
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/25 via-amber-500/15 to-slate-900/50 shadow-[inset_0_1px_0_0_rgba(250,204,21,0.2)] ring-1 ring-yellow-400/25 sm:h-7 sm:w-7">
              <Wrench className="h-3 w-3 text-yellow-200/90 sm:h-3.5 sm:w-3.5" strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <h2
                className={setupHeadingClass(
                  locale,
                  "text-base font-semibold tracking-[0.14em] text-white sm:text-lg sm:tracking-[0.16em]",
                )}
              >
                {setupHeadingText(locale, labels.sectionTitle)}
              </h2>
            </div>
          </div>
        </div>

        <SetupGrid
          setup={setup}
          labels={labels}
          subs={subs}
          gridClassName="relative mt-7 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5"
          locale={locale}
        />
      </section>
    </>
  );
}
