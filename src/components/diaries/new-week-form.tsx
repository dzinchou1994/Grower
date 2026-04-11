"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getLocalizedPath, type Locale } from "@/lib/i18n";

type FieldDict = {
  weekNumber: string;
  weekTitle: string;
  description: string;
  weekPhotos: string;
  extraImageUrls: string;
};

type PlaceholderDict = {
  weekNumber: string;
  weekTitle: string;
  weekDescription: string;
  extraImageUrls: string;
};

type ExploreDict = {
  suggestedNextWeek: string;
  submitWeek: string;
  posting: string;
  uploadHint: string;
  extraUrlsHint: string;
  imageRequired: string;
  uploadFailed: string;
};

export function NewWeekForm({
  locale,
  diarySlug,
  fieldDict,
  placeholderDict,
  exploreDict,
}: {
  locale: Locale;
  diarySlug: string;
  fieldDict: FieldDict;
  placeholderDict: PlaceholderDict;
  exploreDict: ExploreDict;
}) {
  const router = useRouter();
  const [weekNumber, setWeekNumber] = useState<number | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [imageBlock, setImageBlock] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/diaries/${encodeURIComponent(diarySlug)}/weeks`);
      if (!res.ok || cancelled) {
        return;
      }
      const data = (await res.json()) as { suggestedWeekNumber?: number };
      if (typeof data.suggestedWeekNumber === "number" && !cancelled) {
        setWeekNumber(data.suggestedWeekNumber);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [diarySlug]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (weekNumber === "" || !Number.isInteger(weekNumber) || weekNumber < 1) {
      setError("Enter a valid week number.");
      return;
    }

    const urlLines = imageBlock
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (files.length + urlLines.length < 1) {
      setError(exploreDict.imageRequired);
      return;
    }

    setPending(true);

    const uploadedUrls: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]!;
        const body = new FormData();
        body.set("file", file);
        const res = await fetch(
          `/api/diaries/${encodeURIComponent(diarySlug)}/week-image`,
          { method: "POST", body },
        );
        const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
        if (!res.ok) {
          setError(data.error ?? exploreDict.uploadFailed);
          setPending(false);
          return;
        }
        if (data.url) {
          uploadedUrls.push(data.url);
        }
      }
    } catch {
      setError(exploreDict.uploadFailed);
      setPending(false);
      return;
    }

    const imageUrls = [...uploadedUrls, ...urlLines];

    try {
      const res = await fetch(`/api/diaries/${encodeURIComponent(diarySlug)}/weeks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekNumber,
          title: title.trim() || null,
          description: description.trim(),
          imageUrls,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not save week.");
        setPending(false);
        return;
      }
      router.push(
        getLocalizedPath(locale, `/diaries/${diarySlug}/weeks/${weekNumber}`),
      );
      router.refresh();
    } catch {
      setError("Network error.");
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

      <p className="sm:col-span-2 text-xs text-slate-400">
        {exploreDict.suggestedNextWeek}
        {weekNumber !== "" ? `: ${weekNumber}` : " …"}
      </p>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-300">{fieldDict.weekNumber}</span>
        <input
          required
          type="number"
          min={1}
          value={weekNumber === "" ? "" : weekNumber}
          onChange={(e) => {
            const v = e.target.value;
            setWeekNumber(v === "" ? "" : Number(v));
          }}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
          placeholder={placeholderDict.weekNumber}
        />
      </label>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-300">{fieldDict.weekTitle}</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500"
          placeholder={placeholderDict.weekTitle}
        />
      </label>

      <label className="sm:col-span-2">
        <span className="mb-2 block text-sm font-medium text-slate-300">{fieldDict.description}</span>
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500"
          placeholder={placeholderDict.weekDescription}
        />
      </label>

      <label className="sm:col-span-2">
        <span className="mb-2 block text-sm font-medium text-slate-300">{fieldDict.weekPhotos}</span>
        <p className="mb-2 text-xs text-slate-500">{exploreDict.uploadHint}</p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="w-full text-sm text-slate-200 file:mr-4 file:rounded-full file:border-0 file:bg-lime-400 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-lime-300"
        />
      </label>

      <label className="sm:col-span-2">
        <span className="mb-2 block text-sm font-medium text-slate-300">{fieldDict.extraImageUrls}</span>
        <p className="mb-2 text-xs text-slate-500">{exploreDict.extraUrlsHint}</p>
        <textarea
          value={imageBlock}
          onChange={(e) => setImageBlock(e.target.value)}
          rows={3}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500"
          placeholder={placeholderDict.extraImageUrls}
        />
      </label>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-lime-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? exploreDict.posting : exploreDict.submitWeek}
        </button>
      </div>
    </form>
  );
}
