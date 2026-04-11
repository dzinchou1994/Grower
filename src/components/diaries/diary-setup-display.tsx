import type { LucideIcon } from "lucide-react";
import { ChevronDown, CookingPot, Droplets, Filter, Lightbulb, Square, Wind, Wrench } from "lucide-react";
import type { DiarySetup } from "@/lib/diary-setup";
import { diarySetupHasContent } from "@/lib/diary-setup";
import type { DiarySetupDict } from "@/components/diaries/diary-setup-fields";

function ListSection({
  title,
  items,
  icon: Icon,
  accentClass,
}: {
  title: string;
  items: string[];
  icon: LucideIcon;
  accentClass: string;
}) {
  if (items.length === 0) {
    return null;
  }
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-4 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.45)] transition hover:border-white/[0.1] hover:shadow-[0_8px_32px_-16px_rgba(74,222,128,0.06)] sm:p-5"
    >
      <div
        className={`pointer-events-none absolute inset-y-2 left-0 w-0.5 rounded-full bg-gradient-to-b ${accentClass} opacity-90`}
        aria-hidden
      />
      <div className="flex items-start gap-2 sm:gap-3">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-lime-400/15 via-emerald-500/10 to-slate-900/40 shadow-[inset_0_1px_0_0_rgba(190,242,100,0.12)] ring-1 ring-lime-400/20">
          <Icon className="h-2.5 w-2.5 text-lime-200/90" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1.5">
            <h3 className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.14em] text-lime-400/80 sm:text-[10px] sm:tracking-[0.16em]">
              {title}
            </h3>
            {items.map((s, i) => (
              <span
                key={i}
                className="inline-flex max-w-full rounded-md border border-white/[0.07] bg-slate-950/50 px-2 py-1 text-[11px] leading-snug text-slate-100 ring-1 ring-white/[0.03] backdrop-blur-sm sm:text-xs"
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
}: {
  setup: DiarySetup;
  labels: DiarySetupDict;
  subs: { name: string }[];
  gridClassName: string;
}) {
  return (
    <div className={gridClassName}>
      <ListSection
        title={labels.tents}
        items={setup.tents}
        icon={Square}
        accentClass="from-lime-400/80 to-emerald-600/40"
      />
      <ListSection
        title={labels.lights}
        items={setup.lights}
        icon={Lightbulb}
        accentClass="from-amber-300/70 to-orange-500/30"
      />
      <ListSection
        title={labels.fans}
        items={setup.fans}
        icon={Wind}
        accentClass="from-cyan-400/60 to-sky-600/35"
      />
      <ListSection
        title={labels.airFilters}
        items={setup.airFilters}
        icon={Filter}
        accentClass="from-slate-400/70 to-slate-600/40"
      />
      {subs.length > 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-lime-400/15 bg-gradient-to-br from-lime-400/[0.06] via-slate-950/40 to-transparent p-4 sm:col-span-2 sm:p-5">
          <div className="pointer-events-none absolute -right-8 top-0 h-24 w-24 rounded-full bg-lime-400/10 blur-2xl" aria-hidden />
          <div className="relative flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-lime-400/25 to-emerald-900/40 ring-1 ring-lime-400/25">
              <CookingPot className="h-2.5 w-2.5 text-lime-200/90" strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1.5">
                <h3 className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.14em] text-lime-300/85 sm:text-[10px] sm:tracking-[0.16em]">
                  {labels.substrates}
                </h3>
                {subs.map((r, i) => (
                  <span
                    key={i}
                    className="inline-flex max-w-full rounded-md border border-lime-400/15 bg-slate-950/60 px-2 py-1 text-[11px] leading-snug text-slate-100 sm:text-xs"
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
      />
    </div>
  );
}

export function DiarySetupDisplay({
  setup,
  labels,
}: {
  setup: DiarySetup;
  labels: DiarySetupDict;
}) {
  if (!diarySetupHasContent(setup)) {
    return null;
  }

  const subs = setup.substrates.filter((r) => r.name.trim().length > 0);

  return (
    <>
      {/* Mobile: collapsible — same interaction pattern as diary overview */}
      <details className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.04] to-transparent shadow-[0_8px_32px_-20px_rgba(0,0,0,0.5)] backdrop-blur-sm lg:hidden open:border-lime-400/20 open:shadow-[0_12px_40px_-16px_rgba(74,222,128,0.08)]">
        <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl px-3 py-3 transition hover:bg-white/[0.03] [&::-webkit-details-marker]:hidden sm:gap-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-lime-400/25 via-emerald-500/10 to-slate-900/50 shadow-[inset_0_1px_0_0_rgba(190,242,100,0.15)] ring-1 ring-lime-400/25">
            <Wrench className="h-2.5 w-2.5 text-lime-200/90" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-[15px] font-semibold tracking-tight text-white sm:text-base">
              {labels.sectionTitle}
            </p>
          </div>
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-black/30 text-slate-400 transition group-open:border-lime-400/25 group-open:bg-lime-400/10 group-open:text-lime-200">
            <ChevronDown
              className="h-2.5 w-2.5 transition duration-300 group-open:rotate-180"
              strokeWidth={2.25}
              aria-hidden
            />
          </span>
        </summary>
        <div className="border-t border-white/[0.05] px-3.5 pb-3.5 pt-3">
          <SetupGrid
            setup={setup}
            labels={labels}
            subs={subs}
            gridClassName="grid gap-3 sm:grid-cols-2 sm:gap-4"
          />
        </div>
      </details>

      {/* Desktop: always expanded */}
      <section className="relative hidden overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-slate-950/90 via-slate-900/50 to-emerald-950/20 p-5 shadow-[0_12px_48px_-28px_rgba(0,0,0,0.65)] sm:rounded-[2rem] sm:p-8 lg:block">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime-400/30 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 -top-24 h-48 w-48 rounded-full bg-lime-400/[0.07] blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-emerald-600/[0.06] blur-3xl"
          aria-hidden
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-lime-400/25 via-emerald-500/15 to-slate-900/50 shadow-[inset_0_1px_0_0_rgba(190,242,100,0.2)] ring-1 ring-lime-400/25 sm:h-7 sm:w-7">
              <Wrench className="h-3 w-3 text-lime-200/90 sm:h-3.5 sm:w-3.5" strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <h2 className="text-base font-semibold uppercase tracking-[0.14em] text-white sm:text-lg sm:tracking-[0.16em]">
                {labels.sectionTitle}
              </h2>
            </div>
          </div>
        </div>

        <SetupGrid
          setup={setup}
          labels={labels}
          subs={subs}
          gridClassName="relative mt-7 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5"
        />
      </section>
    </>
  );
}
