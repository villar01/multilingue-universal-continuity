import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { LANGUAGES_57, type Language } from "@/lib/languages";
import LanguageSelector from "@/components/LanguageSelector";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

type Phase = "lobby" | "waiting" | "quiz" | "results";

interface Question {
  question: string;
  options: string[];
  correct: number;
  word: string;
}

const CATEGORIES = [
  { id: "animals", label: "🐾 Animais" },
  { id: "food", label: "🍕 Comida" },
  { id: "travel", label: "✈️ Viagem" },
  { id: "work", label: "💼 Trabalho" },
  { id: "body", label: "🫀 Corpo Humano" },
  { id: "nature", label: "🌿 Natureza" },
  { id: "technology", label: "💻 Tecnologia" },
  { id: "emotions", label: "😊 Emoções" },
  { id: "sports", label: "⚽ Esportes" },
  { id: "colors", label: "🎨 Cores" },
];

const QUESTION_TIME = 15; // seconds per question

export default function BattleMode() {
  const { user } = useAuth();
  const { profile } = useLanguage();
  const [phase, setPhase] = useState<Phase>("lobby");
  const [lang, setLang] = useState<Language>(LANGUAGES_57[0]);
  const [category, setCategory] = useState("animals");
  const [roomCode, setRoomCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [wordsCorrect, setWordsCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [answered, setAnswered] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [pollInterval, setPollInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  const createRoom = trpc.battle.create.useMutation();
  const joinRoom = trpc.battle.join.useMutation();
  const generateQuiz = trpc.battle.generateQuiz.useMutation();
  const submitScore = trpc.battle.submitScore.useMutation();
  const { data: roomData, refetch: refetchRoom } = trpc.battle.getRoom.useQuery(
    { roomCode },
    { enabled: !!roomCode && phase === "waiting" }
  );

  // Polling for room status when waiting
  useEffect(() => {
    if (phase === "waiting" && roomCode) {
      const interval = setInterval(() => { refetchRoom(); }, 2000);
      setPollInterval(interval);
      return () => clearInterval(interval);
    }
    if (pollInterval) { clearInterval(pollInterval); setPollInterval(null); }
  }, [phase, roomCode]);

  // When both players joined, start quiz
  useEffect(() => {
    if (roomData?.status === "active" && phase === "waiting") {
      startQuiz();
    }
  }, [roomData?.status]);

  // Countdown timer per question
  useEffect(() => {
    if (phase !== "quiz" || answered) return;
    if (timeLeft <= 0) { handleAnswer(-1); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase, answered]);

  const handleCreateRoom = async () => {
    if (!user) { toast.error("Faça login para jogar"); return; }
    try {
      const res = await createRoom.mutateAsync({ targetLanguage: lang.code, category });
      setRoomCode(res.roomCode);
      setIsHost(true);
      setPhase("waiting");
      toast.success(`Sala criada! Código: ${res.roomCode}`);
    } catch { toast.error("Erro ao criar sala"); }
  };

  const handleJoinRoom = async () => {
    if (!user) { toast.error("Faça login para jogar"); return; }
    if (!joinCode.trim()) { toast.error("Digite o código da sala"); return; }
    try {
      const res = await joinRoom.mutateAsync({ roomCode: joinCode.trim() });
      setRoomCode(joinCode.trim().toUpperCase());
      setIsHost(false);
      setPhase("waiting");
      toast.success("Entrou na sala! Aguardando início...");
    } catch (e: any) { toast.error(e.message || "Sala não encontrada"); }
  };

  const startQuiz = async () => {
    if (!user) { toast.error("Faça login para gerar perguntas"); return; }
    try {
      const qs = await generateQuiz.mutateAsync({
        targetLanguage: lang.code,
        nativeLanguage: profile.nativeCode,
        category,
        count: 10,
      });
      setQuestions(qs);
      setCurrentQ(0);
      setScore(0);
      setWordsCorrect(0);
      setTimeLeft(QUESTION_TIME);
      setAnswered(false);
      setSelected(null);
      setPhase("quiz");
    } catch { toast.error("Erro ao gerar perguntas"); }
  };

  const handleAnswer = useCallback((optionIndex: number) => {
    if (answered) return;
    setAnswered(true);
    setSelected(optionIndex);
    const q = questions[currentQ];
    const correct = optionIndex === q.correct;
    if (correct) {
      const timeBonus = Math.round((timeLeft / QUESTION_TIME) * 50);
      setScore(s => s + 100 + timeBonus);
      setWordsCorrect(w => w + 1);
    }
    setTimeout(() => {
      if (currentQ + 1 >= questions.length) {
        finishQuiz();
      } else {
        setCurrentQ(q => q + 1);
        setTimeLeft(QUESTION_TIME);
        setAnswered(false);
        setSelected(null);
      }
    }, 1500);
  }, [answered, currentQ, questions, timeLeft]);

  const finishQuiz = async () => {
    setPhase("results");
    try {
      await submitScore.mutateAsync({ roomCode, score, wordsCorrect });
    } catch { /* ignore */ }
  };

  const resetGame = () => {
    setPhase("lobby");
    setRoomCode("");
    setJoinCode("");
    setQuestions([]);
    setCurrentQ(0);
    setScore(0);
    setWordsCorrect(0);
    setIsHost(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800/80 border-slate-700 p-8 text-center max-w-md">
          <div className="text-5xl mb-4">⚔️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Modo Batalha</h2>
          <p className="text-slate-400 mb-6">Faça login para desafiar outros jogadores</p>
          <Link href="/"><Button className="bg-red-600 hover:bg-red-700">Entrar</Button></Link>
        </Card>
      </div>
    );
  }

  // LOBBY
  if (phase === "lobby") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/30 to-slate-900 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/ar-mode">
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">← Voltar</Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">⚔️ Modo Batalha</h1>
              <p className="text-slate-400">Desafie outros jogadores em tempo real</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create Room */}
            <Card className="bg-slate-800/60 border-red-700/50">
              <CardHeader>
                <CardTitle className="text-white text-lg">🏟️ Criar Sala</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-1">Idioma</label>
                  <LanguageSelector value={lang} onChange={setLang} />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Categoria</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setCategory(c.id)}
                        className={`text-xs px-2 py-2 rounded-lg border transition-all ${
                          category === c.id
                            ? "bg-red-600 border-red-500 text-white"
                            : "bg-slate-700 border-slate-600 text-slate-300 hover:border-red-500"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={handleCreateRoom}
                  disabled={createRoom.isPending}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {createRoom.isPending ? "Criando..." : "⚔️ Criar Sala"}
                </Button>
              </CardContent>
            </Card>

            {/* Join Room */}
            <Card className="bg-slate-800/60 border-orange-700/50">
              <CardHeader>
                <CardTitle className="text-white text-lg">🔗 Entrar em Sala</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-1">Código da Sala</label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={e => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Ex: ABC123"
                    maxLength={6}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <p className="text-slate-400 text-sm">Peça o código ao seu adversário e entre na batalha!</p>
                </div>
                <Button
                  onClick={handleJoinRoom}
                  disabled={joinRoom.isPending || !joinCode.trim()}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  {joinRoom.isPending ? "Entrando..." : "🚀 Entrar na Batalha"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Rules */}
          <Card className="bg-slate-800/40 border-slate-700 mt-6">
            <CardContent className="p-4">
              <h3 className="text-white font-bold mb-3">📜 Como Jogar</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-slate-400">
                <div className="flex items-start gap-2">
                  <span className="text-2xl">1️⃣</span>
                  <p>Crie uma sala ou entre com o código do adversário</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-2xl">2️⃣</span>
                  <p>Responda 10 perguntas de vocabulário no menor tempo possível</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-2xl">3️⃣</span>
                  <p>Respostas rápidas valem mais pontos. Quem tiver mais pontos vence!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // WAITING ROOM
  if (phase === "waiting") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/30 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800/80 border-red-700/50 p-8 text-center max-w-md w-full">
          <div className="text-6xl mb-4 animate-bounce">⚔️</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isHost ? "Sala Criada!" : "Aguardando..."}
          </h2>
          {isHost && (
            <>
              <p className="text-slate-400 mb-4">Compartilhe o código com seu adversário:</p>
              <div className="bg-slate-700 rounded-xl p-4 mb-4">
                <div className="text-4xl font-mono font-bold text-red-400 tracking-widest">{roomCode}</div>
              </div>
            </>
          )}
          <div className="flex items-center justify-center gap-3 text-slate-400 mb-6">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span>{isHost ? "Você (Host)" : "Você"} — conectado</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-slate-400 mb-6">
            <div className={`w-3 h-3 rounded-full ${roomData?.guestId ? "bg-green-500" : "bg-slate-500 animate-pulse"}`} />
            <span>{roomData?.guestId ? "Adversário — conectado!" : "Aguardando adversário..."}</span>
          </div>
          {isHost && !roomData?.guestId && (
            <p className="text-slate-500 text-sm mb-4">A batalha inicia automaticamente quando o adversário entrar</p>
          )}
          {isHost && (
            <Button
              onClick={startQuiz}
              disabled={generateQuiz.isPending}
              className="w-full bg-red-600 hover:bg-red-700 mb-3"
            >
              {generateQuiz.isPending ? "Gerando perguntas..." : "🚀 Iniciar Solo (sem adversário)"}
            </Button>
          )}
          <Button variant="outline" onClick={resetGame} className="w-full border-slate-600 text-slate-300">
            Cancelar
          </Button>
        </Card>
      </div>
    );
  }

  // QUIZ
  if (phase === "quiz" && questions.length > 0) {
    const q = questions[currentQ];
    const progress = ((currentQ) / questions.length) * 100;
    const timerColor = timeLeft > 8 ? "text-green-400" : timeLeft > 4 ? "text-yellow-400" : "text-red-400";

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 p-4 flex items-center justify-center">
        <div className="max-w-xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-slate-400 text-sm">
              Pergunta {currentQ + 1} / {questions.length}
            </div>
            <div className={`text-3xl font-bold font-mono ${timerColor}`}>
              {timeLeft}s
            </div>
            <div className="text-slate-400 text-sm">
              Score: <span className="text-yellow-400 font-bold">{score}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-slate-700 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Timer Bar */}
          <div className="h-1.5 bg-slate-700 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-1000"
              style={{
                width: `${(timeLeft / QUESTION_TIME) * 100}%`,
                backgroundColor: timeLeft > 8 ? "#10b981" : timeLeft > 4 ? "#f59e0b" : "#ef4444",
              }}
            />
          </div>

          {/* Question */}
          <Card className="bg-slate-800/80 border-slate-700 mb-6">
            <CardContent className="p-6 text-center">
              <div className="text-slate-400 text-sm mb-2">Qual é a tradução de:</div>
              <div className="text-3xl font-bold text-white">{q.word}</div>
              <div className="text-slate-500 text-sm mt-2">{q.question}</div>
            </CardContent>
          </Card>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            {q.options.map((opt, i) => {
              let cls = "bg-slate-700 border-slate-600 text-white hover:border-red-500";
              if (answered) {
                if (i === q.correct) cls = "bg-green-600 border-green-500 text-white";
                else if (i === selected && i !== q.correct) cls = "bg-red-600 border-red-500 text-white";
                else cls = "bg-slate-700 border-slate-600 text-slate-400 opacity-50";
              }
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={answered}
                  className={`p-4 rounded-xl border-2 text-sm font-medium transition-all ${cls}`}
                >
                  <span className="text-slate-400 mr-2">{["A", "B", "C", "D"][i]}.</span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // RESULTS
  if (phase === "results") {
    const accuracy = questions.length > 0 ? Math.round((wordsCorrect / questions.length) * 100) : 0;
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 p-4 flex items-center justify-center">
        <Card className="bg-slate-800/80 border-slate-700 p-8 text-center max-w-md w-full">
          <div className="text-6xl mb-4">{accuracy >= 80 ? "🏆" : accuracy >= 60 ? "🥈" : "💪"}</div>
          <h2 className="text-2xl font-bold text-white mb-2">Batalha Concluída!</h2>

          <div className="grid grid-cols-3 gap-4 my-6">
            <div className="bg-slate-700/50 rounded-xl p-3">
              <div className="text-2xl font-bold text-yellow-400">{score}</div>
              <div className="text-slate-400 text-xs">Pontos</div>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-3">
              <div className="text-2xl font-bold text-green-400">{wordsCorrect}/{questions.length}</div>
              <div className="text-slate-400 text-xs">Acertos</div>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-3">
              <div className="text-2xl font-bold text-indigo-400">{accuracy}%</div>
              <div className="text-slate-400 text-xs">Precisão</div>
            </div>
          </div>

          {roomData && (
            <div className="bg-slate-700/50 rounded-xl p-4 mb-6">
              <h3 className="text-white font-bold mb-3">📊 Placar da Sala</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Você</span>
                  <span className="text-yellow-400 font-bold">{score} pts</span>
                </div>
                {roomData.guestId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Adversário</span>
                    <span className="text-orange-400 font-bold">
                      {isHost ? (roomData.guestScore ?? "—") : (roomData.hostScore ?? "—")} pts
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={resetGame} className="flex-1 bg-red-600 hover:bg-red-700">
              ⚔️ Nova Batalha
            </Button>
            <Link href="/ranking" className="flex-1">
              <Button variant="outline" className="w-full border-slate-600 text-slate-300">
                🏆 Ranking
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}
