"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Link2, MessageCircle, Send, Share2 } from "lucide-react";

export type DiaryShareLabels = {
  title: string;
  copyLink: string;
  copied: string;
  native: string;
  x: string;
  facebook: string;
  telegram: string;
  whatsapp: string;
};

type Props = {
  url: string;
  title: string;
  text: string;
  labels: DiaryShareLabels;
};

export function DiarySharePanel({ url, title, text, labels }: Props) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const snippet = text.trim().slice(0, 220);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* ignore */
    }
  }, [url]);

  const tryNativeShare = useCallback(async () => {
    if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
      await copyLink();
      return;
    }
    try {
      await navigator.share({
        title,
        text: snippet || title,
        url,
      });
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        return;
      }
      await copyLink();
    }
  }, [copyLink, snippet, title, url]);

  const encUrl = encodeURIComponent(url);
  const xText = encodeURIComponent(`${title}\n${url}`.slice(0, 500));

  const href = {
    x: `https://twitter.com/intent/tweet?text=${xText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`,
    telegram: `https://t.me/share/url?url=${encUrl}&text=${encodeURIComponent(title)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
  };

  /** Compact icon control - full labels via title + aria-label only. */
  const iconBtn =
    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.03] text-slate-400 transition hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400/45 active:scale-[0.97]";

  return (
    <div
      role="toolbar"
      aria-label={labels.title}
      className="inline-flex max-w-full flex-wrap items-center gap-1"
    >
      {canNativeShare ? (
        <button
          type="button"
          className={iconBtn}
          onClick={() => void tryNativeShare()}
          title={labels.native}
          aria-label={labels.native}
        >
          <Share2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </button>
      ) : null}
      <button
        type="button"
        className={iconBtn}
        onClick={() => void copyLink()}
        title={copied ? labels.copied : labels.copyLink}
        aria-label={copied ? labels.copied : labels.copyLink}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-lime-400" strokeWidth={2} aria-hidden />
        ) : (
          <Link2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        )}
      </button>
      <a
        href={href.x}
        target="_blank"
        rel="noopener noreferrer"
        className={`${iconBtn} font-semibold text-[11px] leading-none text-slate-300 hover:text-white`}
        title={labels.x}
        aria-label={labels.x}
      >
        X
      </a>
      <a
        href={href.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className={`${iconBtn} font-serif text-[13px] font-bold leading-none text-slate-300 hover:text-white`}
        title={labels.facebook}
        aria-label={labels.facebook}
      >
        f
      </a>
      <a
        href={href.telegram}
        target="_blank"
        rel="noopener noreferrer"
        className={iconBtn}
        title={labels.telegram}
        aria-label={labels.telegram}
      >
        <Send className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
      </a>
      <a
        href={href.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className={iconBtn}
        title={labels.whatsapp}
        aria-label={labels.whatsapp}
      >
        <MessageCircle className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
      </a>
    </div>
  );
}
