"use client";

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

      <div className="grid gap-2 sm:grid-cols-3">
        <RatingField
          label={t.siteRating}
          value={siteRating}
          onChange={setSiteRating}
        />
        <RatingField
          label={t.contentRating}
          value={contentRating}
          onChange={setContentRating}
        />
        <RatingField
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

function RatingField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <span className="mb-1 block text-xs text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded-lg border border-white/10 bg-slate-900 px-2 py-1.5 text-sm text-white"
      >
        <option value={5}>5/5</option>
        <option value={4}>4/5</option>
        <option value={3}>3/5</option>
        <option value={2}>2/5</option>
        <option value={1}>1/5</option>
      </select>
    </label>
  );
}
