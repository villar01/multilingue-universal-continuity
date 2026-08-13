import { useState, useMemo, useCallback, useRef } from "react";
import { X, BookOpen, Volume2, Search, Star, ChevronLeft, ChevronRight, BookMarked } from "lucide-react";
import { PARETO_VOCAB, searchWords, getWordsByScene, type ParetoWord } from "@/lib/vocab-pareto";
import { HOTSPOT_TRANSLATIONS } from "@/lib/hotspot-translations";
import { trpc } from "@/lib/trpc";
import { ParetoPracticeCycle } from "@/components/ParetoPracticeCycle";
import type { CEFRLevel } from "@/lib/lesson-levels";

// Get translated word for a given BCP-47 target language
function getTranslatedWord(word: ParetoWord, targetLang: string): string {
  const base = targetLang.split("-")[0].toLowerCase();
  // If target is Portuguese, show ptBR
  if (base === "pt") return word.ptBR;
  // If target is English (any variant), show enUS/enGB
  if (base === "en") return targetLang === "en-GB" && word.enGB ? word.enGB : word.enUS;
  // Try to find a hotspot translation for the word id using the base lang code
  // Fallback: use enUS as the source word (since vocab is EN-based)
  return word.enUS;
}

// Get translated example sentence for a given BCP-47 target language
function getTranslatedExample(word: ParetoWord, targetLang: string): { text: string; flag: string } {
  const base = targetLang.split("-")[0].toLowerCase();
  if (base === "pt") return { text: word.examplePt, flag: "🇧🇷" };
  // For all other languages, show the English example (the vocabulary is EN-based)
  // and the PT translation below
  return { text: word.example, flag: "🇺🇸" };
}

// Get the flag for a BCP-47 language code
function getLangFlag(lang: string): string {
  const flags: Record<string, string> = {
    "pt": "🇧🇷", "pt-BR": "🇧🇷", "pt-PT": "🇵🇹",
    "en": "🇺🇸", "en-US": "🇺🇸", "en-GB": "🇬🇧",
    "es": "🇪🇸", "es-ES": "🇪🇸", "es-MX": "🇲🇽",
    "fr": "🇫🇷", "fr-FR": "🇫🇷",
    "de": "🇩🇪", "de-DE": "🇩🇪",
    "it": "🇮🇹", "it-IT": "🇮🇹",
    "ja": "🇯🇵", "ja-JP": "🇯🇵",
    "zh": "🇨🇳", "zh-CN": "🇨🇳",
    "ko": "🇰🇷", "ko-KR": "🇰🇷",
    "ru": "🇷🇺", "ru-RU": "🇷🇺",
    "ar": "🇸🇦", "ar-SA": "🇸🇦",
    "hi": "🇮🇳", "hi-IN": "🇮🇳",
    "nl": "🇳🇱", "tr": "🇹🇷", "sv": "🇸🇪", "pl": "🇵🇱",
    "id": "🇮🇩", "ms": "🇲🇾", "th": "🇹🇭", "vi": "🇻🇳",
  };
  return flags[lang] || flags[lang.split("-")[0]] || "🌐";
}

interface ParetoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  targetLang: string; // e.g. "en-US", "en-GB", "fr-FR"
  targetLangName: string; // e.g. "English (US)"
  currentScene?: string; // filter by scene
  practiceLevel?: CEFRLevel;
  voiceGender?: "male" | "female";
  onAddToNotebook?: (word: ParetoWord) => void;
}

const CATEGORIES = [
  { key: "all", label: "Todas", emoji: "📚" },
  { key: "greetings", label: "Saudações", emoji: "👋" },
  { key: "food", label: "Comida", emoji: "🍽️" },
  { key: "travel", label: "Viagem", emoji: "✈️" },
  { key: "work", label: "Trabalho", emoji: "💼" },
  { key: "health", label: "Saúde", emoji: "🏥" },
  { key: "family", label: "Família", emoji: "👨‍👩‍👧" },
  { key: "shopping", label: "Compras", emoji: "🛍️" },
  { key: "education", label: "Educação", emoji: "🎓" },
  { key: "sports", label: "Esportes", emoji: "⚽" },
  { key: "nature", label: "Natureza", emoji: "🌿" },
  { key: "beach", label: "Praia", emoji: "🏖️" },
  { key: "city", label: "Cidade", emoji: "🏙️" },
  { key: "weather", label: "Clima", emoji: "☀️" },
  { key: "body", label: "Corpo", emoji: "🧍" },
  { key: "colors", label: "Cores", emoji: "🎨" },
  { key: "numbers", label: "Números", emoji: "🔢" },
  { key: "time", label: "Tempo", emoji: "⏰" },
  { key: "directions", label: "Direções", emoji: "🗺️" },
  { key: "arts", label: "Artes", emoji: "🎭" },
  { key: "home", label: "Casa", emoji: "🏠" },
];

const PAGE_SIZE = 20;

// speak is now handled via trpc.tts.speak inside WordCard (server Neural TTS)

