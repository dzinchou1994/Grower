"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { avatarOptions, DEFAULT_AVATAR_ID } from "@/lib/avatar-options";

export function AuthRegisterForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATAR_ID);

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
        setError(parsed?.error ?? "Registration failed.");
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 grid gap-3">
      <input
        name="email"
        type="email"
        placeholder="Email"
        className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2"
        required
      />
      <input
        name="username"
        type="text"
        placeholder="Username (letters, numbers, underscore)"
        className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2"
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Password (min 8 chars)"
        className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2"
        required
      />
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
        <p className="text-xs text-slate-300">Choose your profile icon</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {avatarOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedAvatar(option.id)}
              className={`rounded-xl border p-2 text-left transition ${
                selectedAvatar === option.id
                  ? "border-lime-400/70 bg-lime-400/10"
                  : "border-white/10 bg-slate-900 hover:border-white/20"
              }`}
            >
              <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-slate-900/70 text-base">
                {option.imagePath ? (
                  <Image
                    src={option.imagePath}
                    alt=""
                    fill
                    sizes="32px"
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <span>{option.emoji ?? "🧔"}</span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-slate-300">{option.label}</p>
            </button>
          ))}
        </div>
      </div>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-lime-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
