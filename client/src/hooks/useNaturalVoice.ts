/**
 * useNaturalVoice — Centralized hook for natural speech synthesis.
 *
 * Features:
 * - Full BCP-47 map for 65+ languages (short codes → full locale)
 * - Dual-voice: nativeSpeak (pt-BR) vs targetSpeak (user's chosen language)
 * - Voice quality priority: Google Natural > Microsoft Neural > exact match > base language
 * - Regional variant selector support (en-US, en-GB, en-AU, etc.)
 * - Robust fallback: onvoiceschanged + 300ms timeout
 * - Slow/normal rate toggle
 */

import { useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { speakEdgeTTS, stopEdgeTTS } from "@/lib/edgeTTSClient";

// ── Full BCP-47 map: ISO 639-1 / short codes → canonical BCP-47 locale ──────
export const BCP47_MAP: Record<string, string> = {
  // Most common
  "en": "en-US", "en-US": "en-US", "en-GB": "en-GB", "en-AU": "en-AU",
  "en-CA": "en-CA", "en-IN": "en-IN",
  "pt": "pt-BR", "pt-BR": "pt-BR", "pt-PT": "pt-PT",
  "es": "es-ES", "es-ES": "es-ES", "es-MX": "es-MX", "es-AR": "es-AR",
  "es-CO": "es-CO", "es-CL": "es-CL",
  "fr": "fr-FR", "fr-FR": "fr-FR", "fr-CA": "fr-CA", "fr-BE": "fr-BE",
  "de": "de-DE", "de-DE": "de-DE", "de-AT": "de-AT", "de-CH": "de-CH",
  "it": "it-IT", "it-IT": "it-IT",
  "ja": "ja-JP", "ja-JP": "ja-JP",
  "zh": "zh-CN", "zh-CN": "zh-CN", "zh-TW": "zh-TW", "zh-HK": "zh-HK",
  "ko": "ko-KR", "ko-KR": "ko-KR",
  "ru": "ru-RU", "ru-RU": "ru-RU",
  "ar": "ar-SA", "ar-SA": "ar-SA", "ar-EG": "ar-EG", "ar-MA": "ar-MA",
  "hi": "hi-IN", "hi-IN": "hi-IN",
  "nl": "nl-NL", "nl-NL": "nl-NL", "nl-BE": "nl-BE",
  "pl": "pl-PL", "pl-PL": "pl-PL",
  "tr": "tr-TR", "tr-TR": "tr-TR",
  "sv": "sv-SE", "sv-SE": "sv-SE",
  "da": "da-DK", "da-DK": "da-DK",
  "fi": "fi-FI", "fi-FI": "fi-FI",
  "nb": "nb-NO", "no": "nb-NO", "nb-NO": "nb-NO",
  "cs": "cs-CZ", "cs-CZ": "cs-CZ",
  "hu": "hu-HU", "hu-HU": "hu-HU",
  "ro": "ro-RO", "ro-RO": "ro-RO",
  "uk": "uk-UA", "uk-UA": "uk-UA",
  "el": "el-GR", "el-GR": "el-GR",
  "he": "he-IL", "iw": "he-IL", "he-IL": "he-IL",
  "id": "id-ID", "id-ID": "id-ID",
  "ms": "ms-MY", "ms-MY": "ms-MY",
  "th": "th-TH", "th-TH": "th-TH",
  "vi": "vi-VN", "vi-VN": "vi-VN",
  "bg": "bg-BG", "bg-BG": "bg-BG",
  "hr": "hr-HR", "hr-HR": "hr-HR",
  "sk": "sk-SK", "sk-SK": "sk-SK",
  "sl": "sl-SI", "sl-SI": "sl-SI",
  "sr": "sr-RS", "sr-RS": "sr-RS",
  "lt": "lt-LT", "lt-LT": "lt-LT",
  "lv": "lv-LV", "lv-LV": "lv-LV",
  "et": "et-EE", "et-EE": "et-EE",
  "ca": "ca-ES", "ca-ES": "ca-ES",
  "gl": "gl-ES", "gl-ES": "gl-ES",
  "eu": "eu-ES", "eu-ES": "eu-ES",
  "af": "af-ZA", "af-ZA": "af-ZA",
  "sw": "sw-KE", "sw-KE": "sw-KE",
  "ta": "ta-IN", "ta-IN": "ta-IN",
  "te": "te-IN", "te-IN": "te-IN",
  "bn": "bn-BD", "bn-BD": "bn-BD", "bn-IN": "bn-IN",
  "ur": "ur-PK", "ur-PK": "ur-PK",
  "fa": "fa-IR", "fa-IR": "fa-IR",
  "mk": "mk-MK", "mk-MK": "mk-MK",
  "sq": "sq-AL", "sq-AL": "sq-AL",
  "hy": "hy-AM", "hy-AM": "hy-AM",
  "ka": "ka-GE", "ka-GE": "ka-GE",
  "az": "az-AZ", "az-AZ": "az-AZ",
  "kk": "kk-KZ", "kk-KZ": "kk-KZ",
  "mn": "mn-MN", "mn-MN": "mn-MN",
  "cy": "cy-GB", "cy-GB": "cy-GB",
  "ga": "ga-IE", "ga-IE": "ga-IE",
  "mt": "mt-MT", "mt-MT": "mt-MT",
  "is": "is-IS", "is-IS": "is-IS",
  "lb": "lb-LU", "lb-LU": "lb-LU",
  "tl": "fil-PH", "fil": "fil-PH", "fil-PH": "fil-PH",
};

// ── Normalize any code to BCP-47 ─────────────────────────────────────────────
export function normalizeLang(code: string): string {
  if (!code) return "en-US";
  return BCP47_MAP[code] || BCP47_MAP[code.toLowerCase()] || code;
}

// ── Select best available voice for a given BCP-47 locale ───────────────────
export function selectBestVoice(
  voices: SpeechSynthesisVoice[],
  bcp47: string
): SpeechSynthesisVoice | null {
  const base = bcp47.split("-")[0].toLowerCase();

  // Tier 1: Google Natural voice, exact locale
  const googleExact = voices.find(
    (v) => v.lang === bcp47 && v.name.toLowerCase().includes("google")
  );
  if (googleExact) return googleExact;

  // Tier 2: Microsoft Neural/Natural voice, exact locale
  const msExact = voices.find(
    (v) =>
      v.lang === bcp47 &&
      (v.name.toLowerCase().includes("microsoft") ||
        v.name.toLowerCase().includes("neural") ||
        v.name.toLowerCase().includes("natural"))
  );
  if (msExact) return msExact;

  // Tier 3: Any premium voice, exact locale
  const premiumExact = voices.find(
    (v) =>
      v.lang === bcp47 &&
      (v.name.toLowerCase().includes("premium") ||
        v.name.toLowerCase().includes("enhanced") ||
        v.name.toLowerCase().includes("compact"))
  );
  if (premiumExact) return premiumExact;

  // Tier 4: Any voice, exact locale
  const exactMatch = voices.find((v) => v.lang === bcp47);
  if (exactMatch) return exactMatch;

  // Tier 5: Google voice, same base language
  const googleBase = voices.find(
    (v) =>
      v.lang.toLowerCase().startsWith(base) &&
      v.name.toLowerCase().includes("google")
  );
  if (googleBase) return googleBase;

  // Tier 6: Any voice, same base language
  const baseMatch = voices.find(
    (v) => v.lang.toLowerCase().startsWith(base + "-") || v.lang.toLowerCase() === base
  );
  if (baseMatch) return baseMatch;

  // Tier 7: Loose match
  const looseMatch = voices.find((v) => v.lang.toLowerCase().startsWith(base));
  return looseMatch || null;
}

// ── Core speak function — usa Edge TTS Neural (servidor) ────────────────────
export function speakText(
  text: string,
  langCode: string,
  options?: { rate?: number; pitch?: number; onEnd?: () => void; onStart?: () => void; gender?: 'male' | 'female' }
): void {
  if (!text?.trim()) return;
  const bcp47 = normalizeLang(langCode);
  // Usa Edge TTS Neural do servidor (voz de alta qualidade)
  speakEdgeTTS(text, bcp47, {
    onStart: options?.onStart,
    onEnd: options?.onEnd,
    rate: options?.rate,
    gender: options?.gender ?? 'female',
  });
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export interface NaturalVoiceOptions {
  rate?: number;
  pitch?: number;
  onEnd?: () => void;
  onStart?: () => void;
}

export function useNaturalVoice() {
  const { profile } = useLanguage();

  /** Speak text in the user's native language (pt-BR by default) */
  const speakNative = useCallback(
    (text: string, opts?: NaturalVoiceOptions) => {
      speakText(text, profile.nativeCode || "pt-BR", opts);
    },
    [profile.nativeCode]
  );

  /** Speak text in the user's target language (the language being studied) */
  const speakTarget = useCallback(
    (text: string, opts?: NaturalVoiceOptions) => {
      speakText(text, profile.targetCode || "en-US", opts);
    },
    [profile.targetCode]
  );

  /** Speak text in any language by code (BCP-47 or short code) */
  const speak = useCallback(
    (text: string, langCode: string, opts?: NaturalVoiceOptions) => {
      speakText(text, langCode, opts);
    },
    []
  );

  /** Stop any ongoing speech */
  const stop = useCallback(() => {
    stopEdgeTTS();
  }, []);

  /** Get available voices for a language (for variant selector UI) */
  const getVoicesForLang = useCallback((langCode: string): SpeechSynthesisVoice[] => {
    if (!("speechSynthesis" in window)) return [];
    const bcp47 = normalizeLang(langCode);
    const base = bcp47.split("-")[0].toLowerCase();
    return window.speechSynthesis
      .getVoices()
      .filter(
        (v) =>
          v.lang === bcp47 ||
          v.lang.toLowerCase().startsWith(base + "-") ||
          v.lang.toLowerCase() === base
      )
      .sort((a, b) => {
        // Sort by quality: Google > Microsoft > others
        const score = (v: SpeechSynthesisVoice) => {
          if (v.name.toLowerCase().includes("google")) return 3;
          if (v.name.toLowerCase().includes("microsoft") || v.name.toLowerCase().includes("neural")) return 2;
          if (v.lang === bcp47) return 1;
          return 0;
        };
        return score(b) - score(a);
      });
  }, []);

  return {
    speakNative,
    speakTarget,
    speak,
    stop,
    getVoicesForLang,
    nativeLang: profile.nativeCode || "pt-BR",
    targetLang: profile.targetCode || "en-US",
    normalizeLang,
    selectBestVoice,
  };
}
