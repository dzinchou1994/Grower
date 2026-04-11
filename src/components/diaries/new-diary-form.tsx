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
import { useMemo, useState } from "react";
import { getDiaryLabels } from "@/lib/diary-labels";
import { DiarySetupFields, type DiarySetupDict } from "@/components/diaries/diary-setup-fields";
import {
  emptyDiarySetup,
  toDiarySetupPayload,
  type DiarySetup,
} from "@/lib/diary-setup";
import { getLocalizedPath, type Locale } from "@/lib/i18n";

type FieldDict = {
  diaryTitle: string;
  strain: string;
  environment: string;
  coverImage: string;
  extraImageUrls: string;
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
  extraImageUrls: string;
};

type ExploreDict = {
  addStrain: string;
  removeStrain: string;
  breederOptional: string;
  submitCreate: string;
  posting: string;
  uploadHint: string;
  extraUrlsHint: string;
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
  const [coverExtraUrls, setCoverExtraUrls] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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

      const urlLines = coverExtraUrls
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      const coverSequence = [...uploadedCoverUrls, ...urlLines];
      const coverImageUrl =
        coverSequence.length > 0 ? coverSequence[coverSequence.length - 1]! : null;

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
    <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
      {error ? (
        <div className="sm:col-span-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <label className="sm:col-span-2">
        <span className="mb-2 block text-sm font-medium text-slate-300">{fieldDict.diaryTitle}</span>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500"
          placeholder={placeholderDict.diaryTitle}
        />
      </label>

      <div className="sm:col-span-2 space-y-3">
        <span className="block text-sm font-medium text-slate-300">{fieldDict.strain}</span>
        {strains.map((row, i) => (
          <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <input
              value={row.name}
              onChange={(e) => {
                const next = [...strains];
                next[i] = { ...next[i]!, name: e.target.value };
                setStrains(next);
              }}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500"
              placeholder={placeholderDict.strain}
            />
            <input
              value={row.breeder}
              onChange={(e) => {
                const next = [...strains];
                next[i] = { ...next[i]!, breeder: e.target.value };
                setStrains(next);
              }}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500"
              placeholder={exploreDict.breederOptional}
            />
            {strains.length > 1 ? (
              <button
                type="button"
                onClick={() => setStrains(strains.filter((_, j) => j !== i))}
                className="rounded-full border border-white/15 px-3 py-2 text-xs text-slate-300 hover:bg-white/10"
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
            className="text-sm text-lime-300 hover:text-lime-200"
          >
            + {exploreDict.addStrain}
          </button>
        ) : null}
      </div>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-300">{fieldDict.growPhase}</span>
        <select
          value={growPhase}
          onChange={(e) => setGrowPhase(e.target.value as DiaryGrowPhase)}
          className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white"
        >
          {(Object.keys(labels.growPhase) as DiaryGrowPhase[]).map((k) => (
            <option key={k} value={k}>
              {labels.growPhase[k]}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-300">{fieldDict.flowerType}</span>
        <select
          value={flowerType}
          onChange={(e) => setFlowerType(e.target.value as DiaryFlowerType)}
          className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white"
        >
          {(Object.keys(labels.flowerType) as DiaryFlowerType[]).map((k) => (
            <option key={k} value={k}>
              {labels.flowerType[k]}
            </option>
          ))}
        </select>
      </label>

      <label className="sm:col-span-2">
        <span className="mb-2 block text-sm font-medium text-slate-300">{fieldDict.environment}</span>
        <select
          value={environment}
          onChange={(e) => setEnvironment(e.target.value as DiaryEnvironment)}
          className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white sm:max-w-md"
        >
          {(Object.keys(labels.environment) as DiaryEnvironment[]).map((k) => (
            <option key={k} value={k}>
              {labels.environment[k]}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-300">{fieldDict.watering}</span>
        <select
          value={watering}
          onChange={(e) => setWatering(e.target.value as DiaryWateringType)}
          className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white"
        >
          {(Object.keys(labels.watering) as DiaryWateringType[]).map((k) => (
            <option key={k} value={k}>
              {labels.watering[k]}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-300">{fieldDict.medium}</span>
        <select
          value={medium}
          onChange={(e) => setMedium(e.target.value as DiarySubstrateMedium)}
          className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white"
        >
          {(Object.keys(labels.medium) as DiarySubstrateMedium[]).map((k) => (
            <option key={k} value={k}>
              {labels.medium[k]}
            </option>
          ))}
        </select>
      </label>

      <label className="sm:col-span-2">
        <span className="mb-2 block text-sm font-medium text-slate-300">{fieldDict.germinationMethod}</span>
        <select
          value={germinationMethod}
          onChange={(e) => setGerminationMethod(e.target.value as DiaryGerminationMethod)}
          className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white sm:max-w-md"
        >
          {(Object.keys(labels.germination) as DiaryGerminationMethod[]).map((k) => (
            <option key={k} value={k}>
              {labels.germination[k]}
            </option>
          ))}
        </select>
      </label>

      <DiarySetupFields value={setup} onChange={setSetup} setupDict={setupDict} />

      <label className="sm:col-span-2">
        <span className="mb-2 block text-sm font-medium text-slate-300">{fieldDict.coverImage}</span>
        <p className="mb-2 text-xs text-slate-500">{exploreDict.coverLastPhotoHint}</p>
        <p className="mb-2 text-xs text-slate-500">{exploreDict.uploadHint}</p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={(e) => setCoverFiles(Array.from(e.target.files ?? []))}
          className="w-full text-sm text-slate-200 file:mr-4 file:rounded-full file:border-0 file:bg-lime-400 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-lime-300"
        />
      </label>

      <label className="sm:col-span-2">
        <span className="mb-2 block text-sm font-medium text-slate-300">{fieldDict.extraImageUrls}</span>
        <p className="mb-2 text-xs text-slate-500">{exploreDict.extraUrlsHint}</p>
        <textarea
          value={coverExtraUrls}
          onChange={(e) => setCoverExtraUrls(e.target.value)}
          rows={3}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500"
          placeholder={placeholderDict.extraImageUrls}
        />
      </label>

      <label className="sm:col-span-2">
        <span className="mb-2 block text-sm font-medium text-slate-300">{fieldDict.description}</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500"
          placeholder={placeholderDict.diaryDescription}
        />
      </label>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-lime-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? exploreDict.posting : exploreDict.submitCreate}
        </button>
      </div>
    </form>
  );
}
