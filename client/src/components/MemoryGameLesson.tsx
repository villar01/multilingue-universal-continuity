/**
 * MemoryGameLesson — Jogos de memorização para fixar vocabulário
 *
 * Três modos de jogo:
 * 1. Flashcards: ver palavra → pensar na tradução → virar carta
 * 2. Match Pairs: combinar palavra com tradução em uma grade
 * 3. Fill-in-the-blank: completar a frase com a palavra correta
 */
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { speakText } from "@/hooks/useNaturalVoice";
import { ParetoPracticeCycle } from "@/components/ParetoPracticeCycle";
import { trpc } from "@/lib/trpc";
import type { CEFRLevel } from "@/lib/lesson-levels";
import { toast } from "sonner";
import {
  Brain, RotateCcw, CheckCircle, XCircle, Volume2,
  Sparkles, Trophy, Shuffle, Eye, EyeOff, ArrowRight,
  Star, Zap, Gamepad2
} from "lucide-react";

interface VocabItem {
  word: string;
  translation: string;
  example?: string;
  exampleTranslation?: string;
}

interface MemoryGameLessonProps {
  vocabulary: VocabItem[];
  languageCode: string;
  nativeLanguage?: string;
  level?: CEFRLevel;
  onComplete?: (score: number, total: number) => void;
}

type GameMode = "flashcards" | "match-pairs" | "fill-blank" | "pareto";

// ─── Flashcards Mode ────────────────────────────────────────────────────────

