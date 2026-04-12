import { Noto_Sans_Georgian } from "next/font/google";

/**
 * Single shared instance for all Mtavruli / Georgian UI accents.
 * One `next/font` call avoids duplicate @font-face rules and redundant preloads.
 */
export const notoSansGeorgian = Noto_Sans_Georgian({
  subsets: ["georgian"],
  weight: ["500", "600", "700"],
  display: "swap",
});
