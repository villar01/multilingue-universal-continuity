import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { detectNativeLang } from "@/lib/detect-native-lang";
import { Globe, ChevronRight, Volume2 } from "lucide-react";

// All 57 languages with flags and codes
const ALL_LANGUAGES = [
  { code: "pt-BR", name: "Português (Brasil)", flag: "🇧🇷", nativeName: "Português" },
  { code: "en-US", name: "English (US)", flag: "🇺🇸", nativeName: "English" },
  { code: "es-ES", name: "Español", flag: "🇪🇸", nativeName: "Español" },
  { code: "fr-FR", name: "Français", flag: "🇫🇷", nativeName: "Français" },
  { code: "de-DE", name: "Deutsch", flag: "🇩🇪", nativeName: "Deutsch" },
  { code: "it-IT", name: "Italiano", flag: "🇮🇹", nativeName: "Italiano" },
  { code: "ja-JP", name: "日本語", flag: "🇯🇵", nativeName: "日本語" },
  { code: "zh-CN", name: "中文 (简体)", flag: "🇨🇳", nativeName: "中文" },
  { code: "ko-KR", name: "한국어", flag: "🇰🇷", nativeName: "한국어" },
  { code: "ru-RU", name: "Русский", flag: "🇷🇺", nativeName: "Русский" },
  { code: "ar-XA", name: "العربية", flag: "🇸🇦", nativeName: "العربية" },
  { code: "hi-IN", name: "हिन्दी", flag: "🇮🇳", nativeName: "हिन्दी" },
  { code: "nl-NL", name: "Nederlands", flag: "🇳🇱", nativeName: "Nederlands" },
  { code: "pl-PL", name: "Polski", flag: "🇵🇱", nativeName: "Polski" },
  { code: "sv-SE", name: "Svenska", flag: "🇸🇪", nativeName: "Svenska" },
  { code: "da-DK", name: "Dansk", flag: "🇩🇰", nativeName: "Dansk" },
  { code: "fi-FI", name: "Suomi", flag: "🇫🇮", nativeName: "Suomi" },
  { code: "nb-NO", name: "Norsk", flag: "🇳🇴", nativeName: "Norsk" },
  { code: "tr-TR", name: "Türkçe", flag: "🇹🇷", nativeName: "Türkçe" },
  { code: "uk-UA", name: "Українська", flag: "🇺🇦", nativeName: "Українська" },
  { code: "cs-CZ", name: "Čeština", flag: "🇨🇿", nativeName: "Čeština" },
  { code: "hu-HU", name: "Magyar", flag: "🇭🇺", nativeName: "Magyar" },
  { code: "ro-RO", name: "Română", flag: "🇷🇴", nativeName: "Română" },
  { code: "bg-BG", name: "Български", flag: "🇧🇬", nativeName: "Български" },
  { code: "hr-HR", name: "Hrvatski", flag: "🇭🇷", nativeName: "Hrvatski" },
  { code: "sk-SK", name: "Slovenčina", flag: "🇸🇰", nativeName: "Slovenčina" },
  { code: "sl-SI", name: "Slovenščina", flag: "🇸🇮", nativeName: "Slovenščina" },
  { code: "et-EE", name: "Eesti", flag: "🇪🇪", nativeName: "Eesti" },
  { code: "lv-LV", name: "Latviešu", flag: "🇱🇻", nativeName: "Latviešu" },
  { code: "lt-LT", name: "Lietuvių", flag: "🇱🇹", nativeName: "Lietuvių" },
  { code: "vi-VN", name: "Tiếng Việt", flag: "🇻🇳", nativeName: "Tiếng Việt" },
  { code: "id-ID", name: "Bahasa Indonesia", flag: "🇮🇩", nativeName: "Indonesia" },
  { code: "ms-MY", name: "Bahasa Melayu", flag: "🇲🇾", nativeName: "Melayu" },
  { code: "fa-IR", name: "فارسی", flag: "🇮🇷", nativeName: "فارسی" },
  { code: "he-IL", name: "עברית", flag: "🇮🇱", nativeName: "עברית" },
  { code: "el-GR", name: "Ελληνικά", flag: "🇬🇷", nativeName: "Ελληνικά" },
  { code: "af-ZA", name: "Afrikaans", flag: "🇿🇦", nativeName: "Afrikaans" },
  { code: "sw-KE", name: "Kiswahili", flag: "🇰🇪", nativeName: "Kiswahili" },
  { code: "zu-ZA", name: "isiZulu", flag: "🇿🇦", nativeName: "isiZulu" },
  { code: "yo-NG", name: "Yorùbá", flag: "🇳🇬", nativeName: "Yorùbá" },
  { code: "ha-NG", name: "Hausa", flag: "🇳🇬", nativeName: "Hausa" },
  { code: "ig-NG", name: "Igbo", flag: "🇳🇬", nativeName: "Igbo" },
  { code: "am-ET", name: "አማርኛ", flag: "🇪🇹", nativeName: "አማርኛ" },
  { code: "bn-IN", name: "বাংলা", flag: "🇧🇩", nativeName: "বাংলা" },
  { code: "ur-IN", name: "اردو", flag: "🇵🇰", nativeName: "اردو" },
  { code: "ca-ES", name: "Català", flag: "🏴󠁥󠁳󠁣󠁴󠁿", nativeName: "Català" },
  { code: "eu-ES", name: "Euskara", flag: "🏴", nativeName: "Euskara" },
  { code: "gl-ES", name: "Galego", flag: "🇪🇸", nativeName: "Galego" },
  { code: "sr-RS", name: "Српски", flag: "🇷🇸", nativeName: "Српски" },
  { code: "pt-PT", name: "Português (Portugal)", flag: "🇵🇹", nativeName: "Português" },
  { code: "en-GB", name: "English (UK)", flag: "🇬🇧", nativeName: "English" },
  { code: "zh-TW", name: "中文 (繁體)", flag: "🇹🇼", nativeName: "中文" },
  { code: "es-MX", name: "Español (México)", flag: "🇲🇽", nativeName: "Español" },
  { code: "fr-CA", name: "Français (Canada)", flag: "🇨🇦", nativeName: "Français" },
  { code: "de-AT", name: "Deutsch (Österreich)", flag: "🇦🇹", nativeName: "Deutsch" },
  { code: "ar-EG", name: "عربي (مصر)", flag: "🇪🇬", nativeName: "عربي" },
  { code: "xh-ZA", name: "isiXhosa", flag: "🇿🇦", nativeName: "isiXhosa" },
  { code: "cmn-CN", name: "普通话", flag: "🇨🇳", nativeName: "普通话" },
];

