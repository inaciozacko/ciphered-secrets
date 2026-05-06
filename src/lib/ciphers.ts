import { Blowfish } from "egoroof-blowfish";

export function toBase64(text: string): string {
  if (typeof window === "undefined") return Buffer.from(text, "utf8").toString("base64");
  return btoa(unescape(encodeURIComponent(text)));
}
export function fromBase64(b64: string): string {
  if (typeof window === "undefined") return Buffer.from(b64, "base64").toString("utf8");
  return decodeURIComponent(escape(atob(b64)));
}

export function caesarEncode(text: string, shift: number): string {
  return text.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + shift + 26) % 26) + base);
  });
}
export const caesarDecode = (text: string, shift: number) => caesarEncode(text, -shift);

const MORSE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
  I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
  Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..", "0": "-----", "1": ".----", "2": "..---", "3": "...--",
  "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
};
export function toMorse(text: string): string {
  return text
    .toUpperCase()
    .split("")
    .map((c) => (c === " " ? "/" : MORSE[c] ?? ""))
    .filter(Boolean)
    .join(" ");
}

function hex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function unhex(h: string): Uint8Array {
  const clean = h.replace(/\s+/g, "");
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.substr(i * 2, 2), 16);
  return out;
}

export function blowfishEncrypt(text: string, key: string): string {
  const bf = new Blowfish(key, Blowfish.MODE.ECB, Blowfish.PADDING.PKCS5);
  const enc = bf.encode(text);
  return hex(enc);
}
export function blowfishDecrypt(hexText: string, key: string): string {
  const bf = new Blowfish(key, Blowfish.MODE.ECB, Blowfish.PADDING.PKCS5);
  const dec = bf.decode(unhex(hexText), Blowfish.TYPE.STRING) as string;
  return dec;
}

export function reverseStr(s: string) { return s.split("").reverse().join(""); }
