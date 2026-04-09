"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export function AccountSocialLinksSettings({
  locale,
  initialTelegram,
  initialInstagram,
  initialGrowDiariesUrl,
  embedded = false,
}: {
  locale: Locale;
  initialTelegram?: string;
  initialInstagram?: string;
  initialGrowDiariesUrl?: string;
  embedded?: boolean;
}) {
  const router = useRouter();
  const t =
    locale === "ka"
      ? {
          title: "სოციალური პროფილები",
          subtitle: "აჩვენე Telegram, Instagram და GrowDiaries პროფილი.",
          manage: "სოციალური პროფილების შეცვლა",
          telegram: "Telegram ID",
          instagram: "Instagram ID",
          growDiaries: "GrowDiaries Profile URL",
          save: "შენახვა",
          saving: "ინახება...",
          success: "სოციალური ბმულები განახლდა.",
          error: "განახლება ვერ მოხერხდა.",
          hide: "დახურვა",
          open: "გახსნა",
        }
      : locale === "ru"
        ? {
            title: "Социальные профили",
            subtitle: "Покажите Telegram, Instagram и ссылку GrowDiaries.",
            manage: "Изменить социальные профили",
            telegram: "Telegram ID",
            instagram: "Instagram ID",
            growDiaries: "URL профиля GrowDiaries",
            save: "Сохранить",
            saving: "Сохранение...",
            success: "Социальные ссылки обновлены.",
            error: "Не удалось обновить ссылки.",
            hide: "Скрыть",
            open: "Открыть",
          }
        : {
            title: "Social Profiles",
            subtitle: "Show your Telegram, Instagram, and GrowDiaries profile link.",
            manage: "Update social profiles",
            telegram: "Telegram ID",
            instagram: "Instagram ID",
            growDiaries: "GrowDiaries Profile URL",
            save: "Save",
            saving: "Saving...",
            success: "Social links updated.",
            error: "Could not update social links.",
            hide: "Hide",
            open: "Open",
          };

  const [telegram, setTelegram] = useState(initialTelegram ?? "");
  const [instagram, setInstagram] = useState(initialInstagram ?? "");
  const [growDiariesUrl, setGrowDiariesUrl] = useState(initialGrowDiariesUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<null | { ok: boolean; text: string }>(null);
  const [isOpen, setIsOpen] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const response = await fetch("/api/auth/profile/socials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegram, instagram, growDiariesUrl }),
      });
      if (!response.ok) {
        setStatus({ ok: false, text: t.error });
        return;
      }
      setStatus({ ok: true, text: t.success });
      router.refresh();
    } catch {
      setStatus({ ok: false, text: t.error });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={embedded ? "" : "rounded-2xl border border-white/10 bg-slate-950/60 p-4 sm:rounded-[2rem] sm:p-5"}>
      <h2 className="text-base font-semibold text-white sm:text-lg">{t.title}</h2>
      <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">{t.subtitle}</p>
      <div className="mt-3 space-y-2">
        <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-sm font-medium text-white">{t.manage}</span>
            <span className="text-xs text-slate-400">{isOpen ? t.hide : t.open}</span>
          </button>

          {isOpen ? (
            <form onSubmit={onSubmit} className="mt-3 grid gap-2">
              <input
                value={telegram}
                onChange={(event) => setTelegram(event.target.value)}
                placeholder={t.telegram}
                className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2 sm:text-sm"
              />
              <input
                value={instagram}
                onChange={(event) => setInstagram(event.target.value)}
                placeholder={t.instagram}
                className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2 sm:text-sm"
              />
              <input
                value={growDiariesUrl}
                onChange={(event) => setGrowDiariesUrl(event.target.value)}
                placeholder={t.growDiaries}
                className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2 sm:text-sm"
              />
              {status ? (
                <p className={`text-xs ${status.ok ? "text-lime-300" : "text-red-300"}`}>{status.text}</p>
              ) : null}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-fit rounded-full bg-lime-400 px-3 py-1 text-[11px] font-semibold text-slate-950 transition hover:bg-lime-300 disabled:opacity-60"
              >
                {loading ? t.saving : t.save}
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}
