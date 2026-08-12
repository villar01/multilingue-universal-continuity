import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Mic, MicOff, Volume2, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { trpc } from "../lib/trpc";
import { toast } from "sonner";
import { Progress } from "./ui/progress";
import { Card } from "./ui/card";
import { speakText as speakNaturalVoice } from "@/hooks/useNaturalVoice";
import { microphoneErrorMessage, requestMicrophoneStream } from "@/lib/microphoneAccess";

interface VoiceRecognitionExerciseProps {
  targetPhrase: string;
  targetLanguage: string;
  onComplete: (score: number, correct: boolean) => void;
  difficulty?: "easy" | "medium" | "hard";
}

export default function VoiceRecognitionExercise({
  targetPhrase,
  targetLanguage,
  onComplete,
  difficulty = "medium",
}: VoiceRecognitionExerciseProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const updatePronunciationMutation = trpc.gamification.updatePronunciationScore.useMutation();

  useEffect(() => {
    // Inicializar Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = targetLanguage;

      recognitionRef.current.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
        evaluatePronunciation(result);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast.error('Erro no reconhecimento de voz. Tente novamente.');
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        stopAudioVisualization();
      };
    } else {
      toast.error('Seu navegador não suporta reconhecimento de voz.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopAudioVisualization();
    };
  }, [targetLanguage]);

  const startRecording = async () => {
    try {
      setTranscript("");
      setPronunciationScore(null);
      setIsCorrect(null);
      setAttempts(prev => prev + 1);

      // Iniciar visualização de áudio
      await startAudioVisualization();

      // Iniciar reconhecimento de voz
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
        toast.info('Fale agora...');
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Erro ao iniciar gravação.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  const startAudioVisualization = async () => {
    try {
      const stream = await requestMicrophoneStream();
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const updateAudioLevel = () => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(Math.min(100, (average / 128) * 100));

        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };

      updateAudioLevel();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error(microphoneErrorMessage(error));
    }
  };

  const stopAudioVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setAudioLevel(0);
  };

  const evaluatePronunciation = (spokenText: string) => {
    // Normalizar textos para comparação
    const normalizedTarget = targetPhrase.toLowerCase().trim().replace(/[.,!?;:]/g, '');
    const normalizedSpoken = spokenText.toLowerCase().trim().replace(/[.,!?;:]/g, '');

    // Calcular similaridade usando Levenshtein Distance
    const similarity = calculateSimilarity(normalizedTarget, normalizedSpoken);
    const score = Math.round(similarity * 100);

    // Ajustar score baseado na dificuldade
    let adjustedScore = score;
    if (difficulty === "easy") {
      adjustedScore = Math.min(100, score + 10);
    } else if (difficulty === "hard") {
      adjustedScore = Math.max(0, score - 10);
    }

    setPronunciationScore(adjustedScore);

    // Determinar se está correto (threshold baseado na dificuldade)
    const threshold = difficulty === "easy" ? 70 : difficulty === "medium" ? 80 : 90;
    const correct = adjustedScore >= threshold;
    setIsCorrect(correct);

    // Atualizar estatísticas de pronúncia
    updatePronunciationMutation.mutate({ score: adjustedScore });

    // Feedback visual e sonoro
    if (correct) {
      toast.success(`Excelente! ${adjustedScore}% de precisão!`);
      setTimeout(() => onComplete(adjustedScore, true), 1500);
    } else {
      toast.error(`Tente novamente. ${adjustedScore}% de precisão.`);
    }
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  };

  const playTargetAudio = () => {
    speakNaturalVoice(targetPhrase, targetLanguage, { rate: 0.9 });
  };

  const reset = () => {
    setTranscript("");
    setPronunciationScore(null);
    setIsCorrect(null);
    setAttempts(0);
  };

  return (
    <Card className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Frase Alvo */}
      <div className="text-center space-y-3">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
          Repita a frase:
        </h3>
        <div className="bg-white p-4 rounded-xl shadow-md border-2 border-blue-200">
          <p className="text-2xl font-bold text-gray-900">{targetPhrase}</p>
        </div>
        <Button
          onClick={playTargetAudio}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Volume2 className="w-4 h-4" />
          Ouvir Pronúncia Nativa
        </Button>
      </div>

      {/* Visualização de Áudio */}
      {isRecording && (
        <div className="space-y-2">
          <p className="text-sm text-center text-gray-600">Gravando...</p>
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-red-500 animate-pulse" />
            <Progress value={audioLevel} className="flex-1 h-3" />
            <span className="text-sm font-semibold text-gray-700">{Math.round(audioLevel)}%</span>
          </div>
        </div>
      )}

      {/* Controles de Gravação */}
      <div className="flex justify-center gap-4">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            size="lg"
            className="gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-6 text-lg"
          >
            <Mic className="w-6 h-6" />
            Gravar Pronúncia
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            size="lg"
            variant="destructive"
            className="gap-2 px-8 py-6 text-lg"
          >
            <MicOff className="w-6 h-6" />
            Parar Gravação
          </Button>
        )}

        {transcript && (
          <Button
            onClick={reset}
            size="lg"
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Tentar Novamente
          </Button>
        )}
      </div>

      {/* Resultado */}
      {transcript && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-md border-2 border-gray-200">
            <p className="text-sm font-semibold text-gray-600 mb-2">Você disse:</p>
            <p className="text-xl text-gray-900">{transcript}</p>
          </div>

          {pronunciationScore !== null && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Precisão de Pronúncia:</span>
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                  <span className="text-2xl font-bold text-gray-900">{pronunciationScore}%</span>
                </div>
              </div>

              <Progress
                value={pronunciationScore}
                className={`h-4 ${
                  pronunciationScore >= 90
                    ? "bg-green-200"
                    : pronunciationScore >= 70
                    ? "bg-yellow-200"
                    : "bg-red-200"
                }`}
              />

              <p className="text-sm text-center text-gray-600">
                {pronunciationScore >= 95
                  ? "🎉 Perfeito! Pronúncia nativa!"
                  : pronunciationScore >= 90
                  ? "👏 Excelente! Quase perfeito!"
                  : pronunciationScore >= 80
                  ? "👍 Muito bom! Continue praticando!"
                  : pronunciationScore >= 70
                  ? "💪 Bom! Pratique mais um pouco!"
                  : "📚 Continue tentando! Ouça a pronúncia nativa novamente."}
              </p>

              {attempts > 1 && (
                <p className="text-xs text-center text-gray-500">
                  Tentativa {attempts} - Continue praticando para melhorar!
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Dica */}
      <div className="bg-blue-100 border-2 border-blue-300 rounded-xl p-4 text-sm text-blue-900">
        <p className="font-semibold mb-1">💡 Dica:</p>
        <p>
          Fale claramente e pausadamente. Tente imitar a entonação e o ritmo da pronúncia nativa.
        </p>
      </div>
    </Card>
  );
}
