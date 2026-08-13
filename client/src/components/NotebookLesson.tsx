/**
 * NotebookLesson — Sistema de Caderno de Aulas
 *
 * O professor instrui o aluno a copiar frases no caderno pessoal.
 * Exercícios offline progressivos: cópia → lacunas → memória → ditado.
 * Caderno persistente em localStorage — funciona 100% offline.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { speakText } from "@/hooks/useNaturalVoice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { CEFRLevel } from "@/lib/lesson-levels";
import {
  BookOpen,
  PenLine,
  CheckCircle2,
  XCircle,
  Volume2,
  ChevronRight,
  ChevronLeft,
  Download,
  Trash2,
  Star,
  GraduationCap,
  Lightbulb,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface NotebookEntry {
  id: string;
  lessonId: number;
  lessonTitle: string;
  languageCode: string;
  phrase: string;       // target language
  translation: string;  // native language (pt-BR)
  phonetic: string;     // IPA
  copiedAt: number;     // timestamp
  mastered: boolean;
}

type ExerciseMode = "copy" | "gaps" | "memory" | "dictation";

interface LessonPhrase {
  phrase: string;
  translation: string;
  phonetic: string;
  keyword: string;
  tip: string;
}

interface NotebookLessonProps {
  lessonId: number;
  lessonTitle: string;
  languageCode: string;
  nativeLanguage?: string;
  level?: CEFRLevel;
  topic?: string;
  /** Pre-built phrases from the lesson content (optional — will generate offline if not provided) */
  phrases?: LessonPhrase[];
}

// ── Offline phrase generator (no AI needed) ──────────────────────────────────

