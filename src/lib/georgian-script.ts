/**
 * Mtavruli (all-caps Georgian, U+1C90–U+1CBF) → Mkhedruli (normal lowercase letters, U+10D0–U+10FF).
 * Google Translate and some sources return Mtavruli for `ka`; we normalize for readable UI.
 */
const MTAVRULI_START = 0x1c90;
const MTAVRULI_END = 0x1cbf;
const MKHEDRULI_START = 0x10d0;
const OFFSET = MTAVRULI_START - MKHEDRULI_START;

export function georgianMtavruliToMkhedruli(text: string): string {
  let out = "";
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (cp >= MTAVRULI_START && cp <= MTAVRULI_END) {
      const m = cp - OFFSET;
      if (m >= MKHEDRULI_START && m <= 0x10ff) {
        out += String.fromCodePoint(m);
        continue;
      }
    }
    out += ch;
  }
  return out;
}
