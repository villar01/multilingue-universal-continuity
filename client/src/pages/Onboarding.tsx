import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { detectNativeLang } from "@/lib/detect-native-lang";
import { LANGUAGES_57, AVAILABLE_LANGUAGES, TOTAL_LANGUAGES, type Language } from "@/lib/languages";
import { Globe, ChevronRight, Search, Sparkles, Clock, Check } from 'lucide-react';
import TeacherSelector from '@/components/TeacherSelector';

const STEP_NATIVE = 1;
const STEP_TARGET = 2;
const STEP_TEACHER = 3;

type LangCategory = "all" | "modern" | "ancient" | "indigenous" | "constructed";

const CATEGORY_LABELS: Record<LangCategory, string> = {
  all: "Todos",
  modern: "Modernos",
  ancient: "Antigos",
  indigenous: "Indígenas",
  constructed: "Construídos",
};

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [step, setStep] = useState(STEP_NATIVE);
  const [nativeLang, setNativeLang] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState<LangCategory>("all");
  const [showAllLanguages, setShowAllLanguages] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [pairingCode, setPairingCode] = useState('');
  const [pairingMessage, setPairingMessage] = useState('');

  const updateProfile = trpc.auth.updateProfile.useMutation();
  const claimChildProfile = trpc.parentalControl.claimChildProfile.useMutation({
    onSuccess: () => {
      setPairingCode('');
      setPairingMessage('Perfil protegido vinculado. As configurações do responsável serão aplicadas a esta conta.');
    },
    onError: (error) => setPairingMessage(error.message),
  });
  const { data: languages } = trpc.languages.list.useQuery();
  const availableTargetCodes = useMemo(
    () => LANGUAGES_57.filter((language) => language.available).map((language) => language.code),
    [],
  );
  const { data: teacherCoverage, isLoading: isTeacherCoverageLoading } = trpc.teachers.coverage.useQuery({
    languageCodes: availableTargetCodes,
  });
  const coverageByLanguage = useMemo(
    () => new Map((teacherCoverage || []).map((coverage) => [coverage.languageCode, coverage])),
    [teacherCoverage],
  );

  useEffect(() => {
    const { confirmed, code } = detectNativeLang();
    if (!confirmed) {
      const nav = navigator.language || "pt-BR";
      const prefix = nav.split("-")[0].toLowerCase();
      const prefixMap: Record<string, string> = {
        pt: "pt-BR", en: "en-US", es: "es-ES", fr: "fr-FR", de: "de-DE",
        it: "it-IT", ja: "ja-JP", zh: "zh-CN", ko: "ko-KR", ru: "ru-RU",
        ar: "ar-SA", hi: "hi-IN", nl: "nl-NL", pl: "pl-PL", sv: "sv-SE",
        tr: "tr-TR", uk: "uk-UA", el: "el-GR", he: "he-IL",
      };
      const detected = prefixMap[prefix] || code || "pt-BR";
      localStorage.setItem("ml_native_lang", detected);
      localStorage.setItem("ml_native_lang_confirmed", "true");
    }
  }, [setLocation]);

  const { data: complianceData, isLoading: complianceLoading } = trpc.compliance.checkAcceptance.useQuery();
  useEffect(() => {
    if (!complianceLoading && complianceData && !complianceData.accepted) {
      setLocation("/terms");
    }
  }, [complianceData, complianceLoading, setLocation]);

  const filteredLanguages = useMemo(() => {
    let base = LANGUAGES_57;
    if (step === STEP_TARGET && nativeLang) {
      base = base.filter(l => l.code !== nativeLang);
    }
    if (activeCategory !== "all") {
      base = base.filter(l => l.category === activeCategory);
    }
    if (step === STEP_NATIVE) {
      base = base.filter(l => l.available);
    }
    if (step === STEP_TARGET && !showAllLanguages) {
      base = base.filter(l => l.available);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      base = base.filter(l =>
        l.label.toLowerCase().includes(q) ||
        l.name.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
      );
    }
    return base;
  }, [search, nativeLang, step, activeCategory, showAllLanguages]);

  const handleNativeSelect = (code: string) => {
    setNativeLang(code);
    setSearch("");
    setStep(STEP_TARGET);
    setActiveCategory("all");
    setShowAllLanguages(false);
  };

  const handleTargetSelect = (lang: Language) => {
    if (!lang.available || !coverageByLanguage.get(lang.code)?.isAvailable) return;
    setTargetLang(lang.code);
    setStep(STEP_TEACHER);
  };

  const handleFinishWithTeacher = async () => {
    if (!selectedTeacherId || !targetLang) return;
    setSaving(true);
    try {
      const dbLang = languages?.find(l => l.code === (targetLang || '').split('-')[0] || l.code === targetLang);
      await updateProfile.mutateAsync({
        nativeLanguage: nativeLang!,
        targetLanguageId: dbLang?.id,
      });
      localStorage.setItem("ml_native_lang", nativeLang!);
      localStorage.setItem("ml_target_lang", targetLang!);
      if (dbLang?.id) localStorage.setItem("ml_target_lang_id", String(dbLang.id));
      if (selectedTeacherId) localStorage.setItem("ml_selected_teacher", String(selectedTeacherId));
      const nativeLangObj2 = LANGUAGES_57.find(l => l.code === nativeLang);
      const targetLangObj2 = LANGUAGES_57.find(l => l.code === targetLang);
      const profile = {
        nativeCode: nativeLang!,
        nativeName: nativeLangObj2?.name || "Português",
        targetCode: targetLang!,
        targetName: targetLangObj2?.name || "English",
        targetFlag: targetLangObj2?.flag || "🌐",
      };
      localStorage.setItem("ml_lang_profile", JSON.stringify(profile));
      setLocation("/dashboard");
    } catch (e) {
      console.error("Failed to save profile:", e);
      localStorage.setItem("ml_native_lang", nativeLang!);
      localStorage.setItem("ml_target_lang", targetLang!);
      if (selectedTeacherId) localStorage.setItem("ml_selected_teacher", String(selectedTeacherId));
      setLocation("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  const nativeLangObj = LANGUAGES_57.find(l => l.code === nativeLang);
  const targetLangObj = LANGUAGES_57.find(l => l.code === targetLang);
  const progress = step === STEP_NATIVE ? 33 : step === STEP_TARGET ? 66 : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 flex flex-col items-center justify-start px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Globe className="h-7 w-7 text-purple-400" />
        <span className="text-xl font-bold text-white tracking-tight">MultiLingue Universal</span>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-100 relative">
          <div
            className="h-full bg-indigo-600 rounded-r-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-6 sm:p-8">
          {/* Step Content */}
          {step === STEP_NATIVE && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Qual é o seu idioma nativo?
              </h1>
              <p className="text-gray-500 text-sm mb-6">
                Usaremos este idioma para todas as traduções e explicações
              </p>
              <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-3">
                <p className="text-sm font-medium text-blue-950">Conta supervisionada?</p>
                <p className="mt-1 text-xs text-blue-800">Peça ao responsável o código de vínculo de 8 caracteres. Ele expira em 10 minutos e só pode ser usado uma vez.</p>
                <div className="mt-2 flex gap-2">
                  <input
                    value={pairingCode}
                    onChange={(event) => { setPairingCode(event.target.value.toUpperCase().replace(/[^A-F0-9]/g, '').slice(0, 8)); setPairingMessage(''); }}
                    placeholder="CÓDIGO"
                    maxLength={8}
                    className="min-w-0 flex-1 rounded-lg border border-blue-200 bg-white px-3 py-2 font-mono text-sm tracking-widest text-gray-900 outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    disabled={pairingCode.length !== 8 || claimChildProfile.isPending}
                    onClick={() => claimChildProfile.mutate({ code: pairingCode })}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {claimChildProfile.isPending ? 'Vinculando...' : 'Vincular'}
                  </button>
                </div>
                {pairingMessage ? <p className="mt-2 text-xs text-blue-900" role="status">{pairingMessage}</p> : null}
              </div>
            </>
          )}
          {step === STEP_TARGET && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => { setStep(STEP_NATIVE); setSearch(""); setActiveCategory("all"); setShowAllLanguages(false); }}
                  className="text-gray-400 hover:text-gray-700 text-sm flex items-center gap-1"
                >
                  ← Voltar
                </button>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Qual idioma você quer aprender?
              </h1>
              <p className="text-gray-500 text-sm mb-2">
                Idioma nativo: {nativeLangObj?.flag} {nativeLangObj?.name}
              </p>
              <p className="text-indigo-600 text-xs font-medium mb-6">
                {teacherCoverage?.filter((coverage) => coverage.isAvailable).length ?? 0} idiomas com professor e voz verificados agora · {TOTAL_LANGUAGES} no total
              </p>
            </>
          )}

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar idioma..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          {/* Category Tabs (target step only) */}
          {step === STEP_TARGET && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {(Object.keys(CATEGORY_LABELS) as LangCategory[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          )}

          {/* Language Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[45vh] overflow-y-auto pr-1">
            {filteredLanguages.map(lang => {
              const coverage = coverageByLanguage.get(lang.code);
              const isTargetStep = step === STEP_TARGET;
              const hasVerifiedTeacher = Boolean(coverage?.isAvailable);
              const targetIsSelectable = !isTargetStep || (lang.available && hasVerifiedTeacher && !isTeacherCoverageLoading);
              const targetIsComingSoon = isTargetStep && !lang.available;
              const targetNeedsTeacher = isTargetStep && lang.available && !isTeacherCoverageLoading && !hasVerifiedTeacher;

              return (
              <button
                key={lang.code}
                onClick={() => step === STEP_NATIVE
                  ? handleNativeSelect(lang.code)
                  : handleTargetSelect(lang)
                }
                disabled={saving || !targetIsSelectable}
                className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all active:scale-95 ${
                  !targetIsSelectable
                    ? "bg-gray-50 border-gray-100 cursor-not-allowed opacity-60"
                    : "bg-white border-gray-200 hover:bg-indigo-50 hover:border-indigo-400"
                }`}
              >
                {/* Flag in rounded square */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2 ${
                  targetIsSelectable
                    ? "border-gray-100 bg-gray-50"
                    : "border-gray-100 bg-gray-100"
                }`}>
                  {lang.flag}
                </div>
                {/* Language name */}
                <span className={`text-xs font-medium text-center leading-tight ${
                  targetIsSelectable ? "text-gray-900" : "text-gray-400"
                }`}>
                  {lang.name}
                </span>
                {/* Verified teacher + neural voice badge */}
                {isTargetStep && hasVerifiedTeacher && !isTeacherCoverageLoading && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                )}
                {isTargetStep && isTeacherCoverageLoading && lang.available && (
                  <div className="absolute top-1 right-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-blue-100">
                    <Clock className="w-2 h-2 text-blue-600" />
                    <span className="text-[8px] font-bold text-blue-600 uppercase">Verificando</span>
                  </div>
                )}
                {targetIsComingSoon && (
                  <div className="absolute top-1 right-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-100">
                    <Clock className="w-2 h-2 text-amber-600" />
                    <span className="text-[8px] font-bold text-amber-600 uppercase">Em breve</span>
                  </div>
                )}
                {targetNeedsTeacher && (
                  <div className="absolute top-1 right-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-100">
                    <Clock className="w-2 h-2 text-amber-600" />
                    <span className="text-[8px] font-bold text-amber-600 uppercase">Preparando professor</span>
                  </div>
                )}
              </button>
              );
            })}
          </div>

          {/* Show all languages toggle */}
          {step === STEP_TARGET && !search && activeCategory === "all" && (
            <button
              onClick={() => setShowAllLanguages(!showAllLanguages)}
              className="w-full mt-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              {showAllLanguages ? (
                <>Mostrar apenas disponíveis</>
              ) : (
                <>Ver todos os {TOTAL_LANGUAGES} idiomas</>
              )}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Empty state */}
          {filteredLanguages.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum idioma encontrado</p>
            </div>
          )}

          {/* Saving indicator */}
          {saving && (
            <div className="text-center mt-4 text-indigo-600 text-sm font-medium">
              Salvando preferências...
            </div>
          )}
        </div>
      </div>

      {/* Step 3: Teacher Selection */}
      {step === STEP_TEACHER && (
        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Escolha seu Professor</h2>
              <p className="text-gray-500 text-sm mt-1">Selecione o professor que vai acompanhar seu aprendizado em {targetLangObj?.name || targetLang}</p>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              <TeacherSelector
                languageCode={targetLang || ''}
                selectedTeacherId={selectedTeacherId ?? undefined}
                onSelect={(id: number) => setSelectedTeacherId(id)}
              />
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setStep(STEP_TARGET)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
              >
                Voltar
              </button>
              <button
                onClick={handleFinishWithTeacher}
                disabled={saving || !selectedTeacherId}
                className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Começar a aprender"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer info */}
      <div className="mt-6 flex items-center gap-2 text-white/40 text-xs">
        <Sparkles className="w-3 h-3" />
        <span>{TOTAL_LANGUAGES} idiomas · IA avançada · Professores virtuais</span>
      </div>
    </div>
  );
}
