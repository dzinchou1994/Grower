"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Locale = "ka" | "en" | "ru";

export function ForumItemActions({
  locale,
  canDelete,
  canReport,
  deleteEndpoint,
  reportTargetType,
  reportTargetId,
  permalinkHref,
  permalinkLabel,
  className,
}: {
  locale: Locale;
  canDelete: boolean;
  /** When true, show report (e.g. not your content). Omit to derive from `!canDelete` for backwards compatibility. */
  canReport?: boolean;
  deleteEndpoint?: string;
  reportTargetType?: "THREAD" | "COMMENT";
  reportTargetId?: string;
  permalinkHref?: string;
  permalinkLabel?: string;
  className?: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const t =
    locale === "ka"
      ? {
          delete: "წაშლა",
          deleting: "იშლება...",
          deleteConfirm: "ნამდვილად გინდა წაშლა?",
          deleteFailed: "წაშლა ვერ მოხერხდა.",
          report: "დარეპორტება",
          reportFailed: "მოხსენება ვერ გაიგზავნა.",
          reported: "მოხსენება გაიგზავნა.",
          defaultReportReason: "მომხმარებლის რეპორტი",
          actions: "ქმედებები",
        }
      : locale === "ru"
        ? {
            delete: "Удалить",
            deleting: "Удаление...",
            deleteConfirm: "Вы уверены, что хотите удалить?",
            deleteFailed: "Не удалось удалить.",
            report: "Пожаловаться",
            reportPrompt: "Что не так с этим контентом?",
            reportFailed: "Не удалось отправить жалобу.",
            reported: "Жалоба отправлена.",
            defaultReportReason: "Пользовательская жалоба",
            actions: "Действия",
          }
        : {
            delete: "Delete",
            deleting: "Deleting...",
            deleteConfirm: "Are you sure you want to delete this?",
            deleteFailed: "Could not delete.",
            report: "Report",
            reportPrompt: "What is wrong with this content?",
            reportFailed: "Could not submit report.",
            reported: "Report submitted.",
            defaultReportReason: "User report",
            actions: "Actions",
          };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleDelete() {
    if (!deleteEndpoint || isDeleting) return;
    setError(null);
    setSuccess(null);
    setIsMenuOpen(false);

    if (!window.confirm(t.deleteConfirm)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(deleteEndpoint, { method: "DELETE" });
      if (!response.ok) {
        const parsed = await response.json().catch(() => null);
        setError(parsed?.error ?? t.deleteFailed);
        return;
      }
      router.refresh();
    } catch {
      setError(t.deleteFailed);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleReport() {
    if (!reportTargetType || !reportTargetId || isReporting) return;
    setError(null);
    setSuccess(null);
    setIsMenuOpen(false);

    setIsReporting(true);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: reportTargetType,
          targetId: reportTargetId,
          reason: t.defaultReportReason,
        }),
      });

      if (!response.ok) {
        const parsed = await response.json().catch(() => null);
        setError(parsed?.error ?? t.reportFailed);
        return;
      }

      setSuccess(t.reported);
      setTimeout(() => setSuccess(null), 2200);
    } catch {
      setError(t.reportFailed);
    } finally {
      setIsReporting(false);
    }
  }

  const showDelete = Boolean(deleteEndpoint && canDelete);
  const showReport = Boolean(
    reportTargetType &&
      reportTargetId &&
      (canReport === undefined ? !canDelete : canReport),
  );
  const showPermalink = Boolean(permalinkHref && permalinkLabel);

  if (!showPermalink && !showDelete && !showReport) {
    return null;
  }

  return (
    <div ref={rootRef} className={className ?? "mt-1.5 flex justify-end"}>
      <div className="relative inline-flex">
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          aria-label={t.actions}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M4 10a1.5 1.5 0 1 1 0-.001V10Zm6 0A1.5 1.5 0 1 1 10 10Zm6 0a1.5 1.5 0 1 1 0-.001V10Z" />
          </svg>
        </button>

        {isMenuOpen ? (
          <div className="absolute right-0 top-7 z-20 min-w-[132px] overflow-hidden rounded-xl border border-white/10 bg-slate-950/95 p-1.5 shadow-lg shadow-black/40 backdrop-blur">
            {showPermalink ? (
              <Link
                href={permalinkHref!}
                onClick={() => setIsMenuOpen(false)}
                className="flex w-full items-center rounded-lg px-2 py-1.5 text-left text-[11px] text-slate-200 transition hover:bg-white/10"
              >
                {permalinkLabel}
              </Link>
            ) : null}
            {showReport ? (
              <button
                type="button"
                onClick={handleReport}
                disabled={isReporting}
                className="flex w-full items-center rounded-lg px-2 py-1.5 text-left text-[11px] text-amber-200 transition hover:bg-amber-400/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t.report}
              </button>
            ) : null}
            {showDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex w-full items-center rounded-lg px-2 py-1.5 text-left text-[11px] text-red-200 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? t.deleting : t.delete}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {error ? <p className="mt-1 text-[10px] text-red-300">{error}</p> : null}
      {success ? <p className="mt-1 text-[10px] text-lime-300">{success}</p> : null}
    </div>
  );
}