function FlashcardsMode({ vocab, languageCode, onProgress }: {
  vocab: VocabItem[];
  languageCode: string;
  onProgress: (correct: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [knownWords, setKnownWords] = useState<Set<number>>(new Set());

  const current = vocab[index];

  const handleFlip = () => setFlipped(!flipped);

  const handleKnown = () => {
    const newKnown = new Set(knownWords);
    newKnown.add(index);
    setKnownWords(newKnown);
    setCorrectCount(correctCount + 1);
    speakText(current.word, languageCode);
    nextCard();
  };

  const handleUnknown = () => {
    speakText(current.word, languageCode);
    nextCard();
  };

  const nextCard = () => {
    setFlipped(false);
    if (index < vocab.length - 1) {
      setIndex(index + 1);
    } else {
      onProgress(correctCount + (knownWords.has(index) ? 0 : 0));
      toast.success(`Flashcards concluídos! ${correctCount + 1}/${vocab.length} palavras`);
    }
  };

  const restart = () => {
    setIndex(0);
    setFlipped(false);
    setCorrectCount(0);
    setKnownWords(new Set());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-sm">
          {index + 1} / {vocab.length}
        </Badge>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            {correctCount} acertos
          </Badge>
          <Button variant="ghost" size="sm" onClick={restart}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Progress value={((index + 1) / vocab.length) * 100} className="h-2" />

      <div
        className="relative min-h-[200px] cursor-pointer select-none perspective-1000"
        onClick={handleFlip}
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
            flipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front - Word in target language */}
          <div className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-8 flex flex-col items-center justify-center text-white shadow-xl">
            <p className="text-4xl font-bold mb-2">{current.word}</p>
            <p className="text-sm opacity-80 mt-4">Toque para ver tradução</p>
            <Eye className="h-5 w-5 mt-2 opacity-60" />
          </div>
          {/* Back - Translation */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 p-8 flex flex-col items-center justify-center text-white shadow-xl">
            <p className="text-4xl font-bold mb-2">{current.translation}</p>
            {current.example && (
              <p className="text-sm opacity-80 mt-4 text-center italic">"{current.example}"</p>
            )}
            <Volume2 className="h-5 w-5 mt-2 opacity-60" />
          </div>
        </div>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>

      <div className="flex gap-2">
        <Button variant="outline" onClick={handleUnknown} className="flex-1">
          <XCircle className="h-4 w-4 mr-2 text-red-500" />
          Não sabia
        </Button>
        <Button onClick={handleKnown} className="flex-1 bg-green-600 hover:bg-green-700">
          <CheckCircle className="h-4 w-4 mr-2" />
          Sabia!
        </Button>
      </div>
    </div>
  );
}

// ─── Match Pairs Mode ────────────────────────────────────────────────────────

type CardState = "hidden" | "revealed" | "matched";

interface MatchCard {
  id: number;
  text: string;
  pairId: number;
  isTranslation: boolean;
  state: CardState;
}

function MatchPairsMode({ vocab, languageCode, onProgress }: {
  vocab: VocabItem[];
  languageCode: string;
  onProgress: (correct: number) => void;
}) {
  const [cards, setCards] = useState<MatchCard[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const initGame = useCallback(() => {
    const pairs = vocab.slice(0, 8).flatMap((item, i) => [
      { id: i * 2, text: item.word, pairId: i, isTranslation: false, state: "hidden" as CardState },
      { id: i * 2 + 1, text: item.translation, pairId: i, isTranslation: true, state: "hidden" as CardState },
    ]);
    // Shuffle
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }
    setCards(pairs);
    setSelected([]);
    setMatchedCount(0);
    setAttempts(0);
  }, [vocab]);

  useEffect(() => { initGame(); }, [initGame]);

  const handleClick = (cardId: number) => {
    if (selected.length >= 2) return;
    const card = cards.find(c => c.id === cardId);
    if (!card || card.state !== "hidden") return;

    if (!card.isTranslation) {
      speakText(card.text, languageCode);
    }

    const newSelected = [...selected, cardId];
    setSelected(newSelected);

    setCards(prev => prev.map(c => c.id === cardId ? { ...c, state: "revealed" } : c));

    if (newSelected.length === 2) {
      setAttempts(attempts + 1);
      const [first, second] = newSelected.map(id => cards.find(c => c.id === id)!);
      if (first.pairId === second.pairId) {
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === first.id || c.id === second.id
              ? { ...c, state: "matched" }
              : c
          ));
          setMatchedCount(prev => {
            const newCount = prev + 1;
            if (newCount === Math.min(vocab.length, 8)) {
              onProgress(newCount);
              toast.success(`Parabéns! ${newCount} pares em ${attempts + 1} tentativas!`);
            }
            return newCount;
          });
          setSelected([]);
        }, 600);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === first.id || c.id === second.id
              ? { ...c, state: "hidden" }
              : c
          ));
          setSelected([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge className="bg-blue-100 text-blue-700">
          <Trophy className="h-3 w-3 mr-1" />
          {matchedCount} / {Math.min(vocab.length, 8)} pares
        </Badge>
        <Badge variant="outline">
          <Zap className="h-3 w-3 mr-1" />
          {attempts} tentativas
        </Badge>
        <Button variant="ghost" size="sm" onClick={initGame}>
          <Shuffle className="h-4 w-4" />
        </Button>
      </div>

      <Progress value={(matchedCount / Math.min(vocab.length, 8)) * 100} className="h-2" />

      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => handleClick(card.id)}
            disabled={card.state === "matched"}
            className={`min-h-[80px] rounded-xl p-3 text-center font-medium text-sm transition-all duration-300 ${
              card.state === "hidden"
                ? "bg-slate-200 hover:bg-slate-300 text-slate-400"
                : card.state === "revealed"
                ? "bg-blue-500 text-white shadow-lg scale-105"
                : "bg-green-500 text-white opacity-60"
            }`}
          >
            {card.state === "hidden" ? "?" : card.text}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Fill-in-the-blank Mode ──────────────────────────────────────────────────

function FillBlankMode({ vocab, languageCode, onProgress }: {
  vocab: VocabItem[];
  languageCode: string;
  onProgress: (correct: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [shuffledVocab, setShuffledVocab] = useState<VocabItem[]>([]);

  useEffect(() => {
    setShuffledVocab([...vocab].sort(() => Math.random() - 0.5));
  }, [vocab]);

  const current = shuffledVocab[index];
  const blankedExample = current?.example
    ? current.example.replace(new RegExp(current.word, "gi"), "_____")
    : `_____ = ${current?.translation}`;

  const checkAnswer = () => {
    if (!answer.trim()) return;
    const isCorrect = answer.trim().toLowerCase() === current.word.toLowerCase();
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      setCorrectCount(correctCount + 1);
      speakText(current.word, languageCode);
    }

    setTimeout(() => {
      setFeedback(null);
      setAnswer("");
      if (index < shuffledVocab.length - 1) {
        setIndex(index + 1);
      } else {
        onProgress(correctCount + (isCorrect ? 1 : 0));
        toast.success(`Jogo concluído! ${correctCount + (isCorrect ? 1 : 0)}/${shuffledVocab.length} corretas`);
      }
    }, 1500);
  };

  if (!current) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-sm">
          {index + 1} / {shuffledVocab.length}
        </Badge>
        <Badge className="bg-green-100 text-green-700">
          <Star className="h-3 w-3 mr-1" />
          {correctCount} corretas
        </Badge>
      </div>

      <Progress value={((index + 1) / shuffledVocab.length) * 100} className="h-2" />

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Gamepad2 className="h-5 w-5 text-purple-600" />
          <h4 className="font-bold text-purple-800">Complete a frase</h4>
        </div>
        <p className="text-lg text-gray-800 mb-4 leading-relaxed">
          {blankedExample}
        </p>
        {current.exampleTranslation && (
          <p className="text-sm text-gray-500 italic mb-3">
            {current.exampleTranslation}
          </p>
        )}
        <Input
          placeholder="Digite a palavra..."
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          onKeyDown={e => e.key === "Enter" && checkAnswer()}
          className={`text-lg ${
            feedback === "correct" ? "border-green-500 bg-green-50" :
            feedback === "wrong" ? "border-red-500 bg-red-50" : ""
          }`}
        />
        {feedback && (
          <div className={`mt-2 flex items-center gap-2 text-sm ${
            feedback === "correct" ? "text-green-600" : "text-red-600"
          }`}>
            {feedback === "correct" ? (
              <><CheckCircle className="h-4 w-4" /> Correto! "{current.word}"</>
            ) : (
              <><XCircle className="h-4 w-4" /> A resposta era: "{current.word}"</>
            )}
          </div>
        )}
      </Card>

      <Button onClick={checkAnswer} disabled={!answer.trim() || feedback !== null} className="w-full">
        {feedback === "correct" ? <CheckCircle className="h-4 w-4 mr-2" /> :
         feedback === "wrong" ? <XCircle className="h-4 w-4 mr-2" /> :
         <ArrowRight className="h-4 w-4 mr-2" />}
        {feedback ? "Próxima..." : "Verificar"}
      </Button>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MemoryGameLesson({
  vocabulary,
  languageCode,
  nativeLanguage = "pt",
  level = "A1",
  onComplete,
}: MemoryGameLessonProps) {
  const [mode, setMode] = useState<GameMode | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [paretoIndex, setParetoIndex] = useState(0);
  const paretoAudioRef = useRef<HTMLAudioElement | null>(null);
  const paretoTtsMut = trpc.tts.speak.useMutation();

  const handleProgress = (correct: number) => {
    setTotalScore(totalScore + correct);
    if (mode === "fill-blank") {
      onComplete?.(correct, vocabulary.length);
    }
  };

  const handleFlashcardProgress = (correct: number) => {
    setTotalScore(correct);
    onComplete?.(correct, vocabulary.length);
  };

  const handleMatchProgress = (correct: number) => {
    setTotalScore(correct);
    onComplete?.(correct, Math.min(vocabulary.length, 8));
  };

  const speakPareto = async (text: string) => {
    if (!text.trim()) return;
    if (paretoAudioRef.current) {
      paretoAudioRef.current.pause();
      paretoAudioRef.current = null;
    }
    try {
      const result = await paretoTtsMut.mutateAsync({ text: text.slice(0, 400), voiceLang: languageCode });
      if (!result.success || !result.audioBase64) return;
      const bytes = Uint8Array.from(atob(result.audioBase64), (char) => char.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: "audio/mp3" }));
      const audio = new Audio(url);
      paretoAudioRef.current = audio;
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();
    } catch {
      // The visual recall and writing flow stays usable when audio is unavailable.
    }
  };

  if (!mode) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Brain className="h-12 w-12 mx-auto text-purple-600 mb-2" />
          <h3 className="text-xl font-bold text-gray-800">Jogos de Memorização</h3>
          <p className="text-sm text-gray-500 mt-1">
            Escolha um jogo para fixar o vocabulário da lição
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <button
            onClick={() => setMode("flashcards")}
            className="group rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white text-left shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            <Eye className="h-8 w-8 mb-3 opacity-80" />
            <h4 className="font-bold text-lg mb-1">Flashcards</h4>
            <p className="text-sm opacity-80">Vire as cartas e teste sua memória</p>
          </button>

          <button
            onClick={() => setMode("match-pairs")}
            className="group rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 p-6 text-white text-left shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            <Shuffle className="h-8 w-8 mb-3 opacity-80" />
            <h4 className="font-bold text-lg mb-1">Combinar Pares</h4>
            <p className="text-sm opacity-80">Encontre a tradução correta</p>
          </button>

          <button
            onClick={() => setMode("fill-blank")}
            className="group rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 p-6 text-white text-left shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            <Sparkles className="h-8 w-8 mb-3 opacity-80" />
            <h4 className="font-bold text-lg mb-1">Complete a Frase</h4>
            <p className="text-sm opacity-80">Preencha a lacuna com a palavra certa</p>
          </button>

          <button
            onClick={() => { setParetoIndex(0); setMode("pareto"); }}
            className="group rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-6 text-slate-950 text-left shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            <Sparkles className="h-8 w-8 mb-3 opacity-80" />
            <h4 className="font-bold text-lg mb-1">Ciclo Pareto</h4>
            <p className="text-sm opacity-80">Lembre, escreva e crie uma nova frase</p>
          </button>
        </div>

        {totalScore > 0 && (
          <div className="text-center">
            <Badge className="bg-yellow-100 text-yellow-700 text-sm">
              <Trophy className="h-4 w-4 mr-1" />
              Pontuação total: {totalScore}
            </Badge>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setMode(null)}>
          ← Voltar aos jogos
        </Button>
        <Badge variant="outline" className="text-sm">
          {mode === "flashcards" && "Flashcards"}
          {mode === "match-pairs" && "Combinar Pares"}
          {mode === "fill-blank" && "Complete a Frase"}
          {mode === "pareto" && "Ciclo Pareto"}
        </Badge>
      </div>

      {mode === "flashcards" && (
        <FlashcardsMode vocab={vocabulary} languageCode={languageCode} onProgress={handleFlashcardProgress} />
      )}
      {mode === "match-pairs" && (
        <MatchPairsMode vocab={vocabulary} languageCode={languageCode} onProgress={handleMatchProgress} />
      )}
      {mode === "fill-blank" && (
        <FillBlankMode vocab={vocabulary} languageCode={languageCode} onProgress={handleProgress} />
      )}
      {mode === "pareto" && vocabulary[paretoIndex] && (
        <div className="space-y-3">
          <ParetoPracticeCycle
            term={{
              word: vocabulary[paretoIndex].word,
              translation: vocabulary[paretoIndex].translation,
              example: vocabulary[paretoIndex].example,
            }}
            onClose={() => setMode(null)}
            onSpeak={speakPareto}
            embedded
            level={level}
          />
          {vocabulary.length > 1 && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setParetoIndex((index) => (index + 1) % vocabulary.length)}
            >
              Próxima palavra Pareto
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
