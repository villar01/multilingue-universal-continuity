import { useState, useEffect, useRef, useCallback } from "react";
import { selectBestVoice, normalizeLang, speakText as speakNaturalVoice } from "@/hooks/useNaturalVoice";
import { useAuth } from "@/_core/hooks/useAuth";
import { stopEdgeTTS } from "@/lib/edgeTTSClient";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ParetoPracticeCycle } from "@/components/ParetoPracticeCycle";
import { resolvePracticeCEFRLevel, type CEFRLevel } from "@/lib/lesson-levels";
import { toast } from "sonner";
import {
  Volume2,
  VolumeX,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Star,
  BookOpen,
  Mic,
  PenLine,
  ArrowLeftRight,
  Repeat,
  Play,
  Pause,
  RefreshCw,
  Trophy,
  Flame,
  Target,
  Zap,
  Sparkles,
} from "lucide-react";

// ─── Voice engine ────────────────────────────────────────────────────────────

interface VoiceOption {
  label: string;
  lang: string;
  voiceName?: string; // partial match
  rate: number;
  pitch: number;
}

// Map language codes to multiple voice variants
const VOICE_VARIANTS: Record<string, VoiceOption[]> = {
  "en-US": [
    { label: "🇺🇸 Americano (Masc.)", lang: "en-US", rate: 0.88, pitch: 0.9 },
    { label: "🇺🇸 Americano (Fem.)", lang: "en-US", voiceName: "female", rate: 0.88, pitch: 1.1 },
    { label: "🇬🇧 Britânico", lang: "en-GB", rate: 0.85, pitch: 1.0 },
    { label: "🇦🇺 Australiano", lang: "en-AU", rate: 0.88, pitch: 1.0 },
  ],
  "en-GB": [
    { label: "🇬🇧 Britânico (Masc.)", lang: "en-GB", rate: 0.85, pitch: 0.9 },
    { label: "🇬🇧 Britânico (Fem.)", lang: "en-GB", rate: 0.85, pitch: 1.1 },
    { label: "🇺🇸 Americano", lang: "en-US", rate: 0.88, pitch: 1.0 },
  ],
  "en": [
    { label: "🇺🇸 Americano", lang: "en-US", rate: 0.88, pitch: 1.0 },
    { label: "🇬🇧 Britânico", lang: "en-GB", rate: 0.85, pitch: 1.0 },
    { label: "🇦🇺 Australiano", lang: "en-AU", rate: 0.88, pitch: 1.0 },
  ],
  "es": [
    { label: "🇪🇸 Castelhano", lang: "es-ES", rate: 0.88, pitch: 1.0 },
    { label: "🇲🇽 Mexicano", lang: "es-MX", rate: 0.9, pitch: 1.0 },
    { label: "🇦🇷 Argentino", lang: "es-AR", rate: 0.88, pitch: 1.0 },
  ],
  "es-ES": [
    { label: "🇪🇸 Castelhano (Masc.)", lang: "es-ES", rate: 0.88, pitch: 0.9 },
    { label: "🇪🇸 Castelhano (Fem.)", lang: "es-ES", rate: 0.88, pitch: 1.1 },
    { label: "🇲🇽 Mexicano", lang: "es-MX", rate: 0.9, pitch: 1.0 },
  ],
  "fr": [
    { label: "🇫🇷 Parisiense (Masc.)", lang: "fr-FR", rate: 0.85, pitch: 0.9 },
    { label: "🇫🇷 Parisiense (Fem.)", lang: "fr-FR", rate: 0.85, pitch: 1.1 },
    { label: "🇨🇦 Canadense", lang: "fr-CA", rate: 0.88, pitch: 1.0 },
  ],
  "de": [
    { label: "🇩🇪 Alemão (Masc.)", lang: "de-DE", rate: 0.85, pitch: 0.9 },
    { label: "🇩🇪 Alemão (Fem.)", lang: "de-DE", rate: 0.85, pitch: 1.1 },
    { label: "🇦🇹 Austríaco", lang: "de-AT", rate: 0.85, pitch: 1.0 },
  ],
  "pt": [
    { label: "🇧🇷 Brasileiro (Masc.)", lang: "pt-BR", rate: 0.88, pitch: 0.9 },
    { label: "🇧🇷 Brasileiro (Fem.)", lang: "pt-BR", rate: 0.88, pitch: 1.1 },
    { label: "🇵🇹 Europeu", lang: "pt-PT", rate: 0.85, pitch: 1.0 },
  ],
  "pt-BR": [
    { label: "🇧🇷 Brasileiro (Masc.)", lang: "pt-BR", rate: 0.88, pitch: 0.9 },
    { label: "🇧🇷 Brasileiro (Fem.)", lang: "pt-BR", rate: 0.88, pitch: 1.1 },
    { label: "🇵🇹 Europeu", lang: "pt-PT", rate: 0.85, pitch: 1.0 },
  ],
  "it": [
    { label: "🇮🇹 Italiano (Masc.)", lang: "it-IT", rate: 0.88, pitch: 0.9 },
    { label: "🇮🇹 Italiano (Fem.)", lang: "it-IT", rate: 0.88, pitch: 1.1 },
  ],
  "ja": [
    { label: "🇯🇵 Japonês (Masc.)", lang: "ja-JP", rate: 0.82, pitch: 0.9 },
    { label: "🇯🇵 Japonês (Fem.)", lang: "ja-JP", rate: 0.82, pitch: 1.15 },
  ],
  "zh": [
    { label: "🇨🇳 Mandarim (Masc.)", lang: "zh-CN", rate: 0.82, pitch: 0.9 },
    { label: "🇨🇳 Mandarim (Fem.)", lang: "zh-CN", rate: 0.82, pitch: 1.1 },
    { label: "🇹🇼 Taiwanês", lang: "zh-TW", rate: 0.82, pitch: 1.0 },
  ],
  "ko": [
    { label: "🇰🇷 Coreano (Masc.)", lang: "ko-KR", rate: 0.85, pitch: 0.9 },
    { label: "🇰🇷 Coreano (Fem.)", lang: "ko-KR", rate: 0.85, pitch: 1.1 },
  ],
  "ru": [
    { label: "🇷🇺 Russo (Masc.)", lang: "ru-RU", rate: 0.85, pitch: 0.9 },
    { label: "🇷🇺 Russo (Fem.)", lang: "ru-RU", rate: 0.85, pitch: 1.1 },
  ],
  "ar": [
    { label: "🇸🇦 Árabe Padrão", lang: "ar-SA", rate: 0.82, pitch: 0.9 },
    { label: "🇪🇬 Egípcio", lang: "ar-EG", rate: 0.82, pitch: 1.0 },
  ],
};

