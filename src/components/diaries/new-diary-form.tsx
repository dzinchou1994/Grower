"use client";

import {
  DiaryEnvironment,
  DiaryFlowerType,
  DiaryGerminationMethod,
  DiaryGrowPhase,
  DiarySubstrateMedium,
  DiaryWateringType,
} from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { diaryExploreMediumKeys } from "@/lib/diary-explore-params";
import { getDiaryLabels } from "@/lib/diary-labels";
import { DiarySetupFields, type DiarySetupDict } from "@/components/diaries/diary-setup-fields";
import {
  emptyDiarySetup,
  toDiarySetupPayload,
  type DiarySetup,
} from "@/lib/diary-setup";
import { getLocalizedPath, type Locale } from "@/lib/i18n";

const inputClassName =
  "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-500 shadow-sm shadow-black/20 transition focus:border-lime-400/40 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-lime-400/15";

const selectClassName =
  "w-full cursor-pointer rounded-xl border border-white/[0.08] bg-[#0a121a] px-4 py-3 text-sm text-white shadow-sm shadow-black/20 transition focus:border-lime-400/40 focus:outline-none focus:ring-2 focus:ring-lime-400/15";

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
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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
        <div className="sm:col-span-2 rounded-xl border border-rose-500/30 bg-rose-500/[0.08] px-4 py-3 text-sm text-rose-100">
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
            className="text-sm font-medium text-lime-300/90 transition hover:text-lime-200"
          >
            + {exploreDict.addStrain}
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
        <span className={labelClassName}>{fieldDict.coverImage}</span>
        <p className="mb-2 text-xs text-slate-500">{exploreDict.coverLastPhotoHint}</p>
        <p className="mb-2 text-xs text-slate-500">{exploreDict.uploadHint}</p>
        <input
          ref={coverFileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={(e) => setCoverFiles(Array.from(e.target.files ?? []))}
          className="w-full text-sm text-slate-300 file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-lime-400 file:px-5 file:py-2.5 file:text-sm file:font-semibold file:text-slate-950 file:shadow-md file:shadow-lime-500/20 file:transition hover:file:bg-lime-300"
        />
        {coverPreviewUrls.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-3" aria-label="Cover preview">
            {coverPreviewUrls.map((url, i) => (
              <li
                key={`${coverFiles[i]?.name ?? "f"}-${coverFiles[i]?.size ?? 0}-${i}`}
                className="group relative h-24 w-24 overflow-hidden rounded-xl border border-white/[0.1] bg-black/50 shadow-lg shadow-black/30 sm:h-28 sm:w-28"
              >
                <img
                  src={url}
                  alt={coverFiles[i]?.name ? `Preview: ${coverFiles[i]!.name}` : ""}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeCoverAt(i)}
                  className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white shadow-md backdrop-blur-sm transition hover:border-rose-400/40 hover:bg-rose-500/90 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/50"
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
          className="w-full max-w-md rounded-full bg-lime-400 px-8 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_4px_24px_-4px_rgba(163,230,53,0.45)] transition hover:bg-lime-300 hover:shadow-[0_8px_32px_-4px_rgba(163,230,53,0.4)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[14rem]"
        >
          {pending ? exploreDict.posting : exploreDict.submitCreate}
        </button>
      </div>
    </form>
  );
}
