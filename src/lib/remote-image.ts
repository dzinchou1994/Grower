/**
 * Wikimedia Commons often rejects or throttles server-side fetches (Next.js image optimizer).
 * Loading these URLs in the browser works; use `unoptimized` on `next/image` in that case.
 */
export function preferUnoptimizedRemoteImage(src: string): boolean {
  if (!src.startsWith("http")) {
    return false;
  }
  try {
    const { hostname } = new URL(src);
    return hostname === "upload.wikimedia.org";
  } catch {
    return false;
  }
}