function getVoiceVariants(langCode: string): VoiceOption[] {
  return (
    VOICE_VARIANTS[langCode] ||
    VOICE_VARIANTS[langCode.split("-")[0]] || [
      { label: "🔊 Voz Padrão", lang: langCode, rate: 0.88, pitch: 1.0 },
    ]
  );
}

function useMultiVoice(langCode: string) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [activeVariantIdx, setActiveVariantIdx] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const variants = getVoiceVariants(langCode);

  // Edge TTS Neural para pronúncia natural
  const speak = useCallback(
    (text: string, slow = false) => {
      if (!text?.trim()) return;
      stopEdgeTTS();
      const variant = variants[activeVariantIdx];
      const bcp47 = normalizeLang(variant.lang);
      const rate = slow ? (variant.rate ?? 0.85) * 0.65 : (variant.rate ?? 0.85);
      setIsSpeaking(true);
      speakNaturalVoice(text, bcp47, {
        rate,
        onEnd: () => setIsSpeaking(false),
      });
    },
    [variants, activeVariantIdx]
  );

  return { variants, activeVariantIdx, setActiveVariantIdx, speak, isSpeaking };
}

// ─── Types ────────────────────────────────────────────────────────────────────

type TrainMode = "flip" | "write" | "translate" | "synonym" | "listen";

