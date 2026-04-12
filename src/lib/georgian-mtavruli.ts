/**
 * True if the string contains any Georgian script character (Mkhedruli, Mtavruli, etc.).
 */
export function hasGeorgianScript(input: string): boolean {
  return /\p{Script=Georgian}/u.test(input);
}

/**
 * Mkhedruli → Mtavruli for standard letters (U+10D0–U+10FA).
 * Leaves Latin, digits, Mtavruli, punctuation unchanged.
 */
export function toMtavruli(input: string): string {
  let out = "";
  for (const ch of input) {
    const cp = ch.codePointAt(0)!;
    if (cp >= 0x10d0 && cp <= 0x10fa) {
      out += String.fromCodePoint(cp + 0xbc0);
    } else {
      out += ch;
    }
  }
  return out;
}
