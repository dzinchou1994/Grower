"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { avatarOptions, DEFAULT_AVATAR_ID } from "@/lib/avatar-options";

type AuthRegisterCopy = {
  emailPlaceholder: string;
  usernamePlaceholder: string;
  passwordPlaceholder: string;
  chooseProfileIcon: string;
  registrationFailed: string;
  networkError: string;
  creatingAccount: string;
  createAccount: string;
};

const defaultAuthRegisterCopy: AuthRegisterCopy = {
  emailPlaceholder: "Email",
  usernamePlaceholder: "Username (letters, numbers, underscore)",
  passwordPlaceholder: "Password (min 8 chars)",
  chooseProfileIcon: "Choose your profile icon",
  registrationFailed: "Registration failed.",
  networkError: "Network error. Try again.",
  creatingAccount: "Creating account...",
  createAccount: "Create account",
};

export function AuthRegisterForm({
  redirectTo,
  copy = defaultAuthRegisterCopy,
}: {
  redirectTo: string;
  copy?: AuthRegisterCopy;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATAR_ID);
  const [visibleAvatarCount, setVisibleAvatarCount] = useState(3);

  const shownAvatarOptions = avatarOptions.slice(0, visibleAvatarCount);
  const hasMoreAvatars = visibleAvatarCount < avatarOptions.length;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get("email") ?? ""),
      username: String(formData.get("username") ?? ""),
      password: String(formData.get("password") ?? ""),
      avatarId: selectedAvatar,
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const parsed = await response.json().catch(() => null);
        setError(parsed?.error ?? copy.registrationFailed);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError(copy.networkError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 grid gap-3">
      <input
        name="email"
        type="email"
        placeholder={copy.emailPlaceholder}
        className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2"
        required
      />
      <input
        name="username"
        type="text"
        placeholder={copy.usernamePlaceholder}
        className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2"
        required
      />
      <input
        name="password"
        type="password"
        placeholder={copy.passwordPlaceholder}
        className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2"
        required
      />
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-2.5">
        <p className="text-xs text-slate-300">{copy.chooseProfileIcon}</p>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {shownAvatarOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedAvatar(option.id)}
              className={`rounded-xl border p-1.5 text-left transition ${
                selectedAvatar === option.id
                  ? "border-lime-400/70 bg-lime-400/10"
                  : "border-white/10 bg-slate-900 hover:border-white/20"
              }`}
            >
              <div className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-slate-900/70 text-sm">
                {option.imagePath ? (
                  <Image
                    src={option.imagePath}
                    alt=""
                    fill
                    sizes="28px"
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <span>{option.emoji ?? "🧔"}</span>
                )}
              </div>
              <p className="mt-1 line-clamp-1 text-[10px] text-slate-300">{option.label}</p>
            </button>
          ))}
        </div>
        {hasMoreAvatars ? (
          <button
            type="button"
            onClick={() =>
              setVisibleAvatarCount((current) =>
                Math.min(current + 6, avatarOptions.length),
              )
            }
            className="mt-2 text-xs font-medium text-lime-300 transition hover:text-lime-200"
          >
            See more
          </button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-lime-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? copy.creatingAccount : copy.createAccount}
      </button>
    </form>
  );
}
