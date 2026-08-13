import { useState, lazy, Suspense } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { ArrowLeft, Flame, Globe, ChevronDown } from "lucide-react";
import type { CEFRLevel } from "@/lib/lesson-levels";

const DailyMemoryTrainer = lazy(() => import("@/components/DailyMemoryTrainer"));

const LEVELS: Array<{ value: CEFRLevel; label: string; desc: string }> = [
  { value: "A1", label: "A1 · Iniciante", desc: "Palavras concretas e frases essenciais" },
  { value: "A2", label: "A2 · Básico", desc: "Rotina, compras e situações simples" },
  { value: "B1", label: "B1 · Intermediário", desc: "Vocabulário conversacional frequente" },
  { value: "B2", label: "B2 · Intermediário avançado", desc: "Temas abstratos e comparações" },
  { value: "C1", label: "C1 · Avançado", desc: "Precisão, registro e nuance" },
  { value: "C2", label: "C2 · Proficiente", desc: "Vocabulário especializado e refinado" },
];

export default function DailyMemoryPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [started, setStarted] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en-US");
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>("A1");
  const [showLangPicker, setShowLangPicker] = useState(false);

  // All available languages
  const allLangsQuery = trpc.languages.list.useQuery();
  const languages = allLangsQuery.data || [];

  const selectedLangObj = languages.find((l: any) => l.code === selectedLang);

  if (started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Back button */}
          <button
            onClick={() => setStarted(false)}
            className="flex items-center gap-2 text-blue-300 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar à seleção
          </button>

          <div className="bg-white rounded-2xl shadow-2xl p-5">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600" />
                </div>
              }
            >
              <DailyMemoryTrainer
                languageCode={selectedLang}
                nativeLanguage="pt-BR"
                level={selectedLevel}
                onClose={() => setStarted(false)}
              />
            </Suspense>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-blue-300 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Início
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/30">
            <Flame className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Treino Diário</h1>
          <p className="text-blue-300 mt-2">
            Memorize vocabulário com pronúncia real, fonética e sinônimos
          </p>
        </div>

        {/* Language selector */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-5 mb-4 border border-white/20">
          <p className="text-xs font-bold text-blue-300 uppercase mb-3 flex items-center gap-2">
            <Globe className="h-3.5 w-3.5" /> Idioma para praticar
          </p>
          <button
            onClick={() => setShowLangPicker(!showLangPicker)}
            className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 rounded-xl px-4 py-3 transition-colors"
          >
            <span className="text-white font-semibold">
              {selectedLangObj ? `${selectedLangObj.flag || "🌐"} ${selectedLangObj.name}` : selectedLang}
            </span>
            <ChevronDown className={`h-4 w-4 text-blue-300 transition-transform ${showLangPicker ? "rotate-180" : ""}`} />
          </button>

          {showLangPicker && (
            <div className="mt-2 max-h-48 overflow-y-auto rounded-xl bg-slate-800 border border-white/10">
              {/* Quick picks */}
              {[
                { code: "en-US", name: "Inglês Americano", flag: "🇺🇸" },
                { code: "en-GB", name: "Inglês Britânico", flag: "🇬🇧" },
                { code: "es-ES", name: "Espanhol", flag: "🇪🇸" },
                { code: "fr", name: "Francês", flag: "🇫🇷" },
                { code: "de", name: "Alemão", flag: "🇩🇪" },
                { code: "it", name: "Italiano", flag: "🇮🇹" },
                { code: "ja", name: "Japonês", flag: "🇯🇵" },
                { code: "zh", name: "Chinês", flag: "🇨🇳" },
                { code: "ko", name: "Coreano", flag: "🇰🇷" },
                { code: "ru", name: "Russo", flag: "🇷🇺" },
                { code: "ar", name: "Árabe", flag: "🇸🇦" },
              ].concat(
                languages
                  .filter((l: any) => !["en-US","en-GB","es-ES","fr","de","it","ja","zh","ko","ru","ar"].includes(l.code))
                  .map((l: any) => ({ code: l.code, name: l.name, flag: l.flag || "🌐" }))
              ).map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { setSelectedLang(lang.code); setShowLangPicker(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/10 transition-colors ${
                    selectedLang === lang.code ? "bg-blue-600/30 text-blue-200" : "text-white"
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="text-sm font-medium">{lang.name}</span>
                  {selectedLang === lang.code && <Badge className="ml-auto text-xs bg-blue-600">✓</Badge>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Level selector */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-5 mb-6 border border-white/20">
          <p className="text-xs font-bold text-blue-300 uppercase mb-3">Nível de vocabulário</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {LEVELS.map((lv) => (
              <button
                key={lv.value}
                onClick={() => setSelectedLevel(lv.value)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  selectedLevel === lv.value
                    ? "border-blue-400 bg-blue-600/30 shadow-lg"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <p className="text-sm font-bold text-white">{lv.label}</p>
                <p className="text-xs text-blue-300 mt-0.5">{lv.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: "🔊", title: "Múltiplos Timbres", desc: "Masc., fem. e sotaques regionais" },
            { icon: "🗣️", title: "Fonética Figurativa", desc: "Como soa em português" },
            { icon: "🔗", title: "Comparação Fonética", desc: "IPA + equivalente em PT" },
            { icon: "🔄", title: "Sinônimos Ativos", desc: "Substitua palavras em frases" },
            { icon: "✍️", title: "Escrita Ativa", desc: "Escreva sem ver o original" },
            { icon: "🧠", title: "Repetição Espaçada", desc: "Erros voltam para fixar" },
          ].map((f, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-xl mb-1">{f.icon}</p>
              <p className="text-xs font-bold text-white">{f.title}</p>
              <p className="text-xs text-blue-300">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Start button */}
        <Button
          onClick={() => setStarted(true)}
          className="w-full py-4 text-lg font-bold rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Flame className="h-5 w-5 mr-2" />
          Iniciar Treino Diário
        </Button>
      </div>
    </div>
  );
}
