import { createContext, useContext, useState, useCallback } from "react";
import { speakText } from "@/hooks/useNaturalVoice";

export interface LanguageProfile {
  nativeCode: string;    // e.g. "pt-BR"
  nativeName: string;    // e.g. "Português"
  targetCode: string;    // e.g. "fr-FR"
  targetName: string;    // e.g. "Français"
  targetFlag: string;    // e.g. "🇫🇷"
}

const DEFAULT_PROFILE: LanguageProfile = {
  nativeCode: "pt-BR",
  nativeName: "Português",
  targetCode: "en-US",
  targetName: "English",
  targetFlag: "🇺🇸",
};

interface LanguageContextType {
  profile: LanguageProfile;
  setProfile: (p: LanguageProfile) => void;
  immersionMode: boolean;
  setImmersionMode: (enabled: boolean) => void;
  speak: (text: string, lang?: string) => void;
  speakNative: (text: string) => void;
  speakTarget: (text: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<LanguageProfile>(() => {
    try {
      const saved = localStorage.getItem("ml_lang_profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate that it has the required fields
        if (parsed.targetCode && parsed.nativeCode) return parsed;
      }
      // Fallback: build profile from legacy keys written by Onboarding
      const targetCode = localStorage.getItem("ml_target_lang") || "en-US";
      const nativeCode = localStorage.getItem("ml_native_lang") || "pt-BR";
      // Build a basic profile from legacy keys and persist it
      const LANG_NAMES: Record<string, { name: string; flag: string }> = {
        "pt-BR": { name: "Portugu\u00eas", flag: "\ud83c\udde7\ud83c\uddf7" },
        "pt-PT": { name: "Portugu\u00eas", flag: "\ud83c\uddf5\ud83c\uddf9" },
        "en-US": { name: "English", flag: "\ud83c\uddfa\ud83c\uddf8" },
        "en-GB": { name: "English", flag: "\ud83c\uddec\ud83c\udde7" },
        "es-ES": { name: "Espa\u00f1ol", flag: "\ud83c\uddea\ud83c\uddf8" },
        "es-MX": { name: "Espa\u00f1ol", flag: "\ud83c\uddf2\ud83c\uddfd" },
        "fr-FR": { name: "Fran\u00e7ais", flag: "\ud83c\uddeb\ud83c\uddf7" },
        "de-DE": { name: "Deutsch", flag: "\ud83c\udde9\ud83c\uddea" },
        "it-IT": { name: "Italiano", flag: "\ud83c\uddee\ud83c\uddf9" },
        "ja-JP": { name: "\u65e5\u672c\u8a9e", flag: "\ud83c\uddef\ud83c\uddf5" },
        "zh-CN": { name: "\u4e2d\u6587", flag: "\ud83c\udde8\ud83c\uddf3" },
        "ko-KR": { name: "\ud55c\uad6d\uc5b4", flag: "\ud83c\uddf0\ud83c\uddf7" },
        "ru-RU": { name: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439", flag: "\ud83c\uddf7\ud83c\uddfa" },
      };
      const targetInfo = LANG_NAMES[targetCode] || { name: targetCode, flag: "\ud83c\udf10" };
      const nativeInfo = LANG_NAMES[nativeCode] || { name: nativeCode, flag: "\ud83c\udf10" };
      const profile: LanguageProfile = {
        nativeCode,
        nativeName: nativeInfo.name,
        targetCode,
        targetName: targetInfo.name,
        targetFlag: targetInfo.flag,
      };
      // Persist so next load is fast
      localStorage.setItem("ml_lang_profile", JSON.stringify(profile));
      return profile;
    } catch {
      return DEFAULT_PROFILE;
    }
  });
  const [immersionMode, setImmersionModeState] = useState(() => localStorage.getItem("ml_immersion_mode") === "true");

  const setProfile = useCallback((p: LanguageProfile) => {
    setProfileState(p);
    localStorage.setItem("ml_lang_profile", JSON.stringify(p));
  }, []);
  const setImmersionMode = useCallback((enabled: boolean) => {
    setImmersionModeState(enabled);
    localStorage.setItem("ml_immersion_mode", String(enabled));
  }, []);

  // Delegates to centralized speakText from useNaturalVoice (full BCP-47 map, best-voice selection)
  const speak = useCallback((text: string, lang?: string) => {
    speakText(text, lang || profile.targetCode);
  }, [profile.targetCode]);

  const speakNative = useCallback((text: string) => speak(text, profile.nativeCode), [speak, profile.nativeCode]);
  const speakTarget = useCallback((text: string) => speak(text, profile.targetCode), [speak, profile.targetCode]);

  return (
    <LanguageContext.Provider value={{ profile, setProfile, immersionMode, setImmersionMode, speak, speakNative, speakTarget }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