export default function ParetoPanel({
  isOpen,
  onClose,
  targetLang,
  targetLangName,
  currentScene,
  practiceLevel = "A1",
  voiceGender,
  onAddToNotebook,
}: ParetoPanelProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [sceneFilter, setSceneFilter] = useState(false); // default: show ALL words, not just scene words
  const [practiceWord, setPracticeWord] = useState<ParetoWord | null>(null);
  const practiceTtsMut = trpc.tts.speak.useMutation();
  const practiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const [starred, setStarred] = useState<Set<string>>(() => {
    try {
      const s = localStorage.getItem("ml_starred_words");
      return s ? new Set(JSON.parse(s)) : new Set();
    } catch { return new Set(); }
  });

  const toggleStar = useCallback((id: string) => {
    setStarred(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem("ml_starred_words", JSON.stringify([...next]));
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    let words = search.trim()
      ? searchWords(search)
      : PARETO_VOCAB;

    if (category !== "all") {
      words = words.filter((w: ParetoWord) => w.category === category);
    }
    if (sceneFilter && currentScene) {
      words = words.filter((w: ParetoWord) => w.scene === currentScene);
    }
    return words.sort((a: ParetoWord, b: ParetoWord) => b.frequency - a.frequency);
  }, [search, category, sceneFilter, currentScene]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageWords = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(0);
  };

  const handleCategory = (k: string) => {
    setCategory(k);
    setPage(0);
  };

  const speakPractice = useCallback(async (text: string) => {
    if (!text.trim()) return;
    if (practiceAudioRef.current) {
      practiceAudioRef.current.pause();
      practiceAudioRef.current = null;
    }
    try {
      const result = await practiceTtsMut.mutateAsync({ text: text.slice(0, 400), voiceLang: targetLang, gender: voiceGender });
      if (!result.success || !result.audioBase64) return;
      const bytes = Uint8Array.from(atob(result.audioBase64), (char) => char.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: "audio/mp3" }));
      const audio = new Audio(url);
      practiceAudioRef.current = audio;
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();
    } catch {
      // The cycle stays available for recall and writing when neural audio is unavailable.
    }
  }, [practiceTtsMut, targetLang, voiceGender]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-teal-500/30 rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-400" />
            <span className="text-white font-bold text-sm">Vocabulário Pareto</span>
            <span className="text-xs bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full">
              {filtered.length} / {PARETO_VOCAB.length} palavras
            </span>
          </div>
          <div className="flex items-center gap-2">
            {currentScene && (
              <button
                onClick={() => { setSceneFilter(v => !v); setPage(0); }}
                className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                  sceneFilter
                    ? "bg-teal-500/30 border-teal-400 text-teal-300"
                    : "border-gray-600 text-gray-400 hover:border-gray-400"
                }`}
              >
                🎬 Cena atual
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-2 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar palavra em português ou inglês..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
              className="w-full bg-gray-800 text-white text-sm pl-9 pr-4 py-2 rounded-lg border border-gray-600 focus:border-teal-400 focus:outline-none placeholder-gray-500"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 px-4 py-2 overflow-x-auto border-b border-gray-700 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => handleCategory(cat.key)}
              className={`flex-shrink-0 text-xs px-2 py-1 rounded-full border transition-colors whitespace-nowrap ${
                category === cat.key
                  ? "bg-teal-500/30 border-teal-400 text-teal-300"
                  : "border-gray-600 text-gray-400 hover:border-gray-400 hover:text-gray-200"
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Word list */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
          {pageWords.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhuma palavra encontrada</p>
            </div>
          ) : (
            pageWords.map(word => (
              <WordCard
                key={word.id}
                word={word}
                targetLang={targetLang}
                targetLangName={targetLangName}
                voiceGender={voiceGender}
                isStarred={starred.has(word.id)}
                onStar={() => toggleStar(word.id)}
                onPractice={() => setPracticeWord(word)}
                onAddToNotebook={onAddToNotebook}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-700">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <span className="text-xs text-gray-400">
              {page + 1} / {totalPages} — {filtered.length} palavras
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              Próxima <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
        {practiceWord && (
          <div className="absolute inset-0 z-10 flex items-end bg-slate-950/55 p-3 sm:items-center">
            <ParetoPracticeCycle
              term={{
                word: getTranslatedWord(practiceWord, targetLang),
                translation: targetLang.split("-")[0].toLowerCase() === "pt" ? practiceWord.enUS : practiceWord.ptBR,
                example: targetLang.split("-")[0].toLowerCase() === "pt" ? practiceWord.examplePt : practiceWord.example,
              }}
              onClose={() => setPracticeWord(null)}
              onSpeak={speakPractice}
              embedded
              level={practiceLevel}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function WordCard({
  word,
  targetLang,
  targetLangName,
  voiceGender,
  isStarred,
  onStar,
  onPractice,
  onAddToNotebook,
}: {
  word: ParetoWord;
  targetLang: string;
  targetLangName: string;
  voiceGender?: "male" | "female";
  isStarred: boolean;
  onStar: () => void;
  onPractice: () => void;
  onAddToNotebook?: (word: ParetoWord) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const ttsMut = trpc.tts.speak.useMutation();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string, lang: string) => {
    if (!text?.trim()) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    try {
      const r = await ttsMut.mutateAsync({ text: text.slice(0, 400), voiceLang: lang, gender: voiceGender });
      if (r.success && r.audioBase64) {
        const bytes = Uint8Array.from(atob(r.audioBase64), c => c.charCodeAt(0));
        const url = URL.createObjectURL(new Blob([bytes], { type: "audio/mp3" }));
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => URL.revokeObjectURL(url);
        audio.play().catch(() => {});
        return;
      }
    } catch {
      // Neural audio failure leaves the word visible for recall and writing practice.
    }
  }, [ttsMut, voiceGender]);

  // Determine display word based on target language
  const base = targetLang.split("-")[0].toLowerCase();
  const isTargetPt = base === "pt";
  const displayWord = getTranslatedWord(word, targetLang);
  const displayPron = targetLang === "en-GB" && word.pronunciationGB ? word.pronunciationGB : word.pronunciation;
  const targetFlag = getLangFlag(targetLang);
  // The "other" language shown below: if studying PT, show EN; if studying EN/other, show PT
  const secondWord = isTargetPt ? word.enUS : word.ptBR;
  const secondFlag = isTargetPt ? "🇺🇸" : "🇧🇷";
  const secondLang = isTargetPt ? "en-US" : "pt-BR";

  return (
    <div
      className={`bg-gray-800/60 border rounded-xl p-3 transition-all cursor-pointer ${
        expanded ? "border-teal-500/50" : "border-gray-700 hover:border-gray-500"
      }`}
      onClick={() => setExpanded(v => !v)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            {/* Target language word (what student is learning) */}
            <div className="flex items-center gap-1">
              <span className="text-sm">{targetFlag}</span>
              <span className="text-teal-300 font-bold text-sm truncate">{displayWord}</span>
              <span className="text-gray-500 text-xs hidden sm:inline">/{displayPron}/</span>
            </div>
            {/* Native language translation — fundo branco, letra azul */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: "#ffffff", color: "#1d4ed8", border: "1px solid #93c5fd" }}
              >
                <span>{secondFlag}</span>
                <span style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>{secondLang.split("-")[0].toUpperCase()}</span>
              </span>
              <span className="text-white font-medium text-sm truncate">{secondWord}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Frequency dots */}
          <div className="hidden sm:flex gap-0.5">
            {[...Array(5)].map((_: unknown, i: number) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  i < Math.ceil(word.frequency / 2) ? "bg-teal-400" : "bg-gray-600"
                }`}
              />
            ))}
          </div>
          <button
            onClick={e => { e.stopPropagation(); speak(displayWord, targetLang); }}
            className="p-1 text-gray-400 hover:text-teal-400 transition-colors"
            title={`Ouvir em ${targetLangName}`}
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onStar(); }}
            className={`p-1 transition-colors ${isStarred ? "text-yellow-400" : "text-gray-500 hover:text-yellow-400"}`}
            title="Favoritar"
          >
            <Star className={`w-4 h-4 ${isStarred ? "fill-yellow-400" : ""}`} />
          </button>
          {onAddToNotebook && (
            <button
              onClick={e => { e.stopPropagation(); onAddToNotebook(word); }}
              className="p-1 text-gray-500 hover:text-blue-400 transition-colors"
              title="Adicionar ao caderno"
            >
              <BookMarked className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded: pronunciation + example sentence */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Pronúncia:</span>
            <span className="text-xs text-teal-300 font-mono">/{displayPron}/</span>
            <button
              onClick={e => { e.stopPropagation(); speak(displayWord, targetLang); }}
              className="text-teal-400 hover:text-teal-300 transition-colors"
            >
              <Volume2 className="w-3 h-3" />
            </button>
          </div>
          {/* Example sentence */}
          <div className="bg-gray-900/50 rounded-lg p-2 space-y-1">
            {/* Target language example */}
            <div className="flex items-start gap-2">
              <span className="text-sm flex-shrink-0">{targetFlag}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-200 italic">"{isTargetPt ? word.examplePt : word.example}"</p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); speak(isTargetPt ? word.examplePt : word.example, targetLang); }}
                className="text-gray-500 hover:text-teal-400 transition-colors flex-shrink-0"
              >
                <Volume2 className="w-3 h-3" />
              </button>
            </div>
            {/* Native language translation */}
            <div className="flex items-start gap-2">
              <span className="text-sm flex-shrink-0">{secondFlag}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 italic">"{isTargetPt ? word.example : word.examplePt}"</p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); speak(isTargetPt ? word.example : word.examplePt, secondLang); }}
                className="text-gray-500 hover:text-green-400 transition-colors flex-shrink-0"
              >
                <Volume2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onPractice(); }}
            className="w-full rounded-lg border border-amber-300/45 bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-100 hover:bg-amber-400/20"
          >
            Praticar: lembrar, escrever e criar frase
          </button>
          {/* en-GB variant note */}
          {targetLang === "en-GB" && (
            <p className="text-xs text-amber-400/70">
              🇬🇧 Variante britânica: pronúncia pode diferir do americano
            </p>
          )}
        </div>
      )}
    </div>
  );
}
