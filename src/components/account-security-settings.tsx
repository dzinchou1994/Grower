"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AccountSecuritySettings({ currentEmail }: { currentEmail: string }) {
  const router = useRouter();

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
        setEmailError(parsed?.error ?? "Could not update email.");
        return;
      }

      setCurrentPasswordForEmail("");
      setEmailSuccess("Email updated.");
      router.refresh();
    } catch {
      setEmailError("Network error. Try again.");
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
      setPasswordError("Password confirmation does not match.");
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
        setPasswordError(parsed?.error ?? "Could not update password.");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Password updated.");
    } catch {
      setPasswordError("Network error. Try again.");
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-8">
      <h2 className="text-lg font-semibold text-white sm:text-2xl">Security Settings</h2>
      <p className="mt-1 text-xs text-slate-400 sm:text-sm">
        Update your email and password with current-password verification.
      </p>

      <div className="mt-5 space-y-3">
        <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
          <button
            type="button"
            onClick={() => setActivePanel(activePanel === "email" ? null : "email")}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-sm font-medium text-white">Change Email</span>
            <span className="text-xs text-slate-400">
              {activePanel === "email" ? "Hide" : "Open"}
            </span>
          </button>

          {activePanel === "email" ? (
            <form onSubmit={onEmailSubmit} className="mt-3 grid gap-2">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2"
                required
              />
              <input
                type="password"
                value={currentPasswordForEmail}
                onChange={(event) => setCurrentPasswordForEmail(event.target.value)}
                placeholder="Current password"
                className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2"
                required
              />
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSavingEmail}
                  className="rounded-full bg-lime-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-lime-300 disabled:opacity-60"
                >
                  {isSavingEmail ? "Saving..." : "Update email"}
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
            <span className="text-sm font-medium text-white">Change Password</span>
            <span className="text-xs text-slate-400">
              {activePanel === "password" ? "Hide" : "Open"}
            </span>
          </button>

          {activePanel === "password" ? (
            <form onSubmit={onPasswordSubmit} className="mt-3 grid gap-2">
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Current password"
                className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2"
                required
              />
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="New password (min 8)"
                minLength={8}
                className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2"
                required
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm new password"
                minLength={8}
                className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2"
                required
              />
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="rounded-full bg-lime-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-lime-300 disabled:opacity-60"
                >
                  {isSavingPassword ? "Saving..." : "Update password"}
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
    </section>
  );
}
