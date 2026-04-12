/**
 * `upload.wikimedia.org`: Next.js optimizer fetches images **server-side**; Commons often blocks
 * or rate-limits those requests, and some URLs break when piped through `/_next/image` — so we
 * **default to `unoptimized`** (browser loads the file directly; reliable).
 *
 * Set `NEXT_PUBLIC_IMAGE_OPTIMIZE_WIKIMEDIA=1` to try the optimizer (WebP/resize) when your
 * deployment successfully fetches Commons from the server (verify in production).
 *
 * Other allowed remotes (e.g. Unsplash, Vercel Blob) still use optimization by default.
 */
export function preferUnoptimizedRemoteImage(src: string): boolean {
  if (!src.startsWith("http")) {
    return false;
  }
  try {
    if (new URL(src).hostname !== "upload.wikimedia.org") {
      return false;
    }
    return process.env.NEXT_PUBLIC_IMAGE_OPTIMIZE_WIKIMEDIA !== "1";
  } catch {
    return false;
  }
}
