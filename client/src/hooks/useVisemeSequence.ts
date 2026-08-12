import { useEffect, useMemo, useState } from "react";

export type Viseme = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "X";

const VISEME_BY_CHARACTER: Record<string, Viseme> = {
  a: "A", á: "A", à: "A", â: "A", ä: "A",
  e: "E", é: "E", ê: "E", è: "E", ë: "E",
  i: "C", í: "C", ì: "C", î: "C", ï: "C", y: "C",
  o: "D", ó: "D", ô: "D", ò: "D", ö: "D",
  u: "F", ú: "F", ù: "F", û: "F", ü: "F", w: "F",
  m: "B", b: "B", p: "B",
  f: "G", v: "G",
  l: "H", t: "H", d: "H", n: "H", s: "H", z: "H", r: "H",
  c: "H", g: "H", j: "H", k: "H", q: "H", x: "H", h: "H",
};

export const VISEME_MOUTH_STYLE: Record<Viseme, { width: string; height: string; borderRadius: string }> = {
  A: { width: "15%", height: "10%", borderRadius: "48%" },
  B: { width: "12%", height: "2%", borderRadius: "45%" },
  C: { width: "8%", height: "9%", borderRadius: "50%" },
  D: { width: "11%", height: "8%", borderRadius: "50%" },
  E: { width: "15%", height: "4%", borderRadius: "45%" },
  F: { width: "7%", height: "9%", borderRadius: "50%" },
  G: { width: "12%", height: "3%", borderRadius: "48%" },
  H: { width: "10%", height: "5%", borderRadius: "45%" },
  X: { width: "9%", height: "2%", borderRadius: "50%" },
};

function textToVisemes(text: string): Viseme[] {
  const sequence = Array.from(text.toLocaleLowerCase())
    .filter((character) => /[\p{L}]/u.test(character))
    .map((character) => VISEME_BY_CHARACTER[character] || "H");
  return sequence.length ? sequence : ["X"];
}

/**
 * Runs a lightweight local viseme sequence while the teacher audio is playing.
 * It deliberately uses text as a stable fallback when phoneme timestamps are unavailable.
 */
export function useVisemeSequence(text: string, isSpeaking: boolean) {
  const sequence = useMemo(() => textToVisemes(text), [text]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!isSpeaking) {
      setIndex(0);
      return;
    }
    setIndex(0);
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % sequence.length);
    }, 105);
    return () => window.clearInterval(timer);
  }, [isSpeaking, sequence]);

  return { viseme: isSpeaking ? sequence[index] || "X" : "X", mouthStyle: VISEME_MOUTH_STYLE[isSpeaking ? sequence[index] || "X" : "X"] };
}
