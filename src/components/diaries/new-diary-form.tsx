"use client";

import {
  DiaryEnvironment,
  DiaryFlowerType,
  DiaryGerminationMethod,
  DiaryGrowPhase,
  DiarySubstrateMedium,
  DiaryWateringType,
} from "@prisma/client";
import { ImagePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { diaryExploreMediumKeys } from "@/lib/diary-explore-params";
import { getDiaryLabels } from "@/lib/diary-labels";
import { DiarySetupFields, type DiarySetupDict } from "@/components/diaries/diary-setup-fields";
import {
  emptyDiarySetup,
  toDiarySetupPayload,
  type DiarySetup,
} from "@/lib/diary-setup";
import {
  clearNewDiaryDraft,
  loadNewDiaryDraft,
  saveNewDiaryDraft,
  type NewDiaryDraftState,
} from "@/lib/new-diary-draft-storage";
import { getLocalizedPath, type Locale } from "@/lib/i18n";

const inputClassName =
  "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-xs text-white placeholder:text-slate-500 shadow-sm shadow-black/20 transition focus:border-yellow-400/40 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-yellow-400/15";

const selectClassName =
  "w-full cursor-pointer rounded-xl border border-white/[0.08] bg-[#0a121a] px-4 py-3 text-xs text-white shadow-sm shadow-black/20 transition focus:border-yellow-400/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/15";

const labelClassName = "mb-2 block text-xs font-medium text-slate-400";

type FieldDict = {
  diaryTitle: string;
  strain: string;
  environment: string;
  coverImage: string;
  description: string;
  germinationMethod: string;
  watering: string;
  medium: string;
  growPhase: string;
  flowerType: string;
};

type PlaceholderDict = {
  diaryTitle: string;
  strain: string;
  environment: string;
  diaryDescription: string;
};

type ExploreDict = {
  addStrain: string;
  removeStrain: string;
  breederOptional: string;
  submitCreate: string;
  posting: string;
  uploadHint: string;
  uploadFailed: string;
  coverLastPhotoHint: string;
  chooseFiles: string;
  noFileChosen: string;
  strainRequired: string;
  couldNotCreateDiary: string;
  unexpectedResponse: string;
  networkError: string;
};

export function NewDiaryForm({
  locale,
  fieldDict,
  placeholderDict,
  exploreDict,
  setupDict,
}: {
  locale: Locale;
  fieldDict: FieldDict;
  placeholderDict: PlaceholderDict;
  exploreDict: ExploreDict;
  setupDict: DiarySetupDict;
}) {
  const router = useRouter();
  const labels = useMemo(() => getDiaryLabels(locale), [locale]);
  const [title, setTitle] = useState("");
  const [strains, setStrains] = useState([{ name: "", breeder: "" }]);
  const [setup, setSetup] = useState<DiarySetup>(() => emptyDiarySetup());
  const [environment, setEnvironment] = useState<DiaryEnvironment>("INDOOR");
  const [growPhase, setGrowPhase] = useState<DiaryGrowPhase>("GROWING");
  const [flowerType, setFlowerType] = useState<DiaryFlowerType>("PHOTOPERIOD");
  const [germinationMethod, setGerminationMethod] =
    useState<DiaryGerminationMethod>("OTHER");
  const [watering, setWatering] = useState<DiaryWateringType>("MANUAL");
  const [medium, setMedium] = useState<DiarySubstrateMedium>("SOIL");
  const [description, setDescription] = useState("");
  const [coverFiles, setCoverFiles] = useState<File[]>([]);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputId = useId();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [draftPersistEnabled, setDraftPersistEnabled] = useState(false);

  useEffect(() => {
    const d = loadNewDiaryDraft(locale);
    if (d) {
      setTitle(d.title);
      setStrains(d.strains);
      setSetup(d.setup);
      setEnvironment(d.environment);
      setGrowPhase(d.growPhase);
      setFlowerType(d.flowerType);
      setGerminationMethod(d.germinationMethod);
      setWatering(d.watering);
      setMedium(d.medium);
      setDescription(d.description);
    }
    setDraftPersistEnabled(true);
  }, [locale]);

  useEffect(() => {
    if (!draftPersistEnabled) {
      return;
    }
    const payload: NewDiaryDraftState = {
      title,
      strains,
      setup,
      environment,
      growPhase,
      flowerType,
      germinationMethod,
      watering,
      medium,
      description,
    };
    const id = window.setTimeout(() => {
      saveNewDiaryDraft(locale, payload);
    }, 450);
    return () => window.clearTimeout(id);
  }, [
    draftPersistEnabled,
    locale,
    title,
    strains,
    setup,
    environment,
    growPhase,
    flowerType,
    germinationMethod,
    watering,
    medium,
    description,
  ]);

  function removeCoverAt(index: number) {
    setCoverFiles((prev) => {
      const next = prev.filter((_, j) => j !== index);
      if (next.length === 0 && coverFileInputRef.current) {
        coverFileInputRef.current.value = "";
      }
      return next;
    });
  }

  const coverPreviewUrls = useMemo(
    () => coverFiles.map((file) => URL.createObjectURL(file)),
    [coverFiles],
  );

  useEffect(() => {
    return () => {
      coverPreviewUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [coverPreviewUrls]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const strainPayload = strains
      .map((s) => ({
        name: s.name.trim(),
        breeder: s.breeder.trim() || null,
      }))
      .filter((s) => s.name.length > 0);
    if (strainPayload.length === 0) {
      setError(exploreDict.strainRequired);
      setPending(false);
      return;
    }
    try {
      const uploadedCoverUrls: string[] = [];
      for (let i = 0; i < coverFiles.length; i++) {
        const file = coverFiles[i]!;
        const body = new FormData();
        body.set("file", file);
        const up = await fetch("/api/diaries/cover-image", { method: "POST", body });
        const data = (await up.json().catch(() => ({}))) as { url?: string; error?: string };
        if (!up.ok) {
          setError(data.error ?? exploreDict.uploadFailed);
          setPending(false);
          return;
        }
        if (data.url) {
          uploadedCoverUrls.push(data.url);
        }
      }

      const coverImageUrl =
        uploadedCoverUrls.length > 0 ? uploadedCoverUrls[uploadedCoverUrls.length - 1]! : null;

      const setupPayload = toDiarySetupPayload(setup);
      const res = await fetch("/api/diaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          strains: strainPayload,
          environment,
          growPhase,
          flowerType,
          germinationMethod,
          watering,
          medium,
          description: description.trim() || null,
          coverImageUrl,
          ...(setupPayload ? { setup: setupPayload } : {}),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; slug?: string };
      if (!res.ok) {
        setError(data.error ?? exploreDict.couldNotCreateDiary);
        setPending(false);
        return;
      }
      if (data.slug) {
        clearNewDiaryDraft(locale);
        router.push(getLocalizedPath(locale, `/diaries/${data.slug}`));
        router.refresh();
        return;
      }
      setError(exploreDict.unexpectedResponse);
    } catch {
      setError(exploreDict.networkError);
      setPending(false);
      return;
    }
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 sm:grid-cols-2 sm:gap-7">
      {error ? (
        <div className="sm:col-span-2 rounded-xl border border-rose-500/30 bg-rose-500/[0.08] px-4 py-3 text-xs text-rose-100">
          {error}
        </div>
      ) : null}

      <label className="sm:col-span-2">
        <span className={labelClassName}>{fieldDict.diaryTitle}</span>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClassName}
          placeholder={placeholderDict.diaryTitle}
        />
      </label>

      <div className="sm:col-span-2 space-y-4 rounded-2xl border border-white/[0.06] bg-black/25 p-4 sm:p-5">
        <span className="block text-xs font-medium text-slate-400">{fieldDict.strain}</span>
        {strains.map((row, i) => (
          <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <input
              value={row.name}
              onChange={(e) => {
                const next = [...strains];
                next[i] = { ...next[i]!, name: e.target.value };
                setStrains(next);
              }}
              className={`flex-1 ${inputClassName}`}
              placeholder={placeholderDict.strain}
            />
            <input
              value={row.breeder}
              onChange={(e) => {
                const next = [...strains];
                next[i] = { ...next[i]!, breeder: e.target.value };
                setStrains(next);
              }}
              className={`flex-1 ${inputClassName}`}
              placeholder={exploreDict.breederOptional}
            />
            {strains.length > 1 ? (
              <button
                type="button"
                onClick={() => setStrains(strains.filter((_, j) => j !== i))}
                className="shrink-0 rounded-full border border-white/[0.1] px-3 py-2 text-xs text-slate-400 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-slate-200"
              >
                {exploreDict.removeStrain}
              </button>
            ) : null}
          </div>
        ))}
        {strains.length < 8 ? (
          <button
            type="button"
            onClick={() => setStrains([...strains, { name: "", breeder: "" }])}
            className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-xl border border-yellow-400/25 bg-yellow-400/5 text-lg font-semibold leading-none text-yellow-300/95 transition hover:border-yellow-400/40 hover:bg-yellow-400/10 hover:text-yellow-200"
            aria-label={exploreDict.addStrain}
          >
            +
          </button>
        ) : null}
      </div>

      <label>
        <span className={labelClassName}>{fieldDict.growPhase}</span>
        <select
          value={growPhase}
          onChange={(e) => setGrowPhase(e.target.value as DiaryGrowPhase)}
          className={selectClassName}
        >
          {(Object.keys(labels.growPhase) as DiaryGrowPhase[]).map((k) => (
            <option key={k} value={k}>
              {labels.growPhase[k]}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className={labelClassName}>{fieldDict.flowerType}</span>
        <select
          value={flowerType}
          onChange={(e) => setFlowerType(e.target.value as DiaryFlowerType)}
          className={selectClassName}
        >
          {(Object.keys(labels.flowerType) as DiaryFlowerType[]).map((k) => (
            <option key={k} value={k}>
              {labels.flowerType[k]}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className={labelClassName}>{fieldDict.environment}</span>
        <select
          value={environment}
          onChange={(e) => setEnvironment(e.target.value as DiaryEnvironment)}
          className={selectClassName}
        >
          {(Object.keys(labels.environment) as DiaryEnvironment[]).map((k) => (
            <option key={k} value={k}>
              {labels.environment[k]}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className={labelClassName}>{fieldDict.germinationMethod}</span>
        <select
          value={germinationMethod}
          onChange={(e) => setGerminationMethod(e.target.value as DiaryGerminationMethod)}
          className={selectClassName}
        >
          {(Object.keys(labels.germination) as DiaryGerminationMethod[]).map((k) => (
            <option key={k} value={k}>
              {labels.germination[k]}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className={labelClassName}>{fieldDict.watering}</span>
        <select
          value={watering}
          onChange={(e) => setWatering(e.target.value as DiaryWateringType)}
          className={selectClassName}
        >
          {(Object.keys(labels.watering) as DiaryWateringType[]).map((k) => (
            <option key={k} value={k}>
              {labels.watering[k]}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className={labelClassName}>{fieldDict.medium}</span>
        <select
          value={medium}
          onChange={(e) => setMedium(e.target.value as DiarySubstrateMedium)}
          className={selectClassName}
        >
          {diaryExploreMediumKeys.map((k) => (
            <option key={k} value={k}>
              {labels.medium[k]}
            </option>
          ))}
        </select>
      </label>

      <DiarySetupFields value={setup} onChange={setSetup} setupDict={setupDict} />

      <div className="sm:col-span-2">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <span className={labelClassName}>{fieldDict.coverImage}</span>
          {coverFiles.length > 0 ? (
            <span className="rounded-full border border-lime-400/25 bg-lime-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-lime-200/90">
              {coverFiles.length}
            </span>
          ) : null}
        </div>

        <div className="mb-4 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-3 sm:px-4">
          <p className="text-[11px] leading-relaxed text-slate-400 sm:text-xs">{exploreDict.coverLastPhotoHint}</p>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500 sm:text-xs">{exploreDict.uploadHint}</p>
        </div>

        <input
          id={coverFileInputId}
          ref={coverFileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={(e) => setCoverFiles(Array.from(e.target.files ?? []))}
          className="sr-only"
        />

        <label
          htmlFor={coverFileInputId}
          className={`group relative flex min-h-[9.5rem] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-8 transition sm:min-h-[11rem] sm:gap-4 sm:py-10 ${
            coverFiles.length > 0
              ? "border-lime-400/35 bg-gradient-to-b from-lime-400/[0.07] to-transparent"
              : "border-white/18 bg-gradient-to-b from-white/[0.03] to-transparent hover:border-lime-400/40 hover:from-lime-400/[0.05]"
          } focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-lime-400/35`}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-400/20 via-white/[0.06] to-emerald-950/30 ring-1 ring-white/15 transition group-hover:ring-lime-400/30 sm:h-16 sm:w-16">
            <ImagePlus className="h-7 w-7 text-lime-100/90 sm:h-8 sm:w-8" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="max-w-md text-center">
            <span className="block text-xs font-semibold text-white sm:text-sm">{exploreDict.chooseFiles}</span>
            <p
              className="mt-1.5 line-clamp-2 text-xs text-slate-500 sm:line-clamp-3"
              title={coverFiles.length > 0 ? coverFiles.map((f) => f.name).join(", ") : undefined}
            >
              {coverFiles.length === 0
                ? exploreDict.noFileChosen
                : coverFiles.map((f) => f.name).join(", ")}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {(["JPEG", "PNG", "WebP", "GIF"] as const).map((fmt) => (
              <span
                key={fmt}
                className="rounded-lg border border-white/[0.08] bg-black/30 px-2 py-0.5 text-[10px] font-medium tracking-wide text-slate-400"
              >
                {fmt}
              </span>
            ))}
          </div>
        </label>

        {coverPreviewUrls.length > 0 ? (
          <ul
            className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3"
            aria-label="Cover preview"
          >
            {coverPreviewUrls.map((url, i) => (
              <li
                key={`${coverFiles[i]?.name ?? "f"}-${coverFiles[i]?.size ?? 0}-${i}`}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-white/[0.1] bg-black/40 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.65)] ring-1 ring-white/[0.06]"
              >
                <img
                  src={url}
                  alt={coverFiles[i]?.name ? `Preview: ${coverFiles[i]!.name}` : ""}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeCoverAt(i)}
                  className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/65 text-white shadow-lg backdrop-blur-md transition hover:border-rose-400/50 hover:bg-rose-600/95 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/50"
                  aria-label={exploreDict.removeStrain}
                >
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    aria-hidden
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <label className="sm:col-span-2">
        <span className={labelClassName}>{fieldDict.description}</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className={`min-h-[7rem] resize-y ${inputClassName}`}
          placeholder={placeholderDict.diaryDescription}
        />
      </label>

      <div className="sm:col-span-2 flex justify-center border-t border-white/[0.06] pt-8">
        <button
          type="submit"
          disabled={pending}
          className="w-full max-w-md rounded-full bg-yellow-400 px-8 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_4px_24px_-4px_rgba(250,204,21,0.45)] transition hover:bg-yellow-300 hover:shadow-[0_8px_32px_-4px_rgba(250,204,21,0.4)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[14rem]"
        >
          {pending ? exploreDict.posting : exploreDict.submitCreate}
        </button>
      </div>
    </form>
  );
}
