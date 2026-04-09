"use client";

import { useState } from "react";

type AdminNewsRecord = {
  id: string;
  slug: string;
  scope: "GEORGIA" | "WORLD";
  title: { ka: string; en: string; ru: string };
  excerpt: { ka: string; en: string; ru: string };
  body: { ka: string; en: string; ru: string };
  imageUrl?: string;
  sourceName?: string;
  sourceUrl?: string;
  isPublished: boolean;
  createdAt: string;
};

type AdminSubmissionRecord = {
  id: string;
  title: string;
  body: string;
  scope: "GEORGIA" | "WORLD";
  imageUrl?: string;
  sourceName?: string;
  sourceUrl?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  submitterUsername?: string;
};

export function NewsManager() {
  const [articles, setArticles] = useState<AdminNewsRecord[]>([]);
  const [submissions, setSubmissions] = useState<AdminSubmissionRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [createForm, setCreateForm] = useState({
    scope: "GEORGIA" as "GEORGIA" | "WORLD",
    titleKa: "",
    titleEn: "",
    titleRu: "",
    excerptKa: "",
    excerptEn: "",
    excerptRu: "",
    bodyKa: "",
    bodyEn: "",
    bodyRu: "",
    imageUrl: "",
    sourceName: "",
    sourceUrl: "",
    reason: "",
  });

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/news");
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error ?? "Could not load news.");
        return;
      }
      setArticles(payload.articles ?? []);
      setSubmissions(payload.submissions ?? []);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function createArticle() {
    const response = await fetch("/api/admin/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "CREATE_ARTICLE",
        scope: createForm.scope,
        title: {
          ka: createForm.titleKa,
          en: createForm.titleEn,
          ru: createForm.titleRu,
        },
        excerpt: {
          ka: createForm.excerptKa,
          en: createForm.excerptEn,
          ru: createForm.excerptRu,
        },
        body: {
          ka: createForm.bodyKa,
          en: createForm.bodyEn,
          ru: createForm.bodyRu,
        },
        imageUrl: createForm.imageUrl,
        sourceName: createForm.sourceName,
        sourceUrl: createForm.sourceUrl,
        reason: createForm.reason || "Create news article",
      }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setError(payload?.error ?? "Could not create article.");
      return;
    }
    setCreateForm({
      scope: "GEORGIA",
      titleKa: "",
      titleEn: "",
      titleRu: "",
      excerptKa: "",
      excerptEn: "",
      excerptRu: "",
      bodyKa: "",
      bodyEn: "",
      bodyRu: "",
      imageUrl: "",
      sourceName: "",
      sourceUrl: "",
      reason: "",
    });
    await loadData();
  }

  async function reviewSubmission(entry: AdminSubmissionRecord, action: "APPROVE_SUBMISSION" | "REJECT_SUBMISSION") {
    const reason = window.prompt("Audit reason:") || "";
    if (!reason.trim()) return;
    const adminNote = window.prompt("Admin note (optional):") || "";
    const editedKaTitle =
      action === "APPROVE_SUBMISSION"
        ? window.prompt("Edit KA title before publish (optional):", entry.title) || ""
        : "";
    const editedKaBody =
      action === "APPROVE_SUBMISSION"
        ? window.prompt("Edit KA body before publish (optional):", entry.body) || ""
        : "";
    const scope =
      action === "APPROVE_SUBMISSION"
        ? (window.prompt("Scope (GEORGIA/WORLD):", entry.scope) || entry.scope).toUpperCase()
        : entry.scope;
    const response = await fetch("/api/admin/news", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        submissionId: entry.id,
        adminNote,
        scope,
        title: editedKaTitle ? { ka: editedKaTitle } : undefined,
        body: editedKaBody ? { ka: editedKaBody } : undefined,
        reason,
      }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setError(payload?.error ?? "Could not review submission.");
      return;
    }
    await loadData();
  }

  async function editArticle(article: AdminNewsRecord) {
    const reason = window.prompt("Audit reason:") || "";
    if (!reason.trim()) return;

    const titleKa = window.prompt("Title KA", article.title.ka) ?? article.title.ka;
    const titleEn = window.prompt("Title EN", article.title.en) ?? article.title.en;
    const titleRu = window.prompt("Title RU", article.title.ru) ?? article.title.ru;
    const excerptKa = window.prompt("Excerpt KA", article.excerpt.ka) ?? article.excerpt.ka;
    const excerptEn = window.prompt("Excerpt EN", article.excerpt.en) ?? article.excerpt.en;
    const excerptRu = window.prompt("Excerpt RU", article.excerpt.ru) ?? article.excerpt.ru;
    const bodyKa = window.prompt("Body KA", article.body.ka) ?? article.body.ka;
    const bodyEn = window.prompt("Body EN", article.body.en) ?? article.body.en;
    const bodyRu = window.prompt("Body RU", article.body.ru) ?? article.body.ru;
    const imageUrl = window.prompt("Image URL", article.imageUrl ?? "") ?? article.imageUrl ?? "";
    const sourceName = window.prompt("Source Name", article.sourceName ?? "") ?? article.sourceName ?? "";
    const sourceUrl = window.prompt("Source URL", article.sourceUrl ?? "") ?? article.sourceUrl ?? "";
    const scope = (window.prompt("Scope (GEORGIA/WORLD)", article.scope) ?? article.scope).toUpperCase();

    const response = await fetch("/api/admin/news", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "UPDATE_ARTICLE",
        id: article.id,
        scope,
        title: { ka: titleKa, en: titleEn, ru: titleRu },
        excerpt: { ka: excerptKa, en: excerptEn, ru: excerptRu },
        body: { ka: bodyKa, en: bodyEn, ru: bodyRu },
        imageUrl,
        sourceName,
        sourceUrl,
        reason,
      }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setError(payload?.error ?? "Could not edit article.");
      return;
    }
    await loadData();
  }

  async function togglePublish(article: AdminNewsRecord) {
    const reason = window.prompt("Audit reason:") || "";
    if (!reason.trim()) return;
    const response = await fetch("/api/admin/news", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "UPDATE_ARTICLE",
        id: article.id,
        isPublished: !article.isPublished,
        reason,
      }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setError(payload?.error ?? "Could not update publish status.");
      return;
    }
    await loadData();
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 sm:rounded-[2rem] sm:p-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            className="rounded-full bg-lime-400 px-4 py-2 text-xs font-semibold text-slate-950"
          >
            {loading ? "Loading..." : "Load News Data"}
          </button>
          {error ? <p className="text-xs text-red-300">{error}</p> : null}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 sm:rounded-[2rem] sm:p-6">
        <h2 className="text-base font-semibold text-white sm:text-lg">Create News Article</h2>
        <div className="mt-3 grid gap-2">
          <select
            value={createForm.scope}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, scope: event.target.value as "GEORGIA" | "WORLD" }))}
            className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
          >
            <option value="GEORGIA">Georgia</option>
            <option value="WORLD">World</option>
          </select>
          <input value={createForm.titleKa} onChange={(event) => setCreateForm((prev) => ({ ...prev, titleKa: event.target.value }))} placeholder="Title KA" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
          <input value={createForm.titleEn} onChange={(event) => setCreateForm((prev) => ({ ...prev, titleEn: event.target.value }))} placeholder="Title EN" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
          <input value={createForm.titleRu} onChange={(event) => setCreateForm((prev) => ({ ...prev, titleRu: event.target.value }))} placeholder="Title RU" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
          <textarea value={createForm.excerptKa} onChange={(event) => setCreateForm((prev) => ({ ...prev, excerptKa: event.target.value }))} placeholder="Excerpt KA" className="min-h-[56px] rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
          <textarea value={createForm.excerptEn} onChange={(event) => setCreateForm((prev) => ({ ...prev, excerptEn: event.target.value }))} placeholder="Excerpt EN" className="min-h-[56px] rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
          <textarea value={createForm.excerptRu} onChange={(event) => setCreateForm((prev) => ({ ...prev, excerptRu: event.target.value }))} placeholder="Excerpt RU" className="min-h-[56px] rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
          <textarea value={createForm.bodyKa} onChange={(event) => setCreateForm((prev) => ({ ...prev, bodyKa: event.target.value }))} placeholder="Body KA" className="min-h-[90px] rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
          <textarea value={createForm.bodyEn} onChange={(event) => setCreateForm((prev) => ({ ...prev, bodyEn: event.target.value }))} placeholder="Body EN" className="min-h-[90px] rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
          <textarea value={createForm.bodyRu} onChange={(event) => setCreateForm((prev) => ({ ...prev, bodyRu: event.target.value }))} placeholder="Body RU" className="min-h-[90px] rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
          <input value={createForm.imageUrl} onChange={(event) => setCreateForm((prev) => ({ ...prev, imageUrl: event.target.value }))} placeholder="Image URL (optional)" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
          <input value={createForm.sourceName} onChange={(event) => setCreateForm((prev) => ({ ...prev, sourceName: event.target.value }))} placeholder="Source name (optional)" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
          <input value={createForm.sourceUrl} onChange={(event) => setCreateForm((prev) => ({ ...prev, sourceUrl: event.target.value }))} placeholder="Source URL (optional)" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
          <input value={createForm.reason} onChange={(event) => setCreateForm((prev) => ({ ...prev, reason: event.target.value }))} placeholder="Audit reason" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
          <button type="button" onClick={createArticle} className="inline-flex w-fit rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1.5 text-xs text-lime-200">
            Create Article
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 sm:rounded-[2rem] sm:p-6">
        <h2 className="text-base font-semibold text-white sm:text-lg">User Submissions</h2>
        <div className="mt-3 grid gap-2.5">
          {submissions.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-sm font-medium text-white">{entry.title}</p>
              <p className="mt-1 text-xs text-slate-400">
                @{entry.submitterUsername ?? "user"} · {entry.scope} · {entry.status}
              </p>
              <p className="mt-2 text-xs text-slate-300 line-clamp-3">{entry.body}</p>
              {entry.status === "PENDING" ? (
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => reviewSubmission(entry, "APPROVE_SUBMISSION")} className="rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1 text-xs text-lime-200">
                    Approve + Publish
                  </button>
                  <button type="button" onClick={() => reviewSubmission(entry, "REJECT_SUBMISSION")} className="rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1 text-xs text-red-200">
                    Reject
                  </button>
                </div>
              ) : null}
            </div>
          ))}
          {submissions.length === 0 ? <p className="text-xs text-slate-400">No submissions yet.</p> : null}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 sm:rounded-[2rem] sm:p-6">
        <h2 className="text-base font-semibold text-white sm:text-lg">Published / Draft Articles</h2>
        <div className="mt-3 grid gap-2.5">
          {articles.map((article) => (
            <div key={article.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-white">{article.title.ka}</p>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-300">
                  {article.isPublished ? "Published" : "Draft"}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">{article.slug} · {article.scope}</p>
              <button
                type="button"
                onClick={() => togglePublish(article)}
                className="mt-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
              >
                {article.isPublished ? "Unpublish" : "Publish"}
              </button>
              <button
                type="button"
                onClick={() => editArticle(article)}
                className="ml-2 mt-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1 text-xs text-lime-200"
              >
                Edit
              </button>
            </div>
          ))}
          {articles.length === 0 ? <p className="text-xs text-slate-400">No articles yet.</p> : null}
        </div>
      </section>
    </div>
  );
}

