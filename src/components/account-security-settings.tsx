"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export function AccountSecuritySettings({
  currentEmail,
  locale,
  embedded = false,
}: {
  currentEmail: string;
  locale: Locale;
  embedded?: boolean;
}) {
  const router = useRouter();
  const t =
    locale === "ka"
      ? {
          couldNotUpdateEmail: "ელფოსტის განახლება ვერ მოხერხდა.",
          emailUpdated: "ელფოსტა განახლდა.",
          networkError: "ქსელის შეცდომა. სცადე თავიდან.",
          confirmMismatch: "პაროლის დადასტურება არ ემთხვევა.",
          couldNotUpdatePassword: "პაროლის განახლება ვერ მოხერხდა.",
          passwordUpdated: "პაროლი განახლდა.",
          title: "უსაფრთხოების პარამეტრები",
          subtitle: "განაახლე ელფოსტა და პაროლი მიმდინარე პაროლის დადასტურებით.",
          changeEmail: "ელფოსტის შეცვლა",
          changePassword: "პაროლის შეცვლა",
          hide: "დახურვა",
          open: "გახსნა",
          currentPassword: "მიმდინარე პაროლი",
          newPassword: "ახალი პაროლი (მინ. 8)",
          confirmNewPassword: "დაადასტურე ახალი პაროლი",
          saving: "ინახება...",
          updateEmail: "ელფოსტის განახლება",
          updatePassword: "პაროლის განახლება",
        }
      : locale === "ru"
        ? {
            couldNotUpdateEmail: "Не удалось обновить email.",
            emailUpdated: "Email обновлен.",
            networkError: "Сетевая ошибка. Попробуйте снова.",
            confirmMismatch: "Подтверждение пароля не совпадает.",
            couldNotUpdatePassword: "Не удалось обновить пароль.",
            passwordUpdated: "Пароль обновлен.",
            title: "Настройки безопасности",
            subtitle: "Обновите email и пароль с подтверждением текущего пароля.",
            changeEmail: "Изменить email",
            changePassword: "Изменить пароль",
            hide: "Скрыть",
            open: "Открыть",
            currentPassword: "Текущий пароль",
            newPassword: "Новый пароль (мин. 8)",
            confirmNewPassword: "Подтвердите новый пароль",
            saving: "Сохранение...",
            updateEmail: "Обновить email",
            updatePassword: "Обновить пароль",
          }
        : {
            couldNotUpdateEmail: "Could not update email.",
            emailUpdated: "Email updated.",
            networkError: "Network error. Try again.",
            confirmMismatch: "Password confirmation does not match.",
            couldNotUpdatePassword: "Could not update password.",
            passwordUpdated: "Password updated.",
            title: "Security Settings",
            subtitle: "Update your email and password with current-password verification.",
            changeEmail: "Change Email",
            changePassword: "Change Password",
            hide: "Hide",
            open: "Open",
            currentPassword: "Current password",
            newPassword: "New password (min 8)",
            confirmNewPassword: "Confirm new password",
            saving: "Saving...",
            updateEmail: "Update email",
            updatePassword: "Update password",
          };

  const [email, setEmail] = useState(currentEmail);
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<"email" | "password" | null>(null);

  async function onEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingEmail(true);
    setEmailSuccess(null);
    setEmailError(null);

    try {
      const response = await fetch("/api/auth/profile/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          currentPassword: currentPasswordForEmail,
        }),
      });

      if (!response.ok) {
        const parsed = await response.json().catch(() => null);
        setEmailError(parsed?.error ?? t.couldNotUpdateEmail);
        return;
      }

      setCurrentPasswordForEmail("");
      setEmailSuccess(t.emailUpdated);
      router.refresh();
    } catch {
      setEmailError(t.networkError);
    } finally {
      setIsSavingEmail(false);
    }
  }

  async function onPasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingPassword(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError(t.confirmMismatch);
      setIsSavingPassword(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      if (!response.ok) {
        const parsed = await response.json().catch(() => null);
        setPasswordError(parsed?.error ?? t.couldNotUpdatePassword);
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(t.passwordUpdated);
    } catch {
      setPasswordError(t.networkError);
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <div className={embedded ? "" : "rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-8"}>
      <h2 className="text-base font-semibold text-white sm:text-lg">{t.title}</h2>
      <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">
        {t.subtitle}
      </p>

      <div className="mt-3 space-y-2">
        <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
          <button
            type="button"
            onClick={() => setActivePanel(activePanel === "email" ? null : "email")}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-sm font-medium text-white">{t.changeEmail}</span>
            <span className="text-xs text-slate-400">
              {activePanel === "email" ? t.hide : t.open}
            </span>
          </button>

          {activePanel === "email" ? (
            <form onSubmit={onEmailSubmit} className="mt-3 grid gap-2">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2 sm:text-sm"
                required
              />
              <input
                type="password"
                value={currentPasswordForEmail}
                onChange={(event) => setCurrentPasswordForEmail(event.target.value)}
                placeholder={t.currentPassword}
                className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2 sm:text-sm"
                required
              />
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSavingEmail}
                  className="rounded-full bg-lime-400 px-3 py-1 text-[11px] font-semibold text-slate-950 transition hover:bg-lime-300 disabled:opacity-60"
                >
                  {isSavingEmail ? t.saving : t.updateEmail}
                </button>
                {emailSuccess ? <p className="text-xs text-lime-300">{emailSuccess}</p> : null}
                {emailError ? <p className="text-xs text-red-300">{emailError}</p> : null}
              </div>
            </form>
          ) : null}
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
          <button
            type="button"
            onClick={() => setActivePanel(activePanel === "password" ? null : "password")}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-sm font-medium text-white">{t.changePassword}</span>
            <span className="text-xs text-slate-400">
              {activePanel === "password" ? t.hide : t.open}
            </span>
          </button>

          {activePanel === "password" ? (
            <form onSubmit={onPasswordSubmit} className="mt-3 grid gap-2">
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder={t.currentPassword}
                className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2 sm:text-sm"
                required
              />
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder={t.newPassword}
                minLength={8}
                className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2 sm:text-sm"
                required
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder={t.confirmNewPassword}
                minLength={8}
                className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2 sm:text-sm"
                required
              />
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="rounded-full bg-lime-400 px-3 py-1 text-[11px] font-semibold text-slate-950 transition hover:bg-lime-300 disabled:opacity-60"
                >
                  {isSavingPassword ? t.saving : t.updatePassword}
                </button>
                {passwordSuccess ? (
                  <p className="text-xs text-lime-300">{passwordSuccess}</p>
                ) : null}
                {passwordError ? <p className="text-xs text-red-300">{passwordError}</p> : null}
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}
