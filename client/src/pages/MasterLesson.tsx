/**
 * MasterLesson — Bloco Único Campeão
 * Método: palavra isolada → 2 palavras → frase curta → diálogo simples
 * Inspirado em Duolingo (gamificação) + Babbel (contexto real) + Pimsleur (oral)
 * 4 etapas sequenciais: ScrollChat → Oral → Flashcard → Diálogo IA
 */
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  ArrowLeft, Volume2, Mic, MicOff, CheckCircle, XCircle,
  Star, Zap, Heart, Trophy, ChevronRight, Play, RotateCcw,
  MessageSquare, BookOpen, Headphones, Globe
} from "lucide-react";
import { Link } from "wouter";
import { speakText } from "@/hooks/useNaturalVoice";

// ── Tipos ──────────────────────────────────────────────────────────────────────
interface ScrollMessage {
  from: "teacher" | "student";
  text: string;
  translation: string;
  phonetic?: string;
  delay: number;
}
interface OralPhrase {
  text: string;
  translation: string;
  phonetic: string;
  xp: number;
}
interface FlashCard {
  word: string;
  translation: string;
  emoji: string;
  example: string;
  xp: number;
}
interface MasterLessonData {
  id: string;
  title: string;
  titlePt: string;
  emoji: string;
  langCode: string;
  langName: string;
  level: string;
  xpTotal: number;
  isPremium: boolean;
  scrollMessages: ScrollMessage[];
  oralPhrases: OralPhrase[];
  flashCards: FlashCard[];
  dialoguePrompt: string;
  teacherGender?: 'male' | 'female';
}
type Stage = "scroll" | "oral" | "game" | "dialogue" | "complete";

