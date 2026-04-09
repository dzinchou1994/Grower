"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

export const OPEN_THREAD_COMPOSER_EVENT = "grower:open-thread-composer";

/** Primary CTA in topic hero — opens hidden {@link ForumThreadComposer} and scrolls to #new-thread */
export function ForumTopicComposeTrigger({ label, className }: { label: string; className: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        document.dispatchEvent(new CustomEvent(OPEN_THREAD_COMPOSER_EVENT));
        requestAnimationFrame(() =>
          document.getElementById("new-thread")?.scrollIntoView({ behavior: "smooth", block: "start" }),
        );
      }}
    >
      {label}
    </button>
  );
}

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
  /** When true, renders nothing until {@link ForumTopicComposeTrigger} or #new-thread hash opens it */
  startHidden = false,
}: {
  topics: TopicOption[];
  isAuthenticated: boolean;
  loginHref: string;
  locale: Locale;
  collapsible?: boolean;
  startHidden?: boolean;
}) {
  const minTitleLength = 6;
  const minBodyLength = 10;
  const maxTitleLength = 140;
  const maxBodyLength = 5000;
  const primaryButtonClass =
    "inline-flex items-center justify-center whitespace-nowrap rounded-full bg-lime-400 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-lime-300 sm:text-sm";
  const subtleButtonClass =
    "inline-flex items-center justify-center whitespace-nowrap rounded-full border border-white/15 px-4 py-2 text-xs text-slate-300 transition hover:bg-white/10 sm:text-sm";
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pendingTopicSlug, setPendingTopicSlug] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(!collapsible && !startHidden);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!startHidden) return;
    function open() {
      setIsOpen(true);
    }
    document.addEventListener(OPEN_THREAD_COMPOSER_EVENT, open);
    return () => document.removeEventListener(OPEN_THREAD_COMPOSER_EVENT, open);
  }, [startHidden]);

  useEffect(() => {
    if (!startHidden || typeof window === "undefined") return;
    if (window.location.hash === "#new-thread") {
      setIsOpen(true);
    }
  }, [startHidden]);
  const threadIcons = ["💬", "🔥", "🌿", "💡", "🧪", "❓", "🛒", "😮‍💨"];
  const t =
    locale === "ka"
      ? {
          createFailed: "თემის შექმნა ვერ მოხერხდა.",
          created: "თემა წარმატებით შეიქმნა.",
          requestFailed: "მოთხოვნა ვერ შესრულდა. სცადე თავიდან.",
          startThread: "ახალი თემის წამოწყება",
          authRequired: "თემის დასაპოსტად საჭიროა ანგარიში.",
          login: "შესვლა",
          subtitle: "დაიწყე დისკუსია და მიიღე პასუხები ქომუნითისგან.",
          titlePlaceholder: "თემის სათაური",
          bodyPlaceholder: "დაწერე შენი შეკითხვა ან დისკუსიის დეტალები...",
          iconLabel: "თემის აიქონი",
          posting: "იტვირთება...",
          postThread: "გამოქვეყნება",
          submitAnother: "კიდევ ერთი თემის შექმნა",
          goToForum: "ფორუმზე დაბრუნება",
          goToTopic: "თემატურ გვერდზე გადასვლა",
          moderationTitle: "გაგზავნილია მოდერაციაზე",
          moderationBody:
            "მადლობა! შენი თემა წარმატებით გაიგზავნა და გამოქვეყნდება მოდერატორის დამტკიცების შემდეგ.",
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
            submitAnother: "Создать еще одну тему",
            goToForum: "Вернуться на форум",
            goToTopic: "Открыть раздел",
            moderationTitle: "Отправлено на модерацию",
            moderationBody:
              "Спасибо! Тема успешно отправлена и будет опубликована после проверки модератором.",
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
            submitAnother: "Create another thread",
            goToForum: "Back to forum",
            goToTopic: "Open topic page",
            moderationTitle: "Sent for moderation",
            moderationBody:
              "Thanks! Your thread was submitted successfully and will appear after moderator approval.",
            close: "Close",
          };

  const defaultTopic = useMemo(() => topics[0]?.slug ?? "", [topics]);

  function autoResizeTextarea(textarea: HTMLTextAreaElement) {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError(null);
    setSuccess(null);
    setPendingTopicSlug(null);

    const formData = new FormData(form);
    const payload = {
      topicSlug: String(formData.get("topicSlug") ?? ""),
      title: String(formData.get("title") ?? ""),
      body: String(formData.get("body") ?? ""),
      threadIcon: String(formData.get("threadIcon") ?? "💬"),
    };

    setIsSubmitting(true);
    let threadPath: string | null = null;
    let isPendingModeration = false;

    try {
      const response = await fetch("/api/forum/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const parsed = await response.json().catch(() => null);
        const issueFields = parsed?.issues?.fieldErrors;
        const firstIssue =
          issueFields?.title?.[0] ??
          issueFields?.body?.[0] ??
          issueFields?.topicSlug?.[0] ??
          issueFields?.threadIcon?.[0] ??
          parsed?.issues?.formErrors?.[0];
        setError(firstIssue ?? parsed?.error ?? t.createFailed);
        setSuccess(null);
        return;
      }

      const parsed = await response.json().catch(() => null);
      const threadSlug = parsed?.thread?.slug as string | undefined;
      const moderationStatus = parsed?.moderationStatus as string | undefined;
      const serverMarkedHidden = Boolean(parsed?.thread?.isHidden);
      isPendingModeration = moderationStatus === "PENDING" || serverMarkedHidden;
      if (threadSlug) {
        threadPath = `/${locale}/forum/${payload.topicSlug}/${threadSlug}`;
      }
    } catch {
      setError(t.requestFailed);
      setSuccess(null);
      return;
    } finally {
      setIsSubmitting(false);
    }

    form.reset();
    if (bodyRef.current) {
      bodyRef.current.style.height = "auto";
    }
    setError(null);
    if (isPendingModeration) {
      setPendingTopicSlug(payload.topicSlug);
      return;
    }
    setSuccess(t.created);

    if (threadPath) {
      try {
        router.push(threadPath);
      } catch {
        if (typeof window !== "undefined") {
          window.location.assign(threadPath);
        }
      }
      return;
    }

    try {
      router.refresh();
    } catch {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }
    setTimeout(() => setSuccess(null), 2500);
  }

  if (topics.length === 0) {
    return null;
  }

  if (startHidden && !isOpen) {
    return null;
  }

  if (collapsible && !isOpen) {
    return (
      <section className="rounded-2xl border border-white/10 bg-transparent p-5 sm:rounded-[2rem] sm:p-6">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`${primaryButtonClass} mx-auto`}
        >
          {t.startThread}
        </button>
      </section>
    );
  }

  const showClose = collapsible || startHidden;

  if (!isAuthenticated) {
    return (
      <section className="rounded-2xl border border-white/10 bg-transparent p-5 sm:rounded-[2rem] sm:p-6">
        <h2 className="text-base font-semibold text-white sm:text-lg">{t.startThread}</h2>
      {showClose ? (
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className={`mt-2 ${subtleButtonClass}`}
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
            className={primaryButtonClass}
          >
            {t.login}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-transparent p-5 sm:rounded-[2rem] sm:p-6">
      <h2 className="text-base font-semibold text-white sm:text-lg">{t.startThread}</h2>
      {showClose ? (
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className={`mt-2 ${subtleButtonClass}`}
        >
          {t.close}
        </button>
      ) : null}
      <p className="mt-1 text-xs text-slate-400 sm:text-sm">
        {t.subtitle}
      </p>

      {pendingTopicSlug ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-lime-400/30 bg-gradient-to-br from-lime-400/12 via-lime-300/8 to-emerald-400/12 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-lime-300/35 bg-lime-300/15 text-lg">
              ✅
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-lime-100 sm:text-base">{t.moderationTitle}</p>
              <p className="mt-1 text-xs leading-relaxed text-lime-50/85 sm:text-sm">
                {t.moderationBody}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPendingTopicSlug(null)}
                  className={primaryButtonClass}
                >
                  {t.submitAnother}
                </button>
                <Link
                  href={`/${locale}/forum/${pendingTopicSlug}`}
                  className={subtleButtonClass}
                >
                  {t.goToTopic}
                </Link>
                <Link href={`/${locale}/forum`} className={subtleButtonClass}>
                  {t.goToForum}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <form
        onSubmit={onSubmit}
        onChange={() => {
          if (error) setError(null);
          if (success) setSuccess(null);
        }}
        className={`mt-4 grid gap-3 ${pendingTopicSlug ? "hidden" : ""}`}
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
          minLength={minTitleLength}
          maxLength={maxTitleLength}
          required
        />
        <textarea
          ref={bodyRef}
          name="body"
          placeholder={t.bodyPlaceholder}
          rows={4}
          onInput={(event) => autoResizeTextarea(event.currentTarget)}
          className="resize-none overflow-hidden rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2"
          minLength={minBodyLength}
          maxLength={maxBodyLength}
          required
        />

        {error ? <p className="text-xs text-red-300">{error}</p> : null}
        {success ? <p className="text-xs text-lime-300">{success}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`${primaryButtonClass} w-fit disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {isSubmitting ? t.posting : t.postThread}
        </button>
      </form>
    </section>
  );
}
