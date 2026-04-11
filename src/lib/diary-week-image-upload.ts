import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extForMime(mime: string) {
  if (mime === "image/jpeg") {
    return "jpg";
  }
  return mime.split("/")[1] ?? "bin";
}

/**
 * Stores a week image and returns a public URL path.
 * Production: Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set.
 * Development: `public/uploads/diary-weeks/{ownerId}/…` when Blob is not configured.
 */
export async function storeDiaryWeekImage(file: File, ownerId: string): Promise<string> {
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }
  if (!ALLOWED.has(file.type)) {
    throw new Error("Use JPEG, PNG, WebP, or GIF.");
  }

  const ext = extForMime(file.type);
  const name = `${Date.now()}-${crypto.randomUUID().slice(0, 10)}.${ext}`;
  const pathname = `diary-weeks/${ownerId}/${name}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(pathname, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  }

  if (process.env.NODE_ENV === "development") {
    const dir = path.join(process.cwd(), "public", "uploads", "diary-weeks", ownerId);
    await mkdir(dir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, name), buffer);
    return `/uploads/diary-weeks/${ownerId}/${name}`;
  }

  throw new Error(
    "Image uploads are not configured. Set BLOB_READ_WRITE_TOKEN (e.g. from the Vercel Blob dashboard).",
  );
}
