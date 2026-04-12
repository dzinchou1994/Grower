"use client";

import { useRouter } from "next/navigation";

type ContactBackLinkProps = {
  label: string;
  fallbackHref: string;
};

/** Browser history back, or fallback when there is no previous entry (e.g. direct open). */
export function ContactBackLink({ label, fallbackHref }: ContactBackLinkProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }}
      className="mb-4 inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-lime-300 sm:text-sm"
    >
      ← {label}
    </button>
  );
}
