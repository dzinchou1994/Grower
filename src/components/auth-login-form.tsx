"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function AuthLoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const parsed = await response.json().catch(() => null);
        setError(parsed?.error ?? "Login failed.");
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
        name="password"
        type="password"
        placeholder="Password"
        className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2"
        required
      />
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-lime-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