interface WordCard {
  id: number;
  word: string;
  phonetic: string;
  phoneticFigurative: string;
  phoneticComparison: string;
  partOfSpeech: string;
  translation: string;
  definition: string;
  synonyms: string[];
  synonymsNative: string[];
  antonyms: string[];
  antonymsNative: string[];
  exampleSentence: string;
  exampleTranslation: string;
  exampleWithSynonym: string;
  exampleWithSynonymTranslation: string;
  memoryTip: string;
  usageNote: string;
  difficulty: number;
  // runtime state
  mastered?: boolean;
  attempts?: number;
  errors?: number;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function VoiceSelector({
  variants,
  activeIdx,
  onChange,
  isSpeaking,
}: {
  variants: VoiceOption[];
  activeIdx: number;
  onChange: (i: number) => void;
  isSpeaking: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      <span className="text-xs font-semibold text-gray-500 mr-1">Timbre:</span>
      {variants.map((v, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={`text-xs px-2 py-1 rounded-full border transition-all ${
            i === activeIdx
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
          } ${isSpeaking && i === activeIdx ? "animate-pulse" : ""}`}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}

function SpeakButtons({
  word,
  speak,
  isSpeaking,
}: {
  word: string;
  speak: (text: string, slow?: boolean) => void;
  isSpeaking: boolean;
}) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => speak(word, false)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all ${
          isSpeaking ? "opacity-70" : ""
        }`}
        title="Ouvir pronúncia normal"
      >
        <Volume2 className="h-4 w-4" />
        Normal
      </button>
      <button
        onClick={() => speak(word, true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-medium hover:bg-indigo-200 transition-all"
        title="Ouvir devagar"
      >
        <Pause className="h-4 w-4" />
        Devagar
      </button>
    </div>
  );
}

function PhoneticPanel({ word }: { word: WordCard }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
        <p className="text-xs font-bold text-amber-600 uppercase mb-1">🔊 IPA (Fonética Oficial)</p>
        <p className="font-mono text-base text-amber-800">{word.phonetic || "—"}</p>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-xl p-3">
        <p className="text-xs font-bold text-green-600 uppercase mb-1">🗣️ Como soa em PT</p>
        <p className="font-bold text-green-800 text-base">{word.phoneticFigurative || "—"}</p>
      </div>
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
        <p className="text-xs font-bold text-purple-600 uppercase mb-1">🔗 Comparação</p>
        <p className="text-purple-800 text-sm">{word.phoneticComparison || "—"}</p>
      </div>
    </div>
  );
}

// ─── Mode: Flip Card ──────────────────────────────────────────────────────────

function FlipCard({
  word,
  speak,
  isSpeaking,
  onResult,
}: {
  word: WordCard;
  speak: (t: string, slow?: boolean) => void;
  isSpeaking: boolean;
  onResult: (correct: boolean) => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const [showSynonym, setShowSynonym] = useState(false);

  useEffect(() => {
    setFlipped(false);
    setShowSynonym(false);
  }, [word.id]);

  return (
    <div className="space-y-4">
      {/* Card */}
      <div
        className="relative w-full min-h-52 cursor-pointer select-none"
        onClick={() => { if (!flipped) { setFlipped(true); speak(word.word); } }}
      >
        <div
          className={`transition-all duration-500 w-full rounded-2xl border-2 shadow-lg p-6 flex flex-col items-center justify-center gap-3 min-h-52 ${
            flipped
              ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300"
              : "bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:border-blue-300"
          }`}
        >
          {!flipped ? (
            <>
              <p className="text-4xl font-bold text-gray-800">{word.word}</p>
              <p className="text-gray-400 text-sm">Toque para revelar</p>
            </>
          ) : (
            <>
              <p className="text-3xl font-bold text-blue-800">{word.word}</p>
              <PhoneticPanel word={word} />
              <div className="mt-2 text-center">
                <p className="text-xl font-semibold text-gray-700">{word.translation}</p>
                <p className="text-sm text-gray-500 mt-1 italic">{word.definition}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Speak buttons */}
      {flipped && (
        <div className="space-y-3">
          <SpeakButtons word={word.word} speak={speak} isSpeaking={isSpeaking} />

          {/* Example sentence */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Exemplo em contexto:</p>
            <button
              onClick={() => speak(word.exampleSentence)}
              className="text-blue-800 font-medium text-sm hover:text-blue-600 flex items-center gap-1 group"
            >
              {word.exampleSentence}
              <Volume2 className="h-3 w-3 opacity-0 group-hover:opacity-100" />
            </button>
            <p className="text-gray-600 text-sm mt-1">{word.exampleTranslation}</p>
          </div>

          {/* Synonym substitution */}
          {word.synonyms?.length > 0 && (
            <div className="bg-teal-50 rounded-xl p-3 border border-teal-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-teal-600 uppercase">Sinônimos:</p>
                <button
                  onClick={() => {
                    setShowSynonym(!showSynonym);
                    if (!showSynonym) speak(word.exampleWithSynonym);
                  }}
                  className="text-xs text-teal-700 underline"
                >
                  {showSynonym ? "Ocultar" : "Ver frase com sinônimo"}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {word.synonyms.map((syn, i) => (
                  <button
                    key={i}
                    onClick={() => speak(syn)}
                    className="flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-800 rounded-lg text-sm hover:bg-teal-200 transition-colors"
                  >
                    {syn}
                    <span className="text-teal-500 text-xs">({word.synonymsNative?.[i] || ""})</span>
                    <Volume2 className="h-3 w-3 text-teal-400" />
                  </button>
                ))}
              </div>
              {showSynonym && (
                <div className="mt-2 pt-2 border-t border-teal-200">
                  <p className="text-sm text-teal-800 font-medium">{word.exampleWithSynonym}</p>
                  <p className="text-xs text-teal-600 mt-0.5">{word.exampleWithSynonymTranslation}</p>
                </div>
              )}
            </div>
          )}

          {/* Memory tip */}
          {word.memoryTip && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-2">
              <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-800">{word.memoryTip}</p>
            </div>
          )}

          {/* Result buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onResult(false)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-100 text-red-700 font-bold hover:bg-red-200 transition-colors"
            >
              <XCircle className="h-5 w-5" /> Errei
            </button>
            <button
              onClick={() => onResult(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-100 text-green-700 font-bold hover:bg-green-200 transition-colors"
            >
              <CheckCircle2 className="h-5 w-5" /> Acertei
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Mode: Write ──────────────────────────────────────────────────────────────

function WriteMode({
  word,
  speak,
  isSpeaking,
  onResult,
}: {
  word: WordCard;
  speak: (t: string, slow?: boolean) => void;
  isSpeaking: boolean;
  onResult: (correct: boolean) => void;
}) {
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInput("");
    setChecked(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [word.id]);

  const check = () => {
    const userAns = input.trim().toLowerCase();
    const correct = word.word.toLowerCase();
    const isOk =
      userAns === correct ||
      userAns.replace(/[^a-z]/g, "") === correct.replace(/[^a-z]/g, "");
    setChecked(isOk);
    if (isOk) {
      speak(word.word);
      toast.success("✅ Correto! Perfeito!");
    } else {
      speak(word.word);
      toast.error(`❌ Era: ${word.word}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200 text-center">
        <p className="text-xs font-bold text-indigo-400 uppercase mb-2">Tradução em Português</p>
        <p className="text-3xl font-bold text-indigo-800">{word.translation}</p>
        <p className="text-sm text-indigo-500 mt-1 italic">{word.definition}</p>
        <PhoneticPanel word={word} />
      </div>

      <SpeakButtons word={word.word} speak={speak} isSpeaking={isSpeaking} />

      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-600">
          Escreva a palavra em {word.partOfSpeech ? `(${word.partOfSpeech})` : ""}:
        </p>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !checked && check()}
            placeholder="Digite a palavra..."
            className={`flex-1 border-2 rounded-xl px-4 py-3 text-lg font-medium focus:outline-none transition-colors ${
              checked === null
                ? "border-gray-300 focus:border-indigo-400"
                : checked
                ? "border-green-400 bg-green-50"
                : "border-red-400 bg-red-50"
            }`}
            disabled={checked !== null}
          />
          {checked === null && (
            <Button onClick={check} disabled={!input.trim()} className="px-6 rounded-xl">
              Verificar
            </Button>
          )}
        </div>

        {checked !== null && (
          <div className={`rounded-xl p-3 ${checked ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
            <p className={`font-bold ${checked ? "text-green-700" : "text-red-700"}`}>
              {checked ? "✅ Correto!" : `❌ A resposta era: ${word.word}`}
            </p>
            {!checked && (
              <p className="text-sm text-gray-600 mt-1">
                Fonética: <span className="font-mono text-amber-700">{word.phonetic}</span> — soa como: <strong>{word.phoneticFigurative}</strong>
              </p>
            )}
          </div>
        )}
      </div>

      {checked !== null && (
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onResult(false)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-100 text-red-700 font-bold hover:bg-red-200"
          >
            <XCircle className="h-5 w-5" /> Repetir
          </button>
          <button
            onClick={() => onResult(checked)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-100 text-green-700 font-bold hover:bg-green-200"
          >
            <ChevronRight className="h-5 w-5" /> Próxima
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Mode: Translate ──────────────────────────────────────────────────────────

function TranslateMode({
  word,
  speak,
  isSpeaking,
  onResult,
}: {
  word: WordCard;
  speak: (t: string, slow?: boolean) => void;
  isSpeaking: boolean;
  onResult: (correct: boolean) => void;
}) {
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInput("");
    setChecked(null);
    speak(word.word);
    setTimeout(() => inputRef.current?.focus(), 300);
  }, [word.id]);

  const check = () => {
    const userAns = input.trim().toLowerCase();
    const correct = word.translation.toLowerCase();
    const isOk =
      userAns === correct ||
      correct.includes(userAns) ||
      userAns.includes(correct.split(" ")[0]);
    setChecked(isOk);
    if (isOk) toast.success("✅ Tradução correta!");
    else toast.error(`❌ Era: ${word.translation}`);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200 text-center">
        <p className="text-xs font-bold text-blue-400 uppercase mb-2">Palavra no idioma-alvo</p>
        <button onClick={() => speak(word.word)} className="group">
          <p className="text-4xl font-bold text-blue-800 group-hover:text-blue-600 transition-colors">
            {word.word}
          </p>
        </button>
        <PhoneticPanel word={word} />
      </div>

      <SpeakButtons word={word.word} speak={speak} isSpeaking={isSpeaking} />

      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-600">Qual é a tradução em português?</p>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !checked && check()}
            placeholder="Tradução em português..."
            className={`flex-1 border-2 rounded-xl px-4 py-3 text-lg font-medium focus:outline-none transition-colors ${
              checked === null
                ? "border-gray-300 focus:border-blue-400"
                : checked
                ? "border-green-400 bg-green-50"
                : "border-red-400 bg-red-50"
            }`}
            disabled={checked !== null}
          />
          {checked === null && (
            <Button onClick={check} disabled={!input.trim()} className="px-6 rounded-xl">
              Verificar
            </Button>
          )}
        </div>

        {checked !== null && (
          <div className={`rounded-xl p-3 ${checked ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
            <p className={`font-bold ${checked ? "text-green-700" : "text-red-700"}`}>
              {checked ? "✅ Correto!" : `❌ Era: ${word.translation}`}
            </p>
            {word.usageNote && (
              <p className="text-xs text-gray-600 mt-1">💡 {word.usageNote}</p>
            )}
          </div>
        )}
      </div>

      {checked !== null && (
        <div className="flex gap-3 pt-2">
          <button onClick={() => onResult(false)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-100 text-red-700 font-bold hover:bg-red-200">
            <XCircle className="h-5 w-5" /> Repetir
          </button>
          <button onClick={() => onResult(checked)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-100 text-green-700 font-bold hover:bg-green-200">
            <ChevronRight className="h-5 w-5" /> Próxima
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Mode: Synonym ────────────────────────────────────────────────────────────

function SynonymMode({
  word,
  speak,
  isSpeaking,
  onResult,
}: {
  word: WordCard;
  speak: (t: string, slow?: boolean) => void;
  isSpeaking: boolean;
  onResult: (correct: boolean) => void;
}) {
  const [selectedSyn, setSelectedSyn] = useState<number | null>(null);

  useEffect(() => {
    setSelectedSyn(null);
  }, [word.id]);

  const allOptions = [
    { word: word.word, native: word.translation, isOriginal: true },
    ...(word.synonyms || []).map((s, i) => ({
      word: s,
      native: word.synonymsNative?.[i] || s,
      isOriginal: false,
    })),
  ];

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-5 border-2 border-teal-200">
        <p className="text-xs font-bold text-teal-500 uppercase mb-2">Frase original:</p>
        <button onClick={() => speak(word.exampleSentence)} className="text-left group">
          <p className="text-base font-semibold text-teal-800 group-hover:text-teal-600">
            {word.exampleSentence}
          </p>
        </button>
        <p className="text-sm text-teal-600 mt-1 italic">{word.exampleTranslation}</p>
      </div>

      <p className="text-sm font-semibold text-gray-600">
        Clique em um sinônimo para substituir <strong>"{word.word}"</strong> na frase:
      </p>

      <div className="grid grid-cols-1 gap-2">
        {allOptions.map((opt, i) => (
          <button
            key={i}
            onClick={() => {
              setSelectedSyn(i);
              speak(opt.word);
            }}
            className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${
              selectedSyn === i
                ? "border-teal-500 bg-teal-50 shadow-md"
                : "border-gray-200 bg-white hover:border-teal-300"
            }`}
          >
            <div>
              <span className="font-bold text-gray-800">{opt.word}</span>
              <span className="text-gray-500 text-sm ml-2">({opt.native})</span>
              {opt.isOriginal && (
                <Badge className="ml-2 text-xs bg-blue-100 text-blue-700 border-blue-200">original</Badge>
              )}
            </div>
            <Volume2 className={`h-4 w-4 ${selectedSyn === i ? "text-teal-500" : "text-gray-300"}`} />
          </button>
        ))}
      </div>

      {selectedSyn !== null && (
        <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
          <p className="text-xs font-bold text-teal-500 uppercase mb-1">Frase com sinônimo:</p>
          <button
            onClick={() => speak(word.exampleWithSynonym)}
            className="text-teal-800 font-medium text-sm hover:text-teal-600 flex items-center gap-1 group"
          >
            {selectedSyn === 0 ? word.exampleSentence : word.exampleWithSynonym}
            <Volume2 className="h-3 w-3 opacity-0 group-hover:opacity-100" />
          </button>
          <p className="text-xs text-teal-600 mt-1 italic">
            {selectedSyn === 0 ? word.exampleTranslation : word.exampleWithSynonymTranslation}
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={() => onResult(false)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-100 text-orange-700 font-bold hover:bg-orange-200">
          <RotateCcw className="h-5 w-5" /> Repetir
        </button>
        <button onClick={() => onResult(true)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-100 text-green-700 font-bold hover:bg-green-200">
          <ChevronRight className="h-5 w-5" /> Próxima
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface DailyMemoryTrainerProps {
  languageCode: string;
  nativeLanguage?: string;
  level?: CEFRLevel;
  topic?: string;
  onClose?: () => void;
}

const MODE_META: Record<TrainMode, { icon: React.ReactNode; label: string; color: string }> = {
  flip:      { icon: <BookOpen className="h-4 w-4" />,       label: "Cartão",    color: "blue"   },
  write:     { icon: <PenLine className="h-4 w-4" />,        label: "Escrever",  color: "indigo" },
  translate: { icon: <ArrowLeftRight className="h-4 w-4" />, label: "Traduzir",  color: "cyan"   },
  synonym:   { icon: <Repeat className="h-4 w-4" />,         label: "Sinônimos", color: "teal"   },
  listen:    { icon: <Mic className="h-4 w-4" />,            label: "Ouvir",     color: "purple" },
};

export default function DailyMemoryTrainer({
  languageCode,
  nativeLanguage = "pt",
  level = "A1",
  topic,
  onClose,
}: DailyMemoryTrainerProps) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<TrainMode>("flip");
  const [cardIdx, setCardIdx] = useState(0);
  const [cards, setCards] = useState<WordCard[]>([]);
  const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 });
  const [showComplete, setShowComplete] = useState(false);
  const [paretoOpen, setParetoOpen] = useState(false);
  const paretoAudioRef = useRef<HTMLAudioElement | null>(null);

  const { variants, activeVariantIdx, setActiveVariantIdx, speak, isSpeaking } =
    useMultiVoice(languageCode);
  const paretoTtsMut = trpc.tts.speak.useMutation();

  const wordsQuery = trpc.ai.getDailyWords.useQuery(
    { languageCode, nativeLanguage, level, count: 15, topic },
    { staleTime: 1000 * 60 * 20, enabled: isAuthenticated && !authLoading }
  );

  useEffect(() => {
    if (wordsQuery.data?.words?.length) {
      setCards(
        wordsQuery.data.words.map((w: any) => ({
          ...w,
          mastered: false,
          attempts: 0,
          errors: 0,
        }))
      );
      setCardIdx(0);
      setSessionScore({ correct: 0, total: 0 });
      setShowComplete(false);
    }
  }, [wordsQuery.data]);

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="py-12 text-center">
        <BookOpen className="mx-auto mb-3 h-10 w-10 text-blue-500" />
        <p className="font-semibold text-slate-800">Entre para iniciar o treino diário.</p>
        <p className="mt-1 text-sm text-slate-500">A geração de vocabulário é liberada somente na sua sessão de estudo.</p>
      </div>
    );
  }

  const currentCard = cards[cardIdx];

  const handleResult = (correct: boolean) => {
    setCards((prev) =>
      prev.map((c, i) =>
        i === cardIdx
          ? {
              ...c,
              attempts: (c.attempts || 0) + 1,
              errors: correct ? c.errors : (c.errors || 0) + 1,
              mastered: correct && (c.attempts || 0) >= 0,
            }
          : c
      )
    );
    setSessionScore((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1,
    }));

    if (correct) {
      if (cardIdx < cards.length - 1) {
        setCardIdx((i) => i + 1);
      } else {
        setShowComplete(true);
      }
    } else {
      // On error: move to end of queue for repetition
      const errorCard = cards[cardIdx];
      setCards((prev) => {
        const next = [...prev];
        next.splice(cardIdx, 1);
        next.push(errorCard);
        return next;
      });
    }
  };

  const restart = () => {
    setCardIdx(0);
    setSessionScore({ correct: 0, total: 0 });
    setShowComplete(false);
    setCards((prev) => prev.map((c) => ({ ...c, mastered: false, attempts: 0, errors: 0 })));
  };

  const speakPareto = async (text: string) => {
    if (!text.trim()) return;
    if (paretoAudioRef.current) {
      paretoAudioRef.current.pause();
      paretoAudioRef.current = null;
    }
    const activeVariant = variants[activeVariantIdx];
    const gender = activeVariant?.label.includes("Masc.") ? "male" : activeVariant?.label.includes("Fem.") ? "female" : undefined;
    try {
      const result = await paretoTtsMut.mutateAsync({
        text: text.slice(0, 400),
        voiceLang: activeVariant?.lang || languageCode,
        gender,
      });
      if (!result.success || !result.audioBase64) return;
      const bytes = Uint8Array.from(atob(result.audioBase64), (char) => char.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: "audio/mp3" }));
      const audio = new Audio(url);
      paretoAudioRef.current = audio;
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();
    } catch {
      // Recall and writing remain available even if neural playback is temporarily unavailable.
    }
  };

  if (wordsQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-200 border-t-blue-600" />
          <Zap className="absolute inset-0 m-auto h-6 w-6 text-blue-600" />
        </div>
        <p className="text-lg font-semibold text-gray-700">Preparando palavras do dia...</p>
        <p className="text-sm text-gray-500">A IA está gerando vocabulário com fonética, sinônimos e exemplos</p>
      </div>
    );
  }

  if (!cards.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Não foi possível carregar as palavras.</p>
        <Button variant="outline" onClick={() => wordsQuery.refetch()} className="mt-3">
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (showComplete) {
    const pct = Math.round((sessionScore.correct / sessionScore.total) * 100);
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-5 text-center">
        <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center">
          <Trophy className="h-10 w-10 text-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Sessão Concluída!</h2>
        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{sessionScore.correct}</p>
            <p className="text-sm text-gray-500">Acertos</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{pct}%</p>
            <p className="text-sm text-gray-500">Precisão</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-500">{cards.length}</p>
            <p className="text-sm text-gray-500">Palavras</p>
          </div>
        </div>
        <p className="text-gray-600 max-w-sm">
          {pct >= 80
            ? "Excelente! Você está dominando o vocabulário de hoje. Continue praticando amanhã!"
            : "Bom esforço! Repita as palavras com erro para fixar melhor na memória."}
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={restart} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" /> Repetir
          </Button>
          <Button onClick={() => wordsQuery.refetch()} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Novas Palavras
          </Button>
        </div>
      </div>
    );
  }

  const masteredCount = cards.filter((c) => c.mastered).length;
  const progress = Math.round((cardIdx / cards.length) * 100);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Treino Diário de Vocabulário
          </h2>
          <p className="text-xs text-gray-500">
            Palavra {cardIdx + 1} de {cards.length} · {masteredCount} dominadas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <Target className="h-3 w-3 mr-1" />
            {sessionScore.correct}/{sessionScore.total}
          </Badge>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Voice selector */}
      <VoiceSelector
        variants={variants}
        activeIdx={activeVariantIdx}
        onChange={setActiveVariantIdx}
        isSpeaking={isSpeaking}
      />

      {currentCard && (
        <button
          type="button"
          onClick={() => setParetoOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800 hover:bg-amber-100"
        >
          <Sparkles className="h-4 w-4" /> Praticar ciclo Pareto desta palavra
        </button>
      )}

      {currentCard && paretoOpen && (
        <ParetoPracticeCycle
          term={{ word: currentCard.word, translation: currentCard.translation, example: currentCard.exampleSentence }}
          onClose={() => setParetoOpen(false)}
          onSpeak={speakPareto}
          embedded
          level={resolvePracticeCEFRLevel(level)}
        />
      )}

      {/* Mode tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {(Object.keys(MODE_META) as TrainMode[]).map((m) => {
          const meta = MODE_META[m];
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === m
                  ? "bg-white shadow text-blue-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {meta.icon}
              <span className="hidden sm:inline">{meta.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active mode */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-5">
        {currentCard && mode === "flip" && (
          <FlipCard word={currentCard} speak={speak} isSpeaking={isSpeaking} onResult={handleResult} />
        )}
        {currentCard && mode === "write" && (
          <WriteMode word={currentCard} speak={speak} isSpeaking={isSpeaking} onResult={handleResult} />
        )}
        {currentCard && mode === "translate" && (
          <TranslateMode word={currentCard} speak={speak} isSpeaking={isSpeaking} onResult={handleResult} />
        )}
        {currentCard && mode === "synonym" && (
          <SynonymMode word={currentCard} speak={speak} isSpeaking={isSpeaking} onResult={handleResult} />
        )}
        {currentCard && mode === "listen" && (
          <div className="space-y-4 text-center">
            <div className="bg-purple-50 rounded-2xl p-8 border-2 border-purple-200">
              <p className="text-xs font-bold text-purple-400 uppercase mb-3">Ouça e repita</p>
              <p className="text-4xl font-bold text-purple-800 mb-2">{currentCard.word}</p>
              <PhoneticPanel word={currentCard} />
            </div>
            <SpeakButtons word={currentCard.word} speak={speak} isSpeaking={isSpeaking} />
            <p className="text-sm text-gray-500">Ouça os diferentes timbres e repita em voz alta</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => handleResult(false)} className="flex-1 py-3 rounded-xl bg-orange-100 text-orange-700 font-bold hover:bg-orange-200">
                Repetir
              </button>
              <button onClick={() => handleResult(true)} className="flex-1 py-3 rounded-xl bg-green-100 text-green-700 font-bold hover:bg-green-200">
                Próxima →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Word list mini */}
      <div className="flex flex-wrap gap-1.5">
        {cards.map((c, i) => (
          <button
            key={i}
            onClick={() => setCardIdx(i)}
            className={`text-xs px-2 py-1 rounded-full border transition-all ${
              i === cardIdx
                ? "bg-blue-600 text-white border-blue-600"
                : c.mastered
                ? "bg-green-100 text-green-700 border-green-300"
                : (c.errors || 0) > 0
                ? "bg-red-100 text-red-600 border-red-300"
                : "bg-gray-100 text-gray-600 border-gray-200"
            }`}
          >
            {c.word}
          </button>
        ))}
      </div>
    </div>
  );
}
