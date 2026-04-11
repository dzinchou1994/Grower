import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { optimizeDiaryPhotoToWebp } from "@/lib/diary-image-optimize";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

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

  const raw = Buffer.from(await file.arrayBuffer());
  let outBuffer: Buffer = raw;
  let ext = "webp";
  let contentType = "image/webp";
  try {
    outBuffer = await optimizeDiaryPhotoToWebp(raw);
  } catch {
    // Corrupt or unsupported; store original (keeps GIF animation, etc.)
    const fallbackExt =
      file.type === "image/jpeg"
        ? "jpg"
        : file.type === "image/png"
          ? "png"
          : file.type === "image/gif"
            ? "gif"
            : "webp";
    ext = fallbackExt;
    contentType = file.type;
    outBuffer = raw;
  }

  const name = `${Date.now()}-${crypto.randomUUID().slice(0, 10)}.${ext}`;
  const pathname = `diary-weeks/${ownerId}/${name}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(pathname, outBuffer, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType,
    });
    return blob.url;
  }

  if (process.env.NODE_ENV === "development") {
    const dir = path.join(process.cwd(), "public", "uploads", "diary-weeks", ownerId);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), outBuffer);
    return `/uploads/diary-weeks/${ownerId}/${name}`;
  }

  throw new Error(
    "Image uploads are not configured. Set BLOB_READ_WRITE_TOKEN (e.g. from the Vercel Blob dashboard).",
  );
}
