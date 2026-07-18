/**
 * useLanguageSettings — Hook central de idioma duplo
 * 
 * - nativeLang: idioma nativo do aluno (detectado automaticamente via navigator.language)
 * - targetLang: idioma que o aluno quer estudar (selecionado pelo aluno)
 * - Se a detecção falhar, retorna needsSetup=true para mostrar seletores
 * - Persiste no localStorage para manter entre sessões
 */

import { useState, useEffect, useCallback } from "react";

export interface LanguageSettings {
  nativeLang: string;       // ex: "pt-BR"
  targetLang: string;       // ex: "en-US"
  nativeName: string;       // ex: "Português (Brasil)"
  targetName: string;       // ex: "English (US)"
  nativeFlag: string;       // ex: "🇧🇷"
  targetFlag: string;       // ex: "🇺🇸"
  needsSetup: boolean;      // true se precisar mostrar seletor
  setNativeLang: (lang: string) => void;
  setTargetLang: (lang: string) => void;
  confirmSetup: () => void;
}

// Mapa de idiomas suportados
export const SUPPORTED_LANGUAGES: Record<string, { name: string; flag: string; nativeName: string }> = {
  "pt-BR": { name: "Português (Brasil)", flag: "🇧🇷", nativeName: "Português" },
  "pt-PT": { name: "Português (Portugal)", flag: "🇵🇹", nativeName: "Português" },
  "en-US": { name: "English (US)", flag: "🇺🇸", nativeName: "English" },
  "en-GB": { name: "English (UK)", flag: "🇬🇧", nativeName: "English" },
  "es-ES": { name: "Español (España)", flag: "🇪🇸", nativeName: "Español" },
  "es-MX": { name: "Español (México)", flag: "🇲🇽", nativeName: "Español" },
  "fr-FR": { name: "Français", flag: "🇫🇷", nativeName: "Français" },
  "de-DE": { name: "Deutsch", flag: "🇩🇪", nativeName: "Deutsch" },
  "it-IT": { name: "Italiano", flag: "🇮🇹", nativeName: "Italiano" },
  "ja-JP": { name: "日本語", flag: "🇯🇵", nativeName: "日本語" },
  "zh-CN": { name: "中文 (简体)", flag: "🇨🇳", nativeName: "中文" },
  "zh-TW": { name: "中文 (繁體)", flag: "🇹🇼", nativeName: "中文" },
  "ko-KR": { name: "한국어", flag: "🇰🇷", nativeName: "한국어" },
  "ru-RU": { name: "Русский", flag: "🇷🇺", nativeName: "Русский" },
  "ar-SA": { name: "العربية", flag: "🇸🇦", nativeName: "العربية" },
  "hi-IN": { name: "हिन्दी", flag: "🇮🇳", nativeName: "हिन्दी" },
  "nl-NL": { name: "Nederlands", flag: "🇳🇱", nativeName: "Nederlands" },
  "pl-PL": { name: "Polski", flag: "🇵🇱", nativeName: "Polski" },
  "tr-TR": { name: "Türkçe", flag: "🇹🇷", nativeName: "Türkçe" },
  "sv-SE": { name: "Svenska", flag: "🇸🇪", nativeName: "Svenska" },
  "da-DK": { name: "Dansk", flag: "🇩🇰", nativeName: "Dansk" },
  "fi-FI": { name: "Suomi", flag: "🇫🇮", nativeName: "Suomi" },
  "nb-NO": { name: "Norsk", flag: "🇳🇴", nativeName: "Norsk" },
  "cs-CZ": { name: "Čeština", flag: "🇨🇿", nativeName: "Čeština" },
  "hu-HU": { name: "Magyar", flag: "🇭🇺", nativeName: "Magyar" },
  "ro-RO": { name: "Română", flag: "🇷🇴", nativeName: "Română" },
  "uk-UA": { name: "Українська", flag: "🇺🇦", nativeName: "Українська" },
  "el-GR": { name: "Ελληνικά", flag: "🇬🇷", nativeName: "Ελληνικά" },
  "he-IL": { name: "עברית", flag: "🇮🇱", nativeName: "עברית" },
  "th-TH": { name: "ภาษาไทย", flag: "🇹🇭", nativeName: "ภาษาไทย" },
  "vi-VN": { name: "Tiếng Việt", flag: "🇻🇳", nativeName: "Tiếng Việt" },
  "id-ID": { name: "Bahasa Indonesia", flag: "🇮🇩", nativeName: "Bahasa Indonesia" },
  "ms-MY": { name: "Bahasa Melayu", flag: "🇲🇾", nativeName: "Bahasa Melayu" },
  "fa-IR": { name: "فارسی", flag: "🇮🇷", nativeName: "فارسی" },
  "ca-ES": { name: "Català", flag: "🏴󠁥󠁳󠁣󠁴󠁿", nativeName: "Català" },
  "hr-HR": { name: "Hrvatski", flag: "🇭🇷", nativeName: "Hrvatski" },
  "sk-SK": { name: "Slovenčina", flag: "🇸🇰", nativeName: "Slovenčina" },
  "bg-BG": { name: "Български", flag: "🇧🇬", nativeName: "Български" },
  "sr-RS": { name: "Srpski", flag: "🇷🇸", nativeName: "Srpski" },
  "lt-LT": { name: "Lietuvių", flag: "🇱🇹", nativeName: "Lietuvių" },
  "lv-LV": { name: "Latviešu", flag: "🇱🇻", nativeName: "Latviešu" },
  "et-EE": { name: "Eesti", flag: "🇪🇪", nativeName: "Eesti" },
  "sl-SI": { name: "Slovenščina", flag: "🇸🇮", nativeName: "Slovenščina" },
  "af-ZA": { name: "Afrikaans", flag: "🇿🇦", nativeName: "Afrikaans" },
  "sw-KE": { name: "Kiswahili", flag: "🇰🇪", nativeName: "Kiswahili" },
  "tl-PH": { name: "Filipino", flag: "🇵🇭", nativeName: "Filipino" },
  "bn-BD": { name: "বাংলা", flag: "🇧🇩", nativeName: "বাংলা" },
  "ta-IN": { name: "தமிழ்", flag: "🇮🇳", nativeName: "தமிழ்" },
  "ur-PK": { name: "اردو", flag: "🇵🇰", nativeName: "اردو" },
  "pa-IN": { name: "ਪੰਜਾਬੀ", flag: "🇮🇳", nativeName: "ਪੰਜਾਬੀ" },
  "mr-IN": { name: "मराठी", flag: "🇮🇳", nativeName: "मराठी" },
  "gu-IN": { name: "ગુજરાતી", flag: "🇮🇳", nativeName: "ગુજરાતી" },
  "te-IN": { name: "తెలుగు", flag: "🇮🇳", nativeName: "తెలుగు" },
  "kn-IN": { name: "ಕನ್ನಡ", flag: "🇮🇳", nativeName: "ಕನ್ನಡ" },
  "ml-IN": { name: "മലയാളം", flag: "🇮🇳", nativeName: "മലയാളം" },
};

