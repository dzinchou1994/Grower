/**
 * Build a Wikimedia Commons **thumbnail** URL so the browser downloads KB-sized files instead of
 * full-resolution originals for small UI slots (critical on mobile / Vercel where many large
 * decodes can crash the tab).
 *
 * @see https://commons.wikimedia.org/wiki/Commons:FAQ#What_is_the_URL_structure_for_files_on_Wikimedia_Commons
 */
const COMMONS = "/wikipedia/commons/";

/**
 * PHP `rawurlencode` / Commons path segments: encode `!'()*` which ECMAScript's
 * `encodeURIComponent` leaves unescaped (breaks Commons thumb URLs for names with parentheses).
 */
function commonsPathEncodeFileName(fileName: string): string {
  return encodeURIComponent(fileName).replace(/[!'()*]/g, (ch) => {
    const h = ch.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0");
    return `%${h}`;
  });
}

/** `URL.pathname` segments may still contain `%28`-style escapes; decode before re-encoding for thumb paths. */
function decodePathFilenameSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

export function wikimediaThumbnailUrl(fullUrl: string, widthPx: number): string | null {
  if (!fullUrl.startsWith("http")) {
    return null;
  }
  try {
    const u = new URL(fullUrl);
    if (u.hostname !== "upload.wikimedia.org") {
      return null;
    }
    const path = u.pathname;
    if (!path.startsWith(COMMONS) || path.includes("/thumb/")) {
      return null;
    }

    const rest = path.slice(COMMONS.length);
    const segments = rest.split("/").filter(Boolean);
    if (segments.length < 3) {
      return null;
    }

    const rawSegment = segments[segments.length - 1]!;
    const fileName = decodePathFilenameSegment(rawSegment);
    const hashPath = segments.slice(0, -1).join("/");
    const w = Math.max(20, Math.min(2048, Math.round(widthPx)));
    const enc = commonsPathEncodeFileName(fileName);
    const thumbPath = `${COMMONS}thumb/${hashPath}/${enc}/${w}px-${enc}`;

    return `${u.origin}${thumbPath}`;
  } catch {
    return null;
  }
}

/** Prefer thumb when loading Commons unoptimized (direct browser fetch). */
export function wikimediaSrcForSlot(fullUrl: string, useUnoptimized: boolean, thumbWidth: number): string {
  if (!useUnoptimized) {
    return fullUrl;
  }
  return wikimediaThumbnailUrl(fullUrl, thumbWidth) ?? fullUrl;
}
