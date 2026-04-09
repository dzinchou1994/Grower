"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useRef, useState } from "react";

type TopicOption = {
  slug: string;
  title: string;
};

type Locale = "ka" | "en" | "ru";

export function ForumThreadComposer({
  topics,
  isAuthenticated,
  loginHref,
  locale,
  collapsible = false,
}: {
  topics: TopicOption[];
  isAuthenticated: boolean;
  loginHref: string;
  locale: Locale;
  collapsible?: boolean;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(!collapsible);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const threadIcons = ["💬", "🔥", "🌿", "💡", "🧪", "❓", "🛒", "😮‍💨"];
  const t =
    locale === "ka"
      ? {
          createFailed: "თემის შექმნა ვერ მოხერხდა.",
          created: "თემა წარმატებით შეიქმნა.",
          requestFailed: "მოთხოვნა ვერ შესრულდა. სცადე თავიდან.",
          startThread: "ახალი თემის დაწყება",
          authRequired: "თემის დასაპოსტად საჭიროა ანგარიში.",
          login: "შესვლა",
          subtitle: "დაიწყე დისკუსია და მიიღე პასუხები ქომუნითისგან.",
          titlePlaceholder: "თემის სათაური",
          bodyPlaceholder: "დაწერე შენი შეკითხვა ან დისკუსიის დეტალები...",
          iconLabel: "თემის აიქონი",
          posting: "იტვირთება...",
          postThread: "გამოქვეყნება",
          close: "დახურვა",
        }
      : locale === "ru"
        ? {
            createFailed: "Не удалось создать тему.",
            created: "Тема успешно создана.",
            requestFailed: "Ошибка запроса. Попробуйте снова.",
            startThread: "Создать новую тему",
            authRequired: "Для публикации темы нужен аккаунт.",
            login: "Войти",
            subtitle: "Начните обсуждение и получите ответы от сообщества.",
            titlePlaceholder: "Заголовок темы",
            bodyPlaceholder: "Опишите вопрос или тему обсуждения...",
            iconLabel: "Иконка темы",
            posting: "Публикация...",
            postThread: "Опубликовать тему",
            close: "Закрыть",
          }
        : {
            createFailed: "Could not create thread.",
            created: "Thread created successfully.",
            requestFailed: "Request failed. Try again.",
            startThread: "Start New Thread",
            authRequired: "You need an account to post a thread.",
            login: "Login",
            subtitle: "Create a discussion and get answers from the community.",
            titlePlaceholder: "Thread title",
            bodyPlaceholder: "Write details for your question or discussion...",
            iconLabel: "Thread icon",
            posting: "Posting...",
            postThread: "Post",
            close: "Close",
          };

  const defaultTopic = useMemo(() => topics[0]?.slug ?? "", [topics]);

  function autoResizeTextarea(textarea: HTMLTextAreaElement) {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      topicSlug: String(formData.get("topicSlug") ?? ""),
      title: String(formData.get("title") ?? ""),
      body: String(formData.get("body") ?? ""),
      threadIcon: String(formData.get("threadIcon") ?? "💬"),
    };

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/forum/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const parsed = await response.json().catch(() => null);
        setError(parsed?.error ?? t.createFailed);
        return;
      }

      setSuccess(t.created);
      event.currentTarget.reset();
      if (bodyRef.current) {
        bodyRef.current.style.height = "auto";
      }
      router.refresh();
      setTimeout(() => setSuccess(null), 2500);
    } catch {
      setError(t.requestFailed);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (topics.length === 0) {
    return null;
  }

  if (collapsible && !isOpen) {
    return (
      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-6">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-lime-400 px-2.5 py-1 text-[10px] font-semibold text-slate-950 transition hover:bg-lime-300"
        >
          {t.startThread}
        </button>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-6">
        <h2 className="text-base font-semibold text-white sm:text-lg">{t.startThread}</h2>
      {collapsible ? (
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="mt-2 inline-flex rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-slate-300 transition hover:bg-white/10"
        >
          {t.close}
        </button>
      ) : null}
        <p className="mt-2 text-sm text-slate-300">
          {t.authRequired}
        </p>
        <div className="mt-4 flex gap-2">
          <Link
            href={loginHref}
            className="inline-flex rounded-full bg-lime-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-lime-300"
          >
            {t.login}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-6">
      <h2 className="text-base font-semibold text-white sm:text-lg">{t.startThread}</h2>
      {collapsible ? (
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="mt-2 inline-flex rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-slate-300 transition hover:bg-white/10"
        >
          {t.close}
        </button>
      ) : null}
      <p className="mt-1 text-xs text-slate-400 sm:text-sm">
        {t.subtitle}
      </p>

      <form
        onSubmit={onSubmit}
        onChange={() => {
          if (error) {
            setError(null);
          }
        }}
        className="mt-4 grid gap-3"
      >
        <div className="grid gap-3">
          <div className="rounded-xl border border-white/10 bg-slate-900/70 p-2">
            <p className="mb-1.5 px-1 text-[11px] uppercase tracking-[0.14em] text-slate-400">
              {t.iconLabel}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {threadIcons.map((icon, index) => (
                <label
                  key={icon}
                  className="cursor-pointer"
                >
                  <input
                    type="radio"
                    name="threadIcon"
                    value={icon}
                    defaultChecked={index === 0}
                    className="peer sr-only"
                  />
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-slate-800 text-base transition peer-checked:border-lime-400/50 peer-checked:bg-lime-400/20 peer-checked:text-lime-200 hover:border-lime-300/30">
                    {icon}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <select
            name="topicSlug"
            defaultValue={defaultTopic}
            className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none ring-lime-400/40 focus:ring-2"
            required
          >
            {topics.map((topic) => (
              <option key={topic.slug} value={topic.slug}>
                {topic.title}
              </option>
            ))}
          </select>
        </div>
        <input
          name="title"
          placeholder={t.titlePlaceholder}
          className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2"
          required
        />
        <textarea
          ref={bodyRef}
          name="body"
          placeholder={t.bodyPlaceholder}
          rows={4}
          onInput={(event) => autoResizeTextarea(event.currentTarget)}
          className="resize-none overflow-hidden rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2"
          required
        />

        {error ? <p className="text-xs text-red-300">{error}</p> : null}
        {success ? <p className="text-xs text-lime-300">{success}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-fit items-center justify-center whitespace-nowrap rounded-full bg-lime-400 px-2.5 py-1 text-[10px] font-semibold text-slate-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? t.posting : t.postThread}
        </button>
      </form>
    </section>
  );
}
