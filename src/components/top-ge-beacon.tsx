"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * TOP.GE pageview beacon without loading counter.js (that script monkey-patches
 * history.pushState for SPAs). Patching pushState can conflict with Next.js App
 * Router and has been linked to flaky behaviour / tab crashes on mobile Chrome.
 *
 * Same request shape as their script: count222 with ID, JS, RAND, etc.
 */
function buildCountUrl(siteId: string, referer: string, isTopFrame: boolean) {
  const pairs: [string, string | number][] = [
    ["ID", siteId],
    ["JS", 11],
    ["RAND", 1e4 * Math.random()],
    ["ISFRM", isTopFrame ? 0 : 1],
    ["REFERER", referer.slice(0, 1000)],
    ["RESOLUTION", `${screen.width}x${screen.height}`],
    ["JL", window.location.href.slice(0, 1000)],
    ["DEPT", screen.colorDepth || screen.pixelDepth],
  ];
  const qs = pairs.map(([k, v]) => `${k}:${encodeURIComponent(String(v))}`).join("+");
  return `https://counter.top.ge/cgi-bin/count222?${qs}`;
}

export function TopGeBeacon({ siteId }: { siteId: string }) {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    function ping() {
      if (cancelled) return;
      let ref = "";
      try {
        ref = document.referrer.slice(0, 1000);
      } catch {
        ref = "";
      }
      const top = window.self === window.top;
      const src = buildCountUrl(siteId, ref, top);
      const img = new Image();
      img.decoding = "async";
      img.referrerPolicy = "no-referrer-when-downgrade";
      img.src = src;
    }

    // Defer until idle so LCP images / hydration are not competing (helps mobile / Vercel).
    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;
    if (typeof requestIdleCallback !== "undefined") {
      idleHandle = requestIdleCallback(ping, { timeout: 5000 });
    } else {
      timeoutHandle = window.setTimeout(ping, 2000);
    }

    return () => {
      cancelled = true;
      if (idleHandle !== undefined && typeof cancelIdleCallback !== "undefined") {
        cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle !== undefined) {
        window.clearTimeout(timeoutHandle);
      }
    };
  }, [siteId, pathname]);

  return (
    <div id="top-ge-counter-container" data-site-id={siteId} className="sr-only" aria-hidden />
  );
}
