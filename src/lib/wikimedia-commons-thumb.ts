/**
 * Build a MediaWiki thumbnail URL for upload.wikimedia.org originals.
 * Use for small UI slots when `next/image` is unoptimized (browser loads URL directly),
 * so phones do not pull multi‑megabyte originals for 64–200px thumbnails.
 *
 * @see https://commons.wikimedia.org/wiki/Commons:FAQ#What_is_the_URL_for_a_thumbnail.3F
 */
export function wikimediaCommonsThumbnailUrl(originalUrl: string, widthPx: number): string | null {
  try {
    const u = new URL(originalUrl);
    if (u.hostname !== "upload.wikimedia.org") {
      return null;
    }
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 5) {
      return null;
    }
    if (parts[0] !== "wikipedia" || parts[1] !== "commons") {
      return null;
    }
    if (parts[2] === "thumb") {
      return null;
    }
    const fileName = parts[parts.length - 1];
    const hashPath = parts.slice(2, -1).join("/");
    if (!hashPath || !fileName) {
      return null;
    }
    const w = Math.min(2048, Math.max(20, Math.round(widthPx)));
    return `${u.origin}/wikipedia/commons/thumb/${hashPath}/${fileName}/${w}px-${fileName}`;
  } catch {
    return null;
  }
}

/** Prefer thumb when loading full-size remote URLs in small boxes (retina ≈ 2×). */
export function wikimediaSizedSrc(
  url: string,
  cssMaxEdgePx: number,
  useUnoptimized: boolean,
): string {
  if (!useUnoptimized) {
    return url;
  }
  const thumb = wikimediaCommonsThumbnailUrl(url, cssMaxEdgePx * 2);
  return thumb ?? url;
}
