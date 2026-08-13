import { useState, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Brain, CheckCircle2, XCircle, RefreshCw, Sparkles, Trophy } from "lucide-react";
import VoiceRecognitionExercise from "@/components/VoiceRecognitionExercise";
import { resolvePracticeCEFRLevel, type CEFRLevel } from "@/lib/lesson-levels";

type Exercise = {
  type: "multiple_choice" | "fill_blank" | "translation" | "matching";
  question: string;
  options?: string[];
  correctAnswer: string;
  word?: string;
  hint?: string;
  direction?: string;
};

type GrammarAnalysis = {
  hasErrors: boolean;
  errors: Array<{ original: string; corrected: string; explanation: string }>;
  correctedText: string;
  feedback: string;
};

const speechLanguageByTarget: Record<string, string> = {
  en: "en-US", pt: "pt-BR", es: "es-ES", fr: "fr-FR", de: "de-DE",
  it: "it-IT", ja: "ja-JP", zh: "zh-CN", ko: "ko-KR", ru: "ru-RU",
};

export default function SmartReview() {
  const { user } = useAuth();
  const [targetLanguage, setTargetLanguage] = useState<string>("en");
  const [cefrLevel, setCefrLevel] = useState<CEFRLevel>(() => resolvePracticeCEFRLevel(localStorage.getItem("ml_free_talk_level") || "A1"));
  const [exerciseType, setExerciseType] = useState<"multiple_choice" | "fill_blank" | "translation" | "matching">("multiple_choice");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [textAnswer, setTextAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [adaptationFocus, setAdaptationFocus] = useState<string | null>(null);
  const [grammarAnalysis, setGrammarAnalysis] = useState<GrammarAnalysis | null>(null);

  const generateMutation = trpc.smartReview.generate.useMutation({
    onSuccess: (data) => {
      setExercises(data.exercises as Exercise[]);
      setMessage(data.message || "");
      setAdaptationFocus(data.focus || null);
      setCurrentIndex(0);
      setScore(0);
      setCompleted(false);
      setShowResult(false);
      setSelectedAnswer("");
      setTextAnswer("");
      setGrammarAnalysis(null);
    },
  });

  const submitAnswerMutation = trpc.smartReview.submitAnswer.useMutation();
  const analyzeGrammarMutation = trpc.aiChat.analyzeGrammar.useMutation({
    onSuccess: (analysis) => setGrammarAnalysis(analysis as GrammarAnalysis),
  });

  useEffect(() => {
    const saved = localStorage.getItem("ml_target_lang");
    if (saved) setTargetLanguage(saved);
  }, []);

  const handleGenerate = () => {
    generateMutation.mutate({ targetLanguage, exerciseType, cefrLevel });
  };

  const pronunciationDifficulty = cefrLevel === "A1" || cefrLevel === "A2" ? "easy" : cefrLevel === "B1" || cefrLevel === "B2" ? "medium" : "hard";

  const currentExercise = exercises[currentIndex];

  const handleAnswer = async () => {
    if (!currentExercise) return;
    const answer = exerciseType === "multiple_choice" ? selectedAnswer : textAnswer;
    const correct = answer.trim().toLowerCase() === currentExercise.correctAnswer.trim().toLowerCase();
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) setScore(score + 1);
    if (!correct && answer.trim() && currentExercise.type !== "matching") {
      analyzeGrammarMutation.mutate({ text: answer.trim(), languageCode: targetLanguage });
    } else {
      setGrammarAnalysis(null);
    }

    if (currentExercise.word) {
      submitAnswerMutation.mutate({
        word: currentExercise.word,
        translation: currentExercise.correctAnswer,
        targetLanguage,
        quality: correct ? 5 : 2,
      });
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= exercises.length) {
      setCompleted(true);
    } else {
      setCurrentIndex(currentIndex + 1);
      setShowResult(false);
      setSelectedAnswer("");
      setTextAnswer("");
      setGrammarAnalysis(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Faça login para acessar a revisão inteligente.</p>
            <Link href="/"><Button className="mt-4">Voltar ao início</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container max-w-3xl py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Revisão Inteligente
            </h1>
            <p className="text-sm text-muted-foreground">Exercícios adaptativos gerados pela IA com base no seu progresso</p>
          </div>
        </div>

        {/* Setup Card */}
        {exercises.length === 0 && !generateMutation.isPending && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5" /> Configurar Revisão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {message && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-700 dark:text-amber-400">
                  {message}
                </div>
              )}
              <div>
                <label className="text-sm font-medium mb-2 block">Idioma de estudo</label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full p-2 rounded-lg border bg-background"
                >
                  <option value="en">Inglês</option>
                  <option value="pt">Português</option>
                  <option value="es">Espanhol</option>
                  <option value="fr">Francês</option>
                  <option value="de">Alemão</option>
                  <option value="it">Italiano</option>
                  <option value="ja">Japonês</option>
                  <option value="zh">Chinês</option>
                  <option value="ko">Coreano</option>
                  <option value="ru">Russo</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo de exercício</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { val: "multiple_choice", label: "Múltipla Escolha" },
                    { val: "fill_blank", label: "Preencher Lacuna" },
                    { val: "translation", label: "Tradução" },
                    { val: "matching", label: "Associação" },
                  ] as const).map((opt) => (
                    <Button
                      key={opt.val}
                      variant={exerciseType === opt.val ? "default" : "outline"}
                      onClick={() => setExerciseType(opt.val)}
                      className="w-full"
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Nível CEFR</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["A1", "A2", "B1", "B2", "C1", "C2"] as CEFRLevel[]).map((level) => (
                    <Button key={level} variant={cefrLevel === level ? "default" : "outline"} onClick={() => setCefrLevel(level)}>
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
              <Button onClick={handleGenerate} className="w-full" size="lg">
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Exercícios com IA
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {generateMutation.isPending && (
          <Card>
            <CardContent className="pt-6 flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Gerando exercícios personalizados...</p>
            </CardContent>
          </Card>
        )}

        {/* Exercise Card */}
        {exercises.length > 0 && !completed && currentExercise && (
          <div className="space-y-4">
            {/* Progress */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Exercício {currentIndex + 1} de {exercises.length}</span>
              <div className="flex items-center gap-2"><Badge variant="outline">{cefrLevel}</Badge><Badge variant="secondary">Acertos: {score}</Badge></div>
            </div>
            {adaptationFocus && (
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-100">
                <Sparkles className="mr-1 inline h-3.5 w-3.5" />
                Esta sequência prioriza seu reforço de {adaptationFocus === "grammar" ? "gramática" : adaptationFocus === "pronunciation" ? "pronúncia" : adaptationFocus === "comprehension" ? "compreensão" : "vocabulário"}.
              </div>
            )}
            <Progress value={((currentIndex) / exercises.length) * 100} />

            <Card>
              <CardHeader>
                <Badge variant="outline" className="w-fit">
                  {currentExercise.type === "multiple_choice" && "Múltipla Escolha"}
                  {currentExercise.type === "fill_blank" && "Preencher Lacuna"}
                  {currentExercise.type === "translation" && "Tradução"}
                  {currentExercise.type === "matching" && "Associação"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg font-medium">{currentExercise.question}</p>

                {/* Multiple Choice */}
                {currentExercise.type === "multiple_choice" && currentExercise.options && (
                  <div className="space-y-2">
                    {currentExercise.options.map((opt, i) => (
                      <Button
                        key={i}
                        variant={selectedAnswer === opt ? "default" : "outline"}
                        className="w-full justify-start text-left"
                        disabled={showResult}
                        onClick={() => setSelectedAnswer(opt)}
                      >
                        {opt}
                        {showResult && opt === currentExercise.correctAnswer && <CheckCircle2 className="w-4 h-4 ml-auto text-green-500" />}
                        {showResult && opt === selectedAnswer && opt !== currentExercise.correctAnswer && <XCircle className="w-4 h-4 ml-auto text-red-500" />}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Fill Blank / Translation */}
                {(currentExercise.type === "fill_blank" || currentExercise.type === "translation") && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      disabled={showResult}
                      placeholder="Digite sua resposta..."
                      className="w-full p-3 rounded-lg border bg-background"
                      onKeyDown={(e) => { if (e.key === "Enter" && !showResult && textAnswer) handleAnswer(); }}
                    />
                    {currentExercise.hint && <p className="text-xs text-muted-foreground">Dica: {currentExercise.hint}</p>}
                  </div>
                )}

                {/* Matching */}
                {currentExercise.type === "matching" && (
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-lg">{currentExercise.word} = {currentExercise.correctAnswer}</p>
                  </div>
                )}

                {/* Result Feedback */}
                {showResult && (
                  <div className="space-y-2">
                    <div className={`p-3 rounded-lg flex items-center gap-2 ${isCorrect ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-red-500/10 text-red-700 dark:text-red-400"}`}>
                      {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      <span className="text-sm font-medium">
                        {isCorrect ? "Correto!" : `Resposta correta: ${currentExercise.correctAnswer}`}
                      </span>
                    </div>
                    <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 dark:border-indigo-900 dark:bg-indigo-950/20">
                      <p className="mb-2 text-sm font-semibold text-indigo-950 dark:text-indigo-100">Ajustar pronúncia com o microfone</p>
                      <VoiceRecognitionExercise
                        key={`${currentIndex}-${currentExercise.correctAnswer}`}
                        targetPhrase={currentExercise.correctAnswer}
                        targetLanguage={speechLanguageByTarget[targetLanguage] || targetLanguage || "en-US"}
                        difficulty={pronunciationDifficulty}
                        onComplete={() => undefined}
                      />
                    </div>
                    {!isCorrect && (
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-1">
                        <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">📋 Correção detalhada:</p>
                        <p className="text-sm text-muted-foreground">
                          Sua resposta: <strong className="text-foreground">{exerciseType === "multiple_choice" ? selectedAnswer : textAnswer}</strong>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Resposta correta: <strong className="text-foreground">{currentExercise.correctAnswer}</strong>
                        </p>
                        {currentExercise.hint && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">💡 {currentExercise.hint}</p>
                        )}
                        {currentExercise.word && (
                          <p className="text-xs text-muted-foreground mt-1">
                            🔊 Pronúncia: repita «{currentExercise.word}» em voz alta para praticar.
                          </p>
                        )}
                        {analyzeGrammarMutation.isPending && (
                          <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">Analisando gramática e estrutura da sua resposta…</p>
                        )}
                        {grammarAnalysis && (
                          <div className="mt-3 rounded-md border border-amber-300/60 bg-background/60 p-3 space-y-2">
                            <p className="text-sm font-semibold text-foreground">Análise detalhada da IA</p>
                            <p className="text-xs text-muted-foreground">{grammarAnalysis.feedback}</p>
                            {grammarAnalysis.errors.map((error, index) => (
                              <div key={`${error.original}-${index}`} className="text-xs text-muted-foreground">
                                <span className="line-through text-red-600">{error.original}</span>
                                <span className="mx-1">→</span>
                                <strong className="text-foreground">{error.corrected}</strong>
                                <span className="block mt-0.5">{error.explanation}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {isCorrect && currentExercise.word && (
                      <p className="text-xs text-muted-foreground px-1">🔊 Continue praticando «{currentExercise.word}» para fixar a pronúncia.</p>
                    )}
                  </div>
                )}

                {/* Actions */}
                {!showResult ? (
                  <Button onClick={handleAnswer} disabled={exerciseType === "multiple_choice" ? !selectedAnswer : !textAnswer} className="w-full">
                    Confirmar Resposta
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="w-full">
                    {currentIndex + 1 >= exercises.length ? "Ver Resultado" : "Próximo Exercício"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Completion Card */}
        {completed && (
          <Card className="text-center">
            <CardContent className="pt-6 space-y-4">
              <Trophy className="w-16 h-16 mx-auto text-yellow-500" />
              <h2 className="text-2xl font-bold">Revisão Concluída!</h2>
              <p className="text-lg">
                Você acertou <span className="font-bold text-primary">{score}</span> de <span className="font-bold">{exercises.length}</span> exercícios
              </p>
              <Progress value={(score / exercises.length) * 100} />
              <p className="text-sm text-muted-foreground">
                {score === exercises.length ? "Pontuação perfeita! A IA vai aumentar a dificuldade na próxima revisão." :
                 score >= exercises.length * 0.7 ? "Muito bom! Continue praticando." :
                 "Revise as palavras e tente novamente."}
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={handleGenerate} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" /> Nova Revisão
                </Button>
                <Link href="/dashboard"><Button>Voltar ao Dashboard</Button></Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
