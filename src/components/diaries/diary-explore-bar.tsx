import Link from "next/link";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import {
  DiaryEnvironment,
  DiaryFlowerType,
  DiaryGerminationMethod,
  DiaryGrowPhase,
  DiarySubstrateMedium,
  DiaryWateringType,
} from "@prisma/client";
import type { DiarySortKey, ListDiariesFilters, PublicDiaryFilterCounts } from "@/lib/diary-data";
import { diaryExploreMediumKeys } from "@/lib/diary-explore-params";
import { getDiaryLabels } from "@/lib/diary-labels";
import type { Locale } from "@/lib/i18n";

type ExploreDict = {
  sortLabel: string;
  sortUpdated: string;
  sortCreated: string;
  sortLikes: string;
  filtersTitle: string;
  clearFilters: string;
  quickFiltersLabel: string;
  filterGermination: string;
  filterWatering: string;
  filterMedium: string;
  filterEnvironment: string;
  all: string;
};

type Props = {
  basePath: string;
  sort: DiarySortKey;
  filters: ListDiariesFilters;
  page: number;
  locale: Locale;
  dict: ExploreDict;
  counts: PublicDiaryFilterCounts;
};

function buildQuery(
  basePath: string,
  sort: DiarySortKey,
  filters: ListDiariesFilters,
  page: number,
  patch: Partial<{
    sort: DiarySortKey | null;
    germinationMethod: DiaryGerminationMethod | null;
    watering: DiaryWateringType | null;
    medium: DiarySubstrateMedium | null;
    environment: DiaryEnvironment | null;
    growPhase: DiaryGrowPhase | null;
    flowerType: DiaryFlowerType | null;
    page: number | null;
  }>,
) {
  const nextSort: DiarySortKey =
    patch.sort !== undefined ? (patch.sort ?? "updated") : sort;
  const nextFilters = { ...filters };
  if (patch.germinationMethod !== undefined) {
    if (patch.germinationMethod === null) {
      delete nextFilters.germinationMethod;
    } else {
      nextFilters.germinationMethod = patch.germinationMethod;
    }
  }
  if (patch.watering !== undefined) {
    if (patch.watering === null) {
      delete nextFilters.watering;
    } else {
      nextFilters.watering = patch.watering;
    }
  }
  if (patch.medium !== undefined) {
    if (patch.medium === null) {
      delete nextFilters.medium;
    } else {
      nextFilters.medium = patch.medium;
    }
  }
  if (patch.environment !== undefined) {
    if (patch.environment === null) {
      delete nextFilters.environment;
    } else {
      nextFilters.environment = patch.environment;
    }
  }
  if (patch.growPhase !== undefined) {
    if (patch.growPhase === null) {
      delete nextFilters.growPhase;
    } else {
      nextFilters.growPhase = patch.growPhase;
    }
  }
  if (patch.flowerType !== undefined) {
    if (patch.flowerType === null) {
      delete nextFilters.flowerType;
    } else {
      nextFilters.flowerType = patch.flowerType;
    }
  }

  const filterTouched =
    patch.sort !== undefined ||
    patch.germinationMethod !== undefined ||
    patch.watering !== undefined ||
    patch.medium !== undefined ||
    patch.environment !== undefined ||
    patch.growPhase !== undefined ||
    patch.flowerType !== undefined;

  let nextPage = page;
  if (patch.page !== undefined) {
    nextPage = patch.page === null ? 1 : patch.page;
  } else if (filterTouched) {
    nextPage = 1;
  }

  const p = new URLSearchParams();
  if (nextSort !== "updated") {
    p.set("sort", nextSort);
  }
  if (nextFilters.germinationMethod) {
    p.set("germinationMethod", nextFilters.germinationMethod);
  }
  if (nextFilters.watering) {
    p.set("watering", nextFilters.watering);
  }
  if (nextFilters.medium) {
    p.set("medium", nextFilters.medium);
  }
  if (nextFilters.environment) {
    p.set("environment", nextFilters.environment);
  }
  if (nextFilters.growPhase) {
    p.set("growPhase", nextFilters.growPhase);
  }
  if (nextFilters.flowerType) {
    p.set("flowerType", nextFilters.flowerType);
  }
  if (nextPage > 1) {
    p.set("page", String(nextPage));
  }
  const qs = p.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function ChipLink({
  href,
  active,
  children,
  className = "",
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-lg border px-2 py-1 text-[10px] font-medium leading-tight transition sm:rounded-full sm:px-3 sm:py-1.5 sm:text-xs ${
        active
          ? "border-yellow-400/35 bg-yellow-500/[0.14] text-yellow-100 shadow-[inset_0_1px_0_0_rgba(250,204,21,0.07)] [&_span.tabular-nums]:text-yellow-200/75"
          : "border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/18 hover:bg-white/[0.07] hover:text-slate-200"
      } ${className}`}
    >
      {children}
    </Link>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 w-full">
      <p className="mb-1 text-[9px] font-medium uppercase tracking-[0.14em] text-slate-500 sm:mb-1.5 sm:text-[10px] sm:tracking-[0.15em]">
        {label}
      </p>
      <div className="-mx-1 flex w-full min-w-0 flex-nowrap gap-1 overflow-x-auto overflow-y-visible px-1 py-0.5 [-webkit-overflow-scrolling:touch] pb-2 touch-pan-x [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.35)_transparent] sm:mx-0 sm:max-h-[7.5rem] sm:flex-wrap sm:overflow-x-visible sm:overflow-y-auto sm:pb-0 sm:pr-1">
        {children}
      </div>
    </div>
  );
}

function QuickFilterStrip(props: Props) {
  const { basePath, sort, filters, page, dict, counts, locale } = props;
  const L = getDiaryLabels(locale);
  const quickAllActive =
    !filters.growPhase && !filters.flowerType && !filters.environment;

  const c = (n: number) => (
    <span className="ml-0.5 tabular-nums text-slate-500">{n}</span>
  );

  return (
    <div className="w-full min-w-0">
      <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.16em] text-slate-500 sm:text-[10px]">
        {dict.quickFiltersLabel}
      </p>
      <div className="-mx-1 flex w-full min-w-0 flex-nowrap gap-1.5 overflow-x-auto overflow-y-visible px-1 pb-1 [-webkit-overflow-scrolling:touch] touch-pan-x [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.4)_transparent]">
        <ChipLink
          href={buildQuery(basePath, sort, filters, page, {
            growPhase: null,
            flowerType: null,
            environment: null,
            page: 1,
          })}
          active={quickAllActive}
        >
          <span className="inline-flex items-baseline gap-1">
            {dict.all}
            {c(counts.total)}
          </span>
        </ChipLink>
        <ChipLink
          href={buildQuery(basePath, sort, filters, page, { growPhase: "GROWING", page: 1 })}
          active={filters.growPhase === "GROWING"}
        >
          <span className="inline-flex items-baseline gap-1">
            {L.growPhase.GROWING}
            {c(counts.growing)}
          </span>
        </ChipLink>
        <ChipLink
          href={buildQuery(basePath, sort, filters, page, { growPhase: "HARVESTED", page: 1 })}
          active={filters.growPhase === "HARVESTED"}
        >
          <span className="inline-flex items-baseline gap-1">
            {L.growPhase.HARVESTED}
            {c(counts.harvested)}
          </span>
        </ChipLink>
        <ChipLink
          href={buildQuery(basePath, sort, filters, page, { flowerType: "AUTOFLOWER", page: 1 })}
          active={filters.flowerType === "AUTOFLOWER"}
        >
          <span className="inline-flex items-baseline gap-1">
            {L.flowerType.AUTOFLOWER}
            {c(counts.autoFlower)}
          </span>
        </ChipLink>
        <ChipLink
          href={buildQuery(basePath, sort, filters, page, { flowerType: "PHOTOPERIOD", page: 1 })}
          active={filters.flowerType === "PHOTOPERIOD"}
        >
          <span className="inline-flex items-baseline gap-1">
            {L.flowerType.PHOTOPERIOD}
            {c(counts.photoPeriod)}
          </span>
        </ChipLink>
        <ChipLink
          href={buildQuery(basePath, sort, filters, page, { environment: "INDOOR", page: 1 })}
          active={filters.environment === "INDOOR"}
        >
          <span className="inline-flex items-baseline gap-1">
            {L.environment.INDOOR}
            {c(counts.indoor)}
          </span>
        </ChipLink>
        <ChipLink
          href={buildQuery(basePath, sort, filters, page, { environment: "OUTDOOR", page: 1 })}
          active={filters.environment === "OUTDOOR"}
        >
          <span className="inline-flex items-baseline gap-1">
            {L.environment.OUTDOOR}
            {c(counts.outdoor)}
          </span>
        </ChipLink>
        <ChipLink
          href={buildQuery(basePath, sort, filters, page, { environment: "GREENHOUSE", page: 1 })}
          active={filters.environment === "GREENHOUSE"}
        >
          <span className="inline-flex items-baseline gap-1">
            {L.environment.GREENHOUSE}
            {c(counts.greenhouse)}
          </span>
        </ChipLink>
      </div>
    </div>
  );
}

/** Sort — minimal segmented control between filter bar and diary grid. */
export function DiarySortBar({
  basePath,
  sort,
  filters,
  page,
  dict,
}: Pick<Props, "basePath" | "sort" | "filters" | "page"> & {
  dict: ExploreDict;
}) {
  const sortOptions: { key: DiarySortKey; label: string }[] = [
    { key: "updated", label: dict.sortUpdated },
    { key: "created", label: dict.sortCreated },
    { key: "likes", label: dict.sortLikes },
  ];

  return (
    <div
      role="group"
      aria-label={dict.sortLabel}
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
    >
      <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
        {dict.sortLabel}
      </span>
      <div className="min-w-0 overflow-x-auto [-webkit-overflow-scrolling:touch] [scrollbar-width:none] sm:overflow-visible [&::-webkit-scrollbar]:hidden">
        <div className="inline-flex rounded-full p-0.5 ring-1 ring-white/[0.06] bg-slate-950/40 backdrop-blur-sm">
          {sortOptions.map((opt) => {
            const href = buildQuery(basePath, sort, filters, page, { sort: opt.key, page: 1 });
            const active = sort === opt.key;
            return (
              <Link
                key={opt.key}
                href={href}
                className={`relative whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold transition-[color,background-color,box-shadow,ring-color] sm:px-4 sm:py-2 sm:text-xs ${
                  active
                    ? "bg-yellow-500/[0.16] text-yellow-100 ring-1 ring-yellow-400/20 hover:bg-yellow-500/[0.22]"
                    : "font-medium text-slate-500 hover:text-slate-300"
                }`}
              >
                {opt.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FilterSections({
  basePath,
  sort,
  filters,
  page,
  dict,
  locale,
}: Omit<Props, "counts">) {
  const L = getDiaryLabels(locale);
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-x-5 lg:grid-cols-4 lg:gap-4">
      <FilterRow label={dict.filterGermination}>
        <ChipLink
          href={buildQuery(basePath, sort, filters, page, { germinationMethod: null, page: 1 })}
          active={!filters.germinationMethod}
        >
          {dict.all}
        </ChipLink>
        {(Object.keys(L.germination) as DiaryGerminationMethod[]).map((key) => (
          <ChipLink
            key={key}
            href={buildQuery(basePath, sort, filters, page, { germinationMethod: key, page: 1 })}
            active={filters.germinationMethod === key}
          >
            {L.germination[key]}
          </ChipLink>
        ))}
      </FilterRow>
      <FilterRow label={dict.filterWatering}>
        <ChipLink
          href={buildQuery(basePath, sort, filters, page, { watering: null, page: 1 })}
          active={!filters.watering}
        >
          {dict.all}
        </ChipLink>
        {(Object.keys(L.watering) as DiaryWateringType[]).map((key) => (
          <ChipLink
            key={key}
            href={buildQuery(basePath, sort, filters, page, { watering: key, page: 1 })}
            active={filters.watering === key}
          >
            {L.watering[key]}
          </ChipLink>
        ))}
      </FilterRow>
      <FilterRow label={dict.filterMedium}>
        <ChipLink
          href={buildQuery(basePath, sort, filters, page, { medium: null, page: 1 })}
          active={!filters.medium}
        >
          {dict.all}
        </ChipLink>
        {diaryExploreMediumKeys.map((key) => (
          <ChipLink
            key={key}
            href={buildQuery(basePath, sort, filters, page, { medium: key, page: 1 })}
            active={filters.medium === key}
          >
            {L.medium[key]}
          </ChipLink>
        ))}
      </FilterRow>
      <FilterRow label={dict.filterEnvironment}>
        <ChipLink
          href={buildQuery(basePath, sort, filters, page, { environment: null, page: 1 })}
          active={!filters.environment}
        >
          {dict.all}
        </ChipLink>
        {(Object.keys(L.environment) as DiaryEnvironment[]).map((key) => (
          <ChipLink
            key={key}
            href={buildQuery(basePath, sort, filters, page, { environment: key, page: 1 })}
            active={filters.environment === key}
          >
            {L.environment[key]}
          </ChipLink>
        ))}
      </FilterRow>
    </div>
  );
}

export function DiaryExploreBar(props: Props) {
  const { basePath, sort, filters, page, dict } = props;

  const activeCount = [
    filters.germinationMethod,
    filters.watering,
    filters.medium,
    filters.environment,
    filters.growPhase,
    filters.flowerType,
  ].filter(Boolean).length;

  const clearAllHref = buildQuery(basePath, sort, filters, page, {
    germinationMethod: null,
    watering: null,
    medium: null,
    environment: null,
    growPhase: null,
    flowerType: null,
    page: 1,
  });

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950/50 p-3 sm:p-4 lg:rounded-[1.35rem] lg:p-5">
      <QuickFilterStrip {...props} />

      {/* Advanced filters — collapsible on all breakpoints (avoids overwhelming desktop) */}
      <details className="mt-3 border-t border-white/[0.06] pt-3 open:[&_summary_.chevron-btn]:rotate-180">
        <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border border-white/[0.09] bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-slate-950 px-2.5 py-2 text-left shadow-[0_6px_24px_-14px_rgba(0,0,0,0.55)] ring-1 ring-inset ring-white/[0.04] transition hover:border-yellow-400/25 hover:ring-yellow-400/15 [&::-webkit-details-marker]:hidden sm:gap-2.5 sm:px-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-yellow-400/25 bg-yellow-500/[0.14] text-yellow-200 shadow-[inset_0_1px_0_0_rgba(250,204,21,0.08)] sm:h-9 sm:w-9 sm:rounded-[10px]">
            <SlidersHorizontal className="h-4 w-4 text-yellow-200/95" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-semibold leading-tight tracking-tight text-white">
                {dict.filtersTitle}
              </span>
              {activeCount > 0 ? (
                <span className="inline-flex min-w-[1.125rem] items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-500/[0.18] px-1.5 py-px text-[10px] font-bold tabular-nums leading-none text-yellow-100 sm:text-[11px]">
                  {activeCount}
                </span>
              ) : null}
            </div>
          </div>
          <span className="chevron-btn flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-slate-400 transition-transform duration-300 ease-out hover:bg-white/[0.09] hover:text-slate-300 sm:h-8 sm:w-8">
            <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
          </span>
        </summary>
        {activeCount > 0 ? (
          <div className="mt-2 flex justify-end px-0.5">
            <Link
              href={clearAllHref}
              className="rounded-full px-2 py-1 text-[11px] font-medium text-yellow-300/95 underline-offset-2 hover:text-yellow-200 hover:underline"
            >
              {dict.clearFilters}
            </Link>
          </div>
        ) : null}
        <div className="mt-3 max-h-[min(55vh,22rem)] min-h-0 w-full min-w-0 overflow-y-auto overflow-x-hidden overscroll-contain rounded-xl border border-white/[0.06] bg-black/20 p-3 pr-2 shadow-inner lg:max-h-none lg:overflow-y-visible lg:overflow-x-visible">
          <FilterSections
            basePath={basePath}
            sort={sort}
            filters={filters}
            page={page}
            dict={dict}
            locale={props.locale}
          />
        </div>
      </details>
    </section>
  );
}
