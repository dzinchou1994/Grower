"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ForumSearchSuggestionItem } from "@/lib/forum-data";
import { getLocalizedPath, type Locale } from "@/lib/i18n";

type ForumSearchInputProps = {
  locale: Locale;
  defaultValue: string;
  placeholder: string;
  searchLabel: string;
  sectionThreads: string;
  sectionComments: string;
  loadingLabel: string;
  emptyLabel: string;
};

export function ForumSearchInput({
  locale,
  defaultValue,
  placeholder,
  searchLabel,
  sectionThreads,
  sectionComments,
  loadingLabel,
  emptyLabel,
}: ForumSearchInputProps) {
  const pathname = usePathname();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ForumSearchSuggestionItem[]>([]);
  const [active, setActive] = useState(-1);

  const fetchSuggestions = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (trimmed.length < 2) {
        setItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `/api/forum/search-suggestions?q=${encodeURIComponent(trimmed)}&locale=${encodeURIComponent(locale)}`,
        );
        if (!res.ok) {
          setItems([]);
          return;
        }
        const data = (await res.json()) as { items?: ForumSearchSuggestionItem[] };
        setItems(Array.isArray(data.items) ? data.items : []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [locale],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setActive(-1);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const onChange = (next: string) => {
    setValue(next);
    setOpen(true);
    setActive(-1);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      void fetchSuggestions(next);
    }, 280);
  };

  const threadItems = items.filter((i) => i.kind === "thread");
  const commentItems = items.filter((i) => i.kind === "comment");
  const flatNav = items;

  const hrefFor = (item: ForumSearchSuggestionItem) => {
    if (item.kind === "thread") {
      return getLocalizedPath(locale, `/forum/${item.topicSlug}/${item.threadSlug}`);
    }
    return getLocalizedPath(
      locale,
      `/forum/${item.topicSlug}/${item.threadSlug}/comments/${item.commentId}`,
    );
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || flatNav.length === 0) {
      if (e.key === "ArrowDown" && value.trim().length >= 2) {
        setOpen(true);
        void fetchSuggestions(value);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, flatNav.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    } else if (e.key === "Enter" && active >= 0 && flatNav[active]) {
      e.preventDefault();
      window.location.href = hrefFor(flatNav[active]);
    }
  };

  return (
    <form
      className="relative mt-2 flex flex-col gap-2 border-t border-white/10 pt-4 sm:mt-3 sm:flex-row sm:items-center sm:gap-3"
      method="GET"
      action={pathname || undefined}
    >
      <div ref={wrapRef} className="relative min-w-0 flex-1">
        <input
          ref={inputRef}
          type="text"
          name="q"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setOpen(true);
            if (value.trim().length >= 2) {
              void fetchSuggestions(value);
            }
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none ring-lime-400/40 focus:ring-2 sm:px-3 sm:py-2"
        />

        {open && value.trim().length >= 2 ? (
          <div
            id={listId}
            role="listbox"
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-slate-950/98 py-1 shadow-xl ring-1 ring-black/40 backdrop-blur-sm"
          >
            {loading ? (
              <p className="px-3 py-2 text-xs text-slate-400">{loadingLabel}</p>
            ) : items.length === 0 ? (
              <p className="px-3 py-2 text-xs text-slate-400">{emptyLabel}</p>
            ) : (
              <>
                {threadItems.length > 0 ? (
                  <>
                    <p className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      {sectionThreads}
                    </p>
                    {threadItems.map((item) => {
                      const globalIdx = flatNav.indexOf(item);
                      const isActive = globalIdx === active;
                      return (
                        <Link
                          key={`t-${item.threadSlug}`}
                          href={hrefFor(item)}
                          role="option"
                          aria-selected={isActive}
                          className={`block border-l-2 border-transparent px-3 py-2 text-left transition ${
                            isActive
                              ? "border-lime-400/80 bg-white/10"
                              : "hover:bg-white/5"
                          }`}
                          onMouseEnter={() => setActive(globalIdx)}
                          onClick={() => setOpen(false)}
                        >
                          <span className="line-clamp-1 text-sm font-medium text-white">
                            {item.threadTitle}
                          </span>
                          <span className="line-clamp-1 text-xs text-slate-500">{item.topicTitle}</span>
                          {item.snippet ? (
                            <span className="mt-0.5 line-clamp-2 text-xs text-slate-400">{item.snippet}</span>
                          ) : null}
                        </Link>
                      );
                    })}
                  </>
                ) : null}

                {commentItems.length > 0 ? (
                  <>
                    <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      {sectionComments}
                    </p>
                    {commentItems.map((item) => {
                      const globalIdx = flatNav.indexOf(item);
                      const isActive = globalIdx === active;
                      return (
                        <Link
                          key={`c-${item.commentId}`}
                          href={hrefFor(item)}
                          role="option"
                          aria-selected={isActive}
                          className={`block border-l-2 border-transparent px-3 py-2 text-left transition ${
                            isActive
                              ? "border-lime-400/80 bg-white/10"
                              : "hover:bg-white/5"
                          }`}
                          onMouseEnter={() => setActive(globalIdx)}
                          onClick={() => setOpen(false)}
                        >
                          <span className="line-clamp-1 text-sm font-medium text-white">
                            {item.threadTitle}
                          </span>
                          <span className="line-clamp-2 text-xs text-slate-400">{item.snippet}</span>
                        </Link>
                      );
                    })}
                  </>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </div>

      <button
        type="submit"
        className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10 sm:px-4 sm:py-2 sm:text-sm"
      >
        {searchLabel}
      </button>
    </form>
  );
}
