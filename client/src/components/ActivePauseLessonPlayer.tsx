/**
 * ActivePauseLessonPlayer — Sistema de Pausa Ativa
 * 
 * Metodologia:
 * 1. Professor apresenta uma frase do texto
 * 2. Para e pergunta: "O que você entendeu?"
 * 3. Aluno responde (escrita ou fala)
 * 4. Professor reformula com sinônimos do dicionário
 * 5. Exercícios de fala, escrita e conversação interativa
 * 6. Caderno de anotações para memorização
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { speakText, normalizeLang, selectBestVoice } from "@/hooks/useNaturalVoice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  BookOpen, Mic, MicOff, Volume2, VolumeX, ChevronRight,
  ChevronLeft, RotateCcw, CheckCircle, XCircle, Lightbulb,
  MessageSquare, PenLine, BookMarked, Sparkles, Play, Pause,
  RefreshCw, Star, Trophy, Brain, Languages
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────

interface SentenceBlock {
  id: number;
  original: string;           // Frase no idioma alvo
  translation: string;        // Tradução para o idioma nativo
  phonetic?: string;          // Transcrição fonética
  keywords: KeyWord[];        // Palavras-chave com sinônimos
  comprehensionQ: string;     // Pergunta de compreensão
  reformulations: string[];   // Reformulações da frase com sinônimos
}

interface KeyWord {
  word: string;
  translation: string;
  synonyms: string[];         // Sinônimos no idioma alvo
  synonymTranslations: string[];
  partOfSpeech: string;       // noun, verb, adjective, etc.
}

interface NoteEntry {
  word: string;
  translation: string;
  sentence: string;
  timestamp: string;
}

interface ActivePauseLessonPlayerProps {
  lessonId: number;
  lessonTitle: string;
  languageCode: string;
  nativeLanguage?: string;
  teacherName?: string;
  teacherPhoto?: string;
  onComplete?: (score: number) => void;
}

// ─── Teacher Avatar with lip-sync animation ────────────────────────────────

function TeacherAvatar({
  photo,
  name,
  isSpeaking,
  expression = "neutral",
}: {
  photo?: string;
  name: string;
  isSpeaking: boolean;
  expression?: "neutral" | "happy" | "thinking" | "question" | "encouraging";
}) {
  const expressionEmoji: Record<string, string> = {
    neutral: "😊",
    happy: "😄",
    thinking: "🤔",
    question: "❓",
    encouraging: "👏",
  };

  return (
    <div className="relative flex flex-col items-center">
      <div
        className={`relative w-24 h-24 rounded-full overflow-hidden border-4 shadow-lg transition-all duration-300 ${
          isSpeaking
            ? "border-blue-500 shadow-blue-300 scale-105"
            : "border-purple-300"
        }`}
      >
        {photo ? (
          <img src={photo} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-4xl">
            👨‍🏫
          </div>
        )}
        {/* Lip-sync animation overlay */}
        {isSpeaking && (
          <div className="absolute bottom-0 left-0 right-0 h-1/3 flex items-end justify-center pb-1">
            <div className="flex gap-0.5">
              {[1, 2, 3, 2, 1].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-white rounded-full opacity-80"
                  style={{
                    height: `${h * 4}px`,
                    animation: `lipSync 0.${2 + i}s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="mt-1 text-center">
        <p className="text-xs font-semibold text-gray-700">{name}</p>
        <span className="text-lg">{expressionEmoji[expression]}</span>
      </div>
      <style>{`
        @keyframes lipSync {
          from { transform: scaleY(0.3); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

// ─── Synonym Selector ──────────────────────────────────────────────────────

function SynonymSelector({
  keyword,
  onSelect,
}: {
  keyword: KeyWord;
  onSelect: (synonym: string, translation: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
      <div className="flex items-center gap-2 mb-2">
        <Languages className="h-4 w-4 text-amber-600" />
        <span className="font-semibold text-amber-800">{keyword.word}</span>
        <Badge variant="outline" className="text-xs">{keyword.partOfSpeech}</Badge>
        <span className="text-sm text-gray-500">= {keyword.translation}</span>
      </div>
      <p className="text-xs text-gray-600 mb-2">Sinônimos — clique para substituir na frase:</p>
      <div className="flex flex-wrap gap-1.5">
        {keyword.synonyms.map((syn, i) => (
          <button
            key={i}
            onClick={() => {
              setSelected(syn);
              onSelect(syn, keyword.synonymTranslations[i] || syn);
            }}
            className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
              selected === syn
                ? "bg-amber-500 text-white shadow-md scale-105"
                : "bg-white border border-amber-300 text-amber-700 hover:bg-amber-100"
            }`}
          >
            {syn}
            <span className="ml-1 text-gray-400">({keyword.synonymTranslations[i] || ""})</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Notebook Panel ────────────────────────────────────────────────────────

function NotebookPanel({
  notes,
  onAddNote,
}: {
  notes: NoteEntry[];
  onAddNote: (note: NoteEntry) => void;
}) {
  const [newWord, setNewWord] = useState("");
  const [newTranslation, setNewTranslation] = useState("");

  const handleAdd = () => {
    if (!newWord.trim()) return;
    onAddNote({
      word: newWord.trim(),
      translation: newTranslation.trim(),
      sentence: "",
      timestamp: new Date().toLocaleTimeString(),
    });
    setNewWord("");
    setNewTranslation("");
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 h-full">
      <div className="flex items-center gap-2 mb-3">
        <BookMarked className="h-5 w-5 text-yellow-600" />
        <h3 className="font-bold text-yellow-800">Caderno de Anotações</h3>
        <Badge className="bg-yellow-200 text-yellow-800 text-xs">{notes.length} palavras</Badge>
      </div>
      <div className="flex gap-2 mb-3">
        <Input
          placeholder="Palavra..."
          value={newWord}
          onChange={e => setNewWord(e.target.value)}
          className="text-sm h-8"
          onKeyDown={e => e.key === "Enter" && handleAdd()}
        />
        <Input
          placeholder="Tradução..."
          value={newTranslation}
          onChange={e => setNewTranslation(e.target.value)}
          className="text-sm h-8"
          onKeyDown={e => e.key === "Enter" && handleAdd()}
        />
        <Button size="sm" onClick={handleAdd} className="h-8 px-2">
          <PenLine className="h-3 w-3" />
        </Button>
      </div>
      <ScrollArea className="h-48">
        {notes.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">
            Anote palavras importantes aqui para memorizar!
          </p>
        ) : (
          <div className="space-y-1.5">
            {notes.map((note, i) => (
              <div key={i} className="bg-white rounded-lg px-3 py-2 border border-yellow-100 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-sm text-gray-800">{note.word}</span>
                  {note.translation && (
                    <span className="text-xs text-gray-500 ml-2">= {note.translation}</span>
                  )}
                </div>
                <span className="text-xs text-gray-400">{note.timestamp}</span>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// ─── Exercise Panel ────────────────────────────────────────────────────────

type ExerciseMode = "comprehension" | "writing" | "speaking" | "reformulation" | "conversation";

function ExercisePanel({
  sentence,
  mode,
  languageCode,
  nativeLanguage,
  teacherName,
  onComplete,
}: {
  sentence: SentenceBlock;
  mode: ExerciseMode;
  languageCode: string;
  nativeLanguage: string;
  teacherName: string;
  onComplete: (correct: boolean, userAnswer: string) => void;
}) {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [selectedSynonymFrase, setSelectedSynonymFrase] = useState(sentence.original);
  const freeChatMutation = trpc.ai.freeChat.useMutation();

  const checkAnswer = async () => {
    if (!answer.trim()) return;
    setIsChecking(true);
    try {
      const systemPrompt = `You are ${teacherName}, a language teacher for ${languageCode.toUpperCase()}.
The student is learning ${languageCode.toUpperCase()} and their native language is ${nativeLanguage}.
The lesson sentence is: "${sentence.original}"
Translation: "${sentence.translation}"

Evaluate the student's answer briefly and encouragingly. Respond in ${nativeLanguage}.
If correct or partially correct: praise and add a small tip.
If incorrect: gently correct and explain why in simple terms.
Keep response under 3 sentences.`;

      const result = await freeChatMutation.mutateAsync({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `My answer: "${answer}"` },
        ],
      });
      setFeedback(result.content);
      const isCorrect = !result.content.toLowerCase().includes("incorret") &&
        !result.content.toLowerCase().includes("errado") &&
        !result.content.toLowerCase().includes("wrong");
      onComplete(isCorrect, answer);
    } catch {
      setFeedback("Boa tentativa! Continue praticando.");
      onComplete(true, answer);
    } finally {
      setIsChecking(false);
    }
  };

  const speak = (text: string) => speakText(text, languageCode);

  if (mode === "comprehension") {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-5 w-5 text-blue-600" />
            <h4 className="font-bold text-blue-800">Pergunta de Compreensão</h4>
          </div>
          <p className="text-gray-800 font-medium text-lg mb-1">{sentence.comprehensionQ}</p>
          <p className="text-sm text-gray-500 italic">Sobre: "{sentence.original}"</p>
        </div>
        <Textarea
          placeholder={`Responda em ${nativeLanguage} ou em ${languageCode.toUpperCase()}...`}
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          className="min-h-[80px] text-base"
        />
        {feedback && (
          <div className={`p-3 rounded-lg border text-sm ${
            feedback.includes("✓") || feedback.includes("Excelente") || feedback.includes("Ótimo")
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-orange-50 border-orange-200 text-orange-800"
          }`}>
            <Sparkles className="h-4 w-4 inline mr-1" />
            {feedback}
          </div>
        )}
        <Button onClick={checkAnswer} disabled={!answer.trim() || isChecking} className="w-full">
          {isChecking ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
          {isChecking ? "Verificando..." : "Verificar Resposta"}
        </Button>
      </div>
    );
  }

  if (mode === "writing") {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <PenLine className="h-5 w-5 text-green-600" />
            <h4 className="font-bold text-green-800">Exercício de Escrita</h4>
          </div>
          <p className="text-sm text-gray-600 mb-2">Escreva a frase abaixo em {languageCode.toUpperCase()}:</p>
          <div className="bg-white p-3 rounded-lg border border-green-100">
            <p className="text-gray-800 font-medium">"{sentence.translation}"</p>
          </div>
        </div>
        <Input
          placeholder={`Digite em ${languageCode.toUpperCase()}...`}
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          className="text-base"
          onKeyDown={e => e.key === "Enter" && checkAnswer()}
        />
        {feedback && (
          <div className="p-3 rounded-lg border bg-blue-50 border-blue-200 text-blue-800 text-sm">
            <Sparkles className="h-4 w-4 inline mr-1" />
            {feedback}
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => speak(sentence.original)} className="flex-1">
            <Volume2 className="h-4 w-4 mr-2" />
            Ouvir Frase
          </Button>
          <Button onClick={checkAnswer} disabled={!answer.trim() || isChecking} className="flex-1">
            {isChecking ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
            Verificar
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "reformulation") {
    return (
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="h-5 w-5 text-amber-600" />
            <h4 className="font-bold text-amber-800">Reformulação com Sinônimos</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Substitua palavras por sinônimos para criar novas frases com o mesmo significado:
          </p>
          <div className="bg-white p-3 rounded-lg border border-amber-100 mb-3">
            <p className="text-gray-800 font-medium text-lg">{selectedSynonymFrase}</p>
          </div>
          {sentence.keywords.map((kw, i) => (
            <SynonymSelector
              key={i}
              keyword={kw}
              onSelect={(syn) => {
                setSelectedSynonymFrase(prev =>
                  prev.replace(new RegExp(`\\b${kw.word}\\b`, 'gi'), syn)
                );
              }}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => speak(selectedSynonymFrase)} className="flex-1">
            <Volume2 className="h-4 w-4 mr-2" />
            Ouvir Nova Frase
          </Button>
          <Button onClick={() => {
            setAnswer(selectedSynonymFrase);
            onComplete(true, selectedSynonymFrase);
            toast.success("Reformulação registrada no caderno!");
          }} className="flex-1">
            <CheckCircle className="h-4 w-4 mr-2" />
            Confirmar
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "speaking") {
    return (
      <div className="space-y-4">
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Mic className="h-5 w-5 text-purple-600" />
            <h4 className="font-bold text-purple-800">Exercício de Fala</h4>
          </div>
          <p className="text-sm text-gray-600 mb-2">Repita a frase em voz alta:</p>
          <div className="bg-white p-3 rounded-lg border border-purple-100">
            <p className="text-gray-800 font-bold text-xl text-center">{sentence.original}</p>
            {sentence.phonetic && (
              <p className="text-gray-400 text-sm text-center mt-1 font-mono">[{sentence.phonetic}]</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => speak(sentence.original)} className="flex-1">
            <Volume2 className="h-4 w-4 mr-2" />
            Ouvir Modelo
          </Button>
          <Button onClick={() => {
            onComplete(true, sentence.original);
            toast.success("Ótimo! Continue praticando a pronúncia.");
          }} className="flex-1 bg-purple-600 hover:bg-purple-700">
            <CheckCircle className="h-4 w-4 mr-2" />
            Pratiquei!
          </Button>
        </div>
        <p className="text-xs text-gray-400 text-center">
          Dica: Use o botão "Ouvir Modelo" para ouvir a pronúncia correta antes de repetir.
        </p>
      </div>
    );
  }

  // conversation mode
  return (
    <div className="space-y-4">
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="h-5 w-5 text-indigo-600" />
          <h4 className="font-bold text-indigo-800">Conversação Livre</h4>
        </div>
        <p className="text-sm text-gray-600">
          Crie uma frase nova usando as palavras desta lição, ou faça uma pergunta ao professor:
        </p>
      </div>
      <Textarea
        placeholder={`Escreva em ${languageCode.toUpperCase()} ou em ${nativeLanguage}...`}
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        className="min-h-[80px] text-base"
      />
      {feedback && (
        <div className="p-3 rounded-lg border bg-indigo-50 border-indigo-200 text-indigo-800 text-sm">
          <Sparkles className="h-4 w-4 inline mr-1" />
          {feedback}
        </div>
      )}
      <Button onClick={checkAnswer} disabled={!answer.trim() || isChecking} className="w-full bg-indigo-600 hover:bg-indigo-700">
        {isChecking ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <MessageSquare className="h-4 w-4 mr-2" />}
        {isChecking ? "Professor respondendo..." : "Enviar ao Professor"}
      </Button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function ActivePauseLessonPlayer({
  lessonId,
  lessonTitle,
  languageCode,
  nativeLanguage = "pt",
  teacherName = "Professor",
  teacherPhoto,
  onComplete,
}: ActivePauseLessonPlayerProps) {
  const [sentences, setSentences] = useState<SentenceBlock[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [teacherExpression, setTeacherExpression] = useState<"neutral" | "happy" | "thinking" | "question" | "encouraging">("neutral");
  const [phase, setPhase] = useState<"reading" | "exercise">("reading");
  const [exerciseMode, setExerciseMode] = useState<ExerciseMode>("comprehension");
  const [completedSentences, setCompletedSentences] = useState<Set<number>>(new Set());
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [showNotes, setShowNotes] = useState(false);
  const [score, setScore] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const generateContentMutation = trpc.ai.generateLessonContent.useMutation();
  const freeChatMutation = trpc.ai.freeChat.useMutation();

  // Generate lesson sentences with active pause structure
  useEffect(() => {
    setIsGenerating(true);
    const lang = languageCode.split("-")[0].toUpperCase();
    const native = nativeLanguage === "pt" ? "Portuguese (Brazilian)" : nativeLanguage;

    freeChatMutation.mutateAsync({
      messages: [
        {
          role: "system",
          content: `You are an expert language teacher creating structured lesson content for ${lang}. 
Native language of student: ${native}. Return ONLY valid JSON, no markdown.`,
        },
        {
          role: "user",
          content: `Create a lesson about "${lessonTitle}" with 5 sentence blocks for active learning.

Return this exact JSON:
{
  "sentences": [
    {
      "id": 1,
      "original": "sentence in ${lang}",
      "translation": "translation in ${native}",
      "phonetic": "IPA phonetic transcription",
      "keywords": [
        {
          "word": "key word from sentence",
          "translation": "translation in ${native}",
          "synonyms": ["syn1", "syn2", "syn3"],
          "synonymTranslations": ["trans1", "trans2", "trans3"],
          "partOfSpeech": "noun|verb|adjective|adverb"
        }
      ],
      "comprehensionQ": "question in ${native} asking what the student understood",
      "reformulations": [
        "same sentence with synonym 1",
        "same sentence with synonym 2"
      ]
    }
  ]
}

Rules:
- 5 sentences total, progressive difficulty (simple → complex)
- Each sentence: 5-12 words, natural and useful
- 2-3 keywords per sentence with 3 synonyms each
- Comprehension question in ${native}
- All ${lang} text must be grammatically correct`,
        },
      ],
    }).then((result) => {
      try {
        const parsed = JSON.parse(result.content);
        setSentences(parsed.sentences || []);
      } catch {
        // Fallback sentences
        setSentences([
          {
            id: 1,
            original: `Hello, my name is ${teacherName}.`,
            translation: `Olá, meu nome é ${teacherName}.`,
            phonetic: "hɛˈloʊ maɪ neɪm ɪz",
            keywords: [
              {
                word: "Hello",
                translation: "Olá",
                synonyms: ["Hi", "Hey", "Greetings"],
                synonymTranslations: ["Oi", "Ei", "Saudações"],
                partOfSpeech: "interjection",
              },
            ],
            comprehensionQ: `O que a frase "${`Hello, my name is ${teacherName}.`}" significa?`,
            reformulations: [`Hi, my name is ${teacherName}.`, `Hey, I am ${teacherName}.`],
          },
          {
            id: 2,
            original: "I am learning a new language today.",
            translation: "Estou aprendendo um novo idioma hoje.",
            phonetic: "aɪ æm ˈlɜrnɪŋ ə njuː ˈlæŋɡwɪdʒ təˈdeɪ",
            keywords: [
              {
                word: "learning",
                translation: "aprendendo",
                synonyms: ["studying", "practicing", "acquiring"],
                synonymTranslations: ["estudando", "praticando", "adquirindo"],
                partOfSpeech: "verb",
              },
              {
                word: "language",
                translation: "idioma",
                synonyms: ["tongue", "speech", "dialect"],
                synonymTranslations: ["língua", "fala", "dialeto"],
                partOfSpeech: "noun",
              },
            ],
            comprehensionQ: "O que a pessoa está fazendo hoje?",
            reformulations: [
              "I am studying a new language today.",
              "I am practicing a new tongue today.",
            ],
          },
          {
            id: 3,
            original: "This lesson helps me understand better.",
            translation: "Esta lição me ajuda a entender melhor.",
            phonetic: "ðɪs ˈlɛsən hɛlps miː ˌʌndəˈstænd ˈbɛtər",
            keywords: [
              {
                word: "helps",
                translation: "ajuda",
                synonyms: ["assists", "supports", "enables"],
                synonymTranslations: ["auxilia", "apoia", "permite"],
                partOfSpeech: "verb",
              },
            ],
            comprehensionQ: "Para que serve esta lição segundo a frase?",
            reformulations: [
              "This lesson assists me to understand better.",
              "This lesson supports my understanding.",
            ],
          },
          {
            id: 4,
            original: "Practice makes perfect in every language.",
            translation: "A prática leva à perfeição em todo idioma.",
            phonetic: "ˈpræktɪs meɪks ˈpɜrfɪkt ɪn ˈɛvri ˈlæŋɡwɪdʒ",
            keywords: [
              {
                word: "Practice",
                translation: "Prática",
                synonyms: ["Repetition", "Exercise", "Training"],
                synonymTranslations: ["Repetição", "Exercício", "Treinamento"],
                partOfSpeech: "noun",
              },
              {
                word: "perfect",
                translation: "perfeição",
                synonyms: ["mastery", "excellence", "fluency"],
                synonymTranslations: ["maestria", "excelência", "fluência"],
                partOfSpeech: "noun",
              },
            ],
            comprehensionQ: "O que a prática traz, segundo esta frase?",
            reformulations: [
              "Repetition makes mastery in every language.",
              "Exercise brings excellence in every tongue.",
            ],
          },
          {
            id: 5,
            original: "I will speak this language like a native soon.",
            translation: "Vou falar este idioma como nativo em breve.",
            phonetic: "aɪ wɪl spiːk ðɪs ˈlæŋɡwɪdʒ laɪk ə ˈneɪtɪv suːn",
            keywords: [
              {
                word: "speak",
                translation: "falar",
                synonyms: ["communicate", "converse", "express"],
                synonymTranslations: ["comunicar", "conversar", "expressar"],
                partOfSpeech: "verb",
              },
              {
                word: "native",
                translation: "nativo",
                synonyms: ["fluent speaker", "local", "natural"],
                synonymTranslations: ["falante fluente", "local", "natural"],
                partOfSpeech: "noun",
              },
            ],
            comprehensionQ: "Qual é o objetivo do aluno segundo esta frase?",
            reformulations: [
              "I will communicate in this language like a native soon.",
              "I will converse in this tongue like a local soon.",
            ],
          },
        ]);
      }
      setIsGenerating(false);
    }).catch(() => {
      setIsGenerating(false);
    });
  }, [lessonId, lessonTitle, languageCode, nativeLanguage]);

  const currentSentence = sentences[currentIdx];
  const progress = sentences.length > 0 ? ((currentIdx + 1) / sentences.length) * 100 : 0;
  const totalCompleted = completedSentences.size;

  const speak = useCallback((text: string) => {
    speakText(text, languageCode, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  }, [languageCode]);

  const handleExerciseComplete = (correct: boolean, userAnswer: string) => {
    if (correct) {
      setScore(s => s + 10);
      setTeacherExpression("encouraging");
      toast.success("Muito bem! +10 pontos 🌟");
    } else {
      setTeacherExpression("thinking");
    }
    setCompletedSentences(prev => new Set([...prev, currentIdx]));

    // Auto-advance after 2 seconds
    setTimeout(() => {
      if (currentIdx < sentences.length - 1) {
        setCurrentIdx(i => i + 1);
        setPhase("reading");
        setTeacherExpression("neutral");
      } else {
        // Lesson complete!
        toast.success(`🏆 Lição completa! Score: ${score + 10} pontos`);
        onComplete?.(score + 10);
      }
    }, 2000);
  };

  const addToNotes = (word: string, translation: string, sentence: string) => {
    setNotes(prev => {
      if (prev.find(n => n.word === word)) return prev;
      return [...prev, { word, translation, sentence, timestamp: new Date().toLocaleTimeString() }];
    });
    toast.success(`"${word}" adicionado ao caderno!`);
  };

  const exerciseModes: { mode: ExerciseMode; label: string; icon: React.ReactNode; color: string }[] = [
    { mode: "comprehension", label: "Compreensão", icon: <Brain className="h-3 w-3" />, color: "bg-blue-100 text-blue-700 border-blue-200" },
    { mode: "writing", label: "Escrita", icon: <PenLine className="h-3 w-3" />, color: "bg-green-100 text-green-700 border-green-200" },
    { mode: "speaking", label: "Fala", icon: <Mic className="h-3 w-3" />, color: "bg-purple-100 text-purple-700 border-purple-200" },
    { mode: "reformulation", label: "Sinônimos", icon: <RefreshCw className="h-3 w-3" />, color: "bg-amber-100 text-amber-700 border-amber-200" },
    { mode: "conversation", label: "Conversa", icon: <MessageSquare className="h-3 w-3" />, color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  ];

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center animate-pulse">
          <BookOpen className="h-8 w-8 text-white" />
        </div>
        <p className="text-gray-600 font-medium">Professor preparando a aula...</p>
        <p className="text-sm text-gray-400">Criando frases, sinônimos e exercícios personalizados</p>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!currentSentence) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TeacherAvatar
            photo={teacherPhoto}
            name={teacherName}
            isSpeaking={isSpeaking}
            expression={teacherExpression}
          />
          <div>
            <h3 className="font-bold text-gray-900">{lessonTitle}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-blue-100 text-blue-700 text-xs">
                Frase {currentIdx + 1}/{sentences.length}
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                <Star className="h-3 w-3 mr-1 inline" />{score} pts
              </Badge>
              <Badge className="bg-green-100 text-green-700 text-xs">
                <CheckCircle className="h-3 w-3 mr-1 inline" />{totalCompleted} completas
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNotes(!showNotes)}
            className={showNotes ? "bg-yellow-50 border-yellow-300" : ""}
          >
            <BookMarked className="h-4 w-4 mr-1" />
            Caderno ({notes.length})
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Progress value={progress} className="h-2" />

      <div className={`grid gap-4 ${showNotes ? "grid-cols-3" : "grid-cols-1"}`}>
        <div className={showNotes ? "col-span-2" : "col-span-1"}>
          {/* Sentence Display */}
          <Card className={`border-2 transition-all duration-300 ${
            completedSentences.has(currentIdx) ? "border-green-300 bg-green-50" : "border-blue-200"
          }`}>
            <CardContent className="pt-4 space-y-3">
              {/* Original sentence with animated text */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-gray-900 leading-relaxed">
                      {currentSentence.original}
                    </p>
                    {currentSentence.phonetic && (
                      <p className="text-sm text-gray-400 font-mono mt-1">
                        [{currentSentence.phonetic}]
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speak(currentSentence.original)}
                    className="shrink-0"
                  >
                    <Volume2 className="h-5 w-5 text-blue-500" />
                  </Button>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-gray-600 italic">{currentSentence.translation}</p>
                </div>
              </div>

              {/* Keywords clickable */}
              <div className="flex flex-wrap gap-2">
                {currentSentence.keywords.map((kw, i) => (
                  <button
                    key={i}
                    onClick={() => addToNotes(kw.word, kw.translation, currentSentence.original)}
                    className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1"
                    title={`Clique para adicionar ao caderno: ${kw.word} = ${kw.translation}`}
                  >
                    <span className="font-semibold">{kw.word}</span>
                    <span className="text-gray-400 text-xs">({kw.translation})</span>
                    <PenLine className="h-3 w-3 text-blue-400" />
                  </button>
                ))}
              </div>

              {/* Phase toggle */}
              {phase === "reading" ? (
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                    <Lightbulb className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-800 mb-1">
                        {teacherName} pergunta:
                      </p>
                      <p className="text-gray-700">{currentSentence.comprehensionQ}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setPhase("exercise")}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <ChevronRight className="h-4 w-4 mr-2" />
                    Responder e Praticar
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Exercise mode selector */}
                  <div className="flex flex-wrap gap-1.5">
                    {exerciseModes.map(({ mode, label, icon, color }) => (
                      <button
                        key={mode}
                        onClick={() => setExerciseMode(mode)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                          exerciseMode === mode
                            ? color + " shadow-sm scale-105"
                            : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {icon}
                        {label}
                      </button>
                    ))}
                  </div>

                  <ExercisePanel
                    sentence={currentSentence}
                    mode={exerciseMode}
                    languageCode={languageCode}
                    nativeLanguage={nativeLanguage === "pt" ? "Português" : nativeLanguage}
                    teacherName={teacherName}
                    onComplete={handleExerciseComplete}
                  />

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPhase("reading")}
                    className="w-full text-gray-500"
                  >
                    <ChevronLeft className="h-3 w-3 mr-1" />
                    Voltar à frase
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-3">
            <Button
              variant="outline"
              onClick={() => {
                if (currentIdx > 0) {
                  setCurrentIdx(i => i - 1);
                  setPhase("reading");
                }
              }}
              disabled={currentIdx === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <div className="flex gap-1">
              {sentences.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentIdx(i); setPhase("reading"); }}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === currentIdx
                      ? "bg-blue-500 scale-125"
                      : completedSentences.has(i)
                      ? "bg-green-400"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                if (currentIdx < sentences.length - 1) {
                  setCurrentIdx(i => i + 1);
                  setPhase("reading");
                }
              }}
              disabled={currentIdx === sentences.length - 1}
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Notebook Panel */}
        {showNotes && (
          <div className="col-span-1">
            <NotebookPanel
              notes={notes}
              onAddNote={(note) => setNotes(prev => [...prev, note])}
            />
          </div>
        )}
      </div>

      {/* Reformulations preview */}
      {currentSentence.reformulations && currentSentence.reformulations.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
          <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            Reformulações possíveis:
          </p>
          <div className="space-y-1">
            {currentSentence.reformulations.map((ref, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-700 italic">{ref}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 shrink-0"
                  onClick={() => speak(ref)}
                >
                  <Volume2 className="h-3 w-3 text-gray-400" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
