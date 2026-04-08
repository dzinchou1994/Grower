"use client";

import { useMemo, useState } from "react";

type AdminConsoleProps = {
  role: "ADMIN" | "MODERATOR";
};

type TabId =
  | "moderation"
  | "content"
  | "cannapedia"
  | "users"
  | "analytics"
  | "audit";

export function AdminConsole({ role }: AdminConsoleProps) {
  const tabs = useMemo(
    () =>
      [
        { id: "moderation", label: "Moderation" },
        { id: "content", label: "Content" },
        ...(role === "ADMIN" ? [{ id: "cannapedia", label: "Cannapedia" }] : []),
        ...(role === "ADMIN" ? [{ id: "users", label: "Users" }] : []),
        ...(role === "ADMIN" ? [{ id: "analytics", label: "Analytics" }] : []),
        ...(role === "ADMIN" ? [{ id: "audit", label: "Audit" }] : []),
      ] as { id: TabId; label: string }[],
    [role],
  );

  const [activeTab, setActiveTab] = useState<TabId>("moderation");

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-5 sm:p-8">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-4 py-2 text-sm transition ${
              activeTab === tab.id
                ? "bg-lime-400 text-slate-950"
                : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "moderation" ? <ModerationPanel isAdmin={role === "ADMIN"} /> : null}
      {activeTab === "content" ? <ContentPanel isAdmin={role === "ADMIN"} /> : null}
      {activeTab === "cannapedia" && role === "ADMIN" ? <CannapediaPanel /> : null}
      {activeTab === "users" && role === "ADMIN" ? <UsersPanel /> : null}
      {activeTab === "analytics" && role === "ADMIN" ? <AnalyticsPanel /> : null}
      {activeTab === "audit" && role === "ADMIN" ? <AuditPanel /> : null}
    </section>
  );
}