function generateOfflinePhrases(
  topic: string,
  lang: string,
  level: CEFRLevel
): LessonPhrase[] {
  // Structured phrase templates for common topics — 100% offline
  const templates: Record<string, LessonPhrase[]> = {
    greetings: [
      { phrase: "Hello, how are you?", translation: "Olá, como você está?", phonetic: "/hɛˈloʊ haʊ ɑːr juː/", keyword: "hello", tip: "Use ao encontrar alguém" },
      { phrase: "Good morning!", translation: "Bom dia!", phonetic: "/ɡʊd ˈmɔːrnɪŋ/", keyword: "morning", tip: "Diga antes do meio-dia" },
      { phrase: "Good afternoon!", translation: "Boa tarde!", phonetic: "/ɡʊd ˌæftərˈnuːn/", keyword: "afternoon", tip: "Diga entre 12h e 18h" },
      { phrase: "Good night!", translation: "Boa noite!", phonetic: "/ɡʊd naɪt/", keyword: "night", tip: "Diga ao se despedir à noite" },
      { phrase: "Nice to meet you.", translation: "Prazer em conhecê-lo.", phonetic: "/naɪs tə miːt juː/", keyword: "meet", tip: "Ao ser apresentado a alguém" },
    ],
    family: [
      { phrase: "This is my mother.", translation: "Esta é minha mãe.", phonetic: "/ðɪs ɪz maɪ ˈmʌðər/", keyword: "mother", tip: "Apresentando um familiar" },
      { phrase: "My father works every day.", translation: "Meu pai trabalha todos os dias.", phonetic: "/maɪ ˈfɑːðər wɜːrks ˈɛvri deɪ/", keyword: "father", tip: "Descrevendo rotina" },
      { phrase: "I have two brothers.", translation: "Eu tenho dois irmãos.", phonetic: "/aɪ hæv tuː ˈbrʌðərz/", keyword: "brothers", tip: "Falando sobre família" },
      { phrase: "My sister is very kind.", translation: "Minha irmã é muito gentil.", phonetic: "/maɪ ˈsɪstər ɪz ˈvɛri kaɪnd/", keyword: "sister", tip: "Descrevendo personalidade" },
      { phrase: "We are a happy family.", translation: "Somos uma família feliz.", phonetic: "/wiː ɑːr ə ˈhæpi ˈfæməli/", keyword: "family", tip: "Expressão de afeto" },
    ],
    numbers: [
      { phrase: "There are ten students in the class.", translation: "Há dez alunos na turma.", phonetic: "/ðɛr ɑːr tɛn ˈstjuːdənts ɪn ðə klɑːs/", keyword: "ten", tip: "Contando pessoas" },
      { phrase: "I need twenty minutes.", translation: "Preciso de vinte minutos.", phonetic: "/aɪ niːd ˈtwɛnti ˈmɪnɪts/", keyword: "twenty", tip: "Pedindo tempo" },
      { phrase: "The price is fifty dollars.", translation: "O preço é cinquenta dólares.", phonetic: "/ðə praɪs ɪz ˈfɪfti ˈdɒlərz/", keyword: "fifty", tip: "Falando de preços" },
      { phrase: "She is thirty years old.", translation: "Ela tem trinta anos.", phonetic: "/ʃiː ɪz ˈθɜːrti jɪərz oʊld/", keyword: "thirty", tip: "Falando de idade" },
      { phrase: "There are one hundred pages.", translation: "Há cem páginas.", phonetic: "/ðɛr ɑːr wʌn ˈhʌndrəd ˈpeɪdʒɪz/", keyword: "hundred", tip: "Contando objetos" },
    ],
    colors: [
      { phrase: "The sky is blue.", translation: "O céu é azul.", phonetic: "/ðə skaɪ ɪz bluː/", keyword: "blue", tip: "Descrevendo cores" },
      { phrase: "I love red roses.", translation: "Eu amo rosas vermelhas.", phonetic: "/aɪ lʌv rɛd ˈroʊzɪz/", keyword: "red", tip: "Expressando preferência" },
      { phrase: "The grass is green.", translation: "A grama é verde.", phonetic: "/ðə ɡrɑːs ɪz ɡriːn/", keyword: "green", tip: "Descrevendo natureza" },
      { phrase: "She wears a yellow dress.", translation: "Ela usa um vestido amarelo.", phonetic: "/ʃiː wɛrz ə ˈjɛloʊ drɛs/", keyword: "yellow", tip: "Descrevendo roupas" },
      { phrase: "The night is black.", translation: "A noite é negra.", phonetic: "/ðə naɪt ɪz blæk/", keyword: "black", tip: "Descrevendo escuridão" },
    ],
  };

  const practiceCountByLevel: Record<CEFRLevel, number> = {
    A1: 2,
    A2: 3,
    B1: 4,
    B2: 5,
    C1: 5,
    C2: 5,
  };
  const practiceCount = practiceCountByLevel[level];

  // Try to match topic
  const topicLower = (topic || "").toLowerCase();
  for (const key of Object.keys(templates)) {
    if (topicLower.includes(key)) return templates[key].slice(0, practiceCount);
  }

  // Default: return greetings as fallback
  return templates.greetings.slice(0, practiceCount);
}

// ── Notebook storage helpers ──────────────────────────────────────────────────

const NOTEBOOK_KEY = "ml_personal_notebook";