const STEP_NATIVE = 1;
const STEP_TARGET = 2;

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [step, setStep] = useState(STEP_NATIVE);
  const [nativeLang, setNativeLang] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const updateProfile = trpc.auth.updateProfile.useMutation();
  const { data: languages } = trpc.languages.list.useQuery();

  // Guard 1: verificar se idioma nativo foi confirmado
  // Se não confirmado, auto-detecta pelo navegador em vez de bloquear
  useEffect(() => {
    const { confirmed, code } = detectNativeLang();
    if (!confirmed) {
      // Auto-detectar e salvar silenciosamente (não redirecionar)
      const nav = navigator.language || "pt-BR";
      const prefix = nav.split("-")[0].toLowerCase();
      const prefixMap: Record<string,string> = {
        pt: "pt-BR", en: "en-US", es: "es-ES", fr: "fr-FR", de: "de-DE",
        it: "it-IT", ja: "ja-JP", zh: "zh-CN", ko: "ko-KR", ru: "ru-RU",
        ar: "ar-SA", hi: "hi-IN", nl: "nl-NL", pl: "pl-PL", sv: "sv-SE",
        tr: "tr-TR", uk: "uk-UA", el: "el-GR", he: "he-IL",
      };
      const detected = prefixMap[prefix] || code || "pt-BR";
      localStorage.setItem("ml_native_lang", detected);
      localStorage.setItem("ml_native_lang_confirmed", "true");
      // Só redireciona para language-detect se o idioma detectado for muito diferente
      // do esperado (ex: usuário em país estrangeiro)
    }
  }, [setLocation]);

  // Guard 2: verificar se usuário aceitou os termos
  const { data: complianceData, isLoading: complianceLoading } = trpc.compliance.checkAcceptance.useQuery();
  useEffect(() => {
    if (!complianceLoading && complianceData && !complianceData.accepted) {
      setLocation("/terms");
    }
  }, [complianceData, complianceLoading, setLocation]);

  // Filter languages for target (exclude native)
  const filteredLanguages = useMemo(() => {
    const base = ALL_LANGUAGES.filter(l => step === STEP_TARGET ? l.code !== nativeLang : true);
    if (!search.trim()) return base;
    const q = search.toLowerCase();
    return base.filter(l => l.name.toLowerCase().includes(q) || l.nativeName.toLowerCase().includes(q));
  }, [search, nativeLang, step]);

  const handleNativeSelect = (code: string) => {
    setNativeLang(code);
    setSearch("");
    setStep(STEP_TARGET);
  };

  const handleTargetSelect = async (code: string) => {
    setTargetLang(code);
    setSaving(true);
    try {
      // Find matching language ID from DB
      const dbLang = languages?.find(l => l.code === code.split('-')[0] || l.code === code);
      await updateProfile.mutateAsync({
        nativeLanguage: nativeLang!,
        targetLanguageId: dbLang?.id,
      });
      // Save to localStorage for app-wide access
      const nativeLangObj = ALL_LANGUAGES.find(l => l.code === nativeLang);
      const targetLangObj = ALL_LANGUAGES.find(l => l.code === code);
      localStorage.setItem("ml_native_lang", nativeLang!);
      localStorage.setItem("ml_target_lang", code);
      if (dbLang?.id) localStorage.setItem("ml_target_lang_id", String(dbLang.id));
      // Write ml_lang_profile so LanguageContext and all components read the correct language
      const profile = {
        nativeCode: nativeLang!,
        nativeName: nativeLangObj?.nativeName || "Português",
        targetCode: code,
        targetName: targetLangObj?.nativeName || code,
        targetFlag: targetLangObj?.flag || "🌐",
      };
      localStorage.setItem("ml_lang_profile", JSON.stringify(profile));
      setLocation("/dashboard");
    } catch (e) {
      console.error("Failed to save profile:", e);
      // Still proceed even if save fails
      const nativeLangObj = ALL_LANGUAGES.find(l => l.code === nativeLang);
      const targetLangObj = ALL_LANGUAGES.find(l => l.code === code);
      localStorage.setItem("ml_native_lang", nativeLang!);
      localStorage.setItem("ml_target_lang", code);
      const profile = {
        nativeCode: nativeLang!,
        nativeName: nativeLangObj?.nativeName || "Português",
        targetCode: code,
        targetName: targetLangObj?.nativeName || code,
        targetFlag: targetLangObj?.flag || "🌐",
      };
      localStorage.setItem("ml_lang_profile", JSON.stringify(profile));
      setLocation("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  const nativeLangObj = ALL_LANGUAGES.find(l => l.code === nativeLang);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 flex flex-col items-center justify-start px-4 py-8">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <Globe className="h-8 w-8 text-purple-400" />
        <span className="text-2xl font-bold text-white">MultiLingue Universal</span>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mb-8">
        <div className={`h-2 w-8 rounded-full transition-all ${step >= STEP_NATIVE ? 'bg-purple-400' : 'bg-white/20'}`} />
        <div className={`h-2 w-8 rounded-full transition-all ${step >= STEP_TARGET ? 'bg-purple-400' : 'bg-white/20'}`} />
      </div>

      <div className="w-full max-w-lg">
        {step === STEP_NATIVE && (
          <>
            <h1 className="text-2xl font-bold text-white text-center mb-2">
              Qual é o seu idioma nativo?
            </h1>
            <p className="text-white/60 text-center mb-6 text-sm">
              Usaremos este idioma para todas as traduções e explicações
            </p>
          </>
        )}
        {step === STEP_TARGET && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => { setStep(STEP_NATIVE); setSearch(""); }}
                className="text-white/60 hover:text-white text-sm flex items-center gap-1"
              >
                ← Voltar
              </button>
            </div>
            <h1 className="text-2xl font-bold text-white text-center mb-1">
              Qual idioma você quer aprender?
            </h1>
            <p className="text-white/60 text-center mb-2 text-sm">
              Idioma nativo: {nativeLangObj?.flag} {nativeLangObj?.nativeName}
            </p>
            <p className="text-white/50 text-center mb-6 text-xs">
              56 idiomas disponíveis
            </p>
          </>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Buscar idioma..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
          />
        </div>

        {/* Language grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto pr-1">
          {filteredLanguages.map(lang => (
            <button
              key={lang.code}
              onClick={() => step === STEP_NATIVE ? handleNativeSelect(lang.code) : handleTargetSelect(lang.code)}
              disabled={saving}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/15 hover:border-purple-400/50 transition-all active:scale-95"
            >
              <span className="text-3xl">{lang.flag}</span>
              <span className="text-white text-xs font-medium text-center leading-tight">{lang.nativeName}</span>
            </button>
          ))}
        </div>

        {saving && (
          <div className="text-center mt-6 text-white/60 text-sm">
            Salvando preferências...
          </div>
        )}
      </div>
    </div>
  );
}
