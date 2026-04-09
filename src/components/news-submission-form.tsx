"use client";

import { FormEvent, useState } from "react";
import type { Locale } from "@/lib/i18n";

export function NewsSubmissionForm({
  locale,
  isAuthenticated,
}: {
  locale: Locale;
  isAuthenticated: boolean;
}) {
  const t =
    locale === "ka"
      ? {
          title: "დაამატე შენი სიახლე",
          subtitle: "შენი სტატია გამოქვეყნდება მხოლოდ ადმინის განხილვისა და რედაქტირების შემდეგ.",
          headline: "სათაური",
          body: "ტექსტი",
          scope: "რეგიონი",
          georgia: "საქართველო",
          world: "მსოფლიო",
          imageUrl: "სურათის URL (არასავალდებულო)",
          sourceName: "წყაროს სახელი (არასავალდებულო)",
          sourceUrl: "წყაროს ლინკი (არასავალდებულო)",
          submit: "გაგზავნა",
          open: "დაამატე სიახლე",
          close: "დახურვა",
          sending: "იგზავნება...",
          success: "სიახლე წარმატებით დაემატა. ადმინი მალე განიხილავს.",
          login: "სიახლის დასამატებლად ჯერ გაიარე ავტორიზაცია.",
        }
      : locale === "ru"
        ? {
            title: "Предложить новость",
            subtitle: "Материал публикуется только после проверки и редактирования админом.",
            headline: "Заголовок",
            body: "Текст",
            scope: "Регион",
            georgia: "Грузия",
            world: "Мир",
            imageUrl: "URL изображения (необязательно)",
            sourceName: "Источник (необязательно)",
            sourceUrl: "Ссылка на источник (необязательно)",
            submit: "Отправить",
            open: "Добавить новость",
            close: "Закрыть",
            sending: "Отправка...",
            success: "Новость отправлена. Админ рассмотрит ее в ближайшее время.",
            login: "Чтобы отправить новость, сначала войдите в аккаунт.",
          }
        : {
            title: "Submit News",
            subtitle: "Your item is published only after admin review and editing.",
            headline: "Headline",
            body: "Body",
            scope: "Region",
            georgia: "Georgia",
            world: "World",
            imageUrl: "Image URL (optional)",
            sourceName: "Source name (optional)",
            sourceUrl: "Source URL (optional)",
            submit: "Submit",
            open: "Add News",
            close: "Close",
            sending: "Submitting...",
            success: "News submitted. Admin will review it shortly.",
            login: "Please log in before submitting news.",
          };

  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [scope, setScope] = useState<"GEORGIA" | "WORLD">("GEORGIA");
  const [imageUrl, setImageUrl] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAuthenticated) return;
    setStatus("submitting");
    setError(null);
    try {
      const response = await fetch("/api/news/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: headline,
          body,
          scope,
          imageUrl,
          sourceName,
          sourceUrl,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setStatus("error");
        setError(payload?.error ?? "Request failed.");
        return;
      }
      setHeadline("");
      setBody("");
      setScope("GEORGIA");
      setImageUrl("");
      setSourceName("");
      setSourceUrl("");
      setStatus("ok");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
      setError("Network error.");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex w-full justify-center">
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-lime-400 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-lime-300"
          aria-expanded={isOpen}
        >
          {isOpen ? t.close : t.open}
        </button>
      </div>

      {isOpen ? (
        <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 sm:rounded-[2rem] sm:p-6">
          <h2 className="text-base font-semibold text-white sm:text-xl">{t.title}</h2>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">{t.subtitle}</p>
          {!isAuthenticated ? <p className="mt-3 text-xs text-amber-200">{t.login}</p> : null}
          <form onSubmit={onSubmit} className="mt-4 grid gap-2.5">
            <input
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
              placeholder={t.headline}
              className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
              disabled={!isAuthenticated || status === "submitting"}
              required
            />
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder={t.body}
              className="min-h-[120px] rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
              disabled={!isAuthenticated || status === "submitting"}
              required
            />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <select
                value={scope}
                onChange={(event) => setScope(event.target.value as "GEORGIA" | "WORLD")}
                className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
                disabled={!isAuthenticated || status === "submitting"}
              >
                <option value="GEORGIA">{t.scope}: {t.georgia}</option>
                <option value="WORLD">{t.scope}: {t.world}</option>
              </select>
              <input
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder={t.imageUrl}
                className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
                disabled={!isAuthenticated || status === "submitting"}
              />
              <input
                value={sourceName}
                onChange={(event) => setSourceName(event.target.value)}
                placeholder={t.sourceName}
                className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
                disabled={!isAuthenticated || status === "submitting"}
              />
              <input
                value={sourceUrl}
                onChange={(event) => setSourceUrl(event.target.value)}
                placeholder={t.sourceUrl}
                className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
                disabled={!isAuthenticated || status === "submitting"}
              />
            </div>
            <button
              type="submit"
              disabled={!isAuthenticated || status === "submitting"}
              className="inline-flex w-fit rounded-full bg-lime-400 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-lime-300 disabled:opacity-60"
            >
              {status === "submitting" ? t.sending : t.submit}
            </button>
            {status === "ok" ? <p className="text-xs text-lime-300">{t.success}</p> : null}
            {status === "error" && error ? <p className="text-xs text-red-300">{error}</p> : null}
          </form>
        </section>
      ) : null}
    </div>
  );
}

