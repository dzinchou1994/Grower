import sharp from "sharp";

/** Max edge length; keeps detail for diary photos while shrinking megapixel images. */
const MAX_EDGE = 1920;
const WEBP_QUALITY = 82;

/**
 * Resize and encode as WebP for smaller files and faster scrolling on diary pages.
 * Falls back to the caller if optimization throws (corrupt file, exotic format).
 */
export async function optimizeDiaryPhotoToWebp(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate()
    .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer();
}
