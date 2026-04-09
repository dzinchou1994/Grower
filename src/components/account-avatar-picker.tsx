"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { avatarOptions, getAvatarIdFromImage } from "@/lib/avatar-options";

export function AccountAvatarPicker({
  currentImage,
  compact = false,
}: {
  currentImage?: string | null;
  compact?: boolean;
}) {
  const router = useRouter();
  const [selectedAvatar, setSelectedAvatar] = useState(getAvatarIdFromImage(currentImage));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function saveAvatar() {
    setIsSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/auth/profile/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarId: selectedAvatar }),
      });

      if (!response.ok) {
        const parsed = await response.json().catch(() => null);
        setError(parsed?.error ?? "Could not update avatar.");
        return;
      }

      setMessage("Avatar updated.");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setIsSaving(false);
    }
  }

  const content = (
    <>
      {!compact ? (
        <>
          <h2 className="text-lg font-semibold text-white sm:text-2xl">Profile Avatar</h2>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Pick a 420 style icon for header and forum posts.
          </p>
        </>
      ) : (
        <p className="text-xs text-slate-400 sm:text-sm">
          Pick a profile icon for header and forum posts.
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {avatarOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => {
              setSelectedAvatar(option.id);
              setError(null);
              setMessage(null);
            }}
            className={`rounded-2xl border p-3 text-left transition ${
              selectedAvatar === option.id
                ? "border-lime-400/60 bg-lime-400/10"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-slate-900/70 text-lg">
              {option.imagePath ? (
                <img
                  src={option.imagePath}
                  alt=""
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <span>{option.emoji ?? "🧔"}</span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-300">{option.label}</p>
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={saveAvatar}
          disabled={isSaving}
          className="rounded-full bg-lime-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-lime-300 disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save avatar"}
        </button>
        {message ? <p className="text-xs text-lime-300">{message}</p> : null}
        {error ? <p className="text-xs text-red-300">{error}</p> : null}
      </div>
    </>
  );

  if (compact) {
    return <div>{content}</div>;
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-8">
      {content}
    </section>
  );
}