// ── Lições com progressão NATURAL: palavra → 2 palavras → frase curta → diálogo
export const MASTER_LESSONS: MasterLessonData[] = [
  // ─── INGLÊS — Aula 1: Palavras do zero ───────────────────────────────────────
  {
    id: "en-level1",
    title: "Hi · Yes · No · Good",
    titlePt: "Aula 1 — Palavras Essenciais",
    emoji: "👋",
    langCode: "en-US",
    langName: "Inglês",
    level: "A1",
    xpTotal: 100,
    isPremium: false,
    scrollMessages: [
      // Passo 1: palavra isolada
      { from: "teacher", text: "Hi! 👋", translation: "Oi!", phonetic: "Rái!", delay: 400 },
      { from: "student", text: "Hi!", translation: "Oi!", delay: 1000 },
      // Passo 2: segunda palavra
      { from: "teacher", text: "Yes. ✅", translation: "Sim.", phonetic: "Iés.", delay: 1700 },
      { from: "student", text: "Yes.", translation: "Sim.", delay: 2300 },
      // Passo 3: terceira palavra
      { from: "teacher", text: "No. ❌", translation: "Não.", phonetic: "Nôu.", delay: 3000 },
      { from: "student", text: "No.", translation: "Não.", delay: 3600 },
      // Passo 4: combinação de 2 palavras
      { from: "teacher", text: "Good. 👍", translation: "Bom.", phonetic: "Gúd.", delay: 4300 },
      { from: "teacher", text: "Good? Yes! ✅", translation: "Bom? Sim!", phonetic: "Gúd? Iés!", delay: 5000 },
      { from: "student", text: "Yes! Good!", translation: "Sim! Bom!", delay: 5700 },
      // Passo 5: frase curta
      { from: "teacher", text: "Hi! Good morning! ☀️", translation: "Oi! Bom dia!", phonetic: "Rái! Gúd mórning!", delay: 6400 },
      { from: "student", text: "Good morning!", translation: "Bom dia!", delay: 7100 },
      { from: "teacher", text: "Perfect! 🌟", translation: "Perfeito!", delay: 7800 },
    ],
    oralPhrases: [
      { text: "Hi!", translation: "Oi!", phonetic: "Rái!", xp: 10 },
      { text: "Yes.", translation: "Sim.", phonetic: "Iés.", xp: 10 },
      { text: "No.", translation: "Não.", phonetic: "Nôu.", xp: 10 },
      { text: "Good morning!", translation: "Bom dia!", phonetic: "Gúd mórning!", xp: 15 },
    ],
    flashCards: [
      { word: "Hi", translation: "Oi", emoji: "👋", example: "Hi!", xp: 10 },
      { word: "Yes", translation: "Sim", emoji: "✅", example: "Yes!", xp: 10 },
      { word: "No", translation: "Não", emoji: "❌", example: "No!", xp: 10 },
      { word: "Good", translation: "Bom", emoji: "👍", example: "Good!", xp: 10 },
      { word: "Morning", translation: "Manhã", emoji: "☀️", example: "Good morning!", xp: 10 },
    ],
    dialoguePrompt: "Diga 'Hi' para o professor. Responda só com as palavras desta aula: Hi, Yes, No, Good.",
    teacherGender: 'female',
  },
  // ─── INGLÊS — Aula 2: Números e cores (Premium) ──────────────────────────────
  {
    id: "en-level2",
    title: "One · Two · Red · Blue",
    titlePt: "Aula 2 — Números e Cores",
    emoji: "🔢",
    langCode: "en-US",
    langName: "Inglês",
    level: "A1",
    xpTotal: 120,
    isPremium: true,
    scrollMessages: [
      { from: "teacher", text: "One. 1️⃣", translation: "Um.", phonetic: "Uán.", delay: 400 },
      { from: "student", text: "One.", translation: "Um.", delay: 1000 },
      { from: "teacher", text: "Two. 2️⃣", translation: "Dois.", phonetic: "Tú.", delay: 1700 },
      { from: "student", text: "Two.", translation: "Dois.", delay: 2300 },
      { from: "teacher", text: "One, two! ✅", translation: "Um, dois!", phonetic: "Uán, tú!", delay: 3000 },
      { from: "teacher", text: "Red. 🔴", translation: "Vermelho.", phonetic: "Réd.", delay: 3700 },
      { from: "student", text: "Red.", translation: "Vermelho.", delay: 4300 },
      { from: "teacher", text: "Blue. 🔵", translation: "Azul.", phonetic: "Blú.", delay: 5000 },
      { from: "teacher", text: "One red. Two blue. 🎨", translation: "Um vermelho. Dois azul.", phonetic: "Uán réd. Tú blú.", delay: 5700 },
      { from: "student", text: "One red!", translation: "Um vermelho!", delay: 6400 },
      { from: "teacher", text: "Yes! Perfect! 🌟", translation: "Sim! Perfeito!", delay: 7100 },
    ],
    oralPhrases: [
      { text: "One.", translation: "Um.", phonetic: "Uán.", xp: 10 },
      { text: "Two.", translation: "Dois.", phonetic: "Tú.", xp: 10 },
      { text: "Red.", translation: "Vermelho.", phonetic: "Réd.", xp: 10 },
      { text: "Blue.", translation: "Azul.", phonetic: "Blú.", xp: 10 },
    ],
    flashCards: [
      { word: "One", translation: "Um", emoji: "1️⃣", example: "One!", xp: 10 },
      { word: "Two", translation: "Dois", emoji: "2️⃣", example: "Two!", xp: 10 },
      { word: "Red", translation: "Vermelho", emoji: "🔴", example: "Red!", xp: 10 },
      { word: "Blue", translation: "Azul", emoji: "🔵", example: "Blue!", xp: 10 },
      { word: "Green", translation: "Verde", emoji: "🟢", example: "Green!", xp: 10 },
    ],
    dialoguePrompt: "Diga um número e uma cor em inglês. Use só o que aprendeu: One, Two, Red, Blue.",
    teacherGender: 'male',
  },
  // ─── ESPANHOL — Aula 1 ───────────────────────────────────────────────────────
  {
    id: "es-level1",
    title: "Hola · Sí · No · Bien",
    titlePt: "Aula 1 — Palavras Essenciais",
    emoji: "🇪🇸",
    langCode: "es-ES",
    langName: "Espanhol",
    level: "A1",
    xpTotal: 100,
    isPremium: false,
    scrollMessages: [
      { from: "teacher", text: "¡Hola! 👋", translation: "Olá!", phonetic: "Ola!", delay: 400 },
      { from: "student", text: "¡Hola!", translation: "Olá!", delay: 1000 },
      { from: "teacher", text: "Sí. ✅", translation: "Sim.", phonetic: "Si.", delay: 1700 },
      { from: "student", text: "Sí.", translation: "Sim.", delay: 2300 },
      { from: "teacher", text: "No. ❌", translation: "Não.", phonetic: "No.", delay: 3000 },
      { from: "student", text: "No.", translation: "Não.", delay: 3600 },
      { from: "teacher", text: "Bien. 👍", translation: "Bem.", phonetic: "Biên.", delay: 4300 },
      { from: "teacher", text: "¿Bien? ¡Sí! ✅", translation: "Bem? Sim!", phonetic: "¿Biên? ¡Si!", delay: 5000 },
      { from: "student", text: "¡Sí! ¡Bien!", translation: "Sim! Bem!", delay: 5700 },
      { from: "teacher", text: "¡Buenos días! ☀️", translation: "Bom dia!", phonetic: "Buénos días!", delay: 6400 },
      { from: "student", text: "¡Buenos días!", translation: "Bom dia!", delay: 7100 },
      { from: "teacher", text: "¡Perfecto! 🌟", translation: "Perfeito!", delay: 7800 },
    ],
    oralPhrases: [
      { text: "¡Hola!", translation: "Olá!", phonetic: "Ola!", xp: 10 },
      { text: "Sí.", translation: "Sim.", phonetic: "Si.", xp: 10 },
      { text: "No.", translation: "Não.", phonetic: "No.", xp: 10 },
      { text: "¡Buenos días!", translation: "Bom dia!", phonetic: "Buénos días!", xp: 15 },
    ],
    flashCards: [
      { word: "Hola", translation: "Olá", emoji: "👋", example: "¡Hola!", xp: 10 },
      { word: "Sí", translation: "Sim", emoji: "✅", example: "¡Sí!", xp: 10 },
      { word: "No", translation: "Não", emoji: "❌", example: "No.", xp: 10 },
      { word: "Bien", translation: "Bem", emoji: "👍", example: "¡Bien!", xp: 10 },
      { word: "Días", translation: "Dias", emoji: "☀️", example: "Buenos días!", xp: 10 },
    ],
    dialoguePrompt: "Diga '¡Hola!' para o professor. Responda só com: Hola, Sí, No, Bien.",
    teacherGender: 'male',
  },
  // ─── FRANCÊS — Aula 1 ────────────────────────────────────────────────────────
  {
    id: "fr-level1",
    title: "Bonjour · Oui · Non · Bien",
    titlePt: "Aula 1 — Palavras Essenciais",
    emoji: "🇫🇷",
    langCode: "fr-FR",
    langName: "Francês",
    level: "A1",
    xpTotal: 100,
    isPremium: false,
    scrollMessages: [
      { from: "teacher", text: "Bonjour! 👋", translation: "Olá!", phonetic: "Bõjúr!", delay: 400 },
      { from: "student", text: "Bonjour!", translation: "Olá!", delay: 1000 },
      { from: "teacher", text: "Oui. ✅", translation: "Sim.", phonetic: "Uí.", delay: 1700 },
      { from: "student", text: "Oui.", translation: "Sim.", delay: 2300 },
      { from: "teacher", text: "Non. ❌", translation: "Não.", phonetic: "Nõ.", delay: 3000 },
      { from: "student", text: "Non.", translation: "Não.", delay: 3600 },
      { from: "teacher", text: "Bien. 👍", translation: "Bem.", phonetic: "Biẽ.", delay: 4300 },
      { from: "teacher", text: "Bien? Oui! ✅", translation: "Bem? Sim!", phonetic: "Biẽ? Uí!", delay: 5000 },
      { from: "student", text: "Oui! Bien!", translation: "Sim! Bem!", delay: 5700 },
      { from: "teacher", text: "Bonjour! Ça va? 😊", translation: "Olá! Tudo bem?", phonetic: "Bõjúr! Sa va?", delay: 6400 },
      { from: "student", text: "Ça va bien!", translation: "Tudo bem!", delay: 7100 },
      { from: "teacher", text: "Parfait! 🌟", translation: "Perfeito!", delay: 7800 },
    ],
    oralPhrases: [
      { text: "Bonjour!", translation: "Olá!", phonetic: "Bõjúr!", xp: 10 },
      { text: "Oui.", translation: "Sim.", phonetic: "Uí.", xp: 10 },
      { text: "Non.", translation: "Não.", phonetic: "Nõ.", xp: 10 },
      { text: "Ça va bien!", translation: "Tudo bem!", phonetic: "Sa va biẽ!", xp: 15 },
    ],
    flashCards: [
      { word: "Bonjour", translation: "Olá", emoji: "👋", example: "Bonjour!", xp: 10 },
      { word: "Oui", translation: "Sim", emoji: "✅", example: "Oui!", xp: 10 },
      { word: "Non", translation: "Não", emoji: "❌", example: "Non.", xp: 10 },
      { word: "Bien", translation: "Bem", emoji: "👍", example: "Bien!", xp: 10 },
      { word: "Ça va", translation: "Tudo bem", emoji: "😊", example: "Ça va?", xp: 10 },
    ],
    dialoguePrompt: "Diga 'Bonjour!' para o professor. Responda só com: Bonjour, Oui, Non, Bien.",
    teacherGender: 'female',
  },
];

