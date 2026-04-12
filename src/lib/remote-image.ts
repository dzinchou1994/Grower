/**
 * Prefer Next.js image optimization (WebP/AVIF + resizing via `/_next/image`) for remotes in
 * `images.remotePatterns`. Set `NEXT_PUBLIC_IMAGE_UNOPTIMIZED_WIKIMEDIA=1` if your host’s
 * server-side fetch to upload.wikimedia.org is blocked and you must load originals in the browser.
 */
export function preferUnoptimizedRemoteImage(src: string): boolean {
  if (process.env.NEXT_PUBLIC_IMAGE_UNOPTIMIZED_WIKIMEDIA === "1" && src.startsWith("http")) {
    try {
      return new URL(src).hostname === "upload.wikimedia.org";
    } catch {
      return false;
    }
  }
  return false;
}