function loadNotebookEntries(): NotebookEntry[] {
  try {
    const raw = localStorage.getItem(NOTEBOOK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotebookEntries(entries: NotebookEntry[]): void {
  localStorage.setItem(NOTEBOOK_KEY, JSON.stringify(entries));
}

// ── Gap-fill helper ───────────────────────────────────────────────────────────

function makeGapFill(phrase: string, keyword: string): { gapped: string; answer: string } {
  const regex = new RegExp(`\\b${keyword}\\b`, "i");
  const gapped = phrase.replace(regex, "______");
  return { gapped, answer: keyword };
}

// ── Main component ────────────────────────────────────────────────────────────

export default function NotebookLesson({
  lessonId,
  lessonTitle,
  languageCode,
  nativeLanguage = "Português",
  level = "A1",
  topic = "greetings",
  phrases: propPhrases,
}: NotebookLessonProps) {
  const [phrases] = useState<LessonPhrase[]>(
    () => propPhrases?.length ? propPhrases : generateOfflinePhrases(topic, languageCode, level)
  );
  const [mode, setMode] = useState<ExerciseMode>("copy");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [notebookEntries, setNotebookEntries] = useState<NotebookEntry[]>(loadNotebookEntries);
  const [showNotebook, setShowNotebook] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [teacherSpeaking, setTeacherSpeaking] = useState(false);
  const [dictationRevealed, setDictationRevealed] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const currentPhrase = phrases[phraseIdx];
  const progress = phrases.length > 0 ? ((completed.size) / phrases.length) * 100 : 0;

  // ── Teacher instructions ──────────────────────────────────────────────────

  const teacherInstructions: Record<ExerciseMode, string[]> = {
    copy: [
      `📝 Copie esta frase no seu caderno: "${currentPhrase?.phrase}"`,
      `✍️ Escreva com atenção cada palavra. Copie: "${currentPhrase?.phrase}"`,
      `📓 Anote no seu caderno e repita em voz alta: "${currentPhrase?.phrase}"`,
    ],
    gaps: [
      `🔍 Complete a lacuna com a palavra correta.`,
      `💭 Qual palavra falta? Pense antes de responder.`,
      `✏️ Preencha o espaço em branco com a palavra que aprendeu.`,
    ],
    memory: [
      `🧠 Escreva a frase de memória, sem olhar!`,
      `💪 Teste sua memória: escreva a frase sem ajuda.`,
      `🌟 Você consegue? Escreva sem ver o original!`,
    ],
    dictation: [
      `🎧 Ouça e escreva o que ouvir. Clique em Ouvir primeiro.`,
      `📻 Ditado: ouça a frase e escreva exatamente o que ouvir.`,
      `🔊 Preste atenção na pronúncia e escreva o que ouvir.`,
    ],
  };

  const getInstruction = () => {
    const opts = teacherInstructions[mode];
    return opts[phraseIdx % opts.length];
  };

  // ── Speak helpers ─────────────────────────────────────────────────────────

  const speakPhrase = useCallback(() => {
    speakText(currentPhrase.phrase, languageCode, {
      onStart: () => setTeacherSpeaking(true),
      onEnd: () => setTeacherSpeaking(false),
    });
  }, [currentPhrase, languageCode]);

  const speakInstruction = useCallback(() => {
    speakText(getInstruction(), "pt-BR", {
      onStart: () => setTeacherSpeaking(true),
      onEnd: () => setTeacherSpeaking(false),
    });
  }, [mode, phraseIdx]);

  // Auto-speak instruction when phrase changes
  useEffect(() => {
    if (mode === "dictation") {
      speakText("Ouça e escreva o que ouvir.", "pt-BR");
    }
  }, [phraseIdx, mode]);

  // ── Copy to notebook ──────────────────────────────────────────────────────

  const copyToNotebook = () => {
    const entry: NotebookEntry = {
      id: `${lessonId}-${phraseIdx}-${Date.now()}`,
      lessonId,
      lessonTitle,
      languageCode,
      phrase: currentPhrase.phrase,
      translation: currentPhrase.translation,
      phonetic: currentPhrase.phonetic,
      copiedAt: Date.now(),
      mastered: false,
    };
    const updated = [...notebookEntries.filter(e => e.phrase !== entry.phrase), entry];
    setNotebookEntries(updated);
    saveNotebookEntries(updated);
    toast.success("✅ Frase copiada para o seu caderno!");
  };

  const markMastered = (id: string) => {
    const updated = notebookEntries.map(e => e.id === id ? { ...e, mastered: true } : e);
    setNotebookEntries(updated);
    saveNotebookEntries(updated);
    toast.success("⭐ Marcada como dominada!");
  };

  const deleteEntry = (id: string) => {
    const updated = notebookEntries.filter(e => e.id !== id);
    setNotebookEntries(updated);
    saveNotebookEntries(updated);
  };

  // ── Exercise check ────────────────────────────────────────────────────────

  const checkAnswer = () => {
    if (!userInput.trim()) return;
    const normalize = (s: string) => s.trim().toLowerCase().replace(/[.,!?;:'"]/g, "");

    let correct = false;
    let correctAnswer = "";

    if (mode === "copy") {
      correct = normalize(userInput) === normalize(currentPhrase.phrase);
      correctAnswer = currentPhrase.phrase;
    } else if (mode === "gaps") {
      const { answer } = makeGapFill(currentPhrase.phrase, currentPhrase.keyword);
      correct = normalize(userInput) === normalize(answer);
      correctAnswer = answer;
    } else if (mode === "memory") {
      correct = normalize(userInput) === normalize(currentPhrase.phrase);
      correctAnswer = currentPhrase.phrase;
    } else if (mode === "dictation") {
      correct = normalize(userInput) === normalize(currentPhrase.phrase);
      correctAnswer = currentPhrase.phrase;
    }

    if (correct) {
      setFeedback({ ok: true, msg: "✅ Perfeito! Muito bem!" });
      setScore(s => s + 10);
      setCompleted(prev => new Set([...prev, phraseIdx]));
      speakText("Muito bem! Perfeito!", "pt-BR");
      // Auto-copy to notebook on correct answer
      copyToNotebook();
    } else {
      setFeedback({ ok: false, msg: `❌ Resposta correta: "${correctAnswer}"` });
      speakText("Tente novamente!", "pt-BR");
    }
  };

  const nextPhrase = () => {
    if (phraseIdx < phrases.length - 1) {
      setPhraseIdx(i => i + 1);
      setUserInput("");
      setFeedback(null);
      setShowAnswer(false);
      setDictationRevealed(false);
    } else {
      toast.success(`🎉 Lição concluída! Pontuação: ${score + (feedback?.ok ? 10 : 0)}`);
      speakText("Parabéns! Você concluiu a lição!", "pt-BR");
    }
  };

  const prevPhrase = () => {
    if (phraseIdx > 0) {
      setPhraseIdx(i => i - 1);
      setUserInput("");
      setFeedback(null);
      setShowAnswer(false);
      setDictationRevealed(false);
    }
  };

  // ── Export notebook ───────────────────────────────────────────────────────

  const exportNotebook = () => {
    const lines = notebookEntries.map(e =>
      `[${new Date(e.copiedAt).toLocaleDateString("pt-BR")}] ${e.lessonTitle}\n` +
      `  ${e.phrase}\n` +
      `  Tradução: ${e.translation}\n` +
      `  Fonética: ${e.phonetic}\n` +
      `  ${e.mastered ? "⭐ DOMINADA" : ""}\n`
    ).join("\n");
    const blob = new Blob([`CADERNO DE AULAS — MultiLingue Universal\n\n${lines}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "meu-caderno-de-aulas.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("📥 Caderno exportado!");
  };

  // ── Gap-fill display ──────────────────────────────────────────────────────

  const { gapped } = currentPhrase ? makeGapFill(currentPhrase.phrase, currentPhrase.keyword) : { gapped: "" };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-amber-600" />
          <h3 className="font-bold text-gray-800">Caderno de Aulas</h3>
          <Badge variant="outline" className="text-xs">{languageCode.toUpperCase()}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">⭐ {score} pts</span>
          <Button size="sm" variant="outline" onClick={() => setShowNotebook(v => !v)}>
            {showNotebook ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {showNotebook ? "Fechar Caderno" : `Meu Caderno (${notebookEntries.length})`}
          </Button>
          <Button size="sm" variant="outline" onClick={exportNotebook}>
            <Download className="h-4 w-4 mr-1" /> Exportar
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className="bg-amber-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 text-right">{completed.size}/{phrases.length} frases concluídas</p>

      {/* Mode selector */}
      <div className="flex gap-1 flex-wrap">
        {(["copy", "gaps", "memory", "dictation"] as ExerciseMode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setUserInput(""); setFeedback(null); setShowAnswer(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === m
                ? "bg-amber-500 text-white shadow"
                : "bg-gray-100 text-gray-600 hover:bg-amber-50"
            }`}
          >
            {m === "copy" && "✍️ Copiar"}
            {m === "gaps" && "🔍 Lacunas"}
            {m === "memory" && "🧠 Memória"}
            {m === "dictation" && "🎧 Ditado"}
          </button>
        ))}
      </div>

      {/* Teacher instruction panel */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          {/* Teacher avatar */}
          <div className={`relative flex-shrink-0 w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center border-2 ${teacherSpeaking ? "border-amber-500 animate-pulse" : "border-amber-200"}`}>
            <GraduationCap className="h-7 w-7 text-amber-600" />
            {teacherSpeaking && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-bounce" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-amber-700">Professor</span>
              <button onClick={speakInstruction} className="text-amber-500 hover:text-amber-700">
                <Volume2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-sm text-amber-900 font-medium leading-relaxed">{getInstruction()}</p>
            {currentPhrase?.tip && (
              <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                <Lightbulb className="h-3 w-3" />
                <span>Dica: {currentPhrase.tip}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Current phrase display */}
      {currentPhrase && (
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 shadow-sm">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevPhrase} disabled={phraseIdx === 0} className="text-gray-400 hover:text-gray-700 disabled:opacity-30">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-xs text-gray-400">Frase {phraseIdx + 1} de {phrases.length}</span>
            <button onClick={nextPhrase} disabled={phraseIdx === phrases.length - 1} className="text-gray-400 hover:text-gray-700 disabled:opacity-30">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Phrase content */}
          {mode === "dictation" ? (
            <div className="text-center space-y-3">
              <p className="text-gray-500 text-sm">Ouça a frase e escreva o que ouvir:</p>
              <Button onClick={speakPhrase} className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
                <Volume2 className="h-4 w-4" /> Ouvir Frase
              </Button>
              {dictationRevealed && (
                <div className="mt-2 p-3 bg-gray-50 rounded-xl">
                  <p className="text-lg font-bold text-gray-800">{currentPhrase.phrase}</p>
                  <p className="text-sm text-gray-500 font-mono">{currentPhrase.phonetic}</p>
                </div>
              )}
              <button
                onClick={() => setDictationRevealed(v => !v)}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mx-auto"
              >
                {dictationRevealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {dictationRevealed ? "Ocultar frase" : "Ver frase (dica)"}
              </button>
            </div>
          ) : mode === "memory" ? (
            <div className="text-center space-y-2">
              <p className="text-gray-500 text-sm mb-2">Tradução (escreva a frase sem ver o original):</p>
              <p className="text-xl font-bold text-blue-700">{currentPhrase.translation}</p>
              <p className="text-sm text-gray-400 font-mono">{currentPhrase.phonetic}</p>
              <button onClick={speakPhrase} className="text-amber-500 hover:text-amber-700 flex items-center gap-1 text-xs mx-auto">
                <Volume2 className="h-3.5 w-3.5" /> Ouvir pronúncia
              </button>
            </div>
          ) : mode === "gaps" ? (
            <div className="space-y-2">
              <p className="text-lg font-bold text-gray-800 text-center">{gapped}</p>
              <p className="text-sm text-gray-500 text-center">{currentPhrase.translation}</p>
              <p className="text-xs text-gray-400 font-mono text-center">{currentPhrase.phonetic}</p>
              <button onClick={speakPhrase} className="text-amber-500 hover:text-amber-700 flex items-center gap-1 text-xs mx-auto">
                <Volume2 className="h-3.5 w-3.5" /> Ouvir frase completa
              </button>
            </div>
          ) : (
            // copy mode
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xl font-bold text-gray-800">{currentPhrase.phrase}</p>
                <button onClick={speakPhrase} className="text-amber-500 hover:text-amber-700">
                  <Volume2 className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500">{currentPhrase.translation}</p>
              <p className="text-xs text-gray-400 font-mono">{currentPhrase.phonetic}</p>
              <Badge variant="outline" className="text-xs">Palavra-chave: <strong className="ml-1">{currentPhrase.keyword}</strong></Badge>
            </div>
          )}

          {/* Copy to notebook button (always visible in copy mode) */}
          {mode === "copy" && (
            <Button
              onClick={copyToNotebook}
              className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white gap-2"
            >
              <PenLine className="h-4 w-4" /> Copiei no meu caderno ✓
            </Button>
          )}
        </div>
      )}

      {/* Input area (gaps, memory, dictation) */}
      {mode !== "copy" && currentPhrase && (
        <div className="space-y-3">
          <div className="relative">
            {mode === "memory" || mode === "dictation" ? (
              <Textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                placeholder={
                  mode === "memory"
                    ? "Escreva a frase de memória..."
                    : "Escreva o que ouviu..."
                }
                value={userInput}
                onChange={e => { setUserInput(e.target.value); setFeedback(null); }}
                className="min-h-[80px] text-base resize-none"
                onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) checkAnswer(); }}
              />
            ) : (
              <Input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                placeholder="Digite a palavra que falta..."
                value={userInput}
                onChange={e => { setUserInput(e.target.value); setFeedback(null); }}
                className="text-base"
                onKeyDown={e => { if (e.key === "Enter") checkAnswer(); }}
              />
            )}
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`flex items-start gap-2 p-3 rounded-xl text-sm font-medium ${
              feedback.ok ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"
            }`}>
              {feedback.ok ? <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" /> : <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />}
              <span>{feedback.msg}</span>
            </div>
          )}

          {/* Show answer toggle */}
          {!feedback && (
            <button
              onClick={() => setShowAnswer(v => !v)}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
            >
              {showAnswer ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {showAnswer ? "Ocultar resposta" : "Ver resposta (perde pontos)"}
            </button>
          )}
          {showAnswer && (
            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              Resposta: <strong>{mode === "gaps" ? currentPhrase.keyword : currentPhrase.phrase}</strong>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={checkAnswer} disabled={!userInput.trim()} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              Verificar
            </Button>
            {feedback?.ok && (
              <Button onClick={nextPhrase} className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1">
                Próxima <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            {!feedback?.ok && (
              <Button variant="outline" onClick={() => { setUserInput(""); setFeedback(null); setShowAnswer(false); }} className="gap-1">
                <RefreshCw className="h-4 w-4" /> Tentar
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Copy mode: next button */}
      {mode === "copy" && (
        <Button onClick={nextPhrase} disabled={phraseIdx === phrases.length - 1} className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-1">
          Próxima Frase <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Personal Notebook panel */}
      {showNotebook && (
        <div className="border-2 border-amber-200 rounded-2xl p-4 bg-amber-50 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-amber-800 flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Meu Caderno Pessoal
            </h4>
            <span className="text-xs text-amber-600">{notebookEntries.length} frases anotadas</span>
          </div>
          {notebookEntries.length === 0 ? (
            <p className="text-sm text-amber-600 text-center py-4">Nenhuma frase anotada ainda. Copie frases para o caderno!</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {notebookEntries.slice().reverse().map(entry => (
                <div key={entry.id} className={`bg-white rounded-xl p-3 border ${entry.mastered ? "border-green-200" : "border-amber-100"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">{entry.phrase}</p>
                      <p className="text-xs text-gray-500">{entry.translation}</p>
                      <p className="text-xs text-gray-400 font-mono">{entry.phonetic}</p>
                      <p className="text-xs text-gray-300 mt-1">{entry.lessonTitle} · {new Date(entry.copiedAt).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button onClick={() => speakText(entry.phrase, entry.languageCode)} className="text-amber-400 hover:text-amber-600">
                        <Volume2 className="h-3.5 w-3.5" />
                      </button>
                      {!entry.mastered && (
                        <button onClick={() => markMastered(entry.id)} className="text-gray-300 hover:text-yellow-500">
                          <Star className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {entry.mastered && <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />}
                      <button onClick={() => deleteEntry(entry.id)} className="text-gray-200 hover:text-red-400">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
