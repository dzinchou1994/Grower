/**
 * Shared demo diary image URLs (Wikimedia Commons - CC-licensed cannabis/hemp photos).
 * Used by seed script and migrate-picsum-to-commons.ts.
 */
export const DEMO_PHOTO_BY_SEED: Record<string, string> = {
  "gdemo-a-cover":
    "https://upload.wikimedia.org/wikipedia/commons/d/dd/Cannabis_sativa_plant_%284%29.JPG",
  "gdemo-a-w1":
    "https://upload.wikimedia.org/wikipedia/commons/a/a1/Cannabis_sativa_kz05.jpg",
  "gdemo-a-w2":
    "https://upload.wikimedia.org/wikipedia/commons/a/a0/Cannabis_sativa_kz02.jpg",
  "gdemo-a-w3":
    "https://upload.wikimedia.org/wikipedia/commons/3/35/Cannabis_sativa_plant_top_view_01.jpg",
  "gdemo-a-w4":
    "https://upload.wikimedia.org/wikipedia/commons/e/ea/Cannabis_sativa_plant_top_view_02.jpg",
  "gdemo-a-w5":
    "https://upload.wikimedia.org/wikipedia/commons/b/b7/Cannabis_sativa_plant_%283%29.JPG",
  "gdemo-a-w6":
    "https://upload.wikimedia.org/wikipedia/commons/b/b9/Cannabis_sativa_54896751.jpg",
  "gdemo-a-w7":
    "https://upload.wikimedia.org/wikipedia/commons/4/4b/Cannabis_sativa_54896760.jpg",
  "gdemo-a-w8":
    "https://upload.wikimedia.org/wikipedia/commons/9/99/Cannabis_sativa_bud_%2801%29.jpg",
  "gdemo-a-w9":
    "https://upload.wikimedia.org/wikipedia/commons/0/03/Cannabis_indica_plant_IMGP3337.jpg",
  "gdemo-a-w10":
    "https://upload.wikimedia.org/wikipedia/commons/4/44/Cannabis_sativa_leaf.jpg",

  "gdemo-b-cover":
    "https://upload.wikimedia.org/wikipedia/commons/3/37/Cannabis_sativa_var._ruderalis_%28DSC_0226%29.jpg",
  "gdemo-b-w1":
    "https://upload.wikimedia.org/wikipedia/commons/b/b8/Hampa_Cannabis_sativa_L.jpg",
  "gdemo-b-w2":
    "https://upload.wikimedia.org/wikipedia/commons/d/dd/Cannabis-in-Bangladesh-sativa-flowing.jpg",
  "gdemo-b-w3":
    "https://upload.wikimedia.org/wikipedia/commons/3/30/Cannabis_sativa_13.jpg",
  "gdemo-b-w4":
    "https://upload.wikimedia.org/wikipedia/commons/6/64/Cannabis_sativa_from_Kushtia_%2801%29.jpg",
  "gdemo-b-w5":
    "https://upload.wikimedia.org/wikipedia/commons/a/a6/Cannabis_sativa_from_Kushtia_%2802%29.jpg",
  "gdemo-b-w6":
    "https://upload.wikimedia.org/wikipedia/commons/e/ee/Cannabis_sativa_kz04.jpg",
  "gdemo-b-w7":
    "https://upload.wikimedia.org/wikipedia/commons/6/63/Cannabis_sativa_preparation_for_joint_%2802%29.jpg",
  "gdemo-b-w8":
    "https://upload.wikimedia.org/wikipedia/commons/7/79/Cannabis_sativa_Koehler_drawing.jpg",
};

export function weekImage(seed: string) {
  const url = DEMO_PHOTO_BY_SEED[seed];
  if (!url) {
    throw new Error(`Unknown demo image seed: ${seed}`);
  }
  return url;
}

/** Map `https://picsum.photos/seed/{seed}/...` → Commons URL, or return original if unknown. */
export function replacePicsumDemoUrl(url: string | null): string | null {
  if (!url || !url.includes("picsum.photos/seed/")) {
    return url;
  }
  const m = url.match(/picsum\.photos\/seed\/([^/]+)\//);
  const seed = m?.[1];
  if (!seed) {
    return url;
  }
  const mapped = DEMO_PHOTO_BY_SEED[seed];
  return mapped ?? url;
}
