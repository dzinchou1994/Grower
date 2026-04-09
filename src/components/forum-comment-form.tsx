"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function ForumCommentForm({
  threadSlug,
  isAuthenticated,
  loginHref,
  locale,
}: {
  threadSlug: string;
  isAuthenticated: boolean;
  loginHref: string;
  locale: "ka" | "en" | "ru";
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const t =
    locale === "ka"
      ? {
          couldNotAdd: "კომენტარი ვერ დაემატა.",
          posted: "კომენტარი დაემატა.",
          requestFailed: "მოთხოვნა ვერ შესრულდა. სცადე თავიდან.",
          loginToComment: "კომენტარის დასატოვებლად საჭიროა ავტორიზაცია.",
          openLogin: "შესვლა",
          placeholder: "კომენტარი...",
          posting: "იტვირთება...",
          addComment: "დაკომენტარება",
        }
      : locale === "ru"
        ? {
            couldNotAdd: "Не удалось добавить комментарий.",
            posted: "Комментарий опубликован.",
            requestFailed: "Ошибка запроса. Попробуйте снова.",
            loginToComment: "Чтобы комментировать, нужно войти.",
            openLogin: "Войти",
            placeholder: "Комментарий...",
            posting: "Публикация...",
            addComment: "Комментировать",
          }
        : {
            couldNotAdd: "Could not add comment.",
            posted: "Comment posted.",
            requestFailed: "Request failed. Try again.",
            loginToComment: "Login to comment.",
            openLogin: "Open login",
            placeholder: "Add comment...",
            posting: "Posting...",
            addComment: "Add comment",
          };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    const form = event.currentTarget;

    const formData = new FormData(form);
    const payload = {
      body: String(formData.get("body") ?? ""),
    };

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/forum/threads/${threadSlug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const parsed = await response.json().catch(() => null);
        setError(parsed?.error ?? t.couldNotAdd);
        return;
      }

      form.reset();
      setSuccess(t.posted);
      try {
        router.refresh();
      } catch {
        // refresh failure should not show as comment failure
      }
      setTimeout(() => setSuccess(null), 2000);
    } catch {
      setError(t.requestFailed);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      onChange={() => {
        if (error) {
          setError(null);
        }
      }}
      className="mt-4 grid gap-2.5"
    >
      {!isAuthenticated ? (
        <p className="text-xs text-slate-300">
          {t.loginToComment}{" "}
          <Link href={loginHref} className="text-lime-300 hover:text-lime-200">
            {t.openLogin}
          </Link>
        </p>
      ) : null}

      <div className="grid gap-2">
        <input
          name="body"
          placeholder={t.placeholder}
          className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2 sm:text-sm"
          required
          disabled={!isAuthenticated}
        />
      </div>

      {error ? <p className="text-xs text-red-300">{error}</p> : null}
      {success ? <p className="text-xs text-lime-300">{success}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting || !isAuthenticated}
        className="inline-flex w-fit rounded-full border border-lime-400/30 px-2.5 py-1 text-[10px] font-medium text-lime-300 transition hover:bg-lime-400/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? t.posting : t.addComment}
      </button>
    </form>
  );
}
