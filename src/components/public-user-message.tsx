"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";

export function PublicUserMessage({
  locale,
  toUsername,
  toUserId,
}: {
  locale: Locale;
  toUsername: string;
  toUserId?: string;
}) {
  const t =
    locale === "ka"
      ? {
          title: "პირადი შეტყობინება",
          placeholder: "მოკლე მესიჯი...",
          send: "გაგზავნა",
          sending: "იგზავნება...",
          success: "შეტყობინება გაიგზავნა.",
          error: "შეტყობინება ვერ გაიგზავნა.",
        }
      : locale === "ru"
        ? {
            title: "Личное сообщение",
            placeholder: "Короткое сообщение...",
            send: "Отправить",
            sending: "Отправка...",
            success: "Сообщение отправлено.",
            error: "Не удалось отправить сообщение.",
          }
        : {
            title: "Private message",
            placeholder: "Short message...",
            send: "Send",
            sending: "Sending...",
            success: "Message sent.",
            error: "Could not send message.",
          };

  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<null | { ok: boolean; text: string }>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    setStatus(null);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUsername, toUserId, body }),
      });
      if (!response.ok) {
        setStatus({ ok: false, text: t.error });
        return;
      }
      setBody("");
      setStatus({ ok: true, text: t.success });
    } catch {
      setStatus({ ok: false, text: t.error });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:rounded-3xl sm:p-5">
      <p className="text-sm font-medium text-white">{t.title}</p>
      <form onSubmit={onSubmit} className="mt-3 grid gap-2">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={t.placeholder}
          rows={3}
          className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500"
          required
        />
        {status ? (
          <p className={`text-xs ${status.ok ? "text-lime-300" : "text-red-300"}`}>{status.text}</p>
        ) : null}
        <button
          type="submit"
          disabled={sending}
          className="inline-flex w-fit rounded-full bg-lime-400 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-lime-300 disabled:opacity-60"
        >
          {sending ? t.sending : t.send}
        </button>
      </form>
    </div>
  );
}
