/**
 * PHRASAL VERBS EXERCISES
 * Sistema de exercícios interativos para praticar phrasal verbs
 */

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy, Target } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type ExerciseType = "multiple_choice" | "fill_blank" | "matching";

interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  options?: string[];
  correctAnswer: string;
  phrasalVerb: string;
  explanation: string;
}

export default function PhrasalVerbsExercises() {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: phrasalVerbs } = trpc.phrasalVerbs.search.useQuery({});

  useEffect(() => {
    if (phrasalVerbs && (phrasalVerbs as unknown as any[]).length > 0) {
      generateExercises(phrasalVerbs as unknown as any[]);
      setIsLoading(false);
    }
  }, [phrasalVerbs]);

  const generateExercises = (pvList: any[]) => {
    const generated: Exercise[] = [];
    const shuffled = [...pvList].sort(() => Math.random() - 0.5).slice(0, 10);

    shuffled.forEach((pv, idx) => {
      const examples = JSON.parse(pv.examples);
      const translations = JSON.parse(pv.translations);
      
      // Tipo 1: Múltipla escolha - significado
      if (idx % 3 === 0) {
        const otherPVs = pvList.filter(p => p.id !== pv.id).sort(() => Math.random() - 0.5).slice(0, 3);
        generated.push({
          id: `mc_${pv.id}`,
          type: "multiple_choice",
          question: `What does "${pv.phrasalVerb}" mean?`,
          options: [pv.meaning, ...otherPVs.map(p => p.meaning)].sort(() => Math.random() - 0.5),
          correctAnswer: pv.meaning,
          phrasalVerb: pv.phrasalVerb,
          explanation: `"${pv.phrasalVerb}" means "${pv.meaning}". Example: ${examples[0].en}`
        });
      }
      
      // Tipo 2: Preencher lacuna
      else if (idx % 3 === 1 && examples.length > 0) {
        const example = examples[0].en;
        const blank = example.replace(new RegExp(pv.phrasalVerb, 'gi'), '______');
        generated.push({
          id: `fb_${pv.id}`,
          type: "fill_blank",
          question: `Fill in the blank: ${blank}`,
          correctAnswer: pv.phrasalVerb.toLowerCase(),
          phrasalVerb: pv.phrasalVerb,
          explanation: `The correct answer is "${pv.phrasalVerb}". Translation: ${examples[0].pt}`
        });
      }
      
      // Tipo 3: Tradução
      else {
        const otherTranslations = pvList
          .filter(p => p.id !== pv.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(p => JSON.parse(p.translations)[0]);
        
        generated.push({
          id: `tr_${pv.id}`,
          type: "multiple_choice",
          question: `How do you say "${translations[0]}" in English?`,
          options: [pv.phrasalVerb, ...otherTranslations].sort(() => Math.random() - 0.5),
          correctAnswer: pv.phrasalVerb,
          phrasalVerb: pv.phrasalVerb,
          explanation: `"${translations[0]}" in English is "${pv.phrasalVerb}". Example: ${examples[0].en}`
        });
      }
    });

    setExercises(generated);
  };

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    const currentExercise = exercises[currentExerciseIndex];
    const isCorrect = answer.toLowerCase().trim() === currentExercise.correctAnswer.toLowerCase().trim();
    
    if (isCorrect) {
      setScore(score + 1);
      toast.success("Correct! 🎉");
    } else {
      toast.error(`Wrong! The correct answer is: ${currentExercise.correctAnswer}`);
    }
  };

  const handleNext = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  };

  const handleRestart = () => {
    setCurrentExerciseIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    if (phrasalVerbs) {
      generateExercises(phrasalVerbs as unknown as any[]);
    }
  };

  if (isLoading || exercises.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exercises...</p>
        </div>
      </div>
    );
  }

  const currentExercise = exercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / exercises.length) * 100;
  const isFinished = currentExerciseIndex === exercises.length - 1 && isAnswered;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Phrasal Verbs Practice</h2>
          <p className="text-gray-600">Test your knowledge with interactive exercises</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            <span className="text-lg font-semibold">
              {currentExerciseIndex + 1} / {exercises.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <span className="text-lg font-semibold text-yellow-600">{score}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-gray-600 text-right">{Math.round(progress)}% Complete</p>
      </div>

      {/* Exercise Card */}
      {!isFinished ? (
        <Card className="p-8 shadow-lg">
          <div className="space-y-6">
            {/* Exercise Type Badge */}
            <Badge variant="outline" className="text-purple-600 border-purple-600">
              {currentExercise.type === "multiple_choice"
                ? "Multiple Choice"
                : currentExercise.type === "fill_blank"
                ? "Fill in the Blank"
                : "Matching"}
            </Badge>

            {/* Question */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{currentExercise.question}</h3>
            </div>

            {/* Options (Multiple Choice) */}
            {currentExercise.type === "multiple_choice" && currentExercise.options && (
              <div className="grid grid-cols-1 gap-3">
                {currentExercise.options.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentExercise.correctAnswer;
                  const showResult = isAnswered;

                  return (
                    <Button
                      key={idx}
                      variant="outline"
                      size="lg"
                      onClick={() => handleAnswer(option)}
                      disabled={isAnswered}
                      className={`justify-start text-left h-auto py-4 px-6 ${
                        showResult && isCorrect
                          ? "bg-green-50 border-green-500 text-green-700"
                          : showResult && isSelected && !isCorrect
                          ? "bg-red-50 border-red-500 text-red-700"
                          : isSelected
                          ? "bg-purple-50 border-purple-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-semibold">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1">{option}</span>
                        {showResult && isCorrect && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                        {showResult && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-600" />}
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}

            {/* Fill in the Blank */}
            {currentExercise.type === "fill_blank" && (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Type your answer here..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value && !isAnswered) {
                      handleAnswer(e.currentTarget.value);
                    }
                  }}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  disabled={isAnswered}
                  value={selectedAnswer || ""}
                />
                {!isAnswered && (
                  <Button
                    onClick={() => selectedAnswer && handleAnswer(selectedAnswer)}
                    disabled={!selectedAnswer}
                    className="w-full"
                  >
                    Submit Answer
                  </Button>
                )}
              </div>
            )}

            {/* Explanation (shown after answer) */}
            {isAnswered && (
              <div className={`p-4 rounded-lg ${
                selectedAnswer?.toLowerCase().trim() === currentExercise.correctAnswer.toLowerCase().trim()
                  ? "bg-green-50 border-2 border-green-200"
                  : "bg-red-50 border-2 border-red-200"
              }`}>
                <p className="font-semibold mb-2">
                  {selectedAnswer?.toLowerCase().trim() === currentExercise.correctAnswer.toLowerCase().trim()
                    ? "✅ Correct!"
                    : "❌ Incorrect"}
                </p>
                <p className="text-gray-700">{currentExercise.explanation}</p>
              </div>
            )}

            {/* Next Button */}
            {isAnswered && currentExerciseIndex < exercises.length - 1 && (
              <Button onClick={handleNext} size="lg" className="w-full">
                Next Question <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
        </Card>
      ) : (
        /* Results Screen */
        <Card className="p-12 shadow-lg text-center">
          <div className="space-y-6">
            <Trophy className="h-24 w-24 text-yellow-500 mx-auto" />
            <h2 className="text-3xl font-bold text-gray-900">Exercise Complete!</h2>
            <div className="space-y-2">
              <p className="text-6xl font-bold text-purple-600">{score} / {exercises.length}</p>
              <p className="text-xl text-gray-600">
                {score === exercises.length
                  ? "Perfect score! 🎉"
                  : score >= exercises.length * 0.7
                  ? "Great job! 👏"
                  : score >= exercises.length * 0.5
                  ? "Good effort! Keep practicing! 💪"
                  : "Keep learning! You'll get better! 📚"}
              </p>
              <p className="text-gray-500">
                Accuracy: {Math.round((score / exercises.length) * 100)}%
              </p>
            </div>
            <Button onClick={handleRestart} size="lg" className="w-full max-w-md mx-auto">
              <RotateCcw className="mr-2 h-5 w-5" />
              Try Again
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