/** Normaliza o código do navegador para o nosso padrão */
function normalizeNavLang(navLang: string): string {
  if (!navLang) return "pt-BR";
  const lower = navLang.toLowerCase();
  // Mapeamento de aliases comuns
  const aliases: Record<string, string> = {
    "pt": "pt-BR", "pt-br": "pt-BR", "pt-pt": "pt-PT",
    "en": "en-US", "en-us": "en-US", "en-gb": "en-GB",
    "es": "es-ES", "es-mx": "es-MX",
    "fr": "fr-FR", "de": "de-DE", "it": "it-IT",
    "ja": "ja-JP", "zh": "zh-CN", "zh-cn": "zh-CN", "zh-tw": "zh-TW",
    "ko": "ko-KR", "ru": "ru-RU", "ar": "ar-SA",
    "hi": "hi-IN", "nl": "nl-NL", "pl": "pl-PL",
    "tr": "tr-TR", "sv": "sv-SE", "da": "da-DK",
    "fi": "fi-FI", "nb": "nb-NO", "no": "nb-NO",
    "cs": "cs-CZ", "hu": "hu-HU", "ro": "ro-RO",
    "uk": "uk-UA", "el": "el-GR", "he": "he-IL",
    "th": "th-TH", "vi": "vi-VN", "id": "id-ID",
    "ms": "ms-MY", "fa": "fa-IR",
  };
  // Tentar correspondência exata primeiro
  for (const key of Object.keys(SUPPORTED_LANGUAGES)) {
    if (key.toLowerCase() === lower) return key;
  }
  // Tentar alias
  const base = lower.split("-")[0];
  return aliases[lower] || aliases[base] || "pt-BR";
}

export function useLanguageSettings(): LanguageSettings {
  // Detectar idioma nativo automaticamente
  const detectNative = (): string => {
    try {
      const saved = localStorage.getItem("ml_native_lang");
      if (saved && SUPPORTED_LANGUAGES[saved]) return saved;
      const navLang = navigator.language || navigator.languages?.[0] || "pt-BR";
      return normalizeNavLang(navLang);
    } catch {
      return "pt-BR";
    }
  };

  const detectTarget = (): string => {
    try {
      const saved = localStorage.getItem("ml_target_lang");
      if (saved && SUPPORTED_LANGUAGES[saved]) return saved;
      return ""; // Vazio = precisa selecionar
    } catch {
      return "";
    }
  };

  const [nativeLang, setNativeLangState] = useState<string>(detectNative);
  const [targetLang, setTargetLangState] = useState<string>(detectTarget);
  const [setupConfirmed, setSetupConfirmed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("ml_setup_confirmed") === "true";
    } catch {
      return false;
    }
  });

  // Salvar idioma nativo automaticamente na primeira vez
  useEffect(() => {
    try {
      if (!localStorage.getItem("ml_native_lang")) {
        const detected = normalizeNavLang(navigator.language || "pt-BR");
        localStorage.setItem("ml_native_lang", detected);
        setNativeLangState(detected);
      }
    } catch {}
  }, []);

  const setNativeLang = useCallback((lang: string) => {
    setNativeLangState(lang);
    try { localStorage.setItem("ml_native_lang", lang); } catch {}
  }, []);

  const setTargetLang = useCallback((lang: string) => {
    setTargetLangState(lang);
    try { localStorage.setItem("ml_target_lang", lang); } catch {}
  }, []);

  const confirmSetup = useCallback(() => {
    setSetupConfirmed(true);
    try { localStorage.setItem("ml_setup_confirmed", "true"); } catch {}
  }, []);

  const nativeInfo = SUPPORTED_LANGUAGES[nativeLang] || SUPPORTED_LANGUAGES["pt-BR"];
  const targetInfo = SUPPORTED_LANGUAGES[targetLang] || null;

  // needsSetup = true se não tem idioma a estudar OU se não confirmou ainda
  const needsSetup = !targetLang || !targetInfo || (!setupConfirmed && !targetLang);

  return {
    nativeLang,
    targetLang: targetLang || "en-US",
    nativeName: nativeInfo.name,
    targetName: targetInfo?.name || "English (US)",
    nativeFlag: nativeInfo.flag,
    targetFlag: targetInfo?.flag || "🇺🇸",
    needsSetup,
    setNativeLang,
    setTargetLang,
    confirmSetup,
  };
}
