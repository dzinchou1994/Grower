import Link from "next/link";

export type DiaryNotebookBack = {
  href: string;
  label: string;
  ariaLabel: string;
};

type DiaryNotebookTopAccentProps = {
  back?: DiaryNotebookBack;
};

/** Wire-bound / spiral notebook strip; optional compact back control on the left. */
export function DiaryNotebookTopAccent({ back }: DiaryNotebookTopAccentProps) {
  const ringCount = 15;

  return (
    <div className="relative z-[1] overflow-hidden border-b border-white/[0.06] bg-gradient-to-b from-[#0d141c] via-[#080c12] to-[#050a0f] px-3 py-2.5 sm:px-5 sm:py-3">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/25 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-3 right-3 top-1/2 h-[1.5px] -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-white/[0.09] to-transparent sm:left-5 sm:right-5"
        aria-hidden
      />

      <div className="relative flex min-h-[1.75rem] items-center justify-center sm:min-h-[1.85rem]">
        {back ? (
          <Link
            href={back.href}
            aria-label={back.ariaLabel}
            className="group absolute left-0 top-1/2 z-10 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-full border border-white/[0.1] bg-black/25 px-2 py-1 text-[11px] font-medium text-slate-400 shadow-sm shadow-black/30 transition hover:border-yellow-400/35 hover:bg-white/[0.06] hover:text-yellow-200 sm:left-0.5"
          >
            <svg
              className="h-3 w-3 shrink-0 text-slate-500 transition group-hover:-translate-x-0.5 group-hover:text-yellow-200/90"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
            </svg>
            <span className="font-sans leading-none tracking-tight">{back.label}</span>
          </Link>
        ) : null}

        <div
          className="pointer-events-none flex max-w-xl items-center justify-center gap-[0.35rem] sm:gap-2"
          aria-hidden
        >
          {Array.from({ length: ringCount }, (_, i) => (
            <span
              key={i}
              className="h-5 w-[0.55rem] shrink-0 rounded-full border border-white/[0.14] bg-gradient-to-b from-slate-200/25 via-slate-500/18 to-slate-950/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_1px_2px_rgba(0,0,0,0.45)] sm:h-[1.35rem] sm:w-[0.65rem]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
