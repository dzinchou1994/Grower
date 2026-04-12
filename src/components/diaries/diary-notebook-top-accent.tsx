/** Decorative wire-bound / spiral notebook strip for diary create UI. */
export function DiaryNotebookTopAccent() {
  const ringCount = 15;

  return (
    <div
      className="relative z-[1] overflow-hidden border-b border-white/[0.06] bg-gradient-to-b from-[#0d141c] via-[#080c12] to-[#050a0f] px-3 py-3 sm:px-5 sm:py-3.5"
      aria-hidden
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/25 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-3 right-3 top-1/2 h-[1.5px] -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-white/[0.09] to-transparent sm:left-5 sm:right-5"
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-xl items-center justify-center gap-[0.35rem] sm:gap-2">
        {Array.from({ length: ringCount }, (_, i) => (
          <span
            key={i}
            className="h-5 w-[0.55rem] shrink-0 rounded-full border border-white/[0.14] bg-gradient-to-b from-slate-200/25 via-slate-500/18 to-slate-950/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_1px_2px_rgba(0,0,0,0.45)] sm:h-[1.35rem] sm:w-[0.65rem]"
          />
        ))}
      </div>
    </div>
  );
}