function ModerationPanel({ isAdmin }: { isAdmin: boolean }) {
  const [status, setStatus] = useState<"OPEN" | "REVIEWED" | "RESOLVED" | "DISMISSED" | "">("OPEN");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<any[]>([]);

  async function loadReports() {
    setLoading(true);
    setError(null);
    try {
      const qs = status ? `?status=${status}` : "";
      const response = await fetch(`/api/admin/reports${qs}`);
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error ?? "Could not load reports.");
        return;
      }
      setReports(payload.reports ?? []);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(reportId: string, nextStatus: "REVIEWED" | "RESOLVED" | "DISMISSED") {
    const reviewerNote = window.prompt("Reviewer note (optional):") ?? "";
    const reason = window.prompt("Action reason (required for audit):");
    if (!reason) return;

    const response = await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportId,
        status: nextStatus,
        reviewerNote,
        reason,
      }),
    });
    if (response.ok) {
      await loadReports();
    } else {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? "Could not update report.");
    }
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as typeof status)}
          className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
        >
          <option value="">All statuses</option>
          <option value="OPEN">OPEN</option>
          <option value="REVIEWED">REVIEWED</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="DISMISSED">DISMISSED</option>
        </select>
        <button
          type="button"
          onClick={loadReports}
          className="rounded-full bg-lime-400 px-4 py-2 text-sm font-semibold text-slate-950"
        >
          {loading ? "Loading..." : "Load Reports"}
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

      <div className="mt-4 grid gap-3">
        {reports.map((report) => (
          <div key={report.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-white">
                {report.targetType} · {report.reason}
              </p>
              <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-300">
                {report.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Reporter: @{report.reporter?.username ?? "unknown"} · {new Date(report.createdAt).toLocaleString()}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateStatus(report.id, "REVIEWED")}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white"
              >
                Review
              </button>
              <button
                type="button"
                onClick={() => updateStatus(report.id, "RESOLVED")}
                className="rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1 text-xs text-lime-200"
              >
                Resolve
              </button>
              <button
                type="button"
                onClick={() => updateStatus(report.id, "DISMISSED")}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
              >
                Dismiss
              </button>
              {!isAdmin ? (
                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
                  Moderator mode
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentPanel({ isAdmin }: { isAdmin: boolean }) {
  const [type, setType] = useState<"threads" | "comments" | "diaries">("threads");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadContent() {
    setLoading(true);
    setError(null);
    const qs = new URLSearchParams({ type });
    if (q.trim()) qs.set("q", q.trim());

    try {
      const response = await fetch(`/api/admin/content?${qs.toString()}`);
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error ?? "Could not load content.");
        return;
      }
      setItems(payload.items ?? []);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function runAction(targetType: "THREAD" | "COMMENT" | "DIARY", targetId: string, action: string) {
    const reason = window.prompt(`Reason for ${action.toLowerCase()} action:`);
    if (!reason) return;

    const response = await fetch("/api/admin/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType, targetId, action, reason }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? "Action failed.");
      return;
    }
    await loadContent();
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={type}
          onChange={(event) => setType(event.target.value as typeof type)}
          className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
        >
          <option value="threads">Threads</option>
          <option value="comments">Comments</option>
          <option value="diaries">Diaries</option>
        </select>
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search content..."
          className="min-w-[220px] rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
        />
        <button
          type="button"
          onClick={loadContent}
          className="rounded-full bg-lime-400 px-4 py-2 text-sm font-semibold text-slate-950"
        >
          {loading ? "Loading..." : "Load Content"}
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-medium text-white">{item.title ?? item.body?.slice(0, 90) ?? item.slug}</p>
            <p className="mt-1 text-xs text-slate-400">
              {type === "threads" ? `Thread by @${item.author?.username}` : null}
              {type === "comments" ? `Comment by @${item.author?.username}` : null}
              {type === "diaries" ? `Diary by @${item.author?.username}` : null}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  runAction(
                    type === "threads" ? "THREAD" : type === "comments" ? "COMMENT" : "DIARY",
                    item.id,
                    "HIDE",
                  )
                }
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white"
              >
                Hide
              </button>
              <button
                type="button"
                onClick={() =>
                  runAction(
                    type === "threads" ? "THREAD" : type === "comments" ? "COMMENT" : "DIARY",
                    item.id,
                    "UNHIDE",
                  )
                }
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white"
              >
                Unhide
              </button>
              {type === "threads" ? (
                <>
                  <button
                    type="button"
                    onClick={() => runAction("THREAD", item.id, "LOCK")}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white"
                  >
                    Lock
                  </button>
                  <button
                    type="button"
                    onClick={() => runAction("THREAD", item.id, "UNLOCK")}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white"
                  >
                    Unlock
                  </button>
                  <button
                    type="button"
                    onClick={() => runAction("THREAD", item.id, "PIN")}
                    className="rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1 text-xs text-lime-200"
                  >
                    Pin
                  </button>
                  <button
                    type="button"
                    onClick={() => runAction("THREAD", item.id, "UNPIN")}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white"
                  >
                    Unpin
                  </button>
                </>
              ) : null}
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() =>
                    runAction(
                      type === "threads" ? "THREAD" : type === "comments" ? "COMMENT" : "DIARY",
                      item.id,
                      "DELETE",
                    )
                  }
                  className="rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1 text-xs text-red-200"
                >
                  Delete
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersPanel() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadUsers() {
    setLoading(true);
    setError(null);
    const qs = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
    try {
      const response = await fetch(`/api/admin/users${qs}`);
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error ?? "Could not load users.");
        return;
      }
      setUsers(payload.users ?? []);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function patchUser(payload: Record<string, unknown>) {
    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error ?? "Could not update user.");
      return;
    }
    await loadUsers();
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search users..."
          className="min-w-[220px] rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
        />
        <button
          type="button"
          onClick={loadUsers}
          className="rounded-full bg-lime-400 px-4 py-2 text-sm font-semibold text-slate-950"
        >
          {loading ? "Loading..." : "Load Users"}
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

      <div className="mt-4 grid gap-3">
        {users.map((user) => (
          <div key={user.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-white">@{user.username}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Threads {user._count.forumThreads} · Comments {user._count.forumComments} · Diaries {user._count.diaries}
                </p>
              </div>
              <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-300">{user.role}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["USER", "MODERATOR", "ADMIN"] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() =>
                    patchUser({
                      userId: user.id,
                      role,
                      reason: `Role changed to ${role}`,
                    })
                  }
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white"
                >
                  {role}
                </button>
              ))}
              {!user.isSuspended ? (
                <button
                  type="button"
                  onClick={() =>
                    patchUser({
                      userId: user.id,
                      suspend: true,
                      suspensionDays: 30,
                      suspensionReason: "Policy violation",
                      reason: "Suspended via admin panel",
                    })
                  }
                  className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-200"
                >
                  Suspend
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    patchUser({
                      userId: user.id,
                      suspend: false,
                      reason: "Unsuspended via admin panel",
                    })
                  }
                  className="rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1 text-xs text-lime-200"
                >
                  Unsuspend
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsPanel() {
  const [days, setDays] = useState(30);
  const [payload, setPayload] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadAnalytics() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/analytics?days=${days}`);
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setError(body?.error ?? "Could not load analytics.");
        return;
      }
      setPayload(body);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={days}
          onChange={(event) => setDays(Number(event.target.value))}
          className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
        <button
          type="button"
          onClick={loadAnalytics}
          className="rounded-full bg-lime-400 px-4 py-2 text-sm font-semibold text-slate-950"
        >
          {loading ? "Loading..." : "Load Analytics"}
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

      {payload ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total users" value={payload.totals.users} />
          <MetricCard label="DAU / WAU / MAU" value={`${payload.activeUsers.dau} / ${payload.activeUsers.wau} / ${payload.activeUsers.mau}`} />
          <MetricCard label="Open reports" value={payload.totals.openReports} />
          <MetricCard label="Avg resolution (h)" value={payload.moderation.avgResolutionHours} />
        </div>
      ) : null}
    </div>
  );
}

function AuditPanel() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadLogs() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/audit?pageSize=50");
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error ?? "Could not load audit logs.");
        return;
      }
      setLogs(payload.logs ?? []);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={loadLogs}
        className="rounded-full bg-lime-400 px-4 py-2 text-sm font-semibold text-slate-950"
      >
        {loading ? "Loading..." : "Load Audit Logs"}
      </button>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

      <div className="mt-4 grid gap-3">
        {logs.map((log) => (
          <div key={log.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-medium text-white">
              {log.action} · {log.targetType}:{log.targetId}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Actor: @{log.actor?.username ?? "system"} · {new Date(log.createdAt).toLocaleString()}
            </p>
            {log.reason ? <p className="mt-2 text-xs text-slate-300">Reason: {log.reason}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function CannapediaPanel() {
  const [categories, setCategories] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newCategory, setNewCategory] = useState({
    slug: "",
    icon: "🌿",
    nameKa: "",
    nameEn: "",
    nameRu: "",
    sortOrder: "0",
    reason: "",
  });
  const [newArticle, setNewArticle] = useState({
    slug: "",
    categoryId: "",
    readMinutes: "6",
    titleKa: "",
    titleEn: "",
    titleRu: "",
    excerptKa: "",
    excerptEn: "",
    excerptRu: "",
    contentKa: "",
    contentEn: "",
    contentRu: "",
    isPublished: true,
    reason: "",
  });

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/cannapedia");
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error ?? "Could not load Cannapedia data.");
        return;
      }
      setCategories(payload.categories ?? []);
      setArticles(payload.articles ?? []);
      if (!newArticle.categoryId && payload.categories?.[0]?.id) {
        setNewArticle((prev) => ({ ...prev, categoryId: payload.categories[0].id }));
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function createCategory() {
    const response = await fetch("/api/admin/cannapedia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity: "category",
        slug: newCategory.slug,
        icon: newCategory.icon,
        sortOrder: Number(newCategory.sortOrder || "0"),
        name: {
          ka: newCategory.nameKa,
          en: newCategory.nameEn,
          ru: newCategory.nameRu,
        },
        reason: newCategory.reason || "Created Cannapedia category",
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? "Could not create category.");
      return;
    }

    setNewCategory({
      slug: "",
      icon: "🌿",
      nameKa: "",
      nameEn: "",
      nameRu: "",
      sortOrder: "0",
      reason: "",
    });
    await loadData();
  }

  async function updateCategory(category: any) {
    const nameKa = window.prompt("KA name", category.nameKa) ?? category.nameKa;
    const nameEn = window.prompt("EN name", category.nameEn) ?? category.nameEn;
    const nameRu = window.prompt("RU name", category.nameRu) ?? category.nameRu;
    const icon = window.prompt("Icon", category.icon) ?? category.icon;
    const slug = window.prompt("Slug", category.slug) ?? category.slug;
    const sortOrder = window.prompt("Sort order", String(category.sortOrder ?? 0));
    const reason = window.prompt("Reason for edit (audit)") ?? "";
    if (!reason.trim()) return;

    const response = await fetch("/api/admin/cannapedia", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity: "category",
        id: category.id,
        slug,
        icon,
        sortOrder: Number(sortOrder || "0"),
        name: { ka: nameKa, en: nameEn, ru: nameRu },
        reason,
      }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? "Could not update category.");
      return;
    }
    await loadData();
  }

  async function createArticle() {
    const response = await fetch("/api/admin/cannapedia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity: "article",
        slug: newArticle.slug,
        categoryId: newArticle.categoryId,
        readMinutes: Number(newArticle.readMinutes || "6"),
        title: {
          ka: newArticle.titleKa,
          en: newArticle.titleEn,
          ru: newArticle.titleRu,
        },
        excerpt: {
          ka: newArticle.excerptKa,
          en: newArticle.excerptEn,
          ru: newArticle.excerptRu,
        },
        content: {
          ka: newArticle.contentKa,
          en: newArticle.contentEn,
          ru: newArticle.contentRu,
        },
        isPublished: newArticle.isPublished,
        reason: newArticle.reason || "Created Cannapedia article",
      }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? "Could not create article.");
      return;
    }

    setNewArticle({
      slug: "",
      categoryId: categories[0]?.id ?? "",
      readMinutes: "6",
      titleKa: "",
      titleEn: "",
      titleRu: "",
      excerptKa: "",
      excerptEn: "",
      excerptRu: "",
      contentKa: "",
      contentEn: "",
      contentRu: "",
      isPublished: true,
      reason: "",
    });
    await loadData();
  }

  async function updateArticle(article: any) {
    const titleKa = window.prompt("KA title", article.titleKa) ?? article.titleKa;
    const titleEn = window.prompt("EN title", article.titleEn) ?? article.titleEn;
    const titleRu = window.prompt("RU title", article.titleRu) ?? article.titleRu;
    const excerptKa = window.prompt("KA excerpt", article.excerptKa) ?? article.excerptKa;
    const excerptEn = window.prompt("EN excerpt", article.excerptEn) ?? article.excerptEn;
    const excerptRu = window.prompt("RU excerpt", article.excerptRu) ?? article.excerptRu;
    const contentKa = window.prompt("KA content (paragraphs by line)", article.contentKa) ?? article.contentKa;
    const contentEn = window.prompt("EN content (paragraphs by line)", article.contentEn) ?? article.contentEn;
    const contentRu = window.prompt("RU content (paragraphs by line)", article.contentRu) ?? article.contentRu;
    const categoryId =
      window.prompt("Category ID", article.categoryId) ?? article.categoryId;
    const isPublishedRaw =
      window.prompt("Published? (true/false)", String(article.isPublished)) ??
      String(article.isPublished);
    const slug = window.prompt("Slug", article.slug) ?? article.slug;
    const readMinutes = window.prompt("Read minutes", String(article.readMinutes ?? 6));
    const reason = window.prompt("Reason for edit (audit)") ?? "";
    if (!reason.trim()) return;

    const response = await fetch("/api/admin/cannapedia", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity: "article",
        id: article.id,
        slug,
        categoryId,
        readMinutes: Number(readMinutes || "6"),
        title: {
          ka: titleKa,
          en: titleEn,
          ru: titleRu,
        },
        excerpt: {
          ka: excerptKa,
          en: excerptEn,
          ru: excerptRu,
        },
        content: {
          ka: contentKa,
          en: contentEn,
          ru: contentRu,
        },
        isPublished: isPublishedRaw.trim().toLowerCase() === "true",
        reason,
      }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? "Could not update article.");
      return;
    }
    await loadData();
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={loadData}
        className="rounded-full bg-lime-400 px-4 py-2 text-sm font-semibold text-slate-950"
      >
        {loading ? "Loading..." : "Load Cannapedia"}
      </button>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-white">Add category</p>
          <div className="mt-3 grid gap-2">
            <input value={newCategory.slug} onChange={(e) => setNewCategory((p) => ({ ...p, slug: e.target.value }))} placeholder="slug" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
            <input value={newCategory.icon} onChange={(e) => setNewCategory((p) => ({ ...p, icon: e.target.value }))} placeholder="icon" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
            <input value={newCategory.nameKa} onChange={(e) => setNewCategory((p) => ({ ...p, nameKa: e.target.value }))} placeholder="name ka" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
            <input value={newCategory.nameEn} onChange={(e) => setNewCategory((p) => ({ ...p, nameEn: e.target.value }))} placeholder="name en" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
            <input value={newCategory.nameRu} onChange={(e) => setNewCategory((p) => ({ ...p, nameRu: e.target.value }))} placeholder="name ru" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
            <input value={newCategory.sortOrder} onChange={(e) => setNewCategory((p) => ({ ...p, sortOrder: e.target.value }))} placeholder="sort order" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
            <input value={newCategory.reason} onChange={(e) => setNewCategory((p) => ({ ...p, reason: e.target.value }))} placeholder="audit reason" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
            <button type="button" onClick={createCategory} className="rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-2 text-xs text-lime-200">Create category</button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-white">Add article</p>
          <div className="mt-3 grid gap-2">
            <input value={newArticle.slug} onChange={(e) => setNewArticle((p) => ({ ...p, slug: e.target.value }))} placeholder="slug" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
            <select value={newArticle.categoryId} onChange={(e) => setNewArticle((p) => ({ ...p, categoryId: e.target.value }))} className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white">
              <option value="">Select category</option>
              {categories.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.icon} {entry.nameKa}
                </option>
              ))}
            </select>
            <input value={newArticle.readMinutes} onChange={(e) => setNewArticle((p) => ({ ...p, readMinutes: e.target.value }))} placeholder="read minutes" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
            <input value={newArticle.titleKa} onChange={(e) => setNewArticle((p) => ({ ...p, titleKa: e.target.value }))} placeholder="title ka" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
            <input value={newArticle.titleEn} onChange={(e) => setNewArticle((p) => ({ ...p, titleEn: e.target.value }))} placeholder="title en" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
            <input value={newArticle.titleRu} onChange={(e) => setNewArticle((p) => ({ ...p, titleRu: e.target.value }))} placeholder="title ru" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
            <textarea value={newArticle.excerptKa} onChange={(e) => setNewArticle((p) => ({ ...p, excerptKa: e.target.value }))} placeholder="excerpt ka" className="min-h-[56px] rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
            <textarea value={newArticle.excerptEn} onChange={(e) => setNewArticle((p) => ({ ...p, excerptEn: e.target.value }))} placeholder="excerpt en" className="min-h-[56px] rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
            <textarea value={newArticle.excerptRu} onChange={(e) => setNewArticle((p) => ({ ...p, excerptRu: e.target.value }))} placeholder="excerpt ru" className="min-h-[56px] rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
            <textarea value={newArticle.contentKa} onChange={(e) => setNewArticle((p) => ({ ...p, contentKa: e.target.value }))} placeholder="content ka (paragraphs by line)" className="min-h-[90px] rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
            <textarea value={newArticle.contentEn} onChange={(e) => setNewArticle((p) => ({ ...p, contentEn: e.target.value }))} placeholder="content en (paragraphs by line)" className="min-h-[90px] rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
            <textarea value={newArticle.contentRu} onChange={(e) => setNewArticle((p) => ({ ...p, contentRu: e.target.value }))} placeholder="content ru (paragraphs by line)" className="min-h-[90px] rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
            <input value={newArticle.reason} onChange={(e) => setNewArticle((p) => ({ ...p, reason: e.target.value }))} placeholder="audit reason" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
            <label className="inline-flex items-center gap-2 text-xs text-slate-300">
              <input type="checkbox" checked={newArticle.isPublished} onChange={(e) => setNewArticle((p) => ({ ...p, isPublished: e.target.checked }))} />
              Published
            </label>
            <button type="button" onClick={createArticle} className="rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-2 text-xs text-lime-200">Create article</button>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {categories.map((category) => (
          <div key={category.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white">
                {category.icon} {category.nameKa} ({category.slug})
              </p>
              <button
                type="button"
                onClick={() => updateCategory(category)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-100"
              >
                Edit category
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3">
        {articles.map((article) => (
          <div key={article.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">{article.titleKa}</p>
                <p className="text-xs text-slate-400">
                  {article.slug} · {article.category?.nameKa ?? "No category"} · {article.readMinutes} min
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateArticle(article)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-100"
              >
                Edit article
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
