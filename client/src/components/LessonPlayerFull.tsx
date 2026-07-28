/**
 * LessonPlayerFull — Aula completa com:
 * 1. Texto rolando animado (typewriter effect)
 * 2. Professor virtual com animação labial CSS sincronizada
 * 3. Conversação livre com IA como professor real
 * 4. Jogos de palavras interativos (flashcard, fill-blank, word-match)
 */
import React, {
  useState, useEffect, useRef, useCallback, useMemo
} from "react";
import { speakEdgeTTS, stopEdgeTTS, onLipSyncAmplitude } from "@/lib/edgeTTSClient";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Play, Pause, RotateCcw, Volume2, Mic, MicOff,
  MessageSquare, Gamepad2, BookOpen, ChevronRight,
  Star, Trophy, CheckCircle, XCircle, Shuffle
} from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface LessonContent {
  title: string;
  description: string;
  vocabulary: Array<{ word: string; translation: string; phonetic?: string; example?: string }>;
  dialogue: Array<{ speaker: "teacher" | "student"; text: string; translation?: string }>;
  grammar: string;
  exercises: Array<{
    type: "multiple_choice" | "fill_blank" | "word_match" | "pronunciation";
    question: string;
    options?: string[];
    answer: string;
    hint?: string;
  }>;
}

interface TeacherPhoto {
  url: string;
  name: string;
  lang: string;
  gender: "male" | "female";
}