// ── Componente ScrollChat ──────────────────────────────────────────────────────
function ScrollStage({ messages, langCode, teacherGender, onComplete }: {
  messages: ScrollMessage[];
  langCode: string;
  teacherGender?: 'male' | 'female';
  onComplete: () => void;
}) {
  const [visible, setVisible] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    const show = async () => {
      for (let i = 0; i < messages.length; i++) {
        if (cancelled) break;
        await new Promise(r => setTimeout(r, i === 0 ? messages[i].delay : messages[i].delay - messages[i - 1].delay));
        if (cancelled) break;
        setVisible(v => [...v, i]);
        // speak teacher lines — usa Edge TTS Neural (voz natural)
        if (messages[i].from === "teacher") {
          speakText(messages[i].text, langCode, { gender: teacherGender });
        }
      }
      if (!cancelled) {
        await new Promise(r => setTimeout(r, 1200));
        setDone(true);
      }
    };
    show();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visible]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          visible.includes(i) ? (
            <div key={i} className={`flex ${msg.from === "student" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[78%] rounded-2xl px-4 py-3 shadow-sm ${
                msg.from === "teacher"
                  ? "bg-white text-gray-800 rounded-tl-sm border border-gray-100"
                  : "bg-indigo-600 text-white rounded-tr-sm"
              }`}>
                <p className="font-semibold text-base leading-snug">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.from === "teacher" ? "text-gray-500" : "text-indigo-200"}`}>{msg.translation}</p>
                {msg.phonetic && (
                  <p className={`text-xs mt-0.5 italic ${msg.from === "teacher" ? "text-indigo-400" : "text-indigo-300"}`}>🔊 {msg.phonetic}</p>
                )}
              </div>
            </div>
          ) : null
        ))}
        <div ref={bottomRef} />
      </div>
      {done && (
        <div className="p-4 border-t border-gray-100 bg-white">
          <Button onClick={onComplete} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl">
            Continuar → Praticar a Fala 🎤
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Componente Oral ────────────────────────────────────────────────────────────
function OralStage({ phrases, langCode, teacherGender, onComplete }: {
  phrases: OralPhrase[];
  langCode: string;
  teacherGender?: 'male' | 'female';
  onComplete: (xp: number) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState<"correct" | "wrong" | null>(null);
  const [totalXp, setTotalXp] = useState(0);
  const phrase = phrases[idx];

  const speak = () => {
    speakText(phrase.text, langCode, { gender: teacherGender });
  };

  const handleAnswer = (correct: boolean) => {
    setScore(correct ? "correct" : "wrong");
    if (correct) setTotalXp(x => x + phrase.xp);
    setTimeout(() => {
      setScore(null);
      if (idx + 1 < phrases.length) setIdx(i => i + 1);
      else onComplete(totalXp + (correct ? phrase.xp : 0));
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex justify-between items-center mb-4">
        <Badge variant="outline" className="text-indigo-600 border-indigo-300">{idx + 1} / {phrases.length}</Badge>
        <Badge className="bg-yellow-400 text-yellow-900">+{totalXp} XP</Badge>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full text-center border border-gray-100">
          <p className="text-3xl font-bold text-gray-800 mb-2">{phrase.text}</p>
          <p className="text-gray-500 text-lg">{phrase.translation}</p>
          <p className="text-indigo-400 text-sm mt-1 italic">🔊 {phrase.phonetic}</p>
        </div>
        <Button onClick={speak} variant="outline" className="gap-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50">
          <Volume2 className="w-4 h-4" /> Ouvir pronúncia nativa
        </Button>
        <p className="text-gray-500 text-sm text-center">Repita em voz alta e avalie você mesmo:</p>
        <div className="flex gap-4 w-full">
          <Button onClick={() => handleAnswer(false)} variant="outline" className={`flex-1 py-4 rounded-xl border-2 gap-2 ${score === "wrong" ? "border-red-400 bg-red-50" : "border-red-200 hover:border-red-400"}`}>
            <XCircle className="w-5 h-5 text-red-500" /> Errei
          </Button>
          <Button onClick={() => handleAnswer(true)} className={`flex-1 py-4 rounded-xl gap-2 ${score === "correct" ? "bg-green-600" : "bg-green-500 hover:bg-green-600"}`}>
            <CheckCircle className="w-5 h-5" /> Acertei!
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Componente Flashcard ───────────────────────────────────────────────────────
function GameStage({ cards, langCode, teacherGender, onComplete }: {
  cards: FlashCard[];
  langCode: string;
  teacherGender?: 'male' | 'female';
  onComplete: (xp: number) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [totalXp, setTotalXp] = useState(0);
  const [hearts, setHearts] = useState(3);
  const card = cards[idx];

  const speak = () => {
    speakText(card.word, langCode, { gender: teacherGender });
  };

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      setTotalXp(x => x + card.xp);
      toast.success(`+${card.xp} XP! 🌟`, { duration: 800 });
    } else {
      setHearts(h => Math.max(0, h - 1));
    }
    setFlipped(false);
    if (idx + 1 < cards.length) setIdx(i => i + 1);
    else onComplete(totalXp + (correct ? card.xp : 0));
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart key={i} className={`w-5 h-5 ${i < hearts ? "text-red-500 fill-red-500" : "text-gray-300"}`} />
          ))}
        </div>
        <Progress value={((idx) / cards.length) * 100} className="w-32 h-2" />
        <Badge className="bg-yellow-400 text-yellow-900">+{totalXp} XP</Badge>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <button
          onClick={() => { setFlipped(f => !f); if (!flipped) speak(); }}
          className="w-full bg-white rounded-2xl shadow-lg p-10 text-center border border-gray-100 hover:shadow-xl transition-all active:scale-95 cursor-pointer"
        >
          {!flipped ? (
            <>
              <p className="text-6xl mb-4">{card.emoji}</p>
              <p className="text-4xl font-bold text-gray-800">{card.word}</p>
              <p className="text-gray-400 text-sm mt-3">Toque para ver a tradução</p>
            </>
          ) : (
            <>
              <p className="text-6xl mb-4">{card.emoji}</p>
              <p className="text-2xl font-bold text-indigo-600">{card.translation}</p>
              <p className="text-gray-500 mt-2 italic">"{card.example}"</p>
            </>
          )}
        </button>
        {flipped && (
          <div className="flex gap-4 w-full animate-in fade-in duration-200">
            <Button onClick={() => handleAnswer(false)} variant="outline" className="flex-1 py-4 rounded-xl border-2 border-red-200 hover:border-red-400 gap-2">
              <XCircle className="w-5 h-5 text-red-500" /> Não sabia
            </Button>
            <Button onClick={() => handleAnswer(true)} className="flex-1 py-4 rounded-xl bg-green-500 hover:bg-green-600 gap-2">
              <CheckCircle className="w-5 h-5" /> Sabia!
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Componente Diálogo IA ──────────────────────────────────────────────────────
function DialogueStage({ prompt, langCode, onComplete }: {
  prompt: string;
  langCode: string;
  onComplete: () => void;
}) {
  const [messages, setMessages] = useState<{ from: "ai" | "user"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const aiChat = trpc.ai.chat.useMutation();

  useEffect(() => {
    setMessages([{ from: "ai", text: `Ótimo! Agora vamos conversar. ${prompt} Pode começar! 😊` }]);
  }, [prompt]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(m => [...m, { from: "user", text: userMsg }]);
    setLoading(true);
    try {
      const res = await aiChat.mutateAsync({
        message: userMsg,
        languageCode: langCode,
        conversationHistory: messages.map(m => ({ role: m.from === "ai" ? "assistant" as const : "user" as const, content: m.text })),
      });
      setMessages(m => [...m, { from: "ai", text: res.response }]);
    } catch {
      setMessages(m => [...m, { from: "ai", text: "Boa tentativa! Continue praticando. 👏" }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
              msg.from === "ai" ? "bg-white border border-gray-100 text-gray-800 rounded-tl-sm" : "bg-indigo-600 text-white rounded-tr-sm"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Digite sua resposta..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-400"
        />
        <Button onClick={send} disabled={loading || !input.trim()} className="bg-indigo-600 hover:bg-indigo-700 px-4 rounded-xl">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      <div className="p-3 border-t border-gray-50">
        <Button onClick={onComplete} variant="outline" className="w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50">
          Concluir aula ✅
        </Button>
      </div>
    </div>
  );
}

// ── Componente Principal ───────────────────────────────────────────────────────
export default function MasterLesson() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [selectedLesson, setSelectedLesson] = useState<MasterLessonData | null>(null);
  const [stage, setStage] = useState<Stage>("scroll");
  const [totalXp, setTotalXp] = useState(0);

  const stageLabels: Record<Stage, string> = {
    scroll: "📖 Conversa",
    oral: "🎤 Fala",
    game: "🃏 Flashcard",
    dialogue: "🤖 Diálogo IA",
    complete: "✅ Completo",
  };
  const stages: Stage[] = ["scroll", "oral", "game", "dialogue"];
  const stageIndex = stages.indexOf(stage);

  if (!selectedLesson) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/lessons-hub">
              <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">⚡ Master Lesson</h1>
              <p className="text-sm text-gray-500">Do zero ao diálogo real</p>
            </div>
          </div>

          {/* Como funciona */}
          <div className="bg-indigo-600 text-white rounded-2xl p-5 mb-6">
            <h2 className="font-bold text-lg mb-3">Como funciona</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "📖", label: "Conversa rolada", desc: "Palavra por palavra" },
                { icon: "🎤", label: "Modo oral", desc: "Ouça e repita" },
                { icon: "🃏", label: "Flashcard", desc: "Memorize com XP" },
                { icon: "🤖", label: "Diálogo IA", desc: "Pratique com professor" },
              ].map(s => (
                <div key={s.label} className="bg-white/10 rounded-xl p-3">
                  <p className="text-xl">{s.icon}</p>
                  <p className="font-semibold text-sm">{s.label}</p>
                  <p className="text-xs text-indigo-200">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Lista de lições */}
          <h2 className="font-bold text-gray-800 mb-3">Escolha sua aula</h2>
          <div className="space-y-3">
            {MASTER_LESSONS.map(lesson => {
              const locked = lesson.isPremium && (!user || (user as any).subscriptionType === "free");
              return (
                <button
                  key={lesson.id}
                  onClick={() => {
                    if (locked) { toast.error("🔒 Aula Premium — faça upgrade para acessar"); return; }
                    setSelectedLesson(lesson);
                    setStage("scroll");
                    setTotalXp(0);
                  }}
                  className={`w-full text-left bg-white rounded-2xl p-4 shadow-sm border transition-all active:scale-95 ${
                    locked ? "border-gray-200 opacity-60" : "border-indigo-100 hover:border-indigo-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{lesson.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800">{lesson.titlePt}</p>
                        {locked && <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">Premium</Badge>}
                      </div>
                      <p className="text-sm text-gray-500">{lesson.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{lesson.langName}</Badge>
                        <Badge variant="outline" className="text-xs">{lesson.level}</Badge>
                        <span className="text-xs text-yellow-600 font-semibold">+{lesson.xpTotal} XP</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <Link href="/natural-learning">
              <Button variant="outline" className="gap-2 border-indigo-200 text-indigo-600">
                <Globe className="w-4 h-4" /> Ver trilha completa por fases
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "complete") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Aula Concluída!</h2>
          <p className="text-gray-500 mb-6">{selectedLesson.titlePt}</p>
          <div className="bg-yellow-50 rounded-2xl p-4 mb-6">
            <p className="text-3xl font-bold text-yellow-600">+{totalXp} XP</p>
            <p className="text-yellow-700 text-sm">ganhos nesta aula</p>
          </div>
          <div className="space-y-3">
            <Button onClick={() => { setSelectedLesson(null); setStage("scroll"); }} className="w-full bg-indigo-600 hover:bg-indigo-700">
              Próxima aula →
            </Button>
            <Button onClick={() => { setStage("scroll"); setTotalXp(0); }} variant="outline" className="w-full gap-2">
              <RotateCcw className="w-4 h-4" /> Repetir
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setSelectedLesson(null)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <p className="font-bold text-gray-800 text-sm">{selectedLesson.titlePt}</p>
          <div className="flex gap-1 mt-1">
            {stages.map((s, i) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${i <= stageIndex ? "bg-indigo-500" : "bg-gray-200"}`} />
            ))}
          </div>
        </div>
        <Badge className="bg-yellow-400 text-yellow-900 text-xs">+{totalXp} XP</Badge>
      </div>

      {/* Stage label */}
      <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100">
        <p className="text-indigo-700 text-sm font-semibold">{stageLabels[stage]}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {stage === "scroll" && (
          <ScrollStage
            messages={selectedLesson.scrollMessages}
            langCode={selectedLesson.langCode}
            teacherGender={selectedLesson.teacherGender}
            onComplete={() => setStage("oral")}
          />
        )}
        {stage === "oral" && (
          <OralStage
            phrases={selectedLesson.oralPhrases}
            langCode={selectedLesson.langCode}
            teacherGender={selectedLesson.teacherGender}
            onComplete={(xp) => { setTotalXp(t => t + xp); setStage("game"); }}
          />
        )}
        {stage === "game" && (
          <GameStage
            cards={selectedLesson.flashCards}
            langCode={selectedLesson.langCode}
            teacherGender={selectedLesson.teacherGender}
            onComplete={(xp) => { setTotalXp(t => t + xp); setStage("dialogue"); }}
          />
        )}
        {stage === "dialogue" && (
          <DialogueStage
            prompt={selectedLesson.dialoguePrompt}
            langCode={selectedLesson.langCode}
            onComplete={() => setStage("complete")}
          />
        )}
      </div>
    </div>
  );
}
