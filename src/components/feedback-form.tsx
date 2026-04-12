"use client";

import clsx from "clsx";
import { BookOpen, Globe, Star, Zap, type LucideIcon } from "lucide-react";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";

function labels(locale: Locale) {
  if (locale === "ka") {
    return {
      name: "სახელი (არასავალდებულო)",
      siteRating: "საიტის შეფასება",
      contentRating: "არსებული კონტენტის შეფასება",
      speedRating: "სიჩქარე/სტაბილურობა",
      whatToAdd: "რას დაამატებდი პლატფორმას?",
      whatToImprove: "რა გავაუმჯობესოთ პირველ რიგში?",
      submit: "ფიდბექის გაგზავნა",
      sending: "იგზავნება...",
      success: "მადლობა! შენი ფიდბექი მიღებულია.",
      error: "ვერ გავაგზავნეთ ფიდბექი. სცადე თავიდან.",
    };
  }
  if (locale === "ru") {
    return {
      name: "Имя (необязательно)",
      siteRating: "Оценка сайта",
      contentRating: "Оценка текущего контента",
      speedRating: "Скорость/стабильность",
      whatToAdd: "Что бы вы добавили на платформу?",
      whatToImprove: "Что улучшить в первую очередь?",
      submit: "Отправить отзыв",
      sending: "Отправка...",
      success: "Спасибо! Ваш отзыв получен.",
      error: "Не удалось отправить отзыв. Попробуйте снова.",
    };
  }
  return {
    name: "Name (optional)",
    siteRating: "Site rating",
    contentRating: "Current content rating",
    speedRating: "Speed/stability",
    whatToAdd: "What would you add to the platform?",
    whatToImprove: "What should we improve first?",
    submit: "Send feedback",
    sending: "Sending...",
    success: "Thanks! Your feedback was received.",
    error: "Could not send feedback. Please try again.",
  };
}

export function FeedbackForm({ locale }: { locale: Locale }) {
  const t = labels(locale);
  const [name, setName] = useState("");
  const [siteRating, setSiteRating] = useState(5);
  const [contentRating, setContentRating] = useState(5);
  const [performanceRating, setPerformanceRating] = useState(5);
  const [whatToAdd, setWhatToAdd] = useState("");
  const [whatToImprove, setWhatToImprove] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError(null);
    setDone(false);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          siteRating,
          contentRating,
          performanceRating,
          whatToAdd: whatToAdd.trim(),
          whatToImprove: whatToImprove.trim() || undefined,
        }),
      });
      if (!response.ok) {
        throw new Error("request failed");
      }
      setDone(true);
      setWhatToAdd("");
      setWhatToImprove("");
    } catch {
      setError(t.error);
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 grid gap-3 sm:mt-6">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={t.name}
        className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500"
      />

      <div className="grid gap-2 sm:gap-2.5">
        <RatingRow
          icon={Globe}
          label={t.siteRating}
          value={siteRating}
          onChange={setSiteRating}
        />
        <RatingRow
          icon={BookOpen}
          label={t.contentRating}
          value={contentRating}
          onChange={setContentRating}
        />
        <RatingRow
          icon={Zap}
          label={t.speedRating}
          value={performanceRating}
          onChange={setPerformanceRating}
        />
      </div>

      <textarea
        required
        minLength={8}
        value={whatToAdd}
        onChange={(event) => setWhatToAdd(event.target.value)}
        placeholder={t.whatToAdd}
        rows={4}
        className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500"
      />

      <textarea
        value={whatToImprove}
        onChange={(event) => setWhatToImprove(event.target.value)}
        placeholder={t.whatToImprove}
        rows={3}
        className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500"
      />

      <button
        type="submit"
        disabled={sending}
        className="inline-flex w-fit rounded-full bg-lime-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-lime-300 disabled:opacity-60"
      >
        {sending ? t.sending : t.submit}
      </button>

      {done ? <p className="text-sm text-lime-300">{t.success}</p> : null}
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </form>
  );
}

function RatingRow({
  icon: Icon,
  label,
  value,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-white/[0.08] bg-gradient-to-r from-white/[0.04] to-transparent px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-2.5 sm:pl-3.5 sm:pr-3">
      <span className="flex items-start gap-2.5 text-left sm:min-w-0 sm:flex-1 sm:items-center">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lime-400/10 ring-1 ring-lime-400/20">
          <Icon className="h-4 w-4 text-lime-300/95" strokeWidth={1.75} aria-hidden />
        </span>
        <span className="pt-0.5 text-[13px] font-medium leading-snug text-slate-200 sm:pt-0 sm:text-sm">
          {label}
        </span>
      </span>
      <div
        className="flex items-center justify-center gap-0.5 sm:justify-end"
        role="group"
        aria-label={label}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={clsx(
              "flex h-10 w-10 items-center justify-center rounded-xl transition sm:h-9 sm:w-9",
              "hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/35",
              n === value && "bg-white/[0.06] ring-1 ring-lime-400/25",
            )}
            aria-label={`${n} of 5`}
          >
            <Star
              className={clsx(
                "h-[1.125rem] w-[1.125rem] sm:h-5 sm:w-5",
                n <= value
                  ? "fill-lime-400/95 text-lime-400"
                  : "fill-transparent text-slate-600",
              )}
              strokeWidth={n <= value ? 0 : 1.4}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