// ─────────────────────────────────────────────
// Teacher Photos (fotorrealistas)
// ─────────────────────────────────────────────
const TEACHER_PHOTOS: Record<string, TeacherPhoto> = {
  "en": { url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face", name: "Prof. Sarah", lang: "en-US", gender: "female" },
  "pt": { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face", name: "Prof. Ricardo", lang: "pt-BR", gender: "male" },
  "es": { url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face", name: "Prof. María", lang: "es-ES", gender: "female" },
  "fr": { url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face", name: "Prof. Claire", lang: "fr-FR", gender: "female" },
  "de": { url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face", name: "Prof. Hans", lang: "de-DE", gender: "male" },
  "it": { url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face", name: "Prof. Sofia", lang: "it-IT", gender: "female" },
  "ja": { url: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=400&h=400&fit=crop&crop=face", name: "Prof. Yuki", lang: "ja-JP", gender: "female" },
  "ko": { url: "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop&crop=face", name: "Prof. Ji-ho", lang: "ko-KR", gender: "male" },
  "zh": { url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face", name: "Prof. Mei", lang: "zh-CN", gender: "female" },
  "ar": { url: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=400&fit=crop&crop=face", name: "Prof. Omar", lang: "ar-SA", gender: "male" },
  "ru": { url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face", name: "Prof. Alexei", lang: "ru-RU", gender: "male" },
  "hi": { url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face", name: "Prof. Priya", lang: "hi-IN", gender: "female" },
};
const DEFAULT_TEACHER: TeacherPhoto = TEACHER_PHOTOS["en"];

// ─────────────────────────────────────────────
// Lip-sync CSS animation (phoneme-based visemes)
// ─────────────────────────────────────────────
const VISEME_SHAPES: Record<string, string> = {
  A: "scaleY(1.4) scaleX(0.9)",    // open mouth
  E: "scaleY(0.8) scaleX(1.1)",    // wide smile
  I: "scaleY(0.6) scaleX(1.2)",    // narrow
  O: "scaleY(1.2) scaleX(0.8)",    // round
  U: "scaleY(1.0) scaleX(0.7)",    // pucker
  B: "scaleY(0.3) scaleX(1.0)",    // closed
  F: "scaleY(0.5) scaleX(0.9)",    // teeth
  X: "scaleY(0.2) scaleX(1.0)",    // rest
};

function textToVisemes(text: string): string[] {
  const visemes: string[] = [];
  const lower = text.toLowerCase();
  for (let i = 0; i < lower.length; i++) {
    const c = lower[i];
    if ("aáàãâä".includes(c)) visemes.push("A");
    else if ("eéèê".includes(c)) visemes.push("E");
    else if ("iíì".includes(c)) visemes.push("I");
    else if ("oóòõô".includes(c)) visemes.push("O");
    else if ("uúùü".includes(c)) visemes.push("U");
    else if ("bmp".includes(c)) visemes.push("B");
    else if ("fv".includes(c)) visemes.push("F");
    else if (" .,!?".includes(c)) visemes.push("X");
    else visemes.push("X");
  }
  return visemes;
}

// ─────────────────────────────────────────────
// Animated Typewriter Text
// ─────────────────────────────────────────────
function TypewriterText({
  text,
  speed = 35,
  onComplete,
  className = "",
}: {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    indexRef.current = 0;

    const type = () => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current++;
        timerRef.current = setTimeout(type, speed);
      } else {
        setDone(true);
        onComplete?.();
      }
    };
    timerRef.current = setTimeout(type, 100);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [text, speed]);

  return (
    <span className={className}>
      {displayed}
      {!done && <span className="animate-pulse text-primary">|</span>}
    </span>
  );
}

// ─────────────────────────────────────────────
// Animated Teacher Avatar with Lip-sync
// ─────────────────────────────────────────────
function AnimatedTeacher({
  teacher,
  isSpeaking,
  text,
  expression = "neutral",
}: {
  teacher: TeacherPhoto;
  isSpeaking: boolean;
  text?: string;
  expression?: "neutral" | "happy" | "thinking" | "excited";
}) {
  const [mouthOpenness, setMouthOpenness] = useState(0);
  const [blinking, setBlinking] = useState(false);
  const [headTilt, setHeadTilt] = useState(0);

  // Blink randomly
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Natural head movement
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setHeadTilt((Math.random() - 0.5) * 4);
    }, 2000 + Math.random() * 1000);
    return () => clearInterval(moveInterval);
  }, []);

  // Real audio amplitude lip-sync via Web Audio API
  useEffect(() => {
    if (isSpeaking) {
      onLipSyncAmplitude((amp) => setMouthOpenness(amp));
    } else {
      onLipSyncAmplitude(null);
      setMouthOpenness(0);
    }
    return () => { onLipSyncAmplitude(null); };
  }, [isSpeaking]);

  const expressionStyle = {
    neutral: "brightness(1)",
    happy: "brightness(1.1) saturate(1.2)",
    thinking: "brightness(0.95)",
    excited: "brightness(1.15) saturate(1.3)",
  }[expression];

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Teacher photo container */}
      <div
        className="relative overflow-hidden rounded-2xl shadow-2xl border-4 border-primary/30"
        style={{
          width: 180,
          height: 220,
          transform: `rotate(${headTilt}deg)`,
          transition: "transform 0.8s ease-in-out",
        }}
      >
        {/* Photo */}
        <img
          src={teacher.url}
          alt={teacher.name}
          className="w-full h-full object-cover"
          style={{ filter: expressionStyle, transition: "filter 0.3s" }}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face";
          }}
        />

        {/* Blink overlay */}
        {blinking && (
          <div
            className="absolute inset-0 bg-black/10 pointer-events-none"
            style={{ borderRadius: "inherit" }}
          />
        )}

        {/* Mouth animation overlay — real amplitude-driven */}
        {isSpeaking && (
          <div
            className="absolute bottom-6 left-1/2 pointer-events-none"
            style={{
              width: 28,
              height: Math.max(4, mouthOpenness * 20),
              marginLeft: -14,
              background: "rgba(0,0,0,0.65)",
              borderRadius: mouthOpenness > 0.3 ? "50%" : "0 0 14px 14px",
              transition: "height 0.06s ease-out, border-radius 0.06s ease-out",
            }}
          />
        )}

        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="absolute top-2 right-2 flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 bg-green-400 rounded-full"
                style={{
                  height: 8 + i * 4,
                  animation: `soundBar 0.6s ease-in-out ${i * 0.15}s infinite alternate`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Teacher name badge */}
      <div className="mt-2 px-3 py-1 bg-primary/10 rounded-full text-sm font-semibold text-primary">
        {teacher.name}
      </div>

      <style>{`
        @keyframes soundBar {
          from { transform: scaleY(0.4); opacity: 0.6; }
          to   { transform: scaleY(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────
// Word Game: Flash Card
// ─────────────────────────────────────────────
function FlashCardGame({
  vocabulary,
  onScore,
}: {
  vocabulary: Array<{ word: string; translation: string; phonetic?: string }>;
  onScore: (pts: number) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [unknown, setUnknown] = useState(0);
  const shuffled = useMemo(() => [...vocabulary].sort(() => Math.random() - 0.5), [vocabulary]);
  const card = shuffled[idx];

  if (!card) return (
    <div className="text-center py-8">
      <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
      <p className="text-xl font-bold">Parabéns! 🎉</p>
      <p className="text-muted-foreground">Você revisou {shuffled.length} palavras!</p>
      <p className="mt-2 text-green-600 font-semibold">✓ Sabia: {known} | ✗ Revisar: {unknown}</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-muted-foreground">Cartão {idx + 1} de {shuffled.length}</p>

      {/* Card */}
      <div
        className="w-72 h-44 cursor-pointer perspective-1000"
        onClick={() => setFlipped(!flipped)}
        style={{ perspective: "1000px" }}
      >
        <div
          className="relative w-full h-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex flex-col items-center justify-center shadow-xl"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-3xl font-bold text-white">{card.word}</p>
            {card.phonetic && (
              <p className="text-primary-foreground/70 text-sm mt-1">/{card.phonetic}/</p>
            )}
            <p className="text-primary-foreground/50 text-xs mt-3">Clique para ver a tradução</p>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex flex-col items-center justify-center shadow-xl"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p className="text-3xl font-bold text-white">{card.translation}</p>
            <p className="text-white/70 text-sm mt-2">{card.word}</p>
          </div>
        </div>
      </div>

      {flipped && (
        <div className="flex gap-3 mt-2">
          <Button
            variant="outline"
            className="border-red-400 text-red-600 hover:bg-red-50"
            onClick={() => {
              setUnknown(u => u + 1);
              setFlipped(false);
              setIdx(i => i + 1);
            }}
          >
            <XCircle className="w-4 h-4 mr-1" /> Revisar
          </Button>
          <Button
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={() => {
              setKnown(k => k + 1);
              onScore(10);
              setFlipped(false);
              setIdx(i => i + 1);
            }}
          >
            <CheckCircle className="w-4 h-4 mr-1" /> Sabia!
          </Button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Word Game: Fill the Blank
// ─────────────────────────────────────────────
function FillBlankGame({
  exercises,
  onScore,
}: {
  exercises: Array<{ question: string; answer: string; hint?: string; options?: string[] }>;
  onScore: (pts: number) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const ex = exercises[idx];

  if (!ex) return (
    <div className="text-center py-8">
      <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
      <p className="text-xl font-bold">Exercícios concluídos!</p>
      <p className="text-green-600 font-semibold mt-2">Pontuação: {score} pts</p>
    </div>
  );

  const check = () => {
    const correct = input.trim().toLowerCase() === ex.answer.toLowerCase();
    setResult(correct ? "correct" : "wrong");
    if (correct) {
      setScore(s => s + 15);
      onScore(15);
      toast.success("Correto! 🎉 +15 pts");
    } else {
      toast.error(`Resposta: ${ex.answer}`);
    }
    setTimeout(() => {
      setResult(null);
      setInput("");
      setIdx(i => i + 1);
    }, 1500);
  };

  const parts = ex.question.split("___");

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">Exercício {idx + 1} de {exercises.length}</p>

      <div className="bg-muted/30 rounded-xl p-4 text-lg font-medium leading-relaxed">
        {parts[0]}
        <span
          className={`inline-block min-w-24 border-b-2 px-2 mx-1 text-center font-bold transition-colors ${
            result === "correct" ? "border-green-500 text-green-600" :
            result === "wrong" ? "border-red-500 text-red-600" :
            "border-primary text-primary"
          }`}
        >
          {result ? (result === "correct" ? input : ex.answer) : (input || "___")}
        </span>
        {parts[1] || ""}
      </div>

      {ex.hint && (
        <p className="text-xs text-muted-foreground italic">💡 Dica: {ex.hint}</p>
      )}

      {/* Options (if multiple choice) */}
      {ex.options ? (
        <div className="grid grid-cols-2 gap-2">
          {ex.options.map((opt) => (
            <Button
              key={opt}
              variant="outline"
              className={`h-auto py-2 text-sm ${
                result === "correct" && opt === ex.answer ? "bg-green-100 border-green-500" :
                result === "wrong" && opt === input ? "bg-red-100 border-red-500" : ""
              }`}
              onClick={() => { setInput(opt); }}
              disabled={!!result}
            >
              {opt}
            </Button>
          ))}
        </div>
      ) : (
        <input
          className="border rounded-lg px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Digite a resposta..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && input && check()}
          disabled={!!result}
          autoFocus
        />
      )}

      <Button
        onClick={check}
        disabled={!input || !!result}
        className="w-full"
      >
        Verificar <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Word Match Game
// ─────────────────────────────────────────────
function WordMatchGame({
  vocabulary,
  onScore,
}: {
  vocabulary: Array<{ word: string; translation: string }>;
  onScore: (pts: number) => void;
}) {
  const items = useMemo(() => vocabulary.slice(0, 6), [vocabulary]);
  const [leftSelected, setLeftSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);
  const rightItems = useMemo(() => [...items].sort(() => Math.random() - 0.5), [items]);

  const handleRight = (translation: string) => {
    if (!leftSelected) return;
    const correct = items.find(i => i.word === leftSelected)?.translation === translation;
    if (correct) {
      const newMatched = new Set(matched);
      newMatched.add(leftSelected);
      setMatched(newMatched);
      setLeftSelected(null);
      onScore(20);
      toast.success("+20 pts! ✨");
    } else {
      setWrong(translation);
      setTimeout(() => { setWrong(null); setLeftSelected(null); }, 800);
    }
  };

  if (matched.size === items.length) return (
    <div className="text-center py-8">
      <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
      <p className="text-xl font-bold">Perfeito! Todas as palavras combinadas! 🎯</p>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Palavra</p>
        {items.map((item) => (
          <button
            key={item.word}
            onClick={() => !matched.has(item.word) && setLeftSelected(item.word)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all text-left ${
              matched.has(item.word)
                ? "bg-green-100 border-green-400 text-green-700 line-through opacity-60"
                : leftSelected === item.word
                ? "bg-primary border-primary text-primary-foreground scale-105 shadow-md"
                : "bg-card border-border hover:border-primary/50 hover:bg-primary/5"
            }`}
          >
            {item.word}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Tradução</p>
        {rightItems.map((item) => (
          <button
            key={item.translation}
            onClick={() => handleRight(item.translation)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all text-left ${
              matched.has(items.find(i => i.translation === item.translation)?.word || "")
                ? "bg-green-100 border-green-400 text-green-700 line-through opacity-60"
                : wrong === item.translation
                ? "bg-red-100 border-red-400 text-red-700 scale-95"
                : leftSelected
                ? "bg-card border-border hover:border-green-400 hover:bg-green-50 cursor-pointer"
                : "bg-card border-border opacity-60 cursor-default"
            }`}
            disabled={!leftSelected || matched.has(items.find(i => i.translation === item.translation)?.word || "")}
          >
            {item.translation}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Free Conversation with AI Teacher
// ─────────────────────────────────────────────
function FreeConversation({
  lessonTitle,
  languageCode,
  teacherName,
  nativeLanguage,
}: {
  lessonTitle: string;
  languageCode: string;
  teacherName: string;
  nativeLanguage: string;
}) {
  const [messages, setMessages] = useState<Array<{ role: "teacher" | "student"; text: string; time: string }>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const freeChatMutationLocal = trpc.ai.freeChat.useMutation();

  useEffect(() => {
    // Initial greeting
    const greeting = `Olá! Sou ${teacherName}, seu professor(a) de ${languageCode.toUpperCase()}. 
Estamos estudando "${lessonTitle}". 
Vamos praticar juntos! Pode me fazer perguntas, pedir para repetir palavras, ou simplesmente conversar sobre o tema da aula. Como posso ajudar você hoje?`;
    setMessages([{ role: "teacher", text: greeting, time: new Date().toLocaleTimeString() }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg = { role: "student" as const, text, time: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const systemPrompt = `Você é ${teacherName}, um professor(a) de idiomas especializado em ${languageCode.toUpperCase()}.
Estamos na aula sobre: "${lessonTitle}".
Idioma nativo do aluno: ${nativeLanguage}.

Regras:
- Responda SEMPRE em ${nativeLanguage} (idioma nativo do aluno) E em ${languageCode.toUpperCase()} quando relevante
- Seja encorajador, paciente e didático como um professor real
- Corrija erros de forma gentil e construtiva
- Use exemplos práticos e contextuais
- Faça perguntas para engajar o aluno
- Mantenha respostas concisas (máx 3 parágrafos)
- Inclua vocabulário novo quando pertinente
- Simule uma conversa natural de sala de aula`;

      const result = await freeChatMutationLocal.mutateAsync({
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-6).map(m => ({
            role: m.role === "teacher" ? "assistant" as const : "user" as const,
            content: m.text,
          })),
          { role: "user", content: text },
        ],
      });

      const teacherReply = result.content || "Desculpe, não consegui processar sua mensagem. Tente novamente!";
      setMessages(prev => [...prev, {
        role: "teacher",
        text: teacherReply,
        time: new Date().toLocaleTimeString(),
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "teacher",
        text: "Hmm, parece que tive um problema técnico. Vamos continuar! O que você queria perguntar?",
        time: new Date().toLocaleTimeString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoice = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Seu navegador não suporta reconhecimento de voz");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = nativeLanguage === "pt" ? "pt-BR" : "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      sendMessage(transcript);
    };
    recognition.start();
  };

  return (
    <div className="flex flex-col h-[420px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "student" ? "flex-row-reverse" : "flex-row"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                msg.role === "teacher"
                  ? "bg-primary/10 text-foreground rounded-tl-sm"
                  : "bg-primary text-primary-foreground rounded-tr-sm"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.role === "teacher" ? "text-muted-foreground" : "text-primary-foreground/60"}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2">
            <div className="bg-primary/10 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-primary/50 rounded-full"
                    style={{ animation: `bounce 1s ease-in-out ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-2 border-t">
        <input
          className="flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Escreva ou fale com o professor..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          disabled={isLoading}
        />
        <Button
          size="icon"
          variant="outline"
          onClick={startVoice}
          className={isListening ? "bg-red-100 border-red-400 text-red-600" : ""}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>
        <Button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main LessonPlayerFull Component
// ─────────────────────────────────────────────
interface LessonPlayerFullProps {
  lessonId: string | number;
  languageCode: string;
  nativeLanguage?: string;
  onComplete?: (score: number) => void;
}

type Phase = "intro" | "vocabulary" | "dialogue" | "games" | "conversation" | "complete";
type GameMode = "flashcard" | "fill_blank" | "word_match";

export default function LessonPlayerFull({
  lessonId,
  languageCode,
  nativeLanguage = "pt",
  onComplete,
}: LessonPlayerFullProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [gameMode, setGameMode] = useState<GameMode>("flashcard");
  const [score, setScore] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [teacherText, setTeacherText] = useState("");
  const [teacherExpression, setTeacherExpression] = useState<"neutral" | "happy" | "thinking" | "excited">("neutral");
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dialogueIdx, setDialogueIdx] = useState(0);
  const [introTextDone, setIntroTextDone] = useState(false);
  // speechRef removido — Edge TTS já gerencia áudio internamente

  const lessonQuery = trpc.lessons.getById.useQuery(
    { lessonId: Number(lessonId) },
    { enabled: !!lessonId }
  );
  const generateContentMutation = trpc.ai.generateLessonContent.useMutation();
  const freeChatMutation = trpc.ai.freeChat.useMutation();

  const teacher = useMemo(() => {
    const code = languageCode?.split("-")[0]?.toLowerCase() || "en";
    return TEACHER_PHOTOS[code] || DEFAULT_TEACHER;
  }, [languageCode]);

  // Generate lesson content via AI
  useEffect(() => {
    if (!lessonQuery.data || lessonContent) return;
    const lesson = lessonQuery.data;
    setIsGenerating(true);

    generateContentMutation.mutateAsync({
      lessonTitle: lesson.title,
      lessonDescription: lesson.description || "",
      languageCode,
      nativeLanguage,
      level: (lesson.courseLevel as string) || "basico",
    }).then((content: unknown) => {
      setLessonContent(content as LessonContent);
      setIsGenerating(false);
    }).catch(() => {
      setLessonContent(buildFallbackContent(lesson.title, languageCode));
      setIsGenerating(false);
    });
  }, [lessonQuery.data]);

  const speak = useCallback((text: string) => {
    if (!text) return;
    stopEdgeTTS();
    setIsSpeaking(true);
    setTeacherText(text);
    speakEdgeTTS(text, languageCode, { gender: teacher?.gender ?? 'female' }).finally(() => {
      setIsSpeaking(false);
      setTeacherText("");
    });
  }, [languageCode, teacher]);

  const addScore = useCallback((pts: number) => {
    setScore(s => s + pts);
    setTeacherExpression("excited");
    setTimeout(() => setTeacherExpression("neutral"), 1500);
  }, []);

  const lesson = lessonQuery.data;

  if (lessonQuery.isLoading || isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse">
          {isGenerating ? "Professor preparando a aula..." : "Carregando lição..."}
        </p>
      </div>
    );
  }

  if (!lesson || !lessonContent) return null;

  // ── Phase: Intro ──
  if (phase === "intro") {
    const introText = `Olá! Bem-vindo(a) à aula "${lesson.title}"! 
Hoje vamos aprender ${lessonContent.vocabulary.length} palavras novas e praticar conversação. 
Preparado(a)? Vamos começar!`;

    return (
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Teacher */}
        <div className="flex flex-col items-center gap-4">
          <AnimatedTeacher
            teacher={teacher}
            isSpeaking={isSpeaking}
            text={teacherText}
            expression={teacherExpression}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => speak(introText)}
            className="gap-2"
          >
            <Volume2 className="w-4 h-4" /> Ouvir professor
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{lesson.courseLevel || "basico"}</Badge>
            <Badge variant="secondary">⏱ {lesson.estimatedMinutes || 20} min</Badge>
            <Badge className="bg-yellow-100 text-yellow-800">⭐ {score} pts</Badge>
          </div>

          <h2 className="text-2xl font-bold">{lesson.title}</h2>

          <div className="bg-primary/5 rounded-2xl p-5 border border-primary/20 min-h-[120px]">
            <TypewriterText
              text={introText}
              speed={30}
              onComplete={() => {
                setIntroTextDone(true);
                setTeacherExpression("happy");
              }}
              className="text-lg leading-relaxed"
            />
          </div>

          {lessonContent.grammar && (
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">📖 Gramática da aula</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">{lessonContent.grammar}</p>
            </div>
          )}

          {introTextDone && (
            <Button
              className="w-full text-lg py-6 gap-2 animate-in fade-in slide-in-from-bottom-2"
              onClick={() => { setPhase("vocabulary"); addScore(5); }}
            >
              <BookOpen className="w-5 h-5" /> Começar Vocabulário →
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ── Phase: Vocabulary ──
  if (phase === "vocabulary") {
    return (
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex flex-col items-center gap-4">
          <AnimatedTeacher
            teacher={teacher}
            isSpeaking={isSpeaking}
            text={teacherText}
            expression={teacherExpression}
          />
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">📚 Vocabulário</h3>
            <Badge className="bg-yellow-100 text-yellow-800">⭐ {score} pts</Badge>
          </div>

          <div className="grid gap-2 max-h-[360px] overflow-y-auto pr-1">
            {lessonContent.vocabulary.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-card rounded-xl px-4 py-3 border hover:border-primary/40 transition-colors group"
              >
                <div>
                  <span className="font-bold text-primary text-lg">{item.word}</span>
                  {item.phonetic && (
                    <span className="text-muted-foreground text-sm ml-2">/{item.phonetic}/</span>
                  )}
                  <p className="text-muted-foreground text-sm">{item.translation}</p>
                  {item.example && (
                    <p className="text-xs text-muted-foreground/70 italic mt-0.5">"{item.example}"</p>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => speak(item.word)}
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            className="w-full gap-2"
            onClick={() => { setPhase("dialogue"); addScore(10); }}
          >
            <MessageSquare className="w-5 h-5" /> Ver Diálogo →
          </Button>
        </div>
      </div>
    );
  }

  // ── Phase: Dialogue ──
  if (phase === "dialogue") {
    const dlg = lessonContent.dialogue[dialogueIdx];
    const isTeacher = dlg?.speaker === "teacher";

    return (
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex flex-col items-center gap-4">
          <AnimatedTeacher
            teacher={teacher}
            isSpeaking={isSpeaking && isTeacher}
            text={isTeacher ? teacherText : ""}
            expression={isTeacher ? "happy" : "neutral"}
          />
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">💬 Diálogo</h3>
            <span className="text-sm text-muted-foreground">{dialogueIdx + 1}/{lessonContent.dialogue.length}</span>
          </div>

          <Progress value={((dialogueIdx + 1) / lessonContent.dialogue.length) * 100} className="h-2" />

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {lessonContent.dialogue.slice(0, dialogueIdx + 1).map((line, i) => (
              <div
                key={i}
                className={`flex gap-3 ${line.speaker === "student" ? "flex-row-reverse" : ""} animate-in fade-in slide-in-from-bottom-1`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    line.speaker === "teacher"
                      ? "bg-primary/10 rounded-tl-sm"
                      : "bg-primary text-primary-foreground rounded-tr-sm"
                  }`}
                >
                  <p className="text-sm font-semibold mb-1 opacity-60">
                    {line.speaker === "teacher" ? teacher.name : "Você"}
                  </p>
                  <p className="font-medium">{line.text}</p>
                  {line.translation && (
                    <p className="text-xs opacity-60 mt-1 italic">{line.translation}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            {dlg && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => speak(dlg.text)}
                className="gap-1"
              >
                <Volume2 className="w-3 h-3" /> Ouvir
              </Button>
            )}
            {dialogueIdx < lessonContent.dialogue.length - 1 ? (
              <Button
                className="flex-1 gap-2"
                onClick={() => {
                  setDialogueIdx(i => i + 1);
                  addScore(5);
                  if (dlg) speak(lessonContent.dialogue[dialogueIdx + 1]?.text || "");
                }}
              >
                Próxima fala <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                className="flex-1 gap-2"
                onClick={() => { setPhase("games"); addScore(15); }}
              >
                <Gamepad2 className="w-4 h-4" /> Jogos de Palavras →
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Phase: Games ──
  if (phase === "games") {
    const fillExercises = lessonContent.exercises.filter(e =>
      e.type === "fill_blank" || e.type === "multiple_choice"
    );

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">🎮 Jogos de Palavras</h3>
          <Badge className="bg-yellow-100 text-yellow-800">⭐ {score} pts</Badge>
        </div>

        {/* Game selector */}
        <div className="flex gap-2 flex-wrap">
          {[
            { id: "flashcard", label: "🃏 Flashcards", icon: "🃏" },
            { id: "fill_blank", label: "✏️ Preencher", icon: "✏️" },
            { id: "word_match", label: "🔗 Combinar", icon: "🔗" },
          ].map((g) => (
            <button
              key={g.id}
              onClick={() => setGameMode(g.id as GameMode)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                gameMode === g.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        <div className="bg-card rounded-2xl border p-4 min-h-[300px]">
          {gameMode === "flashcard" && (
            <FlashCardGame vocabulary={lessonContent.vocabulary} onScore={addScore} />
          )}
          {gameMode === "fill_blank" && fillExercises.length > 0 && (
            <FillBlankGame exercises={fillExercises} onScore={addScore} />
          )}
          {gameMode === "fill_blank" && fillExercises.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum exercício de preenchimento disponível para esta aula.</p>
              <Button variant="outline" className="mt-3" onClick={() => setGameMode("flashcard")}>
                Usar Flashcards
              </Button>
            </div>
          )}
          {gameMode === "word_match" && (
            <WordMatchGame vocabulary={lessonContent.vocabulary} onScore={addScore} />
          )}
        </div>

        <Button
          className="w-full gap-2"
          onClick={() => { setPhase("conversation"); addScore(20); }}
        >
          <MessageSquare className="w-5 h-5" /> Conversar com o Professor →
        </Button>
      </div>
    );
  }

  // ── Phase: Conversation ──
  if (phase === "conversation") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">🗣️ Conversação Livre</h3>
          <Badge className="bg-yellow-100 text-yellow-800">⭐ {score} pts</Badge>
        </div>

        <div className="flex gap-4 items-start">
          <div className="hidden md:flex flex-col items-center gap-2">
            <AnimatedTeacher
              teacher={teacher}
              isSpeaking={false}
              expression="happy"
            />
          </div>
          <div className="flex-1">
            <FreeConversation
              lessonTitle={lesson.title}
              languageCode={languageCode}
              teacherName={teacher.name}
              nativeLanguage={nativeLanguage}
            />
          </div>
        </div>

        <Button
          className="w-full gap-2 bg-green-600 hover:bg-green-700"
          onClick={() => {
            addScore(30);
            setPhase("complete");
            onComplete?.(score + 30);
          }}
        >
          <Trophy className="w-5 h-5" /> Concluir Aula →
        </Button>
      </div>
    );
  }

  // ── Phase: Complete ──
  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
        <Trophy className="w-12 h-12 text-yellow-500" />
      </div>
      <div>
        <h2 className="text-3xl font-bold mb-2">Aula Concluída! 🎉</h2>
        <p className="text-muted-foreground text-lg">"{lesson.title}"</p>
      </div>
      <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
        <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-200">
          <p className="text-2xl font-bold text-yellow-600">{score}</p>
          <p className="text-xs text-muted-foreground">Pontos</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
          <p className="text-2xl font-bold text-blue-600">{lessonContent.vocabulary.length}</p>
          <p className="text-xs text-muted-foreground">Palavras</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 border border-green-200">
          <p className="text-2xl font-bold text-green-600">✓</p>
          <p className="text-xs text-muted-foreground">Completo</p>
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => { setPhase("intro"); setScore(0); setDialogueIdx(0); }}>
          <RotateCcw className="w-4 h-4 mr-1" /> Repetir
        </Button>
        <Button onClick={() => onComplete?.(score)}>
          Próxima Aula <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Fallback content generator
// ─────────────────────────────────────────────
function buildFallbackContent(title: string, lang: string): LessonContent {
  const words = [
    { word: "hello", translation: "olá", phonetic: "hɛˈloʊ", example: "Hello, how are you?" },
    { word: "goodbye", translation: "tchau", phonetic: "ɡʊdˈbaɪ", example: "Goodbye, see you later!" },
    { word: "please", translation: "por favor", phonetic: "pliːz", example: "Please help me." },
    { word: "thank you", translation: "obrigado", phonetic: "θæŋk juː", example: "Thank you very much!" },
    { word: "yes", translation: "sim", phonetic: "jɛs", example: "Yes, I understand." },
    { word: "no", translation: "não", phonetic: "noʊ", example: "No, I don't know." },
    { word: "good", translation: "bom", phonetic: "ɡʊd", example: "Good morning!" },
    { word: "bad", translation: "ruim", phonetic: "bæd", example: "That's bad news." },
  ];

  return {
    title,
    description: `Aula sobre ${title}`,
    vocabulary: words,
    dialogue: [
      { speaker: "teacher", text: `Hello! Welcome to our lesson about ${title}.`, translation: `Olá! Bem-vindo à nossa aula sobre ${title}.` },
      { speaker: "student", text: "Hello! I'm ready to learn.", translation: "Olá! Estou pronto para aprender." },
      { speaker: "teacher", text: "Excellent! Let's start with some vocabulary.", translation: "Excelente! Vamos começar com vocabulário." },
      { speaker: "student", text: "Great! I'm excited.", translation: "Ótimo! Estou animado." },
    ],
    grammar: `Nesta aula, vamos aprender vocabulário essencial relacionado a "${title}".`,
    exercises: words.slice(0, 4).map((w, i) => ({
      type: "multiple_choice" as const,
      question: `What is the translation of "${w.word}"?`,
      options: [w.translation, words[(i + 1) % words.length].translation, words[(i + 2) % words.length].translation, words[(i + 3) % words.length].translation],
      answer: w.translation,
      hint: `Think about what you say when you greet someone.`,
    })),
  };
}
